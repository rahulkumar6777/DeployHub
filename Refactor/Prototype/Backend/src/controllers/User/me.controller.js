import jwt from 'jsonwebtoken'
import { ENV } from '../../lib/env.js';
import { redisclient } from '../../configs/redis.js';
import { Model } from '../../models/index.js';

export const me = async (req, res) => {
    try {

        const accessToken = req.headers['authorization']?.split(' ')[1];
        if (!accessToken) {
            return res.status(401).json({ message: "Unauthorized access" });
        }
        const decoded = jwt.verify(accessToken, ENV.ACCESS_TOKEN_SECRET)

        // redis key
        const redisKey = `deployhub:user:${decoded._id}`

        const userData = await redisclient.hgetall(redisKey)
        if (!userData || Object.keys(userData).length === 0) {
            const info = await Model.User.findById(decoded._id).select('fullname email provider profilePic verified updatedAt createdAt').lean()
            if (!info) {
                return res.status(403).json({ message: "Invalid User" });
            }

            // here set data on cache if not available
            await redisclient.hset(redisKey, info)

            // set exipry
            await redisclient.expire(redisKey, 3600)

            return res.status(200).json({
                data: info,
                success: "true"
            })
        }

        return res.status(200).json({
            data: userData.info,
            success: "true"
        })

    } catch (error) {
        return res.status(500).json({
            error: "Internal Server Error"
        })
    }
}