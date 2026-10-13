# syntax=docker/dockerfile:1
FROM node:20-slim AS build
WORKDIR /app
ENV CI=true
COPY package.json ./
RUN --mount=type=cache,target=/root/.npm npm install --prefer-offline --no-audit --no-fund --progress=false
COPY . .
RUN npm run build

FROM nginx:alpine
COPY --from=build /app/dist /usr/share/nginx/html
COPY nginx.conf /etc/nginx/conf.d/default.conf
COPY docker-entrypoint.d/40-write-config.sh /docker-entrypoint.d/40-write-config.sh
RUN chmod +x /docker-entrypoint.d/40-write-config.sh
EXPOSE 80
LABEL pdc.port="80"
