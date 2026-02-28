import mongoose from "mongoose";

const projectSchema = new mongoose.Schema({
    name: {
        type: String,
        required: true
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
        enum: ['Static', 'node'],
        default: 'static'
    },
    // repoProvider: {
    //     type: String,
    //     enum: ["github"],
    //     default: 'github'
    // },
    // repoOwner: String,
    // repoName: String,
    // repoBranch: {
    //     type: String,
    //     default: "main"
    // },
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
        enum: ["active", "disabled"],
        default: "active"
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
                required: function () {
                    return this.folder.enabled;
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
    iscustomDomain: {
        type: Boolean,
        default: false
    },
    customDomain: {
        type: String
    }

}, { timestamps: true })

export const Project = mongoose.model("Project", projectSchema)
