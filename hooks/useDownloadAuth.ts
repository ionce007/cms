// hooks/useDownloadAuth.ts
'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { useAuth } from '@/contexts/AuthContext';

export function useDownloadAuth() {
    const { isLoggedIn, token } = useAuth();
    const [needLogin, setNeedLogin] = useState(false);

    const checkAuth = (): boolean => {
        if (!isLoggedIn || !token) {
            setNeedLogin(true);
            return false;
        }
        return true;
    };

    return {
        checkAuth,
        needLogin,
        closeLoginModal: () => setNeedLogin(false),
    };
}