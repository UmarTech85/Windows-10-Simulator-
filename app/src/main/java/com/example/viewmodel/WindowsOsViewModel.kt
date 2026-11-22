package com.example.viewmodel

import android.app.Application
import android.graphics.Bitmap
import androidx.lifecycle.AndroidViewModel
import androidx.lifecycle.viewModelScope
import com.example.audio.DEFAULT_GROOVE_TRACKS
import com.example.audio.EQ_PRESETS
import com.example.audio.GrooveMusicEngine
import com.example.audio.WindowsSoundEngine
import com.example.data.FileSystemRepository
import com.example.model.AppId
import com.example.model.AppRegistry
import com.example.model.DesktopIconSize
import com.example.model.FileExtension
import com.example.model.FileItem
import com.example.model.FileLocation
import com.example.model.GrooveTrack
import com.example.model.MusicPlayerUiState
import com.example.model.PowerMode
import com.example.model.RepeatMode
import com.example.model.SnapPosition
import com.example.model.SystemNotification
import com.example.model.SystemSettings
import com.example.model.WindowBounds
import com.example.model.WindowState
import kotlinx.coroutines.flow.MutableStateFlow
import kotlinx.coroutines.flow.StateFlow
import kotlinx.coroutines.flow.asStateFlow
import kotlinx.coroutines.flow.update
import kotlinx.coroutines.launch
import java.text.SimpleDateFormat
import java.util.Date
import java.util.Locale
import java.util.UUID
import kotlin.random.Random

enum class ActiveFlyout {
    NONE,
    START,
    SEARCH,
    ACTION_CENTER,
    CALENDAR,
    VOLUME,
    WIFI
}

data class WindowsOsUiState(
    val files: List<FileItem> = emptyList(),
    val windows: List<WindowState> = emptyList(),
    val activeWindowId: String? = null,
    val settings: SystemSettings = SystemSettings(),
    val notifications: List<SystemNotification> = listOf(
        SystemNotification(
            id = "n-1",
            title = "Windows Security",
            message = "Virus & threat protection: No current threats detected.",
            time = "10:00 AM",
            source = "Windows Defender",
            read = false
        ),
        SystemNotification(
            id = "n-2",
            title = "Welcome to Windows 10",
            message = "Tap to explore the Start Menu, File Explorer, and Microsoft Edge.",
            time = "09:00 AM",
            source = "Tips & Tricks",
            read = false,
            actionApp = AppId.EXPLORER
        )
    ),
    val activeFlyout: ActiveFlyout = ActiveFlyout.NONE,
    val isLocked: Boolean = false,
    val powerMode: PowerMode? = null,
    val isBsod: Boolean = false,
    val selectedDesktopIconId: String? = null,
    val desktopIconSize: DesktopIconSize = DesktopIconSize.NORMAL,
    val screenWidthDp: Float = 800f,
    val screenHeightDp: Float = 480f
)

class WindowsOsViewModel(application: Application) : AndroidViewModel(application) {
    private val repository = FileSystemRepository(application)
    private val musicEngine = GrooveMusicEngine(application)

    private val _uiState = MutableStateFlow(WindowsOsUiState(files = repository.initialFiles()))
    val uiState: StateFlow<WindowsOsUiState> = _uiState.asStateFlow()

    private val _musicState = MutableStateFlow(
        MusicPlayerUiState(
            tracks = DEFAULT_GROOVE_TRACKS,
            currentTrackIndex = 0,
            durationSec = DEFAULT_GROOVE_TRACKS.first().durationSec
        )
    )
    val musicState: StateFlow<MusicPlayerUiState> = _musicState.asStateFlow()

    private var topZIndex = 10

    init {
        viewModelScope.launch {
            val loadedFiles = repository.loadFiles()
            val loadedSettings = repository.loadSettings()
            WindowsSoundEngine.enabled = loadedSettings.soundEffects
            WindowsSoundEngine.masterVolume = loadedSettings.volume / 100f
            WindowsSoundEngine.muted = loadedSettings.muted
            _uiState.update {
                it.copy(
                    files = loadedFiles,
                    settings = loadedSettings,
                    isLocked = loadedSettings.lockScreenEnabled
                )
            }
        }

        musicEngine.onTick = { curSec, durSec, spectrum, wave, finished ->
            _musicState.update { state ->
                state.copy(
                    currentTimeSec = curSec,
                    durationSec = durSec,
                    spectrumBars = spectrum,
                    waveSamples = wave
                )
            }
            if (finished) {
                handleTrackFinished()
            }
        }
    }

