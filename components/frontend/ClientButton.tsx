// app/ClientButton.tsx（客户端组件）
'use client';
import { ButtonProps } from '@/types/frontend';

export default function ClientButton({ key, label, className, onClick }: ButtonProps) {
    const handleClick = () => {
        console.log('按钮被点击');
    };

    return (
        <button id={key} onClick={onClick} className={className}>
            {label}
        </button>
    );
}