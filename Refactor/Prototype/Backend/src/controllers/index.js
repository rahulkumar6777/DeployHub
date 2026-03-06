import { initRegistration } from "./Auth/initRegister.controller";
import { verifyRegister } from "./Auth/verifyRegister.controller";

export const controller = {
    Auth: {
        Register: {
            init: initRegistration,
            verify: verifyRegister
        }
    }
}