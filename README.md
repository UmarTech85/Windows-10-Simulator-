# Windows 10 Simulator (Android)

An interactive **Windows 10 desktop simulator** built natively for Android using **Kotlin**, **Jetpack Compose**, and **Material Design 3**.

## Key Features

- **Desktop Shell & Aero Snap**
  - High-resolution Windows 10 wallpapers (Hero Blueprint, Moraine Alpine Lake, Dark Abstract Ribbon) plus custom images from Photos.
  - Desktop icon grid with adjustable icon sizes, selection, double-tap open, and long-press context menu (New folder, New text document, Terminal, Display settings, Personalize).
  - Floating draggable & resizable windows with **Aero Snap** ghost previews (top edge maximize, left/right 50% split) and double-tap title bar maximize/restore.
- **Start Menu, Search & System Tray**
  - Expandable left rail (Lock, Documents, Pictures, Settings, Power menu with Sleep / Shut down / Restart).
  - Alphabetical All Apps list and interactive **Live Tiles** (Weather, Edge, Groove Music with live now-playing bars, Photos, Calculator, Paint, Minesweeper, Terminal, Settings).
  - Taskbar with pinned & running app previews, Windows Search overlay (`All`, `Apps`, `Documents`), Wi-Fi, Volume, Calendar/Clock, Action Center (8 quick tiles + notifications), and Aero Peek.
- **12 Built-in Applications**
  - **File Explorer**: Virtual file system persisted locally (`Desktop`, `Documents`, `Pictures`, `Downloads`, `Music`), folder/file creation, photo picker import, grid/details views.
  - **Microsoft Edge**: Multi-tab & InPrivate browsing, Wikipedia search & reader mode (Light/Sepia/Dark) with offline fallback, WebView external URLs, built-in **Edge Surf** & **Snake Arcade** games, History & Downloads.
  - **Notepad**: File/Edit/Format menus, dirty-state tracking, font size & word wrap options, line/column status bar.
  - **Calculator**: Standard mode, Memory bar (`MC`, `MR`, `M+`, `M-`, `MS`), and calculation History drawer.
  - **Command Prompt**: Interactive interpreter with `help`, `dir`, `cd`, `mkdir`, `set`/`printenv`, `systeminfo`, `ipconfig`, `ping`, `color`, command chaining (`&&`/`||`/`;`), `matrix` falling digital rain, and `bsod` demo.
  - **Paint**: Pencil, Brush, Eraser, Eyedropper, Line, Rectangle, Circle, 20-color palette, Undo, and PNG export to Pictures.
  - **Minesweeper**: Beginner (`9x9`), Intermediate (`16x16`), and Expert (`16x30`) boards, first-click safety, flood-fill reveal, Flag mode, LED counters, and sound effects.
  - **Photos**: Gallery viewer for bundled, Paint-exported, and imported photos with zoom, 90° rotation, thumbnail strip, and Set as Wallpaper.
  - **Groove Music**: Procedural PCM synthesizer with 5 built-in tracks, local audio import via system document picker, 5-band Graphic Equalizer + presets, Spectrum/Wave/Halo visualizers, and floating Desktop Media Widget.
  - **Task Manager**: Active processes list with End Task and live CPU utilization graph & DDR5 memory monitor.
  - **Settings**: Personalization (wallpapers, accent colors, Dark/Light mode), System (Night Light, UI sound effects, startup Lock Screen), and Windows Update check.
  - **Recycle Bin**: Restore selected/all items or empty permanently with recycle sound cue.
- **Audio & Overlays**
  - Native `AudioTrack` PCM synthesizer for Windows 10 startup, click, notification, chime, recycle, win, and explosion sounds.
  - Interactive Lock Screen, animated Shutting down / Restarting screens, and BSOD (`CRITICAL_PROCESS_DIED`) recovery screen.
