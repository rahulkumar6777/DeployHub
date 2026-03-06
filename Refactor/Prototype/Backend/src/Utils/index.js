import { connection } from "./slices/connection.js";
import { AccesstokenOption, RefreshtokenOption } from "./slices/cookieOption.js";
import { corsOption } from "./slices/corsOption.js";
import { deleteFromDevload } from "./slices/devloadDelete.js";
import { uploadToDevload } from "./slices/devloadUpload.js";
import docker from "./slices/docker.js";
import { transporter } from "./slices/emailTransporter.js";
import { GenerateAccessTokenAndRefreshToken } from "./slices/GenerateAccessTokenAndRefreshToken.js";
import { mailTempletHtmlPath } from "./slices/mailTempletPath.js";
import RedisConfigForPubSub from "./slices/pubSubRedis.js";
import { welcomeMessageQueue } from "./slices/queues.js";
import { razorpay } from "./slices/razorPay.js";

export const Utils = {
    Auth: {
        GenerateToken: GenerateAccessTokenAndRefreshToken,
        cookieOption: {
            refresh: RefreshtokenOption,
            access: AccesstokenOption
        }
    },
    DevLoad: {
        Upload: uploadToDevload,
        Delete: deleteFromDevload
    },
    Infra: {
        docker,
        RedisConfigForPubSub,
        bullMqConnection: connection,
        queues: { welcomeMessageQueue }
    },
    Email: {
        transporter,
        mailTempletHtmlPath
    },
    Security: {
        corsOption
    },
    Payment: {
        razorpay
    }
};