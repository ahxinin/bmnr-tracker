// EdgeOne Edge Functions版本 - 备选方案
export default function onRequest(context) {
  const { request } = context;
  const url = new URL(request.url);
  const pathname = url.pathname;
  
  // 简单的路由处理
  if (pathname === '/') {
    const html = `
<!DOCTYPE html>
<html lang="zh-CN">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>BMNR Tracker - Edge Functions</title>
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
        }
        h1 { font-size: 3rem; margin-bottom: 20px; }
        p { font-size: 1.2rem; margin-bottom: 30px; }
        .btn {
            display: inline-block;
            background: rgba(255,255,255,0.2);
            color: white;
            padding: 15px 30px;
            text-decoration: none;
            border-radius: 25px;
            margin: 10px;
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
        <h1>🚀 BMNR Tracker</h1>
        <p>EdgeOne Functions 版本正在运行</p>
        <p>当前时间: ${new Date().toLocaleString('zh-CN')}</p>
        <a href="/proxy" class="btn">🔍 访问代理</a>
        <a href="/health" class="btn">💊 健康检查</a>
        <a href="/test" class="btn">🧪 功能测试</a>
    </div>
</body>
</html>`;
    
    return new Response(html, {
      headers: { 'Content-Type': 'text/html; charset=utf-8' }
    });
  }
  
  if (pathname === '/health') {
    return new Response(JSON.stringify({
      status: 'healthy',
      timestamp: new Date().toISOString(),
      platform: 'EdgeOne Edge Functions',
      path: pathname
    }, null, 2), {
      headers: { 'Content-Type': 'application/json' }
    });
  }
  
  if (pathname === '/debug') {
    const debugInfo = {
      request: {
        url: request.url,
        method: request.method,
        headers: Object.fromEntries(request.headers.entries())
      },
      pathname: pathname,
      timestamp: new Date().toISOString(),
      platform: 'EdgeOne Edge Functions'
    };
    
    return new Response(`
      <!DOCTYPE html>
      <html>
      <head>
        <title>调试信息</title>
        <meta charset="utf-8">
        <style>body{font-family:monospace;padding:20px;background:#f5f5f5;} pre{background:#fff;padding:15px;border-radius:5px;border:1px solid #ddd;}</style>
      </head>
      <body>
        <h1>EdgeOne Edge Functions 调试信息</h1>
        <pre>${JSON.stringify(debugInfo, null, 2)}</pre>
        <p><a href="/">返回首页</a> | <a href="/proxy">测试代理</a></p>
      </body>
      </html>
    `, {
      headers: { 'Content-Type': 'text/html; charset=utf-8' }
    });
  }
  
  if (pathname === '/test') {
    return new Response(JSON.stringify({
      message: 'Edge Functions test successful!',
      timestamp: new Date().toISOString(),
      request: {
        method: request.method,
        url: request.url,
        pathname: pathname,
        headers: Object.fromEntries(request.headers.entries())
      }
    }, null, 2), {
      headers: { 'Content-Type': 'application/json' }
    });
  }
  
  if (pathname.startsWith('/proxy')) {
    try {
      // 处理代理路径
      let targetPath = pathname.replace('/proxy', '');
      if (!targetPath || targetPath === '') {
        targetPath = '/';
      }
      
      const proxyUrl = 'https://trackbmnr.com' + targetPath;
      console.log('Proxying to:', proxyUrl);
      
      const response = await fetch(proxyUrl, {
        method: request.method,
        headers: {
          'User-Agent': 'Mozilla/5.0 (compatible; BMNR-Tracker-Proxy/1.0)',
          'Accept': 'text/html,application/xhtml+xml,application/xml;q=0.9,*/*;q=0.8',
          'Accept-Language': 'en-US,en;q=0.5'
        },
        body: request.method !== 'GET' && request.method !== 'HEAD' ? request.body : undefined
      });
      
      if (!response.ok) {
        throw new Error(`HTTP ${response.status}: ${response.statusText}`);
      }
      
      // 创建新的响应头
      const responseHeaders = new Headers(response.headers);
      responseHeaders.set('Access-Control-Allow-Origin', '*');
      responseHeaders.set('Access-Control-Allow-Methods', 'GET, POST, OPTIONS');
      responseHeaders.set('Access-Control-Allow-Headers', 'Content-Type');
      
      // 移除可能阻止iframe嵌入的头
      responseHeaders.delete('x-frame-options');
      responseHeaders.delete('content-security-policy');
      
      return new Response(response.body, {
        status: response.status,
        statusText: response.statusText,
        headers: responseHeaders
      });
      
    } catch (error) {
      console.error('Proxy error:', error);
      return new Response(JSON.stringify({
        error: 'Proxy Error',
        message: error.message,
        target: 'https://trackbmnr.com',
        path: pathname,
        timestamp: new Date().toISOString()
      }, null, 2), {
        status: 502,
        headers: { 
          'Content-Type': 'application/json',
          'Access-Control-Allow-Origin': '*'
        }
      });
    }
  }
  
  // 404处理
  return new Response(JSON.stringify({
    error: 'Not Found',
    message: `Path '${pathname}' not found`,
    available_paths: ['/', '/health', '/test', '/debug', '/proxy'],
    timestamp: new Date().toISOString()
  }, null, 2), {
    status: 404,
    headers: { 'Content-Type': 'application/json' }
  });
}