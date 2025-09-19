// EdgeOne.ai 部署配置文件
export default {
  // 项目基本信息
  name: 'bmnr-tracker',
  version: '1.0.0',
  
  // 构建配置
  build: {
    // Node.js 应用无需构建步骤
    command: 'echo "No build needed for Node.js app"',
    outputDirectory: './',
    publishDirectory: './'
  },
  
  // 运行时配置
  runtime: {
    // 指定 Node.js 版本
    nodeVersion: '18.x',
    // 启动命令
    startCommand: 'node server.js'
  },
  
  // 环境变量
  env: {
    NODE_ENV: 'production',
    TARGET_URL: 'https://trackbmnr.com'
  },
  
  // 路由配置
  routes: [
    // 健康检查
    {
      src: '/health',
      dest: '/server.js',
      methods: ['GET']
    },
    // API 路由
    {
      src: '/api/(.*)',
      dest: '/server.js',
      methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS']
    },
    // 代理路由
    {
      src: '/proxy/(.*)',
      dest: '/server.js',
      methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS']
    },
    // 根路由
    {
      src: '/(.*)',
      dest: '/server.js',
      methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS']
    }
  ],
  
  // 函数配置
  functions: {
    'server.js': {
      // 最大执行时间 (秒)
      timeout: 30,
      // 内存限制 (MB)
      memory: 256,
      // 并发限制
      maxConcurrency: 100
    }
  },
  
  // 静态资源配置
  staticFiles: {
    // 缓存策略
    headers: {
      '**/*.{js,css,png,jpg,jpeg,gif,ico,svg}': {
        'Cache-Control': 'public, max-age=86400' // 1天
      },
      '**/*.{html,json}': {
        'Cache-Control': 'public, max-age=3600' // 1小时
      }
    }
  },
  
  // 安全配置
  security: {
    headers: {
      // 通用安全头
      'X-Content-Type-Options': 'nosniff',
      'X-XSS-Protection': '1; mode=block',
      'Referrer-Policy': 'strict-origin-when-cross-origin',
      
      // 代理专用 - 允许iframe嵌入
      '/proxy/**': {
        'X-Frame-Options': 'ALLOWALL',
        'Access-Control-Allow-Origin': '*',
        'Access-Control-Allow-Methods': 'GET, POST, PUT, DELETE, OPTIONS',
        'Access-Control-Allow-Headers': 'Content-Type, Authorization, X-Requested-With'
      }
    }
  },
  
  // 重定向配置
  redirects: [
    {
      source: '/favicon.ico',
      destination: '/api/status',
      statusCode: 204
    }
  ],
  
  // 错误页面
  errorPages: {
    404: {
      destination: '/404.html',
      statusCode: 404
    },
    500: {
      destination: '/500.html', 
      statusCode: 500
    }
  },
  
  // 性能优化
  optimization: {
    // 启用 Gzip 压缩
    compress: true,
    // 启用 HTTP/2
    http2: true,
    // 启用边缘缓存
    edgeCache: true,
    // 预加载关键资源
    preload: [
      '/server.js'
    ]
  },
  
  // 监控和日志
  monitoring: {
    // 启用性能监控
    performance: true,
    // 启用错误跟踪
    errorTracking: true,
    // 日志级别
    logLevel: 'info'
  },
  
  // 地域配置
  regions: [
    'auto', // 自动选择最优区域
    'asia-east1', // 亚洲东部
    'us-west1', // 美国西部
    'europe-west1' // 欧洲西部
  ]
};