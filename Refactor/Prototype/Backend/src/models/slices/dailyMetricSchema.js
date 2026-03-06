import mongoose from 'mongoose'

const dailyMetricSchema = new mongoose.Schema({
    projectId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Project',
        required: true,
        index: true
    },
    date: {
        type: String,
        required: true
    },
    requests: {
        type: Number,
        default: 0
    },
}, { timestamps: false })


dailyMetricSchema.index({ projectId: 1, date: 1 }, { unique: true })

export const DailyMetric = mongoose.model('DailyMetric', dailyMetricSchema)