export default function onRequest(context) {
  const request = context.request;
  const url = new URL(request.url);
  
  // 代理到trackbmnr.com
  const proxyUrl = 'https://trackbmnr.com' + url.pathname.replace('/proxy', '');
  
  return fetch(proxyUrl).then(response => {
    return new Response(response.body, {
      status: response.status,
      headers: {
        'Content-Type': response.headers.get('content-type') || 'text/html',
        'Access-Control-Allow-Origin': '*'
      }
    });
  });
}