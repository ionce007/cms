// app/layout.tsx
import type { Metadata } from 'next';
import '../public/css/globals.css';

export const metadata: Metadata = {
    title: {
        default: 'TechBlog - 技术博客',
        template: '%s | TechBlog',
    },
    description: '分享技术知识，记录开发心得',
};

export default function RootLayout({
    children,
}: {
    children: React.ReactNode;
}) {
    return (
        <html lang="zh-CN">
            <body>
                {children}
            </body>
        </html>
    );
}