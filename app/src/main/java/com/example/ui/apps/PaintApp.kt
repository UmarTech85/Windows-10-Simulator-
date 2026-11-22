package com.example.ui.apps

import android.graphics.Bitmap
import android.graphics.Paint as AndroidPaint
import android.graphics.Path as AndroidPath
import android.widget.Toast
import androidx.compose.foundation.Canvas
import androidx.compose.foundation.background
import androidx.compose.foundation.border
import androidx.compose.foundation.clickable
import androidx.compose.foundation.gestures.detectDragGestures
import androidx.compose.foundation.gestures.detectTapGestures
import androidx.compose.foundation.horizontalScroll
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
import androidx.compose.foundation.layout.width
import androidx.compose.foundation.rememberScrollState
import androidx.compose.foundation.shape.CircleShape
import androidx.compose.foundation.shape.RoundedCornerShape
import androidx.compose.material.icons.Icons
import androidx.compose.material.icons.automirrored.filled.Undo
import androidx.compose.material.icons.filled.Brush
import androidx.compose.material.icons.filled.CheckBoxOutlineBlank
import androidx.compose.material.icons.filled.CleaningServices
import androidx.compose.material.icons.filled.Colorize
import androidx.compose.material.icons.filled.DeleteSweep
import androidx.compose.material.icons.filled.Edit
import androidx.compose.material.icons.filled.HorizontalRule
import androidx.compose.material.icons.filled.RadioButtonUnchecked
import androidx.compose.material.icons.filled.Save
import androidx.compose.material3.HorizontalDivider
import androidx.compose.material3.Icon
import androidx.compose.material3.Text
import androidx.compose.runtime.Composable
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
import androidx.compose.ui.geometry.Size
import androidx.compose.ui.graphics.Color
import androidx.compose.ui.graphics.Path
import androidx.compose.ui.graphics.StrokeCap
import androidx.compose.ui.graphics.StrokeJoin
import androidx.compose.ui.graphics.drawscope.Stroke
import androidx.compose.ui.graphics.toArgb
import androidx.compose.ui.input.pointer.pointerInput
import androidx.compose.ui.layout.onSizeChanged
import androidx.compose.ui.platform.LocalContext
import androidx.compose.ui.platform.testTag
import androidx.compose.ui.unit.IntSize
import androidx.compose.ui.unit.dp
import androidx.compose.ui.unit.sp
import kotlin.math.abs
import kotlin.math.hypot
import kotlin.math.min

private enum class PaintTool {
    PENCIL, BRUSH, ERASER, EYEDROPPER, LINE, RECT, CIRCLE
}

private data class PaintStroke(
    val tool: PaintTool,
    val color: Color,
    val strokeWidthPx: Float,
    val points: List<Offset>
)

private val PAINT_PALETTE = listOf(
    Color(0xFF000000), Color(0xFF7F7F7F), Color(0xFF880015), Color(0xFFED1C24), Color(0xFFFF7F27),
    Color(0xFFFFF200), Color(0xFF22B14C), Color(0xFF00A2E8), Color(0xFF3F48CC), Color(0xFFA349A4),
    Color(0xFFFFFFFF), Color(0xFFC3C3C3), Color(0xFFB97A57), Color(0xFFFFAEC9), Color(0xFFFFC90E),
    Color(0xFFEFE4B0), Color(0xFFB5E61D), Color(0xFF99D9EA), Color(0xFF7092BE), Color(0xFFC8BFE7)
)

