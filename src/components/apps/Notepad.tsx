import React, { useState, useEffect, useRef } from 'react';
import { FileItem } from '../../types/os';
import { soundEngine } from '../../utils/sound';

interface NotepadProps {
  initialFile?: FileItem;
  onSave?: (name: string, content: string, fileId?: string) => void;
  onClose?: () => void;
  updateTitle?: (title: string) => void;
}

export const Notepad: React.FC<NotepadProps> = ({
  initialFile,
  onSave,
  onClose,
  updateTitle,
}) => {
  const [content, setContent] = useState<string>(initialFile?.content || '');
  const [filename, setFilename] = useState<string>(initialFile?.name || 'Untitled.txt');
  const [isDirty, setIsDirty] = useState<boolean>(false);
  const [wordWrap, setWordWrap] = useState<boolean>(true);
  const [fontSize, setFontSize] = useState<number>(14);
  const [cursorPos, setCursorPos] = useState({ line: 1, col: 1 });
  const [activeMenu, setActiveMenu] = useState<string | null>(null);
  const updateTitleRef = useRef(updateTitle);
  updateTitleRef.current = updateTitle;

  const initialFileId = initialFile?.id;

  useEffect(() => {
    if (initialFile) {
      setContent(initialFile.content || '');
      setFilename(initialFile.name);
      setIsDirty(false);
      updateTitleRef.current?.(`${initialFile.name} - Notepad`);
    }
  }, [initialFileId]);

  const handleChange = (e: React.ChangeEvent<HTMLTextAreaElement>) => {
    setContent(e.target.value);
    if (!isDirty) {
      setIsDirty(true);
      updateTitle?.(`*${filename} - Notepad`);
    }
    updateCursorPos(e.target);
  };

  const updateCursorPos = (textarea: HTMLTextAreaElement) => {
    const text = textarea.value.substring(0, textarea.selectionStart);
    const lines = text.split('\n');
    setCursorPos({
      line: lines.length,
      col: lines[lines.length - 1].length + 1,
    });
  };

  const handleSave = () => {
    if (onSave) {
      onSave(filename, content, initialFile?.id);
      setIsDirty(false);
      updateTitle?.(`${filename} - Notepad`);
      soundEngine.playClick();
    }
  };

  const handleNew = () => {
    setContent('');
    setFilename('Untitled.txt');
    setIsDirty(false);
    updateTitle?.('Untitled.txt - Notepad');
  };

  return (
    <div
      className="flex flex-col h-full bg-white text-zinc-900 select-none font-sans"
      onClick={() => setActiveMenu(null)}
    >
      {/* Menu Bar */}
      <div className="flex items-center text-xs border-b border-zinc-200 bg-zinc-50 px-1 relative">
        {/* File Menu */}
        <div className="relative">
          <button
            onClick={(e) => {
              e.stopPropagation();
              setActiveMenu(activeMenu === 'file' ? null : 'file');
            }}
            className={`px-2 py-1 hover:bg-zinc-200 cursor-default ${
              activeMenu === 'file' ? 'bg-zinc-200' : ''
            }`}
          >
            File
          </button>
          {activeMenu === 'file' && (
            <div className="absolute top-full left-0 z-50 bg-white border border-zinc-300 shadow-md py-1 min-w-36 text-xs text-zinc-800">
              <button
                onClick={handleNew}
                className="w-full text-left px-3 py-1 hover:bg-blue-600 hover:text-white flex justify-between"
              >
                <span>New</span>
                <span className="text-zinc-400">Ctrl+N</span>
              </button>
              <button
                onClick={handleSave}
                className="w-full text-left px-3 py-1 hover:bg-blue-600 hover:text-white flex justify-between"
              >
                <span>Save</span>
                <span className="text-zinc-400">Ctrl+S</span>
              </button>
              <div className="border-t border-zinc-200 my-1" />
              <button
                onClick={onClose}
                className="w-full text-left px-3 py-1 hover:bg-blue-600 hover:text-white"
              >
                Exit
              </button>
            </div>
          )}
        </div>

        {/* Edit Menu */}
        <div className="relative">
          <button
            onClick={(e) => {
              e.stopPropagation();
              setActiveMenu(activeMenu === 'edit' ? null : 'edit');
            }}
            className={`px-2 py-1 hover:bg-zinc-200 cursor-default ${
              activeMenu === 'edit' ? 'bg-zinc-200' : ''
            }`}
          >
            Edit
          </button>
          {activeMenu === 'edit' && (
            <div className="absolute top-full left-0 z-50 bg-white border border-zinc-300 shadow-md py-1 min-w-36 text-xs text-zinc-800">
              <button
                onClick={() => setContent('')}
                className="w-full text-left px-3 py-1 hover:bg-blue-600 hover:text-white"
              >
                Clear All
              </button>
              <button
                onClick={() => {
                  const now = new Date().toLocaleString();
                  setContent((prev) => prev + '\n' + now);
                }}
                className="w-full text-left px-3 py-1 hover:bg-blue-600 hover:text-white flex justify-between"
              >
                <span>Time/Date</span>
                <span className="text-zinc-400">F5</span>
              </button>
            </div>
          )}
        </div>

        {/* Format Menu */}
        <div className="relative">
          <button
            onClick={(e) => {
              e.stopPropagation();
              setActiveMenu(activeMenu === 'format' ? null : 'format');
            }}
            className={`px-2 py-1 hover:bg-zinc-200 cursor-default ${
              activeMenu === 'format' ? 'bg-zinc-200' : ''
            }`}
          >
            Format
          </button>
          {activeMenu === 'format' && (
            <div className="absolute top-full left-0 z-50 bg-white border border-zinc-300 shadow-md py-1 min-w-44 text-xs text-zinc-800">
              <button
                onClick={() => setWordWrap(!wordWrap)}
                className="w-full text-left px-3 py-1 hover:bg-blue-600 hover:text-white flex items-center gap-2"
              >
                <span className="w-3">{wordWrap ? '✓' : ''}</span>
                <span>Word Wrap</span>
              </button>
              <div className="border-t border-zinc-200 my-1" />
              <div className="px-3 py-1 text-zinc-500">Font Size:</div>
              <div className="flex gap-1 px-3 py-1">
                {[12, 14, 16, 18, 22].map((s) => (
                  <button
                    key={s}
                    onClick={() => setFontSize(s)}
                    className={`px-2 py-0.5 rounded text-xs ${
                      fontSize === s ? 'bg-blue-600 text-white' : 'hover:bg-zinc-200'
                    }`}
                  >
                    {s}
                  </button>
                ))}
              </div>
            </div>
          )}
        </div>

        <div className="ml-auto text-[11px] text-zinc-400 pr-2">
          {filename} {isDirty ? '(Unsaved)' : ''}
        </div>
      </div>

      {/* Editor Surface */}
      <div className="flex-1 p-2 bg-white overflow-hidden flex flex-col">
        <textarea
          value={content}
          onChange={handleChange}
          onKeyUp={(e) => updateCursorPos(e.currentTarget)}
          onClick={(e) => updateCursorPos(e.currentTarget)}
          spellCheck={false}
          style={{ fontSize: `${fontSize}px` }}
          wrap={wordWrap ? 'soft' : 'off'}
          className="w-full h-full resize-none outline-none font-mono text-zinc-900 border-none select-text overflow-auto"
          placeholder="Start typing..."
        />
      </div>

      {/* Status Bar */}
      <div className="flex items-center justify-between text-[11px] text-zinc-600 border-t border-zinc-200 bg-zinc-100 px-3 py-0.5">
        <div className="flex items-center gap-6">
          <span>Ln {cursorPos.line}, Col {cursorPos.col}</span>
          <span>{content.length} characters</span>
        </div>
        <div className="flex items-center gap-6">
          <span>100%</span>
          <span>Windows (CRLF)</span>
          <span>UTF-8</span>
        </div>
      </div>
    </div>
  );
};
