import { githubCallback } from "./slices/Auth/githubCallback.js";
import { githubLogin } from "./slices/Auth/githubLogin.js";
import { initRegistration } from "./slices/Auth/initRegister.controller.js";
import { Login } from "./slices/Auth/Login.controller.js";
import { Logout } from "./slices/Auth/Logout.Controller.js";
import { RefreshToken } from "./slices/Auth/RefreshToken.Controller.js";
import { verifyRegister } from "./slices/Auth/verifyRegister.controller.js";
import { createDeployment } from "./slices/deployment/createDeployment.controller.js";
import { getUserProjects } from "./slices/deployment/getUserProjects.js";
import reDeployment from "./slices/deployment/reDeployment.controller.js";
import { getUserRepos } from "./slices/git/getUserRepo.controller.js";
import { initPayment } from "./slices/Payments/init.controller.js";
import { paymentVerify } from "./slices/Payments/verify.controller.js";
import { initVerify, verify } from "./slices/Payments/verifyUser.js";
import { getBuildById, getProjectBuilds } from "./slices/Project/Buildscontroller.js";
import { getProjectMeta } from "./slices/Project/getProjectMeta.js";
import { getProjectOverview } from "./slices/Project/getProjectOverview.js";
import { deleteProject, getProjectSettings, updateBuildSettings, updateEnvSettings, updateGeneralSettings } from "./slices/Project/settings.js";
import { getDashboardStats } from "./slices/user/dashboard.js";
import { fullName } from "./slices/user/fullName.controller.js";
import { Invoice } from "./slices/user/invoices.js";
import { me } from "./slices/user/me.controller.js";
import { ProfileChange } from "./slices/user/profile.controller.js";
import { getUsageStats } from "./slices/user/usage.js";

export const contollers = {
    Auth: {
        Register: {
            init: initRegistration,
            verify: verifyRegister
        },
        Login,
        RefreshToken,
        Logout,
        githubLogin,
        githubCallback
    },
    Deployment: {
        createDeployment,
        reDeployment
    },
    user: {
        me,
        initVerify,
        verify,
        Invoice,
        profilePic: ProfileChange,
        fullName,
        getUserRepos,
        getUserProjects,
        getDashboardStats,
        getUsageStats
    },
    subscription: {
        init: initPayment,
        verfy: paymentVerify
    },
    Project: {
        Meta: getProjectMeta,
        overview: getProjectOverview,
        settings: {
            get: getProjectSettings,
            updateGeneralSettings,
            updateBuildSettings,
            updateEnvSettings,
            deleteProject
        },
        logs: {
            getBuildById,
            getProjectBuilds
        }
    }
}