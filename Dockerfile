# 构建阶段
FROM node:20-alpine as builder

WORKDIR /app

COPY package*.json ./
RUN npm ci

COPY . .

# 运行阶段
FROM node:20-alpine

WORKDIR /app

COPY --from=builder /app/package*.json ./
RUN npm ci --only=production

COPY --from=builder /app ./

# 暴露容器端口，如果环境变量PORT未设置则默认使用3000端口
EXPOSE ${PORT:-8000}

CMD ["npm", "start"] 