// components/admin/Modal.tsx
'use client';

import { useEffect, isValidElement, cloneElement } from 'react';
import { X } from 'lucide-react';
import { cn } from '@/lib/utils';
import { getProxiedImageUrl } from '@/lib/imageProxy';

interface ModalProps {
    isOpen: boolean;
    onClose: () => void;
    title: string;
    children: React.ReactNode;
    footer?: React.ReactNode;
    size?: 'sm' | 'md' | 'lg' | 'xl';
}

export default function Modal({
    isOpen,
    onClose,
    title,
    children,
    footer,
    size = 'md',
}: ModalProps) {
    // 禁止背景滚动
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

    /** 递归遍历 children，把 <img> 的 src 改写成代理地址 */
    function proxyImages(node: React.ReactNode): React.ReactNode {
        if (Array.isArray(node)) return node.map(proxyImages);
        if (!isValidElement(node)) return node;

        const el = node as React.ReactElement<{ src?: string; children?: React.ReactNode }>;
        let props: Record<string, unknown> = {};

        // 处理原生 img
        if (el.type === 'img' && typeof el.props.src === 'string') {
            props.src = getProxiedImageUrl(el.props.src, { forceProxy: true });//toProxySrc(el.props.src);
        }
        // 处理 next/image（如果你在 children 里用了）
        if (typeof el.type === 'function' && 'src' in el.props && typeof el.props.src === 'string') {
            // 保守起见：仅当 children 里明确是 <Image> 组件时改写
            props.src = getProxiedImageUrl(el.props.src, { forceProxy: true }); //toProxySrc(el.props.src);
        }

        const nextChildren = el.props.children ? proxyImages(el.props.children) : el.props.children;
        return cloneElement(el, { ...props, children: nextChildren });
    }

    if (!isOpen) return null;

    const sizeClasses = {
        sm: 'max-w-md',
        md: 'max-w-lg',
        lg: 'max-w-2xl',
        xl: 'max-w-4xl',
    };

    return (
        // ✅ 1. 使用 fixed inset-0 覆盖全屏
        // ✅ 2. 使用 flex items-center justify-center 实现水平和垂直居中
        // ✅ 3. 加 p-4 防止在小屏幕上贴边
        <div className="fixed inset-0 z-[1000] flex items-center justify-center p-4 sm:p-6">

            {/* 遮罩层 */}
            <div
                className="absolute inset-0 bg-black/50 backdrop-blur-sm transition-opacity animate-in fade-in"
                onClick={onClose}
            />

            {/* ✅ 弹窗主体：确保 relative 以覆盖遮罩层，限制 max-h-[90vh] 防止溢出 */}
            <div
                className={cn(
                    "relative w-full bg-white rounded-xl shadow-2xl flex flex-col overflow-hidden animate-in zoom-in-95 duration-200 max-h-[90vh]",
                    sizeClasses[size]
                )}
            >
                {/* 头部 (固定) */}
                <div className="flex items-center justify-between px-5 py-3 border-b border-gray-100 flex-shrink-0">
                    <h2 className="text-base font-bold text-gray-800">{title}</h2>
                    <button
                        onClick={onClose}
                        className="p-1 text-gray-400 hover:text-gray-600 hover:bg-gray-100 rounded transition-colors"
                    >
                        <X className="w-5 h-5" />
                    </button>
                </div>

                {/* 内容区 (自适应剩余空间，超出滚动) */}
                <div className="flex-1 overflow-y-auto p-5 scrollbar-thin">
                    {proxyImages(children)}
                </div>

                {/* 底部按钮区 (固定) */}
                {footer && (
                    <div className="px-5 py-3 border-t border-gray-100 bg-gray-50 flex justify-end gap-2 flex-shrink-0">
                        {footer}
                    </div>
                )}
            </div>
        </div>
    );
}