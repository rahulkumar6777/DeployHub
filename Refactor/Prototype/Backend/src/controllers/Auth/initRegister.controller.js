import { body, validationResult } from "express-validator";
import { Model } from "../../models/index.js";
import { Utils } from "../../Utils/index.js";

const SignupValidate = [
    body('fullname').notEmpty().withMessage("Fullname is Required").isString(),
    body('email')
        .notEmpty()
        .withMessage("email is Required")
        .isEmail()
        .normalizeEmail()
        .withMessage("Invalid Email Formet"),
    body('password')
        .notEmpty()
        .withMessage("Password is Required")
        .isString()
        .isLength({ min: 8 })
        .matches(
            /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[@$!%*?&])[A-Za-z\d@$!%*?&]{8,}$/
        )
        .withMessage(
            "Password must be at least 8 characters and include uppercase, lowercase, number, and special character"
        ),
];

const initRegistration = async (req, res) => {
    try {
        await Promise.all(SignupValidate.map((validate) => validate.run(req)));
        const errors = validationResult(req);

        if (!errors.isEmpty()) {
            return res.status(400).json({
                message: errors.array()[0].msg,
            });
        }

        const { fullname, email, password } = req.body;

        const checkexistTempUser = await Model.TempUser.findOne({ email })
        if (checkexistTempUser) {
            return res.status(409).json({
                message: "user already exist! please validate otp and create account"
            })
        }


        const checkemail = await Model.User.findOne({ email });
        if (checkemail) {
            return res.status(409).json({
                message: "Account Already Exist with this email",
            });
        }

        const generateCode = () =>
            Math.floor(100000 + Math.random() * 900000).toString();

        const saveCodeToDB = async (email) => {
            try {
                const code = generateCode();

                await Model.OtpValidate.findOneAndUpdate(
                    { email },
                    { code, createdAt: new Date() },
                    { upsert: true, returnDocument: "after" }
                );

                return code;
            } catch (error) {
                return error;
            }
        };



        const sendRegistrationCode = async (email) => {
            const code = await saveCodeToDB(email);

            const mailOptions = {
                from: `"DevplyNest" <${process.env.EMAIL_USER}>`,
                to: email,
                subject: "Your Registration Code",
                html: `
          <!DOCTYPE html>
          <html lang="en">
          <head>
            <meta charset="UTF-8">
            <meta name="viewport" content="width=device-width, initial-scale=1.0">
            <title>Registration Code</title>
            <style>
              body {
                margin: 0;
                padding: 0;
                font-family: 'Arial', sans-serif;
                background-color: #f4f4f9;
              }
              .container {
                max-width: 600px;
                margin: 20px auto;
                background: linear-gradient(135deg, #ffffff, #f0f0ff);
                border-radius: 10px;
                overflow: hidden;
                box-shadow: 0 4px 20px rgba(0, 0, 0, 0.1);
              }
              .header {
                background: #6b48ff;
                color: #ffffff;
                padding: 20px;
                text-align: center;
              }
              .header h1 {
                margin: 0;
                font-size: 24px;
              }
              .content {
                padding: 30px;
                text-align: center;
              }
              .code-box {
                display: inline-block;
                background: #6b48ff;
                color: #ffffff;
                font-size: 32px;
                font-weight: bold;
                padding: 15px 30px;
                border-radius: 8px;
                letter-spacing: 5px;
                margin: 20px 0;
              }
              .content p {
                color: #333;
                font-size: 16px;
                line-height: 1.6;
              }
              .footer {
                background: #2c2c44;
                color: #bbbbbb;
                padding: 15px;
                text-align: center;
                font-size: 12px;
              }
              @media (max-width: 600px) {
                .container {
                  width: 90%;
                }
                .code-box {
                  font-size: 24px;
                  padding: 10px 20px;
                }
              }
            </style>
          </head>
          <body>
            <div class="container">
              <div class="header">
                <h1>Welcome to DevplyNest!</h1>
              </div>
              <div class="content">
                <p>Your registration code is:</p>
                <div class="code-box">${code}</div>
                <p>This code expires in <strong>10 minutes</strong>. Please use it to complete your registration.</p>
                <p>If you did not request this code, please ignore this email.</p>
              </div>
              <div class="footer">
                <p>&copy; 2025 DevplyNest. All rights reserved.</p>
              </div>
            </div>
          </body>
          </html>
        `,
            };

            await Utils.Email.transporter.sendMail(mailOptions);
        };

        await saveCodeToDB(email);

        await sendRegistrationCode(email);

        const newTempUser = new Model.TempUser({ fullname: fullname, email: email, password: password })
        await newTempUser.save();

        res.status(200).json({
            message: "Otp Sent Success",
        });
    } catch (error) {
        console.log(error);
        return res.status(500).json({
            error: "Failed To send otp",
        });
    }
};

export { initRegistration };