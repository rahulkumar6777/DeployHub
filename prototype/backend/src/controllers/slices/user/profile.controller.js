import { Model } from '../../../models/index.js';
import { deleteFromDevload } from '../../../utils/devload.delete.js';
import { uploadToDevload } from '../../../utils/devload.upload.js';
import fs from 'fs';


const ProfileChange = async (req, res) => {
    try {
        const userid = req.user._id;

        const localFilePath = req.file?.path;

        const uploadResponse = await uploadToDevload(localFilePath);
        if (!uploadResponse) {
            fs.unlinkSync(localFilePath)
            return res.status(500).json({ message: "File upload failed" });
        }

        const updatedUser = await Model.User.findById(userid);

        if (updatedUser?.profilefileid) {
            const deleteResponse = await deleteFromDevload(updatedUser.profilefileid);

            if (!deleteResponse) {
                fs.unlinkSync(localFilePath)
                return res.status(500).json({ message: "File deletion failed" });
            }
        }

        updatedUser.profilePic = uploadResponse.publicurl;
        updatedUser.profilefileid = uploadResponse.fileid;

        await updatedUser.save({validateBeforeSave: false});


        fs.promises.unlink(localFilePath)

        return res.status(200).json({
            message: "Profile picture updated successfully",
            profilePic: updatedUser.profilePic,
        });
    } catch (error) {
        console.log(error)
        fs.unlinkSync(req.file.path)
        return res.status(500).json({ message: "Internal server error" });
    }
}

export { ProfileChange }