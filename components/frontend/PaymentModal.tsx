// components/frontend/PaymentModal.tsx
'use client';

import { useState, useEffect } from 'react';
import { cn } from '@/lib/utils';
import { API_BASE_URL } from '@/config/env';
import { API_ENDPOINTS } from '@/config/routes'
import { getProxiedImageUrl, getSiteProtocol } from '@/lib/imageProxy';

interface PaymentModalProps {
    isOpen: boolean;
    onClose: () => void;
    /** 文件信息 */
    fs_id: string;
    fileName: string;
    price: number;
    /** 点击确认下载后的回调 */
    onConfirmDownload: () => void | Promise<void>;
    /** 微信支付二维码图片地址 */
    wechatQrCode?: string;
    /** 支付宝支付二维码图片地址 */
    alipayQrCode?: string;
}

type PayMethod = 'wechat' | 'alipay';

export default function PaymentModal({
    isOpen,
    onClose,
    fs_id,
    fileName,
    price,
    onConfirmDownload,
    wechatQrCode = process.env.NEXT_PUBLIC_PAY_WX || '//img.foryet.com/uploads/2026/0125_31014606929_wxPay.png',
    alipayQrCode = process.env.NEXT_PUBLIC_PAY_ALIPAY || '//img.foryet.com/uploads/2026/0125_31014634042_zfbPay.png',
}: PaymentModalProps) {
    const [payMethod, setPayMethod] = useState<PayMethod>('wechat');
    const [isDownloading, setIsDownloading] = useState(false);
    const [copied, setCopied] = useState(false);

    const [protocol, setProtocol] = useState<'http:' | 'https:'>('https:');

    useEffect(() => {
        // ✅ 客户端挂载后，读取真实协议
        setProtocol(getSiteProtocol());
    }, []);

    // ✅ Esc 关闭
    useEffect(() => {
        const handleKeyDown = (e: KeyboardEvent) => {
            if (e.key === 'Escape' && isOpen) {
                onClose();
            }
        };
        document.addEventListener('keydown', handleKeyDown);
        return () => document.removeEventListener('keydown', handleKeyDown);
    }, [isOpen, onClose]);

    // ✅ 锁定滚动
    useEffect(() => {
        if (isOpen) {
            document.body.style.overflow = 'hidden';
        } else {
            document.body.style.overflow = 'unset';
        }
        return () => {
            document.body.style.overflow = 'unset';
        };
    }, [isOpen]);

    // ✅ 关闭时重置状态
    useEffect(() => {
        if (!isOpen) {
            setPayMethod('wechat');
            setIsDownloading(false);
            setCopied(false);
        }
    }, [isOpen]);

    const handleConfirmDownload = async () => {
        if (!fs_id) return;

        setIsDownloading(true);
        try {
            const downUrl = `${API_BASE_URL}${API_ENDPOINTS.FORMULA_DETAIL(fs_id)}/download`
            const res = await fetch(downUrl);
            debugger
            const data = await res.json();

            if (data.code === 1 && data.url) {
                window.open(data.url, '_blank');
            } else {
                alert(data.message || '获取下载链接失败');
            }
        } catch (err) {
            console.error('下载失败:', err);
            alert('下载失败，请稍后重试');
        } finally {
            setIsDownloading(false);
        }
    };

    if (!isOpen) return null;

    const QrCode = payMethod === 'wechat' ? wechatQrCode : alipayQrCode;
    const currentQrCode = getProxiedImageUrl(QrCode, { protocol });

    return (
        <div className="fixed inset-0 z-[9999] flex items-center justify-center">
            {/* 遮罩层 */}
            <div
                className="absolute inset-0 bg-black/50 backdrop-blur-sm animate-fade-in"
                onClick={onClose}
            />

            {/* 弹窗内容 */}
            <div className="relative bg-white rounded-2xl shadow-2xl w-full max-w-md mx-4 overflow-hidden animate-scale-in">
                {/* 关闭按钮 */}
                <button
                    onClick={onClose}
                    className="absolute top-4 right-4 p-1.5 rounded-lg text-gray-400 hover:text-gray-600 hover:bg-gray-100 transition-colors z-10"
                    aria-label="关闭"
                >
                    <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                    </svg>
                </button>

                {/* 头部 */}
                <div className="px-6 pt-4 pb-2 text-center">
                    <div className="w-14 h-14 bg-gradient-to-br from-primary-500 to-primary-700 rounded-2xl flex items-center justify-center mx-auto mb-3">
                        <svg className="w-7 h-7 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-4l-4 4m0 0l-4-4m4 4V4" />
                        </svg>
                    </div>
                    <h3 className="text-xl font-bold text-gray-800 mb-1">
                        请我喝杯咖啡 ☕
                    </h3>
                    <p className="text-sm text-gray-500 truncate max-w-full px-4">
                        {fileName.substring(0, fileName.lastIndexOf('.'))}
                    </p>
                </div>

                {/* 价格 */}
                <div className="px-6 pb-2 text-center">
                    <div className="inline-flex items-baseline space-x-1 text-primary-600">
                        <span className="text-2xl font-bold">¥</span>
                        <span className="text-4xl font-bold">{price}</span>
                    </div>
                </div>

                {/* 支付方式切换 */}
                <div className="px-6 pb-2">
                    <div className="flex items-center gap-2 p-1 bg-gray-100 rounded-xl">
                        <button
                            onClick={() => setPayMethod('wechat')}
                            className={cn(
                                'flex-1 flex items-center justify-center gap-2 px-4 py-2.5 rounded-lg text-sm font-medium transition-all',
                                payMethod === 'wechat'
                                    ? 'bg-white text-green-600 shadow-sm'
                                    : 'text-gray-600 hover:text-gray-800'
                            )}
                        >
                            {/* 微信图标 */}
                            <svg className="w-5 h-5" viewBox="0 0 24 24" fill="currentColor">
                                <path d="M8.691 2.188C3.891 2.188 0 5.476 0 9.53c0 2.212 1.17 4.203 3.002 5.55a.59.59 0 0 1 .213.665l-.39 1.48c-.019.07-.048.141-.048.213 0 .163.13.295.29.295a.326.326 0 0 0 .167-.054l1.903-1.114a.864.864 0 0 1 .717-.098 10.16 10.16 0 0 0 2.837.403c.276 0 .543-.027.811-.05-.857-2.578.157-4.972 1.932-6.446 1.703-1.415 3.882-1.98 5.853-1.838-.576-3.583-4.196-6.348-8.595-6.348zM5.785 5.991c.642 0 1.162.529 1.162 1.18a1.17 1.17 0 0 1-1.162 1.178A1.17 1.17 0 0 1 4.623 7.17c0-.651.52-1.18 1.162-1.18zm5.813 0c.642 0 1.162.529 1.162 1.18a1.17 1.17 0 0 1-1.162 1.178 1.17 1.17 0 0 1-1.162-1.178c0-.651.52-1.18 1.162-1.18zm5.34 2.867c-1.797-.052-3.746.512-5.28 1.786-1.72 1.428-2.687 3.72-1.78 6.22.942 2.453 3.666 4.229 6.884 4.229.826 0 1.622-.12 2.361-.336a.722.722 0 0 1 .598.082l1.584.926a.272.272 0 0 0 .14.047c.134 0 .24-.111.24-.247 0-.06-.023-.12-.038-.177l-.327-1.233a.582.582 0 0 1-.023-.156.49.49 0 0 1 .201-.398C23.024 18.48 24 16.82 24 14.98c0-3.21-2.931-5.837-6.656-6.088V8.89c-.135-.01-.27-.027-.407-.03zm-2.53 3.274c.535 0 .969.44.969.982a.976.976 0 0 1-.969.983.976.976 0 0 1-.969-.983c0-.542.434-.982.97-.982zm4.844 0c.535 0 .969.44.969.982a.976.976 0 0 1-.969.983.976.976 0 0 1-.969-.983c0-.542.434-.982.97-.982z" />
                            </svg>
                            <span>微信支付</span>
                        </button>
                        <button
                            onClick={() => setPayMethod('alipay')}
                            className={cn(
                                'flex-1 flex items-center justify-center gap-2 px-4 py-2.5 rounded-lg text-sm font-medium transition-all',
                                payMethod === 'alipay'
                                    ? 'bg-white text-blue-600 shadow-sm'
                                    : 'text-gray-600 hover:text-gray-800'
                            )}
                        >
                            {/* 支付宝图标 */}
                            <svg className="w-5 h-5" viewBox="0 0 24 24" fill="currentColor">
                                <path d="M21.422 15.358c-2.044-.78-4.892-1.85-7.855-3.076a21.6 21.6 0 0 0 1.218-3.482h-3.162V7.5h4.4V6.302h-4.4V4.2h-1.972v2.102h-4.4V7.5h4.4v1.3h-3.618v1.302h6.244c-.262.85-.578 1.67-.94 2.446-1.282-.482-2.63-.922-3.906-1.25-2.6 4.4-5.9 5.536-8.32 5.536-1.464 0-3.44-.28-3.44-2.098 0-1.664 1.86-3.352 5.148-3.352.906 0 1.796.116 2.62.336.18-.318.36-.644.53-.972.152-.288.302-.576.444-.864-1.158-.228-2.354-.36-3.594-.36-3.966 0-6.882 2.03-6.882 4.966 0 2.28 2.084 3.96 5.224 3.96 2.728 0 5.788-1.302 8.156-5.004 1.622.62 3.16 1.294 4.502 1.9.364.164.714.322 1.044.472-.164 3.632-2.26 4.63-4.404 4.63-2.328 0-4.6-1.31-6.354-3.364l-1.556.94c2.276 2.76 5.31 4.36 8.194 4.36 3.652 0 6.164-2.166 6.32-5.904zm-13.88-1.632c-2.528 0-3.816 1.052-3.816 2.022 0 .87.974 1.302 2.15 1.302 1.966 0 4.348-1.012 6.096-4.336a9.32 9.32 0 0 0-2.09-.226 8.878 8.878 0 0 0-2.34.238z" />
                            </svg>
                            <span>支付宝</span>
                        </button>
                    </div>
                </div>

                {/* 二维码 */}
                <div className="px-6 pb-2">
                    <div className="bg-gray-50 rounded-xl p-4 flex flex-col items-center">
                        {/* 二维码容器 */}
                        <div className="relative w-48 h-48 bg-white rounded-lg p-2 shadow-sm">
                            <img
                                src={currentQrCode}
                                alt={payMethod === 'wechat' ? '微信支付' : '支付宝'}
                                className="w-full h-full object-contain"
                                onError={(e) => {
                                    // 加载失败时显示占位
                                    const target = e.currentTarget;
                                    target.style.display = 'none';
                                    const parent = target.parentElement;
                                    if (parent && !parent.querySelector('.qr-fallback')) {
                                        const fallback = document.createElement('div');
                                        fallback.className = 'qr-fallback absolute inset-0 flex flex-col items-center justify-center bg-gray-100 rounded-lg text-gray-400';
                                        fallback.innerHTML = `
                                            <svg class="w-12 h-12 mb-2" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 4v1m6 11h2m-6 0h-2v4m0-11v3m0 0h.01M12 12h4.01M16 20h4M4 12h4m12 0h.01M5 8h2a1 1 0 001-1V5a1 1 0 00-1-1H5a1 1 0 00-1 1v2a1 1 0 001 1zm14 0h2a1 1 0 001-1V5a1 1 0 00-1-1h-2a1 1 0 00-1 1v2a1 1 0 001 1zM5 20h2a1 1 0 001-1v-2a1 1 0 00-1-1H5a1 1 0 00-1 1v2a1 1 0 001 1z" />
                                            </svg>
                                            <span class="text-xs">二维码加载中</span>
                                        `;
                                        parent.appendChild(fallback);
                                    }
                                }}
                            />
                        </div>

                        <p className="text-sm text-gray-600 mt-3 text-center">
                            请使用
                            <span className={cn(
                                'font-medium mx-1',
                                payMethod === 'wechat' ? 'text-green-600' : 'text-blue-600'
                            )}>
                                {payMethod === 'wechat' ? '微信' : '支付宝'}
                            </span>
                            扫码支付
                        </p>
                        {/* <p className="text-xs text-gray-400 mt-1">
                            支付完成后请点击下方按钮下载
                        </p>*/}
                    </div>
                </div>

                {/* 提示信息 */}
                {/*<div className="px-6 pb-4">
                    <div className="flex items-start gap-2 p-3 bg-amber-50 border border-amber-200 rounded-lg">
                        <svg className="w-4 h-4 text-amber-500 flex-shrink-0 mt-0.5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                        </svg>
                        <p className="text-xs text-amber-700 leading-relaxed">
                            请先完成支付，再点击"立即下载"。如遇问题，请联系客服。
                        </p>
                    </div>
                </div>*/}

                {/* 操作按钮 */}
                <div className="px-6 pb-6 flex gap-3">
                    <button
                        onClick={onClose}
                        disabled={isDownloading}
                        className="flex-1 px-4 py-3 bg-gray-100 text-gray-700 rounded-xl font-medium hover:bg-gray-200 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                    >
                        取消
                    </button>
                    <button
                        onClick={handleConfirmDownload}
                        disabled={isDownloading}
                        className="flex-1 px-4 py-3 bg-primary-600 text-white rounded-xl font-medium hover:bg-primary-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed inline-flex items-center justify-center gap-2"
                    >
                        {isDownloading ? (
                            <>
                                <svg className="w-5 h-5 animate-spin" fill="none" viewBox="0 0 24 24">
                                    <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                                    <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z" />
                                </svg>
                                <span>准备中...</span>
                            </>
                        ) : (
                            <>
                                <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-4l-4 4m0 0l-4-4m4 4V4" />
                                </svg>
                                <span>立即下载</span>
                            </>
                        )}
                    </button>
                </div>
            </div>
        </div>
    );
}