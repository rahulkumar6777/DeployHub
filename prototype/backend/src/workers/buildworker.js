import docker from "../utils/docker.js";
import { Worker } from "bullmq";
import { deploymentQueue } from "../utils/queues.js";
import { Model } from "../models/index.js";
import fs from "fs";
import path from "path";
import { execSync } from "child_process";
import { connection } from "../utils/connection.js";
import tar from "tar-fs";
import { stringify } from "querystring";
import { BuildLogger } from "../utils/buildLogger.js";

const BASE_DIR = path.resolve();

const buildWorker = new Worker(
  "buildqueue",
  async (job) => {

    // job data
    const { projectId, buildId } = job.data;

    const logger = new BuildLogger(buildId, projectId)
    await logger.start()

    try {
      // docker credentials
      const dockerusername = process.env.DOCKER_USERNAME;
      const dockerpassword = process.env.DOCKER_PASSWORD;


      // docker imagename
      const imageName = `${dockerusername}/${projectId.toString().toLowerCase()}:${buildId.toString().toLowerCase()}`;

      // get data from dataBase
      const projectData = await Model.Project.findById(projectId).populate("buildId").populate("owner").lean()
      const usergithubAccessToken = projectData.owner?.githubAccessToken;

      const buildData = projectData.buildId

      await Model.Build.findByIdAndUpdate(buildData._id, {
        status: "pending",
        startedAt: new Date()
      })

      await Model.Project.findByIdAndUpdate(projectData._id, {
        status: "building"
      })

      //repofilepath
      const baserepopath = "builds";
      if (!fs.existsSync(baserepopath))
        fs.mkdirSync(baserepopath, { recursive: true });

      // build filepath
      const buildFilePath = path.join(baserepopath, buildData._id.toString());
      if (!fs.existsSync(buildFilePath))
        fs.mkdirSync(buildFilePath, { recursive: true });

      // choose dockerfile based on type
      const dockerfilechoose = async (projectType) => {
        return path.join(
          BASE_DIR,
          `src/dockerTemplets/${projectType}/Dockerfile`,
        );
      };

      // choose nginx path
      const nginxpath = path.join(BASE_DIR, "src/nginx/nginx.conf");

      //copy dockerfile and paste on buildpath
      const copyDockerFile = async (dockerFilePath) => {
        await fs.promises.copyFile(
          path.resolve(dockerFilePath),
          path.join(buildFilePath, "Dockerfile"),
        );
        console.log("Dockerfile copied");
      };

      //copy nginx and paste on buildpath
      const copyNginxfile = async (nginxFilePath) => {
        await fs.promises.copyFile(
          path.resolve(nginxFilePath),
          path.join(buildFilePath, "nginx.conf"),
        );
        console.log("nginx.conf copied");
      };

      // build and push docker images
      const buildandpushimage = async (projectdata, buildFilePath, type) => {
        try {
          if (type === "static") {
            const tarStreamPack = tar.pack(buildFilePath);

            let viteEnvContent = "";

            if (projectdata.env) {
              for (const [key, value] of Object.entries(projectdata.env)) {
                viteEnvContent += `${key}=${value}\n`;
              }
            }

            logger.write(`[deployhub] Building static image...\n`)

            const dynamicBuildArgs = {
              BUILD_CMD: projectdata.buildCommand || "",
              BUILD_DIR: projectdata.publishDir,
              VITE_ENV_CONTENT: viteEnvContent
            };

            const tarStream = await docker.buildImage(tarStreamPack, {
              t: imageName,
              dockerfile: "Dockerfile",
              nocache: true,
              buildargs: dynamicBuildArgs,
            });

            await new Promise((resolve, reject) => {
              docker.modem.followProgress(
                tarStream,
                (err, res) => (err ? reject(err) : resolve(res)),
                (event) => {
                  if (event.stream) {
                    process.stdout.write(event.stream)
                    logger.write(event.stream)
                  }
                  if (event.error) {
                    logger.write(`[ERROR] ${event.error}`)
                    reject(new Error(event.error));
                  }
                },
              );
            });
          }
          if (type === "node") {
            const tarStreamPack = tar.pack(buildFilePath);

            const tarStream = await docker.buildImage(tarStreamPack, {
              t: `${imageName}`,
              dockerfile: "Dockerfile",
              nocache: true,

              buildargs: {
                APP_PORT: stringify(projectdata.port),
                START_CMD: projectdata.startCommand,
              },
            });

            await new Promise((resolve, reject) => {
              docker.modem.followProgress(
                tarStream,
                (err, res) => (err ? reject(err) : resolve(res)),
                (event) => {
                  if (event.stream) {
                    process.stdout.write(event.stream)
                    logger.write(event.stream)
                  }
                  if (event.error) {
                    logger.write(`[ERROR] ${event.error}`)
                    reject(new Error(event.error));
                  }
                },
              );
            });
          }

          // Now push the image
          const image = docker.getImage(`${imageName}`);
          const pushStream = await image.push({
            authconfig: {
              username: dockerusername,
              password: dockerpassword,
            },
          });

          await new Promise((resolve, reject) => {
            docker.modem.followProgress(
              pushStream,
              (err, res) => (err ? reject(err) : resolve(res)),
              (event) => {
                if (event.stream) process.stdout.write(event.stream);
                if (event.error) {
                  console.error("image push error:", event.error);
                  reject(new Error(event.error));
                }
              },
            );
          });
        } catch (error) {
          throw error;
        }
      };

      // variable for clone repo and choose branch and folder if
      const branchname = projectData.settings.repoBranchName;
      const isFolder = projectData.settings.folder.enabled;
      const folderName = projectData.settings.folder?.name;
      const repoUrl = projectData.repoLink;
      const repoLinkWithoutGit = repoUrl.replace(/\.git$/, '');
      const parts = repoLinkWithoutGit.split('/');
      const owner = parts[3];
      const repo = parts[4];


      //clone repo
      let repoUrlWithAuth;

      logger.write(`Cloning ${owner}/${repo} branch: ${branchname}\n`)

      if (usergithubAccessToken) {
        repoUrlWithAuth = `https://${usergithubAccessToken}@github.com/${owner}/${repo}.git`;
      } else {
        repoUrlWithAuth = `https://github.com/${owner}/${repo}.git`;
      }

      if (isFolder === true) {
        execSync(
          `git clone -b ${branchname} --filter=blob:none --sparse ${repoUrlWithAuth} ${buildFilePath}`,
          { stdio: "inherit" },
        );
        execSync(`git -C ${buildFilePath} sparse-checkout set ${folderName}`, {
          stdio: "inherit",
        });

        const folderPath = path.join(buildFilePath, folderName);
        if (fs.existsSync(folderPath)) {
          const entries = await fs.promises.readdir(folderPath, { withFileTypes: true });
          for (const entry of entries) {
            const src = path.join(folderPath, entry.name);
            const dest = path.join(buildFilePath, entry.name);
            await fs.promises.cp(src, dest, { recursive: true, force: true });
          }
          await fs.promises.rm(folderPath, { recursive: true, force: true });
        }
      } else {
        execSync(`git clone -b ${branchname} ${repoUrlWithAuth} ${buildFilePath}`, {
          stdio: "inherit",
        });
      }

      logger.write(`Repo cloned successfully\n`)

      if (projectData.projectType === "static") {
        await copyNginxfile(nginxpath);
        await copyDockerFile(await dockerfilechoose("static"));
        await buildandpushimage(projectData, buildFilePath, "static");
      }
      if (projectData.projectType === "node") {
        await copyDockerFile(await dockerfilechoose("nodejs"));
        await buildandpushimage(projectData, buildFilePath, "node");
      }

      // Upload logs to Minio + get logUrl
      const logUrl = await logger.finish('success')
      console.log(logUrl)

      await Model.Build.findByIdAndUpdate(buildData._id, {
        status: "success",
        finishedAt: new Date(),
        dockerImage: imageName,
        logUrl: logUrl
      })

    } catch (error) {

      console.log("error in build worker", error);

      try {
        logger.write(`[ERROR] Build failed: ${error.message}`)
        const logUrl = await logger.finish('failed')
        await Model.Build.findByIdAndUpdate(job.data.buildId, {
          status: "failed",
          finishedAt: new Date(),
          ...(logUrl && { logUrl }),
        })
      } catch (logErr) {
        console.error('Failed to save error logs:', logErr.message)
      }
      throw error;
    } finally {
      const buildFilePath = path.join("builds", job.data.buildId.toString());
      if (fs.existsSync(buildFilePath)) {
        fs.rmSync(buildFilePath, { recursive: true, force: true });
        console.log("Cleaned up build files");
      }
    }
  },
  {
    connection: connection,
    concurrency: 1,
  },
);

buildWorker.on("active", async (job) => {
  console.log(`worker start build working on id ${job.id}`);
});

buildWorker.on("completed", async (job) => {
  await deploymentQueue.add("deploymentQueue", job.data);
});

buildWorker.on("failed", async (job, err) => {
  try {
    await Model.Build.findByIdAndUpdate(
      job.data.buildId,
      { status: "failed", finishedAt: new Date() },
      { validateBeforeSave: false },
    );

    await Model.Project.findByIdAndUpdate(
      job.data.projectId,
      { status: "failed-deploy" },
      { validateBeforeSave: false },
    );
  } catch (err) {
    throw err;
  }
  console.log(`worker failed build on id ${job.id} with error ${err}`);
});
