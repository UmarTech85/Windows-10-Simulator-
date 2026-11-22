package com.example.ui.apps

import android.provider.OpenableColumns
import android.widget.Toast
import androidx.activity.compose.rememberLauncherForActivityResult
import androidx.activity.result.PickVisualMediaRequest
import androidx.activity.result.contract.ActivityResultContracts
import androidx.compose.foundation.ExperimentalFoundationApi
import androidx.compose.foundation.background
import androidx.compose.foundation.border
import androidx.compose.foundation.clickable
import androidx.compose.foundation.combinedClickable
import androidx.compose.foundation.horizontalScroll
import androidx.compose.foundation.layout.Arrangement
import androidx.compose.foundation.layout.Box
import androidx.compose.foundation.layout.BoxWithConstraints
import androidx.compose.foundation.layout.Column
import androidx.compose.foundation.layout.ExperimentalLayoutApi
import androidx.compose.foundation.layout.FlowRow
import androidx.compose.foundation.layout.Row
import androidx.compose.foundation.layout.Spacer
import androidx.compose.foundation.layout.fillMaxHeight
import androidx.compose.foundation.layout.fillMaxSize
import androidx.compose.foundation.layout.fillMaxWidth
import androidx.compose.foundation.layout.height
import androidx.compose.foundation.layout.padding
import androidx.compose.foundation.layout.size
import androidx.compose.foundation.layout.width
import androidx.compose.foundation.lazy.LazyColumn
import androidx.compose.foundation.lazy.items
import androidx.compose.foundation.rememberScrollState
import androidx.compose.foundation.shape.RoundedCornerShape
import androidx.compose.foundation.text.BasicTextField
import androidx.compose.foundation.verticalScroll
import androidx.compose.material.icons.Icons
import androidx.compose.material.icons.automirrored.filled.ArrowBack
import androidx.compose.material.icons.automirrored.filled.ArrowForward
import androidx.compose.material.icons.filled.ArrowUpward
import androidx.compose.material.icons.filled.ChevronRight
import androidx.compose.material.icons.filled.Computer
import androidx.compose.material.icons.filled.CreateNewFolder
import androidx.compose.material.icons.filled.Delete
import androidx.compose.material.icons.filled.Description
import androidx.compose.material.icons.filled.DesktopWindows
import androidx.compose.material.icons.filled.Download
import androidx.compose.material.icons.filled.Folder
import androidx.compose.material.icons.filled.GridView
import androidx.compose.material.icons.filled.Image
import androidx.compose.material.icons.filled.LibraryMusic
import androidx.compose.material.icons.filled.NoteAdd
import androidx.compose.material.icons.filled.PhotoLibrary
import androidx.compose.material.icons.filled.Search
import androidx.compose.material.icons.filled.Storage
import androidx.compose.material.icons.filled.ViewList
import androidx.compose.material3.Button
import androidx.compose.material3.ButtonDefaults
import androidx.compose.material3.HorizontalDivider
import androidx.compose.material3.Icon
import androidx.compose.material3.Text
import androidx.compose.runtime.Composable
import androidx.compose.runtime.LaunchedEffect
import androidx.compose.runtime.getValue
import androidx.compose.runtime.mutableIntStateOf
import androidx.compose.runtime.mutableStateListOf
import androidx.compose.runtime.mutableStateOf
import androidx.compose.runtime.remember
import androidx.compose.runtime.setValue
import androidx.compose.ui.Alignment
import androidx.compose.ui.Modifier
import androidx.compose.ui.draw.clip
import androidx.compose.ui.graphics.Color
import androidx.compose.ui.graphics.SolidColor
import androidx.compose.ui.graphics.vector.ImageVector
import androidx.compose.ui.platform.LocalContext
import androidx.compose.ui.platform.testTag
import androidx.compose.ui.text.TextStyle
import androidx.compose.ui.text.font.FontWeight
import androidx.compose.ui.text.style.TextAlign
import androidx.compose.ui.text.style.TextOverflow
import androidx.compose.ui.unit.dp
import androidx.compose.ui.unit.sp
import com.example.audio.WindowsSoundEngine
import com.example.model.FileItem
import com.example.model.FileLocation
import com.example.ui.components.WinFileIcon

