package com.example.audio

import android.media.AudioAttributes
import android.media.AudioFormat
import android.media.AudioTrack
import kotlinx.coroutines.CoroutineScope
import kotlinx.coroutines.Dispatchers
import kotlinx.coroutines.SupervisorJob
import kotlinx.coroutines.launch
import kotlin.math.PI
import kotlin.math.exp
import kotlin.math.sin
import kotlin.random.Random

/**
 * Pure Kotlin PCM AudioTrack synthesizer reproducing Windows 10 UI sound cues
 * from the original Web Audio sound engine.
 */
object WindowsSoundEngine {
    private val scope = CoroutineScope(SupervisorJob() + Dispatchers.Default)
    private const val SAMPLE_RATE = 22050

    @Volatile
    var enabled: Boolean = true

    @Volatile
    var masterVolume: Float = 0.75f

    @Volatile
    var muted: Boolean = false

    fun playStartup() {
        if (!enabled || muted) return
        playChord(
            notes = listOf(
                Triple(185.0, 0.0, 2.2),
                Triple(277.18, 0.08, 2.1),
                Triple(369.99, 0.16, 2.0),
                Triple(466.16, 0.24, 1.9)
            ),
            amplitude = 0.22f
        )
    }

    fun playNotification() {
        if (!enabled || muted) return
        playChord(
            notes = listOf(
                Triple(698.46, 0.0, 0.24),
                Triple(1046.50, 0.12, 0.45)
            ),
            amplitude = 0.26f
        )
    }

    fun playDing() {
        if (!enabled || muted) return
        playChord(
            notes = listOf(Triple(880.0, 0.0, 0.42)),
            amplitude = 0.28f,
            triangle = true
        )
    }

    fun playClick() {
        if (!enabled || muted) return
        scope.launch {
            val totalSamples = (SAMPLE_RATE * 0.035).toInt()
            val pcm = ShortArray(totalSamples)
            val vol = masterVolume.coerceIn(0f, 1f)
            for (i in 0 until totalSamples) {
                val t = i.toDouble() / SAMPLE_RATE
                val freq = 400.0 * exp(-t * 32.0)
                val env = exp(-t * 110.0)
                val sample = sin(2.0 * PI * freq * t) * env * 0.14 * vol
                pcm[i] = (sample * Short.MAX_VALUE).toInt().coerceIn(Short.MIN_VALUE.toInt(), Short.MAX_VALUE.toInt()).toShort()
            }
            writeAndPlay(pcm)
        }
    }

    fun playRecycleEmpty() {
        if (!enabled || muted) return
        scope.launch {
            val totalSamples = (SAMPLE_RATE * 0.32).toInt()
            val pcm = ShortArray(totalSamples)
            val vol = masterVolume.coerceIn(0f, 1f)
            var last = 0.0
            for (i in 0 until totalSamples) {
                val t = i.toDouble() / SAMPLE_RATE
                val white = Random.nextDouble(-1.0, 1.0)
                last = last * 0.72 + white * 0.28
                val env = exp(-t * 11.0)
                val sample = last * env * 0.25 * vol
                pcm[i] = (sample * Short.MAX_VALUE).toInt().coerceIn(Short.MIN_VALUE.toInt(), Short.MAX_VALUE.toInt()).toShort()
            }
            writeAndPlay(pcm)
        }
    }

    fun playExplosion() {
        if (!enabled || muted) return
        scope.launch {
            val totalSamples = (SAMPLE_RATE * 0.55).toInt()
            val pcm = ShortArray(totalSamples)
            val vol = masterVolume.coerceIn(0f, 1f)
            var lp = 0.0
            for (i in 0 until totalSamples) {
                val t = i.toDouble() / SAMPLE_RATE
                val white = Random.nextDouble(-1.0, 1.0)
                lp = lp * 0.88 + white * 0.12
                val env = exp(-t * 6.5)
                val sample = lp * env * 0.55 * vol
                pcm[i] = (sample * Short.MAX_VALUE).toInt().coerceIn(Short.MIN_VALUE.toInt(), Short.MAX_VALUE.toInt()).toShort()
            }
            writeAndPlay(pcm)
        }
    }

    fun playWin() {
        if (!enabled || muted) return
        playChord(
            notes = listOf(
                Triple(523.25, 0.0, 0.35),
                Triple(659.25, 0.10, 0.35),
                Triple(783.99, 0.20, 0.35),
                Triple(1046.50, 0.30, 0.45)
            ),
            amplitude = 0.26f,
            triangle = true
        )
    }

    private fun playChord(
        notes: List<Triple<Double, Double, Double>>,
        amplitude: Float,
        triangle: Boolean = false
    ) {
        scope.launch {
            val maxEnd = notes.maxOfOrNull { it.second + it.third } ?: 0.5
            val totalSamples = (SAMPLE_RATE * maxEnd).toInt().coerceAtLeast(1)
            val mix = DoubleArray(totalSamples)
            val vol = masterVolume.coerceIn(0f, 1f) * amplitude

            for ((freq, startSec, durSec) in notes) {
                val startIdx = (startSec * SAMPLE_RATE).toInt()
                val endIdx = ((startSec + durSec) * SAMPLE_RATE).toInt().coerceAtMost(totalSamples)
                for (i in startIdx until endIdx) {
                    val localT = (i - startIdx).toDouble() / SAMPLE_RATE
                    val attack = (localT / 0.04).coerceAtMost(1.0)
                    val decay = exp(-localT * (4.0 / durSec))
                    val phase = (freq * localT) % 1.0
                    val wave = if (triangle) {
                        1.0 - 4.0 * kotlin.math.abs(phase - 0.5)
                    } else {
                        sin(2.0 * PI * freq * localT)
                    }
                    mix[i] += wave * attack * decay
                }
            }

            val pcm = ShortArray(totalSamples)
            for (i in 0 until totalSamples) {
                val s = (mix[i] * vol).coerceIn(-0.95, 0.95)
                pcm[i] = (s * Short.MAX_VALUE).toInt().toShort()
            }
            writeAndPlay(pcm)
        }
    }

    private fun writeAndPlay(pcm: ShortArray) {
        try {
            val track = AudioTrack.Builder()
                .setAudioAttributes(
                    AudioAttributes.Builder()
                        .setUsage(AudioAttributes.USAGE_ASSISTANCE_SONIFICATION)
                        .setContentType(AudioAttributes.CONTENT_TYPE_SONIFICATION)
                        .build()
                )
                .setAudioFormat(
                    AudioFormat.Builder()
                        .setEncoding(AudioFormat.ENCODING_PCM_16BIT)
                        .setSampleRate(SAMPLE_RATE)
                        .setChannelMask(AudioFormat.CHANNEL_OUT_MONO)
                        .build()
                )
                .setTransferMode(AudioTrack.MODE_STATIC)
                .setBufferSizeInBytes(pcm.size * 2)
                .build()

            track.write(pcm, 0, pcm.size)
            track.play()
            val durationMs = (pcm.size * 1000L) / SAMPLE_RATE + 120L
            Thread.sleep(durationMs)
            track.stop()
            track.release()
        } catch (_: Throwable) {
            // Safe fallback on headless or audio-restricted devices
        }
    }
}
