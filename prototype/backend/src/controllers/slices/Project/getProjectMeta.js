import { Model } from '../../../models/index.js'


export const getProjectMeta = async (req, res) => {
    try {
        const project = await Model.Project.findOne({
            _id: req.params.id,
            owner: req.user._id,
            status: { $ne: 'deleted' },
        })
            .select('name plan')
            .lean()

        if (!project) {
            return res.status(404).json({ success: false, message: 'Project not found' })
        }

        res.status(200).json({
            success: true,
            name: project.name,
            plan: project.plan,
        })
    } catch (err) {
        console.error('getProjectMeta error:', err)
        res.status(500).json({ success: false, message: 'Failed to fetch project meta' })
    }
}