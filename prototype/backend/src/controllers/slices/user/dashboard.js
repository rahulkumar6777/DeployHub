import { Model } from '../../../models/index.js';


export const getDashboardStats = async (req, res) => {
    try {
        const userId = req.user._id;

        const projects = await Model.Project.find({
            owner: userId,
            status: { $ne: "deleted" },
        }).select(
            "name projectType status totalRequest totalBuilds plan subdomain hascustomDomain customDomain createdAt updatedAt"
        )
            .sort({ updatedAt: -1 })
            .lean();


        const totalProjects = projects.length;
        const liveCount = projects.filter(p => p.status === "live").length;
        const stoppedCount = projects.filter(p => p.status === "stopped").length;
        const staticCount = projects.filter(p => p.projectType === "Static" || p.projectType === "static").length;
        const nodeCount = projects.filter(p => p.projectType === "node").length;


        const totalRequests = projects.reduce((sum, p) => sum + (p.totalRequest || 0), 0);


        const recentProjects = projects.slice(0, 4).map(p => ({
            _id: p._id,
            name: p.name,
            projectType: p.projectType,
            status: p.status,
            plan: p.plan,
            totalRequest: p.totalRequest || 0,
            totalBuilds: p.totalBuilds || 0,
            domain: p.hascustomDomain && p.customDomain
                ? p.customDomain
                : `${p.subdomain}.deployhub.online`,
            updatedAt: p.updatedAt,
            createdAt: p.createdAt,
        }));

        res.status(200).json({
            success: true,
            stats: {
                totalProjects,
                liveCount,
                stoppedCount,
                staticCount,
                nodeCount,
                totalRequests,
            },
            recentProjects,
        });
    } catch (err) {
        console.error("getDashboardStats error:", err);
        res.status(500).json({ success: false, message: "Failed to fetch dashboard stats" });
    }
};