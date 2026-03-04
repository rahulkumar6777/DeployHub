import { Redis } from "ioredis";

class RedisConfig {

    constructor() {

        this.publisher = new Redis({
            host: "redis",
            port: 6379
        })

        this.subscriber = new Redis({
            host: "redis",
            port: 6379
        })

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

export default RedisConfig