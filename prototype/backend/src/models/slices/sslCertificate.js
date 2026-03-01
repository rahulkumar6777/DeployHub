import mongoose from "mongoose";

const sslCertifcateschema = new mongoose.Schema({
    userId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: "User",
        index: true
    },
    projectId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: "Project"
    },
    domain: {
        type: String,
        required: true,
        index: true
    },
    issuedAt: {
        type: String,
        required: true
    },
    expiresAt: {
        type: String,
        required: true
    },
    lastRenewAttempt: {
        type: Date
    },
    nextRenewAt: {
        type: Date
    }
})

export const SslCertificate = mongoose.model("SslCertificate" , sslCertifcateschema)