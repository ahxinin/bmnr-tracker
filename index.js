export default function onRequest(context) {
  return new Response('Hello from Root Index!', {
    status: 200,
    headers: {
      'Content-Type': 'text/plain'
    }
  });
}