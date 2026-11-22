package com.example.ui.apps

import androidx.compose.foundation.Canvas
import androidx.compose.foundation.background
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
import androidx.compose.foundation.layout.width
import androidx.compose.foundation.rememberScrollState
import androidx.compose.foundation.text.BasicTextField
import androidx.compose.foundation.text.KeyboardActions
import androidx.compose.foundation.text.KeyboardOptions
import androidx.compose.foundation.verticalScroll
import androidx.compose.material3.Text
import androidx.compose.runtime.Composable
import androidx.compose.runtime.LaunchedEffect
import androidx.compose.runtime.getValue
import androidx.compose.runtime.mutableIntStateOf
import androidx.compose.runtime.mutableStateListOf
import androidx.compose.runtime.mutableStateMapOf
import androidx.compose.runtime.mutableStateOf
import androidx.compose.runtime.remember
import androidx.compose.runtime.setValue
import androidx.compose.ui.Alignment
import androidx.compose.ui.Modifier
import androidx.compose.ui.graphics.Color
import androidx.compose.ui.graphics.SolidColor
import androidx.compose.ui.platform.testTag
import androidx.compose.ui.text.TextStyle
import androidx.compose.ui.text.drawText
import androidx.compose.ui.text.font.FontFamily
import androidx.compose.ui.text.input.ImeAction
import androidx.compose.ui.text.rememberTextMeasurer
import androidx.compose.ui.unit.dp
import androidx.compose.ui.unit.sp
import com.example.model.AppId
import com.example.model.FileItem
import com.example.model.FileLocation
import kotlinx.coroutines.delay
import java.text.SimpleDateFormat
import java.util.Date
import java.util.Locale
import kotlin.random.Random

