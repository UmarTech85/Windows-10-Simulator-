import React, { useState } from 'react';
import {
  ArrowLeft,
  ArrowRight,
  ArrowUp,
  RotateCw,
  Search,
  FolderPlus,
  FilePlus,
  Trash2,
  Upload,
  Download,
  LayoutGrid,
  List,
  HardDrive,
  Monitor,
  Folder,
  ChevronRight,
} from 'lucide-react';
import { FileItem, AppId } from '../../types/os';
import { AppIcon } from '../common/AppIcon';
import { soundEngine } from '../../utils/sound';

interface FileExplorerProps {
  files: FileItem[];
  initialLocation?: FileItem['location'];
  onOpenFile: (file: FileItem) => void;
  onCreateFolder: (name: string, location: FileItem['location']) => void;
  onCreateFile: (name: string, content: string, location: FileItem['location']) => void;
  onDeleteItem: (fileId: string) => void;
  onUploadFile?: (file: FileItem) => void;
}

export const FileExplorer: React.FC<FileExplorerProps> = ({
  files,
  initialLocation = 'desktop',
  onOpenFile,
  onCreateFolder,
  onCreateFile,
  onDeleteItem,
  onUploadFile,
}) => {
  const [currentLocation, setCurrentLocation] = useState<FileItem['location']>(initialLocation);
  const [history, setHistory] = useState<FileItem['location'][]>([initialLocation]);
  const [historyIndex, setHistoryIndex] = useState<number>(0);
  const [selectedId, setSelectedId] = useState<string | null>(null);
  const [viewMode, setViewMode] = useState<'icons' | 'details'>('icons');
  const [searchQuery, setSearchQuery] = useState<string>('');
  const [isCreatingNew, setIsCreatingNew] = useState<'folder' | 'file' | null>(null);
  const [newItemName, setNewItemName] = useState<string>('');

  const navigateTo = (loc: FileItem['location']) => {
    if (loc === currentLocation) return;
    soundEngine.playClick();
    const newHist = history.slice(0, historyIndex + 1);
    newHist.push(loc);
    setHistory(newHist);
    setHistoryIndex(newHist.length - 1);
    setCurrentLocation(loc);
    setSelectedId(null);
  };

  const handleBack = () => {
    if (historyIndex > 0) {
      soundEngine.playClick();
      setHistoryIndex(historyIndex - 1);
      setCurrentLocation(history[historyIndex - 1]);
      setSelectedId(null);
    }
  };

  const handleForward = () => {
    if (historyIndex < history.length - 1) {
      soundEngine.playClick();
      setHistoryIndex(historyIndex + 1);
      setCurrentLocation(history[historyIndex + 1]);
      setSelectedId(null);
    }
  };

  const handleCreateConfirm = () => {
    const name = newItemName.trim();
    if (!name) {
      setIsCreatingNew(null);
      return;
    }
    if (isCreatingNew === 'folder') {
      onCreateFolder(name, currentLocation);
    } else if (isCreatingNew === 'file') {
      const fullFileName = name.endsWith('.txt') ? name : `${name}.txt`;
      onCreateFile(fullFileName, '', currentLocation);
    }
    soundEngine.playClick();
    setIsCreatingNew(null);
    setNewItemName('');
  };

  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const uploadedFile = e.target.files?.[0];
    if (!uploadedFile) return;

    const reader = new FileReader();
    const isImage = uploadedFile.type.startsWith('image/');
    const isText = uploadedFile.type.startsWith('text/') || uploadedFile.name.endsWith('.txt');

    reader.onload = (event) => {
      const result = event.target?.result as string;
      const extension = (uploadedFile.name.split('.').pop() || 'txt').toLowerCase() as any;
      const newFileItem: FileItem = {
        id: `upload-${Date.now()}`,
        name: uploadedFile.name,
        type: 'file',
        extension: isImage ? (extension as 'png' | 'jpg') : (extension as 'txt'),
        content: result,
        size: `${Math.round(uploadedFile.size / 1024)} KB`,
        date: new Date().toLocaleDateString(),
        parentId: null,
        location: currentLocation,
      };

      onUploadFile?.(newFileItem);
      soundEngine.playNotification();
    };

    if (isImage) {
      reader.readAsDataURL(uploadedFile);
    } else {
      reader.readAsText(uploadedFile);
    }
  };

  const handleFileDownload = (file: FileItem) => {
    soundEngine.playClick();
    const element = document.createElement('a');
    let fileBlob: Blob;

    if (file.content?.startsWith('data:image')) {
      element.href = file.content;
    } else {
      fileBlob = new Blob([file.content || ''], { type: 'text/plain;charset=utf-8' });
      element.href = URL.createObjectURL(fileBlob);
    }

    element.download = file.name;
    element.click();
  };

  const currentFiles = files
    .filter((f) => f.location === currentLocation && !f.isRecycled)
    .filter((f) =>
      searchQuery ? f.name.toLowerCase().includes(searchQuery.toLowerCase()) : true
    );

  const selectedFile = files.find((f) => f.id === selectedId);

  const locationTitles: Record<FileItem['location'], string> = {
    desktop: 'Desktop',
    documents: 'Documents',
    pictures: 'Pictures',
    downloads: 'Downloads',
    music: 'Music',
    recyclebin: 'Recycle Bin',
  };

  return (
    <div className="flex flex-col h-full bg-white text-zinc-900 select-none font-sans overflow-hidden">
      {/* Top Ribbon Actions */}
      <div className="bg-[#f5f6f7] border-b border-zinc-200 px-3 py-1.5 flex items-center gap-2 text-xs">
        <button
          onClick={() => {
            setIsCreatingNew('folder');
            setNewItemName('New folder');
          }}
          className="flex items-center gap-1.5 px-2.5 py-1 hover:bg-zinc-200 rounded text-zinc-700 transition-colors"
        >
          <FolderPlus size={15} className="text-amber-500" />
          <span>New folder</span>
        </button>
        <button
          onClick={() => {
            setIsCreatingNew('file');
            setNewItemName('New Document.txt');
          }}
          className="flex items-center gap-1.5 px-2.5 py-1 hover:bg-zinc-200 rounded text-zinc-700 transition-colors"
        >
          <FilePlus size={15} className="text-sky-500" />
          <span>New file</span>
        </button>

        <label className="flex items-center gap-1.5 px-2.5 py-1 hover:bg-zinc-200 rounded text-zinc-700 transition-colors cursor-pointer">
          <Upload size={14} className="text-blue-500" />
          <span>Import PC File</span>
          <input type="file" onChange={handleFileUpload} className="hidden" />
        </label>

        {selectedFile && (
          <>
            <button
              onClick={() => handleFileDownload(selectedFile)}
              className="flex items-center gap-1.5 px-2.5 py-1 hover:bg-zinc-200 rounded text-zinc-700 transition-colors"
            >
              <Download size={14} className="text-emerald-600" />
              <span>Download</span>
            </button>
            <button
              onClick={() => {
                onDeleteItem(selectedFile.id);
                soundEngine.playClick();
                setSelectedId(null);
              }}
              className="flex items-center gap-1.5 px-2.5 py-1 hover:bg-red-50 text-red-600 rounded transition-colors"
            >
              <Trash2 size={14} />
              <span>Delete</span>
            </button>
          </>
        )}

        {/* View Mode */}
        <div className="ml-auto flex items-center gap-1 border-l border-zinc-300 pl-2">
          <button
            onClick={() => setViewMode('icons')}
            className={`p-1 rounded ${viewMode === 'icons' ? 'bg-zinc-200 text-blue-600' : 'text-zinc-500'}`}
          >
            <LayoutGrid size={15} />
          </button>
          <button
            onClick={() => setViewMode('details')}
            className={`p-1 rounded ${viewMode === 'details' ? 'bg-zinc-200 text-blue-600' : 'text-zinc-500'}`}
          >
            <List size={15} />
          </button>
        </div>
      </div>

      {/* Address & Search Bar */}
      <div className="flex items-center gap-2 px-3 py-1.5 bg-white border-b border-zinc-200 text-xs">
        <button
          onClick={handleBack}
          disabled={historyIndex <= 0}
          className="p-1 rounded hover:bg-zinc-100 disabled:opacity-30 text-zinc-600"
        >
          <ArrowLeft size={15} />
        </button>
        <button
          onClick={handleForward}
          disabled={historyIndex >= history.length - 1}
          className="p-1 rounded hover:bg-zinc-100 disabled:opacity-30 text-zinc-600"
        >
          <ArrowRight size={15} />
        </button>
        <button
          onClick={() => navigateTo('desktop')}
          className="p-1 rounded hover:bg-zinc-100 text-zinc-600"
        >
          <ArrowUp size={15} />
        </button>

        {/* Breadcrumb Path */}
        <div className="flex-1 flex items-center bg-zinc-50 hover:bg-white border border-zinc-300 rounded px-2 py-1 text-zinc-700">
          <HardDrive size={13} className="text-zinc-500 mr-1.5" />
          <span className="text-zinc-400">This PC</span>
          <ChevronRight size={12} className="text-zinc-400 mx-1" />
          <span className="font-medium text-zinc-800">{locationTitles[currentLocation]}</span>
        </div>

        {/* Search Box */}
        <div className="flex items-center bg-zinc-50 border border-zinc-300 rounded px-2 py-1 w-44">
          <Search size={13} className="text-zinc-400 mr-1.5" />
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder={`Search ${locationTitles[currentLocation]}`}
            className="w-full bg-transparent outline-none text-zinc-800 text-xs"
          />
        </div>
      </div>

      {/* Explorer Body: Sidebar + Main Area */}
      <div className="flex-1 flex overflow-hidden">
        {/* Left Tree Sidebar */}
        <div className="w-48 bg-[#f5f6f7] border-r border-zinc-200 p-2 text-xs flex flex-col gap-1 overflow-y-auto shrink-0">
          <div className="px-2 py-1 font-semibold text-zinc-500 uppercase text-[10px] tracking-wider">
            Quick access
          </div>
          {[
            { id: 'desktop', title: 'Desktop', icon: 'folder' },
            { id: 'downloads', title: 'Downloads', icon: 'folder' },
            { id: 'documents', title: 'Documents', icon: 'folder' },
            { id: 'pictures', title: 'Pictures', icon: 'photos' },
            { id: 'music', title: 'Music', icon: 'groove' },
          ].map((item) => (
            <button
              key={item.id}
              onClick={() => navigateTo(item.id as any)}
              className={`flex items-center gap-2 px-2 py-1.5 rounded transition-colors text-left ${
                currentLocation === item.id
                  ? 'bg-blue-100/70 text-blue-700 font-medium'
                  : 'hover:bg-zinc-200 text-zinc-700'
              }`}
            >
              <AppIcon name={item.icon} size={15} />
              <span className="truncate">{item.title}</span>
            </button>
          ))}

          <div className="border-t border-zinc-300 my-2" />
          <div className="px-2 py-1 font-semibold text-zinc-500 uppercase text-[10px] tracking-wider">
            This PC
          </div>
          <div className="flex items-center gap-2 px-2 py-1.5 text-zinc-700">
            <HardDrive size={15} className="text-blue-500 shrink-0" />
            <div className="truncate">
              <div>Local Disk (C:)</div>
              <div className="text-[10px] text-zinc-400">382 GB free of 476 GB</div>
            </div>
          </div>
        </div>

        {/* Main Content Area */}
        <div
          className="flex-1 p-3 overflow-y-auto bg-white"
          onClick={() => setSelectedId(null)}
        >
          {/* Create New Item Inline Prompt */}
          {isCreatingNew && (
            <div className="mb-3 p-2 bg-blue-50 border border-blue-200 rounded flex items-center gap-2 text-xs">
              <span className="text-zinc-600 font-medium">
                Name for new {isCreatingNew}:
              </span>
              <input
                type="text"
                value={newItemName}
                onChange={(e) => setNewItemName(e.target.value)}
                onKeyDown={(e) => e.key === 'Enter' && handleCreateConfirm()}
                autoFocus
                className="px-2 py-0.5 border border-zinc-300 rounded outline-none bg-white"
              />
              <button
                onClick={handleCreateConfirm}
                className="px-2 py-0.5 bg-blue-600 text-white rounded hover:bg-blue-700"
              >
                Create
              </button>
              <button
                onClick={() => setIsCreatingNew(null)}
                className="px-2 py-0.5 bg-zinc-200 text-zinc-700 rounded hover:bg-zinc-300"
              >
                Cancel
              </button>
            </div>
          )}

          {currentFiles.length === 0 ? (
            <div className="text-center py-16 text-zinc-400 text-xs">
              This folder is empty.
            </div>
          ) : viewMode === 'icons' ? (
            /* Large Icons Grid */
            <div className="grid grid-cols-3 sm:grid-cols-4 md:grid-cols-6 gap-3">
              {currentFiles.map((file) => {
                const isSelected = selectedId === file.id;
                return (
                  <div
                    key={file.id}
                    onClick={(e) => {
                      e.stopPropagation();
                      setSelectedId(file.id);
                    }}
                    onDoubleClick={() => onOpenFile(file)}
                    className={`flex flex-col items-center p-2 rounded cursor-pointer transition-colors border ${
                      isSelected
                        ? 'bg-blue-100/60 border-blue-300 text-blue-900'
                        : 'border-transparent hover:bg-zinc-100'
                    }`}
                  >
                    <div className="w-12 h-12 flex items-center justify-center mb-1">
                      {file.type === 'folder' ? (
                        <AppIcon name="folder" size={38} />
                      ) : file.extension === 'jpg' || file.extension === 'png' ? (
                        file.content?.startsWith('/src/assets') || file.content?.startsWith('data:') ? (
                          <img
                            src={file.content}
                            alt={file.name}
                            referrerPolicy="no-referrer"
                            className="w-11 h-11 object-cover rounded shadow-xs"
                          />
                        ) : (
                          <AppIcon appId="photos" size={36} />
                        )
                      ) : (
                        <AppIcon appId={file.extension} size={36} />
                      )}
                    </div>
                    <span className="text-xs text-center truncate max-w-full text-zinc-800 leading-tight">
                      {file.name}
                    </span>
                  </div>
                );
              })}
            </div>
          ) : (
            /* Details Table View */
            <table className="w-full text-left text-xs border-collapse">
              <thead>
                <tr className="border-b border-zinc-200 text-zinc-400 font-normal">
                  <th className="py-1 px-2 font-medium">Name</th>
                  <th className="py-1 px-2 font-medium">Date modified</th>
                  <th className="py-1 px-2 font-medium">Type</th>
                  <th className="py-1 px-2 font-medium text-right">Size</th>
                </tr>
              </thead>
              <tbody>
                {currentFiles.map((file) => {
                  const isSelected = selectedId === file.id;
                  return (
                    <tr
                      key={file.id}
                      onClick={(e) => {
                        e.stopPropagation();
                        setSelectedId(file.id);
                      }}
                      onDoubleClick={() => onOpenFile(file)}
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
                      <td className="py-1.5 px-2 text-zinc-500">{file.date}</td>
                      <td className="py-1.5 px-2 text-zinc-500 uppercase">
                        {file.type === 'folder' ? 'File folder' : `${file.extension} File`}
                      </td>
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
      </div>

      {/* Explorer Bottom Status Bar */}
      <div className="bg-[#f0f0f0] border-t border-zinc-300 px-3 py-1 text-[11px] text-zinc-600 flex justify-between">
        <span>{currentFiles.length} item(s)</span>
        {selectedFile && <span>Selected: {selectedFile.name} ({selectedFile.size || 'Folder'})</span>}
      </div>
    </div>
  );
};
