package com.example.ui.apps

import androidx.compose.foundation.background
import androidx.compose.foundation.clickable
import androidx.compose.foundation.layout.Arrangement
import androidx.compose.foundation.layout.Box
import androidx.compose.foundation.layout.Column
import androidx.compose.foundation.layout.Row
import androidx.compose.foundation.layout.Spacer
import androidx.compose.foundation.layout.fillMaxSize
import androidx.compose.foundation.layout.fillMaxWidth
import androidx.compose.foundation.layout.padding
import androidx.compose.foundation.layout.size
import androidx.compose.foundation.layout.width
import androidx.compose.foundation.lazy.LazyColumn
import androidx.compose.foundation.lazy.items
import androidx.compose.foundation.shape.RoundedCornerShape
import androidx.compose.material.icons.Icons
import androidx.compose.material.icons.filled.DeleteForever
import androidx.compose.material.icons.filled.Restore
import androidx.compose.material.icons.filled.RestoreFromTrash
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
import androidx.compose.ui.graphics.Color
import androidx.compose.ui.platform.testTag
import androidx.compose.ui.text.font.FontWeight
import androidx.compose.ui.text.style.TextOverflow
import androidx.compose.ui.unit.dp
import androidx.compose.ui.unit.sp
import com.example.model.FileItem
import com.example.ui.components.WinFileIcon

@Composable
fun RecycleBinApp(
    files: List<FileItem>,
    isDarkTheme: Boolean,
    accentColor: Color,
    onRestoreFile: (String) -> Unit,
    onRestoreAll: () -> Unit,
    onEmptyBin: () -> Unit
) {
    val recycled = remember(files) { files.filter { it.isRecycled } }
    var selectedId by remember { mutableStateOf<String?>(null) }

    val bg = if (isDarkTheme) Color(0xFF19191B) else Color.White
    val barBg = if (isDarkTheme) Color(0xFF242428) else Color(0xFFF3F4F6)
    val textColor = if (isDarkTheme) Color.White else Color(0xFF18181B)
    val mutedColor = if (isDarkTheme) Color(0xFFA1A1AA) else Color(0xFF64748B)
    val borderColor = if (isDarkTheme) Color.White.copy(alpha = 0.1f) else Color(0xFFE2E8F0)

    Column(
        modifier = Modifier
            .fillMaxSize()
            .background(bg)
            .testTag("app_recyclebin")
    ) {
        // Action Ribbon
        Row(
            verticalAlignment = Alignment.CenterVertically,
            horizontalArrangement = Arrangement.spacedBy(8.dp),
            modifier = Modifier
                .fillMaxWidth()
                .background(barBg)
                .padding(horizontal = 10.dp, vertical = 8.dp)
        ) {
            Row(
                verticalAlignment = Alignment.CenterVertically,
                modifier = Modifier
                    .clip(RoundedCornerShape(4.dp))
                    .background(if (recycled.isNotEmpty()) Color(0xFFDC2626) else Color(0xFF52525B))
                    .clickable(enabled = recycled.isNotEmpty()) {
                        onEmptyBin()
                        selectedId = null
                    }
                    .padding(horizontal = 10.dp, vertical = 6.dp)
            ) {
                Icon(Icons.Filled.DeleteForever, null, tint = Color.White, modifier = Modifier.size(16.dp))
                Spacer(Modifier.width(4.dp))
                Text("Empty Recycle Bin", color = Color.White, fontSize = 11.sp)
            }

            Row(
                verticalAlignment = Alignment.CenterVertically,
                modifier = Modifier
                    .clip(RoundedCornerShape(4.dp))
                    .background(if (recycled.isNotEmpty()) accentColor else Color(0xFF52525B))
                    .clickable(enabled = recycled.isNotEmpty()) {
                        onRestoreAll()
                        selectedId = null
                    }
                    .padding(horizontal = 10.dp, vertical = 6.dp)
            ) {
                Icon(Icons.Filled.RestoreFromTrash, null, tint = Color.White, modifier = Modifier.size(16.dp))
                Spacer(Modifier.width(4.dp))
                Text("Restore all items", color = Color.White, fontSize = 11.sp)
            }

            if (selectedId != null) {
                Row(
                    verticalAlignment = Alignment.CenterVertically,
                    modifier = Modifier
                        .clip(RoundedCornerShape(4.dp))
                        .background(Color(0xFF059669))
                        .clickable {
                            selectedId?.let(onRestoreFile)
                            selectedId = null
                        }
                        .padding(horizontal = 10.dp, vertical = 6.dp)
                ) {
                    Icon(Icons.Filled.Restore, null, tint = Color.White, modifier = Modifier.size(16.dp))
                    Spacer(Modifier.width(4.dp))
                    Text("Restore selected", color = Color.White, fontSize = 11.sp)
                }
            }
        }
        HorizontalDivider(color = borderColor)

        if (recycled.isEmpty()) {
            Box(contentAlignment = Alignment.Center, modifier = Modifier.weight(1f).fillMaxWidth()) {
                Text("Recycle Bin is empty.", color = mutedColor, fontSize = 13.sp)
            }
        } else {
            LazyColumn(modifier = Modifier.weight(1f).fillMaxWidth()) {
                item {
                    Row(
                        modifier = Modifier
                            .fillMaxWidth()
                            .background(barBg)
                            .padding(horizontal = 12.dp, vertical = 6.dp)
                    ) {
                        Text("Name", color = mutedColor, fontSize = 11.sp, fontWeight = FontWeight.SemiBold, modifier = Modifier.weight(1.6f))
                        Text("Original Location", color = mutedColor, fontSize = 11.sp, fontWeight = FontWeight.SemiBold, modifier = Modifier.weight(1f))
                        Text("Size", color = mutedColor, fontSize = 11.sp, fontWeight = FontWeight.SemiBold, modifier = Modifier.weight(0.6f))
                    }
                }
                items(recycled, key = { it.id }) { file ->
                    val selected = selectedId == file.id
                    Row(
                        verticalAlignment = Alignment.CenterVertically,
                        modifier = Modifier
                            .fillMaxWidth()
                            .background(if (selected) accentColor.copy(alpha = 0.22f) else Color.Transparent)
                            .clickable { selectedId = file.id }
                            .padding(horizontal = 12.dp, vertical = 8.dp)
                    ) {
                        Row(verticalAlignment = Alignment.CenterVertically, modifier = Modifier.weight(1.6f)) {
                            WinFileIcon(isFolder = file.isFolder, extension = file.extension, size = 18.dp)
                            Spacer(Modifier.width(8.dp))
                            Text(file.name, color = textColor, fontSize = 12.sp, maxLines = 1, overflow = TextOverflow.Ellipsis)
                        }
                        Text(file.location.displayName, color = mutedColor, fontSize = 11.sp, modifier = Modifier.weight(1f))
                        Text(file.size, color = mutedColor, fontSize = 11.sp, modifier = Modifier.weight(0.6f))
                    }
                }
            }
        }

        HorizontalDivider(color = borderColor)
        Row(modifier = Modifier.fillMaxWidth().background(barBg).padding(horizontal = 10.dp, vertical = 4.dp)) {
            Text("${recycled.size} item(s)", color = mutedColor, fontSize = 11.sp)
        }
    }
}
