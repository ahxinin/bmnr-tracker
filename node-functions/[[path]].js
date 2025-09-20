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
          
          // 替换CSS文件链接（包括Next.js静态资源）
          modifiedContent = modifiedContent.replace(
            /<link([^>]*)\s+href=(["'])([^"']+\.css[^"']*)\2/gi,
            (match, attrs, quote, href) => {
              if (href.startsWith('http') || href.startsWith('//')) {
                return match;
              }
              // 处理相对路径（如 _next/static/...）和绝对路径（如 /static/...）
              const newHref = href.startsWith('/') ? 'https://trackbmnr.com' + href : 'https://trackbmnr.com/' + href;
              console.log('CSS:', href, '->', newHref);
              return `<link${attrs} href=${quote}${newHref}${quote}`;
            }
          );
          
          // 替换JS文件链接（包括Next.js静态资源）
          modifiedContent = modifiedContent.replace(
            /<script([^>]*)\s+src=(["'])([^"']+\.js[^"']*)\2/gi,
            (match, attrs, quote, src) => {
              if (src.startsWith('http') || src.startsWith('//')) {
                return match;
              }
              // 处理相对路径（如 _next/static/...）和绝对路径（如 /static/...）
              const newSrc = src.startsWith('/') ? 'https://trackbmnr.com' + src : 'https://trackbmnr.com/' + src;
              console.log('JS:', src, '->', newSrc);
              return `<script${attrs} src=${quote}${newSrc}${quote}`;
            }
          );
          
          // 替换API调用路径
          modifiedContent = modifiedContent.replace(
            /fetch\s*\(\s*(["'`])([^"'`]*\/api\/[^"'`]*)\1/gi,
            (match, quote, apiPath) => {
              if (apiPath.startsWith('http') || apiPath.startsWith('//')) {
                return match;
              }
              const newApiPath = apiPath.startsWith('/') ? 'https://trackbmnr.com' + apiPath : 'https://trackbmnr.com/' + apiPath;
              console.log('API:', apiPath, '->', newApiPath);
              return `fetch(${quote}${newApiPath}${quote}`;
            }
          );
          
          // 替换其他可能的API调用模式
          modifiedContent = modifiedContent.replace(
            /(["'`])(\/?api\/[^"'`]*)\1/gi,
            (match, quote, apiPath) => {
              // 避免重复替换已经处理过的fetch调用
              if (match.includes('https://trackbmnr.com')) {
                return match;
              }
              const newApiPath = apiPath.startsWith('/') ? 'https://trackbmnr.com' + apiPath : 'https://trackbmnr.com/' + apiPath;
              console.log('API path:', apiPath, '->', newApiPath);
              return `${quote}${newApiPath}${quote}`;
            }
          );
          
          // 自定义CSS覆盖黑色主题
          const customCSS = `
<style>
  /* 只针对明确的深色背景进行替换，避免破坏布局 */
  body {
    background-color: #ffffff !important;
    color: #333333 !important;
  }
  
  /* 具体的深色背景替换 */
  [style*="background-color: black"],
  [style*="background-color: #000000"],
  [style*="background-color: #000"],
  [style*="background-color: rgb(0, 0, 0)"],
  [style*="background-color: rgb(0,0,0)"] {
    background-color: #ffffff !important;
  }
  
  /* 深色文字替换为深灰色，保持对比度 */
  [style*="color: white"],
  [style*="color: #ffffff"],
  [style*="color: #fff"],
  [style*="color: rgb(255, 255, 255)"],
  [style*="color: rgb(255,255,255)"] {
    color: #333333 !important;
  }
  
  /* 常见的深色主题类名 */
  .dark-theme,
  .dark-mode,
  .bg-dark,
  .bg-black {
    background-color: #f8f9fa !important;
    color: #333333 !important;
  }
  
  .text-white {
    color: #333333 !important;
  }
  
  /* 表单元素优化 */
  input[style*="background-color: black"],
  textarea[style*="background-color: black"],
  select[style*="background-color: black"] {
    background-color: #ffffff !important;
    color: #333333 !important;
    border: 1px solid #ced4da !important;
  }
  
  /* 按钮优化 - 保持原有样式，只修改颜色 */
  button[style*="background-color: black"],
  .btn[style*="background-color: black"] {
    background-color: #6c757d !important;
    color: #ffffff !important;
  }
  
  /* 链接保持原有样式 */
  a[style*="color: white"] {
    color: #007bff !important;
  }
  
  /* 修复可能的边框和阴影问题 */
  [style*="border-color: black"] {
    border-color: #dee2e6 !important;
  }
  
  [style*="box-shadow"][style*="black"] {
    box-shadow: 0 2px 4px rgba(0,0,0,0.1) !important;
  }
</style>
`;
          
          // 注入自定义CSS到head标签
          modifiedContent = modifiedContent.replace(
            /<\/head>/i,
            customCSS + '</head>'
          );
          
          console.log('Injected custom CSS for theme override');
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
    
    // 处理静态资源代理（Next.js _next 目录等）
    if (pathname.startsWith('/_next/') || pathname.match(/\.(css|js|png|jpg|jpeg|gif|svg|ico|woff|woff2|ttf|eot)$/)) {
      // 处理查询参数
      let queryString = '';
      try {
        const url = new URL(request.url);
        queryString = url.search;
      } catch {
        const queryIndex = request.url.indexOf('?');
        if (queryIndex !== -1) {
          queryString = request.url.substring(queryIndex);
        }
      }
      
      const proxyUrl = 'https://trackbmnr.com' + pathname + queryString;
      
      console.log('Static resource proxying to:', proxyUrl);
      
      return fetch(proxyUrl, {
        method: request.method,
        headers: {
          'User-Agent': 'Mozilla/5.0 (compatible; BMNR-Tracker-Proxy/1.0)',
          'Accept': '*/*'
        }
      }).then(response => {
        console.log('Static resource response - Status:', response.status);
        
        return new Response(response.body, {
          status: response.status,
          headers: {
            'Content-Type': response.headers.get('content-type') || 'application/octet-stream',
            'Cache-Control': response.headers.get('cache-control') || 'public, max-age=3600',
            'Access-Control-Allow-Origin': '*'
          }
        });
      }).catch(error => {
        console.error('Static resource proxy error:', error);
        return new Response('Static resource not found', {
          status: 404,
          headers: { 
            'Content-Type': 'text/plain',
            'Access-Control-Allow-Origin': '*'
          }
        });
      });
    }
    
    // 处理API请求代理（直接API调用）
    if (pathname.startsWith('/api/') || pathname === '/api') {
      // 处理查询参数
      let queryString = '';
      try {
        const url = new URL(request.url);
        queryString = url.search;
      } catch {
        const queryIndex = request.url.indexOf('?');
        if (queryIndex !== -1) {
          queryString = request.url.substring(queryIndex);
        }
      }
      
      const proxyUrl = 'https://trackbmnr.com' + pathname + queryString;
      
      console.log('API Proxying to:', proxyUrl);
      
      return fetch(proxyUrl, {
        method: request.method,
        headers: {
          'User-Agent': 'Mozilla/5.0 (compatible; BMNR-Tracker-Proxy/1.0)',
          'Accept': 'application/json,*/*'
        }
      }).then(async response => {
        const content = await response.text();
        const contentType = response.headers.get('content-type') || '';
        
        console.log('API Response - Status:', response.status, 'Content-Type:', contentType);
        
        return new Response(content, {
          status: response.status,
          headers: {
            'Content-Type': contentType,
            'Access-Control-Allow-Origin': '*',
            'Access-Control-Allow-Methods': 'GET, POST, OPTIONS',
            'Access-Control-Allow-Headers': 'Content-Type'
          }
        });
      }).catch(error => {
        console.error('API Proxy error:', error);
        return new Response(JSON.stringify({
          error: 'API proxy failed',
          message: error.message,
          target: proxyUrl
        }), {
          status: 502,
          headers: { 
            'Content-Type': 'application/json',
            'Access-Control-Allow-Origin': '*'
          }
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