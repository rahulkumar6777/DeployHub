import mongoose from "mongoose";

const completedorderschema = new mongoose.Schema({
    userid: {
        type: mongoose.Schema.Types.ObjectId,
        ref: "User",
        required: true
    },
    orderid: {
        type: String,
        required: true
    },
    months: {
        type: Number,
        required: true
    },
    amount: {
        type: Number
    },
    plan: {
        type: String,
    },
    status: {
        type: String,
    },
    projectid: {
         type: mongoose.Schema.Types.ObjectId,
        ref: "Project",
    }
}, { timestamps: true})


export const CompletedOrder = new mongoose.model('CompletedOrder', completedorderschema)