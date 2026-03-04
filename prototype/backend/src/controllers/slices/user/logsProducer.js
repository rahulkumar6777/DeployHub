import docker from "../../../utils/docker.js"
import { Model } from "../../../models/index.js"
import RedisConfig from "../../../utils/pubSubRedis.js"

const redis = new RedisConfig()

export const activeStreams = new Map()

export const logsProduce = async (projectId) => {
  if (activeStreams.has(projectId)) return

  const project = await Model.Project
    .findById(projectId)
    .select("subdomain")

  if (!project) return

  const containerName = project.subdomain
  const containers = await docker.listContainers({ all: true })

  const existingContainer = containers.find(c =>
    c.Names.some(n => n.includes(containerName))
  )

  if (!existingContainer) return

  const container = docker.getContainer(existingContainer.Id)

  const stream = await container.logs({
    stdout: true,
    stderr: true,
    follow: true,
    tail: 100
  })

  activeStreams.set(projectId, stream)

  stream.on("data", async (chunk) => {
    const log = chunk.toString()
    await redis.produce(
      "logs",
      JSON.stringify({ projectId, log })
    )
  })

  stream.on("end", () => {
    activeStreams.delete(projectId)
  })

  stream.on("error", (err) => {
    console.error("Log stream error for", projectId, err.message)
    activeStreams.delete(projectId)
  })

  stream.on("close", () => {
    activeStreams.delete(projectId)
  })
}