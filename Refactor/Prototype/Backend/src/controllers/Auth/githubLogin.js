import { ENV } from "../../lib/env.js";

export const githubLogin = async (req, res) => {
    const redirectUrl = `https://github.com/login/oauth/authorize?client_id=${ENV.GITHUB_CLIENT_ID}&scope=repo user:email admin:repo_hook`;

    return res.redirect(redirectUrl);
};