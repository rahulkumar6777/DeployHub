import * as crypto from 'crypto'
import { Model } from '../../../models/index.js';
import { makeQueue } from '../../../utils/makeQueue.js';
import { subscriptionExpire, subscriptionStart, isBeforeExpiryNotify } from './verify.controller.js';

const verifyRenew = async (req, res) => {

    const user = req.user;

    const { razorpay_payment_id, razorpay_order_id, razorpay_signature } = req.body;

    if (!razorpay_payment_id || !razorpay_order_id || !razorpay_signature) {
        return res.status(400).json({
            message: "required details fro verify payment"
        })
    }


    try {
        const generated_signature = crypto
            .createHmac("sha256", `${process.env.key_secret}`)
            .update(razorpay_order_id + "|" + razorpay_payment_id)
            .digest("hex");

        if (generated_signature === razorpay_signature) {

            const orderfromdb = await Model.PendingOrder.findOneAndUpdate(
                { userid: user._id, oderid: razorpay_order_id, status: "pending" },
                { status: "completed" },
                { new: true }
            );

            if (!orderfromdb) return res.status(400).json({ message: "Order already processed or invalid" });


            const months = orderfromdb.months;


            const baseDate = user.subscriptionEnd > new Date()
                ? new Date(user.subscriptionEnd)
                : new Date();

            const subscriptionend = new Date(baseDate.getTime() + months * 30 * 24 * 60 * 60 * 1000);
            const isBeforeExpiryDate = new Date(subscriptionend.getTime() - 5 * 24 * 60 * 60 * 1000);


            user.subscriptionStart = baseDate;
            user.subscriptionEnd = subscriptionend;
            user.subscriptionId = razorpay_order_id;
            user.isUnderRenew = false

            await user.save({ validateBeforeSave: false })

            orderfromdb.status = 'completed'
            await orderfromdb.save({ validateBeforeSave: false })

            await Model.CompletedOrder.create({
                userid: orderfromdb.userid,
                oderid: orderfromdb.oderid,
                months: orderfromdb.months,
                amount: orderfromdb.amount,
                status: 'completed'
            })

            await isBeforeExpiryNotify.add("isBeforeExpiryQueue",
                {
                    userId: req.user._id
                }, {
                delay: isBeforeExpiryDate.getTime() - Date.now(),
                jobId: `${req.user._id}-${Date.now()}`,
                removeOnComplete: true
            }
            )

            const job = await subscriptionExpire.getJob(req.user._id.toString());
            if (job) {
                await job.remove();
            }
            
            await subscriptionExpire.add("subscriptionend",
                {
                    userId: req.user._id
                }, {
                jobId: req.user._id.toString(),
                delay: subscriptionend - Date.now()
            }
            )

            await subscriptionStart.add("subscriptionstart",
                {
                    fullName: req.user.fullName,
                    email: req.user.email,
                    price: orderfromdb.amount / 100,
                    duration: orderfromdb.months
                }
            )

            console.log("verification Completed")

            return res.json({ success: true, userSubscribe: user.subscription, message: "Payment verified successfully!" });
        } else {
            return res.status(400).json({ success: false, message: "Payment verification failed!" });
        }
    } catch (error) {
        console.error("Payment verification error:", error);
        res.status(500).json({ error: "Error verifying payment" });
    }

}

export { verifyRenew }