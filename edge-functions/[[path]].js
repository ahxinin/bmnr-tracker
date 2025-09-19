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
    const proxyUrl = 'https://trackbmnr.com' + pathname.replace('/proxy', '');
    return fetch(proxyUrl, {
      method: request.method,
      headers: request.headers,
      body: request.method !== 'GET' && request.method !== 'HEAD' ? request.body : undefined
    });
  }
  
  // 404处理
  return new Response(JSON.stringify({
    error: 'Not Found',
    message: `Path '${pathname}' not found`,
    available_paths: ['/', '/health', '/test', '/proxy'],
    timestamp: new Date().toISOString()
  }, null, 2), {
    status: 404,
    headers: { 'Content-Type': 'application/json' }
  });
}