package com.example.ui.shell

import androidx.compose.foundation.ExperimentalFoundationApi
import androidx.compose.foundation.background
import androidx.compose.foundation.border
import androidx.compose.foundation.combinedClickable
import androidx.compose.foundation.layout.Arrangement
import androidx.compose.foundation.layout.Box
import androidx.compose.foundation.layout.Column
import androidx.compose.foundation.layout.ExperimentalLayoutApi
import androidx.compose.foundation.layout.FlowColumn
import androidx.compose.foundation.layout.Spacer
import androidx.compose.foundation.layout.fillMaxSize
import androidx.compose.foundation.layout.height
import androidx.compose.foundation.layout.padding
import androidx.compose.foundation.layout.size
import androidx.compose.foundation.layout.statusBarsPadding
import androidx.compose.foundation.layout.width
import androidx.compose.foundation.shape.RoundedCornerShape
import androidx.compose.material.icons.Icons
import androidx.compose.material.icons.filled.CreateNewFolder
import androidx.compose.material.icons.filled.GridView
import androidx.compose.material.icons.filled.Monitor
import androidx.compose.material.icons.filled.NoteAdd
import androidx.compose.material.icons.filled.Palette
import androidx.compose.material.icons.filled.Refresh
import androidx.compose.material.icons.filled.Terminal
import androidx.compose.material3.DropdownMenu
import androidx.compose.material3.DropdownMenuItem
import androidx.compose.material3.HorizontalDivider
import androidx.compose.material3.Icon
import androidx.compose.material3.Text
import androidx.compose.runtime.Composable
import androidx.compose.runtime.getValue
import androidx.compose.runtime.mutableStateOf
import androidx.compose.runtime.remember
import androidx.compose.runtime.setValue
import androidx.compose.ui.Alignment
import androidx.compose.ui.Modifier
import androidx.compose.ui.draw.clip
import androidx.compose.ui.geometry.Offset
import androidx.compose.ui.graphics.Color
import androidx.compose.ui.graphics.Shadow
import androidx.compose.ui.layout.ContentScale
import androidx.compose.ui.platform.testTag
import androidx.compose.ui.res.painterResource
import androidx.compose.ui.text.TextStyle
import androidx.compose.ui.text.font.FontWeight
import androidx.compose.ui.text.style.TextAlign
import androidx.compose.ui.text.style.TextOverflow
import androidx.compose.ui.unit.dp
import androidx.compose.ui.unit.sp
import coil.compose.AsyncImage
import com.example.audio.WindowsSoundEngine
import com.example.model.AppId
import com.example.model.DesktopIconSize
import com.example.model.FileExtension
import com.example.model.FileItem
import com.example.model.FileLocation
import com.example.model.SystemSettings
import com.example.ui.components.WinAppIcon
import com.example.ui.components.WinFileIcon
import java.io.File

private data class DesktopShortcut(
    val id: String,
    val title: String,
    val appId: AppId
)

private val SYSTEM_SHORTCUTS = listOf(
    DesktopShortcut("sc-thispc", "This PC", AppId.EXPLORER),
    DesktopShortcut("sc-recycle", "Recycle Bin", AppId.RECYCLEBIN),
    DesktopShortcut("sc-edge", "Microsoft Edge", AppId.EDGE),
    DesktopShortcut("sc-notepad", "Notepad", AppId.NOTEPAD)
)

private sealed interface ContextTarget {
    data class Shortcut(val shortcut: DesktopShortcut) : ContextTarget
    data class FileEntry(val file: FileItem) : ContextTarget
}

