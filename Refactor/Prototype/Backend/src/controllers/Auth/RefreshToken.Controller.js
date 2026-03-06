import jwt from 'jsonwebtoken'
import { Model } from '../../../models/index.js'
import { Utils } from '../../Utils/index.js';
import { ENV } from '../../lib/env.js';

const RefreshToken = async (req, res) => {
    try {
        const refrestoken = req.cookies?.refreshToken;

        if (!refrestoken) {
            return res.status(400).json({
                message: "RefresToken NOt Received"
            })
        }

        const verifytoken = jwt.verify(
            refrestoken,
            ENV.REFRESH_TOKEN_SECRET
        )

        if (!verifytoken) {
            return res.status(400).json({
                message: "Invalid Token"
            })
        }

        const user = await Model.User.findById(verifytoken._id);
        if (!user) {
            return res.status(404).json({
                message: "Invalid User"
            })
        }

        if (user.refreshtoken != refrestoken) {
            return res.status(400).json({
                message: "Token Expired"
            })
        }

        const AccessToken = await user.generateAccessToken();


        return res.cookie("RefreshToken", refrestoken, Utils.Auth.cookieOption.refresh)
            .json({
                accessToken: AccessToken
            })

    } catch (error) {
        console.log(error)
        return res.status(500).json({
            error: "Internal Servver Error"
        })
    }
}


export { RefreshToken }