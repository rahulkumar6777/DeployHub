import { redisclient } from "../../configs/redis.js";

export const rateLimit = async (apitype, time, limit, req, res, inputmessage) => {

    const userId = req.user._id || req.ip;

    const redisKey = `deployhub:ratelimit:${apitype}:${userId}`;

    const count = await redisclient.incr(redisKey)

    if (count === 1) {
        await redisclient.expire(key, time)
    }

    if (count > limit) {
        return res.status(429).json({
            message: inputmessage
        });
    }

    next()
}