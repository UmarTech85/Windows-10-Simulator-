package com.example.ui.apps

import androidx.compose.foundation.Image
import androidx.compose.foundation.background
import androidx.compose.foundation.border
import androidx.compose.foundation.clickable
import androidx.compose.foundation.layout.Arrangement
import androidx.compose.foundation.layout.Box
import androidx.compose.foundation.layout.Column
import androidx.compose.foundation.layout.ExperimentalLayoutApi
import androidx.compose.foundation.layout.FlowRow
import androidx.compose.foundation.layout.Row
import androidx.compose.foundation.layout.Spacer
import androidx.compose.foundation.layout.fillMaxSize
import androidx.compose.foundation.layout.fillMaxWidth
import androidx.compose.foundation.layout.height
import androidx.compose.foundation.layout.padding
import androidx.compose.foundation.layout.size
import androidx.compose.foundation.layout.width
import androidx.compose.foundation.rememberScrollState
import androidx.compose.foundation.shape.CircleShape
import androidx.compose.foundation.shape.RoundedCornerShape
import androidx.compose.foundation.text.BasicTextField
import androidx.compose.foundation.verticalScroll
import androidx.compose.material.icons.Icons
import androidx.compose.material.icons.automirrored.filled.ArrowBack
import androidx.compose.material.icons.filled.CheckCircle
import androidx.compose.material.icons.filled.Computer
import androidx.compose.material.icons.filled.Palette
import androidx.compose.material.icons.filled.Search
import androidx.compose.material.icons.filled.Security
import androidx.compose.material3.Button
import androidx.compose.material3.ButtonDefaults
import androidx.compose.material3.CircularProgressIndicator
import androidx.compose.material3.HorizontalDivider
import androidx.compose.material3.Icon
import androidx.compose.material3.Switch
import androidx.compose.material3.SwitchDefaults
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
import androidx.compose.ui.graphics.SolidColor
import androidx.compose.ui.graphics.vector.ImageVector
import androidx.compose.ui.layout.ContentScale
import androidx.compose.ui.platform.testTag
import androidx.compose.ui.res.painterResource
import androidx.compose.ui.text.TextStyle
import androidx.compose.ui.text.font.FontWeight
import androidx.compose.ui.unit.dp
import androidx.compose.ui.unit.sp
import com.example.model.ACCENT_COLOR_OPTIONS
import com.example.model.SystemSettings
import com.example.model.WALLPAPER_OPTIONS
import kotlinx.coroutines.delay

private enum class SettingsSection {
    HOME, SYSTEM, PERSONALIZATION, UPDATE
}

