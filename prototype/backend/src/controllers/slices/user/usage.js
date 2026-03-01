import { Model } from "../../../models/index.js";

export const getUsageStats = async (req, res) => {
    try {
        const userId = req.user._id;

        const projects = await Model.Project.find({
            owner: userId,
            status: { $ne: "deleted" },
        })
            .select("name projectType status totalRequest plan createdAt updatedAt")
            .sort({ totalRequest: -1 })
            .lean();

        const totalRequests = projects.reduce((s, p) => s + (p.totalRequest || 0), 0);
        const projectStats = projects.map(p => ({
            _id: p._id,
            name: p.name,
            projectType: p.projectType,
            status: p.status,
            plan: p.plan,
            totalRequest: p.totalRequest || 0,
            updatedAt: p.updatedAt,
        }));

        res.status(200).json({
            success: true,
            totalRequests,
            projectStats,
        });
    } catch (err) {
        console.error("getUsageStats error:", err);
        res.status(500).json({ success: false, message: "Failed to fetch usage stats" });
    }
};