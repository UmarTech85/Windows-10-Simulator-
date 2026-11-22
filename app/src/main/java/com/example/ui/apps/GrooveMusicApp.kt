package com.example.ui.apps

import android.provider.OpenableColumns
import androidx.activity.compose.rememberLauncherForActivityResult
import androidx.activity.result.contract.ActivityResultContracts
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
import androidx.compose.foundation.lazy.LazyColumn
import androidx.compose.foundation.lazy.itemsIndexed
import androidx.compose.foundation.rememberScrollState
import androidx.compose.foundation.shape.CircleShape
import androidx.compose.foundation.shape.RoundedCornerShape
import androidx.compose.foundation.text.BasicTextField
import androidx.compose.foundation.verticalScroll
import androidx.compose.material.icons.Icons
import androidx.compose.material.icons.filled.Add
import androidx.compose.material.icons.filled.Album
import androidx.compose.material.icons.filled.Equalizer
import androidx.compose.material.icons.filled.Favorite
import androidx.compose.material.icons.filled.FavoriteBorder
import androidx.compose.material.icons.filled.FolderOpen
import androidx.compose.material.icons.filled.Headphones
import androidx.compose.material.icons.filled.LibraryMusic
import androidx.compose.material.icons.filled.Pause
import androidx.compose.material.icons.filled.Person
import androidx.compose.material.icons.filled.PlayArrow
import androidx.compose.material.icons.filled.QueueMusic
import androidx.compose.material.icons.filled.Repeat
import androidx.compose.material.icons.filled.RepeatOne
import androidx.compose.material.icons.filled.Shuffle
import androidx.compose.material.icons.filled.SkipNext
import androidx.compose.material.icons.filled.SkipPrevious
import androidx.compose.material.icons.filled.VolumeOff
import androidx.compose.material.icons.filled.VolumeUp
import androidx.compose.material3.HorizontalDivider
import androidx.compose.material3.Icon
import androidx.compose.material3.Slider
import androidx.compose.material3.SliderDefaults
import androidx.compose.material3.Text
import androidx.compose.runtime.Composable
import androidx.compose.runtime.getValue
import androidx.compose.runtime.mutableStateListOf
import androidx.compose.runtime.mutableStateOf
import androidx.compose.runtime.remember
import androidx.compose.runtime.setValue
import androidx.compose.ui.Alignment
import androidx.compose.ui.Modifier
import androidx.compose.ui.draw.clip
import androidx.compose.ui.geometry.CornerRadius
import androidx.compose.ui.geometry.Offset
import androidx.compose.ui.geometry.Size
import androidx.compose.ui.graphics.Brush
import androidx.compose.ui.graphics.Color
import androidx.compose.ui.graphics.Path
import androidx.compose.ui.graphics.SolidColor
import androidx.compose.ui.graphics.drawscope.Stroke
import androidx.compose.ui.platform.LocalContext
import androidx.compose.ui.platform.testTag
import androidx.compose.ui.text.TextStyle
import androidx.compose.ui.text.font.FontWeight
import androidx.compose.ui.text.style.TextOverflow
import androidx.compose.ui.unit.dp
import androidx.compose.ui.unit.sp
import com.example.audio.EQ_FREQUENCIES
import com.example.audio.EQ_PRESETS
import com.example.model.MusicPlayerUiState
import com.example.model.RepeatMode
import kotlin.math.roundToInt

private enum class GrooveTab(val label: String) {
    SONGS("Songs"),
    ARTISTS("Artists"),
    ALBUMS("Albums"),
    PLAYLISTS("Playlists"),
    NOW_PLAYING("Now Playing"),
    EQUALIZER("Equalizer")
}

private enum class VizMode(val label: String) {
    SPECTRUM("Spectrum"),
    WAVE("Wave"),
    HALO("Halo")
}

private data class UserPlaylist(
    val id: String,
    val name: String,
    val trackIds: List<String>
)

