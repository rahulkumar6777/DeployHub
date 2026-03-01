
FROM node:20.19.5 AS build

WORKDIR /app

COPY package*.json ./

RUN npm ci

COPY . .

ARG BUILD_CMD
RUN if [ -n "$BUILD_CMD" ]; then sh -c "$BUILD_CMD"; fi


FROM nginx:alpine


RUN rm /etc/nginx/conf.d/default.conf


COPY nginx.conf /etc/nginx/conf.d/default.conf


ARG BUILD_DIR=build
COPY --from=build /app/${BUILD_DIR} /usr/share/nginx/html

EXPOSE 80
CMD ["nginx", "-g", "daemon off;"]
