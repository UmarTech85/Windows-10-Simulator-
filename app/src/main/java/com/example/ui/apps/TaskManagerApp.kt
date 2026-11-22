package com.example.ui.apps

import androidx.compose.foundation.Canvas
import androidx.compose.foundation.background
import androidx.compose.foundation.border
import androidx.compose.foundation.clickable
import androidx.compose.foundation.layout.Arrangement
import androidx.compose.foundation.layout.Box
import androidx.compose.foundation.layout.Column
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
import androidx.compose.foundation.verticalScroll
import androidx.compose.material3.Button
import androidx.compose.material3.ButtonDefaults
import androidx.compose.material3.HorizontalDivider
import androidx.compose.material3.Text
import androidx.compose.runtime.Composable
import androidx.compose.runtime.LaunchedEffect
import androidx.compose.runtime.getValue
import androidx.compose.runtime.mutableFloatStateOf
import androidx.compose.runtime.mutableIntStateOf
import androidx.compose.runtime.mutableStateListOf
import androidx.compose.runtime.mutableStateOf
import androidx.compose.runtime.remember
import androidx.compose.runtime.setValue
import androidx.compose.ui.Alignment
import androidx.compose.ui.Modifier
import androidx.compose.ui.draw.clip
import androidx.compose.ui.geometry.Offset
import androidx.compose.ui.graphics.Brush
import androidx.compose.ui.graphics.Color
import androidx.compose.ui.graphics.Path
import androidx.compose.ui.graphics.drawscope.Stroke
import androidx.compose.ui.platform.testTag
import androidx.compose.ui.text.font.FontWeight
import androidx.compose.ui.text.style.TextOverflow
import androidx.compose.ui.unit.dp
import androidx.compose.ui.unit.sp
import com.example.model.AppRegistry
import com.example.model.WindowState
import com.example.ui.components.WinAppIcon
import kotlinx.coroutines.delay
import kotlin.random.Random

@Composable
fun TaskManagerApp(
    windows: List<WindowState>,
    isDarkTheme: Boolean,
    accentColor: Color,
    onCloseWindow: (String) -> Unit
) {
    var activeTab by remember { mutableIntStateOf(0) } // 0 = Processes, 1 = Performance
    var selectedWindowId by remember { mutableStateOf<String?>(null) }
    val cpuHistory = remember { mutableStateListOf<Float>().apply { repeat(28) { add(12f + Random.nextFloat() * 16f) } } }
    var currentCpu by remember { mutableFloatStateOf(16f) }
    var memGb by remember { mutableFloatStateOf(4.8f) }

    LaunchedEffect(windows.size) {
        while (true) {
            val base = (8f + windows.size * 6.5f).coerceAtMost(88f)
            val next = (base + Random.nextFloat() * 14f - 5f).coerceIn(4f, 96f)
            currentCpu = next
            memGb = (3.4f + windows.size * 0.45f + Random.nextFloat() * 0.3f).coerceIn(2.5f, 15.2f)
            cpuHistory.add(next)
            if (cpuHistory.size > 30) cpuHistory.removeAt(0)
            delay(1000)
        }
    }

    val bg = if (isDarkTheme) Color(0xFF19191B) else Color.White
    val barBg = if (isDarkTheme) Color(0xFF242428) else Color(0xFFF3F4F6)
    val textColor = if (isDarkTheme) Color.White else Color(0xFF18181B)
    val mutedColor = if (isDarkTheme) Color(0xFFA1A1AA) else Color(0xFF64748B)
    val borderColor = if (isDarkTheme) Color.White.copy(alpha = 0.1f) else Color(0xFFE2E8F0)

    Column(
        modifier = Modifier
            .fillMaxSize()
            .background(bg)
            .testTag("app_taskmanager")
    ) {
        // Tabs
        Row(
            modifier = Modifier
                .fillMaxWidth()
                .background(barBg)
                .padding(horizontal = 8.dp)
        ) {
            listOf("Processes", "Performance").forEachIndexed { idx, label ->
                val active = activeTab == idx
                Column(
                    modifier = Modifier
                        .clickable { activeTab = idx }
                        .padding(horizontal = 12.dp, vertical = 10.dp)
                ) {
                    Text(
                        label,
                        color = if (active) accentColor else mutedColor,
                        fontSize = 12.sp,
                        fontWeight = if (active) FontWeight.SemiBold else FontWeight.Normal
                    )
                }
            }
        }
        HorizontalDivider(color = borderColor)

        if (activeTab == 0) {
            Column(modifier = Modifier.weight(1f).fillMaxWidth()) {
                Row(
                    modifier = Modifier
                        .fillMaxWidth()
                        .background(barBg)
                        .padding(horizontal = 12.dp, vertical = 6.dp)
                ) {
                    Text("Name", color = mutedColor, fontSize = 11.sp, fontWeight = FontWeight.SemiBold, modifier = Modifier.weight(1.8f))
                    Text("CPU", color = mutedColor, fontSize = 11.sp, fontWeight = FontWeight.SemiBold, modifier = Modifier.weight(0.6f))
                    Text("Memory", color = mutedColor, fontSize = 11.sp, fontWeight = FontWeight.SemiBold, modifier = Modifier.weight(0.8f))
                }

                LazyColumn(modifier = Modifier.weight(1f)) {
                    items(windows, key = { it.id }) { win ->
                        val selected = selectedWindowId == win.id
                        val memMb = 110 + (win.appId.ordinal * 28) % 240
                        val cpuPct = "%.1f%%".format(1.2f + (win.appId.ordinal % 5) * 1.1f)
                        Row(
                            verticalAlignment = Alignment.CenterVertically,
                            modifier = Modifier
                                .fillMaxWidth()
                                .background(if (selected) accentColor.copy(alpha = 0.22f) else Color.Transparent)
                                .clickable { selectedWindowId = win.id }
                                .padding(horizontal = 12.dp, vertical = 9.dp)
                        ) {
                            Row(verticalAlignment = Alignment.CenterVertically, modifier = Modifier.weight(1.8f)) {
                                WinAppIcon(appId = win.appId, size = 18.dp)
                                Spacer(Modifier.width(8.dp))
                                Text(
                                    AppRegistry.get(win.appId).name,
                                    color = textColor,
                                    fontSize = 12.sp,
                                    maxLines = 1,
                                    overflow = TextOverflow.Ellipsis
                                )
                            }
                            Text(cpuPct, color = textColor, fontSize = 11.sp, modifier = Modifier.weight(0.6f))
                            Text("$memMb MB", color = textColor, fontSize = 11.sp, modifier = Modifier.weight(0.8f))
                        }
                    }

                    val bgServices = listOf(
                        Triple("Windows Explorer Shell", "0.4%", "86 MB"),
                        Triple("Desktop Window Manager", "1.1%", "124 MB"),
                        Triple("Antimalware Service Executable", "0.2%", "142 MB"),
                        Triple("System Interrupts", "0.1%", "12 MB")
                    )
                    items(bgServices) { (name, cpu, mem) ->
                        Row(
                            verticalAlignment = Alignment.CenterVertically,
                            modifier = Modifier.fillMaxWidth().padding(horizontal = 12.dp, vertical = 8.dp)
                        ) {
                            Text(name, color = mutedColor, fontSize = 12.sp, modifier = Modifier.weight(1.8f), maxLines = 1, overflow = TextOverflow.Ellipsis)
                            Text(cpu, color = mutedColor, fontSize = 11.sp, modifier = Modifier.weight(0.6f))
                            Text(mem, color = mutedColor, fontSize = 11.sp, modifier = Modifier.weight(0.8f))
                        }
                    }
                }

                HorizontalDivider(color = borderColor)
                Row(
                    verticalAlignment = Alignment.CenterVertically,
                    horizontalArrangement = Arrangement.SpaceBetween,
                    modifier = Modifier.fillMaxWidth().background(barBg).padding(horizontal = 12.dp, vertical = 8.dp)
                ) {
                    Text("Apps running: ${windows.size}", color = mutedColor, fontSize = 11.sp)
                    Button(
                        onClick = {
                            selectedWindowId?.let { id ->
                                onCloseWindow(id)
                                selectedWindowId = null
                            }
                        },
                        enabled = selectedWindowId != null,
                        colors = ButtonDefaults.buttonColors(containerColor = accentColor),
                        shape = RoundedCornerShape(4.dp),
                        modifier = Modifier.height(34.dp).testTag("taskmgr_end_task")
                    ) {
                        Text("End task", fontSize = 12.sp)
                    }
                }
            }
        } else {
            Column(
                modifier = Modifier
                    .weight(1f)
                    .fillMaxWidth()
                    .verticalScroll(rememberScrollState())
                    .padding(14.dp),
                verticalArrangement = Arrangement.spacedBy(14.dp)
            ) {
                Row(horizontalArrangement = Arrangement.SpaceBetween, modifier = Modifier.fillMaxWidth()) {
                    Text("CPU", color = textColor, fontSize = 18.sp, fontWeight = FontWeight.SemiBold)
                    Text("${currentCpu.toInt()}%  •  3.80 GHz", color = accentColor, fontSize = 14.sp, fontWeight = FontWeight.Bold)
                }

                Box(
                    modifier = Modifier
                        .fillMaxWidth()
                        .height(140.dp)
                        .border(1.dp, accentColor.copy(alpha = 0.6f), RoundedCornerShape(4.dp))
                        .background(if (isDarkTheme) Color(0xFF101827) else Color(0xFFF0F9FF))
                        .padding(8.dp)
                ) {
                    Canvas(modifier = Modifier.fillMaxSize()) {
                        val pts = cpuHistory
                        if (pts.size < 2) return@Canvas
                        val stepX = size.width / (pts.size - 1)
                        val linePath = Path()
                        val fillPath = Path()
                        pts.forEachIndexed { idx, v ->
                            val x = idx * stepX
                            val y = size.height - (v / 100f) * size.height
                            if (idx == 0) {
                                linePath.moveTo(x, y)
                                fillPath.moveTo(x, size.height)
                                fillPath.lineTo(x, y)
                            } else {
                                linePath.lineTo(x, y)
                                fillPath.lineTo(x, y)
                            }
                        }
                        fillPath.lineTo(size.width, size.height)
                        fillPath.close()
                        drawPath(fillPath, Brush.verticalGradient(listOf(accentColor.copy(alpha = 0.35f), Color.Transparent)))
                        drawPath(linePath, color = accentColor, style = Stroke(width = 3f))
                    }
                }

                Row(horizontalArrangement = Arrangement.SpaceBetween, modifier = Modifier.fillMaxWidth()) {
                    Text("Memory (DDR5)", color = textColor, fontSize = 15.sp, fontWeight = FontWeight.SemiBold)
                    Text("${"%.1f".format(memGb)} / 16.0 GB", color = mutedColor, fontSize = 12.sp)
                }
                Box(
                    modifier = Modifier
                        .fillMaxWidth()
                        .height(14.dp)
                        .clip(RoundedCornerShape(4.dp))
                        .background(borderColor)
                ) {
                    Box(
                        modifier = Modifier
                            .fillMaxWidth((memGb / 16f).coerceIn(0.1f, 1f))
                            .fillMaxHeight()
                            .background(Color(0xFF8B5CF6))
                    )
                }

                Row(horizontalArrangement = Arrangement.spacedBy(12.dp), modifier = Modifier.fillMaxWidth()) {
                    MetricBox("Processes", "${windows.size + 4}", textColor, mutedColor, borderColor, Modifier.weight(1f))
                    MetricBox("Threads", "${(windows.size + 4) * 14}", textColor, mutedColor, borderColor, Modifier.weight(1f))
                    MetricBox("Up time", "0:04:22:18", textColor, mutedColor, borderColor, Modifier.weight(1f))
                }
            }
        }
    }
}

@Composable
private fun MetricBox(
    label: String,
    value: String,
    textColor: Color,
    mutedColor: Color,
    borderColor: Color,
    modifier: Modifier = Modifier
) {
    Column(
        modifier = modifier
            .border(1.dp, borderColor, RoundedCornerShape(4.dp))
            .padding(10.dp)
    ) {
        Text(label, color = mutedColor, fontSize = 10.sp)
        Spacer(Modifier.height(3.dp))
        Text(value, color = textColor, fontSize = 14.sp, fontWeight = FontWeight.SemiBold)
    }
}
