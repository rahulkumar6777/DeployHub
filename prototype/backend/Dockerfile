FROM node:20-alpine AS builder
WORKDIR /app

# Install git and any build tools
RUN apk add --no-cache git openssh

COPY package*.json ./
RUN npm ci --omit=dev

COPY . .

FROM node:20-alpine
WORKDIR /app

RUN apk add --no-cache git openssh

ENV NODE_ENV=production

COPY --from=builder /app /app

RUN npm cache clean --force

EXPOSE 6700
CMD ["npm", "start"]