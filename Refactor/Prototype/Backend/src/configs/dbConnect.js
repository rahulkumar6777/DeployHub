import mongoose from "mongoose";

export const connectDB = async () => {
    const uri = process.env.NODE_ENV === 'production' ? process.env.PRODUCTIONDB_URI : process.env.DEVELOPMENTDB_URI;
    try {
        await mongoose.connect(uri, {
            authSource: 'admin'
        });
        console.log(`Database connected: ${mongoose.connection.host}`);
    } catch (error) {
        console.error(`Error while connecting to DB: ${error.message}`);
        process.exit(1);
    }
    process.on("SIGINT", async () => {
        await mongoose.connection.close();
        console.log("MongoDB connection closed");
        process.exit(0);
    });
};