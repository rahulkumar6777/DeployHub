import { Redis } from "ioredis";
import { ENV } from "../../lib/env.js";

class RedisConfigForPubSub {
    constructor() {
        this.publisher = new Redis({
            host: ENV.REDIS_HOST || 'localhost',
            port: ENV.REDIS_PORT || 6379,
        })
        this.subscriber = new Redis({
            host: ENV.REDIS_HOST || 'localhost',
            port: ENV.REDIS_PORT || 6379,
        })

        process.on("SIGINT", async () => {
            await this.publisher.quit();
            await this.subscriber.quit();
            console.log("Redis connections closed");
            process.exit(0);
        });
    }
    async produce(channel, message) {
        await this.publisher.publish(channel, message)
    }
    async consume(channel, callback) {

        await this.subscriber.subscribe(channel)

        this.subscriber.on("message", async (ch, message) => {

            if (ch === channel) {
                await callback(message)
            }
        })
    }
}



export default RedisConfigForPubSub