@Composable
fun CommandPromptApp(
    files: List<FileItem>,
    onOpenApp: (AppId) -> Unit,
    onCreateFolder: (String, FileLocation) -> Unit,
    onTriggerBsod: () -> Unit,
    onClose: () -> Unit
) {
    val lines = remember {
        mutableStateListOf(
            "Microsoft Windows [Version 10.0.19045.5011]",
            "(c) Microsoft Corporation. All rights reserved.",
            ""
        )
    }
    var currentLocation by remember { mutableStateOf(FileLocation.DESKTOP) }
    var input by remember { mutableStateOf("") }
    val cmdHistory = remember { mutableStateListOf<String>() }
    var historyIdx by remember { mutableIntStateOf(-1) }
    var textColor by remember { mutableStateOf(Color(0xFFE4E4E7)) }
    var matrixActive by remember { mutableStateOf(false) }

    val envVars = remember {
        mutableStateMapOf(
            "USER" to "User",
            "USERNAME" to "User",
            "COMPUTERNAME" to "DESKTOP-WIN10",
            "OS" to "Windows_NT"
        )
    }

    val scrollState = rememberScrollState()
    LaunchedEffect(lines.size) {
        scrollState.animateScrollTo(scrollState.maxValue)
    }

    fun pathFor(loc: FileLocation) = "C:\\Users\\User\\${loc.displayName}"

    fun executeSingle(raw: String): Boolean {
        val expanded = Regex("""\$(\w+)""").replace(raw) { m -> envVars[m.groupValues[1]] ?: "" }.trim()
        if (expanded.isEmpty()) return true
        val parts = expanded.split(Regex("\\s+"))
        val cmd = parts[0].lowercase()
        val arg = parts.drop(1).joinToString(" ")

        return when (cmd) {
            "help" -> {
                lines.addAll(
                    listOf(
                        "Supported commands:",
                        "  HELP        Show this help summary",
                        "  CLS / CLEAR Clear terminal output",
                        "  DIR / LS    List files in current directory",
                        "  CD <dir>    Change directory (Desktop, Documents, Pictures, Downloads, Music)",
                        "  MKDIR <dir> Create folder in current directory",
                        "  ECHO <txt>  Print text",
                        "  SET K=V     Set environment variable",
                        "  PRINTENV    Show environment variables",
                        "  VER         Windows version",
                        "  SYSTEMINFO  Hardware & OS specs",
                        "  IPCONFIG    Network configuration",
                        "  PING <host> Test network reachability",
                        "  DATE / TIME Show current date or time",
                        "  WHOAMI      Current user",
                        "  HOSTNAME    Machine hostname",
                        "  COLOR <hex> Terminal foreground (0a=green, 0b=cyan, 0c=red, 0e=yellow, 0f=white)",
                        "  CALC / NOTEPAD / PAINT / EXPLORER / EDGE  Launch apps",
                        "  MATRIX      Falling digital rain effect",
                        "  BSOD        Trigger Stop Error demo",
                        "  EXIT        Close Command Prompt"
                    )
                )
                true
            }
            "cls", "clear" -> {
                lines.clear()
                true
            }
            "ver" -> {
                lines.add("Microsoft Windows [Version 10.0.19045.5011]")
                true
            }
            "whoami" -> {
                lines.add("desktop-win10\\user")
                true
            }
            "hostname" -> {
                lines.add(envVars["COMPUTERNAME"] ?: "DESKTOP-WIN10")
                true
            }
            "pwd" -> {
                lines.add(pathFor(currentLocation))
                true
            }
            "date" -> {
                lines.add("The current date is: ${SimpleDateFormat("EEE MM/dd/yyyy", Locale.getDefault()).format(Date())}")
                true
            }
            "time" -> {
                lines.add("The current time is: ${SimpleDateFormat("HH:mm:ss.SS", Locale.getDefault()).format(Date())}")
                true
            }
            "echo" -> {
                lines.add(arg)
                true
            }
            "set" -> {
                if (arg.contains("=")) {
                    val (k, v) = arg.split("=", limit = 2)
                    envVars[k.trim().uppercase()] = v.trim()
                } else {
                    envVars.forEach { (k, v) -> lines.add("$k=$v") }
                }
                true
            }
            "printenv", "env" -> {
                envVars.forEach { (k, v) -> lines.add("$k=$v") }
                true
            }
            "dir", "ls" -> {
                lines.add(" Directory of ${pathFor(currentLocation)}")
                lines.add("")
                val dirFiles = files.filter { !it.isRecycled && it.location == currentLocation }
                dirFiles.forEach { f ->
                    val tag = if (f.isFolder) "<DIR>    " else f.size.padEnd(9)
                    lines.add("${f.date}   $tag   ${f.name}")
                }
                lines.add("              ${dirFiles.size} item(s)")
                true
            }
            "cd" -> {
                val target = arg.trim().lowercase()
                val match = FileLocation.entries.firstOrNull {
                    it != FileLocation.RECYCLEBIN && it.displayName.lowercase() == target
                }
                if (target.isEmpty() || target == ".") {
                    lines.add(pathFor(currentLocation))
                    true
                } else if (target == ".." || target == "~" || target == "\\") {
                    currentLocation = FileLocation.DESKTOP
                    true
                } else if (match != null) {
                    currentLocation = match
                    true
                } else {
                    lines.add("The system cannot find the path specified: $arg")
                    false
                }
            }
            "mkdir", "md" -> {
                if (arg.isBlank()) {
                    lines.add("The syntax of the command is incorrect.")
                    false
                } else {
                    onCreateFolder(arg.trim(), currentLocation)
                    lines.add("Created folder \"${arg.trim()}\" in ${currentLocation.displayName}.")
                    true
                }
            }
            "ipconfig" -> {
                lines.addAll(
                    listOf(
                        "Windows IP Configuration",
                        "   Wireless LAN adapter Wi-Fi:",
                        "      IPv4 Address. . . . . . . . . . . : 192.168.1.42",
                        "      Subnet Mask . . . . . . . . . . . : 255.255.255.0",
                        "      Default Gateway . . . . . . . . . : 192.168.1.1"
                    )
                )
                true
            }
            "systeminfo" -> {
                lines.addAll(
                    listOf(
                        "Host Name:                 DESKTOP-WIN10",
                        "OS Name:                   Microsoft Windows 10 Pro",
                        "OS Version:                10.0.19045 N/A Build 19045",
                        "System Type:               ARM64 / Android Native",
                        "Total Physical Memory:     16,384 MB"
                    )
                )
                true
            }
            "ping" -> {
                val host = arg.ifBlank { "localhost" }
                lines.addAll(
                    listOf(
                        "Pinging $host [142.250.190.78] with 32 bytes of data:",
                        "Reply from 142.250.190.78: bytes=32 time=11ms TTL=117",
                        "Reply from 142.250.190.78: bytes=32 time=10ms TTL=117",
                        "Ping statistics: Sent = 2, Received = 2, Lost = 0 (0% loss)"
                    )
                )
                true
            }
            "color" -> {
                textColor = when (arg.lowercase()) {
                    "0a" -> Color(0xFF4ADE80)
                    "0b" -> Color(0xFF22D3EE)
                    "0c" -> Color(0xFFF87171)
                    "0e" -> Color(0xFFFACC15)
                    else -> Color(0xFFE4E4E7)
                }
                true
            }
            "calc" -> { onOpenApp(AppId.CALC); true }
            "notepad" -> { onOpenApp(AppId.NOTEPAD); true }
            "paint" -> { onOpenApp(AppId.PAINT); true }
            "explorer" -> { onOpenApp(AppId.EXPLORER); true }
            "edge" -> { onOpenApp(AppId.EDGE); true }
            "matrix" -> { matrixActive = true; true }
            "bsod" -> { onTriggerBsod(); true }
            "exit" -> { onClose(); true }
            else -> {
                lines.add("'$cmd' is not recognized as an internal or external command.")
                false
            }
        }
    }

    fun submitCommand() {
        val raw = input
        input = ""
        lines.add("${pathFor(currentLocation)}> $raw")
        if (raw.isBlank()) return
        cmdHistory.add(0, raw)
        historyIdx = -1

        // Support chaining via &&, ||, ;
        val segments = raw.split(";")
        for (seg in segments) {
            val andParts = seg.split("&&")
            var ok = true
            for (ap in andParts) {
                if (!ok) break
                val orParts = ap.split("||")
                var orOk = false
                for (op in orParts) {
                    if (executeSingle(op)) {
                        orOk = true
                        break
                    }
                }
                ok = orOk
            }
        }
    }

    Box(
        modifier = Modifier
            .fillMaxSize()
            .background(Color(0xFF0C0C0C))
            .testTag("app_cmd")
    ) {
        Column(
            modifier = Modifier
                .fillMaxSize()
                .padding(10.dp)
        ) {
            // History helper toolbar for mobile
            Row(
                horizontalArrangement = Arrangement.spacedBy(8.dp),
                modifier = Modifier.fillMaxWidth().padding(bottom = 6.dp)
            ) {
                listOf("help", "dir", "systeminfo", "matrix", "cls").forEach { quick ->
                    Text(
                        quick,
                        color = Color(0xFFA1A1AA),
                        fontSize = 10.sp,
                        fontFamily = FontFamily.Monospace,
                        modifier = Modifier
                            .background(Color(0xFF1F1F23))
                            .clickable {
                                input = quick
                                submitCommand()
                            }
                            .padding(horizontal = 8.dp, vertical = 4.dp)
                    )
                }
                Spacer(Modifier.weight(1f))
                Text(
                    "▲",
                    color = Color(0xFFD4D4D8),
                    fontSize = 11.sp,
                    modifier = Modifier
                        .background(Color(0xFF1F1F23))
                        .clickable {
                            if (cmdHistory.isNotEmpty()) {
                                historyIdx = (historyIdx + 1).coerceAtMost(cmdHistory.lastIndex)
                                input = cmdHistory[historyIdx]
                            }
                        }
                        .padding(horizontal = 8.dp, vertical = 3.dp)
                )
                Text(
                    "▼",
                    color = Color(0xFFD4D4D8),
                    fontSize = 11.sp,
                    modifier = Modifier
                        .background(Color(0xFF1F1F23))
                        .clickable {
                            if (historyIdx > 0) {
                                historyIdx--
                                input = cmdHistory[historyIdx]
                            } else {
                                historyIdx = -1
                                input = ""
                            }
                        }
                        .padding(horizontal = 8.dp, vertical = 3.dp)
                )
            }

            // Output Scroll Area
            Column(
                modifier = Modifier
                    .weight(1f)
                    .fillMaxWidth()
                    .verticalScroll(scrollState)
            ) {
                lines.forEach { line ->
                    Text(
                        text = line,
                        color = textColor,
                        fontSize = 12.sp,
                        fontFamily = FontFamily.Monospace,
                        lineHeight = 16.sp
                    )
                }
                Spacer(Modifier.height(4.dp))
                Row(
                    verticalAlignment = Alignment.CenterVertically,
                    modifier = Modifier.fillMaxWidth()
                ) {
                    Text(
                        text = "${pathFor(currentLocation)}> ",
                        color = textColor,
                        fontSize = 12.sp,
                        fontFamily = FontFamily.Monospace
                    )
                    BasicTextField(
                        value = input,
                        onValueChange = { input = it },
                        singleLine = true,
                        textStyle = TextStyle(color = textColor, fontSize = 12.sp, fontFamily = FontFamily.Monospace),
                        cursorBrush = SolidColor(textColor),
                        keyboardOptions = KeyboardOptions(imeAction = ImeAction.Done),
                        keyboardActions = KeyboardActions(onDone = { submitCommand() }),
                        modifier = Modifier
                            .weight(1f)
                            .testTag("cmd_input")
                    )
                    Spacer(Modifier.width(6.dp))
                    Text(
                        "RUN",
                        color = Color(0xFF4ADE80),
                        fontSize = 11.sp,
                        fontFamily = FontFamily.Monospace,
                        modifier = Modifier
                            .background(Color(0xFF1E293B))
                            .clickable { submitCommand() }
                            .padding(horizontal = 8.dp, vertical = 4.dp)
                    )
                }
            }
        }

        if (matrixActive) {
            MatrixRainOverlay(onFinish = { matrixActive = false })
        }
    }
}

