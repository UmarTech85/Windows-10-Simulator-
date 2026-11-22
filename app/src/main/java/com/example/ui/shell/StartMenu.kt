package com.example.ui.shell

import androidx.compose.animation.AnimatedVisibility
import androidx.compose.animation.fadeIn
import androidx.compose.animation.fadeOut
import androidx.compose.animation.slideInVertically
import androidx.compose.animation.slideOutVertically
import androidx.compose.foundation.Canvas
import androidx.compose.foundation.background
import androidx.compose.foundation.border
import androidx.compose.foundation.clickable
import androidx.compose.foundation.horizontalScroll
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
import androidx.compose.foundation.layout.widthIn
import androidx.compose.foundation.rememberScrollState
import androidx.compose.foundation.shape.CircleShape
import androidx.compose.foundation.shape.RoundedCornerShape
import androidx.compose.foundation.verticalScroll
import androidx.compose.material.icons.Icons
import androidx.compose.material.icons.filled.Brightness2
import androidx.compose.material.icons.filled.Description
import androidx.compose.material.icons.filled.Folder
import androidx.compose.material.icons.filled.Image
import androidx.compose.material.icons.filled.Lock
import androidx.compose.material.icons.filled.Menu
import androidx.compose.material.icons.filled.Pause
import androidx.compose.material.icons.filled.Person
import androidx.compose.material.icons.filled.PlayArrow
import androidx.compose.material.icons.filled.PowerSettingsNew
import androidx.compose.material.icons.filled.Refresh
import androidx.compose.material.icons.filled.Settings
import androidx.compose.material.icons.filled.WbSunny
import androidx.compose.material3.DropdownMenu
import androidx.compose.material3.DropdownMenuItem
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
import androidx.compose.ui.geometry.CornerRadius
import androidx.compose.ui.geometry.Offset
import androidx.compose.ui.geometry.Size
import androidx.compose.ui.graphics.Brush
import androidx.compose.ui.graphics.Color
import androidx.compose.ui.graphics.vector.ImageVector
import androidx.compose.ui.platform.testTag
import androidx.compose.ui.text.font.FontWeight
import androidx.compose.ui.text.style.TextOverflow
import androidx.compose.ui.unit.dp
import androidx.compose.ui.unit.sp
import com.example.model.AppId
import com.example.model.AppRegistry
import com.example.model.FileLocation
import com.example.model.MusicPlayerUiState
import com.example.model.PowerMode
import com.example.ui.components.WinAppIcon

