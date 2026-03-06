import { Binding } from "./slices/binding.model.js";
import { Build } from "./slices/build.model.js";
import { CompletedOrder } from "./slices/completedOrder.model.js";
import { DailyMetric } from "./slices/dailyMetricSchema.js";
import { OtpValidate } from "./slices/otpValidator.model.js";
import { PendingOrder } from "./slices/PendingOrder.js";
import { Project } from "./slices/project.model.js";
import { SslCertificate } from "./slices/sslCertificate.js";
import { TempUser } from "./slices/tempUser.model.js";
import { User } from "./slices/user.model.js";
import { UserVerificationPayment } from "./slices/userVerificationPayment.js";

export const Model = {
    TempUser,
    OtpValidate,
    User,
    UserVerificationPayment,
    Project,
    Build,
    DailyMetric,
    Binding,
    SslCertificate,
    PendingOrder,
    CompletedOrder
}