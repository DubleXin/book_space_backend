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
EXPOSE 7000
CMD ["npm", "run", "dev"]
# -------- Build stage (compiles TypeScript) --------
FROM base AS builder
ENV NODE_ENV=development
RUN npm ci
COPY . .
RUN npm run build
# -------- Production stage --------
FROM node:22-bullseye-slim AS production
WORKDIR /usr/src/app
ENV NODE_ENV=production
COPY package*.json ./
RUN npm ci --omit=dev
RUN apt-get update && apt-get install -y curl
COPY --from=builder /usr/src/app/dist ./dist
USER node
EXPOSE 7000
CMD ["npm", "run", "start"]