@Composable
fun StartMenuOverlay(
    visible: Boolean,
    accentColor: Color,
    isWideScreen: Boolean,
    musicState: MusicPlayerUiState,
    onDismiss: () -> Unit,
    onOpenApp: (AppId, FileLocation?) -> Unit,
    onLock: () -> Unit,
    onPower: (PowerMode) -> Unit,
    onToggleMusicPlay: () -> Unit,
    modifier: Modifier = Modifier
) {
    var railExpanded by remember { mutableStateOf(false) }
    var showPowerMenu by remember { mutableStateOf(false) }

    AnimatedVisibility(
        visible = visible,
        enter = fadeIn() + slideInVertically { it / 8 },
        exit = fadeOut() + slideOutVertically { it / 8 },
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
            val menuWidth = if (isWideScreen) 640.dp else 360.dp
            val menuHeight = if (isWideScreen) 500.dp else 460.dp

            Row(
                modifier = Modifier
                    .align(Alignment.BottomStart)
                    .padding(start = if (isWideScreen) 4.dp else 0.dp)
                    .widthIn(max = menuWidth)
                    .fillMaxWidth(if (isWideScreen) 0.92f else 0.96f)
                    .height(menuHeight)
                    .shadow(20.dp, RoundedCornerShape(topEnd = 6.dp))
                    .clip(RoundedCornerShape(topEnd = 6.dp))
                    .background(Color(0xF5191919))
                    .border(1.dp, Color.White.copy(alpha = 0.14f), RoundedCornerShape(topEnd = 6.dp))
                    .clickable(
                        interactionSource = remember { androidx.compose.foundation.interaction.MutableInteractionSource() },
                        indication = null,
                        onClick = {}
                    )
                    .testTag("start_menu_panel")
            ) {
                // Far-left Hamburger / User / Folders / Settings / Power Rail
                Column(
                    verticalArrangement = Arrangement.SpaceBetween,
                    modifier = Modifier
                        .width(if (railExpanded) 156.dp else 48.dp)
                        .fillMaxHeight()
                        .background(Color(0x66000000))
                        .padding(vertical = 6.dp)
                ) {
                    StartRailItem(
                        icon = Icons.Filled.Menu,
                        label = "START",
                        expanded = railExpanded,
                        bold = true,
                        testTag = "start_rail_menu",
                        onClick = { railExpanded = !railExpanded }
                    )

                    Column {
                        StartRailItem(
                            icon = Icons.Filled.Person,
                            label = "User (Lock)",
                            expanded = railExpanded,
                            testTag = "start_rail_lock",
                            onClick = onLock
                        )
                        StartRailItem(
                            icon = Icons.Filled.Description,
                            label = "Documents",
                            expanded = railExpanded,
                            testTag = "start_rail_docs",
                            onClick = { onOpenApp(AppId.EXPLORER, FileLocation.DOCUMENTS) }
                        )
                        StartRailItem(
                            icon = Icons.Filled.Image,
                            label = "Pictures",
                            expanded = railExpanded,
                            testTag = "start_rail_pics",
                            onClick = { onOpenApp(AppId.EXPLORER, FileLocation.PICTURES) }
                        )
                        StartRailItem(
                            icon = Icons.Filled.Settings,
                            label = "Settings",
                            expanded = railExpanded,
                            testTag = "start_rail_settings",
                            onClick = { onOpenApp(AppId.SETTINGS, null) }
                        )
                        Box {
                            StartRailItem(
                                icon = Icons.Filled.PowerSettingsNew,
                                label = "Power",
                                expanded = railExpanded,
                                testTag = "start_rail_power",
                                onClick = { showPowerMenu = true }
                            )
                            DropdownMenu(
                                expanded = showPowerMenu,
                                onDismissRequest = { showPowerMenu = false },
                                containerColor = Color(0xF5242424)
                            ) {
                                DropdownMenuItem(
                                    leadingIcon = { Icon(Icons.Filled.Brightness2, null, tint = Color(0xFFD4D4D8), modifier = Modifier.size(16.dp)) },
                                    text = { Text("Sleep", color = Color.White, fontSize = 13.sp) },
                                    onClick = {
                                        showPowerMenu = false
                                        onLock()
                                    }
                                )
                                DropdownMenuItem(
                                    leadingIcon = { Icon(Icons.Filled.PowerSettingsNew, null, tint = Color(0xFFF87171), modifier = Modifier.size(16.dp)) },
                                    text = { Text("Shut down", color = Color.White, fontSize = 13.sp) },
                                    onClick = {
                                        showPowerMenu = false
                                        onPower(PowerMode.SHUTDOWN)
                                    }
                                )
                                DropdownMenuItem(
                                    leadingIcon = { Icon(Icons.Filled.Refresh, null, tint = Color(0xFF60A5FA), modifier = Modifier.size(16.dp)) },
                                    text = { Text("Restart", color = Color.White, fontSize = 13.sp) },
                                    onClick = {
                                        showPowerMenu = false
                                        onPower(PowerMode.RESTART)
                                    }
                                )
                            }
                        }
                    }
                }

                // Middle + Right Content (responsive side-by-side on wide, compact column/tabs on narrow)
                if (isWideScreen) {
                    Row(modifier = Modifier.weight(1f).fillMaxHeight()) {
                        AllAppsList(
                            onOpenApp = { onOpenApp(it, null) },
                            modifier = Modifier
                                .width(205.dp)
                                .fillMaxHeight()
                                .padding(horizontal = 8.dp, vertical = 10.dp)
                        )
                        LiveTilesGrid(
                            accentColor = accentColor,
                            musicState = musicState,
                            onOpenApp = { onOpenApp(it, null) },
                            onToggleMusicPlay = onToggleMusicPlay,
                            modifier = Modifier
                                .weight(1f)
                                .fillMaxHeight()
                                .padding(12.dp)
                        )
                    }
                } else {
                    var selectedTab by remember { mutableStateOf(0) }
                    Column(modifier = Modifier.weight(1f).fillMaxHeight()) {
                        Row(
                            modifier = Modifier
                                .fillMaxWidth()
                                .padding(horizontal = 10.dp, vertical = 8.dp),
                            horizontalArrangement = Arrangement.spacedBy(8.dp)
                        ) {
                            listOf("Pinned Tiles", "All Apps").forEachIndexed { idx, label ->
                                val active = selectedTab == idx
                                Box(
                                    modifier = Modifier
                                        .clip(RoundedCornerShape(4.dp))
                                        .background(if (active) accentColor else Color.White.copy(alpha = 0.08f))
                                        .clickable { selectedTab = idx }
                                        .padding(horizontal = 12.dp, vertical = 6.dp)
                                ) {
                                    Text(
                                        text = label,
                                        color = Color.White,
                                        fontSize = 12.sp,
                                        fontWeight = if (active) FontWeight.SemiBold else FontWeight.Normal
                                    )
                                }
                            }
                        }
                        if (selectedTab == 0) {
                            LiveTilesGrid(
                                accentColor = accentColor,
                                musicState = musicState,
                                onOpenApp = { onOpenApp(it, null) },
                                onToggleMusicPlay = onToggleMusicPlay,
                                modifier = Modifier
                                    .weight(1f)
                                    .fillMaxWidth()
                                    .padding(horizontal = 10.dp, vertical = 4.dp)
                            )
                        } else {
                            AllAppsList(
                                onOpenApp = { onOpenApp(it, null) },
                                modifier = Modifier
                                    .weight(1f)
                                    .fillMaxWidth()
                                    .padding(horizontal = 10.dp, vertical = 4.dp)
                            )
                        }
                    }
                }
            }
        }
    }
}

