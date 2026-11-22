package com.example.ui.shell

import androidx.compose.animation.AnimatedVisibility
import androidx.compose.animation.fadeIn
import androidx.compose.animation.fadeOut
import androidx.compose.animation.slideInVertically
import androidx.compose.animation.slideOutVertically
import androidx.compose.foundation.background
import androidx.compose.foundation.border
import androidx.compose.foundation.clickable
import androidx.compose.foundation.layout.Arrangement
import androidx.compose.foundation.layout.Box
import androidx.compose.foundation.layout.Column
import androidx.compose.foundation.layout.Row
import androidx.compose.foundation.layout.Spacer
import androidx.compose.foundation.layout.fillMaxSize
import androidx.compose.foundation.layout.fillMaxWidth
import androidx.compose.foundation.layout.height
import androidx.compose.foundation.layout.padding
import androidx.compose.foundation.layout.size
import androidx.compose.foundation.layout.width
import androidx.compose.foundation.layout.widthIn
import androidx.compose.foundation.rememberScrollState
import androidx.compose.foundation.shape.RoundedCornerShape
import androidx.compose.foundation.text.BasicTextField
import androidx.compose.foundation.verticalScroll
import androidx.compose.material.icons.Icons
import androidx.compose.material.icons.filled.Close
import androidx.compose.material.icons.filled.Public
import androidx.compose.material.icons.filled.Search
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
import androidx.compose.ui.draw.shadow
import androidx.compose.ui.graphics.Color
import androidx.compose.ui.graphics.SolidColor
import androidx.compose.ui.platform.testTag
import androidx.compose.ui.text.TextStyle
import androidx.compose.ui.text.font.FontWeight
import androidx.compose.ui.text.style.TextOverflow
import androidx.compose.ui.unit.dp
import androidx.compose.ui.unit.sp
import com.example.model.AppId
import com.example.model.AppRegistry
import com.example.model.FileItem
import com.example.ui.components.WinAppIcon
import com.example.ui.components.WinFileIcon

private enum class SearchTab(val label: String) {
    ALL("All"),
    APPS("Apps"),
    DOCS("Documents")
}

