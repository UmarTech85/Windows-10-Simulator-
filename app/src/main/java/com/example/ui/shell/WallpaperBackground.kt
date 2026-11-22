package com.example.ui.shell

import androidx.compose.foundation.Image
import androidx.compose.foundation.background
import androidx.compose.foundation.layout.Box
import androidx.compose.foundation.layout.fillMaxSize
import androidx.compose.runtime.Composable
import androidx.compose.ui.Modifier
import androidx.compose.ui.graphics.Brush
import androidx.compose.ui.graphics.Color
import androidx.compose.ui.layout.ContentScale
import androidx.compose.ui.res.painterResource
import coil.compose.AsyncImage
import com.example.R
import com.example.model.SystemSettings
import com.example.model.WALLPAPER_OPTIONS
import java.io.File

@Composable
fun WallpaperBackground(
    settings: SystemSettings,
    modifier: Modifier = Modifier
) {
    Box(
        modifier = modifier
            .fillMaxSize()
            .background(
                Brush.linearGradient(
                    listOf(Color(0xFF091222), Color(0xFF004E92), Color(0xFF001F3F))
                )
            )
    ) {
        when {
            settings.wallpaperId == "custom" && !settings.customWallpaperPath.isNullOrBlank() -> {
                AsyncImage(
                    model = File(settings.customWallpaperPath),
                    contentDescription = "Desktop Wallpaper",
                    contentScale = ContentScale.Crop,
                    modifier = Modifier.fillMaxSize()
                )
            }
            settings.wallpaperId == "custom" && !settings.customWallpaperUri.isNullOrBlank() -> {
                AsyncImage(
                    model = settings.customWallpaperUri,
                    contentDescription = "Desktop Wallpaper",
                    contentScale = ContentScale.Crop,
                    modifier = Modifier.fillMaxSize()
                )
            }
            else -> {
                val resId = WALLPAPER_OPTIONS.firstOrNull { it.id == settings.wallpaperId }?.drawableRes
                    ?: R.drawable.win10_hero_wallpaper
                Image(
                    painter = painterResource(id = resId),
                    contentDescription = "Desktop Wallpaper",
                    contentScale = ContentScale.Crop,
                    modifier = Modifier.fillMaxSize()
                )
            }
        }
    }
}
