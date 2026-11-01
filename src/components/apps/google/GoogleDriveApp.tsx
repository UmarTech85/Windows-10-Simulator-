import React, { useState } from 'react';
import { GoogleDriveIcon } from './GoogleIcons';
import { GOOGLE_SERVICES_CONFIG } from '../../../config/googleServices';
import { soundEngine } from '../../../utils/sound';

interface DriveFile {
  id: string;
  name: string;
  type: 'folder' | 'document' | 'image' | 'audio' | 'code' | 'zip';
  size: string;
  updatedAt: string;
  isStarred: boolean;
  content?: string;
  downloadUrl?: string;
}

const INITIAL_DRIVE_FILES: DriveFile[] = [
  {
    id: 'f-1',
    name: 'Windows 10 Project Documentation',
    type: 'folder',
    size: '4 items',
    updatedAt: 'Nov 1, 2026',
    isStarred: true,
  },
  {
    id: 'f-2',
    name: 'DirectX 12 Shader Assets & Textures',
    type: 'folder',
    size: '12 items',
    updatedAt: 'Oct 28, 2026',
    isStarred: false,
  },
  {
    id: 'f-3',
    name: 'google-services.json',
    type: 'code',
    size: '712 B',
    updatedAt: 'Today',
    isStarred: true,
    content: JSON.stringify(
      {
        project_number: GOOGLE_SERVICES_CONFIG.projectNumber,
        project_id: GOOGLE_SERVICES_CONFIG.projectId,
        storage_bucket: GOOGLE_SERVICES_CONFIG.storageBucket,
        mobilesdk_app_id: GOOGLE_SERVICES_CONFIG.mobileSdkAppId,
        package_name: GOOGLE_SERVICES_CONFIG.packageName,
        api_key: GOOGLE_SERVICES_CONFIG.apiKey,
      },
      null,
      2
    ),
  },
  {
    id: 'f-4',
    name: 'windows10_hero_wallpaper_4k.jpg',
    type: 'image',
    size: '3.8 MB',
    updatedAt: 'Yesterday',
    isStarred: true,
    content: 'Hero wallpaper texture for Microsoft Windows 10 desktop.',
  },
  {
    id: 'f-5',
    name: 'edge_browser_release_notes.docx',
    type: 'document',
    size: '142 KB',
    updatedAt: 'Oct 30, 2026',
    isStarred: false,
    content:
      'Release Notes: Microsoft Edge on Windows 10 Simulator.\n\nFeatures:\n- Google Services Hub integration\n- YouTube, Gmail, Drive, Maps, Gemini AI\n- DirectX 12 hardware acceleration\n- Integrated DevTools and real-time offline file downloader',
  },
  {
    id: 'f-6',
    name: 'groove_music_soundtrack.mp3',
    type: 'audio',
    size: '8.4 MB',
    updatedAt: 'Oct 25, 2026',
    isStarred: false,
    content: 'Audio master track for Windows 10 Simulator sound engine.',
  },
  {
    id: 'f-7',
    name: 'system_backup_win10.zip',
    type: 'zip',
    size: '48.2 MB',
    updatedAt: 'Oct 20, 2026',
    isStarred: false,
    content: 'Full system backup archive stored in Firebase Cloud Storage.',
  },
];

interface GoogleDriveAppProps {
  onNavigate: (view: any, url: string, title: string) => void;
  onOpenAppsWaffle: () => void;
  onDownloadFile?: (name: string, content: string, mime: string) => void;
}

