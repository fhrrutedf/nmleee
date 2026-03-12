export async function GET() {
    return new Response(JSON.stringify({ status: 'PURE_OK', message: 'If you see this, the problem is in your imports!' }), {
        status: 200,
        headers: { 'Content-Type': 'application/json' }
    });
}
