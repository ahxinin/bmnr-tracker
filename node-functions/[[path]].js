// EdgeOne.ai Node Functions - 捕获所有路由
const { createProxyMiddleware } = require('http-proxy-middleware');
const cheerio = require('cheerio');

const TARGET_URL = 'https://trackbmnr.com';

// 自定义CSS样式
const customCSS = `
<style>
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
  
  [style*="background-color: black"],
  [style*="background-color: #000000"],
  [style*="background-color: #000"],
  [style*="background-color: rgb(0, 0, 0)"],
  [style*="background-color: rgb(0,0,0)"] {
    background-color: var(--bg-primary) !important;
  }
  
  [style*="color: white"],
  [style*="color: #ffffff"],
  [style*="color: #fff"],
  [style*="color: rgb(255, 255, 255)"],
  [style*="color: rgb(255,255,255)"] {
    color: var(--text-primary) !important;
  }
  
  .dark-theme, .dark-mode, .bg-dark, .bg-black {
    background-color: var(--bg-secondary) !important;
    color: var(--text-primary) !important;
  }
  
  .text-white {
    color: var(--text-primary) !important;
  }
  
  input[style*="background-color: black"],
  textarea[style*="background-color: black"],
  select[style*="background-color: black"] {
    background-color: var(--bg-primary) !important;
    color: var(--text-primary) !important;
    border: 1px solid var(--border-color) !important;
    border-radius: 4px;
    padding: 8px 12px;
  }
  
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
  
  a[style*="color: white"] {
    color: #007bff !important;
    text-decoration: none;
  }
  
  [style*="border-color: black"] {
    border-color: var(--border-color) !important;
  }
  
  @media (max-width: 768px) {
    body {
      font-size: 14px;
      line-height: 1.5;
    }
    
    input, textarea, select, button {
      font-size: 16px;
    }
  }
  
  img {
    max-width: 100%;
    height: auto;
  }
</style>
`;

// 主页HTML
const getHomePage = (host) => {
  return `
    <!DOCTYPE html>
    <html lang="zh-CN">
    <head>
        <meta charset="UTF-8">
        <meta name="viewport" content="width=device-width, initial-scale=1.0">
        <meta name="description" content="BMNR Tracker Proxy Server - EdgeOne.ai Functions">
        <title>BMNR Tracker - EdgeOne Functions版</title>
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
                word-break: break-all;
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
            <div class="status">✅ EdgeOne Functions 就绪</div>
            <h1>BMNR Tracker</h1>
            <p class="subtitle">EdgeOne.ai Functions 版代理服务器</p>
            
            <div class="features">
                <div class="feature">
                    <h3>🚀 Functions架构</h3>
                    <p>基于EdgeOne Functions的无服务器架构</p>
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
                <div class="proxy-url">https://${host}/proxy</div>
                <p>将此URL用作iframe的src属性即可嵌入trackbmnr.com内容</p>
            </div>
            
            <a href="/proxy" class="btn">🔍 访问代理页面</a>
            <a href="/health" class="btn">💊 健康检查</a>
            
            <div class="iframe-container">
                <iframe src="/proxy" title="BMNR Tracker Proxy"></iframe>
            </div>
        </div>
        
        <script>
            window.addEventListener('load', () => {
                console.log('🚀 BMNR Tracker EdgeOne Functions版本已加载');
                console.log('📊 页面加载时间:', performance.now().toFixed(2) + 'ms');
            });
            
            window.addEventListener('error', (e) => {
                console.error('❌ 页面错误:', e.error);
            });
        </script>
    </body>
    </html>
  `;
};

// HTML内容修改函数
const modifyHtmlContent = (html) => {
  try {
    const $ = cheerio.load(html);
    
    // 注入自定义CSS
    $('head').append(customCSS);
    
    // 添加viewport meta标签
    if (!$('meta[name="viewport"]').length) {
      $('head').prepend('<meta name="viewport" content="width=device-width, initial-scale=1.0, maximum-scale=1.0, user-scalable=no">');
    }
    
    // 修改相对URL为代理URL
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
    
    // 修改链接
    $('a[href]').each((i, elem) => {
      const $elem = $(elem);
      const href = $elem.attr('href');
      if (href && !href.startsWith('http') && !href.startsWith('//') && !href.startsWith('#') && !href.startsWith('mailto:') && !href.startsWith('tel:')) {
        $elem.attr('href', `/proxy${href.startsWith('/') ? '' : '/'}${href}`);
      } else if (href && href.startsWith(TARGET_URL)) {
        $elem.attr('href', href.replace(TARGET_URL, '/proxy'));
      }
    });
    
    return $.html();
  } catch (error) {
    console.error('Error modifying HTML:', error);
    return html;
  }
};

