# ============================================================
# Dockerfile  –  Frontend (React + Vite)  –  Practical 11
# ============================================================
# Uses a MULTI-STAGE build (supplementary requirement):
#
#   Stage 1 (build):  Install deps + run "vite build" → produces /dist
#   Stage 2 (serve):  Lightweight Alpine + serve package → serves /dist
#
# Why multi-stage?
#   The build stage needs Node, devDependencies, and source files.
#   None of those belong in the final production image.
#   The serve stage only copies the compiled /dist output,
#   keeping the final image tiny (< 100 MB vs ~900 MB).
# ============================================================

# ── Stage 1: Build ───────────────────────────────────────────
FROM node:18-alpine AS build

WORKDIR /app

# Cache npm install layer separately from source code
COPY package*.json ./
RUN npm install

# Copy source and build the production bundle
COPY . .
RUN npm run build
# Output: /app/dist  (static HTML/JS/CSS)

# ── Stage 2: Serve ───────────────────────────────────────────
FROM node:18-alpine AS serve

WORKDIR /app

# Install only the lightweight static-file server (global)
RUN npm install -g serve

# Copy only the compiled output from Stage 1 — nothing else
COPY --from=build /app/dist ./dist

# Document the port (actual publishing is in docker-compose.yml)
EXPOSE 5173

# Serve the /dist folder on port 5173
# -s enables SPA mode (rewrites 404s to index.html for React Router)
CMD ["serve", "-s", "dist", "-l", "5173"]
