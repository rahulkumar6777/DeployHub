import mongoose from "mongoose";

const verifyuserschema = new mongoose.Schema({
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

export const VerifyuserPayment = mongoose.model("VerifyuserPayment", verifyuserschema)