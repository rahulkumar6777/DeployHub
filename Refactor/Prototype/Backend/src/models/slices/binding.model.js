import mongoose from "mongoose";

const bindingSchema = new mongoose.Schema({
    projectId: {
        type: String
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
    },
    internalServiceId: {
        type: String
    }
});

export const Binding = mongoose.model('Binding', bindingSchema);