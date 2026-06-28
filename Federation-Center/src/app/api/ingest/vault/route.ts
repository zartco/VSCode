export async function POST(request: Request) {
  try {
    const payload = await request.json();
    console.log(`[Federation Core] Received vault modification:`, payload?.action, payload?.filePath);
    return new Response(null, { status: 204 });
  } catch (err: any) {
    return new Response(JSON.stringify({ error: err.message }), {
      status: 500,
      headers: { 'Content-Type': 'application/json' },
    });
  }
}
