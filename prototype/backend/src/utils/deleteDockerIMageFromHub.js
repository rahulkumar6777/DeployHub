import axios from 'axios';
import { getDockerHubToken } from './getDockerHubToken';


let dockerHubToken = null;


async function ensureDockerHubToken(username, password) {
  if (!dockerHubToken) {
    dockerHubToken = await getDockerHubToken(username, password);
  }
  return dockerHubToken;
}

export async function deleteRepository(repo, username, password) {
  try {
    const token = await ensureDockerHubToken(username, password);

    await axios.delete(`https://hub.docker.com/v2/repositories/${repo}/`, {
      headers: { Authorization: `JWT ${token}` },
    });

    console.log(`Deleted entire repository: ${repo}`);
  } catch (err) {
    // if token expired, retry once
    if (err.response?.status === 401) {
      dockerHubToken = await getDockerHubToken(username, password);
      return deleteRepository(repo, username, password);
    }
    console.error("Failed to delete repository:", err.message);
  }
}