export default function onRequest(context) {
  try {
    const request = context.request;
    
    // 安全地获取路径，避免URL解析错误
    let pathname;
    try {
      // 尝试解析完整URL
      const url = new URL(request.url);
      pathname = url.pathname;
    } catch {
      // 如果失败，假设request.url就是路径
      pathname = request.url || '/';
      // 移除查询参数
      pathname = pathname.split('?')[0];
    }
    
    // 如果访问根路径，返回简单页面
    if (pathname === '/' || pathname === '/index') {
      return new Response(`
        <!DOCTYPE html>
        <html>
        <head>
          <title>代理服务</title>
          <meta charset="utf-8">
        </head>
        <body>
          <h1>🔗 BMNR Tracker 代理</h1>
          <p>访问 /proxy 来代理到 trackbmnr.com</p>
          <p><a href="/proxy">/proxy</a></p>
        </body>
        </html>
      `, {
        headers: { 'Content-Type': 'text/html; charset=utf-8' }
      });
    }
    
    // 处理代理请求
    if (pathname.startsWith('/proxy')) {
      const targetPath = pathname.replace('/proxy', '') || '/';
      const proxyUrl = 'https://trackbmnr.com' + targetPath;
      
      console.log('Proxying to:', proxyUrl);
      
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
            'Access-Control-Allow-Origin': '*',
            'Access-Control-Allow-Methods': 'GET, POST, OPTIONS',
            'Access-Control-Allow-Headers': 'Content-Type'
          }
        });
      }).catch(error => {
        console.error('Proxy error:', error);
        return new Response(`
          <!DOCTYPE html>
          <html>
          <head><title>代理错误</title><meta charset="utf-8"></head>
          <body>
            <h1>🚫 代理错误</h1>
            <p><strong>目标:</strong> ${proxyUrl}</p>
            <p><strong>错误:</strong> ${error.message}</p>
            <p><strong>原始路径:</strong> ${pathname}</p>
            <p><strong>请求URL:</strong> ${request.url}</p>
            <a href="/">返回首页</a>
          </body>
          </html>
        `, {
          status: 502,
          headers: { 'Content-Type': 'text/html; charset=utf-8' }
        });
      });
    }
    
    // 其他路径返回404
    return new Response(`
      <!DOCTYPE html>
      <html>
      <head><title>未找到</title><meta charset="utf-8"></head>
      <body>
        <h1>❌ 路径未找到</h1>
        <p>路径: ${pathname}</p>
        <p>可用路径:</p>
        <ul>
          <li><a href="/">/</a> - 首页</li>
          <li><a href="/proxy">/proxy</a> - 代理服务</li>
        </ul>
      </body>
      </html>
    `, {
      status: 404,
      headers: { 'Content-Type': 'text/html; charset=utf-8' }
    });
    
  } catch (error) {
    console.error('Function error:', error);
    return new Response(`
      <!DOCTYPE html>
      <html>
      <head><title>函数错误</title><meta charset="utf-8"></head>
      <body>
        <h1>💥 函数错误</h1>
        <p>错误: ${error.message}</p>
        <p>请求: ${context.request?.url || 'unknown'}</p>
      </body>
      </html>
    `, {
      status: 500,
      headers: { 'Content-Type': 'text/html; charset=utf-8' }
    });
  }
}