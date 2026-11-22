package com.example.data

import android.content.Context
import android.graphics.Bitmap
import com.example.R
import com.example.model.FileExtension
import com.example.model.FileItem
import com.example.model.FileLocation
import com.example.model.SystemSettings
import kotlinx.coroutines.Dispatchers
import kotlinx.coroutines.withContext
import org.json.JSONArray
import org.json.JSONObject
import java.io.File
import java.io.FileOutputStream

class FileSystemRepository(private val context: Context) {
    private val fsFile = File(context.filesDir, "win10_virtual_fs_v1.json")
    private val settingsFile = File(context.filesDir, "win10_system_settings_v1.json")
    private val artDir = File(context.filesDir, "paint_artworks").apply { mkdirs() }

    fun initialFiles(): List<FileItem> = listOf(
        FileItem(
            id = "f-welcome",
            name = "Welcome to Windows 10.txt",
            isFolder = false,
            extension = FileExtension.TXT,
            location = FileLocation.DESKTOP,
            size = "1.2 KB",
            date = "2026-10-24 09:00 AM",
            content = """Welcome to the Windows 10 Simulator!
========================================

Explore a faithful recreation of the Windows 10 experience:

Key Features:
- Start Menu with Live Tiles & All-Apps list
- Windows 10 Aero Snap (drag windows to top or sides)
- Working File Explorer with folder navigation & media import
- Microsoft Edge web browser with Wikipedia Reader, Edge Surf & Snake
- Full-featured MS Paint with drawing tools & save directly to Pictures
- Functional Notepad with save & status bar
- Fluent Calculator with history & memory
- Classic Command Prompt (cmd.exe) with interactive commands (try 'help', 'systeminfo', 'ping', 'color 0a', 'matrix', 'bsod')
- Authentic Minesweeper game with 3 difficulty modes
- Groove Music player with procedural synth audio, EQ & visualizer
- Task Manager with running processes & live CPU graph
- Settings app with custom wallpapers, accent colors, and Night Light
- Action Center with quick toggles and notifications

Have fun exploring and customizing your desktop!"""
        ),
        FileItem(
            id = "f-project-roadmap",
            name = "Project Roadmap.txt",
            isFolder = false,
            extension = FileExtension.TXT,
            location = FileLocation.DESKTOP,
            size = "840 B",
            date = "2026-10-23 04:15 PM",
            content = """Q4 2026 Engineering Roadmap
----------------------------
[X] Fluent Design System Rollout
[X] Virtual Audio Synthesizer Engine
[X] Aero Snap window docking mechanics
[ ] Cloud sync integration
[ ] DirectX 12 3D graphics benchmark"""
        ),
        FileItem(
            id = "f-hero-pic",
            name = "Hero Wallpaper.jpg",
            isFolder = false,
            extension = FileExtension.JPG,
            location = FileLocation.PICTURES,
            size = "2.4 MB",
            date = "2026-10-20 11:30 AM",
            imageResId = R.drawable.win10_hero_wallpaper
        ),
        FileItem(
            id = "f-lake-pic",
            name = "Moraine Alpine Lake.jpg",
            isFolder = false,
            extension = FileExtension.JPG,
            location = FileLocation.PICTURES,
            size = "3.1 MB",
            date = "2026-10-21 02:45 PM",
            imageResId = R.drawable.win10_nature_wallpaper
        ),
        FileItem(
            id = "f-abstract-pic",
            name = "Dark Abstract Ribbon.jpg",
            isFolder = false,
            extension = FileExtension.JPG,
            location = FileLocation.PICTURES,
            size = "2.8 MB",
            date = "2026-10-22 06:10 PM",
            imageResId = R.drawable.win10_abstract_wallpaper
        ),
        FileItem(
            id = "f-secret-memo",
            name = "Confidential Notes.txt",
            isFolder = false,
            extension = FileExtension.TXT,
            location = FileLocation.DOCUMENTS,
            size = "420 B",
            date = "2026-10-18 10:12 AM",
            content = """TOP SECRET - EYES ONLY
---------------------
Simulation Core: Online.
Cortana subsystem: Ready.
Windows Defender: All systems nominal.
Kernel version: 10.0.19045 Build 19045"""
        ),
        FileItem(
            id = "f-specs",
            name = "System Specs.txt",
            isFolder = false,
            extension = FileExtension.TXT,
            location = FileLocation.DOCUMENTS,
            size = "610 B",
            date = "2026-10-19 03:00 PM",
            content = """Device name: DESKTOP-WIN10SIM
Processor: Intel(R) Core(TM) i9-14900K @ 3.20GHz
Installed RAM: 32.0 GB (31.8 GB usable)
System type: 64-bit operating system, x64-based processor
Edition: Windows 10 Pro
Version: 22H2
OS build: 19045.3803
Experience: Windows Feature Experience Pack 1000.19045.1000.0"""
        ),
        FileItem(
            id = "f-sample-track1",
            name = "Lofi Chill Beats.mp3",
            isFolder = false,
            extension = FileExtension.MP3,
            location = FileLocation.MUSIC,
            size = "4.2 MB",
            date = "2026-10-15 08:00 PM",
            content = "track_lofi"
        ),
        FileItem(
            id = "f-sample-track2",
            name = "Retro 80s Synth.mp3",
            isFolder = false,
            extension = FileExtension.MP3,
            location = FileLocation.MUSIC,
            size = "3.8 MB",
            date = "2026-10-16 09:20 PM",
            content = "track_synth"
        ),
        FileItem(
            id = "f-downloads-setup",
            name = "Edge_Browser_Installer.exe",
            isFolder = false,
            extension = FileExtension.EXE,
            location = FileLocation.DOWNLOADS,
            size = "88.4 MB",
            date = "2026-10-24 07:15 AM",
            content = "binary"
        )
    )

