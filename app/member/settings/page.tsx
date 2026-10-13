// app/member/settings/page.tsx
import type { Metadata } from 'next';
import SettingsClient from './SettingsClient';

export const metadata: Metadata = {
    title: '账号设置',
};

export default function SettingsPage() {
    return <SettingsClient />;
}