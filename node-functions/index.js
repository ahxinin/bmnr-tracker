// EdgeOne Node Functions - 完整代理服务器
export default async function onRequest(context) {
  const { request } = context;
  
  // 安全地获取URL和路径
  let pathname;
  try {
    if (request.url.startsWith('http')) {
      pathname = new URL(request.url).pathname;
    } else {
      pathname = request.url.split('?')[0];
    }
  } catch (error) {
    pathname = request.url || '/';
    pathname = pathname.split('?')[0];
  }
  
  const method = request.method;
  
  // 处理CORS预检请求
  if (method === 'OPTIONS') {
    return new Response(null, {
      status: 200,
      headers: {
        'Access-Control-Allow-Origin': '*',
        'Access-Control-Allow-Methods': 'GET, POST, PUT, DELETE, OPTIONS',
        'Access-Control-Allow-Headers': 'Content-Type, Authorization, X-Requested-With',
        'Access-Control-Max-Age': '86400'
      }
    });
  }
  
  // 根路径
  if (pathname === '/' || pathname === '/index') {
    return new Response(`
      <!DOCTYPE html>
      <html lang="zh-CN">
      <head>
        <meta charset="UTF-8">
        <meta name="viewport" content="width=device-width, initial-scale=1.0">
        <title>BMNR Tracker - Node Functions</title>
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
          p { font-size: 1.1rem; margin-bottom: 30px; }
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
          .status { 
            background: #4caf50; 
            padding: 8px 16px; 
            border-radius: 20px; 
            font-size: 0.9rem; 
            margin-bottom: 20px; 
            display: inline-block;
          }
        </style>
      </head>
      <body>
        <div class="container">
          <div class="status">✅ Node Functions 运行中</div>
          <h1>🚀 BMNR Tracker</h1>
          <p>EdgeOne Node Functions 代理服务器</p>
          <p>当前时间: ${new Date().toLocaleString('zh-CN')}</p>
          <a href="/proxy" class="btn">🔍 访问代理</a>
          <a href="/health" class="btn">💊 健康检查</a>
          <a href="/debug" class="btn">🔧 调试信息</a>
          <a href="/test" class="btn">🧪 功能测试</a>
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
      path: pathname
    }, null, 2), {
      headers: { 'Content-Type': 'application/json' }
    });
  }
  
  // 调试信息
  if (pathname === '/debug') {
    let requestHeaders = {};
    try {
      if (request.headers && typeof request.headers.forEach === 'function') {
        request.headers.forEach((value, key) => {
          requestHeaders[key] = value;
        });
      } else if (request.headers) {
        requestHeaders = request.headers;
      }
    } catch (e) {
      requestHeaders = { error: 'Cannot read headers: ' + e.message };
    }
    
    const debugInfo = {
      request: {
        url: request.url,
        method: request.method,
        headers: requestHeaders
      },
      pathname: pathname,
      timestamp: new Date().toISOString(),
      platform: 'EdgeOne Node Functions'
    };
    
    return new Response(`
      <!DOCTYPE html>
      <html>
      <head>
        <title>Node Functions 调试信息</title>
        <meta charset="utf-8">
        <style>
          body{font-family:monospace;padding:20px;background:#f5f5f5;} 
          pre{background:#fff;padding:15px;border-radius:5px;border:1px solid #ddd;overflow-x:auto;}
          h1{color:#333;}
          .nav{margin-bottom:20px;}
          .nav a{background:#007bff;color:white;padding:8px 16px;text-decoration:none;border-radius:4px;margin-right:10px;}
        </style>
      </head>
      <body>
        <h1>🔧 Node Functions 调试信息</h1>
        <div class="nav">
          <a href="/">🏠 首页</a>
          <a href="/proxy">🔗 代理</a>
          <a href="/health">💊 健康</a>
        </div>
        <pre>${JSON.stringify(debugInfo, null, 2)}</pre>
      </body>
      </html>
    `, {
      headers: { 'Content-Type': 'text/html; charset=utf-8' }
    });
  }
  
  // 测试路由
  if (pathname === '/test') {
    return new Response(JSON.stringify({
      message: 'Node Functions test successful!',
      timestamp: new Date().toISOString(),
      request: {
        method: request.method,
        url: request.url,
        pathname: pathname
      }
    }, null, 2), {
      headers: { 'Content-Type': 'application/json' }
    });
  }
  
  // 代理功能
  if (pathname.startsWith('/proxy')) {
    try {
      let targetPath = pathname.replace('/proxy', '');
      if (!targetPath || targetPath === '') {
        targetPath = '/';
      }
      
      const proxyUrl = 'https://trackbmnr.com' + targetPath;
      
      const response = await fetch(proxyUrl, {
        method: method || 'GET',
        headers: {
          'User-Agent': 'Mozilla/5.0 (compatible; BMNR-Tracker-Proxy/1.0)',
          'Accept': 'text/html,application/xhtml+xml,application/xml;q=0.9,*/*;q=0.8'
        }
      });
      
      if (!response.ok) {
        throw new Error(`HTTP ${response.status}: ${response.statusText}`);
      }
      
      const content = await response.text();
      
      return new Response(content, {
        status: response.status,
        headers: {
          'Content-Type': response.headers.get('content-type') || 'text/html',
          'Access-Control-Allow-Origin': '*',
          'Access-Control-Allow-Methods': 'GET, POST, OPTIONS',
          'Access-Control-Allow-Headers': 'Content-Type'
        }
      });
      
    } catch (error) {
      const errorHtml = `
        <!DOCTYPE html>
        <html>
        <head>
          <title>代理错误</title>
          <meta charset="utf-8">
          <style>
            body { font-family: Arial, sans-serif; padding: 40px; background: #f5f5f5; }
            .error { background: white; padding: 30px; border-radius: 10px; box-shadow: 0 2px 10px rgba(0,0,0,0.1); }
            h1 { color: #e74c3c; }
            .btn { background: #3498db; color: white; padding: 10px 20px; text-decoration: none; border-radius: 5px; margin-top: 20px; display: inline-block; }
          </style>
        </head>
        <body>
          <div class="error">
            <h1>🚫 代理服务错误</h1>
            <p><strong>目标服务器：</strong> https://trackbmnr.com</p>
            <p><strong>错误信息：</strong> ${error.message}</p>
            <p><strong>请求路径：</strong> ${pathname}</p>
            <p><strong>时间：</strong> ${new Date().toISOString()}</p>
            <a href="/" class="btn">🏠 返回首页</a>
            <a href="/debug" class="btn">🔧 调试信息</a>
          </div>
        </body>
        </html>
      `;
      
      return new Response(errorHtml, {
        status: 502,
        headers: { 
          'Content-Type': 'text/html; charset=utf-8',
          'Access-Control-Allow-Origin': '*'
        }
      });
    }
  }
  
  // Favicon
  if (pathname === '/favicon.ico') {
    return new Response(null, { status: 204 });
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