    suspend fun loadFiles(): List<FileItem> = withContext(Dispatchers.IO) {
        try {
            if (fsFile.exists()) {
                val arr = JSONArray(fsFile.readText())
                val list = mutableListOf<FileItem>()
                for (i in 0 until arr.length()) {
                    val o = arr.getJSONObject(i)
                    val extStr = o.optString("extension", "")
                    val ext = FileExtension.entries.firstOrNull { it.name == extStr }
                    val locStr = o.optString("location", "DESKTOP")
                    val loc = FileLocation.entries.firstOrNull { it.name == locStr } ?: FileLocation.DESKTOP
                    val imgRes = if (o.has("imageResKey")) {
                        when (o.optString("imageResKey")) {
                            "hero" -> R.drawable.win10_hero_wallpaper
                            "nature" -> R.drawable.win10_nature_wallpaper
                            "abstract" -> R.drawable.win10_abstract_wallpaper
                            else -> null
                        }
                    } else null

                    list.add(
                        FileItem(
                            id = o.getString("id"),
                            name = o.getString("name"),
                            isFolder = o.optBoolean("isFolder", false),
                            extension = ext,
                            content = o.optString("content", ""),
                            imageResId = imgRes,
                            localFilePath = o.optString("localFilePath", "").ifEmpty { null },
                            imageUri = o.optString("imageUri", "").ifEmpty { null },
                            size = o.optString("size", "--"),
                            date = o.optString("date", ""),
                            location = loc,
                            isRecycled = o.optBoolean("isRecycled", false)
                        )
                    )
                }
                if (list.isNotEmpty()) return@withContext list
            }
        } catch (_: Throwable) {
        }
        val defaults = initialFiles()
        saveFiles(defaults)
        defaults
    }

    suspend fun saveFiles(files: List<FileItem>) = withContext(Dispatchers.IO) {
        try {
            val arr = JSONArray()
            files.forEach { f ->
                val o = JSONObject().apply {
                    put("id", f.id)
                    put("name", f.name)
                    put("isFolder", f.isFolder)
                    put("extension", f.extension?.name ?: "")
                    put("content", f.content)
                    when (f.imageResId) {
                        R.drawable.win10_hero_wallpaper -> put("imageResKey", "hero")
                        R.drawable.win10_nature_wallpaper -> put("imageResKey", "nature")
                        R.drawable.win10_abstract_wallpaper -> put("imageResKey", "abstract")
                    }
                    put("localFilePath", f.localFilePath ?: "")
                    put("imageUri", f.imageUri ?: "")
                    put("size", f.size)
                    put("date", f.date)
                    put("location", f.location.name)
                    put("isRecycled", f.isRecycled)
                }
                arr.put(o)
            }
            fsFile.writeText(arr.toString())
        } catch (_: Throwable) {
        }
    }

    suspend fun loadSettings(): SystemSettings = withContext(Dispatchers.IO) {
        try {
            if (settingsFile.exists()) {
                val o = JSONObject(settingsFile.readText())
                return@withContext SystemSettings(
                    wallpaperId = o.optString("wallpaperId", "hero"),
                    customWallpaperPath = o.optString("customWallpaperPath", "").ifEmpty { null },
                    customWallpaperUri = o.optString("customWallpaperUri", "").ifEmpty { null },
                    accentColorLong = o.optLong("accentColorLong", 0xFF0078D7),
                    isDarkTheme = o.optBoolean("isDarkTheme", true),
                    nightLight = o.optBoolean("nightLight", false),
                    volume = o.optInt("volume", 75),
                    muted = o.optBoolean("muted", false),
                    wifiConnected = o.optBoolean("wifiConnected", true),
                    networkName = o.optString("networkName", "Home_WiFi_5G"),
                    soundEffects = o.optBoolean("soundEffects", true),
                    lockScreenEnabled = o.optBoolean("lockScreenEnabled", false)
                )
            }
        } catch (_: Throwable) {
        }
        SystemSettings()
    }

    suspend fun saveSettings(settings: SystemSettings) = withContext(Dispatchers.IO) {
        try {
            val o = JSONObject().apply {
                put("wallpaperId", settings.wallpaperId)
                put("customWallpaperPath", settings.customWallpaperPath ?: "")
                put("customWallpaperUri", settings.customWallpaperUri ?: "")
                put("accentColorLong", settings.accentColorLong)
                put("isDarkTheme", settings.isDarkTheme)
                put("nightLight", settings.nightLight)
                put("volume", settings.volume)
                put("muted", settings.muted)
                put("wifiConnected", settings.wifiConnected)
                put("networkName", settings.networkName)
                put("soundEffects", settings.soundEffects)
                put("lockScreenEnabled", settings.lockScreenEnabled)
            }
            settingsFile.writeText(o.toString())
        } catch (_: Throwable) {
        }
    }

    suspend fun saveBitmapToPng(filename: String, bitmap: Bitmap): Pair<String, String> = withContext(Dispatchers.IO) {
        val target = File(artDir, filename)
        FileOutputStream(target).use { out ->
            bitmap.compress(Bitmap.CompressFormat.PNG, 100, out)
        }
        val sizeKb = (target.length() / 1024).coerceAtLeast(1)
        target.absolutePath to "$sizeKb KB"
    }
}
