import React, { useState, useRef } from 'react';
import {
  FolderPlus,
  FilePlus,
  RefreshCw,
  Monitor,
  Palette,
  LayoutGrid,
} from 'lucide-react';
import { DesktopIcon, FileItem, AppId } from '../../types/os';
import { AppIcon } from '../common/AppIcon';
import { soundEngine } from '../../utils/sound';

interface DesktopProps {
  wallpaper: string;
  files: FileItem[];
  selectedIconId: string | null;
  onSelectIcon: (id: string | null) => void;
  onOpenApp: (appId: AppId) => void;
  onOpenFile: (file: FileItem) => void;
  onCreateFolder: (name: string, location: FileItem['location']) => void;
  onCreateFile: (name: string, content: string, location: FileItem['location']) => void;
}

interface ContextMenuState {
  x: number;
  y: number;
  visible: boolean;
}

export const Desktop: React.FC<DesktopProps> = ({
  wallpaper,
  files,
  selectedIconId,
  onSelectIcon,
  onOpenApp,
  onOpenFile,
  onCreateFolder,
  onCreateFile,
}) => {
  const [contextMenu, setContextMenu] = useState<ContextMenuState>({ x: 0, y: 0, visible: false });
  const [iconSize, setIconSize] = useState<'normal' | 'small' | 'large'>('normal');

  // Rubber-band marquee selection
  const [selectionBox, setSelectionBox] = useState<{
    startX: number;
    startY: number;
    currentX: number;
    currentY: number;
    active: boolean;
  }>({ startX: 0, startY: 0, currentX: 0, currentY: 0, active: false });

  const desktopRef = useRef<HTMLDivElement>(null);

  // Desktop Icons: System shortcuts + Desktop files
  const systemShortcuts: { id: string; title: string; appId: AppId; icon: string }[] = [
    { id: 'sc-thispc', title: 'This PC', appId: 'explorer', icon: 'explorer' },
    { id: 'sc-recycle', title: 'Recycle Bin', appId: 'recyclebin', icon: 'recyclebin' },
    { id: 'sc-edge', title: 'Microsoft Edge', appId: 'edge', icon: 'edge' },
  ];

  const desktopFiles = files.filter((f) => f.location === 'desktop' && !f.isRecycled);
  const recycledCount = files.filter((f) => f.isRecycled).length;

  const handleContextMenu = (e: React.MouseEvent) => {
    e.preventDefault();
    soundEngine.playClick();
    setContextMenu({
      x: Math.min(e.clientX, window.innerWidth - 200),
      y: Math.min(e.clientY, window.innerHeight - 240),
      visible: true,
    });
  };

  const handleMouseDown = (e: React.MouseEvent) => {
    if (contextMenu.visible) {
      setContextMenu({ ...contextMenu, visible: false });
    }

    if (e.button === 0 && e.target === desktopRef.current) {
      onSelectIcon(null);
      setSelectionBox({
        startX: e.clientX,
        startY: e.clientY,
        currentX: e.clientX,
        currentY: e.clientY,
        active: true,
      });
    }
  };

  const handleMouseMove = (e: React.MouseEvent) => {
    if (selectionBox.active) {
      setSelectionBox((prev) => ({
        ...prev,
        currentX: e.clientX,
        currentY: e.clientY,
      }));
    }
  };

  const handleMouseUp = () => {
    if (selectionBox.active) {
      setSelectionBox((prev) => ({ ...prev, active: false }));
    }
  };

  const iconDimClass =
    iconSize === 'small'
      ? 'w-18 h-18 text-[11px]'
      : iconSize === 'large'
      ? 'w-24 h-24 text-xs'
      : 'w-20 h-20 text-xs';

  const iconGraphicSize = iconSize === 'small' ? 28 : iconSize === 'large' ? 44 : 36;

  // Box coordinates
  const boxLeft = Math.min(selectionBox.startX, selectionBox.currentX);
  const boxTop = Math.min(selectionBox.startY, selectionBox.currentY);
  const boxWidth = Math.abs(selectionBox.currentX - selectionBox.startX);
  const boxHeight = Math.abs(selectionBox.currentY - selectionBox.startY);

  return (
    <div
      ref={desktopRef}
      onContextMenu={handleContextMenu}
      onMouseDown={handleMouseDown}
      onMouseMove={handleMouseMove}
      onMouseUp={handleMouseUp}
      className="fixed inset-0 bottom-[44px] bg-cover bg-center select-none font-sans overflow-hidden"
      style={{ backgroundImage: `url(${wallpaper})` }}
    >
      {/* Rubber-band Marquee Selection Rectangle */}
      {selectionBox.active && (
        <div
          className="fixed border border-blue-400 bg-blue-500/25 pointer-events-none z-30"
          style={{
            left: `${boxLeft}px`,
            top: `${boxTop}px`,
            width: `${boxWidth}px`,
            height: `${boxHeight}px`,
          }}
        />
      )}

      {/* Desktop Icons Container */}
      <div className="p-2 flex flex-col flex-wrap gap-2 max-h-full items-start content-start z-10 relative">
        {/* System Shortcuts */}
        {systemShortcuts.map((sc) => {
          const isSelected = selectedIconId === sc.id;
          return (
            <div
              key={sc.id}
              onClick={(e) => {
                e.stopPropagation();
                onSelectIcon(sc.id);
              }}
              onDoubleClick={(e) => {
                e.stopPropagation();
                soundEngine.playClick();
                onOpenApp(sc.appId);
              }}
              className={`${iconDimClass} flex flex-col items-center justify-center p-1.5 rounded cursor-pointer transition-colors border group ${
                isSelected
                  ? 'bg-blue-600/35 border-blue-400/80 shadow-xs'
                  : 'border-transparent hover:bg-white/15'
              }`}
            >
              <div className="flex items-center justify-center mb-1 group-hover:scale-105 transition-transform">
                <AppIcon
                  appId={sc.icon}
                  size={iconGraphicSize}
                  isEmptyRecycleBin={sc.appId === 'recyclebin' && recycledCount === 0}
                />
              </div>
              <span className="text-white text-center truncate max-w-full font-normal leading-tight drop-shadow-[0_1px_2px_rgba(0,0,0,0.8)]">
                {sc.title}
              </span>
            </div>
          );
        })}

        {/* Desktop Files & Folders */}
        {desktopFiles.map((file) => {
          const isSelected = selectedIconId === file.id;
          return (
            <div
              key={file.id}
              onClick={(e) => {
                e.stopPropagation();
                onSelectIcon(file.id);
              }}
              onDoubleClick={(e) => {
                e.stopPropagation();
                soundEngine.playClick();
                onOpenFile(file);
              }}
              className={`${iconDimClass} flex flex-col items-center justify-center p-1.5 rounded cursor-pointer transition-colors border group ${
                isSelected
                  ? 'bg-blue-600/35 border-blue-400/80 shadow-xs'
                  : 'border-transparent hover:bg-white/15'
              }`}
            >
              <div className="flex items-center justify-center mb-1 group-hover:scale-105 transition-transform">
                {file.type === 'folder' ? (
                  <AppIcon name="folder" size={iconGraphicSize} />
                ) : file.extension === 'jpg' || file.extension === 'png' ? (
                  file.content?.startsWith('/src/assets') || file.content?.startsWith('data:') ? (
                    <img
                      src={file.content}
                      alt={file.name}
                      referrerPolicy="no-referrer"
                      className="w-8 h-8 object-cover rounded shadow-md border border-white/40"
                    />
                  ) : (
                    <AppIcon appId="photos" size={iconGraphicSize} />
                  )
                ) : (
                  <AppIcon appId={file.extension} size={iconGraphicSize} />
                )}
              </div>
              <span className="text-white text-center truncate max-w-full font-normal leading-tight drop-shadow-[0_1px_2px_rgba(0,0,0,0.8)]">
                {file.name}
              </span>
            </div>
          );
        })}
      </div>

      {/* Desktop Right-Click Context Menu */}
      {contextMenu.visible && (
        <div
          onClick={(e) => e.stopPropagation()}
          className="fixed bg-white/95 backdrop-blur-xl border border-zinc-300 shadow-xl rounded-sm py-1 z-50 text-xs text-zinc-800 w-48 font-sans animate-fadeIn select-none"
          style={{ top: `${contextMenu.y}px`, left: `${contextMenu.x}px` }}
        >
          {/* View size toggle */}
          <button
            onClick={() => {
              setIconSize(iconSize === 'normal' ? 'large' : iconSize === 'large' ? 'small' : 'normal');
              setContextMenu({ ...contextMenu, visible: false });
            }}
            className="w-full text-left px-3 py-1.5 hover:bg-zinc-100 flex items-center justify-between"
          >
            <div className="flex items-center gap-2">
              <LayoutGrid size={14} className="text-zinc-500" />
              <span>Icon size: {iconSize}</span>
            </div>
          </button>

          {/* Refresh */}
          <button
            onClick={() => {
              soundEngine.playClick();
              setContextMenu({ ...contextMenu, visible: false });
            }}
            className="w-full text-left px-3 py-1.5 hover:bg-zinc-100 flex items-center gap-2"
          >
            <RefreshCw size={14} className="text-zinc-500" />
            <span>Refresh</span>
          </button>

          <div className="border-t border-zinc-200 my-1" />

          {/* New Folder */}
          <button
            onClick={() => {
              onCreateFolder('New folder', 'desktop');
              setContextMenu({ ...contextMenu, visible: false });
            }}
            className="w-full text-left px-3 py-1.5 hover:bg-zinc-100 flex items-center gap-2"
          >
            <FolderPlus size={14} className="text-amber-500" />
            <span>New folder</span>
          </button>

          {/* New Text Document */}
          <button
            onClick={() => {
              onCreateFile('New Text Document.txt', '', 'desktop');
              setContextMenu({ ...contextMenu, visible: false });
            }}
            className="w-full text-left px-3 py-1.5 hover:bg-zinc-100 flex items-center gap-2"
          >
            <FilePlus size={14} className="text-blue-500" />
            <span>New text document</span>
          </button>

          <div className="border-t border-zinc-200 my-1" />

          {/* Display Settings */}
          <button
            onClick={() => {
              onOpenApp('settings');
              setContextMenu({ ...contextMenu, visible: false });
            }}
            className="w-full text-left px-3 py-1.5 hover:bg-zinc-100 flex items-center gap-2"
          >
            <Monitor size={14} className="text-zinc-500" />
            <span>Display settings</span>
          </button>

          {/* Personalize */}
          <button
            onClick={() => {
              onOpenApp('settings');
              setContextMenu({ ...contextMenu, visible: false });
            }}
            className="w-full text-left px-3 py-1.5 hover:bg-zinc-100 flex items-center gap-2"
          >
            <Palette size={14} className="text-purple-500" />
            <span>Personalize</span>
          </button>
        </div>
      )}
    </div>
  );
};
