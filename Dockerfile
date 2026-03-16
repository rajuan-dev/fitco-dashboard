FROM node:22-alpine AS build

WORKDIR /app

ARG VITE_API_BASE_URL=/
ARG VITE_API_TIMEOUT_MS=15000
ARG VITE_API_USE_MOCKS_ON_ERROR=false

ENV VITE_API_BASE_URL=${VITE_API_BASE_URL}
ENV VITE_API_TIMEOUT_MS=${VITE_API_TIMEOUT_MS}
ENV VITE_API_USE_MOCKS_ON_ERROR=${VITE_API_USE_MOCKS_ON_ERROR}

COPY package*.json ./
RUN npm ci

COPY . .
RUN npm run build

FROM nginxinc/nginx-unprivileged:1.27-alpine AS runner

USER root

COPY --from=build /app/dist /usr/share/nginx/html
RUN printf "server {\n  listen 8080;\n  server_name _;\n\n  root /usr/share/nginx/html;\n  index index.html;\n\n  location / {\n    try_files \$uri \$uri/ /index.html;\n  }\n}\n" > /etc/nginx/conf.d/default.conf

USER 101

EXPOSE 8080

CMD ["nginx", "-g", "daemon off;"]