@Composable
private fun MatrixRainOverlay(onFinish: () -> Unit) {
    val measurer = rememberTextMeasurer()
    var tick by remember { mutableIntStateOf(0) }
    val columns = 26
    val drops = remember { IntArray(columns) { Random.nextInt(0, 20) } }

    LaunchedEffect(Unit) {
        val start = System.currentTimeMillis()
        while (System.currentTimeMillis() - start < 7500) {
            delay(80)
            for (i in drops.indices) {
                drops[i] = (drops[i] + 1) % 30
            }
            tick++
        }
        onFinish()
    }

    Canvas(
        modifier = Modifier
            .fillMaxSize()
            .background(Color.Black.copy(alpha = 0.92f))
            .clickable { onFinish() }
    ) {
        val ignored = tick
        val colW = size.width / columns
        val chars = "01アイウエオカキクケコサシスセソ"
        for (c in 0 until columns) {
            val yRow = drops[c]
            for (trail in 0 until 8) {
                val y = ((yRow - trail + 30) % 30) * 18.dp.toPx()
                if (y < size.height) {
                    val ch = chars[(c * 7 + trail + ignored) % chars.length].toString()
                    val alpha = (1f - trail * 0.12f).coerceAtLeast(0.1f)
                    drawText(
                        textMeasurer = measurer,
                        text = ch,
                        topLeft = androidx.compose.ui.geometry.Offset(c * colW, y),
                        style = TextStyle(
                            color = if (trail == 0) Color(0xFFBBF7D0) else Color(0xFF22C55E).copy(alpha = alpha),
                            fontSize = 13.sp,
                            fontFamily = FontFamily.Monospace
                        )
                    )
                }
            }
        }
    }
}
