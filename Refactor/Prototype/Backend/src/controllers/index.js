import { githubCallback } from "./Auth/githubCallback";
import { githubLogin } from "./Auth/githubLogin";
import { initRegistration } from "./Auth/initRegister.controller";
import { Login } from "./Auth/Login.controller";
import { Logout } from "./Auth/Logout.Controller";
import { RefreshToken } from "./Auth/RefreshToken.Controller";
import { verifyRegister } from "./Auth/verifyRegister.controller";
import { me } from "./User/me.controller";

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
        Logout,
        Github: {
            Login: githubLogin,
            callBack: githubCallback
        }
    },
    User: {
        me: me
    }
}