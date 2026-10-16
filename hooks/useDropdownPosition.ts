// hooks/useDropdownPosition.ts
'use client';

import { useRef, useState, useCallback } from 'react';

export function useDropdownPosition() {
    const buttonRef = useRef<HTMLButtonElement>(null);
    const [position, setPosition] = useState({ top: 0, left: 0 });

    const updatePosition = useCallback(() => {
        if (buttonRef.current) {
            const rect = buttonRef.current.getBoundingClientRect();
            const dropdownWidth = 200; // 预估宽度
            const windowWidth = window.innerWidth;

            // 防止右侧溢出
            let left = rect.left;
            if (left + dropdownWidth > windowWidth - 20) {
                left = windowWidth - dropdownWidth - 20;
            }

            setPosition({
                top: rect.bottom + 4,
                left: Math.max(10, left),
            });
        }
    }, []);

    return { buttonRef, position, updatePosition };
}