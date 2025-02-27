# 基础阶段
FROM node:20-alpine AS base
WORKDIR /app
ENV NODE_ENV=production
EXPOSE ${PORT:-8000}

# 依赖阶段
FROM base AS deps
COPY package*.json ./
RUN npm ci

# 开发阶段
FROM deps AS dev
ENV NODE_ENV=development
CMD ["npm", "run", "dev"]

# 生产阶段
FROM base AS prod
COPY --from=deps /app/node_modules ./node_modules
COPY . .

# 健康检查
HEALTHCHECK --interval=30s --timeout=3s \
    CMD wget --no-verbose --tries=1 --spider http://localhost:${PORT:-8000}/health || exit 1

# 使用非 root 用户运行
USER node

CMD ["npm", "start"]