package com.example.ui.components

import androidx.compose.foundation.Canvas
import androidx.compose.foundation.background
import androidx.compose.foundation.layout.Box
import androidx.compose.foundation.layout.size
import androidx.compose.foundation.shape.CircleShape
import androidx.compose.foundation.shape.RoundedCornerShape
import androidx.compose.material.icons.Icons
import androidx.compose.material.icons.filled.Calculate
import androidx.compose.material.icons.filled.Delete
import androidx.compose.material.icons.filled.DeleteOutline
import androidx.compose.material.icons.filled.Description
import androidx.compose.material.icons.filled.Folder
import androidx.compose.material.icons.filled.Headphones
import androidx.compose.material.icons.filled.Image
import androidx.compose.material.icons.filled.Memory
import androidx.compose.material.icons.filled.MusicNote
import androidx.compose.material.icons.filled.Palette
import androidx.compose.material.icons.filled.Public
import androidx.compose.material.icons.filled.Settings
import androidx.compose.material.icons.filled.ShowChart
import androidx.compose.material.icons.filled.Terminal
import androidx.compose.material.icons.filled.Warning
import androidx.compose.material3.Icon
import androidx.compose.runtime.Composable
import androidx.compose.ui.Alignment
import androidx.compose.ui.Modifier
import androidx.compose.ui.draw.clip
import androidx.compose.ui.graphics.Brush
import androidx.compose.ui.graphics.Color
import androidx.compose.ui.graphics.Path
import androidx.compose.ui.unit.Dp
import androidx.compose.ui.unit.dp
import com.example.model.AppId
import com.example.model.FileExtension

@Composable
fun WindowsLogoIcon(
    size: Dp = 18.dp,
    color: Color = Color(0xFF00ADEF),
    modifier: Modifier = Modifier
) {
    Canvas(modifier = modifier.size(size)) {
        val w = this.size.width
        val h = this.size.height
        val gap = w * 0.06f

        val topLeft = Path().apply {
            moveTo(0f, h * 0.14f)
            lineTo(w * 0.44f, h * 0.08f)
            lineTo(w * 0.44f, h * 0.47f)
            lineTo(0f, h * 0.47f)
            close()
        }
        val bottomLeft = Path().apply {
            moveTo(0f, h * 0.53f)
            lineTo(w * 0.44f, h * 0.53f)
            lineTo(w * 0.44f, h * 0.92f)
            lineTo(0f, h * 0.86f)
            close()
        }
        val topRight = Path().apply {
            moveTo(w * 0.44f + gap, h * 0.07f)
            lineTo(w, 0f)
            lineTo(w, h * 0.47f)
            lineTo(w * 0.44f + gap, h * 0.47f)
            close()
        }
        val bottomRight = Path().apply {
            moveTo(w * 0.44f + gap, h * 0.53f)
            lineTo(w, h * 0.53f)
            lineTo(w, h)
            lineTo(w * 0.44f + gap, h * 0.93f)
            close()
        }

        drawPath(topLeft, color)
        drawPath(bottomLeft, color)
        drawPath(topRight, color)
        drawPath(bottomRight, color)
    }
}

