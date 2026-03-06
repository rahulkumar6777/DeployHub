import DevLoad from "devload";
import { ENV } from "../../lib/env.js";

export const deleteFromDevload = async (fileid) => {
    try {
        const devload = new DevLoad(ENV.DEVLOAD_API_KEY);
        const response = await devload.deleteFile(fileid)
        return response;
    } catch (error) {
        return null;
    }
}