import { Worker } from "bullmq";
import docker from '../utils/docker.js';
import { connection } from "../utils/connection.js";
import { Model } from "../models/index.js";



const worker = new Worker("deploymentQueue", async (job) => {
    try {

        const { buildId, projectId } = job.data;

        const dockerusername = process.env.DOCKER_USERNAME;
        const bindingData = await Model.Binding.findOne({ project: projectId }).populate({ path: 'project', populate: { path: 'buildId' } }).lean();
        const projectData = bindingData.project;

        const imageName = `${dockerusername}/${projectId.toString().toLowerCase()}:${buildId.toString().toLowerCase()}`;

        const deploymentData = new Model.deploymentModel({
            project: projectId,
            build: projectData.buildId,
            dockerImage: imageName,
            status: 'deploying'
        })

        await deploymentData.save();

        if (projectData.projectType === 'static') {

            const envVariables = [];
            if (projectData.env) {
                for (const [key, value] of Object.entries(projectData.env)) {
                    envVariables.push(`${key}=${value}`);
                }
            }


            const container = await docker.createContainer({
                Image: imageName,
                name: `${bindingData.subdomain}`,
                Env: envVariables,
                HostConfig: {
                    NetworkMode: "users"
                }

            });

            await container.start();

            deploymentData.status = 'live';
            deploymentData.containerId = container.id;
            deploymentData.deployedAt = new Date();
            await deploymentData.save({ validateBeforeSave: false });

        }

        if (projectData.projectType === 'node') {
            console.log(bindingData.subdomain)
            console.log(bindingData.port)
            console.log(imageName)



            const envVariables = [];
            if (projectData.env) {
                for (const [key, value] of Object.entries(projectData.env)) {
                    envVariables.push(`${key}=${value}`);
                }
            }

            const container = await docker.createContainer({
                Image: imageName,
                name: `${bindingData.subdomain}`,
                Env: envVariables,
                HostConfig: {
                    NetworkMode: "users"
                }
            });

            await container.start();

            await container.logs({ stdout: true, stderr: true })

            deploymentData.status = 'live';
            deploymentData.containerId = container.id;
            deploymentData.deployedAt = new Date();

            await deploymentData.save({ validateBeforeSave: false });
        }
        console.log(`Container for project ${projectId} started successfully.`);

    } catch (error) {
        console.log("error in deploy worker", error)
        throw error;
    }
}, { connection: connection });

worker.on("completed", async (job) => {

    const { projectId } = job.data;

    const projectData = await Model.Project.findById(projectId).populate('owner');
    const usergithubAccessToken = projectData.owner?.githubAccessToken;
    projectData.status = 'live';
    await projectData.save({ validateBeforeSave: false })

    if (usergithubAccessToken) {
        const repoLinkWithoutGit = projectData.repoLink.endsWith('.git')
            ? projectData.repoLink.slice(0, -4)
            : projectData.repoLink;
        const parts = repoLinkWithoutGit.split('/');
        const owner = parts[3];
        const repo = parts[4].replace(/\.git$/, '');

        const result = await fetch(
            `https://api.github.com/repos/${owner}/${repo}/hooks`,
            {
                method: "POST",
                headers: {
                    Authorization: `Bearer ${usergithubAccessToken}`,
                    Accept: "application/vnd.github+json"
                },
                body: JSON.stringify({
                    name: "web",
                    active: true,
                    events: ["push"],
                    config: {
                        url: "https://b960-103-211-132-79.ngrok-free.app/github-webhook",
                        content_type: "json",
                        secret: process.env.GITHUB_WEBHOOK_SECRET
                    }
                })
            }


        );

        console.log("Webhook setup response:", result.status, await result.text())
    }

    console.log(`Deployment job ${job.id} completed successfully.`);
});

worker.on("failed", async (job, err) => {

    const { projectId } = job.data;

    const projectData = await Model.Project.findById(projectId);
    projectData.status = 'failed-deploy';
    await projectData.save({ validateBeforeSave: false })
    console.log(`Deployment job ${job.id} failed with error: ${err.message}`);

    await Model.deploymentModel.findOneAndUpdate({ build: job.data.buildId }, { status: 'failed', deployedAt: new Date() }, { validateBeforeSave: false });
});