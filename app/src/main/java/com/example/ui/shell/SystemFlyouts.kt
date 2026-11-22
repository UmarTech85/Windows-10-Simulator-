package com.example.ui.shell

import androidx.compose.animation.AnimatedVisibility
import androidx.compose.animation.fadeIn
import androidx.compose.animation.fadeOut
import androidx.compose.animation.slideInHorizontally
import androidx.compose.animation.slideOutHorizontally
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
import androidx.compose.foundation.layout.statusBarsPadding
import androidx.compose.foundation.layout.width
import androidx.compose.foundation.rememberScrollState
import androidx.compose.foundation.shape.CircleShape
import androidx.compose.foundation.shape.RoundedCornerShape
import androidx.compose.foundation.verticalScroll
import androidx.compose.material.icons.Icons
import androidx.compose.material.icons.filled.AirplanemodeActive
import androidx.compose.material.icons.filled.BatteryChargingFull
import androidx.compose.material.icons.filled.Bluetooth
import androidx.compose.material.icons.filled.ChevronLeft
import androidx.compose.material.icons.filled.ChevronRight
import androidx.compose.material.icons.filled.Close
import androidx.compose.material.icons.filled.Crop
import androidx.compose.material.icons.filled.Headphones
import androidx.compose.material.icons.filled.LightMode
import androidx.compose.material.icons.filled.LocationOn
import androidx.compose.material.icons.filled.NotificationsOff
import androidx.compose.material.icons.filled.Pause
import androidx.compose.material.icons.filled.PlayArrow
import androidx.compose.material.icons.filled.Settings
import androidx.compose.material.icons.filled.SkipNext
import androidx.compose.material.icons.filled.SkipPrevious
import androidx.compose.material.icons.filled.VolumeOff
import androidx.compose.material.icons.filled.VolumeUp
import androidx.compose.material.icons.filled.Wifi
import androidx.compose.material.icons.filled.WifiOff
import androidx.compose.material3.Icon
import androidx.compose.material3.Slider
import androidx.compose.material3.SliderDefaults
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
import androidx.compose.ui.draw.clip
import androidx.compose.ui.draw.shadow
import androidx.compose.ui.geometry.CornerRadius
import androidx.compose.ui.geometry.Offset
import androidx.compose.ui.geometry.Size
import androidx.compose.ui.graphics.Brush
import androidx.compose.ui.graphics.Color
import androidx.compose.ui.graphics.vector.ImageVector
import androidx.compose.ui.platform.testTag
import androidx.compose.ui.text.font.FontWeight
import androidx.compose.ui.text.style.TextAlign
import androidx.compose.ui.text.style.TextOverflow
import androidx.compose.ui.unit.dp
import androidx.compose.ui.unit.sp
import com.example.audio.WindowsSoundEngine
import com.example.model.AppId
import com.example.model.MusicPlayerUiState
import com.example.model.SystemNotification
import com.example.model.SystemSettings
import kotlinx.coroutines.delay
import java.text.SimpleDateFormat
import java.util.Calendar
import java.util.Date
import java.util.Locale

