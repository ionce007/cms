// app/admin/layout.tsx
import AdminLayoutClient from './AdminLayoutClient';

export const metadata = {
    title: '管理后台',
};

export default function AdminLayout({
    children,
}: {
    children: React.ReactNode;
}) {
    return <AdminLayoutClient>{children}</AdminLayoutClient>;
}