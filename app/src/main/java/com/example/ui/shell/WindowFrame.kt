package com.example.ui.shell

import androidx.compose.foundation.background
import androidx.compose.foundation.border
import androidx.compose.foundation.clickable
import androidx.compose.foundation.gestures.detectDragGestures
import androidx.compose.foundation.gestures.detectTapGestures
import androidx.compose.foundation.layout.Arrangement
import androidx.compose.foundation.layout.Box
import androidx.compose.foundation.layout.Column
import androidx.compose.foundation.layout.Row
import androidx.compose.foundation.layout.Spacer
import androidx.compose.foundation.layout.fillMaxHeight
import androidx.compose.foundation.layout.fillMaxSize
import androidx.compose.foundation.layout.fillMaxWidth
import androidx.compose.foundation.layout.height
import androidx.compose.foundation.layout.offset
import androidx.compose.foundation.layout.padding
import androidx.compose.foundation.layout.size
import androidx.compose.foundation.layout.width
import androidx.compose.foundation.shape.RoundedCornerShape
import androidx.compose.material.icons.Icons
import androidx.compose.material.icons.filled.Close
import androidx.compose.material.icons.filled.CropSquare
import androidx.compose.material.icons.filled.FilterNone
import androidx.compose.material.icons.filled.Minimize
import androidx.compose.material.icons.filled.OpenInFull
import androidx.compose.material3.Icon
import androidx.compose.material3.Surface
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
import androidx.compose.ui.graphics.Color
import androidx.compose.ui.input.pointer.pointerInput
import androidx.compose.ui.platform.LocalDensity
import androidx.compose.ui.platform.testTag
import androidx.compose.ui.text.font.FontWeight
import androidx.compose.ui.text.style.TextOverflow
import androidx.compose.ui.unit.IntOffset
import androidx.compose.ui.unit.dp
import androidx.compose.ui.unit.sp
import com.example.model.SnapPosition
import com.example.model.WindowState
import com.example.ui.components.WinAppIcon
import kotlin.math.roundToInt

private enum class SnapGhost {
    NONE, LEFT, RIGHT, FULL
}