@Composable
fun ActionCenterOverlay(
    visible: Boolean,
    settings: SystemSettings,
    notifications: List<SystemNotification>,
    onDismiss: () -> Unit,
    onClearNotifications: () -> Unit,
    onToggleWifi: () -> Unit,
    onToggleNightLight: () -> Unit,
    onOpenSettings: () -> Unit,
    onOpenSnipPaint: () -> Unit,
    onOpenNotificationApp: (AppId) -> Unit,
    modifier: Modifier = Modifier
) {
    var bluetooth by remember { mutableStateOf(true) }
    var focusAssist by remember { mutableStateOf(false) }
    var airplane by remember { mutableStateOf(false) }
    var location by remember { mutableStateOf(true) }

    AnimatedVisibility(
        visible = visible,
        enter = fadeIn() + slideInHorizontally { it },
        exit = fadeOut() + slideOutHorizontally { it },
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
                    .align(Alignment.CenterEnd)
                    .width(320.dp)
                    .fillMaxHeight()
                    .background(Color(0xF5191919))
                    .border(1.dp, Color.White.copy(alpha = 0.14f))
                    .statusBarsPadding()
                    .clickable(
                        interactionSource = remember { androidx.compose.foundation.interaction.MutableInteractionSource() },
                        indication = null,
                        onClick = {}
                    )
                    .padding(14.dp)
                    .testTag("action_center_panel")
            ) {
                Row(
                    verticalAlignment = Alignment.CenterVertically,
                    horizontalArrangement = Arrangement.SpaceBetween,
                    modifier = Modifier.fillMaxWidth()
                ) {
                    Text(
                        text = if (notifications.isEmpty()) "No new notifications" else "Notifications (${notifications.size})",
                        color = Color(0xFFD4D4D8),
                        fontSize = 12.sp,
                        fontWeight = FontWeight.SemiBold
                    )
                    if (notifications.isNotEmpty()) {
                        Text(
                            text = "Clear all",
                            color = settings.accentColor,
                            fontSize = 11.sp,
                            modifier = Modifier
                                .clickable { onClearNotifications() }
                                .padding(4.dp)
                        )
                    }
                }

                Spacer(Modifier.height(8.dp))

                Column(
                    modifier = Modifier
                        .weight(1f)
                        .fillMaxWidth()
                        .verticalScroll(rememberScrollState()),
                    verticalArrangement = Arrangement.spacedBy(8.dp)
                ) {
                    if (notifications.isEmpty()) {
                        Box(
                            contentAlignment = Alignment.Center,
                            modifier = Modifier
                                .fillMaxWidth()
                                .padding(vertical = 32.dp)
                        ) {
                            Text("You're all caught up", color = Color(0xFF71717A), fontSize = 12.sp)
                        }
                    } else {
                        notifications.forEach { n ->
                            Column(
                                modifier = Modifier
                                    .fillMaxWidth()
                                    .clip(RoundedCornerShape(4.dp))
                                    .background(Color(0xFF27272A))
                                    .border(1.dp, Color.White.copy(alpha = 0.08f), RoundedCornerShape(4.dp))
                                    .clickable { n.actionApp?.let(onOpenNotificationApp) }
                                    .padding(10.dp)
                            ) {
                                Row(
                                    horizontalArrangement = Arrangement.SpaceBetween,
                                    modifier = Modifier.fillMaxWidth()
                                ) {
                                    Text(n.source, color = Color(0xFFA1A1AA), fontSize = 10.sp)
                                    Text(n.time, color = Color(0xFF71717A), fontSize = 10.sp)
                                }
                                Spacer(Modifier.height(3.dp))
                                Text(n.title, color = Color.White, fontSize = 12.sp, fontWeight = FontWeight.SemiBold)
                                Text(n.message, color = Color(0xFFD4D4D8), fontSize = 11.sp)
                            }
                        }
                    }
                }

                Spacer(Modifier.height(10.dp))

                // 8 Quick Action Tiles (4 columns x 2 rows)
                Column(verticalArrangement = Arrangement.spacedBy(6.dp)) {
                    Row(horizontalArrangement = Arrangement.spacedBy(6.dp), modifier = Modifier.fillMaxWidth()) {
                        QuickActionTile("Network", Icons.Filled.Wifi, settings.wifiConnected, settings.accentColor, Modifier.weight(1f)) { onToggleWifi() }
                        QuickActionTile("Bluetooth", Icons.Filled.Bluetooth, bluetooth, settings.accentColor, Modifier.weight(1f)) { bluetooth = !bluetooth }
                        QuickActionTile("Night light", Icons.Filled.LightMode, settings.nightLight, settings.accentColor, Modifier.weight(1f)) { onToggleNightLight() }
                        QuickActionTile("Settings", Icons.Filled.Settings, false, settings.accentColor, Modifier.weight(1f)) { onOpenSettings() }
                    }
                    Row(horizontalArrangement = Arrangement.spacedBy(6.dp), modifier = Modifier.fillMaxWidth()) {
                        QuickActionTile("Focus", Icons.Filled.NotificationsOff, focusAssist, settings.accentColor, Modifier.weight(1f)) { focusAssist = !focusAssist }
                        QuickActionTile("Airplane", Icons.Filled.AirplanemodeActive, airplane, settings.accentColor, Modifier.weight(1f)) { airplane = !airplane }
                        QuickActionTile("Location", Icons.Filled.LocationOn, location, settings.accentColor, Modifier.weight(1f)) { location = !location }
                        QuickActionTile("Snip", Icons.Filled.Crop, false, settings.accentColor, Modifier.weight(1f)) { onOpenSnipPaint() }
                    }
                }
            }
        }
    }
}

