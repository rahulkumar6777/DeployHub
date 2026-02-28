import Razorpay from 'razorpay'
import { Model } from '../../../models/index.js';



const razorpay = new Razorpay({
    key_id: `${process.env.KEY_ID}`,
    key_secret: `${process.env.KEY_SECRET}`,
})

export const RenewPayment = async (req, res) => {

    const order = await Model.CompletedOrder.findOne({oderid: req.user.subscriptionId})

    const months = order.months

    const basePrice = 81900;
    
    const finalAmount = months * basePrice

    try {
        const order = await razorpay.orders.create({
            amount: finalAmount,
            currency: "INR",
            receipt: "order_rcptid_" + Math.random(),
        });




        await Model.PendingOrder.create({
            userid: req.user._id,
            oderid: order.id,
            months: months,
            amount: finalAmount,
            status: 'pending'
        })

        res.status(200).json(order);
    } catch (error) {
        console.error("Error creating order:", error);
        res.status(500).json({ error: "Error creating Razorpay order" });
    }
}