@OptIn(ExperimentalLayoutApi::class)
@Composable
fun SettingsApp(
    settings: SystemSettings,
    onUpdateSettings: ((SystemSettings) -> SystemSettings) -> Unit
) {
    var section by remember { mutableStateOf(SettingsSection.HOME) }
    var search by remember { mutableStateOf("") }
    var checkingUpdate by remember { mutableStateOf(false) }
    var updateStatus by remember { mutableStateOf("You're up to date. Last checked: Today") }

    LaunchedEffect(checkingUpdate) {
        if (checkingUpdate) {
            delay(1800)
            checkingUpdate = false
            updateStatus = "You're up to date (Windows 10 Build 19045.5011). Last checked: Just now"
        }
    }

    val bg = if (settings.isDarkTheme) Color(0xFF18181B) else Color(0xFFF8FAFC)
    val cardBg = if (settings.isDarkTheme) Color(0xFF27272A) else Color.White
    val textColor = if (settings.isDarkTheme) Color.White else Color(0xFF18181B)
    val mutedColor = if (settings.isDarkTheme) Color(0xFFA1A1AA) else Color(0xFF64748B)
    val borderColor = if (settings.isDarkTheme) Color.White.copy(alpha = 0.1f) else Color(0xFFE2E8F0)

    Column(
        modifier = Modifier
            .fillMaxSize()
            .background(bg)
            .testTag("app_settings")
    ) {
        // Header Bar
        Row(
            verticalAlignment = Alignment.CenterVertically,
            modifier = Modifier
                .fillMaxWidth()
                .background(cardBg)
                .padding(horizontal = 12.dp, vertical = 10.dp)
        ) {
            if (section != SettingsSection.HOME) {
                Icon(
                    Icons.AutoMirrored.Filled.ArrowBack,
                    contentDescription = "Back to Settings Home",
                    tint = textColor,
                    modifier = Modifier
                        .size(30.dp)
                        .clickable { section = SettingsSection.HOME }
                        .padding(4.dp)
                )
                Spacer(Modifier.width(8.dp))
            }
            Text(
                text = when (section) {
                    SettingsSection.HOME -> "Windows Settings"
                    SettingsSection.SYSTEM -> "System"
                    SettingsSection.PERSONALIZATION -> "Personalization"
                    SettingsSection.UPDATE -> "Update & Security"
                },
                color = textColor,
                fontSize = 16.sp,
                fontWeight = FontWeight.SemiBold
            )
        }
        HorizontalDivider(color = borderColor)

        Column(
            modifier = Modifier
                .weight(1f)
                .fillMaxWidth()
                .verticalScroll(rememberScrollState())
                .padding(16.dp),
            verticalArrangement = Arrangement.spacedBy(16.dp)
        ) {
            when (section) {
                SettingsSection.HOME -> {
                    Row(
                        verticalAlignment = Alignment.CenterVertically,
                        modifier = Modifier
                            .fillMaxWidth()
                            .border(1.dp, borderColor, RoundedCornerShape(4.dp))
                            .background(cardBg)
                            .padding(horizontal = 10.dp, vertical = 8.dp)
                    ) {
                        Box(modifier = Modifier.weight(1f)) {
                            if (search.isEmpty()) Text("Find a setting", color = mutedColor, fontSize = 13.sp)
                            BasicTextField(
                                value = search,
                                onValueChange = { search = it },
                                singleLine = true,
                                textStyle = TextStyle(color = textColor, fontSize = 13.sp),
                                cursorBrush = SolidColor(textColor),
                                modifier = Modifier.fillMaxWidth()
                            )
                        }
                        Icon(Icons.Filled.Search, null, tint = mutedColor, modifier = Modifier.size(18.dp))
                    }

                    val cards = listOf(
                        Triple(SettingsSection.SYSTEM, "System", "Display, sound, night light, lock screen") to Icons.Filled.Computer,
                        Triple(SettingsSection.PERSONALIZATION, "Personalization", "Background, accent color, dark/light theme") to Icons.Filled.Palette,
                        Triple(SettingsSection.UPDATE, "Update & Security", "Windows Update, security status") to Icons.Filled.Security
                    ).filter { (info, _) ->
                        search.isBlank() ||
                            info.second.contains(search, true) ||
                            info.third.contains(search, true)
                    }

                    FlowRow(
                        horizontalArrangement = Arrangement.spacedBy(12.dp),
                        verticalArrangement = Arrangement.spacedBy(12.dp),
                        modifier = Modifier.fillMaxWidth()
                    ) {
                        cards.forEach { (info, icon) ->
                            SettingsCategoryCard(
                                title = info.second,
                                subtitle = info.third,
                                icon = icon,
                                accentColor = settings.accentColor,
                                cardBg = cardBg,
                                textColor = textColor,
                                mutedColor = mutedColor,
                                borderColor = borderColor,
                                onClick = { section = info.first }
                            )
                        }
                    }
                }

                SettingsSection.PERSONALIZATION -> {
                    Text("Background Wallpaper", color = textColor, fontSize = 14.sp, fontWeight = FontWeight.SemiBold)
                    Row(horizontalArrangement = Arrangement.spacedBy(10.dp), modifier = Modifier.fillMaxWidth()) {
                        WALLPAPER_OPTIONS.forEach { wp ->
                            val selected = settings.wallpaperId == wp.id
                            Column(
                                modifier = Modifier
                                    .weight(1f)
                                    .clip(RoundedCornerShape(6.dp))
                                    .border(if (selected) 2.5.dp else 1.dp, if (selected) settings.accentColor else borderColor, RoundedCornerShape(6.dp))
                                    .clickable {
                                        onUpdateSettings {
                                            it.copy(wallpaperId = wp.id, customWallpaperPath = null, customWallpaperUri = null)
                                        }
                                    }
                            ) {
                                Image(
                                    painter = painterResource(wp.drawableRes),
                                    contentDescription = wp.name,
                                    contentScale = ContentScale.Crop,
                                    modifier = Modifier.fillMaxWidth().height(68.dp)
                                )
                                Text(wp.name.split(" ").first(), color = textColor, fontSize = 10.sp, modifier = Modifier.padding(6.dp))
                            }
                        }
                    }

                    Text("Accent Color", color = textColor, fontSize = 14.sp, fontWeight = FontWeight.SemiBold)
                    FlowRow(horizontalArrangement = Arrangement.spacedBy(10.dp), verticalArrangement = Arrangement.spacedBy(10.dp)) {
                        ACCENT_COLOR_OPTIONS.forEach { opt ->
                            val selected = settings.accentColorLong == opt.colorLong
                            Box(
                                modifier = Modifier
                                    .size(40.dp)
                                    .clip(CircleShape)
                                    .background(Color(opt.colorLong))
                                    .border(if (selected) 3.dp else 1.dp, Color.White, CircleShape)
                                    .clickable { onUpdateSettings { it.copy(accentColorLong = opt.colorLong) } }
                            )
                        }
                    }

                    SettingToggleRow(
                        title = "Dark App Mode",
                        subtitle = "Use Windows 10 dark surfaces across built-in apps",
                        checked = settings.isDarkTheme,
                        accentColor = settings.accentColor,
                        textColor = textColor,
                        mutedColor = mutedColor,
                        onCheckedChange = { checked -> onUpdateSettings { it.copy(isDarkTheme = checked) } }
                    )
                }

                SettingsSection.SYSTEM -> {
                    SettingToggleRow(
                        title = "Night Light",
                        subtitle = "Display warmer colors to reduce blue light",
                        checked = settings.nightLight,
                        accentColor = settings.accentColor,
                        textColor = textColor,
                        mutedColor = mutedColor,
                        onCheckedChange = { checked -> onUpdateSettings { it.copy(nightLight = checked) } }
                    )
                    SettingToggleRow(
                        title = "Windows UI Sound Effects",
                        subtitle = "Play startup, click, notification, and recycle sounds",
                        checked = settings.soundEffects,
                        accentColor = settings.accentColor,
                        textColor = textColor,
                        mutedColor = mutedColor,
                        onCheckedChange = { checked -> onUpdateSettings { it.copy(soundEffects = checked) } }
                    )
                    SettingToggleRow(
                        title = "Show Lock Screen on Startup",
                        subtitle = "Require clicking Sign in when booting the simulator",
                        checked = settings.lockScreenEnabled,
                        accentColor = settings.accentColor,
                        textColor = textColor,
                        mutedColor = mutedColor,
                        onCheckedChange = { checked -> onUpdateSettings { it.copy(lockScreenEnabled = checked) } }
                    )
                    Column(
                        modifier = Modifier
                            .fillMaxWidth()
                            .clip(RoundedCornerShape(6.dp))
                            .background(cardBg)
                            .border(1.dp, borderColor, RoundedCornerShape(6.dp))
                            .padding(12.dp)
                    ) {
                        Text("Device Specifications", color = textColor, fontSize = 13.sp, fontWeight = FontWeight.SemiBold)
                        Spacer(Modifier.height(6.dp))
                        Text("Device name: DESKTOP-WIN10", color = mutedColor, fontSize = 12.sp)
                        Text("Edition: Windows 10 Pro (Build 19045.5011)", color = mutedColor, fontSize = 12.sp)
                        Text("Installed RAM: 16.0 GB DDR5", color = mutedColor, fontSize = 12.sp)
                    }
                }

                SettingsSection.UPDATE -> {
                    Row(verticalAlignment = Alignment.CenterVertically, horizontalArrangement = Arrangement.spacedBy(12.dp)) {
                        if (checkingUpdate) {
                            CircularProgressIndicator(color = settings.accentColor, modifier = Modifier.size(32.dp), strokeWidth = 3.dp)
                        } else {
                            Icon(Icons.Filled.CheckCircle, null, tint = Color(0xFF10B981), modifier = Modifier.size(34.dp))
                        }
                        Column {
                            Text(
                                if (checkingUpdate) "Checking for updates..." else "Windows Update",
                                color = textColor,
                                fontSize = 15.sp,
                                fontWeight = FontWeight.SemiBold
                            )
                            Text(updateStatus, color = mutedColor, fontSize = 12.sp)
                        }
                    }
                    Button(
                        onClick = { checkingUpdate = true },
                        enabled = !checkingUpdate,
                        colors = ButtonDefaults.buttonColors(containerColor = settings.accentColor),
                        shape = RoundedCornerShape(4.dp)
                    ) {
                        Text("Check for updates")
                    }
                }
            }
        }
    }
}