@Composable
private fun StartRailItem(
    icon: ImageVector,
    label: String,
    expanded: Boolean,
    bold: Boolean = false,
    testTag: String,
    onClick: () -> Unit
) {
    Row(
        verticalAlignment = Alignment.CenterVertically,
        modifier = Modifier
            .fillMaxWidth()
            .height(44.dp)
            .clickable(onClick = onClick)
            .padding(horizontal = 14.dp)
            .testTag(testTag)
    ) {
        Icon(icon, contentDescription = label, tint = Color.White, modifier = Modifier.size(18.dp))
        if (expanded) {
            Spacer(Modifier.width(12.dp))
            Text(
                text = label,
                color = Color.White,
                fontSize = 12.sp,
                fontWeight = if (bold) FontWeight.Bold else FontWeight.Normal,
                maxLines = 1,
                overflow = TextOverflow.Ellipsis
            )
        }
    }
}

@Composable
private fun AllAppsList(
    onOpenApp: (AppId) -> Unit,
    modifier: Modifier = Modifier
) {
    val sortedApps = remember { AppRegistry.apps.values.sortedBy { it.name } }
    Column(
        modifier = modifier.verticalScroll(rememberScrollState()),
        verticalArrangement = Arrangement.spacedBy(2.dp)
    ) {
        Text(
            text = "All apps",
            color = Color(0xFFA1A1AA),
            fontSize = 11.sp,
            fontWeight = FontWeight.SemiBold,
            modifier = Modifier.padding(horizontal = 8.dp, vertical = 4.dp)
        )
        sortedApps.forEach { app ->
            Row(
                verticalAlignment = Alignment.CenterVertically,
                modifier = Modifier
                    .fillMaxWidth()
                    .height(40.dp)
                    .clip(RoundedCornerShape(4.dp))
                    .clickable { onOpenApp(app.id) }
                    .padding(horizontal = 8.dp)
                    .testTag("start_app_${app.id.name.lowercase()}")
            ) {
                WinAppIcon(appId = app.id, size = 24.dp)
                Spacer(Modifier.width(10.dp))
                Text(
                    text = app.name,
                    color = Color.White,
                    fontSize = 12.sp,
                    maxLines = 1,
                    overflow = TextOverflow.Ellipsis
                )
            }
        }
    }
}

