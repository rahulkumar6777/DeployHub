import docker from '../utils/docker.js';
import { Worker } from 'bullmq';
import { deploymentQueue } from '../utils/queues.js';
import { Model } from '../models/index.js';
import fs from 'fs';
import path from 'path';
import { execSync } from 'child_process';
import { connection } from '../utils/connection.js';
import tar from 'tar-fs';
import { stringify } from 'querystring';




const BASE_DIR = path.resolve();

const buildWorker = new Worker('buildqueue', async (job) => {
    try {

        // docker credentials
        const dockerusername = process.env.DOCKER_USERNAME;
        const dockerpassword = process.env.DOCKER_PASSWORD;

        // job data
        const { projectId, buildId } = job.data;

        // docker imagename
        const imageName = `${dockerusername}/${projectId.toString().toLowerCase()}:${buildId.toString().toLowerCase()}`;

        // get data from dataBase
        const buildData = await Model.Build.findById(buildId).populate("project")
        const projectData = buildData.project;
        console.log(projectData)
        buildData.status = 'pending';
        buildData.startedAt = new Date();
        await buildData.save({ validateBeforeSave: false });

        //repofilepath
        const baserepopath = 'builds'
        if (!fs.existsSync(baserepopath)) fs.mkdirSync(baserepopath, { recursive: true });

        // build filepath
        const buildFilePath = path.join(baserepopath, buildData._id.toString());
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

                const tarStream = await docker.buildImage(
                    tarStreamPack,
                    {
                        t: `${imageName}`,
                        dockerfile: "Dockerfile",
                        nocache: true,

                        buildargs: {
                            BUILD_CMD: projectdata.buildCommand || "",
                            BUILD_DIR: projectdata.publishDir
                        }
                    }
                );

                await new Promise((resolve, reject) => {
                    docker.modem.followProgress(
                        tarStream,
                        (err, res) => (err ? reject(err) : resolve(res)),
                        (event) => {
                            if (event.stream) process.stdout.write(event.stream);
                            if (event.error) console.error(event.error);
                        }
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
                            APP_PORT: stringify(projectdata.port),
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
                            if (event.error) console.error(event.error);
                        }
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
                docker.modem.followProgress(pushStream, (err, res) => err ? reject(err) : resolve(res));
            });

            console.log("Image pushed successfully!");
        };

        // variable for clone repo and choose branch and folder if
        const branchname = projectData.settings.repoBranchName;
        const isFolder = projectData.settings.folder.enabled;
        const folderName = projectData.settings.folder?.name;
        const repoUrl = projectData.repoLink;

        //clone repo
        if (isFolder === true) {
            execSync(`git clone -b ${branchname} --filter=blob:none --sparse ${repoUrl} ${buildFilePath}`, { stdio: "inherit" })
            execSync(`git -C ${buildFilePath} sparse-checkout set ${folderName}`, { stdio: "inherit" });

            // Move contents of folderName into buildFilePath root
            const folderPath = path.join(buildFilePath, folderName);
            if (fs.existsSync(folderPath)) {
                const entries = await fs.promises.readdir(folderPath, { withFileTypes: true });
                for (const entry of entries) {
                    const src = path.join(folderPath, entry.name);
                    const dest = path.join(buildFilePath, entry.name);

                    // Move file or directory
                    await fs.promises.cp(src, dest, { recursive: true, force: true });
                }

                // clean up the now empty folder
                await fs.promises.rm(folderPath, { recursive: true, force: true });
            }
        } else {
            execSync(`git clone -b ${branchname} ${repoUrl} ${buildFilePath}`, { stdio: "inherit" })
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

        buildData.dockerImage = imageName;
        buildData.status = 'success';
        buildData.finishedAt = new Date();

        await buildData.save({ validateBeforeSave: false });


    } catch (error) {
        console.log("error in build worker", error);
        throw error;
    } finally {
        // Clean up build files
        const buildFilePath = path.join('builds', job.data.buildId.toString());
        if (fs.existsSync(buildFilePath)) {
            fs.rmSync(buildFilePath, { recursive: true, force: true });
            console.log("Cleaned up build files");
        }
    }
}, {
    connection: connection,
    concurrency: 1
})

buildWorker.on("active", async (job) => {
    console.log(`worker start build working on id ${job.id}`);
})

buildWorker.on("completed", async (job) => {
    await deploymentQueue.add('deploymentQueue', job.data)
})

buildWorker.on("failed", async (job, err) => {
    try {
        
        await Model.Build.findByIdAndUpdate(job.data.buildId, { status: 'failed', finishedAt: new Date() }, { validateBeforeSave: false });
    } catch (err) {
        if (err.statusCode === 409) {
            console.log("Prune already running, skipping");
        } else {
            throw err;
        }
    }
    console.log(`worker failed build on id ${job.id} with error ${err}`);
})