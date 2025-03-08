module.exports = {
  apps: [{
    name: 'blog-server',
    script: 'app.js',
    instances: 'max', // 自动根据可用CPU核心数设置实例数
    exec_mode: 'cluster', // 使用集群模式启动多个实例
    autorestart: true, // 自动重启
    watch: false, // 不监视文件变化
    max_memory_restart: '1G', // 当内存超过1G时自动重启
    env: {
      NODE_ENV: 'development',
    },
    env_production: {
      NODE_ENV: 'production',
    },
    log_date_format: 'YYYY-MM-DD HH:mm:ss',
    error_file: './logs/pm2/error.log',
    out_file: './logs/pm2/out.log',
    merge_logs: true,
    log_type: 'json',
  }],

  // 部署配置
  deploy: {
    production: {
      user: 'node',
      host: ['159.75.174.176'],
      ref: 'origin/main',
      repo: 'git@github.com:username/blog-server.git',
      path: '/var/www/blog-server',
      'post-deploy': 'npm install && npm run build && pm2 reload ecosystem.config.js --env production',
      env: {
        NODE_ENV: 'production'
      }
    }
  }
}; 