@OptIn(ExperimentalFoundationApi::class, ExperimentalLayoutApi::class)
@Composable
fun DesktopScreen(
    settings: SystemSettings,
    files: List<FileItem>,
    selectedIconId: String?,
    iconSize: DesktopIconSize,
    onSelectIcon: (String?) -> Unit,
    onOpenApp: (AppId) -> Unit,
    onOpenFile: (FileItem) -> Unit,
    onCreateFolder: (String, FileLocation) -> Unit,
    onCreateFile: (String, String, FileLocation) -> Unit,
    onCycleIconSize: () -> Unit,
    onDismissFlyouts: () -> Unit,
    modifier: Modifier = Modifier
) {
    var showContextMenu by remember { mutableStateOf(false) }
    var contextTarget by remember { mutableStateOf<ContextTarget?>(null) }

    val desktopFiles = remember(files) {
        files.filter { it.location == FileLocation.DESKTOP && !it.isRecycled }
    }
    val recycledCount = remember(files) { files.count { it.isRecycled } }

    val boxSize = when (iconSize) {
        DesktopIconSize.SMALL -> 68.dp
        DesktopIconSize.NORMAL -> 80.dp
        DesktopIconSize.LARGE -> 96.dp
    }
    val graphicSize = when (iconSize) {
        DesktopIconSize.SMALL -> 28.dp
        DesktopIconSize.NORMAL -> 36.dp
        DesktopIconSize.LARGE -> 44.dp
    }

    Box(
        modifier = modifier
            .fillMaxSize()
            .combinedClickable(
                interactionSource = remember { androidx.compose.foundation.interaction.MutableInteractionSource() },
                indication = null,
                onClick = {
                    onSelectIcon(null)
                    onDismissFlyouts()
                },
                onLongClick = {
                    WindowsSoundEngine.playClick()
                    contextTarget = null
                    showContextMenu = true
                }
            )
    ) {
        WallpaperBackground(settings = settings)

        // Desktop icons in vertical columns wrapping horizontally
        FlowColumn(
            modifier = Modifier
                .fillMaxSize()
                .statusBarsPadding()
                .padding(8.dp),
            verticalArrangement = Arrangement.spacedBy(6.dp),
            horizontalArrangement = Arrangement.spacedBy(6.dp)
        ) {
            SYSTEM_SHORTCUTS.forEach { sc ->
                val isSelected = selectedIconId == sc.id
                DesktopIconTile(
                    title = sc.title,
                    isSelected = isSelected,
                    boxSize = boxSize,
                    onClick = {
                        onDismissFlyouts()
                        if (isSelected) {
                            onOpenApp(sc.appId)
                        } else {
                            onSelectIcon(sc.id)
                        }
                    },
                    onDoubleClick = { onOpenApp(sc.appId) },
                    onLongClick = {
                        WindowsSoundEngine.playClick()
                        contextTarget = ContextTarget.Shortcut(sc)
                        showContextMenu = true
                    },
                    testTag = "desktop_${sc.id}"
                ) {
                    WinAppIcon(
                        appId = sc.appId,
                        size = graphicSize,
                        isEmptyRecycleBin = sc.appId == AppId.RECYCLEBIN && recycledCount == 0
                    )
                }
            }

            desktopFiles.forEach { file ->
                val isSelected = selectedIconId == file.id
                DesktopIconTile(
                    title = file.name,
                    isSelected = isSelected,
                    boxSize = boxSize,
                    onClick = {
                        onDismissFlyouts()
                        if (isSelected) {
                            onOpenFile(file)
                        } else {
                            onSelectIcon(file.id)
                        }
                    },
                    onDoubleClick = { onOpenFile(file) },
                    onLongClick = {
                        WindowsSoundEngine.playClick()
                        contextTarget = ContextTarget.FileEntry(file)
                        showContextMenu = true
                    },
                    testTag = "desktop_file_${file.id}"
                ) {
                    if ((file.extension == FileExtension.JPG || file.extension == FileExtension.PNG) &&
                        (file.imageResId != null || file.localFilePath != null || file.imageUri != null)
                    ) {
                        val thumbModifier = Modifier
                            .size(graphicSize)
                            .clip(RoundedCornerShape(4.dp))
                            .border(1.dp, Color.White.copy(alpha = 0.45f), RoundedCornerShape(4.dp))
                        when {
                            file.imageResId != null -> androidx.compose.foundation.Image(
                                painter = painterResource(file.imageResId),
                                contentDescription = file.name,
                                contentScale = ContentScale.Crop,
                                modifier = thumbModifier
                            )
                            file.localFilePath != null -> AsyncImage(
                                model = File(file.localFilePath),
                                contentDescription = file.name,
                                contentScale = ContentScale.Crop,
                                modifier = thumbModifier
                            )
                            else -> AsyncImage(
                                model = file.imageUri,
                                contentDescription = file.name,
                                contentScale = ContentScale.Crop,
                                modifier = thumbModifier
                            )
                        }
                    } else {
                        WinFileIcon(
                            isFolder = file.isFolder,
                            extension = file.extension,
                            size = graphicSize
                        )
                    }
                }
            }
        }

        // Windows 10 Desktop Watermark
        Column(
            horizontalAlignment = Alignment.End,
            modifier = Modifier
                .align(Alignment.BottomEnd)
                .padding(end = 14.dp, bottom = 14.dp)
        ) {
            Text(
                text = "Windows 10 Pro",
                color = Color.White.copy(alpha = 0.9f),
                fontSize = 12.sp,
                fontWeight = FontWeight.SemiBold,
                style = TextStyle(
                    shadow = Shadow(Color.Black.copy(alpha = 0.85f), Offset(1f, 1f), 3f)
                )
            )
            Text(
                text = "Evaluation copy. Build 19045.5011",
                color = Color.White.copy(alpha = 0.7f),
                fontSize = 10.sp,
                style = TextStyle(
                    shadow = Shadow(Color.Black.copy(alpha = 0.85f), Offset(1f, 1f), 2f)
                )
            )
        }

        // Context Menu (triggered by long-press on desktop or icon)
        Box(
            modifier = Modifier
                .align(Alignment.Center)
        ) {
            DropdownMenu(
                expanded = showContextMenu,
                onDismissRequest = { showContextMenu = false },
                containerColor = Color(0xF2232323)
            ) {
                contextTarget?.let { target ->
                    val label = when (target) {
                        is ContextTarget.Shortcut -> "Open \"${target.shortcut.title}\""
                        is ContextTarget.FileEntry -> "Open \"${target.file.name}\""
                    }
                    DropdownMenuItem(
                        text = { Text(label, color = Color.White, fontWeight = FontWeight.SemiBold, fontSize = 13.sp) },
                        onClick = {
                            showContextMenu = false
                            when (target) {
                                is ContextTarget.Shortcut -> onOpenApp(target.shortcut.appId)
                                is ContextTarget.FileEntry -> onOpenFile(target.file)
                            }
                        }
                    )
                    HorizontalDivider(color = Color.White.copy(alpha = 0.1f))
                }

                DropdownMenuItem(
                    leadingIcon = { Icon(Icons.Filled.GridView, null, tint = Color(0xFFA1A1AA), modifier = Modifier.size(16.dp)) },
                    text = {
                        Text(
                            "Icon size: ${iconSize.name.lowercase().replaceFirstChar { it.uppercase() }}",
                            color = Color.White,
                            fontSize = 13.sp
                        )
                    },
                    onClick = {
                        onCycleIconSize()
                        showContextMenu = false
                    }
                )
                DropdownMenuItem(
                    leadingIcon = { Icon(Icons.Filled.Refresh, null, tint = Color(0xFFA1A1AA), modifier = Modifier.size(16.dp)) },
                    text = { Text("Refresh", color = Color.White, fontSize = 13.sp) },
                    onClick = {
                        WindowsSoundEngine.playClick()
                        showContextMenu = false
                    }
                )
                HorizontalDivider(color = Color.White.copy(alpha = 0.1f))
                DropdownMenuItem(
                    leadingIcon = { Icon(Icons.Filled.CreateNewFolder, null, tint = Color(0xFFFBBF24), modifier = Modifier.size(16.dp)) },
                    text = { Text("New folder", color = Color.White, fontSize = 13.sp) },
                    onClick = {
                        onCreateFolder("New folder", FileLocation.DESKTOP)
                        showContextMenu = false
                    }
                )
                DropdownMenuItem(
                    leadingIcon = { Icon(Icons.Filled.NoteAdd, null, tint = Color(0xFF38BDF8), modifier = Modifier.size(16.dp)) },
                    text = { Text("New text document", color = Color.White, fontSize = 13.sp) },
                    onClick = {
                        onCreateFile("New Text Document.txt", "", FileLocation.DESKTOP)
                        showContextMenu = false
                    }
                )
                HorizontalDivider(color = Color.White.copy(alpha = 0.1f))
                DropdownMenuItem(
                    leadingIcon = { Icon(Icons.Filled.Terminal, null, tint = Color(0xFF4ADE80), modifier = Modifier.size(16.dp)) },
                    text = { Text("Open in Terminal", color = Color.White, fontSize = 13.sp) },
                    onClick = {
                        onOpenApp(AppId.CMD)
                        showContextMenu = false
                    }
                )
                DropdownMenuItem(
                    leadingIcon = { Icon(Icons.Filled.Monitor, null, tint = Color(0xFFA1A1AA), modifier = Modifier.size(16.dp)) },
                    text = { Text("Display settings", color = Color.White, fontSize = 13.sp) },
                    onClick = {
                        onOpenApp(AppId.SETTINGS)
                        showContextMenu = false
                    }
                )
                DropdownMenuItem(
                    leadingIcon = { Icon(Icons.Filled.Palette, null, tint = Color(0xFFC084FC), modifier = Modifier.size(16.dp)) },
                    text = { Text("Personalize", color = Color.White, fontSize = 13.sp) },
                    onClick = {
                        onOpenApp(AppId.SETTINGS)
                        showContextMenu = false
                    }
                )
            }
        }
    }
}

