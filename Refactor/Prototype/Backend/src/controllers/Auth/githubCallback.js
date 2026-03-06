import axios from "axios";
import { Model } from "../../models/index.js";
import { Utils } from "../../Utils/index.js";


export const githubCallback = async (req, res) => {
    try {
        const { code } = req.query;

        if (!code) {
            return res.status(400).json({ message: "GitHub code missing" });
        }

        const tokenRes = await axios.post("https://github.com/login/oauth/access_token",
            {
                client_id: process.env.GITHUB_CLIENT_ID,
                client_secret: process.env.GITHUB_CLIENT_SECRET,
                code,
            },
            { headers: { Accept: "application/json" } }
        );

        const githubAccessToken = tokenRes.data.access_token;

        if (!githubAccessToken) {
            return res.status(400).json({ message: "GitHub token failed" });
        }

    
        const userRes = await axios.get("https://api.github.com/user", {
            headers: {
                Authorization: `Bearer ${githubAccessToken}`,
            },
        });

        const githubUser = userRes.data;

        const emailRes = await axios.get("https://api.github.com/user/emails", {
            headers: {
                Authorization: `Bearer ${githubAccessToken}`,
            },
        });

        const primaryEmail = emailRes.data.find(e => e.primary)?.email;

        if (!primaryEmail) {
            return res.status(400).json({ message: "Email not found in GitHub" });
        }

        let user = await Model.User.findOne({ email: primaryEmail });

        if (!user) {
            user = await Model.User.create({
                fullname: githubUser.name || githubUser.login,
                email: primaryEmail,
                githubId: githubUser.id,
                githubUsername: githubUser.login,
                githubAccessToken,
                provider: "github",
                password: null,
            });

            await user.save({validateBeforeSave: false})
        } else {
            user.githubAccessToken = githubAccessToken;
            user.githubId = githubUser.id;
            user.githubUsername = githubUser.login;
            user.provider = "github";
            await user.save({ validateBeforeSave: false });
        }

        
        const { RefreshToken, AccessToken } =
            await Utils.Auth.GenerateToken(user._id);

        user.refreshtoken = RefreshToken;
        await user.save({ validateBeforeSave: false });
        return res
            .cookie("refreshToken", RefreshToken, Utils.Auth.cookieOption.refresh)
            .cookie("AccessToken", AccessToken, Utils.Auth.cookieOption.access)
            .redirect(`${process.env.FRONTEND_URL}/`);

    } catch (error) {
        console.log(error);
        return res.status(500).json({ message: "GitHub OAuth failed" });
    }
};