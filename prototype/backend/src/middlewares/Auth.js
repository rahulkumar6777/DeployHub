import jwt from 'jsonwebtoken';
import { Model } from "../models/index.js"

const verifyJWT = async (req, res, next) => {
    try {
        const accessToken = req.headers['authorization']?.split(' ')[1] || req.cookies.AccessToken;
        if (!accessToken) {
            return res.status(401).json({ message: "Unauthorized access" });
        }

        const decoded = jwt.verify(accessToken, process.env.ACCESS_TOKEN_SECRET);
        // if(!decoded.verified){
        //     return res.status(403).json({ message: "unverifed User" });
        // }

        const userId = decoded._id;

        const user = await Model.User.findById(userId).select("-password");
        if (!user) {
            return res.status(403).json({ message: "Invalid User" });
        }

        req.user = user;
        next();
    } catch (error) {
        console.error("Error in verifyJWT middleware:", error);
        return res.status(500).json({ error: "Please relogin" });
    }
};


export { verifyJWT };
