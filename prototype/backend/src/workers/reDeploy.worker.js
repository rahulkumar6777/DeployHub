import { Worker } from "bullmq";
import docker from '../utils/docker.js';
import { Model } from "../models/index.js";
import { execSync } from "child_process";
import fs from 'fs';
import path from 'path';
import { connection } from '../utils/connection.js';
import tar from 'tar-fs';


const BASE_DIR = path.resolve();

const dockerusername = process.env.DOCKER_USERNAME;
const dockerpassword = process.env.DOCKER_PASSWORD;

let buildFilePath = null;

const reDeployMentWorker = new Worker('redeployment', async (job) => {
    try {
        const projectId = job.data;

        const bindingData = await Model.Binding.findOne({ project: projectId })
            .populate([
                { path: 'project', populate: { path: 'buildId' } },
                { path: 'project', populate: { path: 'owner' } }
            ]).lean();
        const projectData = bindingData.project;
        const buildData = projectData.buildId;
        const user = await Model.User.findById(projectData.owner)

        // here first i check old deployment me build fail hua ya deploy fail hua agar build fail hua to me build yehi pe build
        // kar dunga aur agar deploy fail hua to me redeploy karunga bina build kiye kyuki build already ho chuka hai
        let newBuildId;
        let imageName = buildData.dockerImage
        const oldImageName = buildData.dockerImage;

        // here i cehck if commit same or build failed then only i will build otherwise i will directly redeploy because if commit is same and build is successfull then there is no need to build again we can directly redeploy that build
        let commitSha = null;

        const repoLinkWithoutGit = projectData.repoLink.endsWith('.git')
            ? projectData.repoLink.slice(0, -4)
            : projectData.repoLink;

        const parts = repoLinkWithoutGit.split('/');
        const owner = parts[3];
        const repo = parts[4].replace(/\.git$/, '');


        try {
            const headers = {
                "Accept": "application/vnd.github.v3+json"
            };

            if (user.githubAccessToken) {
                headers.Authorization = `token ${user.githubAccessToken}`;
            }

            const response = await fetch(
                `https://api.github.com/repos/${owner}/${repo}/git/ref/heads/${projectData.settings.repoBranchName}`,
                { headers }
            );

            const data = await response.json();
            commitSha = data?.object?.sha || null;
            console.log("Commit SHA:", commitSha);
        } catch (err) {
            console.log("Commit fetch failed, continuing without commit check");
        }

        const isBuildFailed = buildData.status === "failed";
        const isFirstBuild = !buildData.commitSha;
        const isNewCommit = commitSha && buildData.commitSha !== commitSha;


        if (isBuildFailed || isFirstBuild || isNewCommit) {
            try {
                const buildId = buildData._id.toString();
                const projectId = projectData._id.toString();

                // so here i will make new build on db
                const newBuild = new Model.Build({
                    project: projectData._id,
                    commitSha: commitSha,
                    status: 'pending',
                    startedAt: new Date(),
                });

                imageName = `${process.env.DOCKER_USERNAME}/${projectId.toString().toLowerCase()}:${newBuild._id.toString().toLowerCase()}`;
                newBuild.dockerImage = imageName;
                const savedNewBuild = await newBuild.save();
                newBuildId = savedNewBuild._id;

                newBuild.status = 'building';
                await newBuild.save({ validateBeforeSave: false });


                //repofilepath
                const baserepopath = 'builds'
                if (!fs.existsSync(baserepopath)) fs.mkdirSync(baserepopath, { recursive: true });

                // build filepath
                buildFilePath = path.join(baserepopath, newBuild._id.toString());
                if (!fs.existsSync(buildFilePath)) fs.mkdirSync(buildFilePath, { recursive: true });


                // choose dockerfile based on type
                const dockerfilechoose = async (projectType) => {
                    return path.join(BASE_DIR, `src/dockerTemplets/${projectType}/Dockerfile`);
                };

                // choose nginx path
                const nginxpath = path.join(BASE_DIR, 'src/nginx/nginx.conf');


                //copy dockerfile and paste on buildpath
                const copyDockerFile = async (dockerFilePath) => {
                    await fs.promises.copyFile(
                        path.resolve(dockerFilePath),
                        path.join(buildFilePath, "Dockerfile")
                    );
                    console.log("Dockerfile copied");
                };

                //copy nginx and paste on buildpath
                const copyNginxfile = async (nginxFilePath) => {
                    await fs.promises.copyFile(
                        path.resolve(nginxFilePath),
                        path.join(buildFilePath, "nginx.conf")
                    );
                    console.log("nginx.conf copied");
                }

                // build and push docker images
                const buildandpushimage = async (projectdata, buildFilePath, type) => {

                    if (type === 'static') {
                        const tarStreamPack = tar.pack(buildFilePath);

                        let viteEnvContent = "";

                        console.log
                        if (projectdata.env) {
                            for (const [key, value] of Object.entries(projectdata.env)) {
                                viteEnvContent += `${key}=${value}\n`;
                            }
                        }

                        const dynamicBuildArgs = {
                            BUILD_CMD: projectdata.buildCommand || "",
                            BUILD_DIR: projectdata.publishDir,
                            VITE_ENV_CONTENT: viteEnvContent
                        };

                        console.log("dynamicBuildArgs" , dynamicBuildArgs)

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
                                    if (event.stream) process.stdout.write(event.stream);
                                    if (event.error) {
                                        console.error("Docker build error:", event.error);
                                        reject(new Error(event.error));
                                    }
                                },
                            );
                        });
                    }
                    if (type === 'node') {
                        const tarStreamPack = tar.pack(buildFilePath);

                        const tarStream = await docker.buildImage(
                            tarStreamPack,
                            {
                                t: `${imageName}`,
                                dockerfile: "Dockerfile",
                                nocache: true,

                                buildargs: {
                                    APP_PORT: String(projectdata.port),
                                    START_CMD: projectdata.startCommand
                                }
                            }
                        );

                        await new Promise((resolve, reject) => {
                            docker.modem.followProgress(
                                tarStream,
                                (err, res) => (err ? reject(err) : resolve(res)),
                                (event) => {
                                    if (event.stream) process.stdout.write(event.stream);
                                    if (event.error) {
                                        console.error("Docker build error:", event.error);
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
                            password: dockerpassword
                        }
                    });

                    // Follow push progress
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

                    console.log("Image pushed successfully!");

                    await Model.Project.findByIdAndUpdate(projectId, {
                        buildId: newBuildId
                    });
                };


                // variable for clone repo and choose branch and folder if
                const branchname = projectData.settings.repoBranchName;
                const isFolder = projectData.settings.folder.enabled;
                const folderName = projectData.settings.folder?.name;

                //clone repo
                let repoUrlWithAuth;
                if (user.githubAccessToken) {
                    repoUrlWithAuth = `https://${user.githubAccessToken}@github.com/${owner}/${repo}.git`;
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

                if (projectData.projectType === 'static') {
                    await copyNginxfile(nginxpath);
                    await copyDockerFile(await dockerfilechoose("static"));
                    await buildandpushimage(projectData, buildFilePath, 'static')


                }
                if (projectData.projectType === 'node') {
                    await copyNginxfile(nginxpath);
                    await copyDockerFile(await dockerfilechoose("nodejs"));
                    await buildandpushimage(projectData, buildFilePath, 'node')
                }

                newBuild.status = 'success';
                newBuild.finishedAt = new Date();

                await newBuild.save({ validateBeforeSave: false });


            } catch (error) {
                console.error("Error building image:", error);
                await Model.Build.findByIdAndUpdate(newBuildId, { status: 'failed', finishedAt: new Date() }, { validateBeforeSave: false });
                throw error;
            }
        }


        const targetBuildId = newBuildId || buildData._id;


        // here check image is found or not
        const images = await docker.listImages();
        const imageExists = images.some(img => img.RepoTags && img.RepoTags.includes(imageName));
        if (!imageExists) {
            try {
                const stream = await docker.pull(imageName, {
                    authconfig: {
                        username: dockerusername,
                        password: dockerpassword
                    }
                });
                await new Promise((res, rej) =>
                    docker.modem.followProgress(stream, err => (err ? rej(err) : res()))
                );
            } catch (error) {
                console.error("Error pulling image:", error);
                throw error;
            }
        }

        if (bindingData?.subdomain) {
            try {
                const containers = await docker.listContainers({ all: true });

                const existingContainer = containers.find(c =>
                    c.Names.includes(`/${bindingData.subdomain}`)
                );

                if (existingContainer) {
                    const container = docker.getContainer(existingContainer.Id);

                    // If running → stop
                    if (existingContainer.State === "running") {
                        console.log("Stopping old container...");
                        await container.stop();
                    }

                    // Remove container
                    console.log("Removing old container...");
                    await container.remove({ force: true });

                    console.log("Old container stopped & removed successfully");
                } else {
                    console.log("No existing container found");
                }

            } catch (err) {
                console.error("Container cleanup error:", err.message);
                throw err; // fail deployment if cleanup fails
            }
        }

        // here delete old image from local and also from docker hub because if we are redeploying then old image is of no use and also if we are redeploying then most probably there is some issue with code and that issue can be because of some package or dependency and if we use old image then that old image will have that issue and our redeployment will fail again so to avoid that we will delete old image from local and also from docker hub
        if (imageName !== oldImageName) {
            try {
                const oldImage = docker.getImage(oldImageName);
                await oldImage.remove();

                console.log(`Deleted old local image: ${oldImageName}`);
            } catch (err) {
                console.log("Old image not found locally, skipping local deletion.");
            }
        }

        // Create new deployment record
        const deploymentData = new Model.deploymentModel({
            project: projectId,
            build: targetBuildId,
            dockerImage: imageName,
            status: "deploying",
        });
        await deploymentData.save();

        // Prepare ENV
        const envVariables = [];
        if (projectData.env) {
            for (const [key, value] of Object.entries(projectData.env)) {
                envVariables.push(`${key}=${value}`);
            }
        }

        // ---------------- STATIC ----------------
        if (projectData.projectType === "static") {
            const container = await docker.createContainer({
                Image: imageName,
                name: bindingData.subdomain,
                HostConfig: {
                    NetworkMode: "users"
                }
            });

            await container.start();

            deploymentData.status = "live";
            deploymentData.containerId = container.id;
            deploymentData.deployedAt = new Date();
            await deploymentData.save({ validateBeforeSave: false });
        }

        // ---------------- NODE ----------------
        if (projectData.projectType === "node") {
            const containerPort = `${projectData.port}/tcp`;

            const container = await docker.createContainer({
                Image: imageName,
                name: bindingData.subdomain,
                Env: envVariables,
                HostConfig: {
                    NetworkMode: "users"
                }
            });

            await container.start();

            deploymentData.status = "live";
            deploymentData.containerId = container.id;
            deploymentData.deployedAt = new Date();
            await deploymentData.save({ validateBeforeSave: false });
        }

        console.log("Redeployment successful");

    } catch (error) {
        console.error("Error in ReDeployment Worker:", error);
        throw error
    } finally {
        if (buildFilePath && fs.existsSync(buildFilePath)) {
            fs.rmSync(buildFilePath, { recursive: true, force: true });
        }
    }
}, { connection: connection, concurrency: 1 });

reDeployMentWorker.on("active", async (job) => {
    console.log(`ReDeployment Worker started for project ID ${job.data}`);
});

reDeployMentWorker.on("completed", async (job) => {

    const projectId = job.data;

    const project = await Model.Project.findById(projectId);

    if (!project) {
        console.error("Project not found on completion:", projectId);
        return;
    }

    project.status = "live";
    await project.save({ validateBeforeSave: false });

    console.log(`ReDeployment Worker completed for project ID ${job.data}`);
});

reDeployMentWorker.on("failed", async (job, err) => {
    const projectId = job.data;

    const project = await Model.Project.findById(projectId);

    if (!project) {
        console.error("Project not found on completion:", projectId);
        return;
    }

    project.status = "failed-deploy";
    await project.save({ validateBeforeSave: false });

    console.error(`ReDeployment Worker failed for project ID ${job.data}:`, err);
});