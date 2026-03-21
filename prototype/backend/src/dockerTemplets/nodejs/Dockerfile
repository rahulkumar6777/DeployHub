FROM node:24-alpine AS builder

WORKDIR /app


COPY package*.json ./
RUN npm ci --omit=dev


COPY . .


FROM node:24-alpine

WORKDIR /app


COPY --from=builder /app /app


RUN npm cache clean --force

ARG APP_PORT=3000
ENV PORT=$APP_PORT
EXPOSE $APP_PORT

ARG START_CMD="node index.js"
ENV START_CMD=$START_CMD

CMD ["sh", "-c", "$START_CMD"]