@Composable
private fun QuickActionTile(
    label: String,
    icon: ImageVector,
    active: Boolean,
    accentColor: Color,
    modifier: Modifier = Modifier,
    onClick: () -> Unit
) {
    Column(
        verticalArrangement = Arrangement.SpaceBetween,
        modifier = modifier
            .height(58.dp)
            .clip(RoundedCornerShape(3.dp))
            .background(if (active) accentColor else Color(0xFF2D2D30))
            .border(1.dp, Color.White.copy(alpha = 0.08f), RoundedCornerShape(3.dp))
            .clickable {
                WindowsSoundEngine.playClick()
                onClick()
            }
            .padding(6.dp)
    ) {
        Icon(icon, contentDescription = label, tint = Color.White, modifier = Modifier.size(16.dp))
        Text(label, color = Color.White, fontSize = 10.sp, maxLines = 1, overflow = TextOverflow.Ellipsis)
    }
}

@Composable
fun CalendarFlyout(
    visible: Boolean,
    accentColor: Color,
    onDismiss: () -> Unit,
    modifier: Modifier = Modifier
) {
    var timeStr by remember { mutableStateOf("") }
    var dateStr by remember { mutableStateOf("") }
    val todayCal = remember { Calendar.getInstance() }
    var viewYear by remember { mutableIntStateOf(todayCal.get(Calendar.YEAR)) }
    var viewMonth by remember { mutableIntStateOf(todayCal.get(Calendar.MONTH)) }

    LaunchedEffect(visible) {
        if (!visible) return@LaunchedEffect
        val tf = SimpleDateFormat("hh:mm:ss a", Locale.getDefault())
        val df = SimpleDateFormat("EEEE, MMMM d, yyyy", Locale.getDefault())
        while (true) {
            val now = Date()
            timeStr = tf.format(now)
            dateStr = df.format(now)
            delay(1000)
        }
    }

    AnimatedVisibility(
        visible = visible,
        enter = fadeIn(),
        exit = fadeOut(),
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
                    .align(Alignment.BottomEnd)
                    .padding(end = 8.dp, bottom = 6.dp)
                    .width(308.dp)
                    .shadow(16.dp, RoundedCornerShape(6.dp))
                    .clip(RoundedCornerShape(6.dp))
                    .background(Color(0xF71E1E1E))
                    .border(1.dp, Color.White.copy(alpha = 0.14f), RoundedCornerShape(6.dp))
                    .clickable(
                        interactionSource = remember { androidx.compose.foundation.interaction.MutableInteractionSource() },
                        indication = null,
                        onClick = {}
                    )
                    .padding(16.dp)
                    .testTag("calendar_flyout_panel")
            ) {
                Text(timeStr, color = Color.White, fontSize = 26.sp, fontWeight = FontWeight.Light)
                Text(dateStr, color = Color(0xFF60A5FA), fontSize = 12.sp)
                Spacer(Modifier.height(12.dp))

                val monthCal = remember(viewYear, viewMonth) {
                    Calendar.getInstance().apply {
                        set(Calendar.YEAR, viewYear)
                        set(Calendar.MONTH, viewMonth)
                        set(Calendar.DAY_OF_MONTH, 1)
                    }
                }
                val monthTitle = remember(viewYear, viewMonth) {
                    SimpleDateFormat("MMMM yyyy", Locale.getDefault()).format(monthCal.time)
                }

                Row(
                    verticalAlignment = Alignment.CenterVertically,
                    horizontalArrangement = Arrangement.SpaceBetween,
                    modifier = Modifier.fillMaxWidth()
                ) {
                    Text(monthTitle, color = Color.White, fontSize = 13.sp, fontWeight = FontWeight.Medium)
                    Row {
                        Icon(
                            Icons.Filled.ChevronLeft,
                            contentDescription = "Previous month",
                            tint = Color(0xFFD4D4D8),
                            modifier = Modifier
                                .size(28.dp)
                                .clickable {
                                    if (viewMonth == 0) {
                                        viewMonth = 11; viewYear--
                                    } else viewMonth--
                                }
                                .padding(4.dp)
                        )
                        Icon(
                            Icons.Filled.ChevronRight,
                            contentDescription = "Next month",
                            tint = Color(0xFFD4D4D8),
                            modifier = Modifier
                                .size(28.dp)
                                .clickable {
                                    if (viewMonth == 11) {
                                        viewMonth = 0; viewYear++
                                    } else viewMonth++
                                }
                                .padding(4.dp)
                        )
                    }
                }

                Spacer(Modifier.height(8.dp))
                Row(modifier = Modifier.fillMaxWidth()) {
                    listOf("Su", "Mo", "Tu", "We", "Th", "Fr", "Sa").forEach { d ->
                        Text(
                            d,
                            color = Color(0xFFA1A1AA),
                            fontSize = 10.sp,
                            textAlign = TextAlign.Center,
                            modifier = Modifier.weight(1f)
                        )
                    }
                }
                Spacer(Modifier.height(4.dp))

                val firstDayOfWeek = monthCal.get(Calendar.DAY_OF_WEEK) - 1
                val daysInMonth = monthCal.getActualMaximum(Calendar.DAY_OF_MONTH)
                val totalCells = ((firstDayOfWeek + daysInMonth + 6) / 7) * 7
                val todayY = todayCal.get(Calendar.YEAR)
                val todayM = todayCal.get(Calendar.MONTH)
                val todayD = todayCal.get(Calendar.DAY_OF_MONTH)

                for (row in 0 until (totalCells / 7)) {
                    Row(modifier = Modifier.fillMaxWidth()) {
                        for (col in 0 until 7) {
                            val idx = row * 7 + col
                            val dayNum = idx - firstDayOfWeek + 1
                            val inMonth = dayNum in 1..daysInMonth
                            val isToday = inMonth && viewYear == todayY && viewMonth == todayM && dayNum == todayD
                            Box(
                                contentAlignment = Alignment.Center,
                                modifier = Modifier
                                    .weight(1f)
                                    .height(32.dp)
                                    .clip(RoundedCornerShape(3.dp))
                                    .background(if (isToday) accentColor else Color.Transparent)
                            ) {
                                if (inMonth) {
                                    Text(
                                        text = dayNum.toString(),
                                        color = Color.White,
                                        fontSize = 11.sp,
                                        fontWeight = if (isToday) FontWeight.Bold else FontWeight.Normal
                                    )
                                }
                            }
                        }
                    }
                }
            }
        }
    }
}