// 代理请求函数
const proxyRequest = async (url, method, headers, body) => {
  try {
    const targetUrl = TARGET_URL + url.replace(/^\/proxy/, '');
    
    const options = {
      method,
      headers: {
        ...headers,
        'User-Agent': 'BMNR-Tracker-Proxy/1.0',
        'Host': new URL(TARGET_URL).host,
        'Origin': TARGET_URL,
        'Referer': TARGET_URL
      }
    };
    
    if (body && method !== 'GET' && method !== 'HEAD') {
      options.body = body;
    }
    
    const response = await fetch(targetUrl, options);
    const content = await response.text();
    
    // 创建新的响应头
    const responseHeaders = new Headers();
    
    // 复制原始响应头，但排除一些安全头
    for (const [key, value] of response.headers.entries()) {
      if (!['x-frame-options', 'content-security-policy', 'x-content-type-options', 'strict-transport-security'].includes(key.toLowerCase())) {
        responseHeaders.set(key, value);
      }
    }
    
    // 添加CORS头
    responseHeaders.set('Access-Control-Allow-Origin', '*');
    responseHeaders.set('Access-Control-Allow-Methods', 'GET, POST, PUT, DELETE, OPTIONS');
    responseHeaders.set('Access-Control-Allow-Headers', 'Content-Type, Authorization, X-Requested-With');
    
    // 如果是HTML内容，进行修改
    let finalContent = content;
    if (responseHeaders.get('content-type')?.includes('text/html')) {
      finalContent = modifyHtmlContent(content);
    }
    
    return new Response(finalContent, {
      status: response.status,
      statusText: response.statusText,
      headers: responseHeaders
    });
    
  } catch (error) {
    console.error('Proxy error:', error);
    return new Response(JSON.stringify({
      error: 'Proxy Error',
      message: 'Unable to connect to target server',
      timestamp: new Date().toISOString()
    }), {
      status: 502,
      headers: {
        'Content-Type': 'application/json',
        'Access-Control-Allow-Origin': '*'
      }
    });
  }
};

// EdgeOne Functions入口函数
export default async function onRequest(context) {
  const { request } = context;
  
  // 安全地构建URL对象
  let url, pathname;
  try {
    // 如果request.url是完整URL，直接使用
    if (request.url.startsWith('http')) {
      url = new URL(request.url);
      pathname = url.pathname;
    } else {
      // 如果是相对路径，构建一个临时URL
      url = new URL(request.url, 'https://example.com');
      pathname = url.pathname;
    }
  } catch (error) {
    // 如果URL解析失败，从路径中提取pathname
    console.log('URL parsing error, using fallback:', error);
    pathname = request.url || '/';
    // 移除查询参数
    pathname = pathname.split('?')[0];
    // 创建一个临时的URL对象用于获取host
    url = { host: 'localhost', pathname: pathname };
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
  
  // 根路径 - 返回主页
  if (pathname === '/' || pathname === '/index') {
    const host = url.host || 'localhost';
    return new Response(getHomePage(host), {
      status: 200,
      headers: {
        'Content-Type': 'text/html; charset=utf-8',
        'Cache-Control': 'public, max-age=300'
      }
    });
  }
  
  // 健康检查
  if (pathname === '/health') {
    const healthData = {
      status: 'healthy',
      timestamp: new Date().toISOString(),
      platform: 'EdgeOne Functions',
      target_url: TARGET_URL,
      version: '1.0.0'
    };
    
    return new Response(JSON.stringify(healthData, null, 2), {
      status: 200,
      headers: {
        'Content-Type': 'application/json',
        'Access-Control-Allow-Origin': '*'
      }
    });
  }
  
  // API状态
  if (pathname === '/api/status') {
    const statusData = {
      status: 'active',
      version: '1.0.0',
      platform: 'EdgeOne Functions',
      target: TARGET_URL,
      timestamp: new Date().toISOString()
    };
    
    return new Response(JSON.stringify(statusData, null, 2), {
      status: 200,
      headers: {
        'Content-Type': 'application/json',
        'Access-Control-Allow-Origin': '*'
      }
    });
  }
  
  // Favicon处理
  if (pathname === '/favicon.ico') {
    return new Response(null, { status: 204 });
  }
  
  // 代理请求
  if (pathname.startsWith('/proxy')) {
    const requestHeaders = {};
    for (const [key, value] of request.headers.entries()) {
      requestHeaders[key] = value;
    }
    
    const body = method !== 'GET' && method !== 'HEAD' ? await request.text() : null;
    
    return await proxyRequest(pathname, method, requestHeaders, body);
  }
  
  // 404处理
  return new Response(JSON.stringify({
    error: 'Not Found',
    message: `Path '${pathname}' not found`,
    available_paths: ['/', '/proxy', '/health', '/api/status'],
    timestamp: new Date().toISOString()
  }, null, 2), {
    status: 404,
    headers: {
      'Content-Type': 'application/json',
      'Access-Control-Allow-Origin': '*'
    }
  });
}