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
      
      // 处理查询参数
      let queryString = '';
      try {
        const url = new URL(request.url);
        queryString = url.search;
      } catch {
        // 如果无法解析，尝试从原始URL中提取
        const queryIndex = request.url.indexOf('?');
        if (queryIndex !== -1) {
          queryString = request.url.substring(queryIndex);
        }
      }
      
      const proxyUrl = 'https://trackbmnr.com' + targetPath + queryString;
      
      console.log('Proxying to:', proxyUrl);
      
      return fetch(proxyUrl, {
        method: request.method,
        headers: {
          'User-Agent': 'Mozilla/5.0 (compatible; BMNR-Tracker-Proxy/1.0)',
          'Accept': 'text/html,application/xhtml+xml,application/xml;q=0.9,*/*;q=0.8'
        }
      }).then(async response => {
        const content = await response.text();
        const contentType = response.headers.get('content-type') || '';
        
        console.log('Content-Type:', contentType);
        console.log('Content length:', content.length);
        
        // 如果是HTML内容，修改其中的URL
        let modifiedContent = content;
        if (contentType.includes('text/html')) {
          console.log('Processing HTML content...');
          
          // 计算原始文档中的资源数量
          const cssCount = (content.match(/<link[^>]*href=["'][^"']*\.css[^"']*["']/gi) || []).length;
          const jsCount = (content.match(/<script[^>]*src=["'][^"']*\.js[^"']*["']/gi) || []).length;
          
          console.log('Found CSS files:', cssCount);
          console.log('Found JS files:', jsCount);
          
          // 替换CSS文件链接
          modifiedContent = modifiedContent.replace(
            /<link([^>]*)\s+href=(["'])([^"']+\.css[^"']*)\2/gi,
            (match, attrs, quote, href) => {
              if (href.startsWith('http') || href.startsWith('//')) {
                return match;
              }
              const newHref = href.startsWith('/') ? 'https://trackbmnr.com' + href : 'https://trackbmnr.com/' + href;
              console.log('CSS:', href, '->', newHref);
              return `<link${attrs} href=${quote}${newHref}${quote}`;
            }
          );
          
          // 替换JS文件链接
          modifiedContent = modifiedContent.replace(
            /<script([^>]*)\s+src=(["'])([^"']+\.js[^"']*)\2/gi,
            (match, attrs, quote, src) => {
              if (src.startsWith('http') || src.startsWith('//')) {
                return match;
              }
              const newSrc = src.startsWith('/') ? 'https://trackbmnr.com' + src : 'https://trackbmnr.com/' + src;
              console.log('JS:', src, '->', newSrc);
              return `<script${attrs} src=${quote}${newSrc}${quote}`;
            }
          );
          
          console.log('HTML processing completed');
        }
        
        return new Response(modifiedContent, {
          status: response.status,
          headers: {
            'Content-Type': contentType,
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