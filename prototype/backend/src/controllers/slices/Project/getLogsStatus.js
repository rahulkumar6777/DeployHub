import { Model } from '../../../models/index.js'


export const getLogsStatus = async (req, res) => {
    try {
        const project = await Model.Project.findOne({
            _id: req.params.id,
            owner: req.user._id,
        })
            .select('status buildId plan')
            .populate({ path: 'buildId', select: 'status logUrl commitSha createdAt' })
            .lean()

        if (!project) return res.status(404).json({ success: false, message: 'Project not found' })

        res.status(200).json({
            success: true,
            projectStatus: project.status,
            lastBuild: project.buildId ? {
                id: project.buildId._id,
                status: project.buildId.status,
                logUrl: project.buildId.logUrl || null,
                commitSha: project.buildId.commitSha,
                createdAt: project.buildId.createdAt,
            } : null,
        })
    } catch (err) {
        console.error('getLogsStatus error:', err)
        res.status(500).json({ success: false, message: 'Server error' })
    }
}