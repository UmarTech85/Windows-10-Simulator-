import React, { useState, useEffect } from 'react';
import {
  AppId,
  WindowState,
  FileItem,
  SystemSettings,
  SystemNotification,
} from './types/os';
import { getFileSystem, saveFileSystem } from './utils/fileSystem';
import { APP_REGISTRY } from './utils/appRegistry';
import { soundEngine } from './utils/sound';

// Shell Components
import { Desktop } from './components/shell/Desktop';
import { Taskbar } from './components/shell/Taskbar';
import { StartMenu } from './components/shell/StartMenu';
import { WindowFrame } from './components/shell/WindowFrame';
import { SearchOverlay } from './components/shell/SearchOverlay';
import { ActionCenter } from './components/shell/ActionCenter';
import { CalendarFlyout } from './components/shell/CalendarFlyout';
import { VolumeFlyout } from './components/shell/VolumeFlyout';
import { WifiFlyout } from './components/shell/WifiFlyout';
import { LockScreen } from './components/shell/LockScreen';
import { BSOD } from './components/shell/BSOD';
import { PowerScreen } from './components/shell/PowerScreen';
import { DesktopMediaWidget } from './components/shell/DesktopMediaWidget';
import { useMusicPlayer } from './utils/useMusicPlayer';

// App Components
import { FileExplorer } from './components/apps/FileExplorer';
import { Notepad } from './components/apps/Notepad';
import { Calculator } from './components/apps/Calculator';
import { CommandPrompt } from './components/apps/CommandPrompt';
import { Paint } from './components/apps/Paint';
import { EdgeBrowser } from './components/apps/EdgeBrowser';
import { Minesweeper } from './components/apps/Minesweeper';
import { Photos } from './components/apps/Photos';
import { GrooveMusic } from './components/apps/GrooveMusic';
import { TaskManager } from './components/apps/TaskManager';
import { Settings } from './components/apps/Settings';
import { RecycleBin } from './components/apps/RecycleBin';

const INITIAL_SETTINGS: SystemSettings = {
  wallpaper: '/src/assets/images/win10_hero_wallpaper_1792832156235.jpg',
  accentColor: '#0078d7',
  theme: 'dark',
  nightLight: false,
  volume: 75,
  muted: false,
  wifiConnected: true,
  networkName: 'Home_WiFi_5G',
  soundEffects: true,
  lockScreenEnabled: false,
};

const INITIAL_NOTIFICATIONS: SystemNotification[] = [
  {
    id: 'n-1',
    title: 'Windows Security',
    message: 'Virus & threat protection: No current threats detected.',
    time: '10:00 AM',
    source: 'Windows Defender',
    read: false,
  },
  {
    id: 'n-2',
    title: 'Welcome to Windows 10',
    message: 'Click to explore the Start Menu, File Explorer, and Edge Browser.',
    time: '09:00 AM',
    source: 'Tips & Tricks',
    read: false,
    actionApp: 'explorer',
  },
];