    fun updateViewportSize(widthDp: Float, heightDp: Float) {
        _uiState.update { it.copy(screenWidthDp = widthDp, screenHeightDp = heightDp) }
    }

    fun closeFlyouts() {
        _uiState.update { it.copy(activeFlyout = ActiveFlyout.NONE) }
    }

    fun toggleFlyout(target: ActiveFlyout) {
        WindowsSoundEngine.playClick()
        _uiState.update {
            it.copy(activeFlyout = if (it.activeFlyout == target) ActiveFlyout.NONE else target)
        }
    }

    fun selectDesktopIcon(id: String?) {
        _uiState.update { it.copy(selectedDesktopIconId = id) }
    }

    fun cycleDesktopIconSize() {
        WindowsSoundEngine.playClick()
        _uiState.update {
            val next = when (it.desktopIconSize) {
                DesktopIconSize.SMALL -> DesktopIconSize.NORMAL
                DesktopIconSize.NORMAL -> DesktopIconSize.LARGE
                DesktopIconSize.LARGE -> DesktopIconSize.SMALL
            }
            it.copy(desktopIconSize = next)
        }
    }

    fun launchApp(
        appId: AppId,
        fileId: String? = null,
        location: FileLocation? = null,
        initialUrl: String? = null,
        initialQuery: String? = null
    ) {
        val state = _uiState.value
        val existing = state.windows.firstOrNull { it.appId == appId }
        if (existing != null) {
            topZIndex += 1
            _uiState.update { s ->
                s.copy(
                    activeFlyout = ActiveFlyout.NONE,
                    activeWindowId = existing.id,
                    windows = s.windows.map { w ->
                        if (w.id == existing.id) {
                            w.copy(
                                isMinimized = false,
                                zIndex = topZIndex,
                                initialFileId = fileId ?: w.initialFileId,
                                initialLocation = location ?: w.initialLocation,
                                initialUrl = initialUrl ?: w.initialUrl,
                                initialQuery = initialQuery ?: w.initialQuery
                            )
                        } else w
                    }
                )
            }
            WindowsSoundEngine.playClick()
            return
        }

        val def = AppRegistry.get(appId)
        val availW = state.screenWidthDp.coerceAtLeast(320f)
        val availH = (state.screenHeightDp - 48f).coerceAtLeast(300f)
        val isCompactScreen = availW < 560f

        val winW = if (isCompactScreen) availW else def.defaultWidthDp.coerceAtMost(availW - 24f)
        val winH = if (isCompactScreen) availH else def.defaultHeightDp.coerceAtMost(availH - 24f)
        val cascade = ((state.windows.size * 22) % 110).toFloat()
        val x = if (isCompactScreen) 0f else (24f + cascade).coerceAtMost((availW - winW).coerceAtLeast(0f))
        val y = if (isCompactScreen) 0f else (16f + cascade).coerceAtMost((availH - winH).coerceAtLeast(0f))

        topZIndex += 1
        val newWin = WindowState(
            id = "win-${UUID.randomUUID().toString().take(8)}",
            appId = appId,
            title = def.defaultTitle,
            xDp = x,
            yDp = y,
            widthDp = winW,
            heightDp = winH,
            minWidthDp = def.minWidthDp.coerceAtMost(availW),
            minHeightDp = def.minHeightDp.coerceAtMost(availH),
            isMinimized = false,
            isMaximized = isCompactScreen,
            zIndex = topZIndex,
            initialFileId = fileId,
            initialLocation = location,
            initialUrl = initialUrl,
            initialQuery = initialQuery
        )

        _uiState.update { s ->
            s.copy(
                activeFlyout = ActiveFlyout.NONE,
                windows = s.windows + newWin,
                activeWindowId = newWin.id
            )
        }
        WindowsSoundEngine.playClick()
    }

