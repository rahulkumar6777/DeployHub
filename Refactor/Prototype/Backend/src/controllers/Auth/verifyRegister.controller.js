import { body, validationResult } from "express-validator";
import { Model } from "../../models/index.js";
import { Utils } from "../../Utils/index.js";

const validateVerifyregister = [
  body("email")
    .notEmpty()
    .withMessage("email is required")
    .isEmail()
    .normalizeEmail()
    .withMessage("Invalid Email Formet"),
  body("otp")
    .notEmpty()
    .withMessage("otp is required")
    .isLength({ min: 6 })
    .isNumeric()
    .withMessage("Otp Length is 6 and should be number"),
];

export const verifyRegister = async (req, res) => {
  try {
    await Promise.all(
      validateVerifyregister.map((validate) => validate.run(req)),
    );
    const error = validationResult(req);

    if (!error.isEmpty()) {
      return res.status(400).json({
        message: error.array()[0].msg,
      });
    }

    const { email, otp } = req.body;

    const findAndValidateInTempuser = await Model.TempUser.findOne({ email });
    if (!findAndValidateInTempuser) {
      return res.status(404).json({
        message: "you not init register!",
      });
    }

    const user = await Model.OtpValidate.findOneAndDelete({
      email: email,
      code: otp,
    });
    if (!user) {
      return res.status(400).json({
        message: "Invalid Otp Or Expired",
      });
    }

    // create new user
    const newUser = new Model.User({
      fullname: findAndValidateInTempuser.fullname,
      email: findAndValidateInTempuser.email,
      password: findAndValidateInTempuser.password,
    });

    const subscription = new Model.Subscription({
      userId: newUser._id,
    });

    newUser.subscriptionid = subscription._id;
    await subscription.save({ validateBeforeSave: false });

    // save
    await newUser.save();

    const queuedata = {
      fullname: newUser.fullname,
      email: newUser.email,
    };

    await Utils.Infra.queues.welcomeMessageQueue.add("deployhub-WelcomeMessage", { data: queuedata });

    return res.status(201).json({
      message: "User register Success",
    });

  } catch (error) {
    console.log(error);
    return res.status(500).json({
      error: "Internal Server Error",
    });
  }
};
