import { Model } from '../models/index.js';
import { connection } from '../utils/connection.js';
import docker from '../utils/docker.js';
import { Worker } from 'bullmq';

const worker = new Worker("deployhub-recreate-container", async (job) => {
    try {

        const projectId = job.data.projectId
        const oldcontainername = job.data.oldname
        const newcontainername = job.data.newname

        const containers = await docker.listContainers({ all: true })
        const oldcontainer = containers.find(c =>
            c.Names.includes(`/${oldcontainername}`)
        )

        console.log(oldcontainer)

        if (oldcontainer) {
            const container = docker.getContainer(oldcontainer.Id);

            // If running → stop
            if (oldcontainer.State === "running") {
                console.log("Stopping old container...");
                await container.stop();
            }

            // Remove container
            console.log("Removing old container...");
            await container.remove({ force: true });

            console.log("Old container stopped & removed successfully");
        }

        const projectData = await Model.Project.findById(projectId).populate("buildId").lean();

        // Prepare ENV
        const envVariables = [];
        if (projectData.env) {
            for (const [key, value] of Object.entries(projectData.env)) {
                envVariables.push(`${key}=${value}`);
            }
        }

        if (projectData.projectType === "Static") {
            const container = await docker.createContainer({
                Image: projectData.buildId.dockerImage,
                name: newcontainername,
                HostConfig: {
                    NetworkMode: "users"
                }
            })

            await container.start()
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
        }
    } catch (error) {
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
    console.log("worker complete task of re-create container ", job.id)
})

worker.on("failed", async (job) => {
    console.log("worker failed while re-create container ", job.id)
})


