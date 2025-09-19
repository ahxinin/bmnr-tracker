// 最简化的EdgeOne Node Functions测试
export default async function onRequest(context) {
  return new Response('Hello from EdgeOne Node Functions! 🚀', {
    status: 200,
    headers: {
      'Content-Type': 'text/plain; charset=utf-8',
      'Access-Control-Allow-Origin': '*'
    }
  });
}