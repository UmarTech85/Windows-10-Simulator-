package com.example.ui.apps

import android.widget.Toast
import androidx.compose.foundation.background
import androidx.compose.foundation.clickable
import androidx.compose.foundation.layout.Arrangement
import androidx.compose.foundation.layout.Box
import androidx.compose.foundation.layout.Column
import androidx.compose.foundation.layout.Row
import androidx.compose.foundation.layout.fillMaxSize
import androidx.compose.foundation.layout.fillMaxWidth
import androidx.compose.foundation.layout.padding
import androidx.compose.foundation.rememberScrollState
import androidx.compose.foundation.text.BasicTextField
import androidx.compose.foundation.verticalScroll
import androidx.compose.material3.DropdownMenu
import androidx.compose.material3.DropdownMenuItem
import androidx.compose.material3.HorizontalDivider
import androidx.compose.material3.Text
import androidx.compose.runtime.Composable
import androidx.compose.runtime.LaunchedEffect
import androidx.compose.runtime.getValue
import androidx.compose.runtime.mutableIntStateOf
import androidx.compose.runtime.mutableStateOf
import androidx.compose.runtime.remember
import androidx.compose.runtime.setValue
import androidx.compose.ui.Alignment
import androidx.compose.ui.Modifier
import androidx.compose.ui.graphics.Color
import androidx.compose.ui.graphics.SolidColor
import androidx.compose.ui.platform.LocalContext
import androidx.compose.ui.platform.testTag
import androidx.compose.ui.text.TextStyle
import androidx.compose.ui.text.font.FontFamily
import androidx.compose.ui.unit.dp
import androidx.compose.ui.unit.sp
import com.example.model.FileItem
import java.text.SimpleDateFormat
import java.util.Date
import java.util.Locale

