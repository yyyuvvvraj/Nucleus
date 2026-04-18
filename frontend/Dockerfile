# Stage 1: Build
FROM node:20-slim AS build
WORKDIR /app
COPY package*.json ./
RUN npm install
COPY . .
# Set build-time env variable (can be overridden in docker-compose)
ARG VITE_API_URL=http://localhost:5001/api
ENV VITE_API_URL=$VITE_API_URL
RUN npm run build

# Stage 2: Serve with Nginx
FROM nginx:alpine
COPY --from=build /app/dist /usr/share/nginx/html
# Add a custom nginx config if needed, but default is usually fine for simple SPA
EXPOSE 80
CMD ["nginx", "-g", "daemon off;"]