@Composable
fun VolumeFlyout(
    visible: Boolean,
    volume: Int,
    muted: Boolean,
    accentColor: Color,
    onDismiss: () -> Unit,
    onVolumeChange: (Int) -> Unit,
    onToggleMute: () -> Unit,
    modifier: Modifier = Modifier
) {
    AnimatedVisibility(
        visible = visible,
        enter = fadeIn(),
        exit = fadeOut(),
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
                    .align(Alignment.BottomEnd)
                    .padding(end = 36.dp, bottom = 6.dp)
                    .width(296.dp)
                    .shadow(16.dp, RoundedCornerShape(6.dp))
                    .clip(RoundedCornerShape(6.dp))
                    .background(Color(0xF71E1E1E))
                    .border(1.dp, Color.White.copy(alpha = 0.14f), RoundedCornerShape(6.dp))
                    .clickable(
                        interactionSource = remember { androidx.compose.foundation.interaction.MutableInteractionSource() },
                        indication = null,
                        onClick = {}
                    )
                    .padding(14.dp)
                    .testTag("volume_flyout_panel")
            ) {
                Text("Speakers (Realtek High Definition Audio)", color = Color(0xFFD4D4D8), fontSize = 11.sp)
                Spacer(Modifier.height(10.dp))
                Row(verticalAlignment = Alignment.CenterVertically) {
                    Box(
                        contentAlignment = Alignment.Center,
                        modifier = Modifier
                            .size(40.dp)
                            .clip(RoundedCornerShape(4.dp))
                            .clickable { onToggleMute() }
                    ) {
                        Icon(
                            if (muted || volume == 0) Icons.Filled.VolumeOff else Icons.Filled.VolumeUp,
                            contentDescription = "Mute toggle",
                            tint = Color.White,
                            modifier = Modifier.size(20.dp)
                        )
                    }
                    Slider(
                        value = if (muted) 0f else volume.toFloat(),
                        onValueChange = { onVolumeChange(it.toInt()) },
                        onValueChangeFinished = { WindowsSoundEngine.playDing() },
                        valueRange = 0f..100f,
                        colors = SliderDefaults.colors(thumbColor = accentColor, activeTrackColor = accentColor),
                        modifier = Modifier.weight(1f)
                    )
                    Text(
                        text = if (muted) "0" else "$volume",
                        color = Color.White,
                        fontSize = 14.sp,
                        fontWeight = FontWeight.Medium,
                        textAlign = TextAlign.End,
                        modifier = Modifier.width(34.dp)
                    )
                }
            }
        }
    }
}

