import { Model } from '../../../models/index.js';


export const me = async (req, res) => {
    try {

        const userId = req.user._id;

        const info = await Model.User.findById(userId).select('fullname email provider profilePic verified subscriptionid').populate('subscriptionid');
        return res.status(200).json({
            data: info,
            success: "true"
        })


    } catch (error) {
        return res.status(500).json({
            error: "Internal Server Error"
        })
    }
}