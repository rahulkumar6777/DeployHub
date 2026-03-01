import * as crypto from "crypto";
import { Model } from "../../../models/index.js";
import {
  isBeforeExpiryNotify,
  subscriptionExpire,
  subscriptionStart,
} from "../../../utils/queues.js";

const paymentVerify = async (req, res) => {
  const { razorpay_payment_id, razorpay_order_id, razorpay_signature } =
    req.body;

  if (!razorpay_payment_id || !razorpay_order_id || !razorpay_signature) {
    return res.status(400).json({
      message: "required details fro verify payment",
    });
  }

  try {
    const generated_signature = crypto
      .createHmac("sha256", `${process.env.KEY_SECRET}`)
      .update(razorpay_order_id + "|" + razorpay_payment_id)
      .digest("hex");

    if (generated_signature === razorpay_signature) {
      console.log("Payment verification successful");
      const user = req?.user;
      if (!user) {
        return res
          .status(400)
          .json({ success: false, message: "User not found!" });
      }

      const orderfromdb = await Model.PendingOrder.findOne({
        userid: user._id,
        oderid: razorpay_order_id,
      });

      if (!orderfromdb) {
        return res.status(400).json({
          message: "something went wrong! PLease Contact your team",
        });
      }

      if (orderfromdb.status === "completed") {
        return res.status(400).json({
          message: "Your Oder ALready PRocessed",
        });
      }

      const months = orderfromdb.months;

      const now = new Date();
      const subscriptionend =
        process.env.NODE_ENV === "production"
          ? new Date(now.getTime() + months * 30 * 24 * 60 * 60 * 1000)
          : new Date(now.getTime() + 60 * 60 * 1000);
      const isBeforeExpiryDate =
        process.env.NODE_ENV === "production"
          ? new Date(now.getTime() + months * 25 * 24 * 60 * 60 * 1000)
          : new Date(now.getTime() + 2 * 60 * 1000);

      const payment = await Model.CompletedOrder.create({
        userid: orderfromdb.userid,
        orderid: orderfromdb.oderid,
        months: orderfromdb.months,
        amount: orderfromdb.amount,
        plan: orderfromdb.plan,
        status: "completed",
      });


      const project = new Model.Project({
        paymentId: payment._id,
        plan: payment.plan,
        startDate: now,
        endDate: subscriptionend,
        owner: req.user._id
      })

      payment.projectid = project._id
      await payment.save({validateBeforeSave: false})
      await project.save({validateBeforeSave: false})
      orderfromdb.status = "completed";
      await orderfromdb.save({ validateBeforeSave: false });

      await isBeforeExpiryNotify.add(
        "deployhub-isBeforeExpiryQueue",
        {
          userId: req.user._id,
          email: req.user.email,
          fullname: req.user.fullName,
        },
        {
          delay: isBeforeExpiryDate - Date.now(),
          jobId: req.user._id.toString(),
          removeOnComplete: true,
        },
      );

      await subscriptionStart.add("deployhub-subscriptionstart", {
        fullName: req.user.fullName,
        email: req.user.email,
        price: orderfromdb.amount / 100,
        duration: orderfromdb.months,
        plan: orderfromdb.plan,
      });

      await subscriptionExpire.add(
        "deployhub-subscriptionend",
        {
          userId: req.user._id,
        },
        {
          jobId: req.user._id.toString(),
          delay: subscriptionend - Date.now(),
        },
      );

      return res.json({
        success: true,
        userSubscribe: user.subscription,
        projectId: project._id,
        message: "Payment verified successfully!",
      });
    } else {
      return res
        .status(400)
        .json({ success: false, message: "Payment verification failed!" });
    }
  } catch (error) {
    console.error("Payment verification error:", error);
    res.status(500).json({ error: "Error verifying payment" });
  }
};

export { paymentVerify };
