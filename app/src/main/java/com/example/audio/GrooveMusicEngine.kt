package com.example.audio

import android.content.Context
import android.media.AudioAttributes
import android.media.AudioFormat
import android.media.AudioTrack
import android.media.MediaPlayer
import android.net.Uri
import com.example.model.GrooveTrack
import kotlinx.coroutines.CoroutineScope
import kotlinx.coroutines.Dispatchers
import kotlinx.coroutines.Job
import kotlinx.coroutines.SupervisorJob
import kotlinx.coroutines.delay
import kotlinx.coroutines.isActive
import kotlinx.coroutines.launch
import kotlin.math.PI
import kotlin.math.abs
import kotlin.math.exp
import kotlin.math.pow
import kotlin.math.sin

val EQ_FREQUENCIES = listOf(60, 230, 910, 3600, 14000)

val EQ_PRESETS: Map<String, List<Int>> = mapOf(
    "Flat" to listOf(0, 0, 0, 0, 0),
    "Bass Boost" to listOf(6, 4, 1, 0, 0),
    "Treble Boost" to listOf(0, 0, 1, 4, 7),
    "Electronic" to listOf(5, 3, 0, 2, 5),
    "Rock" to listOf(4, 2, -1, 3, 4),
    "Vocal" to listOf(-2, 1, 5, 3, -1)
)

val DEFAULT_GROOVE_TRACKS = listOf(
    GrooveTrack(
        id = "gt-1",
        title = "Lofi Chill Sunset Chords",
        artist = "Groove Virtual Ensemble",
        album = "Windows 10 Ambient Sessions",
        genre = "Lo-Fi / Chillhop",
        year = 2026,
        durationSec = 210,
        trackKey = "track_lofi",
        isFavorite = true,
        gradientStartHex = 0xFFF59E0B,
        gradientEndHex = 0xFFE11D48
    ),
    GrooveTrack(
        id = "gt-2",
        title = "Neon Cyber Synthwave 80s",
        artist = "Digital Dreamer",
        album = "Retro Pulse Anthology",
        genre = "Synthwave / Retrowave",
        year = 2026,
        durationSec = 170,
        trackKey = "track_synth",
        isFavorite = false,
        gradientStartHex = 0xFFC026D3,
        gradientEndHex = 0xFF4F46E5
    ),
    GrooveTrack(
        id = "gt-3",
        title = "Ambient Peaceful Piano",
        artist = "Clara Vance",
        album = "Quiet Reflections",
        genre = "Classical / Ambient",
        year = 2025,
        durationSec = 195,
        trackKey = "track_piano",
        isFavorite = true,
        gradientStartHex = 0xFF14B8A6,
        gradientEndHex = 0xFF1D4ED8
    ),
    GrooveTrack(
        id = "gt-4",
        title = "8-Bit Arcade Hero Quest",
        artist = "Pixel Pulse",
        album = "Retro Bit Arcade",
        genre = "Chiptune / Arcade",
        year = 2026,
        durationSec = 155,
        trackKey = "track_8bit",
        isFavorite = false,
        gradientStartHex = 0xFF10B981,
        gradientEndHex = 0xFF0891B2
    ),
    GrooveTrack(
        id = "gt-5",
        title = "Deep Space Odyssey",
        artist = "Starlight Observatory",
        album = "Cosmic Drift",
        genre = "Ambient Space",
        year = 2026,
        durationSec = 240,
        trackKey = "track_cosmic",
        isFavorite = false,
        gradientStartHex = 0xFF581C87,
        gradientEndHex = 0xFF172554
    )
)

/**
 * Procedural music synthesizer & custom URI player for Groove Music.
 * Supports background playback across the OS shell, 5-band EQ shaping, and real-time visualizer samples.
 */
class GrooveMusicEngine(private val context: Context) {
    private val scope = CoroutineScope(SupervisorJob() + Dispatchers.Default)
    private var synthJob: Job? = null
    private var mediaPlayer: MediaPlayer? = null

    @Volatile
    private var isPlaying = false

    @Volatile
    private var currentVolume = 0.65f

    @Volatile
    private var eqGainsDb = intArrayOf(0, 0, 0, 0, 0)

