import { Redis } from "ioredis"
import { ENV } from '../../lib/env.js'

export const connection = new Redis({
  host: ENV.REDIS_HOST || 'localhost',
  port: ENV.REDIS_PORT || 6379,
  maxRetriesPerRequest: null,
});