export const GoogleDriveApp: React.FC<GoogleDriveAppProps> = ({
  onNavigate,
  onOpenAppsWaffle,
  onDownloadFile,
}) => {
  const [files, setFiles] = useState<DriveFile[]>(INITIAL_DRIVE_FILES);
  const [activeTab, setActiveTab] = useState<
    'my-drive' | 'recent' | 'starred' | 'trash'
  >('my-drive');
  const [searchQuery, setSearchQuery] = useState('');
  const [viewMode, setViewMode] = useState<'grid' | 'list'>('grid');
  const [previewFile, setPreviewFile] = useState<DriveFile | null>(null);
  const [isNewFolderModalOpen, setIsNewFolderModalOpen] = useState(false);
  const [newFolderName, setNewFolderName] = useState('');

  // Storage usage calculation
  const storageUsed = GOOGLE_SERVICES_CONFIG.connectedAccount.storageUsedGb;
  const storageTotal = GOOGLE_SERVICES_CONFIG.connectedAccount.storageTotalGb;
  const storagePercent = Math.round((storageUsed / storageTotal) * 100);

  const filteredFiles = files.filter((f) => {
    const matchesTab =
      activeTab === 'starred' ? f.isStarred : activeTab === 'my-drive' || true;
    const matchesSearch =
      !searchQuery || f.name.toLowerCase().includes(searchQuery.toLowerCase());
    return matchesTab && matchesSearch;
  });

  const handleCreateFolder = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newFolderName.trim()) return;
    soundEngine.playClick();
    const newFolder: DriveFile = {
      id: `f-${Date.now()}`,
      name: newFolderName.trim(),
      type: 'folder',
      size: '0 items',
      updatedAt: 'Just now',
      isStarred: false,
    };
    setFiles([newFolder, ...files]);
    setNewFolderName('');
    setIsNewFolderModalOpen(false);
  };

  const handleUploadMockFile = () => {
    soundEngine.playDing();
    const uploaded: DriveFile = {
      id: `f-${Date.now()}`,
      name: `project_snapshot_${new Date().toISOString().slice(0, 10)}.json`,
      type: 'code',
      size: '18.4 KB',
      updatedAt: 'Just now',
      isStarred: false,
      content: JSON.stringify(
        {
          simulator: 'Windows 10',
          engine: 'DirectX 12',
          firebaseProject: GOOGLE_SERVICES_CONFIG.projectId,
          timestamp: new Date().toISOString(),
        },
        null,
        2
      ),
    };
    setFiles([uploaded, ...files]);
  };

  const handleDownload = (file: DriveFile) => {
    soundEngine.playDing();
    const content = file.content || `File content for ${file.name}`;
    const mime =
      file.type === 'code'
        ? 'application/json'
        : file.type === 'document'
        ? 'text/plain'
        : 'application/octet-stream';

    if (onDownloadFile) {
      onDownloadFile(file.name, content, mime);
    } else {
      const blob = new Blob([content], { type: mime });
      const url = URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = file.name;
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);
    }
  };

  return (
    <div className="min-h-full flex flex-col bg-white dark:bg-[#1f1f1f] text-zinc-800 dark:text-zinc-200 font-sans select-none">
      {/* 1. Drive Header */}
      <header className="px-4 py-2.5 border-b border-zinc-200 dark:border-zinc-800 flex items-center justify-between gap-4 bg-white dark:bg-[#202124]">
        <div className="flex items-center gap-2.5 cursor-pointer">
          <GoogleDriveIcon className="w-6 h-6" />
          <span className="font-semibold text-lg text-zinc-700 dark:text-zinc-200">
            Drive
          </span>
        </div>

        {/* Search Bar */}
        <div className="flex-1 max-w-xl mx-2">
          <div className="flex items-center bg-[#f1f3f4] dark:bg-[#303134] rounded-full px-4 py-2 text-xs">
            <span className="text-zinc-400 mr-2">🔍</span>
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Search in Drive, documents, or photos"
              className="w-full bg-transparent outline-none text-xs text-inherit placeholder-zinc-500"
            />
          </div>
        </div>

        {/* Right Tools */}
        <div className="flex items-center gap-3">
          <button
            onClick={onOpenAppsWaffle}
            title="Google apps"
            className="p-2 hover:bg-zinc-100 dark:hover:bg-zinc-800 rounded-full text-zinc-600 dark:text-zinc-300"
          >
            <svg
              className="w-5 h-5"
              fill="currentColor"
              viewBox="0 0 24 24"
            >
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

          <div
            title={`Connected Firebase Account: ${GOOGLE_SERVICES_CONFIG.connectedAccount.name}`}
            className="w-8 h-8 rounded-full bg-blue-600 text-white font-medium flex items-center justify-center text-xs shadow-xs"
          >
            W
          </div>
        </div>
      </header>

      {/* 2. Main Drive Layout */}
      <div className="flex-1 flex overflow-hidden">
        {/* Left Action Rail */}
        <aside className="w-56 p-3 flex flex-col gap-1 border-r border-zinc-200 dark:border-zinc-800 shrink-0 bg-[#f8fafd] dark:bg-[#1a1a1a]">
          {/* New Button */}
          <div className="flex gap-2 mb-3">
            <button
              onClick={() => setIsNewFolderModalOpen(true)}
              className="flex-1 flex items-center justify-center gap-2 px-3 py-2.5 rounded-2xl bg-white dark:bg-zinc-800 border border-zinc-300 dark:border-zinc-700 hover:shadow-md transition-all font-semibold text-xs shadow-xs"
            >
              <span className="text-blue-500 font-bold">+</span>
              <span>New Folder</span>
            </button>
            <button
              onClick={handleUploadMockFile}
              title="Upload File"
              className="p-2.5 rounded-2xl bg-[#c2e7ff] dark:bg-[#004a77] text-blue-900 dark:text-blue-100 hover:shadow-md transition-all font-semibold text-xs"
            >
              ⬆️ Upload
            </button>
          </div>

          {/* Navigation */}
          {[
            { id: 'my-drive', label: 'My Drive', icon: '📁' },
            { id: 'recent', label: 'Recent', icon: '🕒' },
            { id: 'starred', label: 'Starred', icon: '⭐' },
            { id: 'trash', label: 'Trash', icon: '🗑️' },
          ].map((item) => (
            <button
              key={item.id}
              onClick={() => {
                setActiveTab(item.id as any);
                soundEngine.playClick();
              }}
              className={`flex items-center gap-3 px-3.5 py-2 rounded-full text-xs font-medium transition-colors ${
                activeTab === item.id
                  ? 'bg-[#c2e7ff] dark:bg-[#004a77] text-[#001d35] dark:text-white font-bold'
                  : 'hover:bg-zinc-200/50 dark:hover:bg-zinc-800 text-zinc-700 dark:text-zinc-300'
              }`}
            >
              <span>{item.icon}</span>
              <span>{item.label}</span>
            </button>
          ))}

          {/* Cloud Storage Meter linked to Firebase Storage */}
          <div className="mt-auto p-3.5 bg-white dark:bg-zinc-800/80 rounded-2xl border border-zinc-200 dark:border-zinc-700 text-xs">
            <div className="flex items-center justify-between mb-1.5 font-semibold text-[11px]">
              <span className="text-zinc-600 dark:text-zinc-300">Storage</span>
              <span className="text-blue-600 dark:text-blue-400">
                {storageUsed} GB of {storageTotal} GB
              </span>
            </div>
            {/* Progress bar */}
            <div className="w-full h-1.5 bg-zinc-200 dark:bg-zinc-700 rounded-full overflow-hidden mb-2">
              <div
                className="h-full bg-blue-600 rounded-full"
                style={{ width: `${storagePercent}%` }}
              />
            </div>
            <p className="text-[10px] text-zinc-400 font-mono truncate">
              {GOOGLE_SERVICES_CONFIG.storageBucket}
            </p>
          </div>
        </aside>

        {/* Files Grid / List Main Area */}
        <main className="flex-1 p-5 overflow-y-auto">
          {/* Action & View Toolbar */}
          <div className="flex items-center justify-between pb-3 border-b border-zinc-200 dark:border-zinc-800 mb-4">
            <h2 className="text-base font-bold text-zinc-800 dark:text-zinc-200 capitalize">
              {activeTab === 'my-drive' ? 'My Drive' : activeTab}
            </h2>
            <div className="flex items-center gap-1 bg-zinc-100 dark:bg-zinc-800 p-1 rounded-lg">
              <button
                onClick={() => setViewMode('grid')}
                className={`p-1 rounded ${
                  viewMode === 'grid'
                    ? 'bg-white dark:bg-zinc-700 shadow-xs text-blue-600'
                    : 'text-zinc-400'
                }`}
                title="Grid view"
              >
                ⊞
              </button>
              <button
                onClick={() => setViewMode('list')}
                className={`p-1 rounded ${
                  viewMode === 'list'
                    ? 'bg-white dark:bg-zinc-700 shadow-xs text-blue-600'
                    : 'text-zinc-400'
                }`}
                title="List view"
              >
                ☰
              </button>
            </div>
          </div>

          {/* Grid View */}
          {viewMode === 'grid' ? (
            <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-4">
              {filteredFiles.map((file) => (
                <div
                  key={file.id}
                  onClick={() => {
                    setPreviewFile(file);
                    soundEngine.playClick();
                  }}
                  className="group p-3.5 bg-zinc-50 dark:bg-zinc-800/60 hover:bg-[#e8f0fe] dark:hover:bg-blue-950/40 border border-zinc-200 dark:border-zinc-700 hover:border-blue-300 dark:hover:border-blue-700 rounded-xl transition-all cursor-pointer shadow-2xs hover:shadow-sm"
                >
                  <div className="flex items-center justify-between mb-3">
                    <span className="text-2xl">
                      {file.type === 'folder'
                        ? '📁'
                        : file.type === 'image'
                        ? '🖼️'
                        : file.type === 'code'
                        ? '📄'
                        : file.type === 'audio'
                        ? '🎵'
                        : file.type === 'zip'
                        ? '📦'
                        : '📝'}
                    </span>
                    <button
                      onClick={(e) => {
                        e.stopPropagation();
                        setFiles((prev) =>
                          prev.map((f) =>
                            f.id === file.id
                              ? { ...f, isStarred: !f.isStarred }
                              : f
                          )
                        );
                        soundEngine.playClick();
                      }}
                      className={`text-sm ${
                        file.isStarred ? 'text-amber-500' : 'text-zinc-300 opacity-0 group-hover:opacity-100'
                      }`}
                    >
                      ★
                    </button>
                  </div>

                  <h3 className="font-semibold text-xs truncate text-zinc-900 dark:text-zinc-100 group-hover:text-blue-600 dark:group-hover:text-blue-400">
                    {file.name}
                  </h3>
                  <div className="flex items-center justify-between text-[11px] text-zinc-400 mt-2">
                    <span>{file.size}</span>
                    <span>{file.updatedAt}</span>
                  </div>
                </div>
              ))}
            </div>
          ) : (
            /* List View */
            <div className="divide-y divide-zinc-200 dark:divide-zinc-800 text-xs">
              <div className="flex items-center justify-between py-2 text-zinc-400 font-semibold px-2">
                <span className="w-1/2">Name</span>
                <span>Size</span>
                <span>Last modified</span>
                <span>Actions</span>
              </div>
              {filteredFiles.map((file) => (
                <div
                  key={file.id}
                  onClick={() => {
                    setPreviewFile(file);
                    soundEngine.playClick();
                  }}
                  className="flex items-center justify-between py-2.5 px-2 hover:bg-zinc-100 dark:hover:bg-zinc-800/70 rounded-lg cursor-pointer transition-colors"
                >
                  <div className="w-1/2 flex items-center gap-2.5 truncate">
                    <span>
                      {file.type === 'folder'
                        ? '📁'
                        : file.type === 'image'
                        ? '🖼️'
                        : file.type === 'code'
                        ? '📄'
                        : file.type === 'audio'
                        ? '🎵'
                        : '📝'}
                    </span>
                    <span className="font-medium truncate">{file.name}</span>
                  </div>
                  <span className="text-zinc-400 text-[11px]">{file.size}</span>
                  <span className="text-zinc-400 text-[11px]">{file.updatedAt}</span>
                  <button
                    onClick={(e) => {
                      e.stopPropagation();
                      handleDownload(file);
                    }}
                    className="text-blue-600 hover:underline text-xs"
                  >
                    Download
                  </button>
                </div>
              ))}
            </div>
          )}
        </main>
      </div>

      {/* 3. File Preview & Download Modal */}
      {previewFile && (
        <div className="fixed inset-0 z-50 bg-black/50 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white dark:bg-zinc-800 rounded-2xl max-w-lg w-full p-5 shadow-2xl border border-zinc-200 dark:border-zinc-700 animate-fadeIn">
            <div className="flex items-center justify-between pb-3 border-b border-zinc-200 dark:border-zinc-700 mb-4">
              <div className="flex items-center gap-2 truncate">
                <span className="text-xl">
                  {previewFile.type === 'folder' ? '📁' : '📄'}
                </span>
                <h3 className="font-bold text-sm text-zinc-900 dark:text-white truncate">
                  {previewFile.name}
                </h3>
              </div>
              <button
                onClick={() => setPreviewFile(null)}
                className="text-zinc-400 hover:text-zinc-600 text-sm p-1"
              >
                ✕
              </button>
            </div>

            <div className="bg-zinc-50 dark:bg-zinc-900 p-4 rounded-xl border border-zinc-200 dark:border-zinc-700 text-xs font-mono text-zinc-700 dark:text-zinc-300 max-h-56 overflow-y-auto whitespace-pre-wrap mb-4">
              {previewFile.content || `Preview unavailable for ${previewFile.name}. Click Download to save file.`}
            </div>

            <div className="flex items-center justify-between text-xs">
              <span className="text-zinc-400">Size: {previewFile.size}</span>
              <div className="flex gap-2">
                <button
                  onClick={() => setPreviewFile(null)}
                  className="px-3.5 py-1.5 border border-zinc-300 dark:border-zinc-600 rounded-lg hover:bg-zinc-100 dark:hover:bg-zinc-700"
                >
                  Close
                </button>
                <button
                  onClick={() => {
                    handleDownload(previewFile);
                    setPreviewFile(null);
                  }}
                  className="px-4 py-1.5 bg-blue-600 hover:bg-blue-700 text-white font-semibold rounded-lg shadow transition-colors flex items-center gap-1.5"
                >
                  <span>⬇️</span> Download to Edge
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* 4. New Folder Modal */}
      {isNewFolderModalOpen && (
        <div className="fixed inset-0 z-50 bg-black/40 backdrop-blur-xs flex items-center justify-center p-4">
          <form
            onSubmit={handleCreateFolder}
            className="bg-white dark:bg-zinc-800 rounded-2xl max-w-sm w-full p-5 shadow-2xl border border-zinc-200 dark:border-zinc-700 animate-fadeIn"
          >
            <h3 className="font-bold text-sm mb-3">New folder</h3>
            <input
              type="text"
              value={newFolderName}
              onChange={(e) => setNewFolderName(e.target.value)}
              placeholder="Folder title"
              className="w-full bg-zinc-100 dark:bg-zinc-700 border border-zinc-300 dark:border-zinc-600 rounded-lg px-3 py-2 text-xs outline-none text-inherit mb-4"
              autoFocus
              required
            />
            <div className="flex justify-end gap-2 text-xs">
              <button
                type="button"
                onClick={() => setIsNewFolderModalOpen(false)}
                className="px-3 py-1.5 hover:bg-zinc-100 dark:hover:bg-zinc-700 rounded-lg"
              >
                Cancel
              </button>
              <button
                type="submit"
                className="px-4 py-1.5 bg-blue-600 hover:bg-blue-700 text-white font-semibold rounded-lg shadow"
              >
                Create
              </button>
            </div>
          </form>
        </div>
      )}
    </div>
  );
};
