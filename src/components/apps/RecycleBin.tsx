import React, { useState } from 'react';
import { Trash2, RotateCcw, AlertTriangle } from 'lucide-react';
import { FileItem } from '../../types/os';
import { AppIcon } from '../common/AppIcon';
import { soundEngine } from '../../utils/sound';

interface RecycleBinProps {
  recycledFiles: FileItem[];
  onRestore: (fileId: string) => void;
  onRestoreAll: () => void;
  onEmpty: () => void;
}

export const RecycleBin: React.FC<RecycleBinProps> = ({
  recycledFiles,
  onRestore,
  onRestoreAll,
  onEmpty,
}) => {
  const [selectedId, setSelectedId] = useState<string | null>(null);

  const handleEmpty = () => {
    soundEngine.playRecycleEmpty();
    onEmpty();
    setSelectedId(null);
  };

  const handleRestoreSelected = () => {
    if (!selectedId) return;
    soundEngine.playClick();
    onRestore(selectedId);
    setSelectedId(null);
  };

  return (
    <div className="flex flex-col h-full bg-white text-zinc-900 select-none font-sans overflow-hidden">
      {/* Top Manage Ribbon */}
      <div className="bg-[#f5f6f7] border-b border-zinc-200 px-3 py-1.5 flex items-center gap-2 text-xs">
        <button
          onClick={handleEmpty}
          disabled={recycledFiles.length === 0}
          className="flex items-center gap-1.5 px-3 py-1 hover:bg-red-50 text-red-600 rounded disabled:opacity-30 transition-colors font-medium"
        >
          <Trash2 size={15} />
          <span>Empty Recycle Bin</span>
        </button>
        <button
          onClick={() => {
            soundEngine.playClick();
            onRestoreAll();
          }}
          disabled={recycledFiles.length === 0}
          className="flex items-center gap-1.5 px-3 py-1 hover:bg-zinc-200 rounded text-zinc-700 disabled:opacity-30 transition-colors"
        >
          <RotateCcw size={15} />
          <span>Restore all items</span>
        </button>

        {selectedId && (
          <button
            onClick={handleRestoreSelected}
            className="flex items-center gap-1.5 px-3 py-1 bg-blue-50 text-blue-700 rounded font-medium hover:bg-blue-100 transition-colors"
          >
            <RotateCcw size={15} />
            <span>Restore selected item</span>
          </button>
        )}
      </div>

      {/* Main Files View */}
      <div className="flex-1 overflow-y-auto p-4" onClick={() => setSelectedId(null)}>
        {recycledFiles.length === 0 ? (
          <div className="flex flex-col items-center justify-center h-full text-zinc-400 text-xs">
            <Trash2 size={42} strokeWidth={1.2} className="text-zinc-300 mb-2" />
            <p>Recycle Bin is empty</p>
          </div>
        ) : (
          <table className="w-full text-xs text-left border-collapse">
            <thead>
              <tr className="border-b border-zinc-200 text-zinc-400 font-normal">
                <th className="py-1 px-2 font-medium">Name</th>
                <th className="py-1 px-2 font-medium">Original Location</th>
                <th className="py-1 px-2 font-medium">Date deleted</th>
                <th className="py-1 px-2 font-medium text-right">Size</th>
              </tr>
            </thead>
            <tbody>
              {recycledFiles.map((file) => {
                const isSelected = selectedId === file.id;
                return (
                  <tr
                    key={file.id}
                    onClick={(e) => {
                      e.stopPropagation();
                      setSelectedId(file.id);
                    }}
                    className={`cursor-pointer transition-colors ${
                      isSelected ? 'bg-blue-100 text-blue-900' : 'hover:bg-zinc-50'
                    }`}
                  >
                    <td className="py-1.5 px-2 flex items-center gap-2">
                      <AppIcon
                        name={file.type === 'folder' ? 'folder' : file.extension}
                        size={16}
                      />
                      <span className="font-medium truncate max-w-xs">{file.name}</span>
                    </td>
                    <td className="py-1.5 px-2 text-zinc-500 capitalize">
                      {file.location}
                    </td>
                    <td className="py-1.5 px-2 text-zinc-500">{file.date}</td>
                    <td className="py-1.5 px-2 text-right text-zinc-500 font-mono">
                      {file.size || '--'}
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        )}
      </div>

      {/* Status Bar */}
      <div className="bg-[#f0f0f0] border-t border-zinc-300 px-3 py-1 text-[11px] text-zinc-600 flex justify-between">
        <span>{recycledFiles.length} item(s)</span>
      </div>
    </div>
  );
};
