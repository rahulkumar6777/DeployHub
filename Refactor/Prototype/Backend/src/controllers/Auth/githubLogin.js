export const githubLogin = async (req, res) => {
    const redirectUrl = `https://github.com/login/oauth/authorize?client_id=${process.env.GITHUB_CLIENT_ID}&scope=repo user:email admin:repo_hook`;

    return res.redirect(redirectUrl);
};