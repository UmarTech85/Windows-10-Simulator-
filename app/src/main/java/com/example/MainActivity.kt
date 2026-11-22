package com.example

import android.graphics.Color as AndroidColor
import android.os.Bundle
import androidx.activity.ComponentActivity
import androidx.activity.SystemBarStyle
import androidx.activity.compose.BackHandler
import androidx.activity.compose.setContent
import androidx.activity.enableEdgeToEdge
import androidx.compose.foundation.background
import androidx.compose.foundation.layout.Box
import androidx.compose.foundation.layout.BoxWithConstraints
import androidx.compose.foundation.layout.Column
import androidx.compose.foundation.layout.fillMaxSize
import androidx.compose.foundation.layout.fillMaxWidth
import androidx.compose.runtime.Composable
import androidx.compose.runtime.LaunchedEffect
import androidx.compose.runtime.getValue
import androidx.compose.ui.Alignment
import androidx.compose.ui.Modifier
import androidx.compose.ui.graphics.Color
import androidx.lifecycle.compose.collectAsStateWithLifecycle
import androidx.lifecycle.viewmodel.compose.viewModel
import com.example.model.AppId
import com.example.ui.apps.CalculatorApp
import com.example.ui.apps.CommandPromptApp
import com.example.ui.apps.EdgeBrowserApp
import com.example.ui.apps.FileExplorerApp
import com.example.ui.apps.GrooveMusicApp
import com.example.ui.apps.MinesweeperApp
import com.example.ui.apps.NotepadApp
import com.example.ui.apps.PaintApp
import com.example.ui.apps.PhotosApp
import com.example.ui.apps.RecycleBinApp
import com.example.ui.apps.SettingsApp
import com.example.ui.apps.TaskManagerApp
import com.example.ui.shell.ActionCenterOverlay
import com.example.ui.shell.BsodOverlay
import com.example.ui.shell.CalendarFlyout
import com.example.ui.shell.DesktopMediaWidget
import com.example.ui.shell.DesktopScreen
import com.example.ui.shell.LockScreenOverlay
import com.example.ui.shell.PowerScreenOverlay
import com.example.ui.shell.SearchOverlay
import com.example.ui.shell.StartMenuOverlay
import com.example.ui.shell.Taskbar
import com.example.ui.shell.VolumeFlyout
import com.example.ui.shell.WifiFlyout
import com.example.ui.shell.WindowFrame
import com.example.ui.theme.Win10SimulatorTheme
import com.example.viewmodel.ActiveFlyout
import com.example.viewmodel.WindowsOsViewModel

class MainActivity : ComponentActivity() {
    override fun onCreate(savedInstanceState: Bundle?) {
        super.onCreate(savedInstanceState)
        enableEdgeToEdge(
            statusBarStyle = SystemBarStyle.dark(AndroidColor.TRANSPARENT),
            navigationBarStyle = SystemBarStyle.dark(AndroidColor.argb(0xEB, 0x0C, 0x0C, 0x0C))
        )
        setContent {
            Windows10SimulatorRoot()
        }
    }
}

