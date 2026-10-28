// app/member/settings/page.tsx
'use client';

import { useState, useEffect, useRef } from 'react';
import { useMemberUser } from '../MemberLayoutClient';
import { useMemberFetch } from '@/hooks/useMemberFetch';
import { uploadImageToQiniu, compressImage } from '@/lib/qiniuUpload';
import CoverImage from '@/components/frontend/CoverImage';
import ImageCropperModal from '@/components/frontend/ImageCropperModal';

export default function MemberSettingsPage() {
    const { user, refresh } = useMemberUser();
    const { memberFetch } = useMemberFetch();

    const [form, setForm] = useState({ nickname: '', avatar: '' });
    const [submitting, setSubmitting] = useState(false);

    // ✅ 图片上传与裁剪状态
    const [uploading, setUploading] = useState(false);
    const [uploadProgress, setUploadProgress] = useState(0);
    const [selectedImage, setSelectedImage] = useState<string | null>(null); // 待裁剪的图片
    const fileInputRef = useRef<HTMLInputElement>(null);

    useEffect(() => {
        if (user) {
            setForm({
                nickname: user.nickname || '',
                avatar: user.avatar || '',
            });
        }
    }, [user]);

    // ✅ 第一步：读取本地文件，转成 DataURL，弹窗裁剪
    const handleFileSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
        const file = e.target.files?.[0];
        if (!file) return;

        if (!file.type.startsWith('image/')) {
            alert('请选择图片文件');
            return;
        }

        const reader = new FileReader();
        reader.onload = () => {
            setSelectedImage(reader.result as string); // 显示裁剪弹窗
        };
        reader.readAsDataURL(file);

        // 清空 input 允许重复选择同一张图
        if (fileInputRef.current) fileInputRef.current.value = '';
    };

    // ✅ 第二步：裁剪完成，获取裁剪后的 Blob，上传至七牛云
    const handleCropComplete = async (croppedBlob: Blob) => {
        setSelectedImage(null); // 关闭裁剪弹窗
        setUploading(true);
        setUploadProgress(0);

        try {
            // 1. 转为 File 对象以便压缩
            const file = new File([croppedBlob], 'avatar.jpg', { type: 'image/jpeg' });

            // 2. 压缩（头像 400x400 足够）
            const compressed = await compressImage(file, 400, 400, 0.8);

            // 3. 上传至七牛云
            const result = await uploadImageToQiniu(compressed, 'avatar', false, (percent) => {
                setUploadProgress(Math.round(percent));
            });

            // 4. 更新表单头像地址
            setForm(prev => ({ ...prev, avatar: result.originalUrl }));
            alert('头像上传成功，点击保存以生效');
        } catch (err) {
            console.error('头像上传失败:', err);
            alert(err instanceof Error ? err.message : '上传失败');
        } finally {
            setUploading(false);
            setUploadProgress(0);
        }
    };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setSubmitting(true);

        const result = await memberFetch('/member/profile', {
            method: 'PUT',
            body: JSON.stringify(form),
        });

        if (result.ok) {
            alert('保存成功');
            await refresh();
        } else {
            alert(result.message || '保存失败');
        }

        setSubmitting(false);
    };

    return (
        <>
            <div className="mb-6">
                <h1 className="text-2xl font-bold text-gray-900 mb-1">个人设置</h1>
                <p className="text-sm text-gray-500">管理你的个人资料</p>
            </div>

            <div className="bg-white rounded-xl border border-gray-200 p-6 max-w-lg">
                <form onSubmit={handleSubmit} className="space-y-4">

                    {/* ✅ 头像上传区 */}
                    <div>
                        <label className="block text-sm font-medium text-gray-700 mb-2">
                            头像
                        </label>
                        <div className="flex items-center gap-4">
                            {/* 头像预览 */}
                            <div className="w-20 h-20 rounded-full overflow-hidden bg-gray-100 flex-shrink-0 border border-gray-200 shadow-sm">
                                <CoverImage
                                    src={form.avatar}
                                    alt="头像"
                                    className="w-full h-full"
                                    fallbackIcon="👤"
                                />
                            </div>

                            {/* 上传按钮 */}
                            <div className="flex-1">
                                <input
                                    ref={fileInputRef}
                                    type="file"
                                    accept="image/*"
                                    onChange={handleFileSelect}
                                    className="hidden"
                                />
                                <button
                                    type="button"
                                    onClick={() => fileInputRef.current?.click()}
                                    disabled={uploading}
                                    className="px-4 py-2 bg-gray-100 text-gray-700 rounded-lg text-sm 
                             font-medium hover:bg-gray-200 transition-colors 
                             disabled:opacity-50"
                                >
                                    {uploading ? `上传中 ${uploadProgress}%` : '选择并裁剪图片'}
                                </button>
                                <p className="text-xs text-gray-400 mt-1">
                                    支持 JPG、PNG 格式，点击后可以进行裁剪
                                </p>
                            </div>
                        </div>
                    </div>

                    <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1.5">
                            昵称
                        </label>
                        <input
                            type="text"
                            value={form.nickname}
                            onChange={e => setForm({ ...form, nickname: e.target.value })}
                            className="w-full px-3 py-2.5 border border-gray-300 rounded-lg text-sm 
                         focus:outline-none focus:ring-2 focus:ring-primary-500"
                        />
                    </div>

                    <button
                        type="submit"
                        disabled={submitting || uploading}
                        className="w-full py-2.5 bg-primary-600 text-white rounded-lg text-sm 
                       font-medium hover:bg-primary-700 transition-colors 
                       disabled:opacity-50"
                    >
                        {submitting ? '保存中...' : '保存'}
                    </button>
                </form>
            </div>

            {/* ✅ 渲染裁剪弹窗 */}
            {/*{selectedImage && (
                <ImageCropperModal
                    imageSrc={selectedImage}
                    onCropComplete={handleCropComplete}
                    onCancel={() => setSelectedImage(null)}
                    aspectRatio={1} // 头像强制为 1:1 正方形
                />
            )}*/}
            {selectedImage && (
                <ImageCropperModal
                    imageSrc={selectedImage}
                    config={{
                        cropShape: 'round',
                        aspectRatio: 1,
                        showGrid: false,
                        minZoom: 1,
                        maxZoom: 3,
                    }}
                    onCropComplete={handleCropComplete}
                    onCancel={() => setSelectedImage(null)}
                />
            )}
        </>
    );
}