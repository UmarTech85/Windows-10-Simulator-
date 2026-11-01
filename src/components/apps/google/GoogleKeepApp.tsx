import React, { useState } from 'react';
import { GoogleKeepIcon } from './GoogleIcons';
import { soundEngine } from '../../../utils/sound';

interface KeepNote {
  id: string;
  title: string;
  content: string;
  color: string;
  isPinned: boolean;
  checklist?: { text: string; done: boolean }[];
  updatedAt: string;
}

const INITIAL_NOTES: KeepNote[] = [
  {
    id: 'n-1',
    title: 'Windows 10 Simulator Goals',
    content: 'Review DirectX 12 graphics pipelines, sound effects, and Google Services integration in Microsoft Edge.',
    color: 'bg-amber-100 dark:bg-amber-950/60 border-amber-300 dark:border-amber-800',
    isPinned: true,
    checklist: [
      { text: 'Add YouTube access in Edge', done: true },
      { text: 'Enable Google Services hub & waffle menu', done: true },
      { text: 'DirectX 12 and DirectX 11 feature tests', done: true },
      { text: 'Verify audio playback with Groove Music', done: true },
    ],
    updatedAt: 'Today',
  },
  {
    id: 'n-2',
    title: 'Firebase Project Credentials',
    content: 'Project ID: windows-10-simulator-d01e3\nNumber: 461344985768\nBucket: windows-10-simulator-d01e3.firebasestorage.app',
    color: 'bg-blue-100 dark:bg-blue-950/60 border-blue-300 dark:border-blue-800',
    isPinned: true,
    updatedAt: 'Yesterday',
  },
  {
    id: 'n-3',
    title: 'Edge Browser Shortkeys',
    content: 'Ctrl+T: New Tab\nCtrl+W: Close Tab\nCtrl+F: Find on Page\nF12: Developer Tools\nCtrl+Shift+U: Read Aloud',
    color: 'bg-emerald-100 dark:bg-emerald-950/60 border-emerald-300 dark:border-emerald-800',
    isPinned: false,
    updatedAt: 'Nov 1',
  },
];

interface GoogleKeepAppProps {
  onNavigate: (view: any, url: string, title: string) => void;
  onOpenAppsWaffle: () => void;
}

