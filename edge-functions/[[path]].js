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
    // 安全地获取请求头信息
    let requestHeaders = {};
    try {
      if (request.headers) {
        // 尝试不同的方法获取headers
        if (typeof request.headers.entries === 'function') {
          requestHeaders = Object.fromEntries(request.headers.entries());
        } else if (typeof request.headers.forEach === 'function') {
          request.headers.forEach((value, key) => {
            requestHeaders[key] = value;
          });
        } else {
          // EdgeOne Functions可能直接提供对象
          requestHeaders = request.headers;
        }
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
      platform: 'EdgeOne Edge Functions',
      context: typeof context !== 'undefined' ? Object.keys(context) : 'undefined'
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
    // 安全地获取请求头信息
    let requestHeaders = {};
    try {
      if (request.headers) {
        if (typeof request.headers.entries === 'function') {
          requestHeaders = Object.fromEntries(request.headers.entries());
        } else if (typeof request.headers.forEach === 'function') {
          request.headers.forEach((value, key) => {
            requestHeaders[key] = value;
          });
        } else {
          requestHeaders = request.headers;
        }
      }
    } catch (e) {
      requestHeaders = { error: 'Cannot read headers: ' + e.message };
    }
    
    return new Response(JSON.stringify({
      message: 'Edge Functions test successful!',
      timestamp: new Date().toISOString(),
      request: {
        method: request.method,
        url: request.url,
        pathname: pathname,
        headers: requestHeaders
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
      
      // 最简化的fetch请求，不传递任何原始headers
      const response = await fetch(proxyUrl, {
        method: request.method || 'GET',
        headers: {
          'User-Agent': 'Mozilla/5.0 (compatible; BMNR-Tracker-Proxy/1.0)',
          'Accept': 'text/html,application/xhtml+xml,application/xml;q=0.9,*/*;q=0.8'
        }
        // 不传递body，避免potential issues
      });
      
      if (!response.ok) {
        throw new Error(`HTTP ${response.status}: ${response.statusText}`);
      }
      
      // 获取响应内容
      const content = await response.text();
      
      // 创建简单的响应头
      const responseHeaders = {
        'Content-Type': response.headers.get('content-type') || 'text/html',
        'Access-Control-Allow-Origin': '*',
        'Access-Control-Allow-Methods': 'GET, POST, OPTIONS',
        'Access-Control-Allow-Headers': 'Content-Type'
      };
      
      return new Response(content, {
        status: response.status,
        statusText: response.statusText,
        headers: responseHeaders
      });
      
    } catch (error) {
      console.error('Proxy error:', error);
      
      // 返回友好的HTML错误页面
      const errorHtml = `
        <!DOCTYPE html>
        <html>
        <head>
          <title>代理错误</title>
          <meta charset="utf-8">
          <style>
            body { font-family: Arial, sans-serif; padding: 40px; background: #f5f5f5; }
            .error-box { background: white; padding: 30px; border-radius: 10px; box-shadow: 0 2px 10px rgba(0,0,0,0.1); }
            h1 { color: #e74c3c; margin-bottom: 20px; }
            p { margin-bottom: 15px; line-height: 1.6; }
            .btn { display: inline-block; background: #3498db; color: white; padding: 10px 20px; text-decoration: none; border-radius: 5px; margin-top: 20px; }
            .details { background: #f8f9fa; padding: 15px; border-radius: 5px; margin-top: 20px; font-family: monospace; font-size: 12px; }
          </style>
        </head>
        <body>
          <div class="error-box">
            <h1>🚫 代理服务错误</h1>
            <p><strong>无法连接到目标服务器：</strong> https://trackbmnr.com</p>
            <p><strong>错误信息：</strong> ${error.message}</p>
            <p><strong>请求路径：</strong> ${pathname}</p>
            <div class="details">
              <strong>调试信息：</strong><br>
              时间: ${new Date().toISOString()}<br>
              目标URL: https://trackbmnr.com${targetPath || '/'}<br>
              平台: EdgeOne Edge Functions
            </div>
            <a href="/" class="btn">🏠 返回首页</a>
            <a href="/debug" class="btn">🔍 查看调试信息</a>
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