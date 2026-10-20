// middleware.ts
import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';
import { API_BASE_URL } from '@/config/env'

// ✅ 你的 Express 后端 API 地址（从环境变量获取）
//const EXPRESS_API_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8088/api';

export async function proxy(request: NextRequest) {
    const { pathname, search } = request.nextUrl;

    console.log('pathname = ', pathname);
    const path = pathname.trim().toLocaleLowerCase();
    const url = request.nextUrl.clone();
    if (path === '/about/page-46.html') { url.pathname = '/about/donate'; return NextResponse.redirect(url) }
    if (path === '/about/page-47.html') { url.pathname = '/about/gratitude'; return NextResponse.redirect(url) }

    const referer = request.headers.get('referer');
    if (referer) {
        const part = pathname.split('/');
        const page = part[part.length - 1];
        const regex = /^article-\d+\.html$/;
        if (regex.test(page)) {
            const match = page.match(/article-(\d+)\.html/);
            if (match) {
                const numStr = match[1]; 
                const newUrl = referer.replace(/(articles\/)\d+$/, `$1${numStr}`);
                return NextResponse.redirect(newUrl)
            }
        }
    }
    /*// 1. 排除不需要记录的资源
    const isStatic = pathname.match(/\.(png|jpg|jpeg|gif|svg|css|js|ico|woff2?|ttf|map)$/i);
    const isInternal = pathname.startsWith('/_next') || pathname.startsWith('/api');

    if (isStatic || isInternal) {
        return NextResponse.next();
    }

    // 2. 排除测试/开发环境的特定路由（按需保留）
    if (pathname === '/favicon.ico' || pathname === '/robots.txt') {
        return NextResponse.next();
    }
    // 3. 异步发送请求到 Express（不阻塞页面渲染）
    // 使用 Promise.resolve().then() 确保不阻塞当前请求流
    Promise.resolve().then(async () => {
        try {
            const fullUrl = pathname + (search || '');

            // 提取 IP
            const clientIp =
                request.headers.get('x-forwarded-for')?.split(',')[0].trim() ||
                request.headers.get('x-real-ip') ||
                '127.0.0.1';

            // 提取 User-Agent
            const userAgent = request.headers.get('user-agent') || '';

            // 提取会员信息（从 Cookie 或 Token 中）
            // 假设你把 JWT 存在了 cookie 中，名为 'token'
            let memberId = null;
            let memberName = null;
            const token = request.cookies.get('token')?.value;

            if (token) {
                try {
                    // ⚠️ 注意：Middleware 是 Edge 环境，不能直接引入 jsonwebtoken 库 (它依赖 Node.js crypto)。
                    // 如果需要解析 JWT，可以使用 jose 库：
                    // import { jwtVerify } from 'jose';
                    // const secret = new TextEncoder().encode(process.env.JWT_SECRET);
                    // const { payload } = await jwtVerify(token, secret);
                    // memberId = payload.id;
                    // memberName = payload.nickname || payload.username;

                    // 如果你不想引入 jose，也可以让 Express 端通过 token 字段再去解析
                } catch (e) {
                    // 忽略 token 解析错误
                }
            }

            // 发送给 Express
            await fetch(`${API_BASE_URL}/logs/visit`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({
                    pageUrl: fullUrl,
                    memberId,
                    memberName,
                    userAgent,
                    clientIp,
                    token, // 如果你不想在 Next 端解析 JWT，可以把 token 传给 Express，让 Express 解析出用户信息
                }),
            });
        } catch (err) {
            console.error('Middleware 记录页面访问失败:', err);
        }
    });*/

    // 4. 立即放行请求，不等待日志写入完成
    return NextResponse.next();
}

// ✅ 匹配所有路径，但排除静态资源
export const config = {
    matcher: [
        /*
         * 匹配所有请求路径，除了：
         * - api (API routes)
         * - _next/static (static files)
         * - _next/image (image optimization files)
         * - favicon.ico (favicon file)
         */
        '/((?!api|_next/static|_next/image|favicon.ico).*)',
    ],
};