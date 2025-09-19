export default function onRequest(context) {
  const request = context.request;
  const url = new URL(request.url);
  
  if (url.pathname.startsWith('/proxy')) {
    const targetPath = url.pathname.replace('/proxy', '') || '/';
    const proxyUrl = 'https://trackbmnr.com' + targetPath;
    
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
  
  return new Response('Proxy function ready!', {
    headers: { 'Content-Type': 'text/plain' }
  });
}