@Composable
fun Windows10SimulatorRoot(
    viewModel: WindowsOsViewModel = viewModel()
) {
    val osState by viewModel.uiState.collectAsStateWithLifecycle()
    val musicState by viewModel.musicState.collectAsStateWithLifecycle()

    // Handle Android Back gesture within the simulated OS
    val hasActiveOverlay = osState.isBsod ||
        osState.activeFlyout != ActiveFlyout.NONE ||
        osState.windows.any { !it.isMinimized }

    BackHandler(enabled = hasActiveOverlay) {
        when {
            osState.isBsod -> viewModel.dismissBsod()
            osState.activeFlyout != ActiveFlyout.NONE -> viewModel.closeFlyouts()
            else -> {
                val topWin = osState.windows.filterNot { it.isMinimized }.maxByOrNull { it.zIndex }
                if (topWin != null) viewModel.closeWindow(topWin.id)
            }
        }
    }

    Win10SimulatorTheme(
        darkTheme = osState.settings.isDarkTheme,
        accentColor = osState.settings.accentColor
    ) {
        BoxWithConstraints(modifier = Modifier.fillMaxSize()) {
            val totalW = maxWidth.value
            val totalH = maxHeight.value
            val isWideScreen = totalW >= 600f

            LaunchedEffect(totalW, totalH) {
                viewModel.updateViewportSize(totalW, totalH)
            }

            Column(modifier = Modifier.fillMaxSize()) {
                // Desktop + Windows + Flyouts Workspace Area
                BoxWithConstraints(
                    modifier = Modifier
                        .weight(1f)
                        .fillMaxWidth()
                ) {
                    val areaW = maxWidth.value
                    val areaH = maxHeight.value

                    DesktopScreen(
                        settings = osState.settings,
                        files = osState.files,
                        selectedIconId = osState.selectedDesktopIconId,
                        iconSize = osState.desktopIconSize,
                        onSelectIcon = viewModel::selectDesktopIcon,
                        onOpenApp = { viewModel.launchApp(it) },
                        onOpenFile = viewModel::openFile,
                        onCreateFolder = viewModel::createFolder,
                        onCreateFile = viewModel::createFile,
                        onCycleIconSize = viewModel::cycleDesktopIconSize,
                        onDismissFlyouts = viewModel::closeFlyouts
                    )

                    // Stacked Application Windows sorted by Z-Index
                    val sortedWindows = osState.windows.sortedBy { it.zIndex }
                    sortedWindows.forEach { win ->
                        WindowFrame(
                            window = win,
                            isActive = osState.activeWindowId == win.id,
                            accentColor = osState.settings.accentColor,
                            isDarkTheme = osState.settings.isDarkTheme,
                            areaWidthDp = areaW,
                            areaHeightDp = areaH,
                            onFocus = { viewModel.focusWindow(win.id) },
                            onClose = { viewModel.closeWindow(win.id) },
                            onMinimize = { viewModel.minimizeWindow(win.id) },
                            onToggleMaximize = { viewModel.toggleMaximizeWindow(win.id) },
                            onUpdateBounds = { x, y, w, h, snap ->
                                viewModel.updateWindowBounds(win.id, x, y, w, h, snap)
                            },
                            onSnap = { snap -> viewModel.snapWindow(win.id, snap) }
                        ) {
                            when (win.appId) {
                                AppId.EXPLORER -> FileExplorerApp(
                                    files = osState.files,
                                    initialLocation = win.initialLocation,
                                    isDarkTheme = osState.settings.isDarkTheme,
                                    accentColor = osState.settings.accentColor,
                                    onOpenFile = viewModel::openFile,
                                    onCreateFolder = viewModel::createFolder,
                                    onCreateFile = viewModel::createFile,
                                    onImportPhoto = viewModel::importPhotoFromPicker,
                                    onDeleteFile = viewModel::recycleFile,
                                    onUpdateTitle = { viewModel.updateWindowTitle(win.id, it) }
                                )
                                AppId.NOTEPAD -> NotepadApp(
                                    files = osState.files,
                                    initialFileId = win.initialFileId,
                                    isDarkTheme = osState.settings.isDarkTheme,
                                    onSaveFile = viewModel::saveNotepadFile,
                                    onUpdateTitle = { viewModel.updateWindowTitle(win.id, it) },
                                    onClose = { viewModel.closeWindow(win.id) }
                                )
                                AppId.CALC -> CalculatorApp(
                                    isDarkTheme = osState.settings.isDarkTheme,
                                    accentColor = osState.settings.accentColor
                                )
                                AppId.CMD -> CommandPromptApp(
                                    files = osState.files,
                                    onOpenApp = { viewModel.launchApp(it) },
                                    onCreateFolder = viewModel::createFolder,
                                    onTriggerBsod = viewModel::triggerBsod,
                                    onClose = { viewModel.closeWindow(win.id) }
                                )
                                AppId.PAINT -> PaintApp(
                                    isDarkTheme = osState.settings.isDarkTheme,
                                    accentColor = osState.settings.accentColor,
                                    onSaveArtwork = viewModel::savePaintArtwork
                                )
                                AppId.MINESWEEPER -> MinesweeperApp()
                                AppId.PHOTOS -> PhotosApp(
                                    files = osState.files,
                                    initialFileId = win.initialFileId,
                                    accentColor = osState.settings.accentColor,
                                    onSetWallpaper = viewModel::setWallpaperFromPhoto,
                                    onDeleteFile = viewModel::recycleFile,
                                    onUpdateTitle = { viewModel.updateWindowTitle(win.id, it) }
                                )
                                AppId.GROOVE -> GrooveMusicApp(
                                    musicState = musicState,
                                    accentColor = osState.settings.accentColor,
                                    onTogglePlay = viewModel::toggleMusicPlay,
                                    onPlayTrack = viewModel::playMusicTrack,
                                    onNext = viewModel::nextMusicTrack,
                                    onPrev = viewModel::prevMusicTrack,
                                    onSeek = viewModel::seekMusic,
                                    onVolumeChange = viewModel::setMusicVolume,
                                    onToggleMute = viewModel::toggleMusicMute,
                                    onToggleShuffle = viewModel::toggleMusicShuffle,
                                    onCycleRepeat = viewModel::cycleMusicRepeat,
                                    onToggleFavorite = viewModel::toggleTrackFavorite,
                                    onImportAudio = viewModel::addImportedMusicTrack,
                                    onSetEqBand = viewModel::setEqBand,
                                    onApplyEqPreset = viewModel::applyEqPreset
                                )
                                AppId.EDGE -> EdgeBrowserApp(
                                    initialUrl = win.initialUrl,
                                    initialQuery = win.initialQuery,
                                    isDarkTheme = osState.settings.isDarkTheme,
                                    accentColor = osState.settings.accentColor,
                                    onUpdateTitle = { viewModel.updateWindowTitle(win.id, it) }
                                )
                                AppId.TASKMANAGER -> TaskManagerApp(
                                    windows = osState.windows,
                                    isDarkTheme = osState.settings.isDarkTheme,
                                    accentColor = osState.settings.accentColor,
                                    onCloseWindow = viewModel::closeWindow
                                )
                                AppId.SETTINGS -> SettingsApp(
                                    settings = osState.settings,
                                    onUpdateSettings = viewModel::updateSettings
                                )
                                AppId.RECYCLEBIN -> RecycleBinApp(
                                    files = osState.files,
                                    isDarkTheme = osState.settings.isDarkTheme,
                                    accentColor = osState.settings.accentColor,
                                    onRestoreFile = viewModel::restoreFile,
                                    onRestoreAll = viewModel::restoreAllRecycled,
                                    onEmptyBin = viewModel::emptyRecycleBin
                                )
                            }
                        }
                    }

                    // Floating Background Media Widget (when Groove is playing & minimized/closed)
                    val grooveOpenAndVisible = osState.windows.any { it.appId == AppId.GROOVE && !it.isMinimized }
                    DesktopMediaWidget(
                        musicState = musicState,
                        grooveIsOpenAndVisible = grooveOpenAndVisible,
                        onTogglePlay = viewModel::toggleMusicPlay,
                        onPrev = viewModel::prevMusicTrack,
                        onNext = viewModel::nextMusicTrack,
                        onOpenGroove = { viewModel.launchApp(AppId.GROOVE) },
                        modifier = Modifier.align(Alignment.TopEnd)
                    )

                    // Shell Flyouts
                    StartMenuOverlay(
                        visible = osState.activeFlyout == ActiveFlyout.START,
                        accentColor = osState.settings.accentColor,
                        isWideScreen = isWideScreen,
                        musicState = musicState,
                        onDismiss = viewModel::closeFlyouts,
                        onOpenApp = { appId, loc -> viewModel.launchApp(appId, location = loc) },
                        onLock = viewModel::lockScreen,
                        onPower = viewModel::triggerPowerAction,
                        onToggleMusicPlay = viewModel::toggleMusicPlay
                    )

                    SearchOverlay(
                        visible = osState.activeFlyout == ActiveFlyout.SEARCH,
                        files = osState.files,
                        accentColor = osState.settings.accentColor,
                        onDismiss = viewModel::closeFlyouts,
                        onOpenApp = { appId, q -> viewModel.launchApp(appId, initialQuery = q) },
                        onOpenFile = viewModel::openFile
                    )

                    ActionCenterOverlay(
                        visible = osState.activeFlyout == ActiveFlyout.ACTION_CENTER,
                        settings = osState.settings,
                        notifications = osState.notifications,
                        onDismiss = viewModel::closeFlyouts,
                        onClearNotifications = viewModel::clearNotifications,
                        onToggleWifi = {
                            viewModel.updateSettings { it.copy(wifiConnected = !it.wifiConnected) }
                        },
                        onToggleNightLight = {
                            viewModel.updateSettings { it.copy(nightLight = !it.nightLight) }
                        },
                        onOpenSettings = { viewModel.launchApp(AppId.SETTINGS) },
                        onOpenSnipPaint = { viewModel.launchApp(AppId.PAINT) },
                        onOpenNotificationApp = { viewModel.launchApp(it) }
                    )

                    CalendarFlyout(
                        visible = osState.activeFlyout == ActiveFlyout.CALENDAR,
                        accentColor = osState.settings.accentColor,
                        onDismiss = viewModel::closeFlyouts
                    )

                    VolumeFlyout(
                        visible = osState.activeFlyout == ActiveFlyout.VOLUME,
                        volume = osState.settings.volume,
                        muted = osState.settings.muted,
                        accentColor = osState.settings.accentColor,
                        onDismiss = viewModel::closeFlyouts,
                        onVolumeChange = { v ->
                            viewModel.updateSettings { it.copy(volume = v, muted = v == 0) }
                        },
                        onToggleMute = {
                            viewModel.updateSettings { it.copy(muted = !it.muted) }
                        }
                    )

                    WifiFlyout(
                        visible = osState.activeFlyout == ActiveFlyout.WIFI,
                        wifiConnected = osState.settings.wifiConnected,
                        networkName = osState.settings.networkName,
                        accentColor = osState.settings.accentColor,
                        onDismiss = viewModel::closeFlyouts,
                        onSelectNetwork = { ssid, connected ->
                            viewModel.updateSettings { it.copy(networkName = ssid, wifiConnected = connected) }
                        }
                    )
                }

                // Bottom Windows 10 Taskbar
                Taskbar(
                    windows = osState.windows,
                    activeWindowId = osState.activeWindowId,
                    notifications = osState.notifications,
                    activeFlyout = osState.activeFlyout,
                    volume = osState.settings.volume,
                    muted = osState.settings.muted,
                    wifiConnected = osState.settings.wifiConnected,
                    accentColor = osState.settings.accentColor,
                    isWideScreen = isWideScreen,
                    onToggleFlyout = viewModel::toggleFlyout,
                    onAppClick = { viewModel.launchApp(it) },
                    onWindowClick = viewModel::onTaskbarWindowClick,
                    onCloseWindow = viewModel::closeWindow,
                    onPeekDesktop = viewModel::peekDesktop
                )
            }

            // Warm Night Light Tint Overlay
            if (osState.settings.nightLight) {
                Box(
                    modifier = Modifier
                        .fillMaxSize()
                        .background(Color(0x38FF8C00))
                )
            }

            // Fullscreen System Overlays
            LockScreenOverlay(
                visible = osState.isLocked,
                accentColor = osState.settings.accentColor,
                onUnlock = viewModel::unlockScreen
            )

            PowerScreenOverlay(
                powerMode = osState.powerMode,
                onDone = viewModel::finishPowerAction
            )

            BsodOverlay(
                visible = osState.isBsod,
                onDismiss = viewModel::dismissBsod
            )
        }
    }
}