@Composable
fun NotepadApp(
    files: List<FileItem>,
    initialFileId: String?,
    isDarkTheme: Boolean,
    onSaveFile: (name: String, content: String, fileId: String?) -> String,
    onUpdateTitle: (String) -> Unit,
    onClose: () -> Unit
) {
    val context = LocalContext.current
    var currentFileId by remember { mutableStateOf(initialFileId) }
    var fileName by remember { mutableStateOf("Untitled") }
    var content by remember { mutableStateOf("") }
    var isDirty by remember { mutableStateOf(false) }
    var wordWrap by remember { mutableStateOf(true) }
    var fontSizeSp by remember { mutableIntStateOf(14) }
    var openMenu by remember { mutableStateOf<String?>(null) }

    LaunchedEffect(initialFileId) {
        val loaded = initialFileId?.let { id -> files.firstOrNull { it.id == id } }
        if (loaded != null) {
            currentFileId = loaded.id
            fileName = loaded.name
            content = loaded.content
            isDirty = false
        }
    }

    LaunchedEffect(fileName, isDirty) {
        onUpdateTitle("${if (isDirty) "*" else ""}$fileName - Notepad")
    }

    val bg = if (isDarkTheme) Color(0xFF18181B) else Color.White
    val barBg = if (isDarkTheme) Color(0xFF27272A) else Color(0xFFF3F4F6)
    val textColor = if (isDarkTheme) Color(0xFFF4F4F5) else Color(0xFF18181B)
    val mutedColor = if (isDarkTheme) Color(0xFFA1A1AA) else Color(0xFF64748B)
    val borderColor = if (isDarkTheme) Color.White.copy(alpha = 0.1f) else Color(0xFFE2E8F0)

    Column(
        modifier = Modifier
            .fillMaxSize()
            .background(bg)
            .testTag("app_notepad")
    ) {
        // Menu Bar
        Row(
            verticalAlignment = Alignment.CenterVertically,
            modifier = Modifier
                .fillMaxWidth()
                .background(barBg)
                .padding(horizontal = 6.dp, vertical = 2.dp)
        ) {
            Box {
                Text(
                    "File",
                    color = textColor,
                    fontSize = 12.sp,
                    modifier = Modifier
                        .clickable { openMenu = "file" }
                        .padding(horizontal = 10.dp, vertical = 6.dp)
                )
                DropdownMenu(expanded = openMenu == "file", onDismissRequest = { openMenu = null }) {
                    DropdownMenuItem(text = { Text("New") }, onClick = {
                        currentFileId = null
                        fileName = "Untitled"
                        content = ""
                        isDirty = false
                        openMenu = null
                    })
                    DropdownMenuItem(text = { Text("Save") }, onClick = {
                        val saveName = if (currentFileId != null) fileName else "Note_${System.currentTimeMillis().toString().takeLast(4)}.txt"
                        val savedId = onSaveFile(saveName, content, currentFileId)
                        currentFileId = savedId
                        fileName = saveName
                        isDirty = false
                        openMenu = null
                        Toast.makeText(context, "Saved $saveName", Toast.LENGTH_SHORT).show()
                    })
                    DropdownMenuItem(text = { Text("Exit") }, onClick = {
                        openMenu = null
                        onClose()
                    })
                }
            }

            Box {
                Text(
                    "Edit",
                    color = textColor,
                    fontSize = 12.sp,
                    modifier = Modifier
                        .clickable { openMenu = "edit" }
                        .padding(horizontal = 10.dp, vertical = 6.dp)
                )
                DropdownMenu(expanded = openMenu == "edit", onDismissRequest = { openMenu = null }) {
                    DropdownMenuItem(text = { Text("Time/Date") }, onClick = {
                        val stamp = SimpleDateFormat("h:mm a M/d/yyyy", Locale.getDefault()).format(Date())
                        content += stamp
                        isDirty = true
                        openMenu = null
                    })
                    DropdownMenuItem(text = { Text("Clear All") }, onClick = {
                        content = ""
                        isDirty = true
                        openMenu = null
                    })
                }
            }

            Box {
                Text(
                    "Format",
                    color = textColor,
                    fontSize = 12.sp,
                    modifier = Modifier
                        .clickable { openMenu = "format" }
                        .padding(horizontal = 10.dp, vertical = 6.dp)
                )
                DropdownMenu(expanded = openMenu == "format", onDismissRequest = { openMenu = null }) {
                    DropdownMenuItem(
                        text = { Text("${if (wordWrap) "✓ " else ""}Word Wrap") },
                        onClick = {
                            wordWrap = !wordWrap
                            openMenu = null
                        }
                    )
                    listOf(12, 14, 16, 18, 22).forEach { sz ->
                        DropdownMenuItem(
                            text = { Text("${if (fontSizeSp == sz) "✓ " else ""}Font Size ${sz}sp") },
                            onClick = {
                                fontSizeSp = sz
                                openMenu = null
                            }
                        )
                    }
                }
            }
        }
        HorizontalDivider(color = borderColor)

        // Text Editor
        Box(
            modifier = Modifier
                .weight(1f)
                .fillMaxWidth()
                .verticalScroll(rememberScrollState())
                .padding(12.dp)
        ) {
            if (content.isEmpty()) {
                Text("Start typing...", color = mutedColor.copy(alpha = 0.6f), fontSize = fontSizeSp.sp, fontFamily = FontFamily.Monospace)
            }
            BasicTextField(
                value = content,
                onValueChange = {
                    content = it
                    isDirty = true
                },
                textStyle = TextStyle(
                    color = textColor,
                    fontSize = fontSizeSp.sp,
                    fontFamily = FontFamily.Monospace,
                    lineHeight = (fontSizeSp + 6).sp
                ),
                cursorBrush = SolidColor(textColor),
                modifier = Modifier
                    .fillMaxSize()
                    .testTag("notepad_editor")
            )
        }

        // Status Bar
        HorizontalDivider(color = borderColor)
        val lines = remember(content) { content.split('\n') }
        Row(
            horizontalArrangement = Arrangement.SpaceBetween,
            modifier = Modifier
                .fillMaxWidth()
                .background(barBg)
                .padding(horizontal = 10.dp, vertical = 4.dp)
        ) {
            Text("Ln ${lines.size}, Col ${(lines.lastOrNull()?.length ?: 0) + 1}", color = mutedColor, fontSize = 11.sp)
            Text("${content.length} chars  |  UTF-8", color = mutedColor, fontSize = 11.sp)
        }
    }
}
