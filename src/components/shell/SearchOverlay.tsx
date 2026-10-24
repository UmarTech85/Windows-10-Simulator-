import React, { useState } from 'react';
import { Search, FileText, Globe, ExternalLink, ArrowRight } from 'lucide-react';
import { AppId, FileItem } from '../../types/os';
import { APP_REGISTRY } from '../../utils/appRegistry';
import { AppIcon } from '../common/AppIcon';
import { soundEngine } from '../../utils/sound';

interface SearchOverlayProps {
  files: FileItem[];
  onLaunchApp: (appId: AppId) => void;
  onOpenFile: (file: FileItem) => void;
  onClose: () => void;
}

export const SearchOverlay: React.FC<SearchOverlayProps> = ({
  files,
  onLaunchApp,
  onOpenFile,
  onClose,
}) => {
  const [query, setQuery] = useState('');
  const [filter, setFilter] = useState<'all' | 'apps' | 'docs' | 'web'>('all');

  const apps = Object.values(APP_REGISTRY);

  const matchedApps = apps.filter((app) =>
    app.name.toLowerCase().includes(query.toLowerCase())
  );

  const matchedFiles = files.filter((f) =>
    f.name.toLowerCase().includes(query.toLowerCase()) && !f.isRecycled
  );

  const handleSelectApp = (appId: AppId) => {
    soundEngine.playClick();
    onLaunchApp(appId);
    onClose();
  };

  const handleSelectFile = (file: FileItem) => {
    soundEngine.playClick();
    onOpenFile(file);
    onClose();
  };

  return (
    <div
      onClick={(e) => e.stopPropagation()}
      className="fixed bottom-[44px] left-0 w-full sm:w-[680px] h-[520px] bg-[#1f1f1f]/95 backdrop-blur-2xl text-white border-t border-r border-zinc-700/60 shadow-2xl z-50 flex flex-col font-sans select-none animate-slideUp"
    >
      {/* Top Filter Tabs */}
      <div className="flex items-center gap-1 px-4 pt-3 pb-2 border-b border-zinc-800 text-xs text-zinc-400">
        {(['all', 'apps', 'docs', 'web'] as const).map((tab) => (
          <button
            key={tab}
            onClick={() => {
              setFilter(tab);
              soundEngine.playClick();
            }}
            className={`px-3 py-1 rounded capitalize transition-colors ${
              filter === tab ? 'bg-zinc-800 text-white font-medium' : 'hover:text-zinc-200'
            }`}
          >
            {tab}
          </button>
        ))}
      </div>

      {/* Main Search Results Area */}
      <div className="flex-1 overflow-y-auto p-4 flex gap-4">
        {/* Left Results Column */}
        <div className="flex-1 space-y-4">
          {!query ? (
            /* Default: Top Apps & Recent Activities */
            <>
              <div>
                <h4 className="text-xs font-semibold uppercase text-zinc-400 tracking-wider mb-2">
                  Top apps
                </h4>
                <div className="grid grid-cols-4 gap-2">
                  {(['edge', 'explorer', 'notepad', 'calc'] as AppId[]).map((id) => (
                    <button
                      key={id}
                      onClick={() => handleSelectApp(id)}
                      className="flex flex-col items-center justify-center p-3 bg-zinc-800/60 hover:bg-zinc-800 rounded-sm transition-colors text-center group cursor-pointer"
                    >
                      <AppIcon appId={id} size={28} className="mb-1.5 group-hover:scale-105 transition-transform" />
                      <span className="text-xs truncate w-full">{APP_REGISTRY[id]?.name}</span>
                    </button>
                  ))}
                </div>
              </div>

              <div>
                <h4 className="text-xs font-semibold uppercase text-zinc-400 tracking-wider mb-2">
                  Recent files
                </h4>
                <div className="space-y-1">
                  {files.slice(0, 4).map((f) => (
                    <button
                      key={f.id}
                      onClick={() => handleSelectFile(f)}
                      className="w-full flex items-center gap-3 p-2 hover:bg-zinc-800 rounded-sm text-left transition-colors cursor-pointer"
                    >
                      <AppIcon name={f.extension || 'file'} size={18} />
                      <div className="flex-1 truncate">
                        <div className="text-xs font-medium truncate">{f.name}</div>
                        <div className="text-[10px] text-zinc-400 truncate">
                          {f.location} · {f.date}
                        </div>
                      </div>
                    </button>
                  ))}
                </div>
              </div>
            </>
          ) : (
            /* Filtered Search Results */
            <div>
              {matchedApps.length > 0 && (filter === 'all' || filter === 'apps') && (
                <div className="mb-4">
                  <h4 className="text-xs font-semibold uppercase text-zinc-400 tracking-wider mb-2">
                    Apps
                  </h4>
                  <div className="space-y-1">
                    {matchedApps.map((app) => (
                      <button
                        key={app.id}
                        onClick={() => handleSelectApp(app.id)}
                        className="w-full flex items-center gap-3 p-2 bg-zinc-800/50 hover:bg-zinc-800 rounded text-left transition-colors"
                      >
                        <AppIcon appId={app.id} size={22} />
                        <span className="text-xs font-medium">{app.name}</span>
                      </button>
                    ))}
                  </div>
                </div>
              )}

              {matchedFiles.length > 0 && (filter === 'all' || filter === 'docs') && (
                <div className="mb-4">
                  <h4 className="text-xs font-semibold uppercase text-zinc-400 tracking-wider mb-2">
                    Documents
                  </h4>
                  <div className="space-y-1">
                    {matchedFiles.map((file) => (
                      <button
                        key={file.id}
                        onClick={() => handleSelectFile(file)}
                        className="w-full flex items-center gap-3 p-2 bg-zinc-800/50 hover:bg-zinc-800 rounded text-left transition-colors"
                      >
                        <AppIcon name={file.extension} size={20} />
                        <span className="text-xs font-medium">{file.name}</span>
                      </button>
                    ))}
                  </div>
                </div>
              )}

              {/* Web Search Suggestion */}
              <div>
                <h4 className="text-xs font-semibold uppercase text-zinc-400 tracking-wider mb-2">
                  Search the web
                </h4>
                <button
                  onClick={() => {
                    handleSelectApp('edge');
                  }}
                  className="w-full flex items-center justify-between p-2.5 bg-blue-600/30 hover:bg-blue-600/50 rounded border border-blue-500/40 text-left transition-colors"
                >
                  <div className="flex items-center gap-2">
                    <Globe size={16} className="text-blue-400" />
                    <span className="text-xs font-medium">Search for "{query}" on Bing</span>
                  </div>
                  <ArrowRight size={14} className="text-blue-300" />
                </button>
              </div>
            </div>
          )}
        </div>
      </div>

      {/* Bottom Search Input Bar */}
      <div className="h-11 bg-black/40 border-t border-zinc-800 px-4 flex items-center gap-2">
        <Search size={16} className="text-zinc-400" />
        <input
          type="text"
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          autoFocus
          placeholder="Type here to search apps, files, settings..."
          className="w-full bg-transparent outline-none text-white text-xs placeholder:text-zinc-500"
        />
      </div>
    </div>
  );
};
