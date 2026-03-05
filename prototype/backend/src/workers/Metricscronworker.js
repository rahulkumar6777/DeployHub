import cron from 'node-cron'
import { Model } from '../models/index.js'


cron.schedule('*/1 * * * *', async () => {
  try {
    const today = new Date().toISOString().slice(0, 10)

    const projects = await Model.Project.find(
      { status: { $nin: ['deleted'] } },
      { _id: 1, totalRequest: 1 }
    ).lean()

    console.log(projects)
    if (!projects.length) return

    
    const ops = projects.map(p => ({
      updateOne: {
        filter: { projectId: p._id, date: today },
        update: { $set: { requests: p.totalRequest || 0 } },
        upsert: true,
      }
    }))

    await Model.DailyMetric.bulkWrite(ops)
    console.log(`[metrics cron] Snapshotted ${projects.length} projects for ${today}`)
  } catch (err) {
    console.error('[metrics cron] Failed:', err.message)
  }
})

console.log('[metrics cron] Scheduled daily at midnight')