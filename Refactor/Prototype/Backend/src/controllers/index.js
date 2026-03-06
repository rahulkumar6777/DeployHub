import { githubCallback } from "./Auth/githubCallback.js";
import { githubLogin } from "./Auth/githubLogin.js";
import { initRegistration } from "./Auth/initRegister.controller.js";
import { Login } from "./Auth/Login.controller.js";
import { Logout } from "./Auth/Logout.Controller.js";
import { RefreshToken } from "./Auth/RefreshToken.Controller.js";
import { verifyRegister } from "./Auth/verifyRegister.controller.js";
import { initVerify, verify } from "./Payment/verifyUser.js";
import { me } from "./User/me.controller.js";

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
    },
    Payment: {
        userverify: {
            init: initVerify,
            verify
        }
    }
}