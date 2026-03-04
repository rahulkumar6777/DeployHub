import axios from "axios";

export async function getDockerHubToken(username, password) {
  const res = await axios.post("https://hub.docker.com/v2/users/login/", {
    username,
    password,
  });
  return res.data.token;
}