@OptIn(ExperimentalLayoutApi::class, ExperimentalFoundationApi::class)
@Composable
fun FileExplorerApp(
    files: List<FileItem>,
    initialLocation: FileLocation?,
    isDarkTheme: Boolean,
    accentColor: Color,
    onOpenFile: (FileItem) -> Unit,
    onCreateFolder: (String, FileLocation) -> Unit,
    onCreateFile: (String, String, FileLocation) -> Unit,
    onImportPhoto: (uri: String, displayName: String, location: FileLocation) -> Unit,
    onDeleteFile: (String) -> Unit,
    onUpdateTitle: (String) -> Unit
) {
    val context = LocalContext.current
    val history = remember { mutableStateListOf(initialLocation ?: FileLocation.DESKTOP) }
    var historyIndex by remember { mutableIntStateOf(0) }
    val currentLocation = history[historyIndex]

    var selectedFileId by remember { mutableStateOf<String?>(null) }
    var viewModeGrid by remember { mutableStateOf(true) }
    var searchQuery by remember { mutableStateOf("") }
    var createMode by remember { mutableStateOf<String?>(null) } // "folder" | "file"
    var newNameText by remember { mutableStateOf("") }

    LaunchedEffect(initialLocation) {
        if (initialLocation != null && initialLocation != history[historyIndex]) {
            while (history.size > historyIndex + 1) history.removeAt(history.lastIndex)
            history.add(initialLocation)
            historyIndex = history.lastIndex
            selectedFileId = null
        }
    }

    LaunchedEffect(currentLocation) {
        onUpdateTitle("${currentLocation.displayName} - File Explorer")
    }

    fun navigateTo(loc: FileLocation) {
        if (loc == currentLocation) return
        WindowsSoundEngine.playClick()
        while (history.size > historyIndex + 1) history.removeAt(history.lastIndex)
        history.add(loc)
        historyIndex = history.lastIndex
        selectedFileId = null
        searchQuery = ""
    }

    val photoPicker = rememberLauncherForActivityResult(
        contract = ActivityResultContracts.PickVisualMedia()
    ) { uri ->
        if (uri != null) {
            var name = "Photo_${System.currentTimeMillis().toString().takeLast(4)}.jpg"
            context.contentResolver.query(uri, null, null, null, null)?.use { cursor ->
                val idx = cursor.getColumnIndex(OpenableColumns.DISPLAY_NAME)
                if (idx >= 0 && cursor.moveToFirst()) {
                    name = cursor.getString(idx) ?: name
                }
            }
            onImportPhoto(uri.toString(), name, currentLocation)
            Toast.makeText(context, "Imported $name", Toast.LENGTH_SHORT).show()
        }
    }

    val currentFiles = remember(files, currentLocation, searchQuery) {
        files.filter {
            !it.isRecycled &&
                it.location == currentLocation &&
                (searchQuery.isBlank() || it.name.contains(searchQuery.trim(), ignoreCase = true))
        }
    }

    val bgColor = if (isDarkTheme) Color(0xFF191919) else Color.White
    val barBg = if (isDarkTheme) Color(0xFF232323) else Color(0xFFF3F4F6)
    val sidebarBg = if (isDarkTheme) Color(0xFF1E1E1E) else Color(0xFFF8FAFC)
    val textColor = if (isDarkTheme) Color.White else Color(0xFF18181B)
    val mutedColor = if (isDarkTheme) Color(0xFFA1A1AA) else Color(0xFF64748B)
    val borderColor = if (isDarkTheme) Color.White.copy(alpha = 0.1f) else Color(0xFFE2E8F0)

    Column(
        modifier = Modifier
            .fillMaxSize()
            .background(bgColor)
            .testTag("app_explorer")
    ) {
        // Ribbon Bar
        Row(
            verticalAlignment = Alignment.CenterVertically,
            horizontalArrangement = Arrangement.spacedBy(6.dp),
            modifier = Modifier
                .fillMaxWidth()
                .background(barBg)
                .horizontalScroll(rememberScrollState())
                .padding(horizontal = 8.dp, vertical = 6.dp)
        ) {
            RibbonButton("New folder", Icons.Filled.CreateNewFolder, Color(0xFFF59E0B), textColor) {
                createMode = "folder"
                newNameText = "New folder"
            }
            RibbonButton("New file", Icons.Filled.NoteAdd, Color(0xFF38BDF8), textColor) {
                createMode = "file"
                newNameText = "Note.txt"
            }
            RibbonButton("Import photo", Icons.Filled.PhotoLibrary, Color(0xFF10B981), textColor) {
                photoPicker.launch(PickVisualMediaRequest(ActivityResultContracts.PickVisualMedia.ImageOnly))
            }
            RibbonButton("Export", Icons.Filled.Download, Color(0xFF60A5FA), textColor) {
                val sel = files.firstOrNull { it.id == selectedFileId }
                if (sel != null) {
                    Toast.makeText(context, "Saved \"${sel.name}\" (${sel.size})", Toast.LENGTH_SHORT).show()
                } else {
                    Toast.makeText(context, "Select a file first", Toast.LENGTH_SHORT).show()
                }
            }
            RibbonButton("Delete", Icons.Filled.Delete, Color(0xFFEF4444), if (selectedFileId != null) textColor else mutedColor) {
                selectedFileId?.let {
                    onDeleteFile(it)
                    selectedFileId = null
                }
            }
            RibbonButton(
                label = if (viewModeGrid) "Details" else "Icons",
                icon = if (viewModeGrid) Icons.Filled.ViewList else Icons.Filled.GridView,
                tint = accentColor,
                textColor = textColor
            ) {
                viewModeGrid = !viewModeGrid
            }
        }
        HorizontalDivider(color = borderColor)

        // Navigation & Address + Search Bar
        Row(
            verticalAlignment = Alignment.CenterVertically,
            horizontalArrangement = Arrangement.spacedBy(6.dp),
            modifier = Modifier
                .fillMaxWidth()
                .background(bgColor)
                .padding(horizontal = 8.dp, vertical = 6.dp)
        ) {
            Icon(
                Icons.AutoMirrored.Filled.ArrowBack,
                contentDescription = "Back",
                tint = if (historyIndex > 0) textColor else mutedColor.copy(alpha = 0.4f),
                modifier = Modifier
                    .size(28.dp)
                    .clickable(enabled = historyIndex > 0) {
                        historyIndex--
                        selectedFileId = null
                    }
                    .padding(4.dp)
            )
            Icon(
                Icons.AutoMirrored.Filled.ArrowForward,
                contentDescription = "Forward",
                tint = if (historyIndex < history.lastIndex) textColor else mutedColor.copy(alpha = 0.4f),
                modifier = Modifier
                    .size(28.dp)
                    .clickable(enabled = historyIndex < history.lastIndex) {
                        historyIndex++
                        selectedFileId = null
                    }
                    .padding(4.dp)
            )
            Icon(
                Icons.Filled.ArrowUpward,
                contentDescription = "Up",
                tint = textColor,
                modifier = Modifier
                    .size(28.dp)
                    .clickable { navigateTo(FileLocation.DESKTOP) }
                    .padding(4.dp)
            )

            // Breadcrumb bar
            Row(
                verticalAlignment = Alignment.CenterVertically,
                modifier = Modifier
                    .weight(1.3f)
                    .height(30.dp)
                    .border(1.dp, borderColor, RoundedCornerShape(3.dp))
                    .padding(horizontal = 8.dp)
            ) {
                Icon(Icons.Filled.Computer, null, tint = accentColor, modifier = Modifier.size(14.dp))
                Icon(Icons.Filled.ChevronRight, null, tint = mutedColor, modifier = Modifier.size(14.dp))
                Text("This PC", color = mutedColor, fontSize = 11.sp, maxLines = 1)
                Icon(Icons.Filled.ChevronRight, null, tint = mutedColor, modifier = Modifier.size(14.dp))
                Text(currentLocation.displayName, color = textColor, fontSize = 11.sp, fontWeight = FontWeight.Medium, maxLines = 1, overflow = TextOverflow.Ellipsis)
            }

            // Search box
            Row(
                verticalAlignment = Alignment.CenterVertically,
                modifier = Modifier
                    .weight(0.9f)
                    .height(30.dp)
                    .border(1.dp, borderColor, RoundedCornerShape(3.dp))
                    .padding(horizontal = 8.dp)
            ) {
                Icon(Icons.Filled.Search, null, tint = mutedColor, modifier = Modifier.size(14.dp))
                Spacer(Modifier.width(4.dp))
                Box(modifier = Modifier.weight(1f)) {
                    if (searchQuery.isEmpty()) {
                        Text("Search", color = mutedColor, fontSize = 11.sp, maxLines = 1)
                    }
                    BasicTextField(
                        value = searchQuery,
                        onValueChange = { searchQuery = it },
                        singleLine = true,
                        textStyle = TextStyle(color = textColor, fontSize = 11.sp),
                        cursorBrush = SolidColor(textColor),
                        modifier = Modifier.fillMaxWidth()
                    )
                }
            }
        }
        HorizontalDivider(color = borderColor)

        // Inline Creation Prompt
        if (createMode != null) {
            Row(
                verticalAlignment = Alignment.CenterVertically,
                horizontalArrangement = Arrangement.spacedBy(8.dp),
                modifier = Modifier
                    .fillMaxWidth()
                    .background(accentColor.copy(alpha = 0.14f))
                    .padding(horizontal = 10.dp, vertical = 6.dp)
            ) {
                Text(
                    if (createMode == "folder") "Folder name:" else "File name:",
                    color = textColor,
                    fontSize = 12.sp
                )
                Box(
                    modifier = Modifier
                        .weight(1f)
                        .border(1.dp, accentColor, RoundedCornerShape(3.dp))
                        .background(bgColor)
                        .padding(horizontal = 8.dp, vertical = 5.dp)
                ) {
                    BasicTextField(
                        value = newNameText,
                        onValueChange = { newNameText = it },
                        singleLine = true,
                        textStyle = TextStyle(color = textColor, fontSize = 12.sp),
                        cursorBrush = SolidColor(textColor),
                        modifier = Modifier.fillMaxWidth()
                    )
                }
                Button(
                    onClick = {
                        val trimmed = newNameText.trim()
                        if (trimmed.isNotEmpty()) {
                            if (createMode == "folder") {
                                onCreateFolder(trimmed, currentLocation)
                            } else {
                                onCreateFile(trimmed, "", currentLocation)
                            }
                        }
                        createMode = null
                    },
                    colors = ButtonDefaults.buttonColors(containerColor = accentColor),
                    shape = RoundedCornerShape(3.dp),
                    modifier = Modifier.height(30.dp)
                ) {
                    Text("Create", fontSize = 11.sp)
                }
                Text(
                    "Cancel",
                    color = mutedColor,
                    fontSize = 11.sp,
                    modifier = Modifier
                        .clickable { createMode = null }
                        .padding(6.dp)
                )
            }
        }

        // Main Split Area: Quick Access Sidebar + Files View
        BoxWithConstraints(modifier = Modifier.weight(1f).fillMaxWidth()) {
            val showSidebar = maxWidth >= 420.dp
            Column(modifier = Modifier.fillMaxSize()) {
                if (!showSidebar) {
                    // Compact location chips for narrow screens
                    Row(
                        horizontalArrangement = Arrangement.spacedBy(6.dp),
                        modifier = Modifier
                            .fillMaxWidth()
                            .background(sidebarBg)
                            .horizontalScroll(rememberScrollState())
                            .padding(horizontal = 8.dp, vertical = 6.dp)
                    ) {
                        val locations = listOf(
                            FileLocation.DESKTOP to Icons.Filled.DesktopWindows,
                            FileLocation.DOCUMENTS to Icons.Filled.Description,
                            FileLocation.PICTURES to Icons.Filled.Image,
                            FileLocation.DOWNLOADS to Icons.Filled.Download,
                            FileLocation.MUSIC to Icons.Filled.LibraryMusic
                        )
                        locations.forEach { (loc, icon) ->
                            val selected = currentLocation == loc
                            Row(
                                verticalAlignment = Alignment.CenterVertically,
                                modifier = Modifier
                                    .clip(RoundedCornerShape(4.dp))
                                    .background(if (selected) accentColor else Color.Transparent)
                                    .clickable { navigateTo(loc) }
                                    .padding(horizontal = 8.dp, vertical = 5.dp)
                            ) {
                                Icon(icon, null, tint = if (selected) Color.White else accentColor, modifier = Modifier.size(14.dp))
                                Spacer(Modifier.width(4.dp))
                                Text(loc.displayName, color = if (selected) Color.White else textColor, fontSize = 11.sp)
                            }
                        }
                    }
                    HorizontalDivider(color = borderColor)
                }

                Row(modifier = Modifier.weight(1f).fillMaxWidth()) {
                    if (showSidebar) {
                        Column(
                            modifier = Modifier
                                .width(155.dp)
                                .fillMaxHeight()
                                .background(sidebarBg)
                                .padding(vertical = 8.dp)
                        ) {
                            Text("Quick access", color = mutedColor, fontSize = 10.sp, fontWeight = FontWeight.SemiBold, modifier = Modifier.padding(horizontal = 12.dp, vertical = 4.dp))
                            SidebarNavItem("Desktop", Icons.Filled.DesktopWindows, currentLocation == FileLocation.DESKTOP, accentColor, textColor) { navigateTo(FileLocation.DESKTOP) }
                            SidebarNavItem("Downloads", Icons.Filled.Download, currentLocation == FileLocation.DOWNLOADS, accentColor, textColor) { navigateTo(FileLocation.DOWNLOADS) }
                            SidebarNavItem("Documents", Icons.Filled.Description, currentLocation == FileLocation.DOCUMENTS, accentColor, textColor) { navigateTo(FileLocation.DOCUMENTS) }
                            SidebarNavItem("Pictures", Icons.Filled.Image, currentLocation == FileLocation.PICTURES, accentColor, textColor) { navigateTo(FileLocation.PICTURES) }
                            SidebarNavItem("Music", Icons.Filled.LibraryMusic, currentLocation == FileLocation.MUSIC, accentColor, textColor) { navigateTo(FileLocation.MUSIC) }
                            Spacer(Modifier.height(10.dp))
                            Text("This PC", color = mutedColor, fontSize = 10.sp, fontWeight = FontWeight.SemiBold, modifier = Modifier.padding(horizontal = 12.dp, vertical = 4.dp))
                            Row(
                                verticalAlignment = Alignment.CenterVertically,
                                modifier = Modifier
                                    .fillMaxWidth()
                                    .clickable { navigateTo(FileLocation.DESKTOP) }
                                    .padding(horizontal = 12.dp, vertical = 6.dp)
                            ) {
                                Icon(Icons.Filled.Storage, null, tint = mutedColor, modifier = Modifier.size(15.dp))
                                Spacer(Modifier.width(8.dp))
                                Column {
                                    Text("Local Disk (C:)", color = textColor, fontSize = 11.sp)
                                    Box(
                                        modifier = Modifier
                                            .width(90.dp)
                                            .height(4.dp)
                                            .clip(RoundedCornerShape(2.dp))
                                            .background(borderColor)
                                    ) {
                                        Box(
                                            modifier = Modifier
                                                .fillMaxWidth(0.38f)
                                                .fillMaxHeight()
                                                .background(accentColor)
                                        )
                                    }
                                }
                            }
                        }
                        Box(modifier = Modifier.width(1.dp).fillMaxHeight().background(borderColor))
                    }

                    // File Grid / Details List
                    if (currentFiles.isEmpty()) {
                        Box(
                            contentAlignment = Alignment.Center,
                            modifier = Modifier.weight(1f).fillMaxHeight()
                        ) {
                            Text("This folder is empty.", color = mutedColor, fontSize = 13.sp)
                        }
                    } else if (viewModeGrid) {
                        FlowRow(
                            horizontalArrangement = Arrangement.spacedBy(8.dp),
                            verticalArrangement = Arrangement.spacedBy(8.dp),
                            modifier = Modifier
                                .weight(1f)
                                .fillMaxHeight()
                                .verticalScroll(rememberScrollState())
                                .padding(12.dp)
                        ) {
                            currentFiles.forEach { file ->
                                val selected = selectedFileId == file.id
                                Column(
                                    horizontalAlignment = Alignment.CenterHorizontally,
                                    modifier = Modifier
                                        .width(86.dp)
                                        .clip(RoundedCornerShape(4.dp))
                                        .background(if (selected) accentColor.copy(alpha = 0.25f) else Color.Transparent)
                                        .border(1.dp, if (selected) accentColor else Color.Transparent, RoundedCornerShape(4.dp))
                                        .combinedClickable(
                                            onClick = {
                                                if (selected) onOpenFile(file) else selectedFileId = file.id
                                            },
                                            onDoubleClick = { onOpenFile(file) }
                                        )
                                        .padding(6.dp)
                                        .testTag("explorer_file_${file.id}")
                                ) {
                                    WinFileIcon(isFolder = file.isFolder, extension = file.extension, size = 34.dp)
                                    Spacer(Modifier.height(4.dp))
                                    Text(
                                        file.name,
                                        color = textColor,
                                        fontSize = 11.sp,
                                        lineHeight = 13.sp,
                                        maxLines = 2,
                                        overflow = TextOverflow.Ellipsis,
                                        textAlign = TextAlign.Center
                                    )
                                }
                            }
                        }
                    } else {
                        LazyColumn(modifier = Modifier.weight(1f).fillMaxHeight()) {
                            item {
                                Row(
                                    modifier = Modifier
                                        .fillMaxWidth()
                                        .background(barBg)
                                        .padding(horizontal = 12.dp, vertical = 6.dp)
                                ) {
                                    Text("Name", color = mutedColor, fontSize = 11.sp, fontWeight = FontWeight.SemiBold, modifier = Modifier.weight(1.8f))
                                    Text("Date", color = mutedColor, fontSize = 11.sp, fontWeight = FontWeight.SemiBold, modifier = Modifier.weight(1f))
                                    Text("Size", color = mutedColor, fontSize = 11.sp, fontWeight = FontWeight.SemiBold, modifier = Modifier.weight(0.7f))
                                }
                            }
                            items(currentFiles, key = { it.id }) { file ->
                                val selected = selectedFileId == file.id
                                Row(
                                    verticalAlignment = Alignment.CenterVertically,
                                    modifier = Modifier
                                        .fillMaxWidth()
                                        .background(if (selected) accentColor.copy(alpha = 0.22f) else Color.Transparent)
                                        .combinedClickable(
                                            onClick = {
                                                if (selected) onOpenFile(file) else selectedFileId = file.id
                                            },
                                            onDoubleClick = { onOpenFile(file) }
                                        )
                                        .padding(horizontal = 12.dp, vertical = 8.dp)
                                ) {
                                    Row(verticalAlignment = Alignment.CenterVertically, modifier = Modifier.weight(1.8f)) {
                                        WinFileIcon(isFolder = file.isFolder, extension = file.extension, size = 18.dp)
                                        Spacer(Modifier.width(8.dp))
                                        Text(file.name, color = textColor, fontSize = 12.sp, maxLines = 1, overflow = TextOverflow.Ellipsis)
                                    }
                                    Text(file.date, color = mutedColor, fontSize = 11.sp, modifier = Modifier.weight(1f))
                                    Text(file.size, color = mutedColor, fontSize = 11.sp, modifier = Modifier.weight(0.7f))
                                }
                            }
                        }
                    }
                }
            }
        }

        // Status Bar
        HorizontalDivider(color = borderColor)
        Row(
            horizontalArrangement = Arrangement.SpaceBetween,
            modifier = Modifier
                .fillMaxWidth()
                .background(barBg)
                .padding(horizontal = 10.dp, vertical = 4.dp)
        ) {
            Text("${currentFiles.size} items", color = mutedColor, fontSize = 11.sp)
            Text("Tap once to select • Tap again to open", color = mutedColor, fontSize = 10.sp)
        }
    }
}

