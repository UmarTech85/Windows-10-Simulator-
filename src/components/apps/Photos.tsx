import React, { useState } from 'react';
import {
  ZoomIn,
  ZoomOut,
  RotateCw,
  Trash2,
  ChevronLeft,
  ChevronRight,
  Maximize2,
  Wallpaper,
} from 'lucide-react';
import { FileItem } from '../../types/os';
import { soundEngine } from '../../utils/sound';

interface PhotosProps {
  initialFile?: FileItem;
  allImageFiles: FileItem[];
  onSetWallpaper?: (imageUrl: string) => void;
  onDelete?: (fileId: string) => void;
}

export const Photos: React.FC<PhotosProps> = ({
  initialFile,
  allImageFiles,
  onSetWallpaper,
  onDelete,
}) => {
  const [currentIdx, setCurrentIdx] = useState<number>(() => {
    if (!initialFile) return 0;
    const idx = allImageFiles.findIndex((f) => f.id === initialFile.id);
    return idx >= 0 ? idx : 0;
  });

  const [zoom, setZoom] = useState<number>(1);
  const [rotation, setRotation] = useState<number>(0);
  const [toast, setToast] = useState<string | null>(null);

  const currentPhoto = allImageFiles[currentIdx];

  const handleNext = () => {
    soundEngine.playClick();
    setCurrentIdx((prev) => (prev + 1) % allImageFiles.length);
    setZoom(1);
    setRotation(0);
  };

  const handlePrev = () => {
    soundEngine.playClick();
    setCurrentIdx((prev) => (prev - 1 + allImageFiles.length) % allImageFiles.length);
    setZoom(1);
    setRotation(0);
  };

  const handleSetWallpaper = () => {
    if (!currentPhoto?.content) return;
    onSetWallpaper?.(currentPhoto.content);
    soundEngine.playNotification();
    setToast('Desktop background updated!');
    setTimeout(() => setToast(null), 3000);
  };

  if (allImageFiles.length === 0 || !currentPhoto) {
    return (
      <div className="flex flex-col items-center justify-center h-full bg-zinc-900 text-zinc-400 text-xs">
        <p>No photos found in Pictures or Desktop.</p>
      </div>
    );
  }

  return (
    <div className="flex flex-col h-full bg-zinc-950 text-white select-none font-sans overflow-hidden relative">
      {/* Top Toolbar */}
      <div className="flex items-center justify-between px-3 py-2 bg-zinc-900/90 border-b border-zinc-800 text-xs z-10">
        <div className="flex items-center gap-2">
          <span className="font-medium truncate max-w-xs text-zinc-200">
            {currentPhoto.name}
          </span>
          <span className="text-zinc-500 text-[11px]">
            ({currentIdx + 1} of {allImageFiles.length})
          </span>
        </div>

        <div className="flex items-center gap-1">
          <button
            onClick={() => setZoom((z) => Math.min(3, z + 0.25))}
            title="Zoom In"
            className="p-1.5 rounded hover:bg-zinc-800 text-zinc-300"
          >
            <ZoomIn size={16} />
          </button>
          <button
            onClick={() => setZoom((z) => Math.max(0.5, z - 0.25))}
            title="Zoom Out"
            className="p-1.5 rounded hover:bg-zinc-800 text-zinc-300"
          >
            <ZoomOut size={16} />
          </button>
          <button
            onClick={() => setRotation((r) => (r + 90) % 360)}
            title="Rotate"
            className="p-1.5 rounded hover:bg-zinc-800 text-zinc-300"
          >
            <RotateCw size={16} />
          </button>
          <div className="w-px h-4 bg-zinc-700 mx-1" />
          <button
            onClick={handleSetWallpaper}
            className="flex items-center gap-1.5 px-2.5 py-1 bg-blue-600 hover:bg-blue-700 text-white rounded text-xs transition-colors"
          >
            <Wallpaper size={14} />
            <span>Set as Background</span>
          </button>
          {onDelete && (
            <button
              onClick={() => {
                onDelete(currentPhoto.id);
                soundEngine.playClick();
              }}
              title="Delete Photo"
              className="p-1.5 rounded hover:bg-red-900/50 text-zinc-400 hover:text-red-400"
            >
              <Trash2 size={16} />
            </button>
          )}
        </div>
      </div>

      {toast && (
        <div className="absolute top-12 left-1/2 -translate-x-1/2 z-30 bg-blue-600 text-white text-xs px-4 py-1.5 rounded-full shadow-lg">
          {toast}
        </div>
      )}

      {/* Main Photo Viewport */}
      <div className="flex-1 flex items-center justify-center p-4 relative overflow-hidden bg-black">
        <img
          src={currentPhoto.content}
          alt={currentPhoto.name}
          referrerPolicy="no-referrer"
          className="max-h-full max-w-full object-contain transition-transform duration-200 shadow-2xl"
          style={{
            transform: `scale(${zoom}) rotate(${rotation}deg)`,
          }}
        />

        {/* Previous / Next Arrow Overlays */}
        {allImageFiles.length > 1 && (
          <>
            <button
              onClick={handlePrev}
              className="absolute left-4 top-1/2 -translate-y-1/2 p-2 rounded-full bg-black/60 hover:bg-black/90 text-white transition-all hover:scale-110"
            >
              <ChevronLeft size={24} />
            </button>
            <button
              onClick={handleNext}
              className="absolute right-4 top-1/2 -translate-y-1/2 p-2 rounded-full bg-black/60 hover:bg-black/90 text-white transition-all hover:scale-110"
            >
              <ChevronRight size={24} />
            </button>
          </>
        )}
      </div>

      {/* Bottom Thumbnail Strip */}
      <div className="flex items-center gap-2 px-3 py-2 bg-zinc-900/90 border-t border-zinc-800 overflow-x-auto justify-center h-16">
        {allImageFiles.map((file, i) => (
          <button
            key={file.id}
            onClick={() => {
              setCurrentIdx(i);
              setZoom(1);
              setRotation(0);
              soundEngine.playClick();
            }}
            className={`h-12 w-16 shrink-0 rounded overflow-hidden border-2 transition-all ${
              i === currentIdx ? 'border-blue-500 scale-105' : 'border-transparent opacity-60 hover:opacity-100'
            }`}
          >
            <img
              src={file.content}
              alt={file.name}
              referrerPolicy="no-referrer"
              className="w-full h-full object-cover"
            />
          </button>
        ))}
      </div>
    </div>
  );
};
