import mongoose from "mongoose";

const buildSchema = new mongoose.Schema({

    project: {
        type: mongoose.Schema.Types.ObjectId,
        ref: "Project",
        required: true,
        index: true
    },

    commitSha: String,

    status: {
        type: String,
        enum: ['pending', 'success', 'failed'],
        default: 'pending'
    },

    startedAt: Date,
    finishedAt: Date,
    dockerImage: String,
    logUrl: String

}, { timestamps: true });

buildSchema.index({ project: 1, createdAt: -1 });

export const Build = mongoose.model("Build", buildSchema);