@Composable
fun WinAppIcon(
    appId: AppId,
    size: Dp = 24.dp,
    isEmptyRecycleBin: Boolean = true,
    modifier: Modifier = Modifier
) {
    val bgBrush: Brush
    val iconTint: Color
    val vector = when (appId) {
        AppId.EXPLORER -> {
            bgBrush = Brush.linearGradient(listOf(Color(0xFFF59E0B), Color(0xFFD97706)))
            iconTint = Color.White
            Icons.Filled.Folder
        }
        AppId.EDGE -> {
            bgBrush = Brush.linearGradient(listOf(Color(0xFF0078D7), Color(0xFF00C6FF)))
            iconTint = Color.White
            Icons.Filled.Public
        }
        AppId.NOTEPAD -> {
            bgBrush = Brush.linearGradient(listOf(Color(0xFF0EA5E9), Color(0xFF0369A1)))
            iconTint = Color.White
            Icons.Filled.Description
        }
        AppId.CALC -> {
            bgBrush = Brush.linearGradient(listOf(Color(0xFF475569), Color(0xFF1E293B)))
            iconTint = Color(0xFF38BDF8)
            Icons.Filled.Calculate
        }
        AppId.CMD -> {
            bgBrush = Brush.linearGradient(listOf(Color(0xFF18181B), Color(0xFF09090B)))
            iconTint = Color(0xFF4ADE80)
            Icons.Filled.Terminal
        }
        AppId.PAINT -> {
            bgBrush = Brush.linearGradient(listOf(Color(0xFFEC4899), Color(0xFF8B5CF6)))
            iconTint = Color.White
            Icons.Filled.Palette
        }
        AppId.MINESWEEPER -> {
            bgBrush = Brush.linearGradient(listOf(Color(0xFF10B981), Color(0xFF047857)))
            iconTint = Color.White
            Icons.Filled.Warning
        }
        AppId.PHOTOS -> {
            bgBrush = Brush.linearGradient(listOf(Color(0xFF06B6D4), Color(0xFF2563EB)))
            iconTint = Color.White
            Icons.Filled.Image
        }
        AppId.GROOVE -> {
            bgBrush = Brush.linearGradient(listOf(Color(0xFF7C3AED), Color(0xFF4338CA)))
            iconTint = Color.White
            Icons.Filled.Headphones
        }
        AppId.TASKMANAGER -> {
            bgBrush = Brush.linearGradient(listOf(Color(0xFF0D9488), Color(0xFF115E59)))
            iconTint = Color(0xFFA7F3D0)
            Icons.Filled.ShowChart
        }
        AppId.SETTINGS -> {
            bgBrush = Brush.linearGradient(listOf(Color(0xFF3B82F6), Color(0xFF1D4ED8)))
            iconTint = Color.White
            Icons.Filled.Settings
        }
        AppId.RECYCLEBIN -> {
            bgBrush = Brush.linearGradient(listOf(Color(0xFF64748B), Color(0xFF334155)))
            iconTint = Color.White
            if (isEmptyRecycleBin) Icons.Filled.DeleteOutline else Icons.Filled.Delete
        }
    }

    Box(
        modifier = modifier
            .size(size)
            .clip(if (appId == AppId.EDGE) CircleShape else RoundedCornerShape(size * 0.22f))
            .background(bgBrush),
        contentAlignment = Alignment.Center
    ) {
        Icon(
            imageVector = vector,
            contentDescription = appId.name,
            tint = iconTint,
            modifier = Modifier.size(size * 0.62f)
        )
    }
}

@Composable
fun WinFileIcon(
    isFolder: Boolean,
    extension: FileExtension?,
    size: Dp = 24.dp,
    modifier: Modifier = Modifier
) {
    if (isFolder) {
        WinAppIcon(appId = AppId.EXPLORER, size = size, modifier = modifier)
        return
    }
    when (extension) {
        FileExtension.TXT, FileExtension.DOC, FileExtension.PDF -> WinAppIcon(AppId.NOTEPAD, size, modifier = modifier)
        FileExtension.JPG, FileExtension.PNG -> WinAppIcon(AppId.PHOTOS, size, modifier = modifier)
        FileExtension.MP3 -> {
            Box(
                modifier = modifier
                    .size(size)
                    .clip(RoundedCornerShape(size * 0.22f))
                    .background(Brush.linearGradient(listOf(Color(0xFF8B5CF6), Color(0xFFEC4899)))),
                contentAlignment = Alignment.Center
            ) {
                Icon(Icons.Filled.MusicNote, contentDescription = "Audio", tint = Color.White, modifier = Modifier.size(size * 0.6f))
            }
        }
        FileExtension.EXE -> {
            Box(
                modifier = modifier
                    .size(size)
                    .clip(RoundedCornerShape(size * 0.22f))
                    .background(Brush.linearGradient(listOf(Color(0xFF0EA5E9), Color(0xFF1E3A8A)))),
                contentAlignment = Alignment.Center
            ) {
                Icon(Icons.Filled.Memory, contentDescription = "Executable", tint = Color.White, modifier = Modifier.size(size * 0.6f))
            }
        }
        null -> WinAppIcon(AppId.NOTEPAD, size, modifier = modifier)
    }
}
