import Razorpay from 'razorpay'
import { Model } from '../../../models/index.js';
import crypto from "node:crypto";

const razorpay = new Razorpay({
    key_id: `${process.env.KEY_ID}`,
    key_secret: `${process.env.KEY_SECRET}`,
})

const initVerify = async (req, res) => {
    try {

        const user = req.user;
        const basePrice = 9900

        const order = await razorpay.orders.create({
            amount: basePrice,
            customer_details: {
                email: user.email,
                name: user.fullname
            },
            currency: "INR",
            receipt: "order_rcptid_" + Math.random(),
        })


        await Model.VerifyuserPayment.create({
            userId: user._id,
            status: 'pending',
            oderid: order.id
        })

        res.status(200).json(order);

    } catch (error) {
        return res.status(500).json({
            error: "Internal Server Error"
        })
    }
}

const verify = async (req, res) => {
    try {

        const { razorpay_payment_id, razorpay_order_id, razorpay_signature } = req.body;

        if (!razorpay_payment_id || !razorpay_order_id || !razorpay_signature) {
            return res.status(400).json({
                message: "required details fro verify payment"
            })
        }

        try {
            const generated_signature = crypto
                .createHmac("sha256", process.env.key_secret)
                .update(`${razorpay_order_id}|${razorpay_payment_id}`)
                .digest("hex");

            if (generated_signature === razorpay_signature) {


                console.log("Payment verification successful");
                const user = req?.user
                if (!user) {
                    return res.status(400).json({ success: false, message: "User not found!" });
                }



                const orderfromdb = await Model.VerifyuserPayment.findOne({ userId: user._id, oderid: razorpay_order_id });
                if (!orderfromdb) {
                    return res.status(400).json({
                        message: "something went wrong! PLease Contact your team"
                    })
                }

                if (orderfromdb.status === 'completed') {
                    return res.status(400).json({
                        message: "Your Oder ALready PRocessed"
                    })
                }

                orderfromdb.status = 'completed';
                await orderfromdb.save({ validateBeforeSave: false });

                req.user.verified = true
                req.user.verifiedAt = new Date();

                await req.user.save({ validateBeforeSave: false })

                return res.status(200).json({
                    success: true,
                    verifed: true
                })
            } else {
                return res.status(400).json({ success: false, message: "Payment verification failed!" });
            }

        } catch (error) {
            console.log(error)
            return res.status(500).json({
                error: "Internal Server Error"
            });
        }
    }
    catch (error) {
        console.log(error)
        return res.status(500).json({
            error: "Internal Server Error"
        })
    }
}

export { initVerify, verify }