@Composable
fun SearchOverlay(
    visible: Boolean,
    files: List<FileItem>,
    accentColor: Color,
    onDismiss: () -> Unit,
    onOpenApp: (AppId, String?) -> Unit,
    onOpenFile: (FileItem) -> Unit,
    modifier: Modifier = Modifier
) {
    var query by remember { mutableStateOf("") }
    var activeTab by remember { mutableStateOf(SearchTab.ALL) }

    val matchingApps = remember(query) {
        val q = query.trim().lowercase()
        AppRegistry.apps.values.filter {
            q.isEmpty() || it.name.lowercase().contains(q) || it.category.lowercase().contains(q)
        }
    }

    val matchingFiles = remember(query, files) {
        val q = query.trim().lowercase()
        files.filter { !it.isRecycled && (q.isEmpty() || it.name.lowercase().contains(q)) }
    }

    val topApps = remember {
        listOf(AppId.EDGE, AppId.EXPLORER, AppId.NOTEPAD, AppId.SETTINGS, AppId.CALC)
    }

    AnimatedVisibility(
        visible = visible,
        enter = fadeIn() + slideInVertically { it / 10 },
        exit = fadeOut() + slideOutVertically { it / 10 },
        modifier = modifier
    ) {
        Box(
            modifier = Modifier
                .fillMaxSize()
                .clickable(
                    interactionSource = remember { androidx.compose.foundation.interaction.MutableInteractionSource() },
                    indication = null,
                    onClick = onDismiss
                )
        ) {
            Column(
                modifier = Modifier
                    .align(Alignment.BottomStart)
                    .padding(start = 6.dp, end = 6.dp)
                    .widthIn(max = 520.dp)
                    .fillMaxWidth(0.95f)
                    .height(470.dp)
                    .shadow(20.dp, RoundedCornerShape(topStart = 8.dp, topEnd = 8.dp))
                    .clip(RoundedCornerShape(topStart = 8.dp, topEnd = 8.dp))
                    .background(Color(0xF51A1A1A))
                    .border(1.dp, Color.White.copy(alpha = 0.14f), RoundedCornerShape(topStart = 8.dp, topEnd = 8.dp))
                    .clickable(
                        interactionSource = remember { androidx.compose.foundation.interaction.MutableInteractionSource() },
                        indication = null,
                        onClick = {}
                    )
                    .testTag("search_overlay_panel")
            ) {
                // Tabs Header
                Row(
                    horizontalArrangement = Arrangement.spacedBy(16.dp),
                    modifier = Modifier
                        .fillMaxWidth()
                        .padding(horizontal = 16.dp, vertical = 10.dp)
                ) {
                    SearchTab.entries.forEach { tab ->
                        val active = activeTab == tab
                        Column(
                            modifier = Modifier
                                .clickable { activeTab = tab }
                                .padding(vertical = 4.dp)
                        ) {
                            Text(
                                text = tab.label,
                                color = if (active) Color.White else Color(0xFFA1A1AA),
                                fontSize = 12.sp,
                                fontWeight = if (active) FontWeight.SemiBold else FontWeight.Normal
                            )
                            Spacer(Modifier.height(4.dp))
                            Box(
                                modifier = Modifier
                                    .width(34.dp)
                                    .height(2.dp)
                                    .background(if (active) accentColor else Color.Transparent)
                            )
                        }
                    }
                }

                // Body
                Column(
                    modifier = Modifier
                        .weight(1f)
                        .fillMaxWidth()
                        .verticalScroll(rememberScrollState())
                        .padding(horizontal = 16.dp, vertical = 6.dp),
                    verticalArrangement = Arrangement.spacedBy(12.dp)
                ) {
                    if (query.isBlank() && activeTab == SearchTab.ALL) {
                        Text("Top apps", color = Color(0xFFD4D4D8), fontSize = 12.sp, fontWeight = FontWeight.SemiBold)
                        Row(
                            horizontalArrangement = Arrangement.spacedBy(8.dp),
                            modifier = Modifier.fillMaxWidth()
                        ) {
                            topApps.forEach { appId ->
                                val def = AppRegistry.get(appId)
                                Column(
                                    horizontalAlignment = Alignment.CenterHorizontally,
                                    modifier = Modifier
                                        .weight(1f)
                                        .clip(RoundedCornerShape(6.dp))
                                        .background(Color.White.copy(alpha = 0.06f))
                                        .clickable { onOpenApp(appId, null) }
                                        .padding(vertical = 10.dp, horizontal = 4.dp)
                                ) {
                                    WinAppIcon(appId = appId, size = 28.dp)
                                    Spacer(Modifier.height(6.dp))
                                    Text(
                                        text = def.name.split(" ").last(),
                                        color = Color.White,
                                        fontSize = 10.sp,
                                        maxLines = 1,
                                        overflow = TextOverflow.Ellipsis
                                    )
                                }
                            }
                        }

                        Text("Recent files", color = Color(0xFFD4D4D8), fontSize = 12.sp, fontWeight = FontWeight.SemiBold)
                        matchingFiles.take(5).forEach { file ->
                            Row(
                                verticalAlignment = Alignment.CenterVertically,
                                modifier = Modifier
                                    .fillMaxWidth()
                                    .clip(RoundedCornerShape(6.dp))
                                    .clickable { onOpenFile(file) }
                                    .padding(horizontal = 8.dp, vertical = 7.dp)
                            ) {
                                WinFileIcon(isFolder = file.isFolder, extension = file.extension, size = 20.dp)
                                Spacer(Modifier.width(10.dp))
                                Text(file.name, color = Color.White, fontSize = 12.sp, modifier = Modifier.weight(1f), maxLines = 1, overflow = TextOverflow.Ellipsis)
                                Text(file.location.displayName, color = Color(0xFFA1A1AA), fontSize = 10.sp)
                            }
                        }
                    } else {
                        if (activeTab == SearchTab.ALL || activeTab == SearchTab.APPS) {
                            Text("Apps (${matchingApps.size})", color = Color(0xFFA1A1AA), fontSize = 11.sp, fontWeight = FontWeight.SemiBold)
                            matchingApps.forEach { app ->
                                Row(
                                    verticalAlignment = Alignment.CenterVertically,
                                    modifier = Modifier
                                        .fillMaxWidth()
                                        .clip(RoundedCornerShape(6.dp))
                                        .clickable { onOpenApp(app.id, null) }
                                        .padding(horizontal = 8.dp, vertical = 7.dp)
                                ) {
                                    WinAppIcon(appId = app.id, size = 24.dp)
                                    Spacer(Modifier.width(10.dp))
                                    Column {
                                        Text(app.name, color = Color.White, fontSize = 13.sp, fontWeight = FontWeight.Medium)
                                        Text(app.category, color = Color(0xFFA1A1AA), fontSize = 10.sp)
                                    }
                                }
                            }
                        }

                        if (activeTab == SearchTab.ALL || activeTab == SearchTab.DOCS) {
                            Text("Documents & Files (${matchingFiles.size})", color = Color(0xFFA1A1AA), fontSize = 11.sp, fontWeight = FontWeight.SemiBold)
                            matchingFiles.forEach { file ->
                                Row(
                                    verticalAlignment = Alignment.CenterVertically,
                                    modifier = Modifier
                                        .fillMaxWidth()
                                        .clip(RoundedCornerShape(6.dp))
                                        .clickable { onOpenFile(file) }
                                        .padding(horizontal = 8.dp, vertical = 7.dp)
                                ) {
                                    WinFileIcon(isFolder = file.isFolder, extension = file.extension, size = 22.dp)
                                    Spacer(Modifier.width(10.dp))
                                    Column(modifier = Modifier.weight(1f)) {
                                        Text(file.name, color = Color.White, fontSize = 12.sp)
                                        Text("${file.location.displayName} • ${file.size}", color = Color(0xFFA1A1AA), fontSize = 10.sp)
                                    }
                                }
                            }
                        }

                        if (query.isNotBlank()) {
                            Row(
                                verticalAlignment = Alignment.CenterVertically,
                                modifier = Modifier
                                    .fillMaxWidth()
                                    .clip(RoundedCornerShape(6.dp))
                                    .background(accentColor.copy(alpha = 0.22f))
                                    .clickable { onOpenApp(AppId.EDGE, query.trim()) }
                                    .padding(10.dp)
                            ) {
                                Icon(Icons.Filled.Public, null, tint = Color(0xFF60A5FA), modifier = Modifier.size(18.dp))
                                Spacer(Modifier.width(10.dp))
                                Text("Search the web in Edge for \"${query.trim()}\"", color = Color.White, fontSize = 12.sp)
                            }
                        }
                    }
                }

                // Bottom Search Input Bar
                Row(
                    verticalAlignment = Alignment.CenterVertically,
                    modifier = Modifier
                        .fillMaxWidth()
                        .background(Color(0xFF111111))
                        .border(1.dp, accentColor)
                        .padding(horizontal = 12.dp, vertical = 10.dp)
                ) {
                    Icon(Icons.Filled.Search, contentDescription = "Search", tint = Color(0xFF60A5FA), modifier = Modifier.size(18.dp))
                    Spacer(Modifier.width(10.dp))
                    Box(modifier = Modifier.weight(1f)) {
                        if (query.isEmpty()) {
                            Text("Type here to search apps, files, or web...", color = Color(0xFF71717A), fontSize = 13.sp)
                        }
                        BasicTextField(
                            value = query,
                            onValueChange = { query = it },
                            singleLine = true,
                            textStyle = TextStyle(color = Color.White, fontSize = 13.sp),
                            cursorBrush = SolidColor(Color.White),
                            modifier = Modifier
                                .fillMaxWidth()
                                .testTag("search_overlay_input")
                        )
                    }
                    if (query.isNotEmpty()) {
                        Icon(
                            Icons.Filled.Close,
                            contentDescription = "Clear search",
                            tint = Color(0xFFA1A1AA),
                            modifier = Modifier
                                .size(18.dp)
                                .clickable { query = "" }
                        )
                    }
                }
            }
        }
    }
}
