import { Model } from '../models/index.js';
import { connection } from '../utils/connection.js';
import docker from '../utils/docker.js';
import { Worker } from 'bullmq';

const worker = new Worker("deployhub-recreate-container", async (job) => {

    const projectId = job.data.projectId
    const oldcontainername = job.data.oldcontainername
    const newcontainername = job.data.newcontainername


    try {

        try {
            const containers = await docker.listContainers({ all: true });

            const existingContainer = containers.find(c =>
                c.Names.includes(`/${oldcontainername}`)
            );

            if (existingContainer) {
                const container = docker.getContainer(existingContainer.Id);


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
        }

        const projectData = await Model.Project.findById(projectId).populate("buildId").lean();

        // Prepare ENV
        const envVariables = [];
        if (projectData.env) {
            for (const [key, value] of Object.entries(projectData.env)) {
                envVariables.push(`${key}=${value}`);
            }
        }

        if (projectData.projectType === "static") {
            const container = await docker.createContainer({
                Image: projectData.buildId.dockerImage,
                name: newcontainername,
                HostConfig: {
                    NetworkMode: "users"
                }
            })

            await container.start()

            console.log('new container started for static')
        }

        if (projectData.projectType === 'node') {
            const container = await docker.createContainer({
                Image: projectData.buildId.dockerImage,
                name: newcontainername,
                Env: envVariables,
                HostConfig: {
                    NetworkMode: "users"
                }
            })

            await container.start();

            await container.logs({ stdout: true, stderr: true })

            console.log('new container started for node')
        }
    } catch (error) {

        await Model.Binding.findOneAndUpdate({ project: projectId }, {
            subdomain: oldcontainername
        })

        await Model.Project.findByIdAndUpdate({ _id: projectId }, {
            subdomain: oldcontainername
        })
        console.log("Error While contaien restart")
        throw error;
    }
}, {
    connection: connection,
    concurrency: 1
});

worker.on("active", async (job) => {
    console.log("worker start working on ", job.id)
})

worker.on("completed", async (job) => {

    await Model.Project.findByIdAndUpdate(job.data.projectId, {
        status: "live"
    })
    console.log("worker complete task of re-create container ", job.id)
})

worker.on("failed", async (job) => {
    console.log("worker failed while re-create container ", job.id)
})


