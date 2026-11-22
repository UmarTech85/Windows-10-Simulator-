package com.example.ui.apps

import androidx.compose.foundation.ExperimentalFoundationApi
import androidx.compose.foundation.background
import androidx.compose.foundation.border
import androidx.compose.foundation.clickable
import androidx.compose.foundation.combinedClickable
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
import androidx.compose.foundation.shape.RoundedCornerShape
import androidx.compose.foundation.verticalScroll
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
import androidx.compose.ui.graphics.Color
import androidx.compose.ui.platform.testTag
import androidx.compose.ui.text.font.FontFamily
import androidx.compose.ui.text.font.FontWeight
import androidx.compose.ui.unit.dp
import androidx.compose.ui.unit.sp
import com.example.audio.WindowsSoundEngine
import kotlinx.coroutines.delay
import kotlin.random.Random

private enum class MineDifficulty(val label: String, val rows: Int, val cols: Int, val mines: Int) {
    BEGINNER("Beginner", 9, 9, 10),
    INTERMEDIATE("Intermediate", 16, 16, 40),
    EXPERT("Expert", 16, 30, 99)
}

private data class MineCell(
    val isMine: Boolean = false,
    val isRevealed: Boolean = false,
    val isFlagged: Boolean = false,
    val adjacentMines: Int = 0
)

private enum class MineStatus {
    READY, PLAYING, WON, LOST
}

