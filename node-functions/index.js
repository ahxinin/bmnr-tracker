export default function onRequest(context) {
  return new Response('Hello from Node Functions!', {
    status: 200,
    headers: {
      'Content-Type': 'text/plain'
    }
  });
}