import axios from "axios";

const deleteFromDockerHub = async (repo, token) => {
  try {
    await axios.delete(
      `https://hub.docker.com/v2/repositories/${repo}/`,
      {
        headers: { Authorization: `JWT ${token}` },
      }
    );
    console.log(`Deleted entire repository: ${repo}`);
  } catch (err) {
    console.error("Failed to delete repository:", err.message);
  }
}

export default deleteFromDockerHub;