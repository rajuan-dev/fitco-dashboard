FROM node:22-alpine AS build

WORKDIR /app

ARG VITE_API_BASE_URL=http://localhost:5000
ARG VITE_API_TIMEOUT_MS=15000
ARG VITE_API_USE_MOCKS_ON_ERROR=false

ENV VITE_API_BASE_URL=$VITE_API_BASE_URL
ENV VITE_API_TIMEOUT_MS=$VITE_API_TIMEOUT_MS
ENV VITE_API_USE_MOCKS_ON_ERROR=$VITE_API_USE_MOCKS_ON_ERROR

COPY package*.json ./
RUN npm ci

COPY . .
RUN npm run build

FROM nginx:1.27-alpine AS runner

COPY nginx.conf /etc/nginx/conf.d/default.conf
COPY --from=build /app/dist /usr/share/nginx/html

EXPOSE 80

CMD ["nginx", "-g", "daemon off;"]
