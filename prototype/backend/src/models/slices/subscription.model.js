import mongoose from "mongoose";

const subscriptionschema = new mongoose.Schema({
    userId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: "User",
        required: true,
        index: true
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
        type: String
    }
}, { timestamps: true })

export const Subscription = mongoose.model("Subscription", subscriptionschema)