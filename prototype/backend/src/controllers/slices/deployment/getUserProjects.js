import { Model} from '../../../models/index.js'


export const getUserProjects = async (req, res) => {
  try {
    const projects = await Model.Project.find({
      owner: req.user._id,
      status: { $ne: "deleted" },
    })
      .select(
        "name projectType repoLink status totalRequest plan hascustomDomain customDomain totalBuilds subdomain createdAt updatedAt"
      )
      .sort({ createdAt: -1 })
      .lean();

    const formatted = projects.map((p) => ({
      _id:          p._id,
      name:         p.name,
      projectType:  p.projectType,
      repoLink:     p.repoLink,
      status:       p.status,
      totalRequest: p.totalRequest,
      totalBuilds:  p.totalBuilds,
      plan:         p.plan,
      domain:       p.hascustomDomain && p.customDomain
                      ? p.customDomain
                      : `${p.subdomain}.deployhub.online`,
      createdAt:    p.createdAt,
      updatedAt:    p.updatedAt,
    }));

    res.status(200).json({ success: true, projects: formatted });
  } catch (err) {
    console.error("getUserProjects error:", err);
    res.status(500).json({ success: false, message: "Failed to fetch projects" });
  }
};