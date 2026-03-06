import { ENV } from "../../lib/env.js";

const LocalHostRefreshTokenOption = {
    httpOnly: true,
    secure: false, 
    sameSite: 'Lax',
    expires: new Date(Date.now() + 9 * 24 * 60 * 60 * 1000)
};

const DeploymentRefreshTokenOption = {
    httpOnly: true,
    secure: true,
    sameSite: 'Strict',
    domain: ".deployhub.cloud",
    expires: new Date(Date.now() + 4 * 24 * 60 * 60 * 1000)
};

const LocalHostAccessTokenOption = {
    httpOnly: true,
    secure: false, 
    sameSite: 'Lax', 
    expires: new Date(Date.now() + 10 * 60 * 60 * 1000) 
};

const DeploymentAccessTokenOption = {
    httpOnly: true,
    secure: true,
    sameSite: 'Strict',
    domain: ".deployhub.cloud",
    expires: new Date(Date.now() +  15 * 60 * 1000) 
};

const RefreshtokenOption = ENV.NODE_ENV === 'production'
    ? DeploymentRefreshTokenOption
    : LocalHostRefreshTokenOption;

const AccesstokenOption = ENV.NODE_ENV === 'production'
    ? DeploymentAccessTokenOption
    : LocalHostAccessTokenOption;

export { RefreshtokenOption, AccesstokenOption };
