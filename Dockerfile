FROM node:20-alpine AS builder

COPY package

COPY package*.json ./

RUN npm install

COPY . .

RUN npm run build

FROM node:20-alpine AS runner

WORKDIR /app

EXPOSE 3000





