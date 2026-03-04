import mongoose from "mongoose";

const projectSchema = new mongoose.Schema({
    name: {
        type: String,
        required: true,
        default: 'Unnamed Project'
    },
    owner: {
        type: mongoose.Schema.Types.ObjectId,
        ref: "User",
        required: true,
        index: true
    },
    projectType: {
        type: String,
        required: true,
        lowerCase: true,
        enum: ['static', 'node'],
        default: 'static'
    },
    repoLink: {
        type: String,
        required: true
    },

    buildCommand: String,
    publishDir: String,
    startCommand: String,
    port: Number,
    status: {
        type: String,
        enum: ['pending', 'building', "live", "stopped", 'failed-deploy', 'deleted'],
        default: "pending"
    },
    env: {
        type: Map,
        of: String
    },
    settings: {
        repoBranchName: {
            type: String,
            default: "main"
        },
        folder: {
            enabled: {
                type: Boolean,
                default: false
            },
            name: {
                type: String,
                validate: {
                    validator: function (value) {
                        if (this.folder?.enabled && !value) {
                            return false;
                        }
                        return true;
                    },
                    message: "Folder name is required when folder is enabled"
                }
            }
        }
    },
    buildId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: "Build"
    },
    totalBuilds: {
        type: Number,
        default: 0
    },
    hascustomDomain: {
        type: Boolean,
        default: false
    },
    customDomain: {
        type: String
    },
    subdomain: {
        type: String
    },
    totalRequest: {
        type: Number,
        default: 0
    },
    plan: {
        type: String,
        enum: ["free", "pro"],
        default: "free"
    },
    startDate: {
        type: Date
    },
    endDate: {
        type: Date
    },
    paymentId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: "CompletedOrder"
    }

}, { timestamps: true })

export const Project = mongoose.model("Project", projectSchema)
