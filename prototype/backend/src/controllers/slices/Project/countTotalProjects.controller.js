import { Model } from "../../../models/index.js";
import { redisclient } from '../../../configs/redis.js'

export const countTotalProjects = async (req, res) => {
    try {


        const cacheTotalProjects = await redisclient.get('deployhub:totalProject')
        if (!cacheTotalProjects) {

            const totalProject = await Model.Project.countDocuments()
            redisclient.set('deployhub:totalProject', totalProject, "EX", 3600)


            return res.status(200).json({
                total: totalProject
            });

        }

        return res.status(200).json({
            total: parseInt(cacheTotalProjects, 10)
        })



    } catch (error) {
        return res.status(500).json({
            error: "Internal Server Error"
        })
    }
}