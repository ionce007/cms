// app/admin/layout.tsx
import { AdminAuthProvider } from '@/contexts/AdminAuthContext';
import AdminLayoutClient from './AdminLayoutClient';

export const metadata = {
    title: '后台管理',
};

export default function AdminLayout({ children }: { children: React.ReactNode }) {
    return (
        <AdminAuthProvider>
            <AdminLayoutClient>{children}</AdminLayoutClient>
        </AdminAuthProvider>
    );
}