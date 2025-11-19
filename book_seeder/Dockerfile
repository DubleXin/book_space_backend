# -------- Base image --------
FROM node:22-bullseye-slim AS base
WORKDIR /usr/src/app
RUN apt-get update && apt-get install -y curl
COPY package*.json ./

# -------- Development stage --------
FROM base AS dev
ENV NODE_ENV=development
RUN npm install
COPY . .
CMD ["npm", "run", "seed-books"]

# -------- Build stage --------
FROM base AS builder
ENV NODE_ENV=production
RUN npm ci
COPY . .
RUN npm run build || echo "No build script - skipping"

# -------- Production stage --------
FROM node:22-bullseye-slim AS production
WORKDIR /usr/src/app
ENV NODE_ENV=production
COPY package*.json ./
RUN npm ci --only=production

COPY . .

CMD ["npm", "run", "seed-books"]
