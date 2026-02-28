import Razorpay from 'razorpay';
import { Model } from '../../../models/index.js';
import { planPrice } from '../../../constants/planPrice.js';


const razorpay = new Razorpay({
    key_id: `${process.env.KEY_ID}`,
    key_secret: `${process.env.KEY_SECRET}`,
})

const initPayment = async (req, res) => {

    const { plan , months } = req.body;

    if(!months || !plan){
        return res.status(400).json({
            message: "Months required"
        })
    }

    const planInLoweCase = plan.toLowerCase();

    if(!planPrice[planInLoweCase]){
       return res.status(400).json({ message: "Invalid plan" }); 
    }

    const plans = planPrice[planInLoweCase];
    const basePrice = parseInt(plans.basePrice);
    const discountRates = plans.discount;
    const discount = discountRates[months] || 0;
    const finalAmount = parseInt(months * basePrice * (1 - discount / 100).toFixed(2))

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
            plan: 'pro',
            status: 'pending'
        })

        res.status(200).json(order);
    } catch (error) {
        console.error("Error creating order:", error);
        res.status(500).json({ error: "Error creating Razorpay order" });
    }

}

export {initPayment}