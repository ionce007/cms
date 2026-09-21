// ./edge-functions/api/image.js
export default async function onRequest(context) {
    console.log('aaaaaaaaaa')
    // 从 query 参数获取远程图片地址
    const url = new URL(context.request.url);
    const imageUrl = url.searchParams.get('url');
    if (!imageUrl) {
        return new Response('missing url parameter', { status: 400 });
    }

    // fetch 基于标准 Fetch API，可发起异步请求获取远程资源
    const remote = await fetch(imageUrl);
    if (!remote.ok) {
        return new Response('fetch remote failed', { status: remote.status });
    }

    // 直接透传远程响应的可读流，流式返回给客户端
    return new Response(remote.body, {
        headers: {
            'Content-Type': remote.headers.get('Content-Type') || 'application/octet-stream',
            'Cache-Control': 'public, max-age=3600',
        },
    });
}