export const GoogleKeepApp: React.FC<GoogleKeepAppProps> = ({
  onNavigate,
  onOpenAppsWaffle,
}) => {
  const [notes, setNotes] = useState<KeepNote[]>(INITIAL_NOTES);
  const [newTitle, setNewTitle] = useState('');
  const [newContent, setNewContent] = useState('');
  const [searchQuery, setSearchQuery] = useState('');

  const handleAddNote = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newTitle.trim() && !newContent.trim()) return;
    soundEngine.playClick();

    const colors = [
      'bg-amber-100 dark:bg-amber-950/60 border-amber-300 dark:border-amber-800',
      'bg-blue-100 dark:bg-blue-950/60 border-blue-300 dark:border-blue-800',
      'bg-emerald-100 dark:bg-emerald-950/60 border-emerald-300 dark:border-emerald-800',
      'bg-purple-100 dark:bg-purple-950/60 border-purple-300 dark:border-purple-800',
    ];
    const pickedColor = colors[Math.floor(Math.random() * colors.length)];

    const note: KeepNote = {
      id: `n-${Date.now()}`,
      title: newTitle.trim(),
      content: newContent.trim(),
      color: pickedColor,
      isPinned: false,
      updatedAt: 'Just now',
    };

    setNotes([note, ...notes]);
    setNewTitle('');
    setNewContent('');
  };

  const toggleCheck = (noteId: string, itemIdx: number) => {
    soundEngine.playClick();
    setNotes((prev) =>
      prev.map((n) => {
        if (n.id !== noteId || !n.checklist) return n;
        const updatedList = [...n.checklist];
        updatedList[itemIdx].done = !updatedList[itemIdx].done;
        return { ...n, checklist: updatedList };
      })
    );
  };

  const togglePin = (noteId: string) => {
    soundEngine.playClick();
    setNotes((prev) =>
      prev.map((n) => (n.id === noteId ? { ...n, isPinned: !n.isPinned } : n))
    );
  };

  const deleteNote = (noteId: string) => {
    soundEngine.playClick();
    setNotes((prev) => prev.filter((n) => n.id !== noteId));
  };

  const filteredNotes = notes.filter((n) =>
    !searchQuery
      ? true
      : n.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
        n.content.toLowerCase().includes(searchQuery.toLowerCase())
  );

  return (
    <div className="min-h-full flex flex-col bg-white dark:bg-[#1f1f1f] text-zinc-800 dark:text-zinc-200 font-sans select-none">
      {/* 1. Header */}
      <header className="px-6 py-3 border-b border-zinc-200 dark:border-zinc-800 flex items-center justify-between bg-white dark:bg-[#202124]">
        <div className="flex items-center gap-2.5">
          <GoogleKeepIcon className="w-6 h-6" />
          <span className="font-semibold text-lg text-zinc-700 dark:text-zinc-200">
            Keep
          </span>
        </div>

        <div className="flex-1 max-w-xl mx-4">
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="Search notes"
            className="w-full bg-[#f1f3f4] dark:bg-[#303134] rounded-full px-4 py-2 text-xs outline-none text-inherit placeholder-zinc-500"
          />
        </div>

        <div className="flex items-center gap-3">
          <button
            onClick={onOpenAppsWaffle}
            title="Google apps"
            className="p-2 hover:bg-zinc-100 dark:hover:bg-zinc-800 rounded-full text-zinc-600 dark:text-zinc-300"
          >
            <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 24 24">
              <circle cx="5" cy="5" r="2" />
              <circle cx="12" cy="5" r="2" />
              <circle cx="19" cy="5" r="2" />
              <circle cx="5" cy="12" r="2" />
              <circle cx="12" cy="12" r="2" />
              <circle cx="19" cy="12" r="2" />
              <circle cx="5" cy="19" r="2" />
              <circle cx="12" cy="19" r="2" />
              <circle cx="19" cy="19" r="2" />
            </svg>
          </button>
          <div className="w-8 h-8 rounded-full bg-blue-600 text-white font-medium flex items-center justify-center text-xs">
            W
          </div>
        </div>
      </header>

      {/* 2. Main Keep Board */}
      <div className="flex-1 max-w-5xl mx-auto w-full p-6">
        {/* New Note Creator Box */}
        <form
          onSubmit={handleAddNote}
          className="max-w-xl mx-auto mb-8 bg-white dark:bg-[#282828] border border-zinc-200 dark:border-zinc-700 rounded-2xl shadow-lg p-4 flex flex-col gap-2"
        >
          <input
            type="text"
            value={newTitle}
            onChange={(e) => setNewTitle(e.target.value)}
            placeholder="Title"
            className="w-full bg-transparent font-semibold text-xs outline-none text-inherit placeholder-zinc-400"
          />
          <textarea
            value={newContent}
            onChange={(e) => setNewContent(e.target.value)}
            placeholder="Take a note..."
            rows={2}
            className="w-full bg-transparent text-xs outline-none text-inherit placeholder-zinc-400 resize-none"
          />
          <div className="flex justify-end pt-2">
            <button
              type="submit"
              className="px-4 py-1.5 bg-blue-600 hover:bg-blue-700 text-white font-semibold text-xs rounded-xl shadow-xs"
            >
              Close & Save
            </button>
          </div>
        </form>

        {/* Notes Grid */}
        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-4">
          {filteredNotes.map((note) => (
            <div
              key={note.id}
              className={`p-4 rounded-2xl border shadow-xs flex flex-col justify-between transition-all hover:shadow-md ${note.color}`}
            >
              <div>
                <div className="flex items-start justify-between gap-2 mb-2">
                  <h3 className="font-bold text-xs text-zinc-900 dark:text-white leading-snug">
                    {note.title}
                  </h3>
                  <button
                    onClick={() => togglePin(note.id)}
                    className={`text-sm ${
                      note.isPinned ? 'text-blue-600 dark:text-blue-400' : 'text-zinc-400'
                    }`}
                    title={note.isPinned ? 'Unpin' : 'Pin'}
                  >
                    📌
                  </button>
                </div>

                <p className="text-xs text-zinc-700 dark:text-zinc-300 whitespace-pre-wrap leading-relaxed mb-3">
                  {note.content}
                </p>

                {/* Checklist items */}
                {note.checklist && (
                  <div className="space-y-1 mb-3 pt-2 border-t border-black/10 dark:border-white/10 text-xs">
                    {note.checklist.map((item, idx) => (
                      <div
                        key={idx}
                        onClick={() => toggleCheck(note.id, idx)}
                        className="flex items-center gap-2 cursor-pointer hover:opacity-80"
                      >
                        <span>{item.done ? '☑️' : '◻️'}</span>
                        <span
                          className={
                            item.done
                              ? 'line-through text-zinc-500'
                              : 'text-zinc-800 dark:text-zinc-200'
                          }
                        >
                          {item.text}
                        </span>
                      </div>
                    ))}
                  </div>
                )}
              </div>

              <div className="flex items-center justify-between pt-2 border-t border-black/10 dark:border-white/10 text-[10px] text-zinc-500">
                <span>{note.updatedAt}</span>
                <button
                  onClick={() => deleteNote(note.id)}
                  className="hover:text-red-500"
                  title="Delete note"
                >
                  🗑️
                </button>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};
