import express from 'express';
import { createProxyMiddleware } from 'http-proxy-middleware';
import * as cheerio from 'cheerio';
import cors from 'cors';

const app = express();
const PORT = process.env.PORT || 3000;
const TARGET_URL = process.env.TARGET_URL || 'https://trackbmnr.com';

// CORS配置，支持EdgeOne.ai的域名
app.use(cors({
  origin: true,
  credentials: true,
  methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
  allowedHeaders: ['Content-Type', 'Authorization', 'X-Requested-With']
}));

// 解析JSON请求体
app.use(express.json());

// 自定义CSS覆盖黑色主题 - EdgeOne优化版本
const customCSS = `
<style>
  /* EdgeOne.ai 优化版本 - 更温和的主题覆盖 */
  :root {
    --bg-primary: #ffffff;
    --bg-secondary: #f8f9fa;
    --text-primary: #333333;
    --text-secondary: #666666;
    --border-color: #dee2e6;
    --shadow-color: rgba(0,0,0,0.1);
  }
  
  body {
    background-color: var(--bg-primary) !important;
    color: var(--text-primary) !important;
    font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif;
  }
  
  /* 深色背景替换 */
  [style*="background-color: black"],
  [style*="background-color: #000000"],
  [style*="background-color: #000"],
  [style*="background-color: rgb(0, 0, 0)"],
  [style*="background-color: rgb(0,0,0)"] {
    background-color: var(--bg-primary) !important;
  }
  
  /* 深色文字替换 */
  [style*="color: white"],
  [style*="color: #ffffff"],
  [style*="color: #fff"],
  [style*="color: rgb(255, 255, 255)"],
  [style*="color: rgb(255,255,255)"] {
    color: var(--text-primary) !important;
  }
  
  /* 常见深色主题类名优化 */
  .dark-theme,
  .dark-mode,
  .bg-dark,
  .bg-black {
    background-color: var(--bg-secondary) !important;
    color: var(--text-primary) !important;
  }
  
  .text-white {
    color: var(--text-primary) !important;
  }
  
  /* 表单元素优化 */
  input[style*="background-color: black"],
  textarea[style*="background-color: black"],
  select[style*="background-color: black"] {
    background-color: var(--bg-primary) !important;
    color: var(--text-primary) !important;
    border: 1px solid var(--border-color) !important;
    border-radius: 4px;
    padding: 8px 12px;
  }
  
  /* 按钮优化 */
  button[style*="background-color: black"],
  .btn[style*="background-color: black"] {
    background-color: #007bff !important;
    color: #ffffff !important;
    border: none;
    border-radius: 4px;
    padding: 8px 16px;
    cursor: pointer;
    transition: background-color 0.2s ease;
  }
  
  button[style*="background-color: black"]:hover,
  .btn[style*="background-color: black"]:hover {
    background-color: #0056b3 !important;
  }
  
  /* 链接优化 */
  a[style*="color: white"] {
    color: #007bff !important;
    text-decoration: none;
  }
  
  a[style*="color: white"]:hover {
    color: #0056b3 !important;
    text-decoration: underline;
  }
  
  /* 边框和阴影优化 */
  [style*="border-color: black"] {
    border-color: var(--border-color) !important;
  }
  
  [style*="box-shadow"][style*="black"] {
    box-shadow: 0 2px 4px var(--shadow-color) !important;
  }
  
  /* 响应式优化 */
  @media (max-width: 768px) {
    body {
      font-size: 14px;
      line-height: 1.5;
    }
    
    input, textarea, select, button {
      font-size: 16px; /* 防止iOS缩放 */
    }
  }
  
  /* 性能优化 */
  * {
    will-change: auto;
  }
  
  img {
    max-width: 100%;
    height: auto;
  }
</style>
`;

