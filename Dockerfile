FROM node:18-alpine as base

# 创建应用目录
WORKDIR /app

# 复制项目文件
COPY package*.json ./

# 开发阶段构建
FROM base as builder
RUN npm install
COPY . .
RUN mkdir -p logs/pm2

# 生产阶段构建
FROM base as production
ENV NODE_ENV=production
RUN npm install --production
RUN npm install -g pm2
COPY . .
RUN mkdir -p logs/pm2

# 安全措施
RUN addgroup -g 1001 -S nodejs
RUN adduser -S nodejs -u 1001
RUN chown -R nodejs:nodejs /app/logs
USER nodejs

# 暴露端口
EXPOSE 8000

# 启动命令
CMD ["pm2-runtime", "ecosystem.config.js", "--env", "production"]