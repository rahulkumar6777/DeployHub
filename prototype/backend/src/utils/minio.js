import { createRequire } from 'module'
const require = createRequire(import.meta.url)
const Minio   = require('minio')

const BUCKET = process.env.MINIO_BUCKET || 'deployhub-logs'


const client = new Minio.Client({
  endPoint:  process.env.MINIO_INTERNAL_HOST || 'minio',
  port:      9000,
  useSSL:    false,
  accessKey: process.env.MINIO_ACCESS_KEY,
  secretKey: process.env.MINIO_SECRET_KEY,
})

export async function ensureBucket() {
  const exists = await client.bucketExists(BUCKET)
  if (!exists) {
    await client.makeBucket(BUCKET)
    console.log(`[minio] bucket "${BUCKET}" created`)
  }

  try {
    const policy = JSON.stringify({
      Version: '2012-10-17',
      Statement: [{
        Effect:    'Allow',
        Principal: '*',
        Action:    ['s3:GetObject'],
        Resource:  [`arn:aws:s3:::${BUCKET}/*`],
      }],
    })
    await client.setBucketPolicy(BUCKET, policy)
    console.log(`[minio] public read policy applied`)
  } catch (err) {
    console.error('[minio] policy error (non-fatal):', err.message)
  }
}

export async function uploadLog(objectName, content) {
  const buf = Buffer.isBuffer(content) ? content : Buffer.from(content, 'utf-8')
  await client.putObject(BUCKET, objectName, buf, buf.length, {
    'Content-Type': 'text/plain; charset=utf-8',
  })
}


export function buildLogUrl(objectName) {
  const publicHost = process.env.MINIO_PUBLIC_HOST || 'console.cloudcoderhub.in'
  return `https://${publicHost}/${BUCKET}/${objectName}`
}

export default client