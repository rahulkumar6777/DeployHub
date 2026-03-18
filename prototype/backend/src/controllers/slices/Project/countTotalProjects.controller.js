import { Model } from "../../../models/index.js";
import { redisclient } from '../../../configs/redis.js'

export const countTotalProjects = async (req, res) => {
    try {


        const cacheTotalProjects = await redisclient.get('deployhub:totalProjects')
        if (!cacheTotalProjects) {

            const totalProject = await Model.Project.countDocuments()
            const totalProjects = redisclient.sadd('deployhub:totalProjects', totalProject)

            redisclient.expire('deployhub:totalProjects', 3600)

            return res.status(200).json({
                total: totalProjects
            });

        }

        return res.status(200).json({
            total: totalcacheTotalProjectsrojects
        })



    } catch (error) {
        return res.status(500).json({
            error: "Internal Server Error"
        })
    }
}