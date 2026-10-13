// app/member/bookmarks/page.tsx
import type { Metadata } from 'next';
import BookmarksClient from './BookmarksClient';

export const metadata: Metadata = {
    title: '我的收藏',
};

export default function BookmarksPage() {
    return <BookmarksClient />;
}