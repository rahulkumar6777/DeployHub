import DevLoad from "devload";
import { ENV } from "../../lib/env.js";

export const uploadToDevload = async (localFilePath) => {
    try {
        const devload = new DevLoad(ENV.DEVLOAD_API_KEY);
        const projectid = ENV.DEVLOAD_PROJECT_ID;
        const response = await devload.uploadFile(projectid, localFilePath)
        return response;
    } catch (error) {
        return null;
    }
}