import { Model } from "../models/index.js";
import { redisclient } from "../configs/redis.js";
export const AllocatePortandSubdomain = async (projectId, subdomain) => {

    const port = await redisclient.get("globalPort") || 20000;
    const minPort = parseInt(port);
    const maxPort = 30000;

    for (let port = minPort; port <= maxPort; port++) {
        const findFreePort = await Model.Binding.findOne({ port: port });
        if (!findFreePort) {
            const binding = new Model.Binding({
                port: port,
                project: projectId,
                subdomain: subdomain,
                url: `http://${subdomain}:${port}`
            })
            await binding.save({validateBeforeSave: false})

            await redisclient.set("globalPort", port + 1)
            return binding;
        }
    }
};