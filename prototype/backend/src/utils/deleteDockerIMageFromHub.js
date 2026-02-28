import axios from "axios";

async function deleteFromDockerHub(repo, tag, token) {
  try {
    await axios.delete(
      `https://hub.docker.com/v2/repositories/${repo}/tags/${tag}/`,
      {
        headers: {
          Authorization: `JWT ${token}`,
        },
      }
    );
    console.log(`Deleted ${repo}:${tag} from Docker Hub`);
  } catch (err) {
    console.error("Failed to delete from Docker Hub:", err.message);
  }
}

export default deleteFromDockerHub;