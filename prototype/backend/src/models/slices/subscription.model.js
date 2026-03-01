import mongoose from "mongoose";

const subscriptionschema = new mongoose.Schema({
    userId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: "User",
        required: true,
        index: true
    },
    prijectId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: "Project",
        required: true,
        index: true
    }
}, { timestamps: true })

export const Subscription = mongoose.model("Subscription", subscriptionschema)