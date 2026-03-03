import { Model } from '../../../models/index.js'


export const getProjectOverview = async (req, res) => {
  try {
    const project = await Model.Project.findOne({
      _id: req.params.id,
      owner: req.user._id,
      status: { $ne: 'deleted' },
    })
      .select('name projectType repoLink subdomain status totalRequest plan hascustomDomain customDomain totalBuilds buildId settings buildCommand publishDir startCommand port createdAt updatedAt')
      .lean()

    if (!project) {
      return res.status(404).json({ success: false, message: 'Project not found' })
    }

    
    let lastBuild = null
    if (project.buildId) {
      lastBuild = await Model.Build.findById(project.buildId)
        .select('commitSha status startedAt finishedAt createdAt')
        .lean()
    }

    
    let duration = null
    if (lastBuild?.startedAt && lastBuild?.finishedAt) {
      const ms = new Date(lastBuild.finishedAt) - new Date(lastBuild.startedAt)
      const secs = Math.floor(ms / 1000)
      duration = secs < 60 ? `${secs}s` : `${Math.floor(secs / 60)}m ${secs % 60}s`
    }

    res.status(200).json({
      success: true,
      project: {
        _id: project._id,
        name: project.name,
        projectType: project.projectType,
        repoLink: project.repoLink,
        status: project.status,
        plan: project.plan,
        totalRequest: project.totalRequest || 0,
        totalBuilds: project.totalBuilds || 0,
        domain: project.hascustomDomain && project.customDomain
          ? project.customDomain
          : `${project.subdomain}.deployhub.online`,
        settings: project.settings,
        buildCommand: project.buildCommand || null,
        publishDir: project.publishDir || null,
        startCommand: project.startCommand || null,
        port: project.port || null,
        createdAt: project.createdAt,
        updatedAt: project.updatedAt,
      },
      lastBuild: lastBuild ? {
        _id: lastBuild._id,
        commitSha: lastBuild.commitSha || null,
        status: lastBuild.status,
        duration,
        createdAt: lastBuild.createdAt,
      } : null,
    })
  } catch (err) {
    console.error('getProjectOverview error:', err)
    res.status(500).json({ success: false, message: 'Failed to fetch project overview' })
  }
}