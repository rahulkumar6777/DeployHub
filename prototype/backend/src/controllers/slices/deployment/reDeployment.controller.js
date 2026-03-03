import mongoose from "mongoose";
import { Model } from "../../../models/index.js";
import { reDeploymentQueue } from "../../../utils/queues.js";


const reDeployment = async (req, res) => {
    try {

        const projectid = req.params.projectId;

        if (!mongoose.Types.ObjectId.isValid(projectid)) {
            return res.status(400).json({ error: 'Invalid projectId format' });
        }


        const project = await Model.Project.findById(projectid);
        console.log(project)
        if (!project) {
            return res.status(404).json({
                message: "Invalid ProjectId"
            })
        }

        project.status = "building"
        project.totalBuilds += 1;
        await project.save({validateBeforeSave: false})
        const projectId = project._id
        await reDeploymentQueue.add('redeployment', projectId)

        return res.status(200).json({
            message: "ReDeployment initiated"
        })
    } catch (error) {
        console.log(error)
        return res.status(500).json({
            error: "Internal server Error"
        })
    }
}

export default reDeployment