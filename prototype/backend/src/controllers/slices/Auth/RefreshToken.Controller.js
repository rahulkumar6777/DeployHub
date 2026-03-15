import jwt from 'jsonwebtoken'
import { Model } from '../../../models/index.js'
import { RefreshtokenOption } from '../../../utils/option.js';

const RefreshToken = async (req, res) => {
    try {
        const refrestoken = req.cookies?.refreshToken;
        console.log(req.cookies)
<<<<<<< HEAD

=======
>>>>>>> 7a1a9d802e252c65209b6ba5b196b961d94401a2
        if (!refrestoken) {
            return res.status(400).json({
                message: "RefresToken NOt Received"
            })
        }

        const verifytoken = jwt.verify(
            refrestoken,
            process.env.REFRESH_TOKEN_SECRET
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


        return res.status(200).json({
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