@OptIn(ExperimentalFoundationApi::class)
@Composable
private fun DesktopIconTile(
    title: String,
    isSelected: Boolean,
    boxSize: androidx.compose.ui.unit.Dp,
    onClick: () -> Unit,
    onDoubleClick: () -> Unit,
    onLongClick: () -> Unit,
    testTag: String,
    iconContent: @Composable () -> Unit
) {
    Column(
        horizontalAlignment = Alignment.CenterHorizontally,
        verticalArrangement = Arrangement.Center,
        modifier = Modifier
            .width(boxSize)
            .height(boxSize)
            .clip(RoundedCornerShape(4.dp))
            .background(if (isSelected) Color(0x592563EB) else Color.Transparent)
            .border(
                width = 1.dp,
                color = if (isSelected) Color(0xCC60A5FA) else Color.Transparent,
                shape = RoundedCornerShape(4.dp)
            )
            .combinedClickable(
                onClick = onClick,
                onDoubleClick = onDoubleClick,
                onLongClick = onLongClick
            )
            .padding(4.dp)
            .testTag(testTag)
    ) {
        iconContent()
        Spacer(Modifier.height(4.dp))
        Text(
            text = title,
            color = Color.White,
            fontSize = 11.sp,
            lineHeight = 13.sp,
            maxLines = 2,
            overflow = TextOverflow.Ellipsis,
            textAlign = TextAlign.Center,
            style = TextStyle(
                shadow = Shadow(Color.Black.copy(alpha = 0.9f), Offset(1f, 1f), 3f)
            )
        )
    }
}