    @Volatile
    private var currentSecond = 0

    @Volatile
    private var currentDuration = 210

    var onTick: ((currentSec: Int, durationSec: Int, spectrum: List<Float>, wave: List<Float>, finished: Boolean) -> Unit)? = null

    fun setVolume(vol: Float) {
        currentVolume = vol.coerceIn(0f, 1f)
        try {
            mediaPlayer?.setVolume(currentVolume, currentVolume)
        } catch (_: Throwable) {
        }
    }

    fun setEqGains(gains: List<Int>) {
        val next = IntArray(5) { idx -> (gains.getOrNull(idx) ?: 0).coerceIn(-12, 12) }
        eqGainsDb = next
    }

    fun playTrack(track: GrooveTrack, startSec: Int = 0) {
        stopInternal()
        currentSecond = startSec.coerceIn(0, track.durationSec)
        currentDuration = track.durationSec
        isPlaying = true

        if (track.isCustom && !track.audioUri.isNullOrBlank()) {
            playCustomUri(track, currentSecond)
        } else {
            playProceduralTrack(track)
        }
    }

    fun pause() {
        isPlaying = false
        synthJob?.cancel()
        synthJob = null
        try {
            if (mediaPlayer?.isPlaying == true) {
                mediaPlayer?.pause()
            }
        } catch (_: Throwable) {
        }
    }

    fun seek(sec: Int) {
        currentSecond = sec.coerceIn(0, currentDuration)
        try {
            mediaPlayer?.seekTo(currentSecond * 1000)
        } catch (_: Throwable) {
        }
    }

    private fun stopInternal() {
        isPlaying = false
        synthJob?.cancel()
        synthJob = null
        try {
            mediaPlayer?.stop()
            mediaPlayer?.release()
        } catch (_: Throwable) {
        }
        mediaPlayer = null
    }

    private fun playCustomUri(track: GrooveTrack, startSec: Int) {
        try {
            val mp = MediaPlayer().apply {
                setDataSource(context, Uri.parse(track.audioUri))
                prepare()
                seekTo(startSec * 1000)
                setVolume(currentVolume, currentVolume)
                start()
            }
            mediaPlayer = mp
            currentDuration = (mp.duration / 1000).coerceAtLeast(1)

            synthJob = scope.launch {
                var phase = 0f
                while (isActive && isPlaying) {
                    val pos = try { (mp.currentPosition / 1000) } catch (_: Throwable) { currentSecond }
                    val finished = try { !mp.isPlaying && pos >= currentDuration - 1 } catch (_: Throwable) { false }
                    currentSecond = pos
                    phase += 0.35f
                    val spectrum = List(24) { idx ->
                        val bandFactor = eqBandLinear(idx / 5)
                        (0.22f + 0.55f * abs(sin(phase + idx * 0.45f)) * bandFactor).coerceIn(0.08f, 1f)
                    }
                    val wave = List(48) { idx ->
                        (sin(phase * 1.6f + idx * 0.32f) * 0.65f).coerceIn(-1f, 1f)
                    }
                    onTick?.invoke(currentSecond, currentDuration, spectrum, wave, finished)
                    if (finished) break
                    delay(120)
                }
            }
        } catch (_: Throwable) {
            playProceduralTrack(track)
        }
    }

