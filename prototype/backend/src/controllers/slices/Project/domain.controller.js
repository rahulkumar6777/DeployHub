import { Model } from '../../../models/index.js'
import { recreateContainer } from '../../../utils/queues.js'
import { redisclient } from "../../../configs/redis.js";


export const getProjectDomains = async (req, res) => {
    try {
        const project = await Model.Project.findOne({
            _id: req.params.id,
            owner: req.user._id,
            status: { $ne: 'deleted' },
        })
            .select('subdomain hascustomDomain customDomain plan')
            .lean()

        if (!project) return res.status(404).json({ success: false, message: 'Project not found' })
        res.status(200).json({
            success: true,
            project
        })
    } catch (err) {
        console.error('getProjectDomains error:', err)
        res.status(500).json({ success: false, message: 'Server error' })
    }
}



export const updateSubdomain = async (req, res) => {
    try {
        const { subdomain } = req.body

        if (!subdomain || !/^[a-z0-9-]{3,40}$/.test(subdomain)) {
            return res.status(400).json({
                success: false,
                message: 'Invalid subdomain. Use lowercase letters, numbers, hyphens (3-40 chars).',
            })
        }


        const existing = await Model.Project.findOne({
            subdomain,
            _id: { $ne: req.params.id },
            status: { $ne: 'deleted' },
        }).select('_id').lean()

        if (existing) {
            return res.status(409).json({
                success: false,
                message: 'This subdomain is already taken. Please choose another.',
            })
        }

        const project = await Model.Project.findOne({ _id: req.params.id, owner: req.user._id, status: { $ne: 'deleted' } })

        if (!project) return res.status(404).json({ success: false, message: 'Project not found' })

        const data = {
            projectId: project._id,
            oldcontainername: project.subdomain,
            newcontainername: project.subdomain
        }

        project.subdomain = subdomain;
        project.status = "building"

        await project.save({ validateBeforeSave: false })

        const allocation = await Model.Binding.findOne({project: project._id})
        allocation.subdomain = subdomain
        await allocation.save({validateBeforeSave: false})


        await redisclient.del(`subdomain:${data.oldcontainername}`);
        await redisclient.hset(`subdomain:${project.subdomain}`, {
            port: allocation.port,
            projectId: project._id.toString(),
            plan: project.plan
        });

        await recreateContainer.add('deployhub-recreate-container', data)

        res.status(200).json({
            success: true,
            subdomain: project.subdomain,
            message: 'Subdomain updated. Project is restarting.',
        })
    } catch (err) {
        console.error('updateSubdomain error:', err)
        res.status(500).json({ success: false, message: 'Server error' })
    }
}