@Composable
fun WifiFlyout(
    visible: Boolean,
    wifiConnected: Boolean,
    networkName: String,
    accentColor: Color,
    onDismiss: () -> Unit,
    onSelectNetwork: (String, Boolean) -> Unit,
    modifier: Modifier = Modifier
) {
    val networks = remember {
        listOf(
            "Home_WiFi_5G" to "Secured",
            "Office_Gigabit_Guest" to "Secured",
            "CoffeeShop_Free_WiFi" to "Open",
            "Windows_Direct_Hotspot" to "Secured"
        )
    }

    AnimatedVisibility(
        visible = visible,
        enter = fadeIn(),
        exit = fadeOut(),
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
                    .align(Alignment.BottomEnd)
                    .padding(end = 60.dp, bottom = 6.dp)
                    .width(296.dp)
                    .shadow(16.dp, RoundedCornerShape(6.dp))
                    .clip(RoundedCornerShape(6.dp))
                    .background(Color(0xF71E1E1E))
                    .border(1.dp, Color.White.copy(alpha = 0.14f), RoundedCornerShape(6.dp))
                    .clickable(
                        interactionSource = remember { androidx.compose.foundation.interaction.MutableInteractionSource() },
                        indication = null,
                        onClick = {}
                    )
                    .padding(12.dp)
                    .testTag("wifi_flyout_panel")
            ) {
                Row(
                    verticalAlignment = Alignment.CenterVertically,
                    horizontalArrangement = Arrangement.SpaceBetween,
                    modifier = Modifier.fillMaxWidth().padding(bottom = 8.dp)
                ) {
                    Text("Wi-Fi", color = Color.White, fontSize = 13.sp, fontWeight = FontWeight.SemiBold)
                    Box(
                        modifier = Modifier
                            .clip(RoundedCornerShape(4.dp))
                            .background(if (wifiConnected) accentColor else Color(0xFF3F3F46))
                            .clickable { onSelectNetwork(networkName, !wifiConnected) }
                            .padding(horizontal = 10.dp, vertical = 4.dp)
                    ) {
                        Text(if (wifiConnected) "On" else "Off", color = Color.White, fontSize = 11.sp)
                    }
                }

                networks.forEach { (ssid, security) ->
                    val connected = wifiConnected && ssid == networkName
                    Row(
                        verticalAlignment = Alignment.CenterVertically,
                        horizontalArrangement = Arrangement.SpaceBetween,
                        modifier = Modifier
                            .fillMaxWidth()
                            .clip(RoundedCornerShape(4.dp))
                            .background(if (connected) Color.White.copy(alpha = 0.12f) else Color.Transparent)
                            .clickable { onSelectNetwork(ssid, true) }
                            .padding(10.dp)
                    ) {
                        Row(verticalAlignment = Alignment.CenterVertically) {
                            Icon(
                                if (wifiConnected) Icons.Filled.Wifi else Icons.Filled.WifiOff,
                                contentDescription = ssid,
                                tint = if (connected) accentColor else Color(0xFFA1A1AA),
                                modifier = Modifier.size(18.dp)
                            )
                            Spacer(Modifier.width(10.dp))
                            Column {
                                Text(ssid, color = Color.White, fontSize = 12.sp, fontWeight = FontWeight.Medium)
                                Text(
                                    text = if (connected) "Connected, secured" else security,
                                    color = if (connected) Color(0xFF60A5FA) else Color(0xFFA1A1AA),
                                    fontSize = 10.sp
                                )
                            }
                        }
                    }
                }
            }
        }
    }
}

