import { Model } from "../../../models/index.js";

export const renewInfo = async (req, res) => {
    try {
        const userId = req.user._id;

        const previousOrder = await Model.CompletedOrder.findOne({userid: userId});
        if(!previousOrder){
            return res.status(400).json({
                message: "you are not eligible for renew"
            })
        }

        const months = previousOrder.months

        return res.status(200).json({
            message: "Success",
            month: months
        })
        

    } catch (error) {
        return res.status(500).json({
            error: "Internal server Error"
        })
    }
}