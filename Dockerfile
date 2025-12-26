# syntax=docker/dockerfile:1.7

FROM node:20-alpine AS base
WORKDIR /app

# 1) Instala deps con caché de npm
COPY package*.json ./
RUN --mount=type=cache,target=/root/.npm npm ci --omit=dev

# 2) Copia el código
COPY . .

# 3) Variables por defecto
ENV NODE_ENV=production \
    PORT=8081

EXPOSE 8081

# 4) Arranca la app
# Si usas "npm start", cambia a: CMD ["npm","start"]
CMD ["node","index.js"]
