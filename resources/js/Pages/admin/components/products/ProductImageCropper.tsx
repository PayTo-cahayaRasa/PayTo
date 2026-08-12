import { Crop, RotateCcw, Save, X, ZoomIn } from 'lucide-react';
import { useEffect, useMemo, useRef, useState } from 'react';
import type { KeyboardEvent, PointerEvent } from 'react';

import { calculateCropGeometry, getCropAspectRatio } from './productImageCrop';
import type { CropPoint, CropSize } from './productImageCrop';

const OUTPUT_WIDTH = 1200;

type ProductImageCropperProps = {
    file: File;
    onApply: (file: File) => void;
    onCancel: () => void;
};

export default function ProductImageCropper({ file, onApply, onCancel }: ProductImageCropperProps) {
    const frameRef = useRef<HTMLDivElement | null>(null);
    const imageRef = useRef<HTMLImageElement | null>(null);
    const dragStartRef = useRef<{ pointer: CropPoint; offset: CropPoint } | null>(null);
    const [imageUrl] = useState(() => URL.createObjectURL(file));
    const [naturalSize, setNaturalSize] = useState<CropSize | null>(null);
    const [frameSize, setFrameSize] = useState<CropSize>({ width: 640, height: 360 });
    const [zoom, setZoom] = useState(1);
    const [offset, setOffset] = useState<CropPoint>({ x: 0, y: 0 });
    const [isProcessing, setIsProcessing] = useState(false);
    const [errorMessage, setErrorMessage] = useState<string | null>(null);
    const cropAspectRatio = naturalSize ? getCropAspectRatio(naturalSize) : 16 / 9;
    const isPortraitOrSquare = cropAspectRatio <= 1;

    const geometry = useMemo(() => {
        if (!naturalSize) {
            return null;
        }

        return calculateCropGeometry(frameSize, naturalSize, zoom, offset);
    }, [frameSize, naturalSize, offset, zoom]);

    useEffect(() => {
        const frame = frameRef.current;
        if (!frame) {
            return;
        }

        const observer = new ResizeObserver(([entry]) => {
            setFrameSize({
                width: entry.contentRect.width,
                height: entry.contentRect.height,
            });
        });
        observer.observe(frame);

        return () => observer.disconnect();
    }, []);

    useEffect(() => {
        const handleKeyDown = (event: globalThis.KeyboardEvent) => {
            if (event.key === 'Escape' && !isProcessing) {
                onCancel();
            }
        };
        window.addEventListener('keydown', handleKeyDown);

        return () => window.removeEventListener('keydown', handleKeyDown);
    }, [isProcessing, onCancel]);

    useEffect(() => () => URL.revokeObjectURL(imageUrl), [imageUrl]);

    function moveImage(nextOffset: CropPoint): void {
        if (!naturalSize) {
            return;
        }

        setOffset(calculateCropGeometry(frameSize, naturalSize, zoom, nextOffset).offset);
    }

    function handlePointerMove(event: PointerEvent<HTMLDivElement>): void {
        const dragStart = dragStartRef.current;
        if (!dragStart) {
            return;
        }

        moveImage({
            x: dragStart.offset.x + event.clientX - dragStart.pointer.x,
            y: dragStart.offset.y + event.clientY - dragStart.pointer.y,
        });
    }

    function handleCropKeyboard(event: KeyboardEvent<HTMLDivElement>): void {
        const movement = event.shiftKey ? 25 : 8;
        const direction = {
            ArrowLeft: { x: -movement, y: 0 },
            ArrowRight: { x: movement, y: 0 },
            ArrowUp: { x: 0, y: -movement },
            ArrowDown: { x: 0, y: movement },
        }[event.key];

        if (!direction) {
            return;
        }

        event.preventDefault();
        moveImage({ x: offset.x + direction.x, y: offset.y + direction.y });
    }

    function handleZoom(nextZoom: number): void {
        setZoom(nextZoom);
        if (naturalSize) {
            setOffset(calculateCropGeometry(frameSize, naturalSize, nextZoom, offset).offset);
        }
    }

    async function applyCrop(): Promise<void> {
        const image = imageRef.current;
        if (!image || !geometry || isProcessing) {
            return;
        }

        setIsProcessing(true);
        setErrorMessage(null);

        try {
            const outputWidth = Math.max(1, Math.min(OUTPUT_WIDTH, Math.round(geometry.source.width)));
            const canvas = document.createElement('canvas');
            canvas.width = outputWidth;
            canvas.height = Math.max(1, Math.round(outputWidth / cropAspectRatio));
            const context = canvas.getContext('2d');
            if (!context) {
                throw new Error('Canvas tidak tersedia.');
            }

            context.drawImage(
                image,
                geometry.source.x,
                geometry.source.y,
                geometry.source.width,
                geometry.source.height,
                0,
                0,
                canvas.width,
                canvas.height,
            );

            const blob = await new Promise<Blob>((resolve, reject) => {
                canvas.toBlob(
                    (result) => result ? resolve(result) : reject(new Error('Gagal membuat hasil crop.')),
                    'image/webp',
                    0.9,
                );
            });
            const baseName = file.name.replace(/\.[^.]+$/, '') || 'produk';
            onApply(new File([blob], `${baseName}-cropped.webp`, {
                type: 'image/webp',
                lastModified: Date.now(),
            }));
        } catch {
            setErrorMessage('Foto gagal diproses. Silakan pilih foto lain.');
            setIsProcessing(false);
        }
    }

    return (
        <div className="fixed inset-0 z-70 flex items-center justify-center bg-slate-950/70 p-4 backdrop-blur-sm" role="dialog" aria-modal="true" aria-labelledby="product-crop-title">
            <div className="flex max-h-[94vh] w-full max-w-3xl flex-col overflow-hidden rounded-4xl bg-white shadow-2xl">
                <div className="flex items-start justify-between gap-4 border-b border-slate-100 px-5 py-4 sm:px-7 sm:py-5">
                    <div>
                        <h3 id="product-crop-title" className="flex items-center gap-2 text-lg font-bold text-slate-900 sm:text-xl">
                            <Crop size={20} className="text-indigo-600" /> Crop & Reposisi Foto
                        </h3>
                        <p className="mt-1 text-xs leading-5 text-slate-500 sm:text-sm">Geser foto dan atur zoom hingga produk pas di dalam frame.</p>
                    </div>
                    <button type="button" onClick={onCancel} disabled={isProcessing} aria-label="Tutup editor foto" className="inline-flex size-10 shrink-0 items-center justify-center rounded-full text-slate-500 transition hover:bg-slate-100 disabled:opacity-50">
                        <X size={19} />
                    </button>
                </div>

                <div className="overflow-y-auto p-5 sm:p-7">
                    <div
                        ref={frameRef}
                        role="application"
                        tabIndex={0}
                        aria-label="Area crop foto. Geser dengan mouse atau gunakan tombol panah."
                        className={`relative touch-none cursor-move overflow-hidden rounded-3xl bg-slate-950 outline-none ring-indigo-400 focus-visible:ring-4 ${isPortraitOrSquare ? 'mx-auto h-[52vh] max-h-128 max-w-full' : 'w-full'}`}
                        style={{ aspectRatio: cropAspectRatio }}
                        onKeyDown={handleCropKeyboard}
                        onPointerDown={(event) => {
                            event.currentTarget.setPointerCapture(event.pointerId);
                            dragStartRef.current = {
                                pointer: { x: event.clientX, y: event.clientY },
                                offset: geometry?.offset ?? offset,
                            };
                        }}
                        onPointerMove={handlePointerMove}
                        onPointerUp={() => { dragStartRef.current = null; }}
                        onPointerCancel={() => { dragStartRef.current = null; }}
                    >
                        <img
                            ref={imageRef}
                            src={imageUrl}
                            alt="Preview foto produk yang akan dipotong"
                            draggable={false}
                            onLoad={(event) => setNaturalSize({
                                width: event.currentTarget.naturalWidth,
                                height: event.currentTarget.naturalHeight,
                            })}
                            onError={() => setErrorMessage('Foto tidak dapat dibuka. Silakan pilih file lain.')}
                            className="pointer-events-none absolute max-w-none select-none"
                            style={geometry ? {
                                width: geometry.renderedSize.width,
                                height: geometry.renderedSize.height,
                                left: `calc(50% + ${geometry.offset.x}px)`,
                                top: `calc(50% + ${geometry.offset.y}px)`,
                                transform: 'translate(-50%, -50%)',
                            } : undefined}
                        />
                        <div className="pointer-events-none absolute inset-0 rounded-3xl border-2 border-white/80 shadow-[inset_0_0_0_999px_rgba(15,23,42,0.08)]" aria-hidden="true">
                            <span className="absolute inset-y-0 left-1/3 border-l border-dashed border-white/55" />
                            <span className="absolute inset-y-0 right-1/3 border-r border-dashed border-white/55" />
                            <span className="absolute inset-x-0 top-1/3 border-t border-dashed border-white/55" />
                            <span className="absolute inset-x-0 bottom-1/3 border-b border-dashed border-white/55" />
                        </div>
                    </div>

                    <p className="mt-3 text-center text-xs text-slate-500">Drag untuk menggeser • Tombol panah untuk reposisi presisi • Rasio mengikuti foto otomatis</p>

                    <label htmlFor="product-image-zoom" className="mt-5 flex items-center gap-3 text-sm font-semibold text-slate-700">
                        <ZoomIn size={17} className="text-indigo-600" />
                        <span>Zoom</span>
                        <input
                            id="product-image-zoom"
                            type="range"
                            min="1"
                            max="3"
                            step="0.05"
                            value={zoom}
                            onChange={(event) => handleZoom(Number(event.target.value))}
                            className="min-w-0 flex-1 accent-indigo-600"
                        />
                        <span className="w-12 text-right text-xs tabular-nums text-slate-500">{Math.round(zoom * 100)}%</span>
                    </label>

                    {errorMessage ? (
                        <p className="mt-4 rounded-2xl border border-rose-200 bg-rose-50 px-4 py-3 text-sm font-semibold text-rose-600">{errorMessage}</p>
                    ) : null}
                </div>

                <div className="flex flex-col-reverse gap-2 border-t border-slate-100 bg-slate-50 p-5 sm:flex-row sm:items-center sm:justify-between">
                    <button type="button" onClick={() => { setZoom(1); setOffset({ x: 0, y: 0 }); }} disabled={isProcessing} className="inline-flex min-h-11 items-center justify-center gap-2 rounded-xl border border-slate-200 bg-white px-4 text-sm font-bold text-slate-600 transition hover:bg-slate-100 disabled:opacity-50">
                        <RotateCcw size={16} /> Reset Posisi
                    </button>
                    <div className="flex flex-col-reverse gap-2 sm:flex-row">
                        <button type="button" onClick={onCancel} disabled={isProcessing} className="min-h-11 rounded-xl px-5 text-sm font-bold text-slate-500 transition hover:bg-slate-200 disabled:opacity-50">Batal</button>
                        <button type="button" onClick={applyCrop} disabled={!geometry || isProcessing} className="inline-flex min-h-11 items-center justify-center gap-2 rounded-xl bg-indigo-600 px-5 text-sm font-bold text-white shadow-lg shadow-indigo-200 transition hover:bg-indigo-700 disabled:cursor-not-allowed disabled:opacity-60">
                            <Save size={17} /> {isProcessing ? 'Memproses...' : 'Gunakan Foto'}
                        </button>
                    </div>
                </div>
            </div>
        </div>
    );
}
