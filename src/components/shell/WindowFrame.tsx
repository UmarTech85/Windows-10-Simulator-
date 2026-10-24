import React, { useState, useRef, useEffect } from 'react';
import { Minus, Square, Copy, X } from 'lucide-react';
import { WindowState } from '../../types/os';
import { AppIcon } from '../common/AppIcon';
import { soundEngine } from '../../utils/sound';

interface WindowFrameProps {
  window: WindowState;
  isActive: boolean;
  accentColor: string;
  theme: 'dark' | 'light';
  onFocus: () => void;
  onClose: () => void;
  onMinimize: () => void;
  onToggleMaximize: () => void;
  onUpdateBounds: (bounds: { x: number; y: number; width: number; height: number; snapped?: 'left' | 'right' | null }) => void;
  children: React.ReactNode;
}

export const WindowFrame: React.FC<WindowFrameProps> = ({
  window: win,
  isActive,
  accentColor,
  theme,
  onFocus,
  onClose,
  onMinimize,
  onToggleMaximize,
  onUpdateBounds,
  children,
}) => {
  const [isDragging, setIsDragging] = useState(false);
  const [dragOffset, setDragOffset] = useState({ x: 0, y: 0 });
  const [isResizing, setIsResizing] = useState<string | null>(null);
  const [resizeStart, setResizeStart] = useState({ x: 0, y: 0, w: 0, h: 0, winX: 0, winY: 0 });
  const [snapGhost, setSnapGhost] = useState<'left' | 'right' | 'full' | null>(null);

  const frameRef = useRef<HTMLDivElement>(null);

  // Dragging logic
  const handleMouseDownHeader = (e: React.MouseEvent) => {
    if (e.button !== 0) return;
    onFocus();

    // If maximized or snapped, clicking header and dragging restores window to cursor position
    if (win.isMaximized || win.snappedPosition) {
      const restoredW = win.prevBounds?.width || 800;
      const restoredH = win.prevBounds?.height || 500;
      const newX = Math.max(0, e.clientX - restoredW / 2);
      const newY = Math.max(0, e.clientY - 15);

      onUpdateBounds({
        x: newX,
        y: newY,
        width: restoredW,
        height: restoredH,
        snapped: null,
      });

      setIsDragging(true);
      setDragOffset({ x: restoredW / 2, y: 15 });
      return;
    }

    setIsDragging(true);
    setDragOffset({
      x: e.clientX - win.x,
      y: e.clientY - win.y,
    });
  };

  // Resize start
  const handleMouseDownResize = (direction: string, e: React.MouseEvent) => {
    e.stopPropagation();
    onFocus();
    setIsResizing(direction);
    setResizeStart({
      x: e.clientX,
      y: e.clientY,
      w: win.width,
      h: win.height,
      winX: win.x,
      winY: win.y,
    });
  };

  const onUpdateBoundsRef = useRef(onUpdateBounds);
  onUpdateBoundsRef.current = onUpdateBounds;
  const onToggleMaximizeRef = useRef(onToggleMaximize);
  onToggleMaximizeRef.current = onToggleMaximize;
  const winRef = useRef(win);
  winRef.current = win;

  // Window drag & resize mousemove listener
  useEffect(() => {
    if (!isDragging && !isResizing) return;

    const handleMouseMove = (e: MouseEvent) => {
      const currentWin = winRef.current;
      if (isDragging) {
        const nextX = e.clientX - dragOffset.x;
        const nextY = Math.max(0, e.clientY - dragOffset.y);

        // Aero Snap preview detection
        if (e.clientY <= 8) {
          setSnapGhost('full');
        } else if (e.clientX <= 8) {
          setSnapGhost('left');
        } else if (e.clientX >= window.innerWidth - 8) {
          setSnapGhost('right');
        } else {
          setSnapGhost(null);
        }

        onUpdateBoundsRef.current({
          x: nextX,
          y: nextY,
          width: currentWin.width,
          height: currentWin.height,
        });
      } else if (isResizing) {
        const deltaX = e.clientX - resizeStart.x;
        const deltaY = e.clientY - resizeStart.y;
        const minW = currentWin.minWidth || 320;
        const minH = currentWin.minHeight || 200;

        let newW = resizeStart.w;
        let newH = resizeStart.h;
        let newX = resizeStart.winX;
        let newY = resizeStart.winY;

        if (isResizing.includes('e')) newW = Math.max(minW, resizeStart.w + deltaX);
        if (isResizing.includes('s')) newH = Math.max(minH, resizeStart.h + deltaY);
        if (isResizing.includes('w')) {
          const w = resizeStart.w - deltaX;
          if (w >= minW) {
            newW = w;
            newX = resizeStart.winX + deltaX;
          }
        }
        if (isResizing.includes('n')) {
          const h = resizeStart.h - deltaY;
          if (h >= minH) {
            newH = h;
            newY = resizeStart.winY + deltaY;
          }
        }

        onUpdateBoundsRef.current({
          x: newX,
          y: newY,
          width: newW,
          height: newH,
        });
      }
    };

    const handleMouseUp = () => {
      if (isDragging) {
        setIsDragging(false);

        // Execute Aero Snap
        if (snapGhost === 'full') {
          onToggleMaximizeRef.current();
        } else if (snapGhost === 'left') {
          onUpdateBoundsRef.current({
            x: 0,
            y: 0,
            width: window.innerWidth / 2,
            height: window.innerHeight - 44,
            snapped: 'left',
          });
          soundEngine.playClick();
        } else if (snapGhost === 'right') {
          onUpdateBoundsRef.current({
            x: window.innerWidth / 2,
            y: 0,
            width: window.innerWidth / 2,
            height: window.innerHeight - 44,
            snapped: 'right',
          });
          soundEngine.playClick();
        }
        setSnapGhost(null);
      }

      if (isResizing) {
        setIsResizing(null);
      }
    };

    window.addEventListener('mousemove', handleMouseMove);
    window.addEventListener('mouseup', handleMouseUp);

    return () => {
      window.removeEventListener('mousemove', handleMouseMove);
      window.removeEventListener('mouseup', handleMouseUp);
    };
  }, [isDragging, isResizing, dragOffset, resizeStart, snapGhost]);

  if (win.isMinimized) return null;

  // Compute position & dimensions
  const isMax = win.isMaximized;
  const isSnapLeft = win.snappedPosition === 'left';
  const isSnapRight = win.snappedPosition === 'right';

  const style: React.CSSProperties = isMax
    ? {
        top: 0,
        left: 0,
        width: '100%',
        height: 'calc(100vh - 44px)',
        zIndex: win.zIndex,
      }
    : isSnapLeft
    ? {
        top: 0,
        left: 0,
        width: '50%',
        height: 'calc(100vh - 44px)',
        zIndex: win.zIndex,
      }
    : isSnapRight
    ? {
        top: 0,
        left: '50%',
        width: '50%',
        height: 'calc(100vh - 44px)',
        zIndex: win.zIndex,
      }
    : {
        top: `${win.y}px`,
        left: `${win.x}px`,
        width: `${win.width}px`,
        height: `${win.height}px`,
        zIndex: win.zIndex,
      };

  return (
    <>
      {/* Aero Snap Ghost Preview Outline */}
      {snapGhost && (
        <div
          className={`fixed pointer-events-none z-50 border-2 border-blue-400 bg-blue-500/20 backdrop-blur-xs transition-all duration-150 animate-fadeIn ${
            snapGhost === 'full'
              ? 'inset-0 bottom-[44px]'
              : snapGhost === 'left'
              ? 'left-0 top-0 w-1/2 bottom-[44px]'
              : 'right-0 top-0 w-1/2 bottom-[44px]'
          }`}
        />
      )}

      {/* Actual Window Frame */}
      <div
        ref={frameRef}
        onMouseDown={onFocus}
        style={style}
        className={`fixed flex flex-col rounded-t-sm shadow-2xl overflow-hidden border transition-[box-shadow] select-none ${
          isActive
            ? 'border-zinc-400/80 shadow-black/40 ring-1 ring-black/10'
            : 'border-zinc-300/50 shadow-black/20 opacity-95'
        }`}
      >
        {/* Title Bar */}
        <div
          onMouseDown={handleMouseDownHeader}
          onDoubleClick={onToggleMaximize}
          className={`h-8 flex items-center justify-between px-2 cursor-default shrink-0 transition-colors ${
            isActive
              ? theme === 'dark'
                ? 'bg-[#1f1f1f] text-white'
                : 'bg-white text-zinc-800'
              : 'bg-[#e5e5e5] text-zinc-500'
          }`}
          style={
            isActive && accentColor && false /* optional title accent bar */
              ? { backgroundColor: accentColor, color: '#ffffff' }
              : undefined
          }
        >
          {/* App Icon + Title */}
          <div className="flex items-center gap-2 overflow-hidden pointer-events-none">
            <AppIcon appId={win.appId} size={15} />
            <span className="text-xs font-normal truncate tracking-wide">
              {win.title}
            </span>
          </div>

          {/* Window Control Buttons: Minimize, Maximize, Close */}
          <div className="flex items-center h-full -mr-2">
            <button
              onClick={(e) => {
                e.stopPropagation();
                soundEngine.playClick();
                onMinimize();
              }}
              title="Minimize"
              className="h-full px-3 hover:bg-zinc-200 dark:hover:bg-zinc-700/60 text-zinc-600 dark:text-zinc-300 flex items-center justify-center transition-colors"
            >
              <Minus size={13} strokeWidth={2} />
            </button>
            <button
              onClick={(e) => {
                e.stopPropagation();
                soundEngine.playClick();
                onToggleMaximize();
              }}
              title={isMax ? 'Restore Down' : 'Maximize'}
              className="h-full px-3 hover:bg-zinc-200 dark:hover:bg-zinc-700/60 text-zinc-600 dark:text-zinc-300 flex items-center justify-center transition-colors"
            >
              {isMax ? <Copy size={11} strokeWidth={2} /> : <Square size={11} strokeWidth={2} />}
            </button>
            <button
              onClick={(e) => {
                e.stopPropagation();
                soundEngine.playClick();
                onClose();
              }}
              title="Close"
              className="h-full px-3.5 hover:bg-red-600 hover:text-white text-zinc-600 dark:text-zinc-300 flex items-center justify-center transition-colors"
            >
              <X size={14} strokeWidth={2} />
            </button>
          </div>
        </div>

        {/* Window Content Area */}
        <div className="flex-1 overflow-hidden bg-white relative">
          {children}
        </div>

        {/* Resizing Handles (only when not maximized) */}
        {!isMax && !isSnapLeft && !isSnapRight && (
          <>
            <div
              onMouseDown={(e) => handleMouseDownResize('n', e)}
              className="absolute top-0 left-0 right-0 h-1.5 cursor-n-resize"
            />
            <div
              onMouseDown={(e) => handleMouseDownResize('s', e)}
              className="absolute bottom-0 left-0 right-0 h-1.5 cursor-s-resize"
            />
            <div
              onMouseDown={(e) => handleMouseDownResize('w', e)}
              className="absolute top-0 bottom-0 left-0 w-1.5 cursor-w-resize"
            />
            <div
              onMouseDown={(e) => handleMouseDownResize('e', e)}
              className="absolute top-0 bottom-0 right-0 w-1.5 cursor-e-resize"
            />
            <div
              onMouseDown={(e) => handleMouseDownResize('nw', e)}
              className="absolute top-0 left-0 w-3 h-3 cursor-nw-resize"
            />
            <div
              onMouseDown={(e) => handleMouseDownResize('ne', e)}
              className="absolute top-0 right-0 w-3 h-3 cursor-ne-resize"
            />
            <div
              onMouseDown={(e) => handleMouseDownResize('sw', e)}
              className="absolute bottom-0 left-0 w-3 h-3 cursor-sw-resize"
            />
            <div
              onMouseDown={(e) => handleMouseDownResize('se', e)}
              className="absolute bottom-0 right-0 w-3 h-3 cursor-se-resize"
            />
          </>
        )}
      </div>
    </>
  );
};
