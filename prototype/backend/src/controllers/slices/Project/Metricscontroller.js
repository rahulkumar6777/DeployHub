import { Model } from '../../../models/index.js'


export const getProjectMetrics = async (req, res) => {
    try {
        const projectId = req.params.id
        const range = parseInt(req.query.range) || 7  

       
        const project = await Model.Project.findOne({
            _id: projectId,
            owner: req.user._id,
        }).select('name totalRequest status plan').lean()

        if (!project) return res.status(404).json({ success: false, message: 'Project not found' })

       
        const dates = []
        for (let i = range - 1; i >= 0; i--) {
            const d = new Date()
            d.setDate(d.getDate() - i)
            dates.push(d.toISOString().slice(0, 10))
        }

       
        const metrics = await Model.DailyMetric.find({
            projectId,
            date: { $in: dates },
        }).lean()

        
        const metricsMap = {}
        metrics.forEach(m => { metricsMap[m.date] = m.requests })

        const todayStr = dates[dates.length - 1]
        const yesterdayStr = dates[dates.length - 2]
        const yesterdayVal = metricsMap[yesterdayStr] || 0
        const todayLive = Math.max(0, (project.totalRequest || 0) - yesterdayVal)

        const chartData = dates.map(date => ({
            date,
            label: formatDateLabel(date, range),
            requests: date === todayStr ? todayLive : (metricsMap[date] || 0),
            isToday: date === todayStr,
        }))

        const total = chartData.reduce((s, d) => s + d.requests, 0)
        const avg = Math.round(total / range)
        const peak = Math.max(...chartData.map(d => d.requests))
        const peakDate = chartData.find(d => d.requests === peak)?.label || ''

        res.json({
            success: true,
            project: {
                name: project.name,
                status: project.status,
                plan: project.plan,
                totalRequest: project.totalRequest,
            },
            range,
            chartData,
            stats: { total, avg, peak, peakDate },
        })
    } catch (err) {
        console.error('getProjectMetrics error:', err)
        res.status(500).json({ success: false, message: 'Server error' })
    }
}

function formatDateLabel(dateStr, range) {
    const d = new Date(dateStr)
    if (range <= 7) {
        return d.toLocaleDateString('en-IN', { weekday: 'short', day: 'numeric' })  
    }
    return d.toLocaleDateString('en-IN', { day: 'numeric', month: 'short' })
}