    fun openFile(file: FileItem) {
        if (file.isFolder) {
            launchApp(AppId.EXPLORER, location = file.location)
            return
        }
        when (file.extension) {
            FileExtension.TXT, FileExtension.DOC, FileExtension.PDF -> launchApp(AppId.NOTEPAD, fileId = file.id)
            FileExtension.JPG, FileExtension.PNG -> launchApp(AppId.PHOTOS, fileId = file.id)
            FileExtension.MP3 -> launchApp(AppId.GROOVE)
            FileExtension.EXE -> launchApp(AppId.CMD)
            null -> launchApp(AppId.NOTEPAD, fileId = file.id)
        }
    }

    fun focusWindow(windowId: String) {
        topZIndex += 1
        _uiState.update { s ->
            s.copy(
                activeFlyout = ActiveFlyout.NONE,
                activeWindowId = windowId,
                windows = s.windows.map { w ->
                    if (w.id == windowId) w.copy(zIndex = topZIndex, isMinimized = false) else w
                }
            )
        }
    }

    fun closeWindow(windowId: String) {
        WindowsSoundEngine.playClick()
        _uiState.update { s ->
            val remaining = s.windows.filterNot { it.id == windowId }
            val nextActive = if (s.activeWindowId == windowId) {
                remaining.filterNot { it.isMinimized }.maxByOrNull { it.zIndex }?.id
            } else s.activeWindowId
            s.copy(windows = remaining, activeWindowId = nextActive)
        }
    }

    fun minimizeWindow(windowId: String) {
        WindowsSoundEngine.playClick()
        _uiState.update { s ->
            val updated = s.windows.map { if (it.id == windowId) it.copy(isMinimized = true) else it }
            val nextActive = if (s.activeWindowId == windowId) {
                updated.filterNot { it.isMinimized }.maxByOrNull { it.zIndex }?.id
            } else s.activeWindowId
            s.copy(windows = updated, activeWindowId = nextActive)
        }
    }

    fun toggleMaximizeWindow(windowId: String) {
        WindowsSoundEngine.playClick()
        _uiState.update { s ->
            val updated = s.windows.map { w ->
                if (w.id != windowId) w
                else if (w.isMaximized) {
                    val prev = w.prevBounds
                    w.copy(
                        isMaximized = false,
                        snappedPosition = null,
                        xDp = prev?.xDp ?: 24f,
                        yDp = prev?.yDp ?: 24f,
                        widthDp = prev?.widthDp ?: AppRegistry.get(w.appId).defaultWidthDp.coerceAtMost(s.screenWidthDp - 24f),
                        heightDp = prev?.heightDp ?: AppRegistry.get(w.appId).defaultHeightDp.coerceAtMost(s.screenHeightDp - 72f)
                    )
                } else {
                    w.copy(
                        isMaximized = true,
                        snappedPosition = null,
                        prevBounds = WindowBounds(w.xDp, w.yDp, w.widthDp, w.heightDp)
                    )
                }
            }
            s.copy(windows = updated)
        }
    }

    fun updateWindowBounds(
        windowId: String,
        xDp: Float,
        yDp: Float,
        widthDp: Float,
        heightDp: Float,
        snapped: SnapPosition? = null
    ) {
        _uiState.update { s ->
            s.copy(
                windows = s.windows.map { w ->
                    if (w.id != windowId) w
                    else w.copy(
                        xDp = xDp,
                        yDp = yDp,
                        widthDp = widthDp,
                        heightDp = heightDp,
                        snappedPosition = snapped,
                        isMaximized = if (snapped != null) false else w.isMaximized
                    )
                }
            )
        }
    }

    fun snapWindow(windowId: String, snap: SnapPosition?) {
        val s = _uiState.value
        val availW = s.screenWidthDp
        val availH = (s.screenHeightDp - 48f).coerceAtLeast(240f)
        when (snap) {
            SnapPosition.LEFT -> {
                WindowsSoundEngine.playClick()
                updateWindowBounds(windowId, 0f, 0f, availW / 2f, availH, SnapPosition.LEFT)
            }
            SnapPosition.RIGHT -> {
                WindowsSoundEngine.playClick()
                updateWindowBounds(windowId, availW / 2f, 0f, availW / 2f, availH, SnapPosition.RIGHT)
            }
            null -> toggleMaximizeWindow(windowId)
        }
    }

    fun updateWindowTitle(windowId: String, title: String) {
        _uiState.update { s ->
            s.copy(
                windows = s.windows.map { w ->
                    if (w.id == windowId && w.title != title) w.copy(title = title) else w
                }
            )
        }
    }

