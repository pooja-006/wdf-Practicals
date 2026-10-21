# ============================================================
# Dockerfile  –  Backend (Node/Express)  –  Practical 11
# ============================================================
# Why node:18-alpine?
#   • Same LTS version used throughout the course
#   • Alpine base keeps the image small (~50 MB vs ~900 MB for full node:18)

FROM node:18-alpine

# Working directory inside the container
WORKDIR /app

# Copy manifest files FIRST so Docker can cache the npm install layer.
# If only source code changes (not package.json), this layer is reused,
# making rebuilds much faster.
COPY package*.json ./

# Install production + dev dependencies inside the container.
# node_modules are NEVER copied from the host (see .dockerignore).
RUN npm install

# Copy the rest of the source after npm install to maximise layer caching
COPY . .

# Document the port this service listens on (informational; actual
# publishing is done in docker-compose.yml via the ports mapping)
EXPOSE 5000

# Start the Practical 10 server (includes event-driven architecture)
CMD ["node", "server_p10.js"]
