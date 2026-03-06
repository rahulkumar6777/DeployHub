import { Worker } from "bullmq";
import { connection } from "../Utils/connection";
import { transporter } from "../Utils/emailTransporter";
import fs from 'fs';
import Handlebars from "handlebars";
import { Utils } from "../Utils/index.js";

const filePath = Utils.Email.mailTempletHtmlPath('welcome.html')
const emailTemplet = fs.readFileSync(filePath, 'utf-8')
const compiledEmailTemplet = Handlebars.compile(emailTemplet)

const worker = new Worker("deployhub-WelcomeMessage", async (job) => {
    try {
        const jobData = {
            fullname: job.data.data.fullname,
            email: job.data.data.email,
        };

        const emailHtml = compiledEmailTemplet(jobData);

        const mailOption = {
            from: `DeployHub ${process.env.EMAIL_USER}`,
            to: jobData.email,
            subject: 'Welcome To DeployHub',
            html: emailHtml
        }

        await transporter.sendMail(mailOption)

    } catch (error) {
        console.log("Error While send Welcomes message to user", job.data.fullname)
        throw error
    }
},{
    connection: connection,
    concurrency: 5,
    limiter: {
        max: 100,
        duration: 60 * 1000
    }
})

worker.on('completed', (job) => {
    console.log('Welcome email sent to user', job.data.fullname)
})

worker.on('failed', (job) => {
    console.log('Error While send Welcome email to user', job.data.fullname)
})