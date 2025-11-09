# -------- Base image --------
FROM node:22-bullseye-slim AS base
WORKDIR /usr/src/app
RUN apt-get update && apt-get install -y curl
COPY package*.json ./
RUN npm install

COPY . .

CMD ["npm", "run", "seed-books"]