@Composable
fun WindowFrame(
    window: WindowState,
    isActive: Boolean,
    accentColor: Color,
    isDarkTheme: Boolean,
    areaWidthDp: Float,
    areaHeightDp: Float,
    onFocus: () -> Unit,
    onClose: () -> Unit,
    onMinimize: () -> Unit,
    onToggleMaximize: () -> Unit,
    onUpdateBounds: (xDp: Float, yDp: Float, wDp: Float, hDp: Float, snap: SnapPosition?) -> Unit,
    onSnap: (SnapPosition?) -> Unit,
    content: @Composable () -> Unit
) {
    if (window.isMinimized) return

    val density = LocalDensity.current
    var snapGhost by remember(window.id) { mutableStateOf(SnapGhost.NONE) }
    var dragAccumX by remember(window.id) { mutableStateOf(0f) }
    var dragAccumY by remember(window.id) { mutableStateOf(0f) }

    val effX: Float
    val effY: Float
    val effW: Float
    val effH: Float

    when {
        window.isMaximized -> {
            effX = 0f
            effY = 0f
            effW = areaWidthDp
            effH = areaHeightDp
        }
        window.snappedPosition == SnapPosition.LEFT -> {
            effX = 0f
            effY = 0f
            effW = areaWidthDp / 2f
            effH = areaHeightDp
        }
        window.snappedPosition == SnapPosition.RIGHT -> {
            effX = areaWidthDp / 2f
            effY = 0f
            effW = areaWidthDp / 2f
            effH = areaHeightDp
        }
        else -> {
            effX = window.xDp.coerceIn(0f, (areaWidthDp - 80f).coerceAtLeast(0f))
            effY = window.yDp.coerceIn(0f, (areaHeightDp - 48f).coerceAtLeast(0f))
            effW = window.widthDp.coerceIn(window.minWidthDp.coerceAtMost(areaWidthDp), areaWidthDp)
            effH = window.heightDp.coerceIn(window.minHeightDp.coerceAtMost(areaHeightDp), areaHeightDp)
        }
    }

    // Aero Snap Ghost Preview
    if (snapGhost != SnapGhost.NONE) {
        val (gx, gw, gh) = when (snapGhost) {
            SnapGhost.FULL -> Triple(0f, areaWidthDp, areaHeightDp)
            SnapGhost.LEFT -> Triple(0f, areaWidthDp / 2f, areaHeightDp)
            SnapGhost.RIGHT -> Triple(areaWidthDp / 2f, areaWidthDp / 2f, areaHeightDp)
            SnapGhost.NONE -> Triple(0f, 0f, 0f)
        }
        Box(
            modifier = Modifier
                .offset(x = gx.dp, y = 0.dp)
                .width(gw.dp)
                .height(gh.dp)
                .background(accentColor.copy(alpha = 0.22f))
                .border(2.dp, accentColor)
        )
    }

    val titleBarBg = when {
        isActive && isDarkTheme -> Color(0xFF1F1F1F)
        isActive && !isDarkTheme -> Color.White
        !isActive && isDarkTheme -> Color(0xFF2B2B2B)
        else -> Color(0xFFE5E5E5)
    }
    val titleTextColor = when {
        isActive && isDarkTheme -> Color.White
        isActive && !isDarkTheme -> Color(0xFF18181B)
        !isActive && isDarkTheme -> Color(0xFFA1A1AA)
        else -> Color(0xFF71717A)
    }

    Surface(
        modifier = Modifier
            .offset {
                IntOffset(
                    with(density) { effX.dp.toPx() }.roundToInt(),
                    with(density) { effY.dp.toPx() }.roundToInt()
                )
            }
            .width(effW.dp)
            .height(effH.dp)
            .shadow(if (isActive) 16.dp else 6.dp, RoundedCornerShape(topStart = 6.dp, topEnd = 6.dp))
            .clip(RoundedCornerShape(topStart = 6.dp, topEnd = 6.dp))
            .border(
                width = 1.dp,
                color = if (isActive) Color(0xCC9CA3AF) else Color(0x6671717A),
                shape = RoundedCornerShape(topStart = 6.dp, topEnd = 6.dp)
            )
            .pointerInput(window.id) {
                detectTapGestures(onPress = { onFocus() })
            }
            .testTag("window_${window.appId.name.lowercase()}"),
        color = Color.White
    ) {
        Box(modifier = Modifier.fillMaxSize()) {
            Column(modifier = Modifier.fillMaxSize()) {
                // Active top accent bar
                if (isActive) {
                    Box(
                        modifier = Modifier
                            .fillMaxWidth()
                            .height(2.dp)
                            .background(accentColor)
                    )
                }

                // Title Bar (draggable + double-tap maximize)
                Row(
                    verticalAlignment = Alignment.CenterVertically,
                    horizontalArrangement = Arrangement.SpaceBetween,
                    modifier = Modifier
                        .fillMaxWidth()
                        .height(36.dp)
                        .background(titleBarBg)
                        .pointerInput(window.id, window.isMaximized, window.snappedPosition, areaWidthDp) {
                            detectTapGestures(
                                onTap = { onFocus() },
                                onDoubleTap = { onToggleMaximize() }
                            )
                        }
                        .pointerInput(window.id, window.isMaximized, window.snappedPosition, areaWidthDp) {
                            detectDragGestures(
                                onDragStart = {
                                    onFocus()
                                    dragAccumX = if (window.isMaximized || window.snappedPosition != null) 20f else effX
                                    dragAccumY = if (window.isMaximized || window.snappedPosition != null) 12f else effY
                                },
                                onDrag = { change, dragAmount ->
                                    change.consume()
                                    val dxDp = with(density) { dragAmount.x.toDp().value }
                                    val dyDp = with(density) { dragAmount.y.toDp().value }
                                    dragAccumX += dxDp
                                    dragAccumY = (dragAccumY + dyDp).coerceAtLeast(0f)

                                    val restoredW = window.prevBounds?.widthDp ?: effW.coerceAtMost(areaWidthDp - 24f)
                                    val restoredH = window.prevBounds?.heightDp ?: effH.coerceAtMost(areaHeightDp - 24f)

                                    snapGhost = when {
                                        dragAccumY <= 8f -> SnapGhost.FULL
                                        dragAccumX <= 10f -> SnapGhost.LEFT
                                        dragAccumX + restoredW >= areaWidthDp - 10f -> SnapGhost.RIGHT
                                        else -> SnapGhost.NONE
                                    }

                                    onUpdateBounds(dragAccumX, dragAccumY, restoredW, restoredH, null)
                                },
                                onDragEnd = {
                                    when (snapGhost) {
                                        SnapGhost.FULL -> onSnap(null)
                                        SnapGhost.LEFT -> onSnap(SnapPosition.LEFT)
                                        SnapGhost.RIGHT -> onSnap(SnapPosition.RIGHT)
                                        SnapGhost.NONE -> Unit
                                    }
                                    snapGhost = SnapGhost.NONE
                                },
                                onDragCancel = { snapGhost = SnapGhost.NONE }
                            )
                        }
                        .padding(start = 10.dp)
                ) {
                    Row(
                        verticalAlignment = Alignment.CenterVertically,
                        modifier = Modifier.weight(1f)
                    ) {
                        WinAppIcon(appId = window.appId, size = 18.dp)
                        Spacer(Modifier.width(8.dp))
                        Text(
                            text = window.title,
                            color = titleTextColor,
                            fontSize = 12.sp,
                            fontWeight = FontWeight.Medium,
                            maxLines = 1,
                            overflow = TextOverflow.Ellipsis
                        )
                    }

                    // Window control buttons (44dp width for comfortable touch target)
                    Row(modifier = Modifier.fillMaxHeight()) {
                        Box(
                            contentAlignment = Alignment.Center,
                            modifier = Modifier
                                .width(42.dp)
                                .fillMaxHeight()
                                .clickable { onMinimize() }
                                .testTag("win_min_${window.appId.name.lowercase()}")
                        ) {
                            Icon(
                                Icons.Filled.Minimize,
                                contentDescription = "Minimize",
                                tint = titleTextColor,
                                modifier = Modifier.size(16.dp)
                            )
                        }
                        Box(
                            contentAlignment = Alignment.Center,
                            modifier = Modifier
                                .width(42.dp)
                                .fillMaxHeight()
                                .clickable { onToggleMaximize() }
                                .testTag("win_max_${window.appId.name.lowercase()}")
                        ) {
                            Icon(
                                if (window.isMaximized) Icons.Filled.FilterNone else Icons.Filled.CropSquare,
                                contentDescription = if (window.isMaximized) "Restore" else "Maximize",
                                tint = titleTextColor,
                                modifier = Modifier.size(14.dp)
                            )
                        }
                        Box(
                            contentAlignment = Alignment.Center,
                            modifier = Modifier
                                .width(46.dp)
                                .fillMaxHeight()
                                .background(Color.Transparent)
                                .clickable { onClose() }
                                .testTag("win_close_${window.appId.name.lowercase()}")
                        ) {
                            Icon(
                                Icons.Filled.Close,
                                contentDescription = "Close",
                                tint = Color(0xFFEF4444),
                                modifier = Modifier.size(16.dp)
                            )
                        }
                    }
                }

                // App Content
                Box(
                    modifier = Modifier
                        .weight(1f)
                        .fillMaxWidth()
                ) {
                    content()
                }
            }

            // Bottom-Right Resize Grip (when floating)
            if (!window.isMaximized && window.snappedPosition == null && areaWidthDp > 480f) {
                Box(
                    contentAlignment = Alignment.BottomEnd,
                    modifier = Modifier
                        .align(Alignment.BottomEnd)
                        .size(24.dp)
                        .pointerInput(window.id, effW, effH) {
                            detectDragGestures { change, dragAmount ->
                                change.consume()
                                val dxDp = with(density) { dragAmount.x.toDp().value }
                                val dyDp = with(density) { dragAmount.y.toDp().value }
                                val nextW = (window.widthDp + dxDp).coerceIn(window.minWidthDp, areaWidthDp - effX)
                                val nextH = (window.heightDp + dyDp).coerceIn(window.minHeightDp, areaHeightDp - effY)
                                onUpdateBounds(effX, effY, nextW, nextH, null)
                            }
                        }
                ) {
                    Icon(
                        Icons.Filled.OpenInFull,
                        contentDescription = "Resize window",
                        tint = Color.Gray.copy(alpha = 0.5f),
                        modifier = Modifier
                            .padding(3.dp)
                            .size(12.dp)
                    )
                }
            }
        }
    }
}
