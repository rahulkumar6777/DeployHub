import axios from "axios";

async function getDockerHubToken(username, password) {
  const res = await axios.post("https://hub.docker.com/v2/users/login/", {
    username,
    password,
  });
  return res.data.token;
}

const deleteFromDockerHub = async (repo, username, password) => {
  try {

    const token = await getDockerHubToken(username, password)

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