    fun onTaskbarWindowClick(win: WindowState) {
        val activeId = _uiState.value.activeWindowId
        if (win.isMinimized || activeId != win.id) {
            focusWindow(win.id)
        } else {
            minimizeWindow(win.id)
        }
    }

    fun peekDesktop() {
        WindowsSoundEngine.playClick()
        _uiState.update { s ->
            if (s.windows.isEmpty()) return@update s
            val allMinimized = s.windows.all { it.isMinimized }
            val nextWindows = s.windows.map { it.copy(isMinimized = !allMinimized) }
            val nextActive = if (allMinimized) nextWindows.maxByOrNull { it.zIndex }?.id else null
            s.copy(windows = nextWindows, activeWindowId = nextActive, activeFlyout = ActiveFlyout.NONE)
        }
    }

    // --- Virtual File System Operations ---
    private fun todayDate(): String = SimpleDateFormat("MM/dd/yyyy", Locale.getDefault()).format(Date())

    fun createFolder(name: String, location: FileLocation) {
        WindowsSoundEngine.playClick()
        val item = FileItem(
            id = "folder-${System.currentTimeMillis()}",
            name = name,
            isFolder = true,
            location = location,
            date = todayDate()
        )
        persistFiles(_uiState.value.files + item)
    }

    fun createFile(name: String, content: String, location: FileLocation) {
        WindowsSoundEngine.playClick()
        val extStr = name.substringAfterLast('.', "txt").uppercase()
        val ext = FileExtension.entries.firstOrNull { it.name == extStr } ?: FileExtension.TXT
        val item = FileItem(
            id = "file-${System.currentTimeMillis()}",
            name = name,
            isFolder = false,
            extension = ext,
            content = content,
            size = "${content.length} B",
            location = location,
            date = todayDate()
        )
        persistFiles(_uiState.value.files + item)
    }

    fun importPhotoFromPicker(uriString: String, displayName: String, location: FileLocation) {
        WindowsSoundEngine.playNotification()
        val item = FileItem(
            id = "img-${System.currentTimeMillis()}",
            name = displayName,
            isFolder = false,
            extension = FileExtension.JPG,
            imageUri = uriString,
            size = "Imported",
            location = location,
            date = todayDate()
        )
        persistFiles(_uiState.value.files + item)
    }

    fun recycleFile(fileId: String) {
        WindowsSoundEngine.playClick()
        persistFiles(_uiState.value.files.map { if (it.id == fileId) it.copy(isRecycled = true) else it })
    }

    fun restoreFile(fileId: String) {
        WindowsSoundEngine.playClick()
        persistFiles(_uiState.value.files.map { if (it.id == fileId) it.copy(isRecycled = false) else it })
    }

    fun restoreAllRecycled() {
        WindowsSoundEngine.playClick()
        persistFiles(_uiState.value.files.map { it.copy(isRecycled = false) })
    }

    fun emptyRecycleBin() {
        WindowsSoundEngine.playRecycleEmpty()
        persistFiles(_uiState.value.files.filterNot { it.isRecycled })
    }

    fun saveNotepadFile(name: String, content: String, fileId: String?): String {
        WindowsSoundEngine.playClick()
        val existing = fileId?.let { id -> _uiState.value.files.firstOrNull { it.id == id } }
        if (existing != null) {
            persistFiles(
                _uiState.value.files.map {
                    if (it.id == existing.id) {
                        it.copy(content = content, size = "${content.length} B", date = todayDate())
                    } else it
                }
            )
            return existing.id
        } else {
            val newId = "file-${System.currentTimeMillis()}"
            val item = FileItem(
                id = newId,
                name = name,
                isFolder = false,
                extension = FileExtension.TXT,
                content = content,
                size = "${content.length} B",
                location = FileLocation.DESKTOP,
                date = todayDate()
            )
            persistFiles(_uiState.value.files + item)
            return newId
        }
    }

