import mongoose from "mongoose";

const userVerificationPaymentSchema = new mongoose.Schema({
    userId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: "User"
    },
    status: {
        type: String,
        enum: ["pending", 'completed']
    },
    oderid: {
        type: String
    }
}, { timestamps: true })

export const UserVerificationPayment = mongoose.model("VerifyuserPayment", userVerificationPaymentSchema)