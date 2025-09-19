// EdgeOne Node Functions - 最小化测试版本
export default async function onRequest() {
  try {
    return new Response('Hello EdgeOne! 🚀', {
      status: 200,
      headers: {
        'Content-Type': 'text/plain; charset=utf-8',
        'Access-Control-Allow-Origin': '*'
      }
    });
  } catch (error) {
    return new Response(`Error: ${error.message}`, {
      status: 500,
      headers: {
        'Content-Type': 'text/plain; charset=utf-8'
      }
    });
  }
}