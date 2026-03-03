import { Model } from '../../../models/index.js'


export const getProjectBilling = async (req, res) => {
  try {
    const project = await Model.Project.findOne({
      _id:    req.params.id,
      owner:  req.user._id,
      status: { $ne: 'deleted' },
    })
      .select('name plan startDate endDate totalRequest')
      .lean()

    if (!project)
      return res.status(404).json({ success: false, message: 'Project not found' })

    const orders = await Model.CompletedOrder.find({
      projectid: req.params.id,
      userid:    req.user._id,
    })
      .select('orderid months amount plan status createdAt')
      .sort({ createdAt: -1 })
      .limit(20)
      .lean()

    res.status(200).json({
      success: true,
      project: {
        _id:          project._id,
        name:         project.name,
        plan:         project.plan,
        startDate:    project.startDate    || null,
        endDate:      project.endDate      || null,
        totalRequest: project.totalRequest || 0,
      },
      orders,
    })
  } catch (err) {
    console.error('getProjectBilling error:', err)
    res.status(500).json({ success: false, message: 'Server error' })
  }
}