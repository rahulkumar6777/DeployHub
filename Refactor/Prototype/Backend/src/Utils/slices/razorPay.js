import Razorpay from 'razorpay'
import { ENV } from '../../lib/env.js'

export const razorpay = new Razorpay({
    key_id: `${ENV.KEY_ID}`,
    key_secret: `${ENV.KEY_SECRET}`,
})