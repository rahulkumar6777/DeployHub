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
    },
    paymentId: {
        type: String
    },
    verifiedAt: {
        type : Date
    }
}, { timestamps: true })

userVerificationPaymentSchema.index(
    { userId: 1, status: 1 },
    { unique: true, partialFilterExpression: { status: "pending" } }
);

export const UserVerificationPayment = mongoose.model("VerifyuserPayment", userVerificationPaymentSchema)