    private fun playProceduralTrack(track: GrooveTrack) {
        val sampleRate = 22050
        val stepDurationSec = when (track.trackKey) {
            "track_synth" -> 0.22
            "track_8bit" -> 0.18
            "track_piano" -> 0.55
            "track_cosmic" -> 0.70
            else -> 0.42
        }

        val scale = when (track.trackKey) {
            "track_synth" -> listOf(146.83, 174.61, 220.0, 261.63, 293.66, 349.23, 440.0)
            "track_8bit" -> listOf(261.63, 329.63, 392.0, 523.25, 659.25, 783.99, 523.25)
            "track_piano" -> listOf(220.0, 261.63, 329.63, 392.0, 440.0, 523.25, 659.25)
            "track_cosmic" -> listOf(110.0, 164.81, 220.0, 246.94, 329.63, 440.0)
            else -> listOf(174.61, 220.0, 261.63, 329.63, 349.23, 440.0, 523.25) // Lofi Fmaj7/Am9
        }

        synthJob = scope.launch {
            val minBuf = AudioTrack.getMinBufferSize(
                sampleRate,
                AudioFormat.CHANNEL_OUT_MONO,
                AudioFormat.ENCODING_PCM_16BIT
            ).coerceAtLeast(4096)

            val audioTrack = try {
                AudioTrack.Builder()
                    .setAudioAttributes(
                        AudioAttributes.Builder()
                            .setUsage(AudioAttributes.USAGE_MEDIA)
                            .setContentType(AudioAttributes.CONTENT_TYPE_MUSIC)
                            .build()
                    )
                    .setAudioFormat(
                        AudioFormat.Builder()
                            .setEncoding(AudioFormat.ENCODING_PCM_16BIT)
                            .setSampleRate(sampleRate)
                            .setChannelMask(AudioFormat.CHANNEL_OUT_MONO)
                            .build()
                    )
                    .setTransferMode(AudioTrack.MODE_STREAM)
                    .setBufferSizeInBytes(minBuf)
                    .build()
            } catch (_: Throwable) {
                null
            }

            try {
                audioTrack?.play()
                var step = 0
                var accumTime = 0.0

                while (isActive && isPlaying) {
                    val noteSamples = (sampleRate * stepDurationSec).toInt()
                    val pcm = ShortArray(noteSamples)
                    val rootFreq = scale[step % scale.size]
                    val fifthFreq = rootFreq * 1.5
                    val bassFreq = rootFreq * 0.5
                    val bassBoost = eqBandLinear(0)
                    val midBoost = eqBandLinear(2)
                    val trebleBoost = eqBandLinear(4)

                    val spectrum = MutableList(24) { 0.1f }
                    val wave = MutableList(48) { 0f }

                    for (i in 0 until noteSamples) {
                        val t = i.toDouble() / sampleRate
                        val env = (t / 0.025).coerceAtMost(1.0) * exp(-t * (2.6 / stepDurationSec))
                        val bass = sin(2.0 * PI * bassFreq * t) * 0.35 * bassBoost
                        val main = when (track.trackKey) {
                            "track_8bit" -> if (sin(2.0 * PI * rootFreq * t) >= 0) 0.35 else -0.35
                            "track_synth" -> ((rootFreq * t) % 1.0 - 0.5) * 0.65
                            else -> sin(2.0 * PI * rootFreq * t) * 0.45
                        } * midBoost
                        val shimmer = sin(2.0 * PI * fifthFreq * t) * 0.20 * trebleBoost
                        val mixed = ((bass + main + shimmer) * env * currentVolume).coerceIn(-0.9, 0.9)
                        pcm[i] = (mixed * Short.MAX_VALUE).toInt().toShort()

                        if (i < 48) {
                            wave[i] = mixed.toFloat()
                        }
                    }

                    for (b in 0 until 24) {
                        val eqMult = eqBandLinear((b * 5) / 24)
                        val pulse = abs(sin((step + b * 0.45) * 0.7)).toFloat()
                        spectrum[b] = (0.12f + pulse * 0.65f * eqMult.toFloat() * currentVolume).coerceIn(0.06f, 1f)
                    }

                    audioTrack?.write(pcm, 0, pcm.size)

                    accumTime += stepDurationSec
                    if (accumTime >= 1.0) {
                        val inc = accumTime.toInt()
                        accumTime -= inc
                        currentSecond += inc
                    }
                    val finished = currentSecond >= currentDuration
                    onTick?.invoke(currentSecond, currentDuration, spectrum, wave, finished)
                    if (finished) break

                    step++
                    if (audioTrack == null) {
                        delay((stepDurationSec * 1000).toLong())
                    }
                }
            } finally {
                try {
                    audioTrack?.stop()
                    audioTrack?.release()
                } catch (_: Throwable) {
                }
            }
        }
    }

    private fun eqBandLinear(bandIdx: Int): Double {
        val db = eqGainsDb[bandIdx.coerceIn(0, 4)]
        return 10.0.pow(db / 20.0).coerceIn(0.25, 2.2)
    }

    fun release() {
        stopInternal()
    }
}
