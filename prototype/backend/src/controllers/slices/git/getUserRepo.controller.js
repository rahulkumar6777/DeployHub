import axios from "axios";

export const getUserRepos = async (req, res) => {
  try {
    if (req.user.provider !== "github") {
      return res.status(400).json({
        message: "You are not logged in with github",
      });
    }
    const githubAccessToken = req.user.githubAccessToken;
    if (!githubAccessToken) {
      return res.status(401).json({ message: "GitHub token missing" });
    }

    // Fetch repos from GitHub
    const reposRes = await axios.get("https://api.github.com/user/repos", {
      headers: {
        Authorization: `Bearer ${githubAccessToken}`,
        Accept: "application/vnd.github+json",
      },
      params: {
        visibility: "all",
        affiliation: "owner,collaborator",
        per_page: 100,
      },
    });

    const repos = reposRes.data.map((repo) => ({
      id: repo.id,
      name: repo.name,
      full_name: repo.full_name,
      private: repo.private,
      html_url: repo.html_url,
      description: repo.description,
      default_branch: repo.default_branch,
    }));

    return res.json({ repos });
  } catch (error) {
    return res.status(500).json({
      error: "Internal Server Error",
    });
  }
};