@Composable
private fun SettingsCategoryCard(
    title: String,
    subtitle: String,
    icon: ImageVector,
    accentColor: Color,
    cardBg: Color,
    textColor: Color,
    mutedColor: Color,
    borderColor: Color,
    onClick: () -> Unit
) {
    Row(
        verticalAlignment = Alignment.CenterVertically,
        modifier = Modifier
            .width(240.dp)
            .clip(RoundedCornerShape(6.dp))
            .background(cardBg)
            .border(1.dp, borderColor, RoundedCornerShape(6.dp))
            .clickable(onClick = onClick)
            .padding(14.dp)
    ) {
        Icon(icon, contentDescription = title, tint = accentColor, modifier = Modifier.size(28.dp))
        Spacer(Modifier.width(12.dp))
        Column {
            Text(title, color = textColor, fontSize = 14.sp, fontWeight = FontWeight.SemiBold)
            Text(subtitle, color = mutedColor, fontSize = 11.sp)
        }
    }
}

@Composable
private fun SettingToggleRow(
    title: String,
    subtitle: String,
    checked: Boolean,
    accentColor: Color,
    textColor: Color,
    mutedColor: Color,
    onCheckedChange: (Boolean) -> Unit
) {
    Row(
        verticalAlignment = Alignment.CenterVertically,
        horizontalArrangement = Arrangement.SpaceBetween,
        modifier = Modifier.fillMaxWidth().padding(vertical = 4.dp)
    ) {
        Column(modifier = Modifier.weight(1f).padding(end = 12.dp)) {
            Text(title, color = textColor, fontSize = 13.sp, fontWeight = FontWeight.Medium)
            Text(subtitle, color = mutedColor, fontSize = 11.sp)
        }
        Switch(
            checked = checked,
            onCheckedChange = onCheckedChange,
            colors = SwitchDefaults.colors(checkedThumbColor = Color.White, checkedTrackColor = accentColor)
        )
    }
}
