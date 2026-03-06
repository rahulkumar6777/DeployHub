import nodemailer from "nodemailer";
import { ENV } from "../../lib/env.js";

export const transporter = nodemailer.createTransport({
    host: `${ENV.EMAIL_HOST}`,
    port: 465,
    secure: true,
    auth: {
        user: ENV.EMAIL_USER,
        pass: ENV.EMAIL_PASS,
    },
});