@Composable
fun DesktopMediaWidget(
    musicState: MusicPlayerUiState,
    grooveIsOpenAndVisible: Boolean,
    onTogglePlay: () -> Unit,
    onPrev: () -> Unit,
    onNext: () -> Unit,
    onOpenGroove: () -> Unit,
    modifier: Modifier = Modifier
) {
    var expanded by remember { mutableStateOf(true) }
    val track = musicState.tracks.getOrNull(musicState.currentTrackIndex) ?: return
    if (!musicState.isPlaying || grooveIsOpenAndVisible) return

    Box(modifier = modifier.padding(12.dp)) {
        if (!expanded) {
            Row(
                verticalAlignment = Alignment.CenterVertically,
                modifier = Modifier
                    .shadow(10.dp, CircleShape)
                    .clip(CircleShape)
                    .background(Color(0xEB18181B))
                    .border(1.dp, Color.White.copy(alpha = 0.16f), CircleShape)
                    .clickable { expanded = true }
                    .padding(horizontal = 12.dp, vertical = 8.dp)
            ) {
                Icon(Icons.Filled.Headphones, null, tint = Color(0xFFA78BFA), modifier = Modifier.size(16.dp))
                Spacer(Modifier.width(6.dp))
                Text(track.title, color = Color.White, fontSize = 11.sp, maxLines = 1, overflow = TextOverflow.Ellipsis, modifier = Modifier.width(110.dp))
            }
        } else {
            Column(
                modifier = Modifier
                    .width(250.dp)
                    .shadow(16.dp, RoundedCornerShape(10.dp))
                    .clip(RoundedCornerShape(10.dp))
                    .background(Color(0xEB18181B))
                    .border(1.dp, Color.White.copy(alpha = 0.16f), RoundedCornerShape(10.dp))
                    .padding(10.dp)
            ) {
                Row(
                    verticalAlignment = Alignment.CenterVertically,
                    horizontalArrangement = Arrangement.SpaceBetween,
                    modifier = Modifier.fillMaxWidth()
                ) {
                    Row(
                        verticalAlignment = Alignment.CenterVertically,
                        modifier = Modifier
                            .weight(1f)
                            .clickable { onOpenGroove() }
                    ) {
                        Box(
                            contentAlignment = Alignment.Center,
                            modifier = Modifier
                                .size(34.dp)
                                .clip(RoundedCornerShape(6.dp))
                                .background(Brush.linearGradient(listOf(Color(track.gradientStartHex), Color(track.gradientEndHex))))
                        ) {
                            Icon(Icons.Filled.Headphones, null, tint = Color.White, modifier = Modifier.size(18.dp))
                        }
                        Spacer(Modifier.width(8.dp))
                        Column {
                            Text(track.title, color = Color.White, fontSize = 11.sp, fontWeight = FontWeight.SemiBold, maxLines = 1, overflow = TextOverflow.Ellipsis)
                            Text(track.artist, color = Color(0xFFA1A1AA), fontSize = 10.sp, maxLines = 1, overflow = TextOverflow.Ellipsis)
                        }
                    }
                    Icon(
                        Icons.Filled.Close,
                        contentDescription = "Minimize widget",
                        tint = Color(0xFFA1A1AA),
                        modifier = Modifier
                            .size(20.dp)
                            .clickable { expanded = false }
                    )
                }

                Spacer(Modifier.height(8.dp))

                Canvas(modifier = Modifier.fillMaxWidth().height(16.dp)) {
                    val bars = musicState.spectrumBars.take(16)
                    val bw = size.width / (bars.size * 2f)
                    bars.forEachIndexed { idx, amp ->
                        val bh = (amp * size.height).coerceAtLeast(3f)
                        drawRoundRect(
                            color = Color(0xFFA78BFA),
                            topLeft = Offset(idx * bw * 2f, size.height - bh),
                            size = Size(bw, bh),
                            cornerRadius = CornerRadius(2f, 2f)
                        )
                    }
                }

                Spacer(Modifier.height(6.dp))
                Row(
                    horizontalArrangement = Arrangement.SpaceEvenly,
                    verticalAlignment = Alignment.CenterVertically,
                    modifier = Modifier.fillMaxWidth()
                ) {
                    Icon(Icons.Filled.SkipPrevious, "Previous", tint = Color.White, modifier = Modifier.size(22.dp).clickable { onPrev() })
                    Box(
                        contentAlignment = Alignment.Center,
                        modifier = Modifier
                            .size(32.dp)
                            .clip(CircleShape)
                            .background(Color.White)
                            .clickable { onTogglePlay() }
                    ) {
                        Icon(
                            if (musicState.isPlaying) Icons.Filled.Pause else Icons.Filled.PlayArrow,
                            contentDescription = "Play/Pause",
                            tint = Color.Black,
                            modifier = Modifier.size(18.dp)
                        )
                    }
                    Icon(Icons.Filled.SkipNext, "Next", tint = Color.White, modifier = Modifier.size(22.dp).clickable { onNext() })
                }
            }
        }
    }
}