@Composable
fun PaintApp(
    isDarkTheme: Boolean,
    accentColor: Color,
    onSaveArtwork: (Bitmap, onSaved: (String) -> Unit) -> Unit
) {
    val context = LocalContext.current
    var activeTool by remember { mutableStateOf(PaintTool.BRUSH) }
    var activeColor by remember { mutableStateOf(Color.Black) }
    var activeSizePx by remember { mutableFloatStateOf(8f) }
    val strokes = remember { mutableStateListOf<PaintStroke>() }
    var currentPoints by remember { mutableStateOf<List<Offset>>(emptyList()) }
    var canvasSize by remember { mutableStateOf(IntSize(800, 500)) }
    var drawVersion by remember { mutableIntStateOf(0) }

    val toolbarBg = if (isDarkTheme) Color(0xFF27272A) else Color(0xFFF3F4F6)
    val textColor = if (isDarkTheme) Color.White else Color(0xFF18181B)

    fun exportBitmap(): Bitmap {
        val w = 800
        val h = 500
        val bmp = Bitmap.createBitmap(w, h, Bitmap.Config.ARGB_8888)
        val c = android.graphics.Canvas(bmp)
        c.drawColor(android.graphics.Color.WHITE)

        val sx = if (canvasSize.width > 0) w.toFloat() / canvasSize.width else 1f
        val sy = if (canvasSize.height > 0) h.toFloat() / canvasSize.height else 1f

        val p = AndroidPaint().apply {
            isAntiAlias = true
            style = AndroidPaint.Style.STROKE
            strokeCap = AndroidPaint.Cap.ROUND
            strokeJoin = AndroidPaint.Join.ROUND
        }

        strokes.forEach { st ->
            p.color = if (st.tool == PaintTool.ERASER) android.graphics.Color.WHITE else st.color.toArgb()
            p.strokeWidth = (if (st.tool == PaintTool.PENCIL) 2.5f else st.strokeWidthPx) * ((sx + sy) / 2f)
            val pts = st.points
            if (pts.isEmpty()) return@forEach
            when (st.tool) {
                PaintTool.PENCIL, PaintTool.BRUSH, PaintTool.ERASER -> {
                    val path = AndroidPath()
                    path.moveTo(pts.first().x * sx, pts.first().y * sy)
                    for (i in 1 until pts.size) path.lineTo(pts[i].x * sx, pts[i].y * sy)
                    c.drawPath(path, p)
                }
                PaintTool.LINE -> if (pts.size >= 2) {
                    c.drawLine(pts.first().x * sx, pts.first().y * sy, pts.last().x * sx, pts.last().y * sy, p)
                }
                PaintTool.RECT -> if (pts.size >= 2) {
                    val a = pts.first(); val b = pts.last()
                    c.drawRect(min(a.x, b.x) * sx, min(a.y, b.y) * sy, maxOf(a.x, b.x) * sx, maxOf(a.y, b.y) * sy, p)
                }
                PaintTool.CIRCLE -> if (pts.size >= 2) {
                    val a = pts.first(); val b = pts.last()
                    val r = hypot((b.x - a.x) * sx, (b.y - a.y) * sy)
                    c.drawCircle(a.x * sx, a.y * sy, r, p)
                }
                PaintTool.EYEDROPPER -> Unit
            }
        }
        return bmp
    }

    Column(
        modifier = Modifier
            .fillMaxSize()
            .background(toolbarBg)
            .testTag("app_paint")
    ) {
        // Tools & Actions Ribbon
        Row(
            verticalAlignment = Alignment.CenterVertically,
            horizontalArrangement = Arrangement.spacedBy(4.dp),
            modifier = Modifier
                .fillMaxWidth()
                .horizontalScroll(rememberScrollState())
                .padding(horizontal = 8.dp, vertical = 6.dp)
        ) {
            listOf(
                Triple(PaintTool.PENCIL, Icons.Filled.Edit, "Pencil"),
                Triple(PaintTool.BRUSH, Icons.Filled.Brush, "Brush"),
                Triple(PaintTool.ERASER, Icons.Filled.CleaningServices, "Eraser"),
                Triple(PaintTool.EYEDROPPER, Icons.Filled.Colorize, "Picker"),
                Triple(PaintTool.LINE, Icons.Filled.HorizontalRule, "Line"),
                Triple(PaintTool.RECT, Icons.Filled.CheckBoxOutlineBlank, "Rect"),
                Triple(PaintTool.CIRCLE, Icons.Filled.RadioButtonUnchecked, "Circle")
            ).forEach { (tool, icon, label) ->
                val selected = activeTool == tool
                Box(
                    contentAlignment = Alignment.Center,
                    modifier = Modifier
                        .size(34.dp)
                        .clip(RoundedCornerShape(4.dp))
                        .background(if (selected) accentColor else Color.Transparent)
                        .clickable { activeTool = tool }
                ) {
                    Icon(icon, contentDescription = label, tint = if (selected) Color.White else textColor, modifier = Modifier.size(18.dp))
                }
            }

            Spacer(Modifier.width(6.dp))
            listOf(3f to 4.dp, 8f to 7.dp, 14f to 10.dp, 22f to 13.dp).forEach { (px, dotDp) ->
                val selected = activeSizePx == px
                Box(
                    contentAlignment = Alignment.Center,
                    modifier = Modifier
                        .size(28.dp)
                        .clip(RoundedCornerShape(4.dp))
                        .background(if (selected) accentColor.copy(alpha = 0.25f) else Color.Transparent)
                        .clickable { activeSizePx = px }
                ) {
                    Box(modifier = Modifier.size(dotDp).clip(CircleShape).background(textColor))
                }
            }

            Spacer(Modifier.width(6.dp))
            Box(
                contentAlignment = Alignment.Center,
                modifier = Modifier
                    .size(34.dp)
                    .clip(RoundedCornerShape(4.dp))
                    .clickable { if (strokes.isNotEmpty()) strokes.removeAt(strokes.lastIndex) }
            ) {
                Icon(Icons.AutoMirrored.Filled.Undo, "Undo", tint = textColor, modifier = Modifier.size(18.dp))
            }
            Box(
                contentAlignment = Alignment.Center,
                modifier = Modifier
                    .size(34.dp)
                    .clip(RoundedCornerShape(4.dp))
                    .clickable { strokes.clear() }
            ) {
                Icon(Icons.Filled.DeleteSweep, "Clear canvas", tint = textColor, modifier = Modifier.size(18.dp))
            }
            Row(
                verticalAlignment = Alignment.CenterVertically,
                modifier = Modifier
                    .clip(RoundedCornerShape(4.dp))
                    .background(accentColor)
                    .clickable {
                        onSaveArtwork(exportBitmap()) { filename ->
                            Toast.makeText(context, "Saved $filename to Pictures", Toast.LENGTH_SHORT).show()
                        }
                    }
                    .padding(horizontal = 10.dp, vertical = 6.dp)
                    .testTag("paint_save_button")
            ) {
                Icon(Icons.Filled.Save, "Save", tint = Color.White, modifier = Modifier.size(15.dp))
                Spacer(Modifier.width(4.dp))
                Text("Save", color = Color.White, fontSize = 11.sp)
            }
        }

        // Color Palette Strip
        Row(
            verticalAlignment = Alignment.CenterVertically,
            horizontalArrangement = Arrangement.spacedBy(4.dp),
            modifier = Modifier
                .fillMaxWidth()
                .horizontalScroll(rememberScrollState())
                .padding(horizontal = 8.dp, vertical = 4.dp)
        ) {
            Box(
                modifier = Modifier
                    .size(24.dp)
                    .clip(RoundedCornerShape(4.dp))
                    .background(activeColor)
                    .border(2.dp, Color.White, RoundedCornerShape(4.dp))
            )
            Spacer(Modifier.width(6.dp))
            PAINT_PALETTE.forEach { col ->
                val selected = activeColor == col
                Box(
                    modifier = Modifier
                        .size(22.dp)
                        .clip(RoundedCornerShape(3.dp))
                        .background(col)
                        .border(if (selected) 2.dp else 1.dp, if (selected) accentColor else Color.Gray, RoundedCornerShape(3.dp))
                        .clickable { activeColor = col }
                )
            }
        }
        HorizontalDivider(color = Color.Black.copy(alpha = 0.2f))

        // White Drawing Canvas
        Box(
            modifier = Modifier
                .weight(1f)
                .fillMaxWidth()
                .padding(8.dp)
                .background(Color.White)
                .border(1.dp, Color(0xFFD4D4D8))
                .onSizeChanged { canvasSize = it }
        ) {
            Canvas(
                modifier = Modifier
                    .fillMaxSize()
                    .pointerInput(activeTool, activeColor, activeSizePx) {
                        detectTapGestures { pos ->
                            if (activeTool == PaintTool.EYEDROPPER) {
                                val hit = strokes.lastOrNull { st ->
                                    st.tool != PaintTool.ERASER && st.points.any { hypot(it.x - pos.x, it.y - pos.y) < 24f }
                                }
                                activeColor = hit?.color ?: Color.White
                                activeTool = PaintTool.BRUSH
                            } else {
                                strokes.add(PaintStroke(activeTool, activeColor, activeSizePx, listOf(pos, pos)))
                                drawVersion++
                            }
                        }
                    }
                    .pointerInput(activeTool, activeColor, activeSizePx) {
                        detectDragGestures(
                            onDragStart = { start ->
                                currentPoints = listOf(start)
                            },
                            onDrag = { change, _ ->
                                change.consume()
                                val pt = change.position
                                currentPoints = if (activeTool in listOf(PaintTool.LINE, PaintTool.RECT, PaintTool.CIRCLE)) {
                                    listOf(currentPoints.first(), pt)
                                } else {
                                    currentPoints + pt
                                }
                            },
                            onDragEnd = {
                                if (currentPoints.isNotEmpty() && activeTool != PaintTool.EYEDROPPER) {
                                    strokes.add(PaintStroke(activeTool, activeColor, activeSizePx, currentPoints))
                                }
                                currentPoints = emptyList()
                                drawVersion++
                            },
                            onDragCancel = { currentPoints = emptyList() }
                        )
                    }
            ) {
                val _ignored = drawVersion
                val all = if (currentPoints.isNotEmpty()) {
                    strokes + PaintStroke(activeTool, activeColor, activeSizePx, currentPoints)
                } else strokes

                all.forEach { st ->
                    val drawColor = if (st.tool == PaintTool.ERASER) Color.White else st.color
                    val strokeW = if (st.tool == PaintTool.PENCIL) 3f else st.strokeWidthPx
                    val pts = st.points
                    if (pts.isEmpty()) return@forEach

                    when (st.tool) {
                        PaintTool.PENCIL, PaintTool.BRUSH, PaintTool.ERASER -> {
                            if (pts.size == 1) {
                                drawCircle(drawColor, radius = strokeW / 2f, center = pts.first())
                            } else {
                                val path = Path().apply {
                                    moveTo(pts.first().x, pts.first().y)
                                    for (i in 1 until pts.size) lineTo(pts[i].x, pts[i].y)
                                }
                                drawPath(
                                    path = path,
                                    color = drawColor,
                                    style = Stroke(width = strokeW, cap = StrokeCap.Round, join = StrokeJoin.Round)
                                )
                            }
                        }
                        PaintTool.LINE -> if (pts.size >= 2) {
                            drawLine(drawColor, pts.first(), pts.last(), strokeWidth = strokeW, cap = StrokeCap.Round)
                        }
                        PaintTool.RECT -> if (pts.size >= 2) {
                            val a = pts.first(); val b = pts.last()
                            drawRect(
                                color = drawColor,
                                topLeft = Offset(min(a.x, b.x), min(a.y, b.y)),
                                size = Size(abs(b.x - a.x), abs(b.y - a.y)),
                                style = Stroke(width = strokeW)
                            )
                        }
                        PaintTool.CIRCLE -> if (pts.size >= 2) {
                            val a = pts.first(); val b = pts.last()
                            val r = hypot(b.x - a.x, b.y - a.y)
                            drawCircle(color = drawColor, radius = r, center = a, style = Stroke(width = strokeW))
                        }
                        PaintTool.EYEDROPPER -> Unit
                    }
                }
            }
        }
    }
}