    fun savePaintArtwork(bitmap: Bitmap, onSaved: (String) -> Unit) {
        viewModelScope.launch {
            val filename = "Artwork_${System.currentTimeMillis().toString().takeLast(4)}.png"
            val (path, sizeStr) = repository.saveBitmapToPng(filename, bitmap)
            val newItem = FileItem(
                id = "paint-${System.currentTimeMillis()}",
                name = filename,
                isFolder = false,
                extension = FileExtension.PNG,
                localFilePath = path,
                size = sizeStr,
                location = FileLocation.PICTURES,
                date = todayDate()
            )
            persistFiles(_uiState.value.files + newItem)
            WindowsSoundEngine.playNotification()
            onSaved(filename)
        }
    }

    private fun persistFiles(nextFiles: List<FileItem>) {
        _uiState.update { it.copy(files = nextFiles) }
        viewModelScope.launch { repository.saveFiles(nextFiles) }
    }

    // --- System Settings & Shell Overlays ---
    fun updateSettings(transform: (SystemSettings) -> SystemSettings) {
        val next = transform(_uiState.value.settings)
        WindowsSoundEngine.enabled = next.soundEffects
        WindowsSoundEngine.masterVolume = next.volume / 100f
        WindowsSoundEngine.muted = next.muted
        _uiState.update { it.copy(settings = next) }
        viewModelScope.launch { repository.saveSettings(next) }
    }

    fun setWallpaperFromPhoto(file: FileItem) {
        val wpId = when (file.imageResId) {
            com.example.R.drawable.win10_hero_wallpaper -> "hero"
            com.example.R.drawable.win10_nature_wallpaper -> "nature"
            com.example.R.drawable.win10_abstract_wallpaper -> "abstract"
            else -> "custom"
        }
        updateSettings {
            it.copy(
                wallpaperId = wpId,
                customWallpaperPath = if (wpId == "custom") file.localFilePath else null,
                customWallpaperUri = if (wpId == "custom") file.imageUri else null
            )
        }
        WindowsSoundEngine.playNotification()
    }

    fun clearNotifications() {
        WindowsSoundEngine.playClick()
        _uiState.update { it.copy(notifications = emptyList()) }
    }

    fun lockScreen() {
        WindowsSoundEngine.playClick()
        _uiState.update { it.copy(isLocked = true, activeFlyout = ActiveFlyout.NONE) }
    }

    fun unlockScreen() {
        WindowsSoundEngine.playStartup()
        _uiState.update { it.copy(isLocked = false) }
    }

    fun triggerPowerAction(mode: PowerMode) {
        WindowsSoundEngine.playClick()
        _uiState.update { it.copy(powerMode = mode, activeFlyout = ActiveFlyout.NONE) }
    }

    fun finishPowerAction() {
        val mode = _uiState.value.powerMode
        _uiState.update {
            it.copy(
                powerMode = null,
                isLocked = mode == PowerMode.SHUTDOWN,
                windows = emptyList(),
                activeWindowId = null
            )
        }
    }

    fun triggerBsod() {
        WindowsSoundEngine.playDing()
        _uiState.update { it.copy(isBsod = true, activeFlyout = ActiveFlyout.NONE) }
    }

    fun dismissBsod() {
        WindowsSoundEngine.playStartup()
        _uiState.update { it.copy(isBsod = false) }
    }

    // --- Groove Music Player Controls ---
    fun toggleMusicPlay() {
        WindowsSoundEngine.playClick()
        val ms = _musicState.value
        val track = ms.tracks.getOrNull(ms.currentTrackIndex) ?: return
        if (ms.isPlaying) {
            musicEngine.pause()
            _musicState.update { it.copy(isPlaying = false) }
        } else {
            musicEngine.setVolume(if (ms.isMuted) 0f else ms.volume)
            musicEngine.playTrack(track, ms.currentTimeSec)
            _musicState.update { it.copy(isPlaying = true, durationSec = track.durationSec) }
        }
    }

    fun playMusicTrack(index: Int) {
        WindowsSoundEngine.playClick()
        playTrackInternal(index)
    }

    private fun playTrackInternal(index: Int) {
        val ms = _musicState.value
        val track = ms.tracks.getOrNull(index) ?: return
        musicEngine.setVolume(if (ms.isMuted) 0f else ms.volume)
        musicEngine.playTrack(track, 0)
        _musicState.update {
            it.copy(
                currentTrackIndex = index,
                currentTimeSec = 0,
                durationSec = track.durationSec,
                isPlaying = true
            )
        }
    }