@OptIn(ExperimentalFoundationApi::class)
@Composable
fun MinesweeperApp() {
    var difficulty by remember { mutableStateOf(MineDifficulty.BEGINNER) }
    var grid by remember { mutableStateOf(List(difficulty.rows) { List(difficulty.cols) { MineCell() } }) }
    var status by remember { mutableStateOf(MineStatus.READY) }
    var seconds by remember { mutableIntStateOf(0) }
    var flagMode by remember { mutableStateOf(false) }

    fun resetGame(diff: MineDifficulty = difficulty) {
        difficulty = diff
        grid = List(diff.rows) { List(diff.cols) { MineCell() } }
        status = MineStatus.READY
        seconds = 0
    }

    LaunchedEffect(status) {
        while (status == MineStatus.PLAYING) {
            delay(1000)
            if (seconds < 999) seconds++
        }
    }

    fun placeMinesAndCount(safeR: Int, safeC: Int): List<MutableList<MineCell>> {
        val board = List(difficulty.rows) { MutableList(difficulty.cols) { MineCell() } }
        var placed = 0
        while (placed < difficulty.mines) {
            val r = Random.nextInt(difficulty.rows)
            val c = Random.nextInt(difficulty.cols)
            if ((r != safeR || c != safeC) && !board[r][c].isMine) {
                board[r][c] = board[r][c].copy(isMine = true)
                placed++
            }
        }
        for (r in 0 until difficulty.rows) {
            for (c in 0 until difficulty.cols) {
                if (board[r][c].isMine) continue
                var count = 0
                for (dr in -1..1) for (dc in -1..1) {
                    val nr = r + dr; val nc = c + dc
                    if (nr in 0 until difficulty.rows && nc in 0 until difficulty.cols && board[nr][nc].isMine) count++
                }
                board[r][c] = board[r][c].copy(adjacentMines = count)
            }
        }
        return board
    }

    fun floodReveal(board: List<MutableList<MineCell>>, r: Int, c: Int) {
        val queue = ArrayDeque<Pair<Int, Int>>()
        queue.add(r to c)
        while (queue.isNotEmpty()) {
            val (cr, cc) = queue.removeFirst()
            val cell = board[cr][cc]
            if (cell.isRevealed || cell.isFlagged) continue
            board[cr][cc] = cell.copy(isRevealed = true)
            if (cell.adjacentMines == 0 && !cell.isMine) {
                for (dr in -1..1) for (dc in -1..1) {
                    val nr = cr + dr; val nc = cc + dc
                    if (nr in 0 until difficulty.rows && nc in 0 until difficulty.cols) {
                        if (!board[nr][nc].isRevealed && !board[nr][nc].isFlagged) {
                            queue.add(nr to nc)
                        }
                    }
                }
            }
        }
    }

    fun toggleFlag(r: Int, c: Int) {
        if (status == MineStatus.WON || status == MineStatus.LOST) return
        val cell = grid[r][c]
        if (cell.isRevealed) return
        WindowsSoundEngine.playClick()
        val next = grid.map { it.toMutableList() }
        next[r][c] = cell.copy(isFlagged = !cell.isFlagged)
        grid = next
    }

    fun revealCell(r: Int, c: Int) {
        if (status == MineStatus.WON || status == MineStatus.LOST) return
        if (flagMode) {
            toggleFlag(r, c)
            return
        }
        val board = if (status == MineStatus.READY) {
            status = MineStatus.PLAYING
            placeMinesAndCount(r, c)
        } else {
            grid.map { it.toMutableList() }
        }

        val target = board[r][c]
        if (target.isFlagged || target.isRevealed) return

        if (target.isMine) {
            WindowsSoundEngine.playExplosion()
            for (rr in 0 until difficulty.rows) {
                for (cc in 0 until difficulty.cols) {
                    if (board[rr][cc].isMine) board[rr][cc] = board[rr][cc].copy(isRevealed = true)
                }
            }
            grid = board
            status = MineStatus.LOST
            return
        }

        WindowsSoundEngine.playClick()
        floodReveal(board, r, c)

        val unrevealedSafe = board.sumOf { row -> row.count { !it.isMine && !it.isRevealed } }
        if (unrevealedSafe == 0) {
            WindowsSoundEngine.playWin()
            status = MineStatus.WON
        }
        grid = board
    }

    val flaggedCount = remember(grid) { grid.sumOf { row -> row.count { it.isFlagged } } }
    val minesRemaining = (difficulty.mines - flaggedCount).coerceIn(-99, 999)

    val numColors = mapOf(
        1 to Color(0xFF0000FF),
        2 to Color(0xFF008000),
        3 to Color(0xFFFF0000),
        4 to Color(0xFF000080),
        5 to Color(0xFF800000),
        6 to Color(0xFF008080),
        7 to Color(0xFF000000),
        8 to Color(0xFF808080)
    )

    Column(
        horizontalAlignment = Alignment.CenterHorizontally,
        modifier = Modifier
            .fillMaxSize()
            .background(Color(0xFFC0C0C0))
            .padding(8.dp)
            .testTag("app_minesweeper")
    ) {
        // Difficulty & Flag Mode Bar
        Row(
            horizontalArrangement = Arrangement.spacedBy(6.dp),
            verticalAlignment = Alignment.CenterVertically,
            modifier = Modifier
                .fillMaxWidth()
                .horizontalScroll(rememberScrollState())
                .padding(bottom = 8.dp)
        ) {
            MineDifficulty.entries.forEach { d ->
                val active = difficulty == d
                Text(
                    d.label,
                    color = if (active) Color.White else Color.Black,
                    fontSize = 11.sp,
                    fontWeight = if (active) FontWeight.Bold else FontWeight.Normal,
                    modifier = Modifier
                        .background(if (active) Color(0xFF0078D7) else Color(0xFFDCDCDC), RoundedCornerShape(3.dp))
                        .clickable { resetGame(d) }
                        .padding(horizontal = 8.dp, vertical = 5.dp)
                )
            }
            Spacer(Modifier.weight(1f))
            Text(
                if (flagMode) "🚩 Flag ON" else "⛏ Dig",
                color = Color.Black,
                fontSize = 11.sp,
                fontWeight = FontWeight.SemiBold,
                modifier = Modifier
                    .background(if (flagMode) Color(0xFFFDE047) else Color(0xFFE5E5E5), RoundedCornerShape(3.dp))
                    .border(1.dp, Color(0xFF808080), RoundedCornerShape(3.dp))
                    .clickable { flagMode = !flagMode }
                    .padding(horizontal = 10.dp, vertical = 5.dp)
            )
        }

        // Top Bezel Header: LED Mine Count + Smiley Reset + LED Timer
        Row(
            verticalAlignment = Alignment.CenterVertically,
            horizontalArrangement = Arrangement.SpaceBetween,
            modifier = Modifier
                .fillMaxWidth()
                .background(Color(0xFFC0C0C0))
                .border(2.dp, Color(0xFF808080))
                .padding(horizontal = 12.dp, vertical = 8.dp)
        ) {
            Text(
                text = minesRemaining.toString().padStart(3, '0'),
                color = Color(0xFFFF2222),
                fontFamily = FontFamily.Monospace,
                fontSize = 20.sp,
                fontWeight = FontWeight.Bold,
                modifier = Modifier
                    .background(Color.Black)
                    .padding(horizontal = 8.dp, vertical = 3.dp)
            )
            Box(
                contentAlignment = Alignment.Center,
                modifier = Modifier
                    .size(38.dp)
                    .background(Color(0xFFD4D4D4))
                    .border(2.dp, Color.White)
                    .clickable { resetGame() }
                    .testTag("minesweeper_reset")
            ) {
                val face = when (status) {
                    MineStatus.WON -> "😎"
                    MineStatus.LOST -> "😵"
                    else -> "🙂"
                }
                Text(face, fontSize = 20.sp)
            }
            Text(
                text = seconds.toString().padStart(3, '0'),
                color = Color(0xFFFF2222),
                fontFamily = FontFamily.Monospace,
                fontSize = 20.sp,
                fontWeight = FontWeight.Bold,
                modifier = Modifier
                    .background(Color.Black)
                    .padding(horizontal = 8.dp, vertical = 3.dp)
            )
        }

        Spacer(Modifier.height(8.dp))

        // Scrollable Mine Board
        Box(
            contentAlignment = Alignment.Center,
            modifier = Modifier
                .weight(1f)
                .fillMaxWidth()
                .border(3.dp, Color(0xFF808080))
                .verticalScroll(rememberScrollState())
                .horizontalScroll(rememberScrollState())
                .padding(4.dp)
        ) {
            Column {
                for (r in 0 until difficulty.rows) {
                    Row {
                        for (c in 0 until difficulty.cols) {
                            val cell = grid[r][c]
                            val bg = when {
                                !cell.isRevealed -> Color(0xFFC8C8C8)
                                cell.isMine -> Color(0xFFEF4444)
                                else -> Color(0xFFDFDFDF)
                            }
                            Box(
                                contentAlignment = Alignment.Center,
                                modifier = Modifier
                                    .size(28.dp)
                                    .background(bg)
                                    .border(
                                        width = if (cell.isRevealed) 0.5.dp else 2.dp,
                                        color = if (cell.isRevealed) Color(0xFF9CA3AF) else Color.White
                                    )
                                    .combinedClickable(
                                        onClick = { revealCell(r, c) },
                                        onLongClick = { toggleFlag(r, c) }
                                    )
                            ) {
                                when {
                                    cell.isRevealed && cell.isMine -> Text("💣", fontSize = 13.sp)
                                    cell.isRevealed && cell.adjacentMines > 0 -> Text(
                                        cell.adjacentMines.toString(),
                                        color = numColors[cell.adjacentMines] ?: Color.Black,
                                        fontSize = 13.sp,
                                        fontWeight = FontWeight.ExtraBold
                                    )
                                    !cell.isRevealed && cell.isFlagged -> Text("🚩", fontSize = 12.sp)
                                }
                            }
                        }
                    }
                }
            }
        }
    }
}
