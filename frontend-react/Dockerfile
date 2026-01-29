# Frontend Dockerfile
FROM node:20-alpine

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


# Expose port 80
EXPOSE 80

# Start development server on port 80
CMD ["npm", "run", "dev", "--", "--host", "--port", "80"]
