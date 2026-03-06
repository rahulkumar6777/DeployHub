import mongoose from "mongoose";

const pendingorderschema = new mongoose.Schema({
    userid: {
        type: mongoose.Schema.Types.ObjectId,
        ref: "User",
        required: true
    },
    oderid : {
        type: String,
        required: true
    },
    months : {
        type: Number,
        required: true
    },
    amount : {
        type: Number
    },
    plan: {
        type: String,
    },
    status: {
        type: String,
        enum: ["pending" , 'completed']
    },
    createdAt: {
        type: Date,
        expires: 7200,
        default: Date.now
    }
})


export const PendingOrder = new mongoose.model('PendingOrder' , pendingorderschema)