// HTML响应拦截和修改中间件
const modifyResponse = (req, res, next) => {
  const originalSend = res.send;
  
  res.send = function(data) {
    // 只处理HTML响应
    if (res.get('Content-Type') && res.get('Content-Type').includes('text/html')) {
      try {
        const $ = cheerio.load(data);
        
        // 注入自定义CSS
        $('head').append(customCSS);
        
        // 添加viewport meta标签以支持移动端
        if (!$('meta[name="viewport"]').length) {
          $('head').prepend('<meta name="viewport" content="width=device-width, initial-scale=1.0, maximum-scale=1.0, user-scalable=no">');
        }
        
        // 添加性能优化标签
        $('head').append('<meta name="referrer" content="no-referrer-when-downgrade">');
        $('head').append('<link rel="dns-prefetch" href="//trackbmnr.com">');
        
        // 修改所有相对URL为代理URL
        $('link, script, img').each((i, elem) => {
          const $elem = $(elem);
          ['href', 'src'].forEach(attr => {
            const url = $elem.attr(attr);
            if (url && !url.startsWith('http') && !url.startsWith('//') && !url.startsWith('data:')) {
              $elem.attr(attr, `/proxy${url.startsWith('/') ? '' : '/'}${url}`);
            } else if (url && url.startsWith(TARGET_URL)) {
              $elem.attr(attr, url.replace(TARGET_URL, '/proxy'));
            }
          });
        });
        
        // 修改表单action属性
        $('form').each((i, elem) => {
          const $elem = $(elem);
          const action = $elem.attr('action');
          if (action && !action.startsWith('http') && !action.startsWith('//')) {
            $elem.attr('action', `/proxy${action.startsWith('/') ? '' : '/'}${action}`);
          }
        });
        
        // 修改所有内部链接
        $('a[href]').each((i, elem) => {
          const $elem = $(elem);
          const href = $elem.attr('href');
          if (href && !href.startsWith('http') && !href.startsWith('//') && !href.startsWith('#') && !href.startsWith('mailto:') && !href.startsWith('tel:')) {
            $elem.attr('href', `/proxy${href.startsWith('/') ? '' : '/'}${href}`);
          } else if (href && href.startsWith(TARGET_URL)) {
            $elem.attr('href', href.replace(TARGET_URL, '/proxy'));
          }
        });
        
        data = $.html();
      } catch (error) {
        console.error('Error modifying HTML:', error);
        // 发生错误时，仍然返回原始数据
      }
    }
    
    originalSend.call(this, data);
  };
  
  next();
};

// 应用HTML修改中间件
app.use(modifyResponse);

// 代理中间件配置 - EdgeOne优化
const proxyMiddleware = createProxyMiddleware({
  target: TARGET_URL,
  changeOrigin: true,
  pathRewrite: { '^/proxy': '' },
  timeout: 30000, // 30秒超时
  proxyTimeout: 30000,
  followRedirects: true,
  secure: true,
  onProxyRes: (proxyRes, req, res) => {
    // 移除阻止iframe嵌入的响应头
    delete proxyRes.headers['x-frame-options'];
    delete proxyRes.headers['content-security-policy'];
    delete proxyRes.headers['x-content-type-options'];
    delete proxyRes.headers['strict-transport-security'];
    
    // 设置CORS头
    proxyRes.headers['access-control-allow-origin'] = '*';
    proxyRes.headers['access-control-allow-methods'] = 'GET, POST, PUT, DELETE, OPTIONS';
    proxyRes.headers['access-control-allow-headers'] = 'Content-Type, Authorization, X-Requested-With';
    proxyRes.headers['access-control-allow-credentials'] = 'true';
    
    // 添加性能优化头
    if (req.url.match(/\.(css|js|png|jpg|jpeg|gif|ico|svg)$/)) {
      proxyRes.headers['cache-control'] = 'public, max-age=86400'; // 1天缓存
    }
    
    // 添加安全头
    proxyRes.headers['x-content-type-options'] = 'nosniff';
    proxyRes.headers['x-xss-protection'] = '1; mode=block';
    proxyRes.headers['referrer-policy'] = 'strict-origin-when-cross-origin';
  },
  onProxyReq: (proxyReq, req, res) => {
    // 添加自定义请求头
    proxyReq.setHeader('User-Agent', 'BMNR-Tracker-Proxy/1.0');
    
    // 处理POST请求体
    if (req.body && Object.keys(req.body).length > 0) {
      const bodyData = JSON.stringify(req.body);
      proxyReq.setHeader('Content-Type', 'application/json');
      proxyReq.setHeader('Content-Length', Buffer.byteLength(bodyData));
      proxyReq.write(bodyData);
    }
  },
  onError: (err, req, res) => {
    console.error('Proxy error:', err.message);
    if (!res.headersSent) {
      res.status(502).json({
        error: 'Proxy Error',
        message: 'Unable to connect to target server',
        timestamp: new Date().toISOString()
      });
    }
  }
});

// 设置代理路由
app.use('/proxy', proxyMiddleware);

// 根路径提供优化的测试页面
app.get('/', (req, res) => {
  res.send(`
    <!DOCTYPE html>
    <html lang="zh-CN">
    <head>
        <meta charset="UTF-8">
        <meta name="viewport" content="width=device-width, initial-scale=1.0">
        <meta name="description" content="BMNR Tracker Proxy Server - EdgeOne.ai Optimized">
        <title>BMNR Tracker - EdgeOne部署版</title>
        <style>
            * {
                margin: 0;
                padding: 0;
                box-sizing: border-box;
            }
            
            body {
                font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif;
                line-height: 1.6;
                color: #333;
                background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
                min-height: 100vh;
                display: flex;
                align-items: center;
                justify-content: center;
                padding: 20px;
            }
            
            .container {
                background: rgba(255, 255, 255, 0.95);
                backdrop-filter: blur(10px);
                padding: 40px;
                border-radius: 20px;
                box-shadow: 0 20px 40px rgba(0, 0, 0, 0.1);
                max-width: 800px;
                width: 100%;
                text-align: center;
            }
            
            h1 {
                font-size: 2.5rem;
                font-weight: 700;
                margin-bottom: 10px;
                background: linear-gradient(135deg, #667eea, #764ba2);
                -webkit-background-clip: text;
                -webkit-text-fill-color: transparent;
                background-clip: text;
            }
            
            .subtitle {
                font-size: 1.1rem;
                color: #666;
                margin-bottom: 30px;
            }
            
            .features {
                display: grid;
                grid-template-columns: repeat(auto-fit, minmax(200px, 1fr));
                gap: 20px;
                margin: 30px 0;
                text-align: left;
            }
            
            .feature {
                background: #f8f9fa;
                padding: 20px;
                border-radius: 10px;
                border-left: 4px solid #667eea;
            }
            
            .feature h3 {
                color: #333;
                margin-bottom: 10px;
                font-size: 1.1rem;
            }
            
            .feature p {
                color: #666;
                font-size: 0.9rem;
            }
            
            .proxy-section {
                background: #e3f2fd;
                padding: 25px;
                border-radius: 10px;
                margin: 30px 0;
            }
            
            .proxy-url {
                font-family: 'Monaco', 'Menlo', monospace;
                background: #333;
                color: #0f0;
                padding: 15px;
                border-radius: 8px;
                margin: 15px 0;
                font-size: 1.1rem;
                letter-spacing: 1px;
            }
            
            .btn {
                display: inline-block;
                background: linear-gradient(135deg, #667eea, #764ba2);
                color: white;
                padding: 12px 30px;
                text-decoration: none;
                border-radius: 25px;
                font-weight: 600;
                transition: transform 0.2s ease, box-shadow 0.2s ease;
                margin: 10px;
            }
            
            .btn:hover {
                transform: translateY(-2px);
                box-shadow: 0 10px 20px rgba(102, 126, 234, 0.3);
            }
            
            .iframe-container {
                margin-top: 30px;
                border-radius: 10px;
                overflow: hidden;
                box-shadow: 0 10px 30px rgba(0, 0, 0, 0.1);
            }
            
            iframe {
                width: 100%;
                height: 600px;
                border: none;
            }
            
            .status {
                display: inline-block;
                background: #4caf50;
                color: white;
                padding: 5px 15px;
                border-radius: 20px;
                font-size: 0.9rem;
                margin-bottom: 20px;
            }
            
            @media (max-width: 768px) {
                .container {
                    padding: 25px;
                    margin: 10px;
                }
                
                h1 {
                    font-size: 2rem;
                }
                
                .features {
                    grid-template-columns: 1fr;
                }
                
                iframe {
                    height: 400px;
                }
            }
        </style>
    </head>
    <body>
        <div class="container">
            <div class="status">✅ EdgeOne.ai 部署就绪</div>
            <h1>BMNR Tracker</h1>
            <p class="subtitle">EdgeOne.ai 优化版代理服务器</p>
            
            <div class="features">
                <div class="feature">
                    <h3>🚀 全球加速</h3>
                    <p>基于EdgeOne的3200+边缘节点，提供毫秒级响应</p>
                </div>
                <div class="feature">
                    <h3>🎨 主题优化</h3>
                    <p>自动转换深色主题为浅色，提升可读性</p>
                </div>
                <div class="feature">
                    <h3>📱 移动友好</h3>
                    <p>响应式设计，完美适配各种设备屏幕</p>
                </div>
                <div class="feature">
                    <h3>🔒 安全代理</h3>
                    <p>移除iframe限制，支持跨域访问</p>
                </div>
            </div>
            
            <div class="proxy-section">
                <h3>🔗 代理访问地址</h3>
                <div class="proxy-url">${req.protocol}://${req.get('host')}/proxy</div>
                <p>将此URL用作iframe的src属性即可嵌入trackbmnr.com内容</p>
            </div>
            
            <a href="/proxy" class="btn">🔍 访问代理页面</a>
            <a href="/health" class="btn">💊 健康检查</a>
            
            <div class="iframe-container">
                <iframe src="/proxy" title="BMNR Tracker Proxy"></iframe>
            </div>
        </div>
        
        <script>
            // 性能监控
            window.addEventListener('load', () => {
                console.log('🚀 BMNR Tracker EdgeOne版本已加载');
                console.log('📊 页面加载时间:', performance.now().toFixed(2) + 'ms');
            });
            
            // 错误监控
            window.addEventListener('error', (e) => {
                console.error('❌ 页面错误:', e.error);
            });
        </script>
    </body>
    </html>
  `);
});

// API端点
app.get('/api/status', (req, res) => {
  res.json({
    status: 'active',
    version: '1.0.0',
    platform: 'EdgeOne.ai',
    target: TARGET_URL,
    timestamp: new Date().toISOString(),
    uptime: process.uptime(),
    memory: process.memoryUsage(),
    node_version: process.version
  });
});

// 健康检查端点 - EdgeOne优化
app.get('/health', (req, res) => {
  const healthData = {
    status: 'healthy',
    timestamp: new Date().toISOString(),
    uptime: Math.floor(process.uptime()),
    memory: {
      used: Math.round(process.memoryUsage().heapUsed / 1024 / 1024),
      total: Math.round(process.memoryUsage().heapTotal / 1024 / 1024)
    },
    env: {
      node_version: process.version,
      platform: process.platform,
      target_url: TARGET_URL
    }
  };
  
  res.json(healthData);
});

// Favicon处理
app.get('/favicon.ico', (req, res) => {
  res.status(204).end();
});

// 调试路由
app.get('/debug', (req, res) => {
  const debugInfo = {
    request: {
      url: req.url,
      method: req.method,
      headers: req.headers,
      path: req.path,
      originalUrl: req.originalUrl
    },
    server: {
      platform: 'EdgeOne Express Server',
      node_version: process.version,
      uptime: process.uptime(),
      memory: process.memoryUsage(),
      env: {
        NODE_ENV: process.env.NODE_ENV,
        TARGET_URL: TARGET_URL,
        PORT: PORT
      }
    },
    dependencies: {
      cheerio: typeof cheerio,
      express: typeof express,
      createProxyMiddleware: typeof createProxyMiddleware
    },
    timestamp: new Date().toISOString()
  };

  res.send(`
    <!DOCTYPE html>
    <html>
    <head>
      <title>EdgeOne Express 调试信息</title>
      <meta charset="utf-8">
      <style>
        body { font-family: monospace; padding: 20px; background: #f5f5f5; }
        pre { background: #fff; padding: 15px; border-radius: 5px; border: 1px solid #ddd; overflow-x: auto; }
        h1 { color: #333; }
        .nav { margin-bottom: 20px; }
        .nav a { background: #007bff; color: white; padding: 8px 16px; text-decoration: none; border-radius: 4px; margin-right: 10px; }
      </style>
    </head>
    <body>
      <h1>🔍 EdgeOne Express 调试信息</h1>
      <div class="nav">
        <a href="/">🏠 首页</a>
        <a href="/proxy">🔗 代理</a>
        <a href="/health">💊 健康检查</a>
      </div>
      <pre>${JSON.stringify(debugInfo, null, 2)}</pre>
    </body>
    </html>
  `);
});

// 错误处理中间件
app.use((err, req, res, next) => {
  console.error('Application error:', err);
  res.status(500).json({
    error: 'Internal Server Error',
    message: err.message,
    timestamp: new Date().toISOString()
  });
});

// 404处理
app.use((req, res) => {
  res.status(404).json({
    error: 'Not Found',
    message: `Path '${req.path}' not found`,
    available_paths: ['/', '/proxy', '/health', '/debug', '/api/status'],
    timestamp: new Date().toISOString()
  });
});

// 启动服务器
const server = app.listen(PORT, () => {
  console.log(\`🚀 BMNR Tracker EdgeOne版服务器启动成功!\`);
  console.log(\`📍 服务器地址: http://localhost:\${PORT}\`);
  console.log(\`🎯 目标网站: \${TARGET_URL}\`);
  console.log(\`🔗 代理地址: http://localhost:\${PORT}/proxy\`);
  console.log(\`💊 健康检查: http://localhost:\${PORT}/health\`);
  console.log(\`⚡ 环境: \${process.env.NODE_ENV || 'development'}\`);
});

// 优雅关闭
process.on('SIGTERM', () => {
  console.log('📴 收到SIGTERM信号，开始优雅关闭...');
  server.close((err) => {
    if (err) {
      console.error('❌ 服务器关闭错误:', err);
      process.exit(1);
    }
    console.log('✅ 服务器已优雅关闭');
    process.exit(0);
  });
});

process.on('SIGINT', () => {
  console.log('📴 收到SIGINT信号，开始优雅关闭...');
  server.close((err) => {
    if (err) {
      console.error('❌ 服务器关闭错误:', err);
      process.exit(1);
    }
    console.log('✅ 服务器已优雅关闭');
    process.exit(0);
  });
});

export default app;