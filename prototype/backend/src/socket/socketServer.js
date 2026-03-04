import { Server } from "socket.io"
import { Model } from "../models/index.js"
import { logsProduce, activeStreams } from "../controllers/slices/user/logsProducer.js"
import RedisConfig from "../utils/pubSubRedis.js"

const redisBuildLogs = new RedisConfig()
const redisRuntimeLogs = new RedisConfig()

const origin = process.env.NODE_ENV === 'production' ? 'https://deployhub.cloud' : 'http://localhost:5000';

export const initSocket = (server) => {

    const io = new Server(server, {
        cors: { origin: origin }
    })

    io.on("connection", (socket) => {

        let joinedProject = null
        let joinedBuildRoom = null


        socket.on("joinLogs", async ({ projectId }) => {
            const project = await Model.Project.findById(projectId).select("_id").lean()
            if (!project) return socket.disconnect()

            if (joinedProject && joinedProject !== projectId) {
                socket.leave(joinedProject)
            }
            joinedProject = projectId
            socket.join(`live:${projectId}`)
            await logsProduce(projectId)
        })


        socket.on("joinBuildLogs", async ({ projectId }) => {
            const project = await Model.Project.findById(projectId).select("_id status").lean()
            if (!project) return socket.disconnect()

            if (joinedBuildRoom) socket.leave(joinedBuildRoom)
            joinedBuildRoom = `build:${projectId}`
            socket.join(joinedBuildRoom)
        })

        socket.on("disconnect", () => {
        })
    })


    redisRuntimeLogs.consume("logs", async (message) => {
        const data = JSON.parse(message)
        io.to(`live:${data.projectId}`).emit("logs", data.log)
    })


    redisBuildLogs.consume("build-logs", async (message) => {
        const data = JSON.parse(message)
        const room = `build:${data.projectId}`

        if (data.type === "complete") {
            io.to(room).emit("buildComplete", {
                status: data.status,
                logUrl: data.logUrl,
            })
        } else {
            io.to(room).emit("buildLog", data.log)
        }
    })

}