    fun nextMusicTrack() {
        WindowsSoundEngine.playClick()
        val ms = _musicState.value
        if (ms.tracks.isEmpty()) return
        val nextIdx = if (ms.isShuffle) {
            Random.nextInt(ms.tracks.size)
        } else {
            (ms.currentTrackIndex + 1) % ms.tracks.size
        }
        playTrackInternal(nextIdx)
    }

    fun prevMusicTrack() {
        WindowsSoundEngine.playClick()
        val ms = _musicState.value
        if (ms.tracks.isEmpty()) return
        if (ms.currentTimeSec > 3) {
            seekMusic(0)
            return
        }
        val prevIdx = (ms.currentTrackIndex - 1 + ms.tracks.size) % ms.tracks.size
        playTrackInternal(prevIdx)
    }

    private fun handleTrackFinished() {
        val ms = _musicState.value
        when (ms.repeatMode) {
            RepeatMode.ONE -> playTrackInternal(ms.currentTrackIndex)
            RepeatMode.ALL -> nextMusicTrack()
            RepeatMode.OFF -> {
                if (ms.currentTrackIndex < ms.tracks.lastIndex) {
                    playTrackInternal(ms.currentTrackIndex + 1)
                } else {
                    musicEngine.pause()
                    _musicState.update { it.copy(isPlaying = false) }
                }
            }
        }
    }

    fun seekMusic(sec: Int) {
        musicEngine.seek(sec)
        _musicState.update { it.copy(currentTimeSec = sec) }
    }

    fun setMusicVolume(vol: Float) {
        val clamped = vol.coerceIn(0f, 1f)
        musicEngine.setVolume(if (_musicState.value.isMuted) 0f else clamped)
        _musicState.update { it.copy(volume = clamped) }
    }

    fun toggleMusicMute() {
        WindowsSoundEngine.playClick()
        _musicState.update { state ->
            val nextMuted = !state.isMuted
            musicEngine.setVolume(if (nextMuted) 0f else state.volume)
            state.copy(isMuted = nextMuted)
        }
    }

    fun toggleMusicShuffle() {
        WindowsSoundEngine.playClick()
        _musicState.update { it.copy(isShuffle = !it.isShuffle) }
    }

    fun cycleMusicRepeat() {
        WindowsSoundEngine.playClick()
        _musicState.update {
            val next = when (it.repeatMode) {
                RepeatMode.OFF -> RepeatMode.ALL
                RepeatMode.ALL -> RepeatMode.ONE
                RepeatMode.ONE -> RepeatMode.OFF
            }
            it.copy(repeatMode = next)
        }
    }

    fun toggleTrackFavorite(trackId: String) {
        WindowsSoundEngine.playClick()
        _musicState.update { s ->
            s.copy(tracks = s.tracks.map { if (it.id == trackId) it.copy(isFavorite = !it.isFavorite) else it })
        }
    }

    fun addImportedMusicTrack(title: String, uriString: String) {
        WindowsSoundEngine.playNotification()
        val newTrack = GrooveTrack(
            id = "custom-${System.currentTimeMillis()}",
            title = title.substringBeforeLast('.'),
            artist = "Local Artist",
            album = "Imported Tracks",
            genre = "User Audio",
            year = 2026,
            durationSec = 180,
            trackKey = "custom",
            gradientStartHex = 0xFF059669,
            gradientEndHex = 0xFF115E59,
            isCustom = true,
            audioUri = uriString
        )
        _musicState.update { s -> s.copy(tracks = listOf(newTrack) + s.tracks) }
        playTrackInternal(0)
    }

    fun setEqBand(bandIdx: Int, gainDb: Int) {
        _musicState.update { s ->
            val next = s.eqGains.toMutableList()
            if (bandIdx in next.indices) next[bandIdx] = gainDb.coerceIn(-12, 12)
            musicEngine.setEqGains(next)
            s.copy(eqGains = next, activeEqPreset = "Custom")
        }
    }

    fun applyEqPreset(presetName: String) {
        WindowsSoundEngine.playClick()
        val gains = EQ_PRESETS[presetName] ?: return
        musicEngine.setEqGains(gains)
        _musicState.update { it.copy(eqGains = gains, activeEqPreset = presetName) }
    }

    override fun onCleared() {
        super.onCleared()
        musicEngine.release()
    }
}