export default function App() {
  const [files, setFiles] = useState<FileItem[]>(() => getFileSystem());
  const [windows, setWindows] = useState<WindowState[]>([]);
  const [activeWindowId, setActiveWindowId] = useState<string | null>(null);
  const [topZIndex, setTopZIndex] = useState<number>(10);
  const [settings, setSettings] = useState<SystemSettings>(INITIAL_SETTINGS);
  const [notifications, setNotifications] = useState<SystemNotification[]>(INITIAL_NOTIFICATIONS);
  const musicPlayer = useMusicPlayer();

  // Shell Flyout states
  const [isStartOpen, setIsStartOpen] = useState(false);
  const [isSearchOpen, setIsSearchOpen] = useState(false);
  const [isActionCenterOpen, setIsActionCenterOpen] = useState(false);
  const [isCalendarOpen, setIsCalendarOpen] = useState(false);
  const [isVolumeOpen, setIsVolumeOpen] = useState(false);
  const [isWifiOpen, setIsWifiOpen] = useState(false);

  // System states
  const [isLocked, setIsLocked] = useState(false);
  const [powerMode, setPowerMode] = useState<'shutdown' | 'restart' | null>(null);
  const [isBSOD, setIsBSOD] = useState(false);
  const [selectedIconId, setSelectedIconId] = useState<string | null>(null);

  // Save files on update
  useEffect(() => {
    saveFileSystem(files);
  }, [files]);

  // Close all flyouts when clicking anywhere outside
  const closeAllFlyouts = () => {
    setIsStartOpen(false);
    setIsSearchOpen(false);
    setIsActionCenterOpen(false);
    setIsCalendarOpen(false);
    setIsVolumeOpen(false);
    setIsWifiOpen(false);
  };

  // Launch or Bring App to Front
  const handleLaunchApp = (appId: AppId, customData?: any) => {
    closeAllFlyouts();
    const appDef = APP_REGISTRY[appId];
    if (!appDef) return;

    // Check if window already exists
    const existing = windows.find((w) => w.appId === appId);
    if (existing) {
      setWindows((prev) =>
        prev.map((w) =>
          w.id === existing.id
            ? {
                ...w,
                isMinimized: false,
                zIndex: topZIndex + 1,
                customData: customData !== undefined ? customData : w.customData,
              }
            : w
        )
      );
      setActiveWindowId(existing.id);
      setTopZIndex((z) => z + 1);
      return;
    }

    // Offset cascaded windows
    const winCount = windows.length;
    const cascadeOffset = (winCount * 28) % 180;
    const defaultX = Math.max(20, Math.min(window.innerWidth - appDef.defaultWidth - 20, 60 + cascadeOffset));
    const defaultY = Math.max(20, Math.min(window.innerHeight - appDef.defaultHeight - 80, 40 + cascadeOffset));

    const newWindow: WindowState = {
      id: `win-${Date.now()}-${Math.random().toString(36).substring(2, 6)}`,
      appId,
      title: appDef.defaultTitle,
      icon: appDef.iconName,
      x: defaultX,
      y: defaultY,
      width: appDef.defaultWidth,
      height: appDef.defaultHeight,
      minWidth: appDef.minWidth,
      minHeight: appDef.minHeight,
      isMinimized: false,
      isMaximized: false,
      zIndex: topZIndex + 1,
      customData,
    };

    setWindows((prev) => [...prev, newWindow]);
    setActiveWindowId(newWindow.id);
    setTopZIndex((z) => z + 1);
    soundEngine.playClick();
  };

  // Open file in matching application
  const handleOpenFile = (file: FileItem) => {
    if (file.type === 'folder') {
      handleLaunchApp('explorer', { location: file.location });
      return;
    }

    const ext = file.extension?.toLowerCase();
    if (ext === 'txt') {
      handleLaunchApp('notepad', { file });
    } else if (ext === 'jpg' || ext === 'png') {
      handleLaunchApp('photos', { file });
    } else if (ext === 'mp3') {
      handleLaunchApp('groove');
    } else if (ext === 'exe') {
      handleLaunchApp('cmd');
    } else {
      handleLaunchApp('notepad', { file });
    }
  };

  // Window operations
  const handleFocusWindow = (id: string) => {
    setActiveWindowId(id);
    setWindows((prev) =>
      prev.map((w) => (w.id === id ? { ...w, zIndex: topZIndex + 1 } : w))
    );
    setTopZIndex((z) => z + 1);
  };

  const handleCloseWindow = (id: string) => {
    setWindows((prev) => prev.filter((w) => w.id !== id));
    if (activeWindowId === id) {
      const remaining = windows.filter((w) => w.id !== id);
      setActiveWindowId(remaining.length > 0 ? remaining[remaining.length - 1].id : null);
    }
  };

  const handleMinimizeWindow = (id: string) => {
    setWindows((prev) =>
      prev.map((w) => (w.id === id ? { ...w, isMinimized: true } : w))
    );
    if (activeWindowId === id) {
      const visible = windows.filter((w) => w.id !== id && !w.isMinimized);
      setActiveWindowId(visible.length > 0 ? visible[visible.length - 1].id : null);
    }
  };

  const handleToggleMaximize = (id: string) => {
    setWindows((prev) =>
      prev.map((w) => {
        if (w.id !== id) return w;
        if (w.isMaximized) {
          return {
            ...w,
            isMaximized: false,
            snappedPosition: null,
            ...(w.prevBounds || {}),
          };
        } else {
          return {
            ...w,
            isMaximized: true,
            snappedPosition: null,
            prevBounds: { x: w.x, y: w.y, width: w.width, height: w.height },
          };
        }
      })
    );
  };

  const handleUpdateBounds = (
    id: string,
    bounds: { x: number; y: number; width: number; height: number; snapped?: 'left' | 'right' | null }
  ) => {
    setWindows((prev) =>
      prev.map((w) =>
        w.id === id
          ? {
              ...w,
              x: bounds.x,
              y: bounds.y,
              width: bounds.width,
              height: bounds.height,
              snappedPosition: bounds.snapped !== undefined ? bounds.snapped : w.snappedPosition,
              isMaximized: bounds.snapped ? false : w.isMaximized,
            }
          : w
      )
    );
  };

  const handleUpdateTitle = (winId: string, newTitle: string) => {
    setWindows((prev) => {
      const target = prev.find((w) => w.id === winId);
      if (!target || target.title === newTitle) return prev;
      return prev.map((w) => (w.id === winId ? { ...w, title: newTitle } : w));
    });
  };

  // Peek at desktop (Aero Peek)
  const handlePeekDesktop = () => {
    const allMinimized = windows.every((w) => w.isMinimized);
    setWindows((prev) =>
      prev.map((w) => ({
        ...w,
        isMinimized: !allMinimized,
      }))
    );
  };

  // File System Handlers
  const handleCreateFolder = (name: string, location: FileItem['location']) => {
    const newFolder: FileItem = {
      id: `folder-${Date.now()}`,
      name,
      type: 'folder',
      location,
      parentId: null,
      date: new Date().toLocaleDateString(),
    };
    setFiles((prev) => [...prev, newFolder]);
  };

  const handleCreateFile = (name: string, content: string, location: FileItem['location']) => {
    const extension = (name.split('.').pop() || 'txt').toLowerCase() as any;
    const newFile: FileItem = {
      id: `file-${Date.now()}`,
      name,
      type: 'file',
      extension,
      content,
      size: `${content.length} B`,
      location,
      parentId: null,
      date: new Date().toLocaleDateString(),
    };
    setFiles((prev) => [...prev, newFile]);
  };

  const handleDeleteItem = (fileId: string) => {
    setFiles((prev) =>
      prev.map((f) => (f.id === fileId ? { ...f, isRecycled: true } : f))
    );
  };

  const handleRestoreItem = (fileId: string) => {
    setFiles((prev) =>
      prev.map((f) => (f.id === fileId ? { ...f, isRecycled: false } : f))
    );
  };

  const handleRestoreAll = () => {
    setFiles((prev) => prev.map((f) => ({ ...f, isRecycled: false })));
  };

  const handleEmptyRecycleBin = () => {
    setFiles((prev) => prev.filter((f) => !f.isRecycled));
  };

  const handleSaveNotepadFile = (name: string, content: string, fileId?: string) => {
    if (fileId) {
      setFiles((prev) =>
        prev.map((f) =>
          f.id === fileId
            ? { ...f, content, size: `${content.length} B`, date: new Date().toLocaleDateString() }
            : f
        )
      );
    } else {
      handleCreateFile(name, content, 'desktop');
    }
  };

  const handleSavePaintArtwork = (filename: string, dataUrl: string) => {
    const newArtFile: FileItem = {
      id: `paint-${Date.now()}`,
      name: filename,
      type: 'file',
      extension: 'png',
      content: dataUrl,
      size: '124 KB',
      location: 'pictures',
      parentId: null,
      date: new Date().toLocaleDateString(),
    };
    setFiles((prev) => [...prev, newArtFile]);
  };

  const handlePowerAction = (action: 'shutdown' | 'restart' | 'sleep' | 'lock') => {
    closeAllFlyouts();
    if (action === 'lock') {
      setIsLocked(true);
    } else if (action === 'sleep') {
      setIsLocked(true);
    } else if (action === 'shutdown' || action === 'restart') {
      setPowerMode(action);
    }
  };

  const allPictures = files.filter(
    (f) =>
      (f.extension === 'jpg' || f.extension === 'png') &&
      !f.isRecycled &&
      (f.location === 'pictures' || f.location === 'desktop')
  );

  return (
    <div
      onClick={closeAllFlyouts}
      className={`relative w-screen h-screen overflow-hidden select-none bg-black ${
        settings.nightLight ? 'sepia-[0.25] saturate-[0.85]' : ''
      }`}
    >
      {/* 1. Desktop Canvas & Icons */}
      <Desktop
        wallpaper={settings.wallpaper}
        files={files}
        selectedIconId={selectedIconId}
        onSelectIcon={setSelectedIconId}
        onOpenApp={handleLaunchApp}
        onOpenFile={handleOpenFile}
        onCreateFolder={handleCreateFolder}
        onCreateFile={handleCreateFile}
      />

      {/* 2. Open Windows Stack */}
      {windows.map((win) => {
        const isActive = activeWindowId === win.id && !win.isMinimized;
        return (
          <WindowFrame
            key={win.id}
            window={win}
            isActive={isActive}
            accentColor={settings.accentColor}
            theme={settings.theme}
            onFocus={() => handleFocusWindow(win.id)}
            onClose={() => handleCloseWindow(win.id)}
            onMinimize={() => handleMinimizeWindow(win.id)}
            onToggleMaximize={() => handleToggleMaximize(win.id)}
            onUpdateBounds={(bounds) => handleUpdateBounds(win.id, bounds)}
          >
            {/* Render App Content based on appId */}
            {win.appId === 'explorer' && (
              <FileExplorer
                files={files}
                initialLocation={win.customData?.location || 'desktop'}
                onOpenFile={handleOpenFile}
                onCreateFolder={handleCreateFolder}
                onCreateFile={handleCreateFile}
                onDeleteItem={handleDeleteItem}
                onUploadFile={(uploaded) => setFiles((prev) => [...prev, uploaded])}
              />
            )}

            {win.appId === 'notepad' && (
              <Notepad
                initialFile={win.customData?.file}
                onSave={handleSaveNotepadFile}
                onClose={() => handleCloseWindow(win.id)}
                updateTitle={(t) => handleUpdateTitle(win.id, t)}
              />
            )}

            {win.appId === 'calc' && <Calculator />}

            {win.appId === 'cmd' && (
              <CommandPrompt
                onLaunchApp={handleLaunchApp}
                onTriggerBSOD={() => setIsBSOD(true)}
              />
            )}

            {win.appId === 'paint' && (
              <Paint onSaveToPictures={handleSavePaintArtwork} />
            )}

            {win.appId === 'edge' && <EdgeBrowser />}

            {win.appId === 'minesweeper' && <Minesweeper />}

            {win.appId === 'photos' && (
              <Photos
                initialFile={win.customData?.file}
                allImageFiles={allPictures}
                onSetWallpaper={(url) => setSettings((s) => ({ ...s, wallpaper: url }))}
                onDelete={handleDeleteItem}
              />
            )}

            {win.appId === 'groove' && <GrooveMusic player={musicPlayer} />}

            {win.appId === 'taskmanager' && (
              <TaskManager
                windows={windows}
                onEndTask={handleCloseWindow}
              />
            )}

            {win.appId === 'settings' && (
              <Settings
                settings={settings}
                onUpdateSettings={(newS) => setSettings((prev) => ({ ...prev, ...newS }))}
              />
            )}

            {win.appId === 'recyclebin' && (
              <RecycleBin
                recycledFiles={files.filter((f) => f.isRecycled)}
                onRestore={handleRestoreItem}
                onRestoreAll={handleRestoreAll}
                onEmpty={handleEmptyRecycleBin}
              />
            )}
          </WindowFrame>
        );
      })}

      {/* 3. Start Menu Popover */}
      {isStartOpen && (
        <StartMenu
          onLaunchApp={handleLaunchApp}
          onOpenFolder={(loc) => handleLaunchApp('explorer', { location: loc })}
          onPowerAction={handlePowerAction}
          onClose={() => setIsStartOpen(false)}
          musicNowPlaying={{
            title: musicPlayer.tracks[musicPlayer.currentTrackIndex]?.title || 'Groove Music',
            artist: musicPlayer.tracks[musicPlayer.currentTrackIndex]?.artist || 'Ensemble',
            isPlaying: musicPlayer.isPlaying,
          }}
        />
      )}

      {/* 4. Search & Cortana Overlay */}
      {isSearchOpen && (
        <SearchOverlay
          files={files}
          onLaunchApp={handleLaunchApp}
          onOpenFile={handleOpenFile}
          onClose={() => setIsSearchOpen(false)}
        />
      )}

      {/* 5. System Tray Flyouts */}
      {isCalendarOpen && (
        <CalendarFlyout onClose={() => setIsCalendarOpen(false)} />
      )}

      {isVolumeOpen && (
        <VolumeFlyout
          volume={settings.volume}
          muted={settings.muted}
          onVolumeChange={(vol) => setSettings((s) => ({ ...s, volume: vol }))}
          onToggleMute={() => setSettings((s) => ({ ...s, muted: !s.muted }))}
        />
      )}

      {isWifiOpen && (
        <WifiFlyout
          connected={settings.wifiConnected}
          activeNetwork={settings.networkName}
          onToggleConnect={(net) =>
            setSettings((s) => ({
              ...s,
              wifiConnected: s.networkName === net ? !s.wifiConnected : true,
              networkName: net,
            }))
          }
        />
      )}

      {isActionCenterOpen && (
        <ActionCenter
          notifications={notifications}
          settings={settings}
          onClearNotifications={() => setNotifications([])}
          onUpdateSettings={(newS) => setSettings((s) => ({ ...s, ...newS }))}
          onLaunchApp={handleLaunchApp}
          onClose={() => setIsActionCenterOpen(false)}
        />
      )}

      {/* 6. System Taskbar */}
      <Taskbar
        windows={windows}
        activeWindowId={activeWindowId}
        notifications={notifications}
        isStartOpen={isStartOpen}
        isSearchOpen={isSearchOpen}
        isActionCenterOpen={isActionCenterOpen}
        isCalendarOpen={isCalendarOpen}
        isWifiOpen={isWifiOpen}
        isVolumeOpen={isVolumeOpen}
        volume={settings.volume}
        muted={settings.muted}
        wifiConnected={settings.wifiConnected}
        accentColor={settings.accentColor}
        onToggleStart={() => {
          setIsStartOpen(!isStartOpen);
          setIsSearchOpen(false);
          setIsActionCenterOpen(false);
          setIsCalendarOpen(false);
          setIsVolumeOpen(false);
          setIsWifiOpen(false);
        }}
        onToggleSearch={() => {
          setIsSearchOpen(!isSearchOpen);
          setIsStartOpen(false);
          setIsActionCenterOpen(false);
          setIsCalendarOpen(false);
          setIsVolumeOpen(false);
          setIsWifiOpen(false);
        }}
        onToggleActionCenter={() => {
          setIsActionCenterOpen(!isActionCenterOpen);
          setIsStartOpen(false);
          setIsSearchOpen(false);
          setIsCalendarOpen(false);
          setIsVolumeOpen(false);
          setIsWifiOpen(false);
        }}
        onToggleCalendar={() => {
          setIsCalendarOpen(!isCalendarOpen);
          setIsStartOpen(false);
          setIsSearchOpen(false);
          setIsActionCenterOpen(false);
          setIsVolumeOpen(false);
          setIsWifiOpen(false);
        }}
        onToggleWifi={() => {
          setIsWifiOpen(!isWifiOpen);
          setIsStartOpen(false);
          setIsSearchOpen(false);
          setIsActionCenterOpen(false);
          setIsCalendarOpen(false);
          setIsVolumeOpen(false);
        }}
        onToggleVolume={() => {
          setIsVolumeOpen(!isVolumeOpen);
          setIsStartOpen(false);
          setIsSearchOpen(false);
          setIsActionCenterOpen(false);
          setIsCalendarOpen(false);
          setIsWifiOpen(false);
        }}
        onAppClick={(appId) => handleLaunchApp(appId)}
        onWindowClick={(win) => {
          if (win.isMinimized) {
            handleFocusWindow(win.id);
            setWindows((prev) =>
              prev.map((w) => (w.id === win.id ? { ...w, isMinimized: false } : w))
            );
          } else if (activeWindowId === win.id) {
            handleMinimizeWindow(win.id);
          } else {
            handleFocusWindow(win.id);
          }
        }}
        onPeekDesktop={handlePeekDesktop}
      />

      {/* 7. Lock Screen Overlay */}
      {isLocked && (
        <LockScreen
          wallpaper={settings.wallpaper}
          onUnlock={() => setIsLocked(false)}
        />
      )}

      {/* 8. Power Action Screen (Shutdown / Restart) */}
      {powerMode && (
        <PowerScreen
          mode={powerMode}
          onDone={() => {
            if (powerMode === 'shutdown') {
              setIsLocked(true);
            }
            setPowerMode(null);
            setWindows([]);
          }}
        />
      )}

      {/* 9. Easter Egg Blue Screen of Death (BSOD) */}
      {isBSOD && <BSOD onRestart={() => setIsBSOD(false)} />}

      {/* 10. Background Music Desktop Media Widget */}
      <DesktopMediaWidget
        player={musicPlayer}
        onOpenGroove={() => handleLaunchApp('groove')}
        isGrooveWindowOpen={windows.some((w) => w.appId === 'groove' && !w.isMinimized)}
      />
    </div>
  );
}
