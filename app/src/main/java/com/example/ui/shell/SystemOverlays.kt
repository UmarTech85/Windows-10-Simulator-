package com.example.ui.shell

import androidx.compose.animation.AnimatedVisibility
import androidx.compose.animation.fadeIn
import androidx.compose.animation.fadeOut
import androidx.compose.foundation.Canvas
import androidx.compose.foundation.Image
import androidx.compose.foundation.background
import androidx.compose.foundation.border
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
import androidx.compose.foundation.layout.size
import androidx.compose.foundation.layout.statusBarsPadding
import androidx.compose.foundation.layout.width
import androidx.compose.foundation.shape.CircleShape
import androidx.compose.foundation.shape.RoundedCornerShape
import androidx.compose.material.icons.Icons
import androidx.compose.material.icons.filled.BatteryFull
import androidx.compose.material.icons.filled.Person
import androidx.compose.material.icons.filled.Wifi
import androidx.compose.material3.Button
import androidx.compose.material3.ButtonDefaults
import androidx.compose.material3.CircularProgressIndicator
import androidx.compose.material3.Icon
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
import androidx.compose.ui.draw.blur
import androidx.compose.ui.draw.clip
import androidx.compose.ui.geometry.Offset
import androidx.compose.ui.geometry.Size
import androidx.compose.ui.graphics.Color
import androidx.compose.ui.layout.ContentScale
import androidx.compose.ui.platform.testTag
import androidx.compose.ui.res.painterResource
import androidx.compose.ui.text.font.FontWeight
import androidx.compose.ui.unit.dp
import androidx.compose.ui.unit.sp
import com.example.R
import com.example.model.PowerMode
import kotlinx.coroutines.delay
import java.text.SimpleDateFormat
import java.util.Date
import java.util.Locale

@Composable
fun LockScreenOverlay(
    visible: Boolean,
    accentColor: Color,
    onUnlock: () -> Unit,
    modifier: Modifier = Modifier
) {
    var showLogin by remember(visible) { mutableStateOf(false) }
    var timeStr by remember { mutableStateOf("") }
    var dateStr by remember { mutableStateOf("") }

    LaunchedEffect(visible) {
        if (!visible) return@LaunchedEffect
        val tf = SimpleDateFormat("h:mm", Locale.getDefault())
        val df = SimpleDateFormat("EEEE, MMMM d", Locale.getDefault())
        while (true) {
            val now = Date()
            timeStr = tf.format(now)
            dateStr = df.format(now)
            delay(1000)
        }
    }

    AnimatedVisibility(visible = visible, enter = fadeIn(), exit = fadeOut(), modifier = modifier) {
        Box(
            modifier = Modifier
                .fillMaxSize()
                .clickable(
                    interactionSource = remember { androidx.compose.foundation.interaction.MutableInteractionSource() },
                    indication = null
                ) {
                    if (!showLogin) showLogin = true
                }
                .testTag("lock_screen_overlay")
        ) {
            Image(
                painter = painterResource(R.drawable.win10_nature_wallpaper),
                contentDescription = "Lock Screen Wallpaper",
                contentScale = ContentScale.Crop,
                modifier = Modifier
                    .fillMaxSize()
                    .then(if (showLogin) Modifier.blur(18.dp) else Modifier)
            )
            Box(
                modifier = Modifier
                    .fillMaxSize()
                    .background(Color.Black.copy(alpha = if (showLogin) 0.48f else 0.2f))
            )

            if (!showLogin) {
                Column(
                    modifier = Modifier
                        .align(Alignment.BottomStart)
                        .padding(start = 32.dp, bottom = 72.dp)
                ) {
                    Text(timeStr, color = Color.White, fontSize = 64.sp, fontWeight = FontWeight.Light)
                    Text(dateStr, color = Color.White, fontSize = 22.sp, fontWeight = FontWeight.Light)
                    Spacer(Modifier.height(16.dp))
                    Text("Tap anywhere to sign in", color = Color.White.copy(alpha = 0.78f), fontSize = 13.sp)
                }

                Row(
                    horizontalArrangement = Arrangement.spacedBy(12.dp),
                    modifier = Modifier
                        .align(Alignment.BottomEnd)
                        .padding(28.dp)
                ) {
                    Icon(Icons.Filled.Wifi, contentDescription = "Wi-Fi Connected", tint = Color.White, modifier = Modifier.size(20.dp))
                    Icon(Icons.Filled.BatteryFull, contentDescription = "Battery Full", tint = Color.White, modifier = Modifier.size(20.dp))
                }
            } else {
                Column(
                    horizontalAlignment = Alignment.CenterHorizontally,
                    verticalArrangement = Arrangement.Center,
                    modifier = Modifier.align(Alignment.Center).padding(24.dp)
                ) {
                    Box(
                        contentAlignment = Alignment.Center,
                        modifier = Modifier
                            .size(104.dp)
                            .clip(CircleShape)
                            .background(Color.White.copy(alpha = 0.22f))
                            .border(2.dp, Color.White.copy(alpha = 0.45f), CircleShape)
                    ) {
                        Icon(Icons.Filled.Person, contentDescription = "User Avatar", tint = Color.White, modifier = Modifier.size(56.dp))
                    }
                    Spacer(Modifier.height(14.dp))
                    Text("User", color = Color.White, fontSize = 26.sp, fontWeight = FontWeight.Light)
                    Spacer(Modifier.height(18.dp))
                    Button(
                        onClick = onUnlock,
                        colors = ButtonDefaults.buttonColors(containerColor = accentColor),
                        shape = RoundedCornerShape(4.dp),
                        modifier = Modifier
                            .height(44.dp)
                            .width(150.dp)
                            .testTag("lock_sign_in_button")
                    ) {
                        Text("Sign in", color = Color.White, fontSize = 14.sp, fontWeight = FontWeight.Medium)
                    }
                }
            }
        }
    }
}

