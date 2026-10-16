// components/frontend/RichTextEditor.tsx
'use client';

import {
    useRef,
    useState,
    forwardRef,
    useImperativeHandle,
    useEffect,
    useCallback,
} from 'react';
import { uploadImageToQiniu, compressImage } from '@/lib/qiniuUpload';
import { getProxiedImageUrl } from '@/lib/imageProxy';
import { cn } from '@/lib/utils';

export interface RichTextEditorHandle {
    getHtml: () => string;
    setHtml: (html: string) => void;
    clear: () => void;
    focus: () => void;
    isUploading: () => boolean;
}

interface RichTextEditorProps {
    placeholder?: string;
    minHeight?: number;
    maxLength?: number;
    className?: string;
    onChange?: (html: string) => void;
    onBlur?: () => void;
    allowImage?: boolean;
}

// ============ 预设配置 ============

const FONT_FAMILIES = [
    { label: '默认字体', value: '' },
    { label: '宋体', value: 'SimSun, serif' },
    { label: '黑体', value: 'SimHei, sans-serif' },
    { label: '微软雅黑', value: 'Microsoft YaHei, sans-serif' },
    { label: '楷体', value: 'KaiTi, serif' },
    { label: 'Arial', value: 'Arial, sans-serif' },
    { label: 'Times New Roman', value: '"Times New Roman", serif' },
    { label: 'Courier New', value: '"Courier New", monospace' },
];

const FONT_SIZES = [
    { label: '12px', value: '2' },
    { label: '14px', value: '3' },
    { label: '16px', value: '4' },
    { label: '18px', value: '5' },
    { label: '24px', value: '6' },
    { label: '32px', value: '7' },
];

const IMAGE_SIZE_PRESETS = [
    { label: '小图 (30%)', value: '30%' },
    { label: '中图 (50%)', value: '50%' },
    { label: '大图 (80%)', value: '80%' },
    { label: '原始大小 (100%)', value: '100%' },
    { label: '原始尺寸', value: 'original' },
];

const TEXT_COLORS = [
    '#000000', '#374151', '#6b7280', '#9ca3af',
    '#ef4444', '#f97316', '#f59e0b', '#eab308',
    '#22c55e', '#10b981', '#06b6d4', '#3b82f6',
    '#6366f1', '#8b5cf6', '#ec4899', '#f43f5e',
];

const BG_COLORS = [
    'transparent',
    '#fef3c7', '#dbeafe', '#dcfce7', '#fee2e2', '#fce7f3',
    '#f3e8ff', '#e0e7ff', '#ccfbf1', '#fef9c3', '#ffedd5',
    '#f1f5f9', '#e2e8f0', '#1f2937', '#000000',
];

// ============ 下拉定位 Hook ============
function useDropdownPosition(width = 200) {
    const buttonRef = useRef<HTMLButtonElement>(null);
    const [position, setPosition] = useState({ top: 0, left: 0 });

    const updatePosition = useCallback(() => {
        if (buttonRef.current) {
            const rect = buttonRef.current.getBoundingClientRect();
            const windowWidth = window.innerWidth;

            let left = rect.left;
            if (left + width > windowWidth - 20) {
                left = windowWidth - width - 20;
            }

            setPosition({
                top: rect.bottom + 4,
                left: Math.max(10, left),
            });
        }
    }, [width]);

    return { buttonRef, position, updatePosition };
}

// ============ 组件 ============

const RichTextEditor = forwardRef<RichTextEditorHandle, RichTextEditorProps>(
    function RichTextEditor(
        {
            placeholder = '请输入内容...',
            minHeight = 200,
            maxLength = 5000,
            className,
            onChange,
            onBlur,
            allowImage = true,
        },
        ref
    ) {
        const editorRef = useRef<HTMLDivElement>(null);
        const fileInputRef = useRef<HTMLInputElement>(null);

        const [isEmpty, setIsEmpty] = useState(true);
        const [uploading, setUploading] = useState(false);
        const [uploadProgress, setUploadProgress] = useState(0);
        const [isDragging, setIsDragging] = useState(false);

        // 图片选中
        const [selectedImage, setSelectedImage] = useState<HTMLImageElement | null>(null);
        const [showImageSizeMenu, setShowImageSizeMenu] = useState(false);

        // 下拉菜单
        const [showFontMenu, setShowFontMenu] = useState(false);
        const [showSizeMenu, setShowSizeMenu] = useState(false);
        const [showColorMenu, setShowColorMenu] = useState(false);
        const [showBgMenu, setShowBgMenu] = useState(false);
        const [showTableMenu, setShowTableMenu] = useState(false);

        // 弹窗
        const [dialogType, setDialogType] = useState<'link' | 'code' | null>(null);
        const [dialogValue, setDialogValue] = useState('');
        const [dialogText, setDialogText] = useState('');

        // ✅ 图片网址弹窗
        const [showImageUrlDialog, setShowImageUrlDialog] = useState(false);
        const [imageUrlForm, setImageUrlForm] = useState({
            url: '',
            alt: '',
        });

        // 图片自定义尺寸弹窗
        const [showImageSizeDialog, setShowImageSizeDialog] = useState(false);
        const [imageSizeForm, setImageSizeForm] = useState({
            width: '',
            height: '',
            lockRatio: true,
            originalWidth: 0,
            originalHeight: 0,
            ratio: 1,
        });

        // 源码模式
        const [showSource, setShowSource] = useState(false);
        const [sourceHtml, setSourceHtml] = useState('');

        // 下拉菜单定位
        const fontDropdown = useDropdownPosition(160);
        const sizeDropdown = useDropdownPosition(100);
        const colorDropdown = useDropdownPosition(160);
        const bgDropdown = useDropdownPosition(160);
        const tableDropdown = useDropdownPosition(260);
        const imageDropdown = useDropdownPosition(220);

        // ============ 暴露方法 ============
        useImperativeHandle(ref, () => ({
            getHtml: () => {
                if (showSource) return sourceHtml;
                return editorRef.current?.innerHTML || '';
            },
            setHtml: (html: string) => {
                if (showSource) {
                    setSourceHtml(html);
                } else if (editorRef.current) {
                    editorRef.current.innerHTML = html;
                    updateState();
                }
                setSourceHtml(html);
            },
            clear: () => {
                if (editorRef.current) {
                    editorRef.current.innerHTML = '';
                    updateState();
                    setSelectedImage(null);
                }
                setSourceHtml('');
            },
            focus: () => {
                if (!showSource) editorRef.current?.focus();
            },
            isUploading: () => uploading,
        }));

        // ============ 状态更新 ============
        const updateState = () => {
            if (!editorRef.current) return;
            const html = editorRef.current.innerHTML;
            const text = editorRef.current.textContent || '';
            setIsEmpty(!text.trim());
            setSourceHtml(html);
            onChange?.(html);
        };

        // ============ 点击外部关闭菜单 ============
        useEffect(() => {
            const handleClickOutside = (e: MouseEvent) => {
                const target = e.target as HTMLElement;
                if (
                    !target.closest('.editor-dropdown') &&
                    !target.closest('.editor-dropdown-menu')
                ) {
                    setShowFontMenu(false);
                    setShowSizeMenu(false);
                    setShowColorMenu(false);
                    setShowBgMenu(false);
                    setShowTableMenu(false);
                    setShowImageSizeMenu(false);
                }
            };
            document.addEventListener('mousedown', handleClickOutside);
            return () => document.removeEventListener('mousedown', handleClickOutside);
        }, []);

        // ============ 窗口滚动/缩放更新下拉位置 ============
        useEffect(() => {
            const handleResize = () => {
                if (showFontMenu) fontDropdown.updatePosition();
                if (showSizeMenu) sizeDropdown.updatePosition();
                if (showColorMenu) colorDropdown.updatePosition();
                if (showBgMenu) bgDropdown.updatePosition();
                if (showTableMenu) tableDropdown.updatePosition();
                if (showImageSizeMenu) imageDropdown.updatePosition();
            };

            window.addEventListener('resize', handleResize);
            window.addEventListener('scroll', handleResize, true);

            return () => {
                window.removeEventListener('resize', handleResize);
                window.removeEventListener('scroll', handleResize, true);
            };
        }, [
            showFontMenu, showSizeMenu, showColorMenu, showBgMenu,
            showTableMenu, showImageSizeMenu,
            fontDropdown, sizeDropdown, colorDropdown,
            bgDropdown, tableDropdown, imageDropdown,
        ]);

        // ============ 编辑器点击（选中图片） ============
        const handleEditorClick = (e: React.MouseEvent) => {
            const target = e.target as HTMLElement;
            if (target.tagName === 'IMG') {
                const img = target as HTMLImageElement;
                editorRef.current?.querySelectorAll('img').forEach(el => {
                    el.classList.remove('image-selected');
                });
                img.classList.add('image-selected');
                setSelectedImage(img);
            } else {
                editorRef.current?.querySelectorAll('img').forEach(el => {
                    el.classList.remove('image-selected');
                });
                setSelectedImage(null);
            }
        };

        // ============ 基础命令 ============
        const execCommand = (command: string, value?: string) => {
            editorRef.current?.focus();
            document.execCommand(command, false, value);
            updateState();
        };

        // ============ 字体 ============
        const applyFontFamily = (font: string) => {
            if (font) {
                execCommand('fontName', font);
            } else {
                execCommand('removeFormat');
            }
            setShowFontMenu(false);
        };

        // ============ 字号 ============
        const applyFontSize = (size: string) => {
            execCommand('fontSize', size);
            setShowSizeMenu(false);
        };

        // ============ 对齐 ============
        const applyAlign = (align: 'Left' | 'Center' | 'Right' | 'Justify') => {
            execCommand(`justify${align}`);
        };

        // ============ 颜色 ============
        const applyTextColor = (color: string) => {
            execCommand('foreColor', color);
            setShowColorMenu(false);
        };

        const applyBgColor = (color: string) => {
            editorRef.current?.focus();
            document.execCommand('hiliteColor', false, color);
            document.execCommand('backColor', false, color);
            updateState();
            setShowBgMenu(false);
        };

        // ============ 插入表格 ============
        const insertTable = (rows: number, cols: number) => {
            let tableHtml = `<table style="width: 100%; border-collapse: collapse; margin: 12px 0;">`;
            for (let i = 0; i < rows; i++) {
                tableHtml += '<tr>';
                for (let j = 0; j < cols; j++) {
                    const tag = i === 0 ? 'th' : 'td';
                    const styles = i === 0
                        ? 'border: 1px solid #d1d5db; padding: 8px; background: #f9fafb; font-weight: 600;'
                        : 'border: 1px solid #d1d5db; padding: 8px;';
                    tableHtml += `<${tag} style="${styles}">&nbsp;</${tag}>`;
                }
                tableHtml += '</tr>';
            }
            tableHtml += '</table><p><br /></p>';

            editorRef.current?.focus();
            document.execCommand('insertHTML', false, tableHtml);
            updateState();
            setShowTableMenu(false);
        };

        // ============ 代码块 ============
        const insertCodeBlock = () => {
            const code = prompt('请输入代码内容：');
            if (!code) return;

            const escaped = code
                .replace(/&/g, '&amp;')
                .replace(/</g, '&lt;')
                .replace(/>/g, '&gt;');

            const codeHtml = `<pre style="background: #1f2937; color: #f3f4f6; padding: 12px; border-radius: 8px; overflow-x: auto; margin: 12px 0; font-family: ui-monospace, monospace; font-size: 13px;"><code>${escaped}</code></pre><p><br /></p>`;

            editorRef.current?.focus();
            document.execCommand('insertHTML', false, codeHtml);
            updateState();
        };

        // ============ 代码示例弹窗 ============
        const openCodeDialog = () => {
            setDialogType('code');
            setDialogValue('');
        };

        const confirmCodeDialog = () => {
            if (!dialogValue.trim()) {
                setDialogType(null);
                return;
            }

            const escaped = dialogValue
                .replace(/&/g, '&amp;')
                .replace(/</g, '&lt;')
                .replace(/>/g, '&gt;');

            const codeHtml = `<pre style="background: #1f2937; color: #f3f4f6; padding: 12px; border-radius: 8px; overflow-x: auto; margin: 12px 0; font-family: ui-monospace, monospace; font-size: 13px;"><code>${escaped}</code></pre><p><br /></p>`;

            editorRef.current?.focus();
            document.execCommand('insertHTML', false, codeHtml);
            updateState();

            setDialogType(null);
            setDialogValue('');
        };

        // ============ 插入链接 ============
        const openLinkDialog = () => {
            const selection = window.getSelection();
            const selectedText = selection?.toString() || '';
            setDialogText(selectedText);
            setDialogValue('');
            setDialogType('link');
        };

        const confirmLinkDialog = () => {
            if (!dialogValue.trim()) {
                setDialogType(null);
                return;
            }

            let url = dialogValue.trim();
            if (!/^https?:\/\//.test(url) && !/^mailto:/.test(url)) {
                url = 'https://' + url;
            }

            editorRef.current?.focus();

            if (dialogText.trim()) {
                const linkHtml = `<a href="${url}" target="_blank" rel="noopener noreferrer">${dialogText}</a>`;
                document.execCommand('insertHTML', false, linkHtml);
            } else {
                document.execCommand('createLink', false, url);
            }

            updateState();
            setDialogType(null);
            setDialogValue('');
            setDialogText('');
        };

        // ============ 移除链接 ============
        const removeLink = () => execCommand('unlink');

        // ============ 有序列表 ============
        const insertOrderedList = () => execCommand('insertOrderedList');

        // ============ 删除图片 ============
        const deleteImage = () => {
            if (!selectedImage) return;
            selectedImage.remove();
            setSelectedImage(null);
            setShowImageSizeMenu(false);
            updateState();
        };

        // ============ 图片预设尺寸 ============
        const setImageSize = (size: string) => {
            if (!selectedImage) return;

            if (size === 'original') {
                selectedImage.style.width = '';
                selectedImage.style.height = '';
                selectedImage.removeAttribute('width');
                selectedImage.removeAttribute('height');
            } else {
                selectedImage.style.width = size;
                selectedImage.style.height = 'auto';
            }

            updateState();
            setShowImageSizeMenu(false);
        };

        // ============ 图片对齐 ============
        const setImageAlign = (align: string) => {
            if (!selectedImage) return;

            selectedImage.style.float = '';
            selectedImage.style.marginLeft = '';
            selectedImage.style.marginRight = '';
            selectedImage.style.display = '';

            switch (align) {
                case 'left':
                    selectedImage.style.display = 'block';
                    selectedImage.style.marginLeft = '0';
                    selectedImage.style.marginRight = 'auto';
                    break;
                case 'center':
                    selectedImage.style.display = 'block';
                    selectedImage.style.marginLeft = 'auto';
                    selectedImage.style.marginRight = 'auto';
                    break;
                case 'right':
                    selectedImage.style.display = 'block';
                    selectedImage.style.marginLeft = 'auto';
                    selectedImage.style.marginRight = '0';
                    break;
                case 'float-left':
                    selectedImage.style.display = 'block';
                    selectedImage.style.float = 'left';
                    selectedImage.style.marginLeft = '0';
                    selectedImage.style.marginRight = '12px';
                    selectedImage.style.marginBottom = '8px';
                    break;
                case 'float-right':
                    selectedImage.style.display = 'block';
                    selectedImage.style.float = 'right';
                    selectedImage.style.marginLeft = '12px';
                    selectedImage.style.marginRight = '0';
                    selectedImage.style.marginBottom = '8px';
                    break;
                default:
                    selectedImage.style.display = 'block';
                    break;
            }

            updateState();
        };

        // ============ ✅ 打开图片网址弹窗 ============
        const openImageUrlDialog = () => {
            setImageUrlForm({ url: '', alt: '' });
            setShowImageUrlDialog(true);
            setShowImageSizeMenu(false);
        };

        // ============ ✅ 校验图片 URL ============
        const validateImageUrl = (url: string): { valid: boolean; message?: string } => {
            const trimmed = url.trim();

            if (!trimmed) {
                return { valid: false, message: '请输入图片网址' };
            }

            // 协议相对 URL 支持
            if (trimmed.startsWith('//')) {
                return { valid: true };
            }

            // 必须以 http:// 或 https:// 开头
            if (!/^https?:\/\//i.test(trimmed)) {
                return {
                    valid: false,
                    message: '请输入有效的图片网址（以 http:// 或 https:// 开头）',
                };
            }

            // 排除内网地址
            try {
                const urlObj = new URL(trimmed);
                const privateRegex = /^(10\.|172\.(1[6-9]|2\d|3[01])\.|192\.168\.|127\.|localhost|0\.0\.0\.0)/i;
                if (privateRegex.test(urlObj.hostname)) {
                    return { valid: false, message: '不允许使用内网地址' };
                }
            } catch {
                return { valid: false, message: '图片网址格式不正确' };
            }

            return { valid: true };
        };

        // ============ ✅ 插入图片网址 ============
        const insertImageFromUrl = () => {
            const url = imageUrlForm.url.trim();

            // 校验
            const validation = validateImageUrl(url);
            if (!validation.valid) {
                alert(validation.message || '图片网址无效');
                return;
            }

            // 补全协议
            let finalUrl = url;
            if (url.startsWith('//')) {
                finalUrl = `https:${url}`;
            }

            // ✅ 显示时用代理 URL
            const displayUrl = getProxiedImageUrl(finalUrl, { forceProxy: true });

            const alt = imageUrlForm.alt.trim() || '图片';

            const imgHtml = `<img src="${displayUrl}" data-original-src="${finalUrl}" alt="${alt}" style="width: 50%; max-width: 100%; height: auto; border-radius: 8px; margin: 8px 0; display: block;" /><p><br /></p>`;

            editorRef.current?.focus();
            document.execCommand('insertHTML', false, imgHtml);
            updateState();

            setShowImageUrlDialog(false);
            setImageUrlForm({ url: '', alt: '' });
        };

        // ============ 打开自定义图片尺寸弹窗 ============
        const openImageSizeDialog = () => {
            if (!selectedImage) return;

            const originalWidth = selectedImage.naturalWidth || 0;
            const originalHeight = selectedImage.naturalHeight || 0;
            const ratio = originalHeight > 0 ? originalWidth / originalHeight : 1;

            const currentWidth = selectedImage.clientWidth || originalWidth;
            const currentHeight = selectedImage.clientHeight || originalHeight;

            setImageSizeForm({
                width: String(Math.round(currentWidth)),
                height: String(Math.round(currentHeight)),
                lockRatio: true,
                originalWidth,
                originalHeight,
                ratio,
            });

            setShowImageSizeDialog(true);
            setShowImageSizeMenu(false);
        };

        // ============ 输入宽度（联动高度） ============
        const handleWidthChange = (value: string) => {
            const cleanValue = value.replace(/[^\d]/g, '');

            setImageSizeForm(prev => {
                if (!prev.lockRatio) {
                    return { ...prev, width: cleanValue };
                }

                const width = parseInt(cleanValue) || 0;
                const height = width > 0 ? Math.round(width / prev.ratio) : 0;

                return {
                    ...prev,
                    width: cleanValue,
                    height: height > 0 ? String(height) : '',
                };
            });
        };

        // ============ 输入高度（联动宽度） ============
        const handleHeightChange = (value: string) => {
            const cleanValue = value.replace(/[^\d]/g, '');

            setImageSizeForm(prev => {
                if (!prev.lockRatio) {
                    return { ...prev, height: cleanValue };
                }

                const height = parseInt(cleanValue) || 0;
                const width = height > 0 ? Math.round(height * prev.ratio) : 0;

                return {
                    ...prev,
                    height: cleanValue,
                    width: width > 0 ? String(width) : '',
                };
            });
        };

        // ============ 切换锁定比例 ============
        const toggleLockRatio = () => {
            setImageSizeForm(prev => ({
                ...prev,
                lockRatio: !prev.lockRatio,
            }));
        };

        // ============ 应用自定义尺寸 ============
        const applyCustomImageSize = () => {
            if (!selectedImage) return;

            const width = parseInt(imageSizeForm.width) || 0;
            const height = parseInt(imageSizeForm.height) || 0;

            if (width <= 0 && height <= 0) {
                alert('请输入宽度或高度');
                return;
            }

            const containerWidth = editorRef.current?.clientWidth || 800;

            if (width > 0) {
                if (width > containerWidth) {
                    const finalWidth = containerWidth;
                    const finalHeight = imageSizeForm.lockRatio && height > 0
                        ? Math.round((containerWidth / width) * height)
                        : 'auto';
                    selectedImage.style.width = `${finalWidth}px`;
                    selectedImage.style.height = finalHeight === 'auto' ? 'auto' : `${finalHeight}px`;
                } else {
                    selectedImage.style.width = `${width}px`;
                    selectedImage.style.height = imageSizeForm.lockRatio ? 'auto' : `${height}px`;
                }
                selectedImage.style.maxWidth = '100%';
            } else if (height > 0) {
                selectedImage.style.height = `${height}px`;
                selectedImage.style.width = 'auto';
            }

            selectedImage.removeAttribute('width');
            selectedImage.removeAttribute('height');

            updateState();
            setShowImageSizeDialog(false);
        };

        // ============ 上传图片并插入编辑器 ============
        const uploadAndInsertImage = useCallback(async (file: File) => {
            if (!file.type.startsWith('image/')) {
                console.warn('非图片文件，跳过:', file.type);
                return;
            }

            if (file.size > 10 * 1024 * 1024) {
                alert(`图片 ${file.name} 超过 10MB，已跳过`);
                return;
            }

            setUploading(true);
            setUploadProgress(0);

            try {
                const compressed = await compressImage(file, 800, 800, 0.8);
                const result = await uploadImageToQiniu(compressed, (percent) => {
                    setUploadProgress(Math.round(percent));
                });

                // ✅ 显示时用代理 URL
                const displayUrl = getProxiedImageUrl(result.originalUrl, {
                    forceProxy: true,
                });

                const imgHtml = `<img src="${displayUrl}" data-original-src="${result.originalUrl}" alt="${file.name || '图片'}" style="width: 50%; max-width: 100%; height: auto; border-radius: 8px; margin: 8px 0; display: block;" /><p><br /></p>`;

                editorRef.current?.focus();
                document.execCommand('insertHTML', false, imgHtml);
                updateState();
            } catch (err) {
                console.error('图片上传失败:', err);
                alert(err instanceof Error ? err.message : '图片上传失败');
            } finally {
                setUploading(false);
                setUploadProgress(0);
            }
        }, []);

        // ============ 从 URL 下载图片并上传 ============
        const uploadImageFromUrl = useCallback(async (url: string) => {
            setUploading(true);
            setUploadProgress(0);

            try {
                const proxyUrl = `/api/proxy-image?url=${encodeURIComponent(url)}`;
                const response = await fetch(proxyUrl);
                if (!response.ok) {
                    throw new Error(`下载失败: HTTP ${response.status}`);
                }

                const blob = await response.blob();
                const ext = blob.type.split('/')[1] || 'jpg';
                const fileName = `pasted_${Date.now()}.${ext}`;
                const file = new File([blob], fileName, { type: blob.type });

                const compressed = await compressImage(file, 800, 800, 0.8);
                const result = await uploadImageToQiniu(compressed, (percent) => {
                    setUploadProgress(Math.round(percent));
                });

                const displayUrl = getProxiedImageUrl(result.originalUrl, {
                    forceProxy: true,
                });

                const imgHtml = `<img src="${displayUrl}" data-original-src="${result.originalUrl}" alt="图片" style="width: 50%; max-width: 100%; height: auto; border-radius: 8px; margin: 8px 0; display: block;" /><p><br /></p>`;

                editorRef.current?.focus();
                document.execCommand('insertHTML', false, imgHtml);
                updateState();
            } catch (err) {
                console.error('网页图片上传失败:', err);
                const displayUrl = getProxiedImageUrl(url, { forceProxy: true });
                const imgHtml = `<img src="${displayUrl}" data-original-src="${url}" alt="图片" style="max-width: 100%; height: auto; border-radius: 8px; margin: 8px 0; display: block;" /><p><br /></p>`;
                editorRef.current?.focus();
                document.execCommand('insertHTML', false, imgHtml);
                updateState();
            } finally {
                setUploading(false);
                setUploadProgress(0);
            }
        }, []);

        // ============ 从 base64 上传图片 ============
        const uploadBase64Image = useCallback(async (base64Url: string) => {
            try {
                const response = await fetch(base64Url);
                const blob = await response.blob();

                const ext = blob.type.split('/')[1] || 'png';
                const fileName = `paste_${Date.now()}.${ext}`;
                const file = new File([blob], fileName, { type: blob.type });

                await uploadAndInsertImage(file);
            } catch (err) {
                console.error('base64 图片上传失败:', err);
            }
        }, [uploadAndInsertImage]);

        // ============ 从 HTML 中提取图片 URL ============
        const extractImageUrls = (html: string): string[] => {
            const urls: string[] = [];
            const imgRegex = /<img[^>]+src=["']([^"']+)["']/gi;
            let match: RegExpExecArray | null;

            while ((match = imgRegex.exec(html)) !== null) {
                const url = match[1];
                if (url && !url.startsWith('data:') && /^https?:\/\//.test(url)) {
                    urls.push(url);
                }
            }

            return urls;
        };

        // ============ 粘贴处理 ============
        const handlePaste = useCallback(async (e: React.ClipboardEvent) => {
            const clipboardData = e.clipboardData;
            if (!clipboardData) return;

            // 1. 检查图片文件
            const items = Array.from(clipboardData.items);
            const imageFiles: File[] = [];

            for (const item of items) {
                if (item.type.startsWith('image/')) {
                    const file = item.getAsFile();
                    if (file) {
                        imageFiles.push(file);
                    }
                }
            }

            if (imageFiles.length > 0) {
                e.preventDefault();

                const text = clipboardData.getData('text/plain');
                if (text && text.trim()) {
                    editorRef.current?.focus();
                    document.execCommand('insertText', false, text);
                }

                for (const file of imageFiles) {
                    await uploadAndInsertImage(file);
                }

                return;
            }

            // 2. 检查 HTML 中的图片
            const htmlContent = clipboardData.getData('text/html');
            if (htmlContent) {
                // base64
                const base64Regex = /src=["'](data:image\/[^"']+)["']/gi;
                const base64Matches = [...htmlContent.matchAll(base64Regex)];

                if (base64Matches.length > 0) {
                    e.preventDefault();

                    const text = clipboardData.getData('text/plain');
                    if (text && text.trim()) {
                        editorRef.current?.focus();
                        document.execCommand('insertText', false, text);
                    }

                    for (const match of base64Matches) {
                        await uploadBase64Image(match[1]);
                    }

                    return;
                }

                // 普通 URL
                const imgUrls = extractImageUrls(htmlContent);
                if (imgUrls.length > 0) {
                    e.preventDefault();

                    const text = clipboardData.getData('text/plain');
                    if (text && text.trim()) {
                        editorRef.current?.focus();
                        document.execCommand('insertText', false, text);
                    }

                    for (const url of imgUrls) {
                        await uploadImageFromUrl(url);
                    }

                    return;
                }
            }

            // 3. 默认：纯文本
            e.preventDefault();
            const text = clipboardData.getData('text/plain');
            document.execCommand('insertText', false, text);
        }, [uploadAndInsertImage, uploadImageFromUrl, uploadBase64Image]);

        // ============ 拖拽处理 ============
        const handleDragEnter = (e: React.DragEvent) => {
            e.preventDefault();
            e.stopPropagation();
            if (e.dataTransfer.types.includes('Files')) {
                setIsDragging(true);
            }
        };

        const handleDragLeave = (e: React.DragEvent) => {
            e.preventDefault();
            e.stopPropagation();
            if (e.currentTarget === e.target) {
                setIsDragging(false);
            }
        };

        const handleDragOver = (e: React.DragEvent) => {
            e.preventDefault();
            e.stopPropagation();
        };

        const handleDrop = async (e: React.DragEvent) => {
            e.preventDefault();
            e.stopPropagation();
            setIsDragging(false);

            const files = Array.from(e.dataTransfer.files).filter(f =>
                f.type.startsWith('image/')
            );

            if (files.length === 0) return;

            for (const file of files) {
                await uploadAndInsertImage(file);
            }
        };

        // ============ 上传文件选择 ============
        const handleFileSelect = async (e: React.ChangeEvent<HTMLInputElement>) => {
            const file = e.target.files?.[0];
            if (!file) return;

            await uploadAndInsertImage(file);

            if (fileInputRef.current) fileInputRef.current.value = '';
        };

        // ============ 源码模式切换 ============
        const toggleSource = () => {
            if (!showSource) {
                const currentHtml = editorRef.current?.innerHTML || '';
                setSourceHtml(currentHtml);
                setShowSource(true);
            } else {
                setShowSource(false);

                requestAnimationFrame(() => {
                    if (editorRef.current) {
                        editorRef.current.innerHTML = sourceHtml;
                        updateState();
                    }
                });
            }
        };

        // ============ 渲染 ============
        return (
            <div
                className={cn(
                    'border border-gray-300 rounded-lg',
                    'focus-within:ring-2 focus-within:ring-primary-500',
                    className
                )}
            >
                {allowImage && (
                    <input
                        ref={fileInputRef}
                        type="file"
                        accept="image/jpeg,image/png,image/gif,image/webp"
                        onChange={handleFileSelect}
                        className="hidden"
                    />
                )}

                {/* ==================== 工具栏 ==================== */}
                <div className="flex items-center flex-wrap gap-0.5 px-2 py-1.5 bg-gray-50 border-b border-gray-200 rounded-t-lg">

                    {showSource ? (
                        <>
                            <button
                                type="button"
                                onClick={toggleSource}
                                className="px-3 py-1.5 rounded text-xs bg-primary-600 text-white hover:bg-primary-700"
                            >
                                ← 返回编辑
                            </button>
                            <span className="text-xs text-gray-500 ml-2">正在编辑 HTML 源码</span>
                        </>
                    ) : (
                        <>
                            {/* 字体 */}
                            <div className="relative editor-dropdown">
                                <button
                                    ref={fontDropdown.buttonRef}
                                    type="button"
                                    onClick={() => {
                                        fontDropdown.updatePosition();
                                        setShowFontMenu(!showFontMenu);
                                    }}
                                    className="h-7 px-2 rounded flex items-center justify-center space-x-1 text-xs hover:bg-gray-200 transition-colors"
                                    title="字体"
                                >
                                    <span>字体</span>
                                    <svg className="w-3 h-3" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                                    </svg>
                                </button>
                                {showFontMenu && (
                                    <div
                                        className="fixed bg-white rounded-lg shadow-lg border border-gray-200 py-1 z-[9999] editor-dropdown-menu"
                                        style={{
                                            top: fontDropdown.position.top,
                                            left: fontDropdown.position.left,
                                            width: 160,
                                        }}
                                    >
                                        {FONT_FAMILIES.map(f => (
                                            <button
                                                key={f.value || 'default'}
                                                type="button"
                                                onClick={() => applyFontFamily(f.value)}
                                                className="w-full text-left px-3 py-1.5 text-sm hover:bg-gray-50"
                                                style={{ fontFamily: f.value || 'inherit' }}
                                            >
                                                {f.label}
                                            </button>
                                        ))}
                                    </div>
                                )}
                            </div>

                            {/* 字号 */}
                            <div className="relative editor-dropdown">
                                <button
                                    ref={sizeDropdown.buttonRef}
                                    type="button"
                                    onClick={() => {
                                        sizeDropdown.updatePosition();
                                        setShowSizeMenu(!showSizeMenu);
                                    }}
                                    className="h-7 px-2 rounded flex items-center justify-center space-x-1 text-xs hover:bg-gray-200 transition-colors"
                                    title="字号"
                                >
                                    <span>字号</span>
                                    <svg className="w-3 h-3" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                                    </svg>
                                </button>
                                {showSizeMenu && (
                                    <div
                                        className="fixed bg-white rounded-lg shadow-lg border border-gray-200 py-1 z-[9999] editor-dropdown-menu"
                                        style={{
                                            top: sizeDropdown.position.top,
                                            left: sizeDropdown.position.left,
                                            width: 100,
                                        }}
                                    >
                                        {FONT_SIZES.map(s => (
                                            <button
                                                key={s.value}
                                                type="button"
                                                onClick={() => applyFontSize(s.value)}
                                                className="w-full text-left px-3 py-1.5 text-sm hover:bg-gray-50"
                                            >
                                                {s.label}
                                            </button>
                                        ))}
                                    </div>
                                )}
                            </div>

                            {/* 分隔线 */}
                            <div className="w-px h-5 bg-gray-300 mx-0.5" />

                            {/* 加粗 */}
                            <button
                                type="button"
                                onClick={() => execCommand('bold')}
                                className="w-7 h-7 rounded flex items-center justify-center text-sm font-bold hover:bg-gray-200 transition-colors"
                                title="加粗"
                            >
                                B
                            </button>

                            {/* 斜体 */}
                            <button
                                type="button"
                                onClick={() => execCommand('italic')}
                                className="w-7 h-7 rounded flex items-center justify-center text-sm italic hover:bg-gray-200 transition-colors"
                                title="斜体"
                            >
                                I
                            </button>

                            {/* 下划线 */}
                            <button
                                type="button"
                                onClick={() => execCommand('underline')}
                                className="w-7 h-7 rounded flex items-center justify-center text-sm underline hover:bg-gray-200 transition-colors"
                                title="下划线"
                            >
                                U
                            </button>

                            {/* 删除线 */}
                            <button
                                type="button"
                                onClick={() => execCommand('strikeThrough')}
                                className="w-7 h-7 rounded flex items-center justify-center text-sm line-through hover:bg-gray-200 transition-colors"
                                title="删除线"
                            >
                                S
                            </button>

                            {/* 分隔线 */}
                            <div className="w-px h-5 bg-gray-300 mx-0.5" />

                            {/* 文字颜色 */}
                            <div className="relative editor-dropdown">
                                <button
                                    ref={colorDropdown.buttonRef}
                                    type="button"
                                    onClick={() => {
                                        colorDropdown.updatePosition();
                                        setShowColorMenu(!showColorMenu);
                                    }}
                                    className="h-7 px-1.5 rounded flex items-center justify-center hover:bg-gray-200 transition-colors"
                                    title="文字颜色"
                                >
                                    <span className="text-xs font-bold">A</span>
                                    <div className="w-1 h-3 bg-red-500 ml-0.5 rounded-sm" />
                                </button>
                                {showColorMenu && (
                                    <div
                                        className="fixed bg-white rounded-lg shadow-lg border border-gray-200 p-2 z-[9999] editor-dropdown-menu"
                                        style={{
                                            top: colorDropdown.position.top,
                                            left: colorDropdown.position.left,
                                            width: 160,
                                        }}
                                    >
                                        <div className="grid grid-cols-8 gap-1">
                                            {TEXT_COLORS.map(color => (
                                                <button
                                                    key={color}
                                                    type="button"
                                                    onClick={() => applyTextColor(color)}
                                                    className="w-4 h-4 rounded border border-gray-200 hover:scale-110 transition-transform"
                                                    style={{ backgroundColor: color }}
                                                    title={color}
                                                />
                                            ))}
                                        </div>
                                    </div>
                                )}
                            </div>

                            {/* 背景色 */}
                            <div className="relative editor-dropdown">
                                <button
                                    ref={bgDropdown.buttonRef}
                                    type="button"
                                    onClick={() => {
                                        bgDropdown.updatePosition();
                                        setShowBgMenu(!showBgMenu);
                                    }}
                                    className="h-7 px-1.5 rounded flex items-center justify-center hover:bg-gray-200 transition-colors"
                                    title="背景色"
                                >
                                    <span className="text-xs font-bold">A</span>
                                    <div className="w-1 h-3 bg-yellow-300 ml-0.5 rounded-sm" />
                                </button>
                                {showBgMenu && (
                                    <div
                                        className="fixed bg-white rounded-lg shadow-lg border border-gray-200 p-2 z-[9999] editor-dropdown-menu"
                                        style={{
                                            top: bgDropdown.position.top,
                                            left: bgDropdown.position.left,
                                            width: 160,
                                        }}
                                    >
                                        <div className="grid grid-cols-5 gap-1">
                                            {BG_COLORS.map(color => (
                                                <button
                                                    key={color}
                                                    type="button"
                                                    onClick={() => applyBgColor(color)}
                                                    className="w-6 h-6 rounded border border-gray-200 hover:scale-110 transition-transform flex items-center justify-center"
                                                    style={{
                                                        backgroundColor: color === 'transparent' ? '#fff' : color,
                                                    }}
                                                    title={color === 'transparent' ? '无背景' : color}
                                                >
                                                    {color === 'transparent' && (
                                                        <svg className="w-4 h-4 text-gray-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                                                        </svg>
                                                    )}
                                                </button>
                                            ))}
                                        </div>
                                    </div>
                                )}
                            </div>

                            {/* 分隔线 */}
                            <div className="w-px h-5 bg-gray-300 mx-0.5" />

                            {/* 左对齐 */}
                            <button
                                type="button"
                                onClick={() => applyAlign('Left')}
                                className="w-7 h-7 rounded flex items-center justify-center hover:bg-gray-200 transition-colors"
                                title="左对齐"
                            >
                                <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h10M4 18h14" />
                                </svg>
                            </button>

                            {/* 居中对齐 */}
                            <button
                                type="button"
                                onClick={() => applyAlign('Center')}
                                className="w-7 h-7 rounded flex items-center justify-center hover:bg-gray-200 transition-colors"
                                title="居中对齐"
                            >
                                <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M7 12h10M5 18h14" />
                                </svg>
                            </button>

                            {/* 右对齐 */}
                            <button
                                type="button"
                                onClick={() => applyAlign('Right')}
                                className="w-7 h-7 rounded flex items-center justify-center hover:bg-gray-200 transition-colors"
                                title="右对齐"
                            >
                                <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M10 12h10M6 18h14" />
                                </svg>
                            </button>

                            {/* 两端对齐 */}
                            <button
                                type="button"
                                onClick={() => applyAlign('Justify')}
                                className="w-7 h-7 rounded flex items-center justify-center hover:bg-gray-200 transition-colors"
                                title="两端对齐"
                            >
                                <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h16" />
                                </svg>
                            </button>

                            {/* 分隔线 */}
                            <div className="w-px h-5 bg-gray-300 mx-0.5" />

                            {/* 无序列表 */}
                            <button
                                type="button"
                                onClick={() => execCommand('insertUnorderedList')}
                                className="w-7 h-7 rounded flex items-center justify-center hover:bg-gray-200 transition-colors"
                                title="无序列表"
                            >
                                <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h.01M4 12h.01M4 18h.01M8 6h12M8 12h12M8 18h12" />
                                </svg>
                            </button>

                            {/* 有序列表 */}
                            <button
                                type="button"
                                onClick={insertOrderedList}
                                className="w-7 h-7 rounded flex items-center justify-center hover:bg-gray-200 transition-colors"
                                title="有序列表"
                            >
                                <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M7 6h13M7 12h13M7 18h13M3 6h.01M3 12h.01M3 18h.01" />
                                </svg>
                            </button>

                            {/* 引用 */}
                            <button
                                type="button"
                                onClick={() => execCommand('formatBlock', '<blockquote>')}
                                className="w-7 h-7 rounded flex items-center justify-center hover:bg-gray-200 transition-colors"
                                title="引用"
                            >
                                <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z" />
                                </svg>
                            </button>

                            {/* 分隔线 */}
                            <div className="w-px h-5 bg-gray-300 mx-0.5" />

                            {/* 链接 */}
                            <button
                                type="button"
                                onClick={openLinkDialog}
                                className="w-7 h-7 rounded flex items-center justify-center hover:bg-gray-200 transition-colors"
                                title="插入链接"
                            >
                                <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13.828 10.172a4 4 0 00-5.656 0l-4 4a4 4 0 105.656 5.656l1.102-1.101m-.758-4.899a4 4 0 005.656 0l4-4a4 4 0 00-5.656-5.656l-1.1 1.1" />
                                </svg>
                            </button>

                            {/* 移除链接 */}
                            <button
                                type="button"
                                onClick={removeLink}
                                className="w-7 h-7 rounded flex items-center justify-center hover:bg-gray-200 transition-colors"
                                title="移除链接"
                            >
                                <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M18.364 18.364A9 9 0 005.636 5.636m12.728 12.728A9 9 0 015.636 5.636m12.728 12.728L5.636 5.636" />
                                </svg>
                            </button>

                            {/* 代码块 */}
                            <button
                                type="button"
                                onClick={openCodeDialog}
                                className="w-7 h-7 rounded flex items-center justify-center hover:bg-gray-200 transition-colors"
                                title="插入代码块"
                            >
                                <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 20l4-16m4 4l4 4-4 4M6 16l-4-4 4-4" />
                                </svg>
                            </button>

                            {/* 表格 */}
                            <div className="relative editor-dropdown">
                                <button
                                    ref={tableDropdown.buttonRef}
                                    type="button"
                                    onClick={() => {
                                        tableDropdown.updatePosition();
                                        setShowTableMenu(!showTableMenu);
                                    }}
                                    className="w-7 h-7 rounded flex items-center justify-center hover:bg-gray-200 transition-colors"
                                    title="插入表格"
                                >
                                    <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 10h18M3 14h18M10 3v18M14 3v18M3 6a3 3 0 013-3h12a3 3 0 013 3v12a3 3 0 01-3 3H6a3 3 0 01-3-3V6z" />
                                    </svg>
                                </button>
                                {showTableMenu && (
                                    <div
                                        className="fixed bg-white rounded-lg shadow-lg border border-gray-200 p-2 z-[9999] editor-dropdown-menu"
                                        style={{
                                            top: tableDropdown.position.top,
                                            left: tableDropdown.position.left,
                                            width: 260,
                                        }}
                                    >
                                        <div className="text-xs text-gray-500 mb-2 px-1">选择表格大小</div>
                                        <div className="grid grid-cols-8 gap-0.5">
                                            {[1, 2, 3, 4, 5, 6].map(rows =>
                                                [1, 2, 3, 4, 5, 6, 7, 8].map(cols => (
                                                    <button
                                                        key={`${rows}-${cols}`}
                                                        type="button"
                                                        onClick={() => insertTable(rows, cols)}
                                                        className="w-6 h-6 border border-gray-200 rounded hover:bg-primary-100 hover:border-primary-300 transition-colors flex items-center justify-center text-[10px] text-gray-400"
                                                        title={`${rows} 行 × ${cols} 列`}
                                                    >
                                                        {cols}
                                                    </button>
                                                ))
                                            )}
                                        </div>
                                    </div>
                                )}
                            </div>

                            {/* 分隔线 */}
                            <div className="w-px h-5 bg-gray-300 mx-0.5" />

                            {/* ✅ 上传图片 */}
                            {allowImage && (
                                <button
                                    type="button"
                                    onClick={() => fileInputRef.current?.click()}
                                    disabled={uploading}
                                    className="w-7 h-7 rounded flex items-center justify-center hover:bg-gray-200 transition-colors disabled:opacity-50"
                                    title="上传图片"
                                >
                                    <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" />
                                    </svg>
                                </button>
                            )}

                            {/* ✅ 输入图片网址 */}
                            {allowImage && (
                                <button
                                    type="button"
                                    onClick={openImageUrlDialog}
                                    disabled={uploading}
                                    className="w-7 h-7 rounded flex items-center justify-center hover:bg-gray-200 transition-colors disabled:opacity-50"
                                    title="输入图片网址"
                                >
                                    <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13.828 10.172a4 4 0 00-5.656 0l-4 4a4 4 0 105.656 5.656l1.102-1.101m-.758-4.899a4 4 0 005.656 0l4-4a4 4 0 00-5.656-5.656l-1.1 1.1" />
                                    </svg>
                                </button>
                            )}

                            {/* 图片操作菜单 */}
                            {selectedImage && (
                                <>
                                    <div className="w-px h-5 bg-gray-300 mx-0.5" />

                                    {/* 图片尺寸 */}
                                    <div className="relative editor-dropdown">
                                        <button
                                            ref={imageDropdown.buttonRef}
                                            type="button"
                                            onClick={() => {
                                                imageDropdown.updatePosition();
                                                setShowImageSizeMenu(!showImageSizeMenu);
                                            }}
                                            className="h-7 px-2 rounded flex items-center justify-center space-x-1 text-xs hover:bg-gray-200 transition-colors"
                                            title="图片尺寸"
                                        >
                                            <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 8V4m0 0h4M4 4l5 5m11-1V4m0 0h-4m4 0l-5 5M4 16v4m0 0h4m-4 0l5-5m11 5l-5-5m5 5v-4m0 4h-4" />
                                            </svg>
                                            <span>尺寸</span>
                                            <svg className="w-3 h-3" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                                            </svg>
                                        </button>
                                        {showImageSizeMenu && (
                                            <div
                                                className="fixed bg-white rounded-lg shadow-lg border border-gray-200 py-1 z-[9999] editor-dropdown-menu"
                                                style={{
                                                    top: imageDropdown.position.top,
                                                    left: imageDropdown.position.left,
                                                    width: 220,
                                                }}
                                            >
                                                {IMAGE_SIZE_PRESETS.map(preset => (
                                                    <button
                                                        key={preset.value}
                                                        type="button"
                                                        onClick={() => setImageSize(preset.value)}
                                                        className="w-full text-left px-3 py-1.5 text-sm hover:bg-gray-50"
                                                    >
                                                        {preset.label}
                                                    </button>
                                                ))}
                                                <div className="border-t border-gray-100 my-1" />
                                                <button
                                                    type="button"
                                                    onClick={openImageSizeDialog}
                                                    className="w-full text-left px-3 py-1.5 text-sm hover:bg-gray-50 text-primary-600"
                                                >
                                                    自定义尺寸...
                                                </button>
                                                <div className="border-t border-gray-100 my-1" />
                                                <div className="px-3 py-1.5 text-xs text-gray-400">对齐方式</div>
                                                {[
                                                    { value: 'left', label: '左对齐' },
                                                    { value: 'center', label: '居中' },
                                                    { value: 'right', label: '右对齐' },
                                                    { value: 'float-left', label: '左浮动' },
                                                    { value: 'float-right', label: '右浮动' },
                                                ].map(align => (
                                                    <button
                                                        key={align.value}
                                                        type="button"
                                                        onClick={() => setImageAlign(align.value)}
                                                        className="w-full text-left px-3 py-1.5 text-sm hover:bg-gray-50"
                                                    >
                                                        {align.label}
                                                    </button>
                                                ))}
                                                <div className="border-t border-gray-100 my-1" />
                                                <button
                                                    type="button"
                                                    onClick={deleteImage}
                                                    className="w-full text-left px-3 py-1.5 text-sm hover:bg-red-50 text-red-600"
                                                >
                                                    删除图片
                                                </button>
                                            </div>
                                        )}
                                    </div>
                                </>
                            )}

                            {/* 分隔线 */}
                            <div className="w-px h-5 bg-gray-300 mx-0.5" />

                            {/* 源码模式 */}
                            <button
                                type="button"
                                onClick={toggleSource}
                                className="h-7 px-2 rounded flex items-center justify-center space-x-1 text-xs hover:bg-gray-200 transition-colors"
                                title="源码模式"
                            >
                                <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 20l4-16m4 4l4 4-4 4M6 16l-4-4 4-4" />
                                </svg>
                                <span>源码</span>
                            </button>
                        </>
                    )}
                </div>

                {/* ==================== 上传进度 ==================== */}
                {uploading && (
                    <div className="px-3 py-2 bg-blue-50 border-b border-blue-100 flex items-center gap-2">
                        <div className="w-4 h-4 border-2 border-blue-500 border-t-transparent rounded-full animate-spin" />
                        <span className="text-xs text-blue-700">上传中... {uploadProgress}%</span>
                        <div className="flex-1 h-1.5 bg-blue-100 rounded-full overflow-hidden">
                            <div
                                className="h-full bg-blue-500 rounded-full transition-all duration-200"
                                style={{ width: `${uploadProgress}%` }}
                            />
                        </div>
                    </div>
                )}

                {/* ==================== 编辑区域 ==================== */}
                {showSource ? (
                    <textarea
                        value={sourceHtml}
                        onChange={(e) => setSourceHtml(e.target.value)}
                        className="w-full p-4 text-sm font-mono bg-gray-900 text-green-400 focus:outline-none resize-none"
                        style={{ minHeight: minHeight + 20 }}
                    />
                ) : (
                    <div
                        ref={editorRef}
                        contentEditable
                        suppressContentEditableWarning
                        onInput={updateState}
                        onClick={handleEditorClick}
                        onBlur={onBlur}
                        onPaste={handlePaste}
                        onDragEnter={handleDragEnter}
                        onDragLeave={handleDragLeave}
                        onDragOver={handleDragOver}
                        onDrop={handleDrop}
                        data-placeholder={placeholder}
                        className={cn(
                            'p-4 text-sm text-gray-700 focus:outline-none rich-text-content',
                            'relative',
                            isDragging && 'ring-2 ring-primary-400 bg-primary-50/50'
                        )}
                        style={{ minHeight }}
                    />
                )}

                {/* ==================== 链接弹窗 ==================== */}
                {dialogType === 'link' && (
                    <div className="fixed inset-0 z-[10000] flex items-center justify-center bg-black/50">
                        <div className="bg-white rounded-lg shadow-xl w-full max-w-md mx-4">
                            <div className="px-5 py-3 border-b border-gray-200">
                                <h3 className="text-sm font-semibold text-gray-800">插入链接</h3>
                            </div>
                            <div className="p-5 space-y-3">
                                <div>
                                    <label className="block text-xs text-gray-500 mb-1">链接文字（可选）</label>
                                    <input
                                        type="text"
                                        value={dialogText}
                                        onChange={(e) => setDialogText(e.target.value)}
                                        placeholder="显示的文字"
                                        className="w-full px-3 py-2 border border-gray-300 rounded text-sm focus:outline-none focus:ring-2 focus:ring-primary-500"
                                    />
                                </div>
                                <div>
                                    <label className="block text-xs text-gray-500 mb-1">链接地址</label>
                                    <input
                                        type="text"
                                        value={dialogValue}
                                        onChange={(e) => setDialogValue(e.target.value)}
                                        placeholder="https://example.com"
                                        className="w-full px-3 py-2 border border-gray-300 rounded text-sm focus:outline-none focus:ring-2 focus:ring-primary-500"
                                        autoFocus
                                    />
                                </div>
                            </div>
                            <div className="px-5 py-3 border-t border-gray-200 flex justify-end gap-2">
                                <button
                                    type="button"
                                    onClick={() => setDialogType(null)}
                                    className="px-4 py-1.5 text-sm border border-gray-300 rounded hover:bg-gray-50"
                                >
                                    取消
                                </button>
                                <button
                                    type="button"
                                    onClick={confirmLinkDialog}
                                    className="px-4 py-1.5 text-sm bg-primary-600 text-white rounded hover:bg-primary-700"
                                >
                                    确定
                                </button>
                            </div>
                        </div>
                    </div>
                )}

                {/* ==================== 代码块弹窗 ==================== */}
                {dialogType === 'code' && (
                    <div className="fixed inset-0 z-[10000] flex items-center justify-center bg-black/50">
                        <div className="bg-white rounded-lg shadow-xl w-full max-w-lg mx-4">
                            <div className="px-5 py-3 border-b border-gray-200">
                                <h3 className="text-sm font-semibold text-gray-800">插入代码块</h3>
                            </div>
                            <div className="p-5">
                                <textarea
                                    value={dialogValue}
                                    onChange={(e) => setDialogValue(e.target.value)}
                                    placeholder="粘贴或输入代码..."
                                    rows={8}
                                    className="w-full px-3 py-2 border border-gray-300 rounded text-sm font-mono focus:outline-none focus:ring-2 focus:ring-primary-500 resize-none"
                                    autoFocus
                                />
                            </div>
                            <div className="px-5 py-3 border-t border-gray-200 flex justify-end gap-2">
                                <button
                                    type="button"
                                    onClick={() => setDialogType(null)}
                                    className="px-4 py-1.5 text-sm border border-gray-300 rounded hover:bg-gray-50"
                                >
                                    取消
                                </button>
                                <button
                                    type="button"
                                    onClick={confirmCodeDialog}
                                    className="px-4 py-1.5 text-sm bg-primary-600 text-white rounded hover:bg-primary-700"
                                >
                                    确定
                                </button>
                            </div>
                        </div>
                    </div>
                )}

                {/* ==================== ✅ 图片网址弹窗 ==================== */}
                {showImageUrlDialog && (
                    <div className="fixed inset-0 z-[10000] flex items-center justify-center bg-black/50">
                        <div className="bg-white rounded-lg shadow-xl w-full max-w-md mx-4">
                            <div className="px-5 py-3 border-b border-gray-200 flex items-center justify-between">
                                <h3 className="text-sm font-semibold text-gray-800">输入图片网址</h3>
                                <button
                                    type="button"
                                    onClick={() => setShowImageUrlDialog(false)}
                                    className="text-gray-400 hover:text-gray-600"
                                >
                                    <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                                    </svg>
                                </button>
                            </div>
                            <div className="p-5 space-y-4">
                                <div>
                                    <label className="block text-xs text-gray-500 mb-1">
                                        图片网址 <span className="text-red-500">*</span>
                                    </label>
                                    <input
                                        type="text"
                                        value={imageUrlForm.url}
                                        onChange={(e) => setImageUrlForm(prev => ({ ...prev, url: e.target.value }))}
                                        placeholder="https://example.com/image.jpg"
                                        className="w-full px-3 py-2 border border-gray-300 rounded text-sm focus:outline-none focus:ring-2 focus:ring-primary-500"
                                        autoFocus
                                    />
                                    <p className="text-xs text-gray-400 mt-1">
                                        支持 http:// 和 https:// 开头的图片地址
                                    </p>
                                </div>
                                <div>
                                    <label className="block text-xs text-gray-500 mb-1">图片描述（可选）</label>
                                    <input
                                        type="text"
                                        value={imageUrlForm.alt}
                                        onChange={(e) => setImageUrlForm(prev => ({ ...prev, alt: e.target.value }))}
                                        placeholder="图片的替代文字"
                                        className="w-full px-3 py-2 border border-gray-300 rounded text-sm focus:outline-none focus:ring-2 focus:ring-primary-500"
                                    />
                                </div>

                                {/* 预览 */}
                                {imageUrlForm.url && validateImageUrl(imageUrlForm.url).valid && (
                                    <div>
                                        <label className="block text-xs text-gray-500 mb-1">预览</label>
                                        <div className="border border-gray-200 rounded p-2 bg-gray-50">
                                            <img
                                                src={getProxiedImageUrl(imageUrlForm.url, { forceProxy: true })}
                                                alt="预览"
                                                className="max-h-32 mx-auto rounded"
                                                onError={(e) => {
                                                    e.currentTarget.src = '';
                                                    e.currentTarget.alt = '图片加载失败';
                                                }}
                                            />
                                        </div>
                                    </div>
                                )}
                            </div>
                            <div className="px-5 py-3 border-t border-gray-200 flex justify-end gap-2">
                                <button
                                    type="button"
                                    onClick={() => setShowImageUrlDialog(false)}
                                    className="px-4 py-1.5 text-sm border border-gray-300 rounded hover:bg-gray-50"
                                >
                                    取消
                                </button>
                                <button
                                    type="button"
                                    onClick={insertImageFromUrl}
                                    disabled={!imageUrlForm.url.trim()}
                                    className="px-4 py-1.5 text-sm bg-primary-600 text-white rounded hover:bg-primary-700 disabled:opacity-50 disabled:cursor-not-allowed"
                                >
                                    插入图片
                                </button>
                            </div>
                        </div>
                    </div>
                )}

                {/* ==================== 图片自定义尺寸弹窗 ==================== */}
                {showImageSizeDialog && (
                    <div className="fixed inset-0 z-[10000] flex items-center justify-center bg-black/50">
                        <div className="bg-white rounded-lg shadow-xl w-full max-w-sm mx-4">
                            <div className="px-5 py-3 border-b border-gray-200">
                                <h3 className="text-sm font-semibold text-gray-800">自定义图片尺寸</h3>
                            </div>
                            <div className="p-5 space-y-4">
                                <div className="text-xs text-gray-500">
                                    原始尺寸：{imageSizeForm.originalWidth} × {imageSizeForm.originalHeight} px
                                </div>
                                <div className="flex items-center gap-3">
                                    <div className="flex-1">
                                        <label className="block text-xs text-gray-500 mb-1">宽度 (px)</label>
                                        <input
                                            type="text"
                                            value={imageSizeForm.width}
                                            onChange={(e) => handleWidthChange(e.target.value)}
                                            placeholder="宽度"
                                            className="w-full px-3 py-2 border border-gray-300 rounded text-sm focus:outline-none focus:ring-2 focus:ring-primary-500"
                                        />
                                    </div>
                                    <button
                                        type="button"
                                        onClick={toggleLockRatio}
                                        className={cn(
                                            'mt-5 p-2 rounded transition-colors',
                                            imageSizeForm.lockRatio
                                                ? 'bg-primary-100 text-primary-600'
                                                : 'bg-gray-100 text-gray-400'
                                        )}
                                        title={imageSizeForm.lockRatio ? '已锁定比例' : '已解锁比例'}
                                    >
                                        {imageSizeForm.lockRatio ? (
                                            <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z" />
                                            </svg>
                                        ) : (
                                            <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 11V7a4 4 0 118 0m-4 8v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2z" />
                                            </svg>
                                        )}
                                    </button>
                                    <div className="flex-1">
                                        <label className="block text-xs text-gray-500 mb-1">高度 (px)</label>
                                        <input
                                            type="text"
                                            value={imageSizeForm.height}
                                            onChange={(e) => handleHeightChange(e.target.value)}
                                            placeholder="高度"
                                            className="w-full px-3 py-2 border border-gray-300 rounded text-sm focus:outline-none focus:ring-2 focus:ring-primary-500"
                                        />
                                    </div>
                                </div>
                            </div>
                            <div className="px-5 py-3 border-t border-gray-200 flex justify-end gap-2">
                                <button
                                    type="button"
                                    onClick={() => setShowImageSizeDialog(false)}
                                    className="px-4 py-1.5 text-sm border border-gray-300 rounded hover:bg-gray-50"
                                >
                                    取消
                                </button>
                                <button
                                    type="button"
                                    onClick={applyCustomImageSize}
                                    className="px-4 py-1.5 text-sm bg-primary-600 text-white rounded hover:bg-primary-700"
                                >
                                    应用
                                </button>
                            </div>
                        </div>
                    </div>
                )}
            </div>
        );
    }
);

RichTextEditor.displayName = 'RichTextEditor';

export default RichTextEditor;