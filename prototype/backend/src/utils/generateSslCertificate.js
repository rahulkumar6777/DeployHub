import dns from "dns/promises"
import docker from "./docker.js"
import { SslCertificate } from "../models/slices/sslCertificate.js"
import { Model } from "../models/index.js"

const SERVER_IP = process.env.SERVER_IP

// DNS verify — A record check
async function isDomainPointingToServer(domain) {
  try {
    const records = await dns.resolve4(domain)
    return records.includes(SERVER_IP)
  } catch {
    return false
  }
}

export async function generateCertificate(domain, projectId, email = 'admin@deployhub.cloud') {

  const isValid = await isDomainPointingToServer(domain)
  if (!isValid) {
    throw new Error(`Domain ${domain} is not pointing to this server (${SERVER_IP})`)
  }

  const container = await docker.createContainer({
    Image: 'certbot/certbot', 
    Cmd: [
      'certonly',
      '--webroot',
      '--webroot-path', '/var/www/html',
      '--non-interactive',
      '--agree-tos',
      '--no-eff-email',
      '--email', email,
      '--cert-name', domain,
      '-d', domain,
    ],
    HostConfig: {
      Binds: [
        '/home/rahul/docker/letsencrypt:/etc/letsencrypt',
        '/home/rahul/docker/nginx/html:/var/www/html',
      ],
      AutoRemove: true,
      NetworkMode: 'proxy-net',
    }
  })

  await container.start()
  const result = await container.wait()

  if (result.StatusCode !== 0) {
    throw new Error(`Certbot failed with exit code ${result.StatusCode}`)
  }

  console.log(`[ssl] Certificate issued for ${domain}`)

  const issuedAt   = new Date()
  const expiresAt  = new Date(issuedAt)
  expiresAt.setDate(expiresAt.getDate() + 90)

  const nextRenewAt = new Date(expiresAt)
  nextRenewAt.setDate(nextRenewAt.getDate() - 5)

  const project = await Model.Project.findById(projectId).select('owner').lean()

  await SslCertificate.findOneAndUpdate(
    { domain },
    {
      $set: {
        userId:           project?.owner,
        projectId,
        domain,
        issuedAt:         issuedAt.toISOString(),
        expiresAt:        expiresAt.toISOString(),
        nextRenewAt,
        lastRenewAttempt: new Date(),
        status:           'active',
      }
    },
    { upsert: true, new: true }
  )

  return { issuedAt: issuedAt.toISOString(), expiresAt: expiresAt.toISOString() }
}



export async function renewCertificate(domain) {
  const container = await docker.createContainer({
    Image: 'certbot/certbot',
    Cmd: [
      'renew',
      '--cert-name', domain,
      '--non-interactive',
    ],
    HostConfig: {
      Binds: [
        '/home/rahul/docker/letsencrypt:/etc/letsencrypt',
        '/home/rahul/docker/nginx/html:/var/www/html',
      ],
      AutoRemove: true,
      NetworkMode: 'proxy-net',
    }
  })

  await container.start()
  const result = await container.wait()

  if (result.StatusCode !== 0) {
    throw new Error(`Certbot renew failed for ${domain}`)
  }


  const newExpiry   = new Date()
  newExpiry.setDate(newExpiry.getDate() + 90)
  const nextRenewAt = new Date(newExpiry)
  nextRenewAt.setDate(nextRenewAt.getDate() - 5)

  await SslCertificate.findOneAndUpdate(
    { domain },
    {
      $set: {
        issuedAt:         new Date().toISOString(),
        expiresAt:        newExpiry.toISOString(),
        nextRenewAt,
        lastRenewAttempt: new Date(),
        status:           'active',
      }
    }
  )

  console.log(`[ssl] Certificate renewed for ${domain}`)
  return { expiresAt: newExpiry.toISOString() }
}