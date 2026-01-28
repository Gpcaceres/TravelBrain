# Frontend Dockerfile
FROM node:20-alpine AS build

# Install git and git-lfs
RUN apk add --no-cache git git-lfs && \
    git lfs install

WORKDIR /app

# Copy package files
COPY package*.json ./

# Install dependencies
RUN npm install

# Copy source code
COPY . .

# Pull LFS files if any
RUN git lfs pull 2>/dev/null || true

# Build static files
RUN npm run build

# --- Production image ---
FROM nginx:alpine
COPY --from=build /app/dist /usr/share/nginx/html
EXPOSE 80
CMD ["nginx", "-g", "daemon off;"]
