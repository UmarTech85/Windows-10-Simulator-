package com.example.model

import androidx.annotation.DrawableRes
import androidx.compose.ui.graphics.Color
import com.example.R

enum class AppId {
    EXPLORER,
    EDGE,
    NOTEPAD,
    CALC,
    CMD,
    PAINT,
    MINESWEEPER,
    PHOTOS,
    GROOVE,
    TASKMANAGER,
    SETTINGS,
    RECYCLEBIN
}

data class AppDefinition(
    val id: AppId,
    val name: String,
    val category: String,
    val defaultTitle: String,
    val defaultWidthDp: Float,
    val defaultHeightDp: Float,
    val minWidthDp: Float,
    val minHeightDp: Float,
    val isPinnedToTaskbar: Boolean,
    val tileColorHex: Long
)

object AppRegistry {
    val apps: Map<AppId, AppDefinition> = mapOf(
        AppId.EXPLORER to AppDefinition(
            id = AppId.EXPLORER,
            name = "File Explorer",
            category = "System",
            defaultTitle = "File Explorer",
            defaultWidthDp = 640f,
            defaultHeightDp = 440f,
            minWidthDp = 320f,
            minHeightDp = 260f,
            isPinnedToTaskbar = true,
            tileColorHex = 0xFFCA5010
        ),
        AppId.EDGE to AppDefinition(
            id = AppId.EDGE,
            name = "Microsoft Edge",
            category = "Internet",
            defaultTitle = "Microsoft Edge",
            defaultWidthDp = 700f,
            defaultHeightDp = 480f,
            minWidthDp = 320f,
            minHeightDp = 280f,
            isPinnedToTaskbar = true,
            tileColorHex = 0xFF0078D7
        ),
        AppId.NOTEPAD to AppDefinition(
            id = AppId.NOTEPAD,
            name = "Notepad",
            category = "Accessories",
            defaultTitle = "Untitled - Notepad",
            defaultWidthDp = 520f,
            defaultHeightDp = 400f,
            minWidthDp = 280f,
            minHeightDp = 220f,
            isPinnedToTaskbar = true,
            tileColorHex = 0xFF0369A1
        ),
        AppId.CALC to AppDefinition(
            id = AppId.CALC,
            name = "Calculator",
            category = "Accessories",
            defaultTitle = "Calculator",
            defaultWidthDp = 330f,
            defaultHeightDp = 470f,
            minWidthDp = 290f,
            minHeightDp = 410f,
            isPinnedToTaskbar = true,
            tileColorHex = 0xFF4A5568
        ),
        AppId.GROOVE to AppDefinition(
            id = AppId.GROOVE,
            name = "Groove Music",
            category = "Media",
            defaultTitle = "Groove Music",
            defaultWidthDp = 640f,
            defaultHeightDp = 450f,
            minWidthDp = 320f,
            minHeightDp = 300f,
            isPinnedToTaskbar = true,
            tileColorHex = 0xFF4F2D7F
        ),
        AppId.CMD to AppDefinition(
            id = AppId.CMD,
            name = "Command Prompt",
            category = "System",
            defaultTitle = "Command Prompt",
            defaultWidthDp = 580f,
            defaultHeightDp = 380f,
            minWidthDp = 300f,
            minHeightDp = 240f,
            isPinnedToTaskbar = false,
            tileColorHex = 0xFF1F2937
        ),
        AppId.PAINT to AppDefinition(
            id = AppId.PAINT,
            name = "Paint",
            category = "Accessories",
            defaultTitle = "Untitled - Paint",
            defaultWidthDp = 660f,
            defaultHeightDp = 470f,
            minWidthDp = 320f,
            minHeightDp = 300f,
            isPinnedToTaskbar = false,
            tileColorHex = 0xFFD13438
        ),
        AppId.MINESWEEPER to AppDefinition(
            id = AppId.MINESWEEPER,
            name = "Minesweeper",
            category = "Games",
            defaultTitle = "Minesweeper",
            defaultWidthDp = 370f,
            defaultHeightDp = 460f,
            minWidthDp = 300f,
            minHeightDp = 380f,
            isPinnedToTaskbar = false,
            tileColorHex = 0xFF107C41
        ),
        AppId.PHOTOS to AppDefinition(
            id = AppId.PHOTOS,
            name = "Photos",
            category = "Media",
            defaultTitle = "Photos",
            defaultWidthDp = 620f,
            defaultHeightDp = 440f,
            minWidthDp = 320f,
            minHeightDp = 260f,
            isPinnedToTaskbar = false,
            tileColorHex = 0xFF008272
        ),
        AppId.TASKMANAGER to AppDefinition(
            id = AppId.TASKMANAGER,
            name = "Task Manager",
            category = "System",
            defaultTitle = "Task Manager",
            defaultWidthDp = 580f,
            defaultHeightDp = 430f,
            minWidthDp = 320f,
            minHeightDp = 280f,
            isPinnedToTaskbar = false,
            tileColorHex = 0xFF0F766E
        ),
        AppId.SETTINGS to AppDefinition(
            id = AppId.SETTINGS,
            name = "Settings",
            category = "System",
            defaultTitle = "Settings",
            defaultWidthDp = 660f,
            defaultHeightDp = 460f,
            minWidthDp = 320f,
            minHeightDp = 300f,
            isPinnedToTaskbar = false,
            tileColorHex = 0xFF0078D7
        ),
        AppId.RECYCLEBIN to AppDefinition(
            id = AppId.RECYCLEBIN,
            name = "Recycle Bin",
            category = "System",
            defaultTitle = "Recycle Bin",
            defaultWidthDp = 580f,
            defaultHeightDp = 420f,
            minWidthDp = 300f,
            minHeightDp = 260f,
            isPinnedToTaskbar = false,
            tileColorHex = 0xFF475569
        )
    )

