import { initRegistration } from "./Auth/initRegister.controller";
import { Login } from "./Auth/Login.controller";
import { Logout } from "./Auth/Logout.Controller";
import { RefreshToken } from "./Auth/RefreshToken.Controller";
import { verifyRegister } from "./Auth/verifyRegister.controller";

export const controller = {
    Auth: {
        Local: {
            Register: {
                init: initRegistration,
                verify: verifyRegister
            },
            Login,
        },
        RefreshToken,
        Logout
    }
}