@Composable
fun PowerScreenOverlay(
    powerMode: PowerMode?,
    onDone: () -> Unit,
    modifier: Modifier = Modifier
) {
    if (powerMode == null) return

    LaunchedEffect(powerMode) {
        delay(2400)
        onDone()
    }

    Box(
        contentAlignment = Alignment.Center,
        modifier = modifier
            .fillMaxSize()
            .background(Color(0xFF005A9E))
            .testTag("power_screen_overlay")
    ) {
        Column(horizontalAlignment = Alignment.CenterHorizontally) {
            CircularProgressIndicator(
                color = Color.White,
                strokeWidth = 3.dp,
                modifier = Modifier.size(44.dp)
            )
            Spacer(Modifier.height(22.dp))
            Text(
                text = if (powerMode == PowerMode.SHUTDOWN) "Shutting down..." else "Restarting...",
                color = Color.White,
                fontSize = 22.sp,
                fontWeight = FontWeight.Light
            )
        }
    }
}

@Composable
fun BsodOverlay(
    visible: Boolean,
    onDismiss: () -> Unit,
    modifier: Modifier = Modifier
) {
    if (!visible) return
    var percent by remember { mutableIntStateOf(0) }

    LaunchedEffect(Unit) {
        while (percent < 100) {
            delay(180)
            percent = (percent + (4..14).random()).coerceAtMost(100)
        }
    }

    Box(
        modifier = modifier
            .fillMaxSize()
            .background(Color(0xFF0078D7))
            .statusBarsPadding()
            .clickable(onClick = onDismiss)
            .padding(horizontal = 28.dp, vertical = 32.dp)
            .testTag("bsod_overlay")
    ) {
        Column(
            verticalArrangement = Arrangement.Center,
            modifier = Modifier.align(Alignment.CenterStart).fillMaxWidth()
        ) {
            Text(":(", color = Color.White, fontSize = 72.sp, fontWeight = FontWeight.Light)
            Spacer(Modifier.height(14.dp))
            Text(
                text = "Your PC ran into a problem and needs to restart. We're just collecting some error info, and then we'll restart for you.",
                color = Color.White,
                fontSize = 18.sp,
                fontWeight = FontWeight.Light,
                lineHeight = 25.sp
            )
            Spacer(Modifier.height(16.dp))
            Text("$percent% complete", color = Color.White, fontSize = 17.sp, fontWeight = FontWeight.Light)
            Spacer(Modifier.height(26.dp))

            Row(verticalAlignment = Alignment.CenterVertically) {
                // Authentic QR pattern block
                Canvas(
                    modifier = Modifier
                        .size(74.dp)
                        .background(Color.White)
                        .padding(6.dp)
                ) {
                    val cell = size.width / 7f
                    val pattern = listOf(
                        "1110111",
                        "1010101",
                        "1110111",
                        "0001000",
                        "1110101",
                        "1011010",
                        "1110111"
                    )
                    pattern.forEachIndexed { r, row ->
                        row.forEachIndexed { c, ch ->
                            if (ch == '1') {
                                drawRect(
                                    color = Color(0xFF0078D7),
                                    topLeft = Offset(c * cell, r * cell),
                                    size = Size(cell, cell)
                                )
                            }
                        }
                    }
                }
                Spacer(Modifier.width(16.dp))
                Column {
                    Text(
                        "For more information about this issue and possible fixes, visit windows.com/stopcode",
                        color = Color.White.copy(alpha = 0.9f),
                        fontSize = 12.sp
                    )
                    Spacer(Modifier.height(6.dp))
                    Text("Stop code: CRITICAL_PROCESS_DIED", color = Color.White, fontSize = 12.sp, fontWeight = FontWeight.SemiBold)
                    Spacer(Modifier.height(10.dp))
                    Text("Tap anywhere to restart now", color = Color.White.copy(alpha = 0.78f), fontSize = 11.sp)
                }
            }
        }
    }
}
