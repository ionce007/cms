// lib/qiniuUpload.ts
'use client';

import * as qiniu from 'qiniu-js';
import { API_BASE_URL } from '@/config/env';

export interface UploadResult {
    /** ✅ 原始 HTTP URL（用于保存到数据库） */
    originalUrl: string;
    /** 图片 key */
    key: string;
}

export async function uploadImageToQiniu(
    file: File,
    onProgress?: (percent: number) => void
): Promise<UploadResult> {
    // 1. 获取上传 Token
    const tokenRes = await fetch(`${API_BASE_URL}/upload/qiniu-token`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
            fileName: file.name,
            fileType: file.type,
        }),
    });

    const tokenData = await tokenRes.json();

    if (tokenData.code !== 1) {
        throw new Error(tokenData.message || '获取上传凭证失败');
    }

    const { token, key, domain } = tokenData.data;

    // 2. 上传
    const observable = qiniu.upload(
        file,
        key,
        token,
        { fname: file.name, mimeType: file.type },
        { useCdnDomain: true }
    );

    return new Promise<UploadResult>((resolve, reject) => {
        observable.subscribe({
            next: (res) => {
                onProgress?.(res.total.percent);
            },
            error: (err) => {
                console.error('七牛上传失败:', err);
                reject(new Error(err.message || '上传失败'));
            },
            complete: (res) => {
                // ✅ 返回原始 HTTP URL
                const originalUrl = `http://${domain}/${res.key}`;
                resolve({
                    originalUrl,
                    key: res.key,
                });
            },
        });
    });
}

export async function compressImage(
    file: File,
    maxWidth = 800,
    maxHeight = 800,
    quality = 0.8
): Promise<File> {
    return new Promise((resolve, reject) => {
        const reader = new FileReader();
        reader.readAsDataURL(file);

        reader.onload = (e) => {
            const img = new Image();
            img.src = e.target?.result as string;

            img.onload = () => {
                let { width, height } = img;

                let scale = 1;
                if (width > maxWidth) scale = maxWidth / width;
                if (height * scale > maxHeight) scale = maxHeight / height;

                const newWidth = Math.round(width * scale);
                const newHeight = Math.round(height * scale);

                if (scale === 1 && file.size <= 1024 * 1024) {
                    resolve(file);
                    return;
                }

                const canvas = document.createElement('canvas');
                canvas.width = newWidth;
                canvas.height = newHeight;

                const ctx = canvas.getContext('2d');
                if (!ctx) {
                    resolve(file);
                    return;
                }

                ctx.imageSmoothingEnabled = true;
                ctx.imageSmoothingQuality = 'high';
                ctx.drawImage(img, 0, 0, newWidth, newHeight);

                canvas.toBlob(
                    (blob) => {
                        if (!blob || blob.size > file.size) {
                            resolve(file);
                            return;
                        }
                        resolve(new File([blob], file.name, {
                            type: 'image/jpeg',
                            lastModified: Date.now(),
                        }));
                    },
                    'image/jpeg',
                    quality
                );
            };

            img.onerror = () => reject(new Error('图片加载失败'));
        };

        reader.onerror = () => reject(new Error('文件读取失败'));
    });
}