@Composable
private fun LiveTilesGrid(
    accentColor: Color,
    musicState: MusicPlayerUiState,
    onOpenApp: (AppId) -> Unit,
    onToggleMusicPlay: () -> Unit,
    modifier: Modifier = Modifier
) {
    val currentTrack = musicState.tracks.getOrNull(musicState.currentTrackIndex)

    Column(
        modifier = modifier.verticalScroll(rememberScrollState()),
        verticalArrangement = Arrangement.spacedBy(12.dp)
    ) {
        Text("Life at a glance", color = Color(0xFFD4D4D8), fontSize = 12.sp, fontWeight = FontWeight.Medium)

        // Wide Weather Tile
        Row(
            verticalAlignment = Alignment.CenterVertically,
            horizontalArrangement = Arrangement.SpaceBetween,
            modifier = Modifier
                .fillMaxWidth()
                .height(82.dp)
                .clip(RoundedCornerShape(4.dp))
                .background(Brush.linearGradient(listOf(Color(0xFF0284C7), Color(0xFF1D4ED8))))
                .clickable { onOpenApp(AppId.EDGE) }
                .padding(horizontal = 14.dp, vertical = 10.dp)
                .testTag("start_tile_weather")
        ) {
            Column {
                Text("72°", color = Color.White, fontSize = 26.sp, fontWeight = FontWeight.Light)
                Text("Mostly Sunny • Seattle", color = Color(0xFFDBEAFE), fontSize = 11.sp)
            }
            Column(horizontalAlignment = Alignment.End) {
                Icon(Icons.Filled.WbSunny, contentDescription = "Sunny", tint = Color(0xFFFDE047), modifier = Modifier.size(28.dp))
                Spacer(Modifier.height(4.dp))
                Text("Weather", color = Color.White.copy(alpha = 0.85f), fontSize = 10.sp)
            }
        }

        // 2x2 Quick Tiles Row
        Row(
            horizontalArrangement = Arrangement.spacedBy(8.dp),
            modifier = Modifier.fillMaxWidth()
        ) {
            SmallLiveTile(
                appId = AppId.EDGE,
                title = "Edge",
                color = accentColor,
                modifier = Modifier.weight(1f),
                onClick = { onOpenApp(AppId.EDGE) }
            )
            SmallLiveTile(
                appId = AppId.PHOTOS,
                title = "Photos",
                color = Color(0xFF008272),
                modifier = Modifier.weight(1f),
                onClick = { onOpenApp(AppId.PHOTOS) }
            )
            SmallLiveTile(
                appId = AppId.CALC,
                title = "Calculator",
                color = Color(0xFF334155),
                modifier = Modifier.weight(1f),
                onClick = { onOpenApp(AppId.CALC) }
            )
            SmallLiveTile(
                appId = AppId.EXPLORER,
                title = "Explorer",
                color = Color(0xFFCA5010),
                modifier = Modifier.weight(1f),
                onClick = { onOpenApp(AppId.EXPLORER) }
            )
        }

        Text("Play and explore", color = Color(0xFFD4D4D8), fontSize = 12.sp, fontWeight = FontWeight.Medium)

        // Wide Groove Music Live Tile
        Box(
            modifier = Modifier
                .fillMaxWidth()
                .height(82.dp)
                .clip(RoundedCornerShape(4.dp))
                .background(
                    Brush.linearGradient(
                        listOf(
                            Color(currentTrack?.gradientStartHex ?: 0xFF6D28D9),
                            Color(currentTrack?.gradientEndHex ?: 0xFF312E81)
                        )
                    )
                )
                .clickable { onOpenApp(AppId.GROOVE) }
                .padding(12.dp)
                .testTag("start_tile_groove")
        ) {
            Row(
                verticalAlignment = Alignment.CenterVertically,
                horizontalArrangement = Arrangement.SpaceBetween,
                modifier = Modifier.fillMaxSize()
            ) {
                Column(modifier = Modifier.weight(1f)) {
                    Row(verticalAlignment = Alignment.CenterVertically) {
                        Text(
                            text = if (musicState.isPlaying) "NOW PLAYING" else "GROOVE MUSIC",
                            color = Color.White.copy(alpha = 0.8f),
                            fontSize = 9.sp,
                            fontWeight = FontWeight.Bold
                        )
                        if (musicState.isPlaying) {
                            Spacer(Modifier.width(8.dp))
                            Canvas(modifier = Modifier.width(36.dp).height(12.dp)) {
                                val bars = musicState.spectrumBars.take(6)
                                val bw = size.width / (bars.size * 2f)
                                bars.forEachIndexed { idx, amp ->
                                    val bh = (amp * size.height).coerceAtLeast(3f)
                                    drawRoundRect(
                                        color = Color.White.copy(alpha = 0.85f),
                                        topLeft = Offset(idx * bw * 2f, size.height - bh),
                                        size = Size(bw, bh),
                                        cornerRadius = CornerRadius(2f, 2f)
                                    )
                                }
                            }
                        }
                    }
                    Spacer(Modifier.height(4.dp))
                    Text(
                        text = currentTrack?.title ?: "Groove Music",
                        color = Color.White,
                        fontSize = 13.sp,
                        fontWeight = FontWeight.SemiBold,
                        maxLines = 1,
                        overflow = TextOverflow.Ellipsis
                    )
                    Text(
                        text = currentTrack?.artist ?: "Tap to open library",
                        color = Color.White.copy(alpha = 0.78f),
                        fontSize = 11.sp,
                        maxLines = 1,
                        overflow = TextOverflow.Ellipsis
                    )
                }
                Box(
                    contentAlignment = Alignment.Center,
                    modifier = Modifier
                        .size(40.dp)
                        .clip(CircleShape)
                        .background(Color.White.copy(alpha = 0.22f))
                        .clickable { onToggleMusicPlay() }
                ) {
                    Icon(
                        if (musicState.isPlaying) Icons.Filled.Pause else Icons.Filled.PlayArrow,
                        contentDescription = if (musicState.isPlaying) "Pause" else "Play",
                        tint = Color.White,
                        modifier = Modifier.size(22.dp)
                    )
                }
            }
        }

        // Second Row of Tiles
        Row(
            horizontalArrangement = Arrangement.spacedBy(8.dp),
            modifier = Modifier.fillMaxWidth()
        ) {
            SmallLiveTile(
                appId = AppId.MINESWEEPER,
                title = "Mines",
                color = Color(0xFF107C41),
                modifier = Modifier.weight(1f),
                onClick = { onOpenApp(AppId.MINESWEEPER) }
            )
            SmallLiveTile(
                appId = AppId.PAINT,
                title = "Paint",
                color = Color(0xFFD13438),
                modifier = Modifier.weight(1f),
                onClick = { onOpenApp(AppId.PAINT) }
            )
            SmallLiveTile(
                appId = AppId.CMD,
                title = "Terminal",
                color = Color(0xFF1F2937),
                modifier = Modifier.weight(1f),
                onClick = { onOpenApp(AppId.CMD) }
            )
            SmallLiveTile(
                appId = AppId.SETTINGS,
                title = "Settings",
                color = Color(0xFF0078D7),
                modifier = Modifier.weight(1f),
                onClick = { onOpenApp(AppId.SETTINGS) }
            )
        }
    }
}

@Composable
private fun SmallLiveTile(
    appId: AppId,
    title: String,
    color: Color,
    modifier: Modifier = Modifier,
    onClick: () -> Unit
) {
    Box(
        modifier = modifier
            .height(74.dp)
            .clip(RoundedCornerShape(4.dp))
            .background(color)
            .clickable(onClick = onClick)
            .padding(8.dp)
            .testTag("start_tile_${appId.name.lowercase()}")
    ) {
        WinAppIcon(
            appId = appId,
            size = 28.dp,
            modifier = Modifier.align(Alignment.Center)
        )
        Text(
            text = title,
            color = Color.White,
            fontSize = 10.sp,
            maxLines = 1,
            overflow = TextOverflow.Ellipsis,
            modifier = Modifier.align(Alignment.BottomStart)
        )
    }
}
