import mongoose from "mongoose";

const bindingSchema = new mongoose.Schema({
    project: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Project'
    },
    subdomain: {
        type: String,
        required: true,
        index: true
    },
    port: {
        type: String,
        required: true,
    },
    customDomain: {
        type: String
    }
});

export const Binding = mongoose.model('Binding', bindingSchema);