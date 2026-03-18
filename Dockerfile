FROM node:20-alpine AS builder

COPY package

COPY . .

FROM node:

COPY . .

RUN npm run build

FROM node:20-alpine AS runner

WORKDIR /app

RUN npm install -g serve

COPY --from=builder /app/dist /app/dist



CMD ["serve", "-s", "dist", "-l", "3000"]