@Composable
fun GrooveMusicApp(
    musicState: MusicPlayerUiState,
    accentColor: Color,
    onTogglePlay: () -> Unit,
    onPlayTrack: (Int) -> Unit,
    onNext: () -> Unit,
    onPrev: () -> Unit,
    onSeek: (Int) -> Unit,
    onVolumeChange: (Float) -> Unit,
    onToggleMute: () -> Unit,
    onToggleShuffle: () -> Unit,
    onCycleRepeat: () -> Unit,
    onToggleFavorite: (String) -> Unit,
    onImportAudio: (title: String, uri: String) -> Unit,
    onSetEqBand: (Int, Int) -> Unit,
    onApplyEqPreset: (String) -> Unit
) {
    val context = LocalContext.current
    var activeTab by remember { mutableStateOf(GrooveTab.SONGS) }
    var vizMode by remember { mutableStateOf(VizMode.SPECTRUM) }
    var newPlaylistName by remember { mutableStateOf("") }
    val playlists = remember {
        mutableStateListOf(
            UserPlaylist("pl-fav", "Favorites", listOf("gt-1", "gt-3")),
            UserPlaylist("pl-focus", "Focus & Coding", listOf("gt-1", "gt-3", "gt-5"))
        )
    }

    val audioPicker = rememberLauncherForActivityResult(
        contract = ActivityResultContracts.OpenDocument()
    ) { uri ->
        if (uri != null) {
            var name = "Imported Audio.mp3"
            context.contentResolver.query(uri, null, null, null, null)?.use { c ->
                val idx = c.getColumnIndex(OpenableColumns.DISPLAY_NAME)
                if (idx >= 0 && c.moveToFirst()) name = c.getString(idx) ?: name
            }
            onImportAudio(name, uri.toString())
        }
    }

    val currentTrack = musicState.tracks.getOrNull(musicState.currentTrackIndex)

    fun fmtTime(sec: Int): String {
        val m = sec / 60
        val s = sec % 60
        return "%d:%02d".format(m, s)
    }

    Column(
        modifier = Modifier
            .fillMaxSize()
            .background(Color(0xFF121216))
            .testTag("app_groove")
    ) {
        // Top Navigation Tabs + Import Audio
        Row(
            verticalAlignment = Alignment.CenterVertically,
            horizontalArrangement = Arrangement.spacedBy(6.dp),
            modifier = Modifier
                .fillMaxWidth()
                .background(Color(0xFF1A1A22))
                .horizontalScroll(rememberScrollState())
                .padding(horizontal = 10.dp, vertical = 8.dp)
        ) {
            GrooveTab.entries.forEach { tab ->
                val selected = activeTab == tab
                Text(
                    text = tab.label,
                    color = if (selected) Color.White else Color(0xFFA1A1AA),
                    fontSize = 12.sp,
                    fontWeight = if (selected) FontWeight.SemiBold else FontWeight.Normal,
                    modifier = Modifier
                        .clip(RoundedCornerShape(4.dp))
                        .background(if (selected) accentColor else Color.Transparent)
                        .clickable { activeTab = tab }
                        .padding(horizontal = 10.dp, vertical = 5.dp)
                )
            }
            Spacer(Modifier.width(6.dp))
            Row(
                verticalAlignment = Alignment.CenterVertically,
                modifier = Modifier
                    .clip(RoundedCornerShape(4.dp))
                    .background(Color(0xFF2E2E3A))
                    .clickable { audioPicker.launch(arrayOf("audio/*")) }
                    .padding(horizontal = 10.dp, vertical = 5.dp)
            ) {
                Icon(Icons.Filled.FolderOpen, null, tint = Color(0xFFA78BFA), modifier = Modifier.size(14.dp))
                Spacer(Modifier.width(4.dp))
                Text("Import Audio", color = Color.White, fontSize = 11.sp)
            }
        }
        HorizontalDivider(color = Color.White.copy(alpha = 0.08f))

        // Main View Body
        Box(modifier = Modifier.weight(1f).fillMaxWidth()) {
            when (activeTab) {
                GrooveTab.SONGS -> {
                    LazyColumn(modifier = Modifier.fillMaxSize().padding(10.dp)) {
                        itemsIndexed(musicState.tracks, key = { _, t -> t.id }) { idx, track ->
                            val isCurrent = idx == musicState.currentTrackIndex
                            Row(
                                verticalAlignment = Alignment.CenterVertically,
                                modifier = Modifier
                                    .fillMaxWidth()
                                    .clip(RoundedCornerShape(6.dp))
                                    .background(if (isCurrent) accentColor.copy(alpha = 0.22f) else Color.Transparent)
                                    .clickable { onPlayTrack(idx) }
                                    .padding(horizontal = 10.dp, vertical = 8.dp)
                            ) {
                                Box(
                                    contentAlignment = Alignment.Center,
                                    modifier = Modifier
                                        .size(38.dp)
                                        .clip(RoundedCornerShape(6.dp))
                                        .background(Brush.linearGradient(listOf(Color(track.gradientStartHex), Color(track.gradientEndHex))))
                                ) {
                                    Icon(
                                        if (isCurrent && musicState.isPlaying) Icons.Filled.Equalizer else Icons.Filled.LibraryMusic,
                                        contentDescription = null,
                                        tint = Color.White,
                                        modifier = Modifier.size(20.dp)
                                    )
                                }
                                Spacer(Modifier.width(12.dp))
                                Column(modifier = Modifier.weight(1f)) {
                                    Text(track.title, color = Color.White, fontSize = 13.sp, fontWeight = FontWeight.Medium, maxLines = 1, overflow = TextOverflow.Ellipsis)
                                    Text("${track.artist} • ${track.album}", color = Color(0xFFA1A1AA), fontSize = 11.sp, maxLines = 1, overflow = TextOverflow.Ellipsis)
                                }
                                Icon(
                                    if (track.isFavorite) Icons.Filled.Favorite else Icons.Filled.FavoriteBorder,
                                    contentDescription = "Favorite",
                                    tint = if (track.isFavorite) Color(0xFFF43F5E) else Color(0xFF71717A),
                                    modifier = Modifier
                                        .size(28.dp)
                                        .clickable { onToggleFavorite(track.id) }
                                        .padding(4.dp)
                                )
                                Spacer(Modifier.width(6.dp))
                                Text(fmtTime(track.durationSec), color = Color(0xFFA1A1AA), fontSize = 11.sp)
                            }
                        }
                    }
                }

                GrooveTab.ARTISTS -> {
                    val grouped = remember(musicState.tracks) { musicState.tracks.groupBy { it.artist } }
                    Column(modifier = Modifier.fillMaxSize().verticalScroll(rememberScrollState()).padding(12.dp), verticalArrangement = Arrangement.spacedBy(10.dp)) {
                        grouped.forEach { (artist, tracks) ->
                            Row(
                                verticalAlignment = Alignment.CenterVertically,
                                modifier = Modifier
                                    .fillMaxWidth()
                                    .clip(RoundedCornerShape(8.dp))
                                    .background(Color(0xFF1D1D26))
                                    .clickable {
                                        val idx = musicState.tracks.indexOfFirst { it.id == tracks.first().id }
                                        if (idx >= 0) onPlayTrack(idx)
                                    }
                                    .padding(12.dp)
                            ) {
                                Box(
                                    contentAlignment = Alignment.Center,
                                    modifier = Modifier.size(44.dp).clip(CircleShape).background(accentColor.copy(alpha = 0.25f))
                                ) {
                                    Icon(Icons.Filled.Person, null, tint = Color.White)
                                }
                                Spacer(Modifier.width(12.dp))
                                Column {
                                    Text(artist, color = Color.White, fontSize = 14.sp, fontWeight = FontWeight.SemiBold)
                                    Text("${tracks.size} track(s) • ${tracks.first().genre}", color = Color(0xFFA1A1AA), fontSize = 11.sp)
                                }
                            }
                        }
                    }
                }

                GrooveTab.ALBUMS -> {
                    val grouped = remember(musicState.tracks) { musicState.tracks.groupBy { it.album } }
                    Column(modifier = Modifier.fillMaxSize().verticalScroll(rememberScrollState()).padding(12.dp), verticalArrangement = Arrangement.spacedBy(10.dp)) {
                        grouped.forEach { (album, tracks) ->
                            val first = tracks.first()
                            Row(
                                verticalAlignment = Alignment.CenterVertically,
                                modifier = Modifier
                                    .fillMaxWidth()
                                    .clip(RoundedCornerShape(8.dp))
                                    .background(Color(0xFF1D1D26))
                                    .clickable {
                                        val idx = musicState.tracks.indexOfFirst { it.id == first.id }
                                        if (idx >= 0) onPlayTrack(idx)
                                    }
                                    .padding(12.dp)
                            ) {
                                Box(
                                    contentAlignment = Alignment.Center,
                                    modifier = Modifier
                                        .size(48.dp)
                                        .clip(RoundedCornerShape(6.dp))
                                        .background(Brush.linearGradient(listOf(Color(first.gradientStartHex), Color(first.gradientEndHex))))
                                ) {
                                    Icon(Icons.Filled.Album, null, tint = Color.White)
                                }
                                Spacer(Modifier.width(12.dp))
                                Column {
                                    Text(album, color = Color.White, fontSize = 14.sp, fontWeight = FontWeight.SemiBold)
                                    Text("${first.artist} (${first.year}) • ${tracks.size} song(s)", color = Color(0xFFA1A1AA), fontSize = 11.sp)
                                }
                            }
                        }
                    }
                }

                GrooveTab.PLAYLISTS -> {
                    Column(modifier = Modifier.fillMaxSize().verticalScroll(rememberScrollState()).padding(12.dp), verticalArrangement = Arrangement.spacedBy(10.dp)) {
                        Row(verticalAlignment = Alignment.CenterVertically, horizontalArrangement = Arrangement.spacedBy(8.dp)) {
                            Box(
                                modifier = Modifier
                                    .weight(1f)
                                    .border(1.dp, Color.White.copy(alpha = 0.2f), RoundedCornerShape(4.dp))
                                    .padding(horizontal = 10.dp, vertical = 8.dp)
                            ) {
                                if (newPlaylistName.isEmpty()) Text("New playlist name...", color = Color(0xFF71717A), fontSize = 12.sp)
                                BasicTextField(
                                    value = newPlaylistName,
                                    onValueChange = { newPlaylistName = it },
                                    singleLine = true,
                                    textStyle = TextStyle(color = Color.White, fontSize = 12.sp),
                                    cursorBrush = SolidColor(Color.White),
                                    modifier = Modifier.fillMaxWidth()
                                )
                            }
                            Row(
                                verticalAlignment = Alignment.CenterVertically,
                                modifier = Modifier
                                    .clip(RoundedCornerShape(4.dp))
                                    .background(accentColor)
                                    .clickable {
                                        val nm = newPlaylistName.trim()
                                        if (nm.isNotEmpty()) {
                                            val curId = currentTrack?.id
                                            playlists.add(
                                                UserPlaylist("pl-${System.currentTimeMillis()}", nm, listOfNotNull(curId))
                                            )
                                            newPlaylistName = ""
                                        }
                                    }
                                    .padding(horizontal = 12.dp, vertical = 8.dp)
                            ) {
                                Icon(Icons.Filled.Add, null, tint = Color.White, modifier = Modifier.size(16.dp))
                                Spacer(Modifier.width(4.dp))
                                Text("Create", color = Color.White, fontSize = 12.sp)
                            }
                        }

                        playlists.forEach { pl ->
                            Column(
                                modifier = Modifier
                                    .fillMaxWidth()
                                    .clip(RoundedCornerShape(8.dp))
                                    .background(Color(0xFF1D1D26))
                                    .clickable {
                                        val firstId = pl.trackIds.firstOrNull()
                                        val idx = musicState.tracks.indexOfFirst { it.id == firstId }
                                        if (idx >= 0) onPlayTrack(idx)
                                    }
                                    .padding(12.dp)
                            ) {
                                Row(verticalAlignment = Alignment.CenterVertically) {
                                    Icon(Icons.Filled.QueueMusic, null, tint = Color(0xFFA78BFA), modifier = Modifier.size(22.dp))
                                    Spacer(Modifier.width(10.dp))
                                    Column {
                                        Text(pl.name, color = Color.White, fontSize = 14.sp, fontWeight = FontWeight.SemiBold)
                                        Text("${pl.trackIds.size} track(s)", color = Color(0xFFA1A1AA), fontSize = 11.sp)
                                    }
                                }
                            }
                        }
                    }
                }

                GrooveTab.NOW_PLAYING -> {
                    Column(
                        horizontalAlignment = Alignment.CenterHorizontally,
                        verticalArrangement = Arrangement.Center,
                        modifier = Modifier.fillMaxSize().padding(16.dp)
                    ) {
                        Row(horizontalArrangement = Arrangement.spacedBy(8.dp), modifier = Modifier.padding(bottom = 12.dp)) {
                            VizMode.entries.forEach { vm ->
                                val active = vizMode == vm
                                Text(
                                    vm.label,
                                    color = if (active) Color.White else Color(0xFFA1A1AA),
                                    fontSize = 11.sp,
                                    modifier = Modifier
                                        .clip(RoundedCornerShape(4.dp))
                                        .background(if (active) accentColor else Color(0xFF27272A))
                                        .clickable { vizMode = vm }
                                        .padding(horizontal = 10.dp, vertical = 4.dp)
                                )
                            }
                        }

                        Box(
                            contentAlignment = Alignment.Center,
                            modifier = Modifier
                                .size(110.dp)
                                .clip(RoundedCornerShape(14.dp))
                                .background(
                                    Brush.linearGradient(
                                        listOf(
                                            Color(currentTrack?.gradientStartHex ?: 0xFF7C3AED),
                                            Color(currentTrack?.gradientEndHex ?: 0xFF312E81)
                                        )
                                    )
                                )
                        ) {
                            Icon(Icons.Filled.Headphones, null, tint = Color.White, modifier = Modifier.size(48.dp))
                        }

                        Spacer(Modifier.height(10.dp))
                        Text(currentTrack?.title ?: "No track", color = Color.White, fontSize = 16.sp, fontWeight = FontWeight.SemiBold)
                        Text(currentTrack?.artist ?: "", color = Color(0xFFA1A1AA), fontSize = 12.sp)
                        Spacer(Modifier.height(14.dp))

                        Canvas(modifier = Modifier.fillMaxWidth().height(90.dp)) {
                            when (vizMode) {
                                VizMode.SPECTRUM -> {
                                    val bars = musicState.spectrumBars
                                    val bw = size.width / (bars.size * 1.4f)
                                    val gap = bw * 0.4f
                                    bars.forEachIndexed { idx, amp ->
                                        val bh = (amp * size.height).coerceAtLeast(6f)
                                        drawRoundRect(
                                            brush = Brush.verticalGradient(listOf(Color(0xFFC084FC), accentColor)),
                                            topLeft = Offset(idx * (bw + gap), size.height - bh),
                                            size = Size(bw, bh),
                                            cornerRadius = CornerRadius(4f, 4f)
                                        )
                                    }
                                }
                                VizMode.WAVE -> {
                                    val samples = musicState.waveSamples
                                    if (samples.isNotEmpty()) {
                                        val path = Path()
                                        val stepX = size.width / (samples.size - 1).coerceAtLeast(1)
                                        val midY = size.height / 2f
                                        samples.forEachIndexed { idx, s ->
                                            val x = idx * stepX
                                            val y = midY + s * (size.height * 0.42f)
                                            if (idx == 0) path.moveTo(x, y) else path.lineTo(x, y)
                                        }
                                        drawPath(path, color = Color(0xFF38BDF8), style = Stroke(width = 4f))
                                    }
                                }
                                VizMode.HALO -> {
                                    val avg = musicState.spectrumBars.average().toFloat()
                                    val maxR = minOf(size.width, size.height) * 0.46f
                                    drawCircle(color = accentColor.copy(alpha = 0.25f), radius = maxR * (0.5f + avg * 0.5f))
                                    drawCircle(color = Color(0xFFC084FC).copy(alpha = 0.45f), radius = maxR * (0.35f + avg * 0.4f), style = Stroke(width = 5f))
                                    drawCircle(color = Color.White.copy(alpha = 0.7f), radius = maxR * 0.25f)
                                }
                            }
                        }
                    }
                }

                GrooveTab.EQUALIZER -> {
                    Column(
                        modifier = Modifier
                            .fillMaxSize()
                            .verticalScroll(rememberScrollState())
                            .padding(14.dp),
                        verticalArrangement = Arrangement.spacedBy(10.dp)
                    ) {
                        Text("5-Band Graphic Equalizer", color = Color.White, fontSize = 14.sp, fontWeight = FontWeight.SemiBold)
                        Row(
                            horizontalArrangement = Arrangement.spacedBy(6.dp),
                            modifier = Modifier.fillMaxWidth().horizontalScroll(rememberScrollState())
                        ) {
                            EQ_PRESETS.keys.forEach { preset ->
                                val active = musicState.activeEqPreset == preset
                                Text(
                                    preset,
                                    color = Color.White,
                                    fontSize = 11.sp,
                                    modifier = Modifier
                                        .clip(RoundedCornerShape(4.dp))
                                        .background(if (active) accentColor else Color(0xFF27272A))
                                        .clickable { onApplyEqPreset(preset) }
                                        .padding(horizontal = 10.dp, vertical = 6.dp)
                                )
                            }
                        }

                        EQ_FREQUENCIES.forEachIndexed { idx, freq ->
                            val gain = musicState.eqGains.getOrElse(idx) { 0 }
                            val freqLabel = if (freq >= 1000) "${freq / 1000}kHz" else "${freq}Hz"
                            Row(verticalAlignment = Alignment.CenterVertically) {
                                Text(freqLabel, color = Color(0xFFA1A1AA), fontSize = 11.sp, modifier = Modifier.width(52.dp))
                                Slider(
                                    value = gain.toFloat(),
                                    onValueChange = { onSetEqBand(idx, it.roundToInt()) },
                                    valueRange = -12f..12f,
                                    colors = SliderDefaults.colors(thumbColor = accentColor, activeTrackColor = accentColor),
                                    modifier = Modifier.weight(1f)
                                )
                                Text("${if (gain > 0) "+" else ""}${gain}dB", color = Color.White, fontSize = 11.sp, modifier = Modifier.width(44.dp))
                            }
                        }
                    }
                }
            }
        }

        // Sticky Bottom Transport Bar
        HorizontalDivider(color = Color.White.copy(alpha = 0.12f))
        Column(
            modifier = Modifier
                .fillMaxWidth()
                .background(Color(0xFF1A1A22))
                .padding(horizontal = 12.dp, vertical = 6.dp)
        ) {
            Row(verticalAlignment = Alignment.CenterVertically) {
                Text(fmtTime(musicState.currentTimeSec), color = Color(0xFFA1A1AA), fontSize = 10.sp)
                Slider(
                    value = musicState.currentTimeSec.toFloat().coerceIn(0f, musicState.durationSec.coerceAtLeast(1).toFloat()),
                    onValueChange = { onSeek(it.roundToInt()) },
                    valueRange = 0f..musicState.durationSec.coerceAtLeast(1).toFloat(),
                    colors = SliderDefaults.colors(thumbColor = accentColor, activeTrackColor = accentColor),
                    modifier = Modifier.weight(1f).height(24.dp).padding(horizontal = 6.dp)
                )
                Text(fmtTime(musicState.durationSec), color = Color(0xFFA1A1AA), fontSize = 10.sp)
            }

            Row(
                verticalAlignment = Alignment.CenterVertically,
                horizontalArrangement = Arrangement.SpaceBetween,
                modifier = Modifier.fillMaxWidth()
            ) {
                Column(modifier = Modifier.weight(1f)) {
                    Text(currentTrack?.title ?: "Groove Music", color = Color.White, fontSize = 12.sp, fontWeight = FontWeight.SemiBold, maxLines = 1, overflow = TextOverflow.Ellipsis)
                    Text(currentTrack?.artist ?: "", color = Color(0xFFA1A1AA), fontSize = 10.sp, maxLines = 1, overflow = TextOverflow.Ellipsis)
                }

                Row(verticalAlignment = Alignment.CenterVertically, horizontalArrangement = Arrangement.spacedBy(8.dp)) {
                    Icon(
                        Icons.Filled.Shuffle,
                        contentDescription = "Shuffle",
                        tint = if (musicState.isShuffle) accentColor else Color(0xFFA1A1AA),
                        modifier = Modifier.size(20.dp).clickable { onToggleShuffle() }
                    )
                    Icon(
                        Icons.Filled.SkipPrevious,
                        contentDescription = "Previous track",
                        tint = Color.White,
                        modifier = Modifier.size(24.dp).clickable { onPrev() }
                    )
                    Box(
                        contentAlignment = Alignment.Center,
                        modifier = Modifier
                            .size(36.dp)
                            .clip(CircleShape)
                            .background(accentColor)
                            .clickable { onTogglePlay() }
                            .testTag("groove_play_pause")
                    ) {
                        Icon(
                            if (musicState.isPlaying) Icons.Filled.Pause else Icons.Filled.PlayArrow,
                            contentDescription = if (musicState.isPlaying) "Pause" else "Play",
                            tint = Color.White,
                            modifier = Modifier.size(22.dp)
                        )
                    }
                    Icon(
                        Icons.Filled.SkipNext,
                        contentDescription = "Next track",
                        tint = Color.White,
                        modifier = Modifier.size(24.dp).clickable { onNext() }
                    )
                    Icon(
                        if (musicState.repeatMode == RepeatMode.ONE) Icons.Filled.RepeatOne else Icons.Filled.Repeat,
                        contentDescription = "Repeat mode",
                        tint = if (musicState.repeatMode != RepeatMode.OFF) accentColor else Color(0xFFA1A1AA),
                        modifier = Modifier.size(20.dp).clickable { onCycleRepeat() }
                    )
                    Icon(
                        if (musicState.isMuted) Icons.Filled.VolumeOff else Icons.Filled.VolumeUp,
                        contentDescription = "Mute",
                        tint = Color.White,
                        modifier = Modifier.size(20.dp).clickable { onToggleMute() }
                    )
                }
            }
        }
    }
}
