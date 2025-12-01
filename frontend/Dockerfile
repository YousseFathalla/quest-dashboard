# frontend/Dockerfile
FROM node:20-alpine AS builder
WORKDIR /app
COPY package.json ./
# Install ALL dependencies (including dev) to ensure build works
RUN npm install --legacy-peer-deps
COPY . .
RUN npm run build

FROM nginx:alpine
# ⚠️ CHECK THIS PATH: usually dist/frontend/browser or dist/frontend
COPY --from=builder /app/dist/frontend/browser /usr/share/nginx/html
# Copy custom nginx config (we will make this next)
COPY nginx.conf /etc/nginx/conf.d/default.conf
EXPOSE 80
CMD ["nginx", "-g", "daemon off;"]
