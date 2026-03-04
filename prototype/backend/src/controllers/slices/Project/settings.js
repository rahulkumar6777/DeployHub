import { Model } from '../../../models/index.js'
import { redisclient } from "../../../configs/redis.js";
import { deleteproject } from '../../../utils/queues.js';


export const getProjectSettings = async (req, res) => {
    try {
        const project = await Model.Project.findOne({
            _id: req.params.id,
            owner: req.user._id,
            status: { $ne: 'deleted' },
        })
            .select('name projectType settings buildCommand publishDir startCommand port env createdAt')
            .lean()

        if (!project) return res.status(404).json({ success: false, message: 'Project not found' })

        let env = {}
        if (project.env) {
            if (project.env instanceof Map) {
                env = Object.fromEntries(project.env)
            } else if (typeof project.env === 'object') {
                env = { ...project.env }
            }
        }

        res.status(200).json({
            success: true,
            project: { ...project, env },
        })
    } catch (err) {
        console.error('getProjectSettings error:', err)
        res.status(500).json({ success: false, message: 'Server error' })
    }
}


export const updateGeneralSettings = async (req, res) => {
    try {
        const { name, repoBranchName, folder } = req.body

        const update = {}
        if (name?.trim()) update.name = name.trim()
        if (repoBranchName) update['settings.repoBranchName'] = repoBranchName.trim()
        if (folder !== undefined) {
            update['settings.folder'] = {
                enabled: Boolean(folder.enabled),
                name: folder.enabled ? (folder.name || '') : '',
            }
        }

        const project = await Model.Project.findOneAndUpdate(
            { _id: req.params.id, owner: req.user._id, status: { $ne: 'deleted' } },
            { $set: update },
            {
                returnDocument: 'after',
                runValidators: true,
                context: 'query'   // ✅ VERY IMPORTANT
            }
        ).select('name settings')

        if (!project) return res.status(404).json({ success: false, message: 'Project not found' })

        res.status(200).json({ success: true, project })
    } catch (err) {
        console.error('updateGeneralSettings error:', err)
        res.status(500).json({ success: false, message: 'Server error' })
    }
}

// ── PATCH /api/projects/:id/settings/build ───────────────
export const updateBuildSettings = async (req, res) => {
    try {
        const { buildCommand, publishDir, startCommand, port } = req.body

        const update = {}
        if (buildCommand !== undefined) update.buildCommand = buildCommand
        if (publishDir !== undefined) update.publishDir = publishDir
        if (startCommand !== undefined) update.startCommand = startCommand
        if (port !== undefined) update.port = port ? parseInt(port) : undefined

        const project = await Model.Project.findOneAndUpdate(
            { _id: req.params.id, owner: req.user._id, status: { $ne: 'deleted' } },
            { $set: update },
            { new: true }
        ).select('buildCommand publishDir startCommand port')

        if (!project) return res.status(404).json({ success: false, message: 'Project not found' })

        res.status(200).json({ success: true, project })
    } catch (err) {
        console.error('updateBuildSettings error:', err)
        res.status(500).json({ success: false, message: 'Server error' })
    }
}


export const updateEnvSettings = async (req, res) => {
    try {
        const { env } = req.body

        if (typeof env !== 'object' || Array.isArray(env)) {
            return res.status(400).json({ success: false, message: 'env must be a key-value object' })
        }


        for (const key of Object.keys(env)) {
            if (!key.trim()) return res.status(400).json({ success: false, message: 'Empty env key not allowed' })
        }

        const project = await Model.Project.findOneAndUpdate(
            { _id: req.params.id, owner: req.user._id, status: { $ne: 'deleted' } },
            { $set: { env: new Map(Object.entries(env)) } },
            { new: true }
        ).select('env')

        if (!project) return res.status(404).json({ success: false, message: 'Project not found' })

        res.status(200).json({ success: true })
    } catch (err) {
        console.error('updateEnvSettings error:', err)
        res.status(500).json({ success: false, message: 'Server error' })
    }
}


export const deleteProject = async (req, res) => {
    try {
        const project = await Model.Project.findOneAndUpdate(
            { _id: req.params.id, owner: req.user._id, status: { $ne: 'deleted' } },
            { $set: { status: 'deleted' } },
            { new: true }
        ).select('_id name')

        if (!project) return res.status(404).json({ success: false, message: 'Project not found' })

        await deleteproject.add('deployhub-deleteproject', { ProjectId: project._id })

        res.status(200).json({ success: true, message: 'Project deleted' })
    } catch (err) {
        console.error('deleteProject error:', err)
        res.status(500).json({ success: false, message: 'Server error' })
    }
}