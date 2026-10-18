// components/common/ImageCropperModal.tsx
'use client';

import { useState, useCallback } from 'react';
import Cropper, { Area, Point } from 'react-easy-crop';

export interface CropperConfig {
    cropShape?: 'rect' | 'round';
    aspectRatio?: number;
    showGrid?: boolean;
    minZoom?: number;
    maxZoom?: number;
}

interface ImageCropperModalProps {
    imageSrc: string;
    onCropComplete: (croppedImage: Blob) => void;
    onCancel: () => void;
    config?: CropperConfig;
    initialCroppedAreaPercentages?: Area;
    initialCroppedAreaPixels?: Area;
    initialRotation?: number;
}

// 辅助函数：将裁剪区域绘制到 Canvas 并导出 Blob
const createCroppedImage = async (
    imageSrc: string,
    pixelCrop: Area,
    rotation = 0,
    flip = { horizontal: false, vertical: false }
): Promise<Blob> => {
    const image = await new Promise<HTMLImageElement>((resolve, reject) => {
        const img = new Image();
        img.addEventListener('load', () => resolve(img));
        img.addEventListener('error', reject);
        img.setAttribute('crossOrigin', 'anonymous');
        img.src = imageSrc;
    });

    const canvas = document.createElement('canvas');
    const ctx = canvas.getContext('2d');
    if (!ctx) throw new Error('No 2d context');

    const rotRad = (rotation * Math.PI) / 180;
    const { width: bBoxWidth, height: bBoxHeight } = {
        width: image.width,
        height: image.height,
    };

    const boundsWidth =
        Math.abs(Math.cos(rotRad) * bBoxWidth) +
        Math.abs(Math.sin(rotRad) * bBoxHeight);
    const boundsHeight =
        Math.abs(Math.sin(rotRad) * bBoxWidth) +
        Math.abs(Math.cos(rotRad) * bBoxHeight);

    canvas.width = boundsWidth;
    canvas.height = boundsHeight;

    ctx.translate(boundsWidth / 2, boundsHeight / 2);
    ctx.rotate(rotRad);
    ctx.scale(flip.horizontal ? -1 : 1, flip.vertical ? -1 : 1);
    ctx.translate(-bBoxWidth / 2, -bBoxHeight / 2);

    ctx.drawImage(
        image,
        pixelCrop.x,
        pixelCrop.y,
        pixelCrop.width,
        pixelCrop.height,
        0,
        0,
        pixelCrop.width,
        pixelCrop.height
    );

    return new Promise((resolve) => {
        canvas.toBlob(
            (file) => {
                if (!file) return;
                resolve(file);
            },
            'image/jpeg',
            0.9
        );
    });
};

