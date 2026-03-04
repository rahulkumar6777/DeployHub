import { Server } from "socket.io"
import { Model } from "../models/index.js"
import { logsProduce, activeStreams } from "../controllers/slices/user/logsProducer.js"
import RedisConfig from "../utils/pubSubRedis.js"

const redis = new RedisConfig()

const origin = process.env.NODE_ENV === 'production' ? 'http://localhost:5000' : "https://api.deployhub.cloud"

export const initSocket = (server) => {
    const io = new Server(server, {
        cors: { origin: origin }
    })

    io.on("connection", (socket) => {
        let joinedProject = null

        socket.on("joinLogs", async ({ projectId }) => {
            const project = await Model.Project.findById(projectId).select("_id").lean()
            if (!project) return socket.disconnect()

            if (joinedProject && joinedProject !== projectId) {
                socket.leave(joinedProject)
            }

            joinedProject = projectId
            socket.join(projectId)

            await logsProduce(projectId)
        })

        socket.on("disconnect", () => {
            if (joinedProject) {
                const room = io.sockets.adapter.rooms.get(joinedProject)
                if (!room || room.size === 0) {
                    const stream = activeStreams.get(joinedProject)
                    if (stream) {
                        stream.destroy()
                        activeStreams.delete(joinedProject)
                    }
                }
            }
        })
    })

    redis.consume("logs", async (message) => {
        const data = JSON.parse(message)
        io.to(data.projectId).emit("logs", data.log)
    })
}