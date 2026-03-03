import { Model } from '../../../models/index.js'

// GET /api/projects/:id/builds
export const getProjectBuilds = async (req, res) => {
  try {
    const project = await Model.Project.findOne({
      _id:    req.params.id,
      owner:  req.user._id,
      status: { $ne: 'deleted' },
    }).select('_id totalBuilds').lean()

    if (!project) return res.status(404).json({ success: false, message: 'Project not found' })

    const builds = await Model.Build.find({ project: req.params.id })
      .select('commitSha status startedAt finishedAt logUrl createdAt')
      .sort({ createdAt: -1 })
      .limit(50)
      .lean()

    res.status(200).json({
      success: true,
      total:   project.totalBuilds || builds.length,
      builds,
    })
  } catch (err) {
    console.error('getProjectBuilds error:', err)
    res.status(500).json({ success: false, message: 'Server error' })
  }
}

// GET /api/projects/:id/builds/:buildId
export const getBuildById = async (req, res) => {
  try {
    const project = await Model.Project.findOne({
      _id:    req.params.id,
      owner:  req.user._id,
      status: { $ne: 'deleted' },
    }).select('_id').lean()

    if (!project) return res.status(404).json({ success: false, message: 'Project not found' })

    const build = await Model.Build.findOne({
      _id:     req.params.buildId,
      project: req.params.id,
    }).select('commitSha status startedAt finishedAt logUrl dockerImage createdAt').lean()

    if (!build) return res.status(404).json({ success: false, message: 'Build not found' })

    res.status(200).json({ success: true, build })
  } catch (err) {
    console.error('getBuildById error:', err)
    res.status(500).json({ success: false, message: 'Server error' })
  }
}