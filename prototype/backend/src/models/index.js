import { Binding } from "./slices/binding.model.js";
import { Build } from "./slices/build.model.js";
import { CompletedOrder } from "./slices/completedOrder.model.js";
import deploymentModel from "./slices/deployment.model.js";
import { OtpValidate } from "./slices/otpValidator.model.js";
import { PendingOrder } from "./slices/PendingOrder.js";
import { Project } from "./slices/project.model.js";
import { Subscription } from "./slices/subscription.model.js";
import { TempUser } from "./slices/tempUser.model.js";
import { User } from "./slices/user.model.js";
import { VerifyuserPayment } from "./slices/verifyUserPayment.model.js";

export const Model = {
    User,
    TempUser,
    OtpValidate,
    Project,
    Build,
    deploymentModel,
    Binding,
    Subscription,
    VerifyuserPayment,
    PendingOrder,
    CompletedOrder
}