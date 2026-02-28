import mongoose from "mongoose";

export const connectDB = async () => {
    try {
        await mongoose.connect(`${process.env.NODE_ENV === 'production' ? process.env.PRODUCTIONDB_URI : process.env.DEVELOPMENTDB_URI}`, {
            authSource: 'admin'
        })
        console.log("database connected");
    } catch (error) {
        console.log(` Error while connect to DB ${error}`)
        process.exit(1)
    }
}