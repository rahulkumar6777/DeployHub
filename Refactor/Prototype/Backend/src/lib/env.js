import dotenv from "dotenv"

dotenv.config({ quiet: true })

export const ENV = {
    PORT: process.env.PORT,
    NODE_ENV: process.env.NODE_ENV,
    DEVELOPMENTDB_URI: process.env.DEVELOPMENTDB_URI,
    PRODUCTIONDB_URI: process.env.PRODUCTIONDB_URI,
    REDIS_HOST: process.env.REDIS_HOST,
    REDIS_PORT: process.env.REDIS_PORT,
    EMAIL_HOST: process.env.EMAIL_HOST,
    EMAIL_USER: process.env.EMAIL_USER,
    EMAIL_PASS: process.env.EMAIL_PASS,
    GITHUB_CLIENT_ID: process.env.GITHUB_CLIENT_ID,
    GITHUB_CLIENT_SECRET: process.env.GITHUB_CLIENT_SECRET,
    GITHUB_WEBHOOK_SECRET: process.env.GITHUB_WEBHOOK_SECRET,
    DEVLOAD_PROJECT_ID: process.env.DEVLOAD_PROJECT_ID,
    DEVLOAD_API_KEY: process.env.DEVLOAD_API_KEY,
    MINIO_PUBLIC_HOST: process.env.MINIO_PUBLIC_HOST,
    MINIO_ACCESS_KEY: process.env.MINIO_ACCESS_KEY,
    MINIO_SECRET_KEY: process.env.MINIO_SECRET_KEY,
    MINIO_BUCKET: process.env.MINIO_BUCKET,
    KEY_ID: process.env.KEY_ID,
    KEY_SECRET: process.env.KEY_SECRET,
    DOCKER_USERNAME: process.env.DOCKER_USERNAME,
    DOCKER_PASSWORD: process.env.DOCKER_PASSWORD,
    REFRESH_TOKEN_SECRET: process.env.REFRESH_TOKEN_SECRET,
    REFRESH_TOKEN_EXPIRY: process.env.REFRESH_TOKEN_EXPIRY,
    ACCESS_TOKEN_SECRET: process.env.ACCESS_TOKEN_SECRET,
    ACCESS_TOKEN_EXPIRY: process.env.ACCESS_TOKEN_EXPIRY,
    FRONTEND_URL: process.env.FRONTEND_URL
}




