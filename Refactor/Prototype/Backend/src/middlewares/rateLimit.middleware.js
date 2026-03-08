import { Utils } from "../Utils/index.js"

const limits = {
    registerInit: {
        time: 60,
        limit: 5
    },
    ProfileChange: {
        time: 3600,
        limit: 2
    },
    fullname: {
        time: 3600,
        limit: 1
    },
    deplyment: {
        time: 864000,
        limit: 10
    },
    reDeployment: {
        time: 864000,
        limit: 20
    },
    deleteProject: {
        time: 864000,
        limit: 10
    }
}

export const rateLimitMiddleware = (apitype) => {
    return async (req, res, next) => {
        const { time, limit } = limits[apitype]

        await Utils.Infra.rateLimit(apitype, time, limit, req, res, `Rate limit exceeded for ${apitype})`)
        next()
    }
}