export default function onRequest(context) {
  return new Response('Hello from MJS!', {
    status: 200,
    headers: {
      'Content-Type': 'text/plain'
    }
  });
}