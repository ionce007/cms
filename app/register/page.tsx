// app/register/page.tsx
import type { Metadata } from 'next';
import RegisterClient from './RegisterClient';

export const metadata: Metadata = {
    title: '注册',
    description: '创建您的账户，开始使用本站提供的股票技术分析、指标公式和选股公式下载服务',
    keywords: ['注册', '会员注册', '股票指标公式', '选股公式'],
    openGraph: {
        title: '注册 - TechBlog',
        description: '创建您的账户，开始使用本站服务',
        type: 'website',
    },
    robots: {
        index: false,  // 注册页不需要被搜索引擎索引
        follow: false,
    },
};

export default function RegisterPage() {
    return <RegisterClient />;
}