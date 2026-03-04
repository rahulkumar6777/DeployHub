import { Worker } from "bullmq";
import docker from "../utils/docker.js";
import { Model } from "../models/index.js";
import { deleteRepository } from "../utils/deleteDockerIMageFromHub.js";
import { connection } from "../utils/connection.js";
import { redisclient } from "../configs/redis.js";

const DockerUsername = process.env.DOCKER_USERNAME;
const DockerPassword = process.env.DOCKER_PASSWORD;

const worker = new Worker("deployhub-deleteproject", async (job) => {
    try {

        const { ProjectId } = job.data

        // here first i get projectData
        const projectData = await Model.Project.findById(ProjectId).lean()

        // repo
        const repo = `${DockerUsername}/${ProjectId.toLowerCase()}`;
        try {
            // 2nd setep stop running container
            if (projectData.subdomain) {
                const containers = await docker.listContainers({ all: true });

                const existingContainer = containers.find(c =>
                    c.Names.includes(`/${projectData.subdomain}`)
                )

                if (existingContainer) {

                    const container = docker.getContainer(existingContainer.Id);

                    if (container.stats === 'running') {
                        await container.stop()
                    }

                    await container.remove({ force: true });
                }
            }
        } catch (error) {
            console.log("error while stop & delete container", error.message)
        }
        // now delete image locally and form dockerhub
        try {
            const images = await docker.listImages();
            for (const img of images) {
                const tags = img.RepoTags || [];
                for (const tag of tags) {
                    if (tag.startsWith(repo)) {
                        const image = docker.getImage(tag);
                        await image.remove({ force: true });
                        console.log(`Deleted local image: ${tag}`);
                    }
                }
            }

            // after delete locally delete from dockerhub
            await deleteRepository(repo, DockerUsername, DockerPassword);


        } catch (err) {
            console.error("Failed to delete local repo images:", err.message);
        }

        // now delete all build data
        await Model.Build.deleteMany({ project: ProjectId });

        // delete allocation data
        await Model.Binding.findOneAndDelete({ project: ProjectId });

        await Model.Project.findByIdAndDelete(ProjectId)

        // delete cache if exist
        await redisclient.del(`subdomain:${projectData.subdomain}`)
        console.log("succesfully delete all data of prject", projectData._id)
    } catch (err) {
        throw err
    }
}, {
    connection: connection,
    concurrency: 1
})

worker.on("completed", (job) => {
    console.log('all data successfully deleted of project', job.id)
})


worker.on("failed", (job) => {
    console.log('Error while deleting proejctdata', job.id)
})