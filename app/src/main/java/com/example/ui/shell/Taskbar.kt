package com.example.ui.shell

import androidx.compose.foundation.ExperimentalFoundationApi
import androidx.compose.foundation.background
import androidx.compose.foundation.border
import androidx.compose.foundation.clickable
import androidx.compose.foundation.combinedClickable
import androidx.compose.foundation.horizontalScroll
import androidx.compose.foundation.layout.Arrangement
import androidx.compose.foundation.layout.Box
import androidx.compose.foundation.layout.Column
import androidx.compose.foundation.layout.Row
import androidx.compose.foundation.layout.Spacer
import androidx.compose.foundation.layout.fillMaxHeight
import androidx.compose.foundation.layout.fillMaxWidth
import androidx.compose.foundation.layout.height
import androidx.compose.foundation.layout.navigationBarsPadding
import androidx.compose.foundation.layout.padding
import androidx.compose.foundation.layout.size
import androidx.compose.foundation.layout.width
import androidx.compose.foundation.rememberScrollState
import androidx.compose.foundation.shape.CircleShape
import androidx.compose.foundation.shape.RoundedCornerShape
import androidx.compose.material.icons.Icons
import androidx.compose.material.icons.filled.BatteryChargingFull
import androidx.compose.material.icons.filled.ChatBubbleOutline
import androidx.compose.material.icons.filled.Close
import androidx.compose.material.icons.filled.Layers
import androidx.compose.material.icons.filled.Search
import androidx.compose.material.icons.filled.Shield
import androidx.compose.material.icons.filled.VolumeOff
import androidx.compose.material.icons.filled.VolumeUp
import androidx.compose.material.icons.filled.Wifi
import androidx.compose.material.icons.filled.WifiOff
import androidx.compose.material3.DropdownMenu
import androidx.compose.material3.Icon
import androidx.compose.material3.Text
import androidx.compose.runtime.Composable
import androidx.compose.runtime.LaunchedEffect
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
import com.example.audio.WindowsSoundEngine
import com.example.model.AppId
import com.example.model.AppRegistry
import com.example.model.SystemNotification
import com.example.model.WindowState
import com.example.ui.components.WinAppIcon
import com.example.ui.components.WindowsLogoIcon
import com.example.viewmodel.ActiveFlyout
import kotlinx.coroutines.delay
import java.text.SimpleDateFormat
import java.util.Date
import java.util.Locale

@OptIn(ExperimentalFoundationApi::class)
@Composable
fun Taskbar(
    windows: List<WindowState>,
    activeWindowId: String?,
    notifications: List<SystemNotification>,
    activeFlyout: ActiveFlyout,
    volume: Int,
    muted: Boolean,
    wifiConnected: Boolean,
    accentColor: Color,
    isWideScreen: Boolean,
    onToggleFlyout: (ActiveFlyout) -> Unit,
    onAppClick: (AppId) -> Unit,
    onWindowClick: (WindowState) -> Unit,
    onCloseWindow: (String) -> Unit,
    onPeekDesktop: () -> Unit,
    modifier: Modifier = Modifier
) {
    var timeStr by remember { mutableStateOf("") }
    var dateStr by remember { mutableStateOf("") }
    var previewAppId by remember { mutableStateOf<AppId?>(null) }

    LaunchedEffect(Unit) {
        val timeFmt = SimpleDateFormat("hh:mm a", Locale.getDefault())
        val dateFmt = SimpleDateFormat("M/d/yyyy", Locale.getDefault())
        while (true) {
            val now = Date()
            timeStr = timeFmt.format(now)
            dateStr = dateFmt.format(now)
            delay(1000)
        }
    }

    val pinnedApps = remember {
        listOf(AppId.EXPLORER, AppId.EDGE, AppId.NOTEPAD, AppId.CALC, AppId.GROOVE)
    }
    val runningAppIds = windows.map { it.appId }.distinct()
    val taskbarAppIds = (pinnedApps + runningAppIds).distinct()
    val unreadCount = notifications.count { !it.read }

    Box(
        modifier = modifier
            .fillMaxWidth()
            .background(Color(0xEB0C0C0C))
            .navigationBarsPadding()
    ) {
        Row(
            verticalAlignment = Alignment.CenterVertically,
            horizontalArrangement = Arrangement.SpaceBetween,
            modifier = Modifier
                .fillMaxWidth()
                .height(48.dp)
                .border(0.5.dp, Color.White.copy(alpha = 0.1f))
        ) {
            // Left Zone: Start + Search + Task View + App Icons
            Row(
                verticalAlignment = Alignment.CenterVertically,
                modifier = Modifier
                    .weight(1f)
                    .fillMaxHeight()
            ) {
                // Start Button
                Box(
                    contentAlignment = Alignment.Center,
                    modifier = Modifier
                        .width(48.dp)
                        .fillMaxHeight()
                        .background(if (activeFlyout == ActiveFlyout.START) accentColor else Color.Transparent)
                        .clickable { onToggleFlyout(ActiveFlyout.START) }
                        .testTag("taskbar_start_button")
                ) {
                    WindowsLogoIcon(
                        size = 18.dp,
                        color = if (activeFlyout == ActiveFlyout.START) Color.White else Color(0xFF00ADEF)
                    )
                }

                // Search Bar / Button
                if (isWideScreen) {
                    Row(
                        verticalAlignment = Alignment.CenterVertically,
                        modifier = Modifier
                            .width(170.dp)
                            .fillMaxHeight()
                            .background(Color(0x66000000))
                            .clickable { onToggleFlyout(ActiveFlyout.SEARCH) }
                            .padding(horizontal = 10.dp)
                            .testTag("taskbar_search_button")
                    ) {
                        Icon(Icons.Filled.Search, contentDescription = "Search", tint = Color(0xFFA1A1AA), modifier = Modifier.size(16.dp))
                        Spacer(Modifier.width(8.dp))
                        Text("Type here to search", color = Color(0xFFA1A1AA), fontSize = 11.sp, maxLines = 1, overflow = TextOverflow.Ellipsis)
                    }
                } else {
                    Box(
                        contentAlignment = Alignment.Center,
                        modifier = Modifier
                            .width(44.dp)
                            .fillMaxHeight()
                            .background(if (activeFlyout == ActiveFlyout.SEARCH) Color.White.copy(alpha = 0.15f) else Color.Transparent)
                            .clickable { onToggleFlyout(ActiveFlyout.SEARCH) }
                            .testTag("taskbar_search_button")
                    ) {
                        Icon(Icons.Filled.Search, contentDescription = "Search", tint = Color.White, modifier = Modifier.size(18.dp))
                    }
                }

                // Task View / Show Desktop
                Box(
                    contentAlignment = Alignment.Center,
                    modifier = Modifier
                        .width(42.dp)
                        .fillMaxHeight()
                        .clickable { onPeekDesktop() }
                        .testTag("taskbar_task_view")
                ) {
                    Icon(Icons.Filled.Layers, contentDescription = "Task View", tint = Color(0xFFD4D4D8), modifier = Modifier.size(17.dp))
                }

                // Pinned & Running Apps
                Row(
                    verticalAlignment = Alignment.CenterVertically,
                    modifier = Modifier
                        .weight(1f)
                        .fillMaxHeight()
                        .horizontalScroll(rememberScrollState())
                        .padding(horizontal = 4.dp)
                ) {
                    taskbarAppIds.forEach { appId ->
                        val appWindows = windows.filter { it.appId == appId }
                        val isRunning = appWindows.isNotEmpty()
                        val hasActive = appWindows.any { it.id == activeWindowId && !it.isMinimized }

                        Box(
                            contentAlignment = Alignment.Center,
                            modifier = Modifier
                                .width(44.dp)
                                .fillMaxHeight()
                                .background(if (hasActive) Color.White.copy(alpha = 0.15f) else Color.Transparent)
                                .combinedClickable(
                                    onClick = {
                                        if (!isRunning) {
                                            onAppClick(appId)
                                        } else {
                                            onWindowClick(appWindows.first())
                                        }
                                    },
                                    onLongClick = {
                                        if (isRunning) {
                                            WindowsSoundEngine.playClick()
                                            previewAppId = appId
                                        }
                                    }
                                )
                                .testTag("taskbar_app_${appId.name.lowercase()}")
                        ) {
                            WinAppIcon(appId = appId, size = 22.dp)

                            if (isRunning) {
                                Box(
                                    modifier = Modifier
                                        .align(Alignment.BottomCenter)
                                        .width(if (hasActive) 34.dp else 14.dp)
                                        .height(2.5.dp)
                                        .background(if (hasActive) accentColor else Color(0xFFA1A1AA))
                                )
                            }

                            DropdownMenu(
                                expanded = previewAppId == appId && isRunning,
                                onDismissRequest = { previewAppId = null },
                                containerColor = Color(0xF51E1E1E)
                            ) {
                                appWindows.forEach { win ->
                                    Row(
                                        verticalAlignment = Alignment.CenterVertically,
                                        horizontalArrangement = Arrangement.SpaceBetween,
                                        modifier = Modifier
                                            .width(210.dp)
                                            .clickable {
                                                previewAppId = null
                                                onWindowClick(win)
                                            }
                                            .padding(horizontal = 10.dp, vertical = 8.dp)
                                    ) {
                                        Row(verticalAlignment = Alignment.CenterVertically, modifier = Modifier.weight(1f)) {
                                            WinAppIcon(appId = win.appId, size = 18.dp)
                                            Spacer(Modifier.width(8.dp))
                                            Column {
                                                Text(
                                                    win.title,
                                                    color = Color.White,
                                                    fontSize = 12.sp,
                                                    maxLines = 1,
                                                    overflow = TextOverflow.Ellipsis
                                                )
                                                Text(
                                                    if (win.isMinimized) "Minimized" else AppRegistry.get(win.appId).name,
                                                    color = Color(0xFFA1A1AA),
                                                    fontSize = 10.sp
                                                )
                                            }
                                        }
                                        Box(
                                            contentAlignment = Alignment.Center,
                                            modifier = Modifier
                                                .size(28.dp)
                                                .clip(RoundedCornerShape(4.dp))
                                                .clickable {
                                                    previewAppId = null
                                                    onCloseWindow(win.id)
                                                }
                                        ) {
                                            Icon(Icons.Filled.Close, "Close", tint = Color(0xFFEF4444), modifier = Modifier.size(16.dp))
                                        }
                                    }
                                }
                            }
                        }
                    }
                }
            }

            // Right Zone: System Tray + Clock + Action Center + Aero Peek
            Row(
                verticalAlignment = Alignment.CenterVertically,
                modifier = Modifier.fillMaxHeight()
            ) {
                if (isWideScreen) {
                    Box(
                        contentAlignment = Alignment.Center,
                        modifier = Modifier
                            .padding(horizontal = 4.dp)
                            .size(24.dp)
                    ) {
                        Icon(Icons.Filled.Shield, "Windows Defender", tint = Color(0xFF34D399), modifier = Modifier.size(15.dp))
                    }
                    Box(
                        contentAlignment = Alignment.Center,
                        modifier = Modifier
                            .padding(horizontal = 4.dp)
                            .size(24.dp)
                    ) {
                        Icon(Icons.Filled.BatteryChargingFull, "Battery 100%", tint = Color(0xFF34D399), modifier = Modifier.size(15.dp))
                    }
                }

                // Wi-Fi
                Box(
                    contentAlignment = Alignment.Center,
                    modifier = Modifier
                        .width(34.dp)
                        .fillMaxHeight()
                        .background(if (activeFlyout == ActiveFlyout.WIFI) Color.White.copy(alpha = 0.18f) else Color.Transparent)
                        .clickable { onToggleFlyout(ActiveFlyout.WIFI) }
                        .testTag("taskbar_wifi")
                ) {
                    Icon(
                        if (wifiConnected) Icons.Filled.Wifi else Icons.Filled.WifiOff,
                        contentDescription = "Wi-Fi",
                        tint = if (wifiConnected) Color.White else Color(0xFF71717A),
                        modifier = Modifier.size(16.dp)
                    )
                }

                // Volume
                Box(
                    contentAlignment = Alignment.Center,
                    modifier = Modifier
                        .width(34.dp)
                        .fillMaxHeight()
                        .background(if (activeFlyout == ActiveFlyout.VOLUME) Color.White.copy(alpha = 0.18f) else Color.Transparent)
                        .clickable { onToggleFlyout(ActiveFlyout.VOLUME) }
                        .testTag("taskbar_volume")
                ) {
                    Icon(
                        if (muted || volume == 0) Icons.Filled.VolumeOff else Icons.Filled.VolumeUp,
                        contentDescription = "Volume",
                        tint = Color.White,
                        modifier = Modifier.size(16.dp)
                    )
                }

                // Date & Time
                Column(
                    horizontalAlignment = Alignment.End,
                    verticalArrangement = Arrangement.Center,
                    modifier = Modifier
                        .fillMaxHeight()
                        .background(if (activeFlyout == ActiveFlyout.CALENDAR) Color.White.copy(alpha = 0.18f) else Color.Transparent)
                        .clickable { onToggleFlyout(ActiveFlyout.CALENDAR) }
                        .padding(horizontal = 6.dp)
                        .testTag("taskbar_clock")
                ) {
                    Text(timeStr, color = Color.White, fontSize = 10.sp, lineHeight = 12.sp)
                    Text(dateStr, color = Color(0xFFA1A1AA), fontSize = 9.sp, lineHeight = 11.sp)
                }

                // Action Center
                Box(
                    contentAlignment = Alignment.Center,
                    modifier = Modifier
                        .width(38.dp)
                        .fillMaxHeight()
                        .background(if (activeFlyout == ActiveFlyout.ACTION_CENTER) Color.White.copy(alpha = 0.18f) else Color.Transparent)
                        .clickable { onToggleFlyout(ActiveFlyout.ACTION_CENTER) }
                        .testTag("taskbar_action_center")
                ) {
                    Icon(Icons.Filled.ChatBubbleOutline, contentDescription = "Action Center", tint = Color.White, modifier = Modifier.size(16.dp))
                    if (unreadCount > 0) {
                        Box(
                            contentAlignment = Alignment.Center,
                            modifier = Modifier
                                .align(Alignment.BottomEnd)
                                .padding(end = 5.dp, bottom = 7.dp)
                                .size(14.dp)
                                .clip(CircleShape)
                                .background(accentColor)
                        ) {
                            Text(unreadCount.toString(), color = Color.White, fontSize = 8.sp, fontWeight = FontWeight.Bold)
                        }
                    }
                }

                // Aero Peek sliver
                Box(
                    modifier = Modifier
                        .width(8.dp)
                        .fillMaxHeight()
                        .border(0.5.dp, Color.White.copy(alpha = 0.15f))
                        .clickable { onPeekDesktop() }
                        .testTag("taskbar_peek")
                )
            }
        }
    }
}
