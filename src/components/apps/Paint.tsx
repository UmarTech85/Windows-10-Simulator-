import React, { useRef, useState, useEffect } from 'react';
import {
  Paintbrush,
  Eraser,
  Square,
  Circle,
  Minus,
  Download,
  Save,
  RotateCcw,
  Trash2,
  Pipette,
} from 'lucide-react';
import { soundEngine } from '../../utils/sound';

interface PaintProps {
  onSaveToPictures?: (filename: string, dataUrl: string) => void;
}

type Tool = 'pencil' | 'brush' | 'eraser' | 'line' | 'rect' | 'circle' | 'picker';

const PALETTE_COLORS = [
  '#000000',
  '#7f7f7f',
  '#880015',
  '#ed1c24',
  '#ff7f27',
  '#fff200',
  '#22b14c',
  '#00a2e8',
  '#3f48cc',
  '#a349a4',
  '#ffffff',
  '#c3c3c3',
  '#b97a57',
  '#ffaec9',
  '#ffc90e',
  '#efe4b0',
  '#b5e61d',
  '#99d9ea',
  '#7092be',
  '#c8bfe7',
];

export const Paint: React.FC<PaintProps> = ({ onSaveToPictures }) => {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const [tool, setTool] = useState<Tool>('pencil');
  const [color, setColor] = useState<string>('#000000');
  const [brushSize, setBrushSize] = useState<number>(3);
  const [isDrawing, setIsDrawing] = useState<boolean>(false);
  const [startPos, setStartPos] = useState<{ x: number; y: number }>({ x: 0, y: 0 });
  const [undoStack, setUndoStack] = useState<ImageData[]>([]);
  const [notification, setNotification] = useState<string | null>(null);

  // Initialize white canvas
  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    ctx.fillStyle = '#ffffff';
    ctx.fillRect(0, 0, canvas.width, canvas.height);
    saveState();
  }, []);

  const saveState = () => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    const data = ctx.getImageData(0, 0, canvas.width, canvas.height);
    setUndoStack((prev) => [...prev.slice(-15), data]);
  };

  const handleUndo = () => {
    if (undoStack.length <= 1) return;
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    const newStack = [...undoStack];
    newStack.pop(); // remove current
    const prevState = newStack[newStack.length - 1];
    ctx.putImageData(prevState, 0, 0);
    setUndoStack(newStack);
    soundEngine.playClick();
  };

  const handleClear = () => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    ctx.fillStyle = '#ffffff';
    ctx.fillRect(0, 0, canvas.width, canvas.height);
    saveState();
    soundEngine.playClick();
  };

  const getCanvasCoords = (e: React.MouseEvent<HTMLCanvasElement>) => {
    const canvas = canvasRef.current;
    if (!canvas) return { x: 0, y: 0 };
    const rect = canvas.getBoundingClientRect();
    const scaleX = canvas.width / rect.width;
    const scaleY = canvas.height / rect.height;
    return {
      x: (e.clientX - rect.left) * scaleX,
      y: (e.clientY - rect.top) * scaleY,
    };
  };

  const startDraw = (e: React.MouseEvent<HTMLCanvasElement>) => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    const coords = getCanvasCoords(e);

    if (tool === 'picker') {
      const pixel = ctx.getImageData(coords.x, coords.y, 1, 1).data;
      const hex = `#${((1 << 24) + (pixel[0] << 16) + (pixel[1] << 8) + pixel[2]).toString(16).slice(1)}`;
      setColor(hex);
      setTool('brush');
      return;
    }

    setIsDrawing(true);
    setStartPos(coords);

    if (tool === 'pencil' || tool === 'brush' || tool === 'eraser') {
      ctx.beginPath();
      ctx.moveTo(coords.x, coords.y);
      ctx.strokeStyle = tool === 'eraser' ? '#ffffff' : color;
      ctx.lineWidth = tool === 'pencil' ? 1 : tool === 'eraser' ? brushSize * 3 : brushSize;
      ctx.lineCap = 'round';
      ctx.lineJoin = 'round';
    }
  };

  const draw = (e: React.MouseEvent<HTMLCanvasElement>) => {
    if (!isDrawing) return;
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    const coords = getCanvasCoords(e);

    if (tool === 'pencil' || tool === 'brush' || tool === 'eraser') {
      ctx.lineTo(coords.x, coords.y);
      ctx.stroke();
    } else if (tool === 'line' || tool === 'rect' || tool === 'circle') {
      // Restore latest state before drawing preview
      if (undoStack.length > 0) {
        ctx.putImageData(undoStack[undoStack.length - 1], 0, 0);
      }
      ctx.strokeStyle = color;
      ctx.lineWidth = brushSize;
      ctx.lineCap = 'round';

      if (tool === 'line') {
        ctx.beginPath();
        ctx.moveTo(startPos.x, startPos.y);
        ctx.lineTo(coords.x, coords.y);
        ctx.stroke();
      } else if (tool === 'rect') {
        ctx.beginPath();
        ctx.strokeRect(
          startPos.x,
          startPos.y,
          coords.x - startPos.x,
          coords.y - startPos.y
        );
      } else if (tool === 'circle') {
        const radius = Math.hypot(coords.x - startPos.x, coords.y - startPos.y);
        ctx.beginPath();
        ctx.arc(startPos.x, startPos.y, radius, 0, 2 * Math.PI);
        ctx.stroke();
      }
    }
  };

  const stopDraw = () => {
    if (!isDrawing) return;
    setIsDrawing(false);
    saveState();
  };

  const handleSavePictures = () => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const dataUrl = canvas.toDataURL('image/png');
    const filename = `Artwork_${Date.now().toString().slice(-4)}.png`;
    onSaveToPictures?.(filename, dataUrl);
    soundEngine.playNotification();
    setNotification(`Saved to Pictures: ${filename}`);
    setTimeout(() => setNotification(null), 3000);
  };

  const handleDownload = () => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const a = document.createElement('a');
    a.href = canvas.toDataURL('image/png');
    a.download = `Paint_Creation.png`;
    a.click();
    soundEngine.playClick();
  };

  return (
    <div className="flex flex-col h-full bg-[#f5f6f7] text-zinc-800 select-none font-sans overflow-hidden">
      {/* Ribbon Toolbar */}
      <div className="bg-white border-b border-zinc-200 p-2 flex flex-wrap items-center gap-3 text-xs shadow-xs">
        {/* Tools Section */}
        <div className="flex items-center gap-1 border-r border-zinc-200 pr-3">
          <button
            onClick={() => {
              setTool('pencil');
              soundEngine.playClick();
            }}
            title="Pencil"
            className={`p-1.5 rounded transition-colors ${
              tool === 'pencil' ? 'bg-blue-100 text-blue-700 border border-blue-300' : 'hover:bg-zinc-100'
            }`}
          >
            <Minus size={16} />
          </button>
          <button
            onClick={() => {
              setTool('brush');
              soundEngine.playClick();
            }}
            title="Brush"
            className={`p-1.5 rounded transition-colors ${
              tool === 'brush' ? 'bg-blue-100 text-blue-700 border border-blue-300' : 'hover:bg-zinc-100'
            }`}
          >
            <Paintbrush size={16} />
          </button>
          <button
            onClick={() => {
              setTool('eraser');
              soundEngine.playClick();
            }}
            title="Eraser"
            className={`p-1.5 rounded transition-colors ${
              tool === 'eraser' ? 'bg-blue-100 text-blue-700 border border-blue-300' : 'hover:bg-zinc-100'
            }`}
          >
            <Eraser size={16} />
          </button>
          <button
            onClick={() => {
              setTool('picker');
              soundEngine.playClick();
            }}
            title="Color Picker"
            className={`p-1.5 rounded transition-colors ${
              tool === 'picker' ? 'bg-blue-100 text-blue-700 border border-blue-300' : 'hover:bg-zinc-100'
            }`}
          >
            <Pipette size={16} />
          </button>
        </div>

        {/* Shapes Section */}
        <div className="flex items-center gap-1 border-r border-zinc-200 pr-3">
          <button
            onClick={() => {
              setTool('line');
              soundEngine.playClick();
            }}
            title="Line"
            className={`p-1.5 rounded transition-colors ${
              tool === 'line' ? 'bg-blue-100 text-blue-700 border border-blue-300' : 'hover:bg-zinc-100'
            }`}
          >
            <span className="font-bold text-sm">/</span>
          </button>
          <button
            onClick={() => {
              setTool('rect');
              soundEngine.playClick();
            }}
            title="Rectangle"
            className={`p-1.5 rounded transition-colors ${
              tool === 'rect' ? 'bg-blue-100 text-blue-700 border border-blue-300' : 'hover:bg-zinc-100'
            }`}
          >
            <Square size={16} />
          </button>
          <button
            onClick={() => {
              setTool('circle');
              soundEngine.playClick();
            }}
            title="Circle"
            className={`p-1.5 rounded transition-colors ${
              tool === 'circle' ? 'bg-blue-100 text-blue-700 border border-blue-300' : 'hover:bg-zinc-100'
            }`}
          >
            <Circle size={16} />
          </button>
        </div>

        {/* Size Slider */}
        <div className="flex items-center gap-2 border-r border-zinc-200 pr-3">
          <span className="text-zinc-500">Size:</span>
          <div className="flex items-center gap-1">
            {[1, 3, 6, 12, 20].map((s) => (
              <button
                key={s}
                onClick={() => setBrushSize(s)}
                className={`w-6 h-6 flex items-center justify-center rounded text-xs ${
                  brushSize === s ? 'bg-blue-600 text-white' : 'hover:bg-zinc-200'
                }`}
              >
                {s}
              </button>
            ))}
          </div>
        </div>

        {/* Palette */}
        <div className="flex items-center gap-2 border-r border-zinc-200 pr-3">
          <div
            className="w-7 h-7 rounded border border-zinc-300 shadow-inner shrink-0"
            style={{ backgroundColor: color }}
            title="Active Color"
          />
          <div className="grid grid-cols-10 gap-1">
            {PALETTE_COLORS.map((c, i) => (
              <button
                key={i}
                onClick={() => setColor(c)}
                className={`w-4 h-4 rounded-xs border transition-transform ${
                  color === c ? 'scale-125 border-zinc-900 shadow-sm' : 'border-zinc-300 hover:scale-110'
                }`}
                style={{ backgroundColor: c }}
              />
            ))}
          </div>
        </div>

        {/* Actions */}
        <div className="flex items-center gap-1 ml-auto">
          <button
            onClick={handleUndo}
            disabled={undoStack.length <= 1}
            title="Undo"
            className="p-1.5 rounded hover:bg-zinc-100 disabled:opacity-30 text-zinc-600"
          >
            <RotateCcw size={16} />
          </button>
          <button
            onClick={handleClear}
            title="Clear Canvas"
            className="p-1.5 rounded hover:bg-zinc-100 text-zinc-600 hover:text-red-600"
          >
            <Trash2 size={16} />
          </button>
          <button
            onClick={handleSavePictures}
            className="px-2.5 py-1 bg-blue-600 hover:bg-blue-700 text-white rounded text-xs flex items-center gap-1.5 font-medium shadow-xs"
          >
            <Save size={13} />
            <span>Save to Pictures</span>
          </button>
          <button
            onClick={handleDownload}
            className="p-1.5 rounded hover:bg-zinc-200 text-zinc-600"
            title="Download PNG to PC"
          >
            <Download size={16} />
          </button>
        </div>
      </div>

      {/* Notification Toast */}
      {notification && (
        <div className="bg-emerald-600 text-white text-xs px-3 py-1.5 text-center font-medium animate-fadeIn">
          {notification}
        </div>
      )}

      {/* Canvas Work Area */}
      <div className="flex-1 overflow-auto bg-[#c0c0c0] p-4 flex items-center justify-center">
        <canvas
          ref={canvasRef}
          width={800}
          height={500}
          onMouseDown={startDraw}
          onMouseMove={draw}
          onMouseUp={stopDraw}
          onMouseLeave={stopDraw}
          className="bg-white shadow-md border border-zinc-400 cursor-crosshair max-w-full"
        />
      </div>

      {/* Status Bar */}
      <div className="bg-[#f0f0f0] border-t border-zinc-300 px-3 py-0.5 text-[11px] text-zinc-600 flex justify-between">
        <span>800 x 500 px</span>
        <span>Tool: {tool.toUpperCase()}</span>
      </div>
    </div>
  );
};