    fun get(id: AppId): AppDefinition = apps.getValue(id)
}

enum class FileLocation(val displayName: String) {
    DESKTOP("Desktop"),
    DOCUMENTS("Documents"),
    PICTURES("Pictures"),
    DOWNLOADS("Downloads"),
    MUSIC("Music"),
    RECYCLEBIN("Recycle Bin")
}

enum class FileExtension {
    TXT, PNG, JPG, DOC, PDF, MP3, EXE
}

data class FileItem(
    val id: String,
    val name: String,
    val isFolder: Boolean,
    val extension: FileExtension? = null,
    val content: String = "",
    val imageResId: Int? = null,
    val localFilePath: String? = null,
    val imageUri: String? = null,
    val size: String = "--",
    val date: String,
    val location: FileLocation,
    val isRecycled: Boolean = false
)

enum class SnapPosition {
    LEFT, RIGHT
}

data class WindowBounds(
    val xDp: Float,
    val yDp: Float,
    val widthDp: Float,
    val heightDp: Float
)

data class WindowState(
    val id: String,
    val appId: AppId,
    val title: String,
    val xDp: Float,
    val yDp: Float,
    val widthDp: Float,
    val heightDp: Float,
    val minWidthDp: Float,
    val minHeightDp: Float,
    val isMinimized: Boolean = false,
    val isMaximized: Boolean = false,
    val snappedPosition: SnapPosition? = null,
    val prevBounds: WindowBounds? = null,
    val zIndex: Int = 1,
    val initialFileId: String? = null,
    val initialLocation: FileLocation? = null,
    val initialUrl: String? = null,
    val initialQuery: String? = null
)

data class SystemNotification(
    val id: String,
    val title: String,
    val message: String,
    val time: String,
    val source: String,
    val read: Boolean = false,
    val actionApp: AppId? = null
)

data class WallpaperOption(
    val id: String,
    val name: String,
    @DrawableRes val drawableRes: Int
)

data class AccentColorOption(
    val name: String,
    val colorLong: Long
)

val WALLPAPER_OPTIONS = listOf(
    WallpaperOption("hero", "Windows 10 Hero (Default)", R.drawable.win10_hero_wallpaper),
    WallpaperOption("nature", "Moraine Alpine Lake Spotlight", R.drawable.win10_nature_wallpaper),
    WallpaperOption("abstract", "Dark Abstract Ribbon", R.drawable.win10_abstract_wallpaper)
)

val ACCENT_COLOR_OPTIONS = listOf(
    AccentColorOption("Windows Blue", 0xFF0078D7),
    AccentColorOption("Emerald", 0xFF107C41),
    AccentColorOption("Crimson", 0xFFE81123),
    AccentColorOption("Royal Purple", 0xFF744DA9),
    AccentColorOption("Sunset Orange", 0xFFD83B01),
    AccentColorOption("Modern Charcoal", 0xFF2D3748)
)

data class SystemSettings(
    val wallpaperId: String = "hero",
    val customWallpaperPath: String? = null,
    val customWallpaperUri: String? = null,
    val accentColorLong: Long = 0xFF0078D7,
    val isDarkTheme: Boolean = true,
    val nightLight: Boolean = false,
    val volume: Int = 75,
    val muted: Boolean = false,
    val wifiConnected: Boolean = true,
    val networkName: String = "Home_WiFi_5G",
    val soundEffects: Boolean = true,
    val lockScreenEnabled: Boolean = false
) {
    val accentColor: Color get() = Color(accentColorLong)
}

enum class RepeatMode {
    OFF, ALL, ONE
}

data class GrooveTrack(
    val id: String,
    val title: String,
    val artist: String,
    val album: String,
    val genre: String,
    val year: Int,
    val durationSec: Int,
    val trackKey: String,
    val isFavorite: Boolean = false,
    val gradientStartHex: Long,
    val gradientEndHex: Long,
    val isCustom: Boolean = false,
    val audioUri: String? = null
)

data class MusicPlayerUiState(
    val tracks: List<GrooveTrack> = emptyList(),
    val currentTrackIndex: Int = 0,
    val isPlaying: Boolean = false,
    val currentTimeSec: Int = 0,
    val durationSec: Int = 210,
    val volume: Float = 0.65f,
    val isMuted: Boolean = false,
    val isShuffle: Boolean = false,
    val repeatMode: RepeatMode = RepeatMode.ALL,
    val eqGains: List<Int> = listOf(0, 0, 0, 0, 0),
    val activeEqPreset: String = "Flat",
    val spectrumBars: List<Float> = List(24) { 0.1f },
    val waveSamples: List<Float> = List(48) { 0f }
)

enum class DesktopIconSize {
    SMALL, NORMAL, LARGE
}

enum class PowerMode {
    SHUTDOWN, RESTART
}