@Composable
private fun RibbonButton(
    label: String,
    icon: ImageVector,
    tint: Color,
    textColor: Color,
    onClick: () -> Unit
) {
    Row(
        verticalAlignment = Alignment.CenterVertically,
        modifier = Modifier
            .clip(RoundedCornerShape(4.dp))
            .clickable(onClick = onClick)
            .padding(horizontal = 8.dp, vertical = 5.dp)
    ) {
        Icon(icon, contentDescription = label, tint = tint, modifier = Modifier.size(16.dp))
        Spacer(Modifier.width(4.dp))
        Text(label, color = textColor, fontSize = 11.sp)
    }
}

@Composable
private fun SidebarNavItem(
    label: String,
    icon: ImageVector,
    selected: Boolean,
    accentColor: Color,
    textColor: Color,
    onClick: () -> Unit
) {
    Row(
        verticalAlignment = Alignment.CenterVertically,
        modifier = Modifier
            .fillMaxWidth()
            .background(if (selected) accentColor.copy(alpha = 0.22f) else Color.Transparent)
            .clickable(onClick = onClick)
            .padding(horizontal = 12.dp, vertical = 7.dp)
    ) {
        Icon(icon, contentDescription = label, tint = accentColor, modifier = Modifier.size(15.dp))
        Spacer(Modifier.width(8.dp))
        Text(label, color = textColor, fontSize = 12.sp, maxLines = 1, overflow = TextOverflow.Ellipsis)
    }
}