export default function ImageCropperModal({
    imageSrc,
    onCropComplete,
    onCancel,
    config = {},
    initialCroppedAreaPercentages,
    initialCroppedAreaPixels,
    initialRotation = 0,
}: ImageCropperModalProps) {
    const {
        cropShape = 'round',
        aspectRatio = 1,
        showGrid = false,
        minZoom = 1,
        maxZoom = 3,
    } = config;

    const [crop, setCrop] = useState<Point>({ x: 0, y: 0 });
    const [zoom, setZoom] = useState(1);
    const [rotation, setRotation] = useState(initialRotation);
    const [croppedAreaPixels, setCroppedAreaPixels] = useState<Area | null>(null);
    const [isProcessing, setIsProcessing] = useState(false);
    const [flip, setFlip] = useState({ horizontal: false, vertical: false });

    const onCropCompleteInternal = useCallback(
        (_croppedArea: Area, croppedAreaPixels: Area) => {
            setCroppedAreaPixels(croppedAreaPixels);
        },
        []
    );

    const handleConfirm = async () => {
        if (!croppedAreaPixels) return;
        setIsProcessing(true);
        try {
            const croppedBlob = await createCroppedImage(
                imageSrc,
                croppedAreaPixels,
                rotation,
                flip
            );
            onCropComplete(croppedBlob);
        } catch (err) {
            console.error('裁剪失败:', err);
            alert('裁剪失败，请重试');
        } finally {
            setIsProcessing(false);
        }
    };

    return (
        // ✅ 关键调整 1：外层遮罩加上 p-4 留出边距，防止贴边
        <div className="fixed inset-0 z-[10000] flex items-center justify-center bg-black/70 p-4 sm:p-6">

            {/* ✅ 关键调整 2：弹窗容器设置最大高度 max-h-[90vh] 并改用 flex 纵向布局 */}
            <div className="bg-white rounded-xl shadow-2xl w-full max-w-2xl overflow-hidden flex flex-col max-h-[90vh]">

                {/* 头部 (固定高度) */}
                <div className="flex-shrink-0 px-5 py-4 border-b border-gray-200 flex justify-between items-center">
                    <h3 className="text-lg font-bold text-gray-800">编辑图片</h3>
                    <button onClick={onCancel} className="text-gray-400 hover:text-gray-600">
                        <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                        </svg>
                    </button>
                </div>

                {/* ✅ 关键调整 3：裁剪区域用 flex-1 占满剩余空间，并去掉固定的 h-[450px] */}
                <div className="relative flex-1 w-full min-h-[300px] bg-gray-900">
                    <Cropper
                        image={imageSrc}
                        crop={crop}
                        zoom={zoom}
                        rotation={rotation}
                        aspect={aspectRatio}
                        cropShape={cropShape}
                        showGrid={showGrid}
                        minZoom={minZoom}
                        maxZoom={maxZoom}
                        onCropChange={setCrop}
                        onZoomChange={setZoom}
                        onRotationChange={setRotation}
                        onCropComplete={onCropCompleteInternal}
                        initialCroppedAreaPercentages={initialCroppedAreaPercentages}
                        initialCroppedAreaPixels={initialCroppedAreaPixels}
                        transform={`translate(${crop.x}px, ${crop.y}px) rotate(${rotation}deg) scale(${zoom}) scaleX(${flip.horizontal ? -1 : 1}) scaleY(${flip.vertical ? -1 : 1})`}
                    />
                </div>

                {/* 工具栏 (固定高度) */}
                <div className="flex-shrink-0 px-5 py-4 border-b border-gray-200 space-y-4 bg-gray-50">
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                        <div>
                            <div className="flex items-center justify-between mb-1">
                                <span className="text-xs font-medium text-gray-500">缩放</span>
                                <span className="text-xs text-gray-400">{zoom.toFixed(1)}x</span>
                            </div>
                            <input
                                type="range"
                                value={zoom}
                                min={minZoom}
                                max={maxZoom}
                                step={0.1}
                                onChange={(e) => setZoom(Number(e.target.value))}
                                className="w-full accent-primary-600"
                            />
                        </div>

                        <div>
                            <div className="flex items-center justify-between mb-1">
                                <span className="text-xs font-medium text-gray-500">旋转</span>
                                <span className="text-xs text-gray-400">{rotation}°</span>
                            </div>
                            <input
                                type="range"
                                value={rotation}
                                min={0}
                                max={360}
                                step={1}
                                onChange={(e) => setRotation(Number(e.target.value))}
                                className="w-full accent-primary-600"
                            />
                        </div>
                    </div>

                    <div className="flex gap-2">
                        <button
                            type="button"
                            onClick={() => setFlip(prev => ({ ...prev, horizontal: !prev.horizontal }))}
                            className={`px-3 py-1.5 text-xs rounded-lg transition-colors flex items-center gap-1.5 ${flip.horizontal ? 'bg-primary-50 text-primary-700 border border-primary-200' : 'bg-white border border-gray-300 text-gray-700 hover:bg-gray-50'
                                }`}
                        >
                            <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7h12m0 0l-4-4m4 4l-4 4m0 6H4m0 0l4 4m-4-4l4-4" />
                            </svg>
                            水平翻转
                        </button>
                        <button
                            type="button"
                            onClick={() => setFlip(prev => ({ ...prev, vertical: !prev.vertical }))}
                            className={`px-3 py-1.5 text-xs rounded-lg transition-colors flex items-center gap-1.5 ${flip.vertical ? 'bg-primary-50 text-primary-700 border border-primary-200' : 'bg-white border border-gray-300 text-gray-700 hover:bg-gray-50'
                                }`}
                        >
                            <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M7 16V4m0 0L3 8m4-4l4 4m6 0v12m0 0l4-4m-4 4l-4-4" />
                            </svg>
                            垂直翻转
                        </button>
                        <button
                            type="button"
                            onClick={() => { setZoom(1); setRotation(0); setFlip({ horizontal: false, vertical: false }); }}
                            className="px-3 py-1.5 text-xs bg-white border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition-colors ml-auto"
                        >
                            重置
                        </button>
                    </div>
                </div>

                {/* ✅ 关键调整 4：底部按钮固定在最下方 (flex-shrink-0) */}
                <div className="flex-shrink-0 px-5 py-3 flex justify-end gap-2 bg-white">
                    <button
                        onClick={onCancel}
                        disabled={isProcessing}
                        className="px-4 py-2 text-sm text-gray-600 bg-white border border-gray-300 rounded-lg hover:bg-gray-50"
                    >
                        取消
                    </button>
                    <button
                        onClick={handleConfirm}
                        disabled={isProcessing}
                        className="px-4 py-2 text-sm text-white bg-primary-600 rounded-lg hover:bg-primary-700 disabled:opacity-50"
                    >
                        {isProcessing ? '处理中...' : '确认裁剪'}
                    </button>
                </div>

            </div>
        </div>
    );
}