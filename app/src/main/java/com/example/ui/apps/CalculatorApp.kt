package com.example.ui.apps

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
import androidx.compose.foundation.layout.width
import androidx.compose.foundation.rememberScrollState
import androidx.compose.foundation.shape.RoundedCornerShape
import androidx.compose.foundation.verticalScroll
import androidx.compose.material.icons.Icons
import androidx.compose.material.icons.filled.Close
import androidx.compose.material.icons.filled.History
import androidx.compose.material3.Icon
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
import androidx.compose.ui.graphics.Color
import androidx.compose.ui.platform.testTag
import androidx.compose.ui.text.font.FontWeight
import androidx.compose.ui.text.style.TextAlign
import androidx.compose.ui.text.style.TextOverflow
import androidx.compose.ui.unit.dp
import androidx.compose.ui.unit.sp
import com.example.audio.WindowsSoundEngine
import kotlin.math.sqrt

@Composable
fun CalculatorApp(
    isDarkTheme: Boolean,
    accentColor: Color
) {
    var display by remember { mutableStateOf("0") }
    var previousValue by remember { mutableStateOf<Double?>(null) }
    var operation by remember { mutableStateOf<String?>(null) }
    var resetNext by remember { mutableStateOf(false) }
    var equation by remember { mutableStateOf("") }
    var memory by remember { mutableStateOf<Double?>(null) }
    var showHistory by remember { mutableStateOf(false) }
    val history = remember { mutableStateListOf<Pair<String, String>>() }

    fun formatResult(value: Double): String {
        if (value.isNaN() || value.isInfinite()) return "Error"
        val longVal = value.toLong()
        return if (value == longVal.toDouble()) longVal.toString() else "%.8f".format(value).trimEnd('0').trimEnd('.')
    }

    fun calculate(a: Double, b: Double, op: String): Double = when (op) {
        "+" -> a + b
        "-" -> a - b
        "×" -> a * b
        "÷" -> if (b == 0.0) Double.NaN else a / b
        else -> b
    }

    fun handleDigit(d: String) {
        WindowsSoundEngine.playClick()
        if (resetNext || display == "0" || display == "Error") {
            display = d
            resetNext = false
        } else if (display.length < 16) {
            display += d
        }
    }

    fun handleDecimal() {
        WindowsSoundEngine.playClick()
        if (resetNext) {
            display = "0."
            resetNext = false
        } else if (!display.contains(".")) {
            display += "."
        }
    }

    fun handleOperator(op: String) {
        WindowsSoundEngine.playClick()
        val current = display.toDoubleOrNull() ?: return
        if (previousValue == null) {
            previousValue = current
        } else if (operation != null && !resetNext) {
            val res = calculate(previousValue!!, current, operation!!)
            previousValue = res
            display = formatResult(res)
        }
        operation = op
        equation = "${formatResult(previousValue!!)} $op"
        resetNext = true
    }

    fun handleEquals() {
        WindowsSoundEngine.playClick()
        val prev = previousValue ?: return
        val op = operation ?: return
        val curr = display.toDoubleOrNull() ?: return
        val result = calculate(prev, curr, op)
        val resStr = formatResult(result)
        val expr = "${formatResult(prev)} $op ${formatResult(curr)} ="
        history.add(0, expr to resStr)
        if (history.size > 25) history.removeAt(history.lastIndex)
        equation = expr
        display = resStr
        previousValue = null
        operation = null
        resetNext = true
    }

    fun handleUnary(type: String) {
        WindowsSoundEngine.playClick()
        val curr = display.toDoubleOrNull() ?: return
        val res = when (type) {
            "neg" -> -curr
            "sqrt" -> if (curr < 0) Double.NaN else sqrt(curr)
            "sqr" -> curr * curr
            "inv" -> if (curr == 0.0) Double.NaN else 1.0 / curr
            "pct" -> (previousValue ?: 1.0) * (curr / 100.0)
            else -> curr
        }
        display = formatResult(res)
        resetNext = true
    }

    val bg = if (isDarkTheme) Color(0xFF1F1F1F) else Color(0xFFF3F3F3)
    val numBtnBg = if (isDarkTheme) Color(0xFF2B2B2B) else Color.White
    val opBtnBg = if (isDarkTheme) Color(0xFF252525) else Color(0xFFEAEAEA)
    val textColor = if (isDarkTheme) Color.White else Color(0xFF18181B)
    val mutedColor = if (isDarkTheme) Color(0xFFA1A1AA) else Color(0xFF64748B)

    Box(
        modifier = Modifier
            .fillMaxSize()
            .background(bg)
            .testTag("app_calculator")
    ) {
        Column(
            modifier = Modifier
                .fillMaxSize()
                .padding(8.dp)
        ) {
            // Header
            Row(
                verticalAlignment = Alignment.CenterVertically,
                horizontalArrangement = Arrangement.SpaceBetween,
                modifier = Modifier.fillMaxWidth().padding(horizontal = 4.dp)
            ) {
                Text("Standard", color = textColor, fontSize = 15.sp, fontWeight = FontWeight.SemiBold)
                Icon(
                    Icons.Filled.History,
                    contentDescription = "History",
                    tint = textColor,
                    modifier = Modifier
                        .size(32.dp)
                        .clip(RoundedCornerShape(4.dp))
                        .clickable { showHistory = !showHistory }
                        .padding(6.dp)
                )
            }

            // Equation & Display
            Column(
                horizontalAlignment = Alignment.End,
                verticalArrangement = Arrangement.Bottom,
                modifier = Modifier
                    .fillMaxWidth()
                    .padding(horizontal = 8.dp, vertical = 10.dp)
            ) {
                Text(equation, color = mutedColor, fontSize = 12.sp, maxLines = 1, overflow = TextOverflow.Ellipsis)
                Spacer(Modifier.height(4.dp))
                Text(
                    text = display,
                    color = textColor,
                    fontSize = 36.sp,
                    fontWeight = FontWeight.SemiBold,
                    maxLines = 1,
                    overflow = TextOverflow.Ellipsis,
                    modifier = Modifier.testTag("calc_display")
                )
            }

            // Memory Bar
            Row(
                horizontalArrangement = Arrangement.spacedBy(4.dp),
                modifier = Modifier.fillMaxWidth().padding(bottom = 4.dp)
            ) {
                listOf("MC", "MR", "M+", "M-", "MS").forEach { m ->
                    val enabled = m in listOf("M+", "M-", "MS") || memory != null
                    Box(
                        contentAlignment = Alignment.Center,
                        modifier = Modifier
                            .weight(1f)
                            .height(28.dp)
                            .clickable(enabled = enabled) {
                                WindowsSoundEngine.playClick()
                                val curr = display.toDoubleOrNull() ?: 0.0
                                when (m) {
                                    "MC" -> memory = null
                                    "MR" -> memory?.let { display = formatResult(it); resetNext = true }
                                    "M+" -> memory = (memory ?: 0.0) + curr
                                    "M-" -> memory = (memory ?: 0.0) - curr
                                    "MS" -> memory = curr
                                }
                            }
                    ) {
                        Text(m, color = if (enabled) textColor else mutedColor.copy(alpha = 0.4f), fontSize = 11.sp, fontWeight = FontWeight.Medium)
                    }
                }
            }

            // 6 x 4 Button Grid
            val rows = listOf(
                listOf("%", "CE", "C", "⌫"),
                listOf("1/x", "x²", "√x", "÷"),
                listOf("7", "8", "9", "×"),
                listOf("4", "5", "6", "-"),
                listOf("1", "2", "3", "+"),
                listOf("±", "0", ".", "=")
            )

            Column(
                verticalArrangement = Arrangement.spacedBy(4.dp),
                modifier = Modifier.weight(1f).fillMaxWidth()
            ) {
                rows.forEach { row ->
                    Row(
                        horizontalArrangement = Arrangement.spacedBy(4.dp),
                        modifier = Modifier.weight(1f).fillMaxWidth()
                    ) {
                        row.forEach { label ->
                            val isDigit = label in listOf("0", "1", "2", "3", "4", "5", "6", "7", "8", "9", ".", "±")
                            val isEquals = label == "="
                            val btnColor = when {
                                isEquals -> accentColor
                                isDigit -> numBtnBg
                                else -> opBtnBg
                            }
                            val fg = if (isEquals) Color.White else textColor

                            Box(
                                contentAlignment = Alignment.Center,
                                modifier = Modifier
                                    .weight(1f)
                                    .fillMaxHeight()
                                    .clip(RoundedCornerShape(4.dp))
                                    .background(btnColor)
                                    .clickable {
                                        when (label) {
                                            in "0".."9" -> handleDigit(label)
                                            "." -> handleDecimal()
                                            "±" -> handleUnary("neg")
                                            "%" -> handleUnary("pct")
                                            "1/x" -> handleUnary("inv")
                                            "x²" -> handleUnary("sqr")
                                            "√x" -> handleUnary("sqrt")
                                            "CE" -> {
                                                WindowsSoundEngine.playClick()
                                                display = "0"
                                            }
                                            "C" -> {
                                                WindowsSoundEngine.playClick()
                                                display = "0"
                                                previousValue = null
                                                operation = null
                                                equation = ""
                                            }
                                            "⌫" -> {
                                                WindowsSoundEngine.playClick()
                                                display = if (display.length > 1) display.dropLast(1) else "0"
                                            }
                                            "÷", "×", "-", "+" -> handleOperator(label)
                                            "=" -> handleEquals()
                                        }
                                    }
                                    .testTag("calc_btn_$label")
                            ) {
                                Text(
                                    text = label,
                                    color = fg,
                                    fontSize = if (isDigit || isEquals) 16.sp else 13.sp,
                                    fontWeight = if (isDigit || isEquals) FontWeight.SemiBold else FontWeight.Normal,
                                    textAlign = TextAlign.Center
                                )
                            }
                        }
                    }
                }
            }
        }

        // Slide-out History Overlay
        if (showHistory) {
            Column(
                modifier = Modifier
                    .align(Alignment.BottomCenter)
                    .fillMaxWidth()
                    .fillMaxHeight(0.65f)
                    .background(if (isDarkTheme) Color(0xFA18181B) else Color(0xFAFFFFFF))
                    .border(1.dp, Color.White.copy(alpha = 0.12f))
                    .padding(12.dp)
            ) {
                Row(
                    verticalAlignment = Alignment.CenterVertically,
                    horizontalArrangement = Arrangement.SpaceBetween,
                    modifier = Modifier.fillMaxWidth()
                ) {
                    Text("History", color = textColor, fontSize = 14.sp, fontWeight = FontWeight.SemiBold)
                    Row(horizontalArrangement = Arrangement.spacedBy(12.dp), verticalAlignment = Alignment.CenterVertically) {
                        if (history.isNotEmpty()) {
                            Text("Clear", color = accentColor, fontSize = 12.sp, modifier = Modifier.clickable { history.clear() })
                        }
                        Icon(Icons.Filled.Close, "Close history", tint = textColor, modifier = Modifier.size(20.dp).clickable { showHistory = false })
                    }
                }
                Spacer(Modifier.height(8.dp))
                if (history.isEmpty()) {
                    Box(contentAlignment = Alignment.Center, modifier = Modifier.fillMaxSize()) {
                        Text("There's no history yet", color = mutedColor, fontSize = 12.sp)
                    }
                } else {
                    Column(
                        modifier = Modifier.weight(1f).verticalScroll(rememberScrollState()),
                        verticalArrangement = Arrangement.spacedBy(10.dp)
                    ) {
                        history.forEach { (expr, res) ->
                            Column(
                                horizontalAlignment = Alignment.End,
                                modifier = Modifier
                                    .fillMaxWidth()
                                    .clickable {
                                        display = res
                                        showHistory = false
                                    }
                                    .padding(vertical = 4.dp)
                            ) {
                                Text(expr, color = mutedColor, fontSize = 11.sp)
                                Text(res, color = textColor, fontSize = 18.sp, fontWeight = FontWeight.SemiBold)
                            }
                        }
                    }
                }
            }
        }
    }
}
