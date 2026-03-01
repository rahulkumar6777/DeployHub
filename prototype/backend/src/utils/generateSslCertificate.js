import dns from "dns/promises";
import docker from "./docker.js";

const SERVER_IP = process.env.SERVER_IP;

async function isDomainPointingToServer(domain) {
  try {
    const records = await dns.resolve4(domain);
    return records.includes(SERVER_IP);
  } catch {
    return false;
  }
}

export async function generateCertificate(domain, email) {

  const isValid = await isDomainPointingToServer(domain);

  if (!isValid) {
    throw new Error(`Domain ${domain} does not point to this server.`);
  }

  const container = await docker.createContainer({
    Image: "certbot/dns-cloudflare",
    Cmd: [
      "certonly",
      "--dns-cloudflare",
      "--dns-cloudflare-credentials",
      "/cf.ini",
      "--dns-cloudflare-propagation-seconds",
      "30",
      "-d",
      domain,
      "-d",
      `*.${domain}`,
      "--email",
      email,
      "--agree-tos",
      "--no-eff-email"
    ],
    HostConfig: {
      Binds: [
        "/home/rahul/docker/letsencrypt:/etc/letsencrypt",
        "/home/rahul/secrets/cf.ini:/cf.ini:ro"
      ],
      AutoRemove: true
    }
  });

  await container.start();
  await container.wait();

  console.log("Certificate generation finished.");
}