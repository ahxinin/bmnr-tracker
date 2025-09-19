// EdgeOne Node Functions - 按照官方文档规范
export default function onRequest(context) {
  try {
    // 从context中获取request对象
    const request = context.request;
    
    // 获取URL路径
    const url = new URL(request.url);
    const pathname = url.pathname;
    
    // 处理不同路由
    if (pathname === '/' || pathname === '/index') {
      return new Response(`
        <!DOCTYPE html>
        <html lang="zh-CN">
        <head>
          <meta charset="UTF-8">
          <meta name="viewport" content="width=device-width, initial-scale=1.0">
          <title>BMNR Tracker</title>
          <style>
            body {
              font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif;
              background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
              color: white;
              margin: 0;
              padding: 40px;
              min-height: 100vh;
              display: flex;
              align-items: center;
              justify-content: center;
            }
            .container {
              text-align: center;
              background: rgba(255,255,255,0.1);
              padding: 40px;
              border-radius: 20px;
              backdrop-filter: blur(10px);
              max-width: 600px;
            }
            h1 { font-size: 2.5rem; margin-bottom: 20px; }
            .status { 
              background: #4caf50; 
              padding: 8px 16px; 
              border-radius: 20px; 
              font-size: 0.9rem; 
              margin-bottom: 20px; 
              display: inline-block;
            }
            .btn {
              display: inline-block;
              background: rgba(255,255,255,0.2);
              color: white;
              padding: 12px 24px;
              text-decoration: none;
              border-radius: 25px;
              margin: 8px;
              transition: all 0.3s ease;
            }
            .btn:hover {
              background: rgba(255,255,255,0.3);
              transform: translateY(-2px);
            }
          </style>
        </head>
        <body>
          <div class="container">
            <div class="status">✅ EdgeOne Node Functions</div>
            <h1>🚀 BMNR Tracker</h1>
            <p>EdgeOne Node Functions 代理服务器</p>
            <p>当前时间: ${new Date().toLocaleString('zh-CN')}</p>
            <a href="/proxy" class="btn">🔍 访问代理</a>
            <a href="/health" class="btn">💊 健康检查</a>
            <a href="/debug" class="btn">🔧 调试信息</a>
          </div>
        </body>
        </html>
      `, {
        headers: { 'Content-Type': 'text/html; charset=utf-8' }
      });
    }
    
    // 健康检查
    if (pathname === '/health') {
      return new Response(JSON.stringify({
        status: 'healthy',
        timestamp: new Date().toISOString(),
        platform: 'EdgeOne Node Functions',
        url: request.url,
        method: request.method
      }, null, 2), {
        headers: { 'Content-Type': 'application/json' }
      });
    }
    
    // 调试信息
    if (pathname === '/debug') {
      const debugInfo = {
        context: {
          keys: Object.keys(context),
          type: typeof context
        },
        request: {
          url: request.url,
          method: request.method,
          headers: Object.fromEntries(request.headers.entries())
        },
        pathname: pathname,
        timestamp: new Date().toISOString()
      };
      
      return new Response(`
        <!DOCTYPE html>
        <html>
        <head>
          <title>调试信息</title>
          <meta charset="utf-8">
          <style>
            body { font-family: monospace; padding: 20px; background: #f5f5f5; }
            pre { background: #fff; padding: 15px; border-radius: 5px; border: 1px solid #ddd; }
            .nav a { background: #007bff; color: white; padding: 8px 16px; text-decoration: none; border-radius: 4px; margin-right: 10px; }
          </style>
        </head>
        <body>
          <div class="nav">
            <a href="/">🏠 首页</a>
            <a href="/proxy">🔗 代理</a>
            <a href="/health">💊 健康</a>
          </div>
          <h1>🔧 调试信息</h1>
          <pre>${JSON.stringify(debugInfo, null, 2)}</pre>
        </body>
        </html>
      `, {
        headers: { 'Content-Type': 'text/html; charset=utf-8' }
      });
    }
    
    // 代理功能
    if (pathname.startsWith('/proxy')) {
      const targetPath = pathname.replace('/proxy', '') || '/';
      const proxyUrl = 'https://trackbmnr.com' + targetPath;
      
      return fetch(proxyUrl, {
        method: request.method,
        headers: {
          'User-Agent': 'Mozilla/5.0 (compatible; BMNR-Tracker-Proxy/1.0)',
          'Accept': 'text/html,application/xhtml+xml,application/xml;q=0.9,*/*;q=0.8'
        }
      }).then(response => {
        return new Response(response.body, {
          status: response.status,
          headers: {
            'Content-Type': response.headers.get('content-type') || 'text/html',
            'Access-Control-Allow-Origin': '*'
          }
        });
      }).catch(error => {
        return new Response(`
          <!DOCTYPE html>
          <html>
          <head><title>代理错误</title><meta charset="utf-8"></head>
          <body>
            <h1>🚫 代理错误</h1>
            <p>目标: https://trackbmnr.com</p>
            <p>错误: ${error.message}</p>
            <p>路径: ${pathname}</p>
            <a href="/">返回首页</a>
          </body>
          </html>
        `, {
          status: 502,
          headers: { 'Content-Type': 'text/html; charset=utf-8' }
        });
      });
    }
    
    // 404
    return new Response(JSON.stringify({
      error: 'Not Found',
      message: `Path '${pathname}' not found`,
      available_paths: ['/', '/proxy', '/health', '/debug']
    }, null, 2), {
      status: 404,
      headers: { 'Content-Type': 'application/json' }
    });
    
  } catch (error) {
    return new Response(`Error: ${error.message}`, {
      status: 500,
      headers: { 'Content-Type': 'text/plain; charset=utf-8' }
    });
  }
}