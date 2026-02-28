import { body, validationResult } from "express-validator";
import { Model } from "../../../models/index.js";
import { reDeploymentQueue } from "../../../utils/queues.js";

const reDeploymentValidate = [
    body("projectId")
        .notEmpty()
        .withMessage("ProjectId is required")
        .isMongoId()
        .withMessage("Invalid ProjectId")
];

const reDeployment = async (req, res) => {
    try {

        await Promise.all(reDeploymentValidate.map((validate) => validate.run(req)));
        const errors = validationResult(req);
        if (!errors.isEmpty()) {
            return res.status(400).json({
                errors: errors.array()[0].msg
            })
        }

        const projectId = req.body.projectId;

        const project = await Model.Project.findById(projectId);
        if (!project) {
            return res.status(404).json({
                message: "Invalid ProjectId"
            })
        }

        await reDeploymentQueue.add('redeployment', projectId)

        return res.status(200).json({
            message: "ReDeployment initiated"
        })
    } catch (error) {
        return res.status(500).json({
            error: "Internal server Error"
        })
    }
}

export default reDeployment