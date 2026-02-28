import mongoose from "mongoose";

const deploymentSchema = new mongoose.Schema({

  project: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "Project",
    required: true
  },

  build: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "Build",
    required: true
  },

  status: {
    type: String,
    enum: ["deploying", "live", "failed", "stopped"],
    default: "deploying"
  },

  deployedAt: Date,

  containerId: String,


}, { timestamps: true });

export default mongoose.model("Deployment", deploymentSchema);
