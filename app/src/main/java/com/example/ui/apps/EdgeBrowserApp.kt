package com.example.ui.apps

import android.annotation.SuppressLint
import android.webkit.WebView
import android.webkit.WebViewClient
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
import androidx.compose.foundation.layout.fillMaxSize
import androidx.compose.foundation.layout.fillMaxWidth
import androidx.compose.foundation.layout.height
import androidx.compose.foundation.layout.padding
import androidx.compose.foundation.layout.size
import androidx.compose.foundation.layout.width
import androidx.compose.foundation.rememberScrollState
import androidx.compose.foundation.shape.RoundedCornerShape
import androidx.compose.foundation.text.BasicTextField
import androidx.compose.foundation.text.KeyboardActions
import androidx.compose.foundation.text.KeyboardOptions
import androidx.compose.foundation.verticalScroll
import androidx.compose.material.icons.Icons
import androidx.compose.material.icons.automirrored.filled.ArrowBack
import androidx.compose.material.icons.automirrored.filled.ArrowForward
import androidx.compose.material.icons.filled.Add
import androidx.compose.material.icons.filled.Close
import androidx.compose.material.icons.filled.Download
import androidx.compose.material.icons.filled.FindInPage
import androidx.compose.material.icons.filled.History
import androidx.compose.material.icons.filled.Home
import androidx.compose.material.icons.filled.Lock
import androidx.compose.material.icons.filled.Public
import androidx.compose.material.icons.filled.Refresh
import androidx.compose.material.icons.filled.Search
import androidx.compose.material.icons.filled.SportsEsports
import androidx.compose.material.icons.filled.Star
import androidx.compose.material3.Button
import androidx.compose.material3.ButtonDefaults
import androidx.compose.material3.CircularProgressIndicator
import androidx.compose.material3.HorizontalDivider
import androidx.compose.material3.Icon
import androidx.compose.material3.Text
import androidx.compose.runtime.Composable
import androidx.compose.runtime.LaunchedEffect
import androidx.compose.runtime.getValue
import androidx.compose.runtime.mutableIntStateOf
import androidx.compose.runtime.mutableStateListOf
import androidx.compose.runtime.mutableStateOf
import androidx.compose.runtime.remember
import androidx.compose.runtime.rememberCoroutineScope
import androidx.compose.runtime.setValue
import androidx.compose.ui.Alignment
import androidx.compose.ui.Modifier
import androidx.compose.ui.draw.clip
import androidx.compose.ui.geometry.Offset
import androidx.compose.ui.geometry.Size
import androidx.compose.ui.graphics.Color
import androidx.compose.ui.graphics.SolidColor
import androidx.compose.ui.platform.testTag
import androidx.compose.ui.text.TextStyle
import androidx.compose.ui.text.font.FontWeight
import androidx.compose.ui.text.input.ImeAction
import androidx.compose.ui.text.style.TextOverflow
import androidx.compose.ui.unit.dp
import androidx.compose.ui.unit.sp
import androidx.compose.ui.viewinterop.AndroidView
import kotlinx.coroutines.Dispatchers
import kotlinx.coroutines.delay
import kotlinx.coroutines.launch
import kotlinx.coroutines.withContext
import org.json.JSONArray
import org.json.JSONObject
import java.net.HttpURLConnection
import java.net.URL
import java.net.URLEncoder
import java.text.SimpleDateFormat
import java.util.Date
import java.util.Locale
import kotlin.random.Random

private data class EdgeTab(
    val id: String,
    val title: String,
    val url: String,
    val isInPrivate: Boolean = false,
    val history: List<String> = listOf(url),
    val historyIdx: Int = 0
)

private data class WikiResult(
    val title: String,
    val extract: String
)

private val OFFLINE_WIKI = mapOf(
    "Windows_10" to WikiResult("Windows 10", "Windows 10 is a major release of Microsoft's Windows NT operating system released on July 29, 2015. It introduced the return of the Start menu with Live Tiles, Microsoft Edge, Action Center, and Aero Snap window management."),
    "Microsoft_Edge" to WikiResult("Microsoft Edge", "Microsoft Edge is a cross-platform web browser created and developed by Microsoft, featuring built-in productivity tools, reader mode, InPrivate browsing, and the classic Edge Surf mini-game."),
    "Apollo_program" to WikiResult("Apollo program", "The Apollo program was the third United States human spaceflight program carried out by NASA, which succeeded in landing the first humans on the Moon in 1969 during the Apollo 11 mission.")
)

@SuppressLint("SetJavaScriptEnabled")
@Composable
fun EdgeBrowserApp(
    initialUrl: String?,
    initialQuery: String?,
    isDarkTheme: Boolean,
    accentColor: Color,
    onUpdateTitle: (String) -> Unit
) {
    val scope = rememberCoroutineScope()
    val startUrl = when {
        !initialUrl.isNullOrBlank() -> initialUrl
        !initialQuery.isNullOrBlank() -> "edge://search?q=${URLEncoder.encode(initialQuery, "UTF-8")}"
        else -> "edge://start"
    }

    val tabs = remember {
        mutableStateListOf(
            EdgeTab("tab-1", "New Tab", startUrl)
        )
    }
    var activeTabId by remember { mutableStateOf("tab-1") }
    val activeTab = tabs.firstOrNull { it.id == activeTabId } ?: tabs.first()
    var addressInput by remember(activeTab.id, activeTab.url) { mutableStateOf(activeTab.url) }
    var showFindBar by remember { mutableStateOf(false) }
    var findText by remember { mutableStateOf("") }
    var readerTheme by remember { mutableIntStateOf(if (isDarkTheme) 2 else 0) } // 0=Light, 1=Sepia, 2=Dark

    val browsingHistory = remember { mutableStateListOf<Pair<String, String>>() }
    var wikiLoading by remember { mutableStateOf(false) }
    var wikiList by remember { mutableStateOf<List<WikiResult>>(emptyList()) }
    var wikiArticle by remember { mutableStateOf<WikiResult?>(null) }

    LaunchedEffect(activeTab.title) {
        onUpdateTitle("${activeTab.title} - Microsoft Edge")
    }

    fun navigateTab(rawInput: String) {
        val trimmed = rawInput.trim()
        if (trimmed.isEmpty()) return
        val targetUrl = when {
            trimmed.startsWith("edge://") || trimmed.startsWith("https://") || trimmed.startsWith("http://") -> trimmed
            trimmed.contains(".") && !trimmed.contains(" ") -> "https://$trimmed"
            else -> "edge://search?q=${URLEncoder.encode(trimmed, "UTF-8")}"
        }
        val title = when {
            targetUrl == "edge://start" -> "New Tab"
            targetUrl == "edge://surf" -> "Let's Surf!"
            targetUrl == "edge://snake" -> "Snake Arcade"
            targetUrl == "edge://history" -> "History"
            targetUrl == "edge://downloads" -> "Downloads"
            targetUrl.startsWith("edge://search?q=") -> "Search: ${trimmed.take(18)}"
            targetUrl.startsWith("edge://wiki/") -> targetUrl.removePrefix("edge://wiki/").replace("_", " ")
            else -> targetUrl.removePrefix("https://").removePrefix("http://").substringBefore("/")
        }
        if (!activeTab.isInPrivate) {
            browsingHistory.add(0, title to targetUrl)
        }
        val idx = tabs.indexOfFirst { it.id == activeTab.id }
        if (idx >= 0) {
            val cur = tabs[idx]
            val nextHist = cur.history.take(cur.historyIdx + 1) + targetUrl
            tabs[idx] = cur.copy(
                title = title,
                url = targetUrl,
                history = nextHist,
                historyIdx = nextHist.lastIndex
            )
        }
        addressInput = targetUrl
    }

    // Fetch Wikipedia summaries/search whenever edge://search or edge://wiki/ is visited
    LaunchedEffect(activeTab.url) {
        val u = activeTab.url
        if (u.startsWith("edge://search?q=")) {
            val q = java.net.URLDecoder.decode(u.removePrefix("edge://search?q="), "UTF-8")
            wikiLoading = true
            wikiArticle = null
            wikiList = fetchWikiSearch(q)
            wikiLoading = false
        } else if (u.startsWith("edge://wiki/")) {
            val slug = u.removePrefix("edge://wiki/")
            wikiLoading = true
            wikiArticle = fetchWikiSummary(slug)
            wikiLoading = false
        }
    }

    val bg = if (isDarkTheme) Color(0xFF1F1F23) else Color.White
    val barBg = if (isDarkTheme) Color(0xFF2B2B30) else Color(0xFFF3F4F6)
    val textColor = if (isDarkTheme) Color.White else Color(0xFF18181B)
    val mutedColor = if (isDarkTheme) Color(0xFFA1A1AA) else Color(0xFF64748B)

    Column(
        modifier = Modifier
            .fillMaxSize()
            .background(bg)
            .testTag("app_edge")
    ) {
        // Tab Strip
        Row(
            verticalAlignment = Alignment.CenterVertically,
            modifier = Modifier
                .fillMaxWidth()
                .background(if (isDarkTheme) Color(0xFF141417) else Color(0xFFE5E7EB))
                .horizontalScroll(rememberScrollState())
                .padding(horizontal = 6.dp, vertical = 4.dp)
        ) {
            tabs.forEach { tab ->
                val selected = tab.id == activeTab.id
                Row(
                    verticalAlignment = Alignment.CenterVertically,
                    modifier = Modifier
                        .width(142.dp)
                        .clip(RoundedCornerShape(topStart = 6.dp, topEnd = 6.dp))
                        .background(
                            when {
                                tab.isInPrivate && selected -> Color(0xFF312E81)
                                selected -> barBg
                                else -> Color.Transparent
                            }
                        )
                        .clickable { activeTabId = tab.id }
                        .padding(horizontal = 8.dp, vertical = 6.dp)
                ) {
                    Icon(
                        if (tab.isInPrivate) Icons.Filled.Lock else Icons.Filled.Public,
                        contentDescription = null,
                        tint = if (tab.isInPrivate) Color(0xFFC4B5FD) else accentColor,
                        modifier = Modifier.size(13.dp)
                    )
                    Spacer(Modifier.width(6.dp))
                    Text(
                        tab.title,
                        color = textColor,
                        fontSize = 11.sp,
                        maxLines = 1,
                        overflow = TextOverflow.Ellipsis,
                        modifier = Modifier.weight(1f)
                    )
                    if (tabs.size > 1) {
                        Icon(
                            Icons.Filled.Close,
                            contentDescription = "Close tab",
                            tint = mutedColor,
                            modifier = Modifier
                                .size(14.dp)
                                .clickable {
                                    val removeIdx = tabs.indexOfFirst { it.id == tab.id }
                                    if (removeIdx >= 0) {
                                        tabs.removeAt(removeIdx)
                                        if (activeTabId == tab.id) {
                                            activeTabId = tabs.last().id
                                        }
                                    }
                                }
                        )
                    }
                }
            }
            Icon(
                Icons.Filled.Add,
                contentDescription = "New tab",
                tint = textColor,
                modifier = Modifier
                    .size(28.dp)
                    .clickable {
                        val id = "tab-${System.currentTimeMillis()}"
                        tabs.add(EdgeTab(id, "New Tab", "edge://start"))
                        activeTabId = id
                    }
                    .padding(4.dp)
            )
            Text(
                "InPrivate",
                color = Color(0xFFC4B5FD),
                fontSize = 10.sp,
                modifier = Modifier
                    .clip(RoundedCornerShape(4.dp))
                    .background(Color(0xFF312E81))
                    .clickable {
                        val id = "tab-${System.currentTimeMillis()}"
                        tabs.add(EdgeTab(id, "InPrivate", "edge://start", isInPrivate = true))
                        activeTabId = id
                    }
                    .padding(horizontal = 6.dp, vertical = 3.dp)
            )
        }

        // Address Bar Row
        Row(
            verticalAlignment = Alignment.CenterVertically,
            horizontalArrangement = Arrangement.spacedBy(4.dp),
            modifier = Modifier
                .fillMaxWidth()
                .background(barBg)
                .padding(horizontal = 8.dp, vertical = 6.dp)
        ) {
            Icon(
                Icons.AutoMirrored.Filled.ArrowBack,
                contentDescription = "Back",
                tint = if (activeTab.historyIdx > 0) textColor else mutedColor.copy(alpha = 0.4f),
                modifier = Modifier
                    .size(26.dp)
                    .clickable(enabled = activeTab.historyIdx > 0) {
                        val idx = tabs.indexOfFirst { it.id == activeTab.id }
                        if (idx >= 0) {
                            val nextH = activeTab.historyIdx - 1
                            tabs[idx] = activeTab.copy(historyIdx = nextH, url = activeTab.history[nextH])
                        }
                    }
                    .padding(3.dp)
            )
            Icon(
                Icons.AutoMirrored.Filled.ArrowForward,
                contentDescription = "Forward",
                tint = if (activeTab.historyIdx < activeTab.history.lastIndex) textColor else mutedColor.copy(alpha = 0.4f),
                modifier = Modifier
                    .size(26.dp)
                    .clickable(enabled = activeTab.historyIdx < activeTab.history.lastIndex) {
                        val idx = tabs.indexOfFirst { it.id == activeTab.id }
                        if (idx >= 0) {
                            val nextH = activeTab.historyIdx + 1
                            tabs[idx] = activeTab.copy(historyIdx = nextH, url = activeTab.history[nextH])
                        }
                    }
                    .padding(3.dp)
            )
            Icon(
                Icons.Filled.Home,
                contentDescription = "Home",
                tint = textColor,
                modifier = Modifier.size(26.dp).clickable { navigateTab("edge://start") }.padding(3.dp)
            )

            // Omnibox
            Row(
                verticalAlignment = Alignment.CenterVertically,
                modifier = Modifier
                    .weight(1f)
                    .clip(RoundedCornerShape(16.dp))
                    .background(if (isDarkTheme) Color(0xFF18181B) else Color.White)
                    .border(1.dp, Color.Gray.copy(alpha = 0.3f), RoundedCornerShape(16.dp))
                    .padding(horizontal = 10.dp, vertical = 6.dp)
            ) {
                BasicTextField(
                    value = addressInput,
                    onValueChange = { addressInput = it },
                    singleLine = true,
                    textStyle = TextStyle(color = textColor, fontSize = 12.sp),
                    cursorBrush = SolidColor(textColor),
                    keyboardOptions = KeyboardOptions(imeAction = ImeAction.Go),
                    keyboardActions = KeyboardActions(onGo = { navigateTab(addressInput) }),
                    modifier = Modifier.weight(1f).testTag("edge_address_bar")
                )
                Icon(
                    Icons.Filled.Refresh,
                    contentDescription = "Go / Refresh",
                    tint = accentColor,
                    modifier = Modifier.size(16.dp).clickable { navigateTab(addressInput) }
                )
            }

            Icon(
                Icons.Filled.FindInPage,
                contentDescription = "Find on page",
                tint = textColor,
                modifier = Modifier.size(26.dp).clickable { showFindBar = !showFindBar }.padding(3.dp)
            )
        }

        // Favorites Bar
        Row(
            horizontalArrangement = Arrangement.spacedBy(10.dp),
            verticalAlignment = Alignment.CenterVertically,
            modifier = Modifier
                .fillMaxWidth()
                .background(barBg)
                .horizontalScroll(rememberScrollState())
                .padding(horizontal = 10.dp, vertical = 4.dp)
        ) {
            FavoriteChip("Start", Icons.Filled.Star, accentColor, textColor) { navigateTab("edge://start") }
            FavoriteChip("Wikipedia", Icons.Filled.Public, Color(0xFF38BDF8), textColor) { navigateTab("edge://wiki/Windows_10") }
            FavoriteChip("Edge Surf", Icons.Filled.SportsEsports, Color(0xFF10B981), textColor) { navigateTab("edge://surf") }
            FavoriteChip("Snake", Icons.Filled.SportsEsports, Color(0xFFF59E0B), textColor) { navigateTab("edge://snake") }
            FavoriteChip("History", Icons.Filled.History, mutedColor, textColor) { navigateTab("edge://history") }
            FavoriteChip("Downloads", Icons.Filled.Download, mutedColor, textColor) { navigateTab("edge://downloads") }
        }
        HorizontalDivider(color = Color.Black.copy(alpha = 0.15f))

        if (showFindBar) {
            Row(
                verticalAlignment = Alignment.CenterVertically,
                modifier = Modifier.fillMaxWidth().background(barBg).padding(horizontal = 10.dp, vertical = 6.dp)
            ) {
                Text("Find:", color = mutedColor, fontSize = 11.sp)
                Spacer(Modifier.width(8.dp))
                BasicTextField(
                    value = findText,
                    onValueChange = { findText = it },
                    singleLine = true,
                    textStyle = TextStyle(color = textColor, fontSize = 12.sp),
                    cursorBrush = SolidColor(textColor),
                    modifier = Modifier.weight(1f).border(1.dp, accentColor, RoundedCornerShape(4.dp)).padding(6.dp)
                )
                Spacer(Modifier.width(8.dp))
                Icon(Icons.Filled.Close, "Close find", tint = textColor, modifier = Modifier.size(18.dp).clickable { showFindBar = false; findText = "" })
            }
        }

        // Page Content
        Box(modifier = Modifier.weight(1f).fillMaxWidth()) {
            when {
                activeTab.url == "edge://start" -> {
                    EdgeStartPage(
                        isInPrivate = activeTab.isInPrivate,
                        isDarkTheme = isDarkTheme,
                        accentColor = accentColor,
                        onNavigate = ::navigateTab
                    )
                }
                activeTab.url == "edge://surf" -> EdgeSurfMiniGame()
                activeTab.url == "edge://snake" -> EdgeSnakeMiniGame()
                activeTab.url == "edge://history" -> {
                    LazyColumn(modifier = Modifier.fillMaxSize().padding(14.dp), verticalArrangement = Arrangement.spacedBy(8.dp)) {
                        item {
                            Text("Browsing History", color = textColor, fontSize = 16.sp, fontWeight = FontWeight.SemiBold)
                        }
                        if (browsingHistory.isEmpty()) {
                            item { Text("No history entries yet.", color = mutedColor, fontSize = 12.sp) }
                        }
                        items(browsingHistory) { (title, url) ->
                            Row(
                                modifier = Modifier
                                    .fillMaxWidth()
                                    .clip(RoundedCornerShape(4.dp))
                                    .background(barBg)
                                    .clickable { navigateTab(url) }
                                    .padding(10.dp)
                            ) {
                                Text(title, color = textColor, fontSize = 12.sp, fontWeight = FontWeight.Medium, modifier = Modifier.weight(1f))
                                Text(url, color = accentColor, fontSize = 11.sp, maxLines = 1, overflow = TextOverflow.Ellipsis)
                            }
                        }
                    }
                }
                activeTab.url == "edge://downloads" -> {
                    Column(modifier = Modifier.fillMaxSize().padding(16.dp), verticalArrangement = Arrangement.spacedBy(8.dp)) {
                        Text("Downloads", color = textColor, fontSize = 16.sp, fontWeight = FontWeight.SemiBold)
                        Text("Windows10_Wallpaper_Pack.zip • Completed (14.2 MB)", color = mutedColor, fontSize = 12.sp)
                        Text("Edge_Offline_Reader.pdf • Completed (2.1 MB)", color = mutedColor, fontSize = 12.sp)
                    }
                }
                activeTab.url.startsWith("edge://search?q=") -> {
                    Column(modifier = Modifier.fillMaxSize().verticalScroll(rememberScrollState()).padding(14.dp), verticalArrangement = Arrangement.spacedBy(10.dp)) {
                        Text("Web Search Results", color = textColor, fontSize = 16.sp, fontWeight = FontWeight.SemiBold)
                        if (wikiLoading) {
                            CircularProgressIndicator(color = accentColor, modifier = Modifier.size(28.dp))
                        } else if (wikiList.isEmpty()) {
                            Text("No articles found. Try searching 'Windows 10' or 'Apollo'.", color = mutedColor, fontSize = 12.sp)
                        } else {
                            wikiList.forEach { res ->
                                Column(
                                    modifier = Modifier
                                        .fillMaxWidth()
                                        .clip(RoundedCornerShape(6.dp))
                                        .background(barBg)
                                        .clickable { navigateTab("edge://wiki/${res.title.replace(" ", "_")}") }
                                        .padding(12.dp)
                                ) {
                                    Text(res.title, color = accentColor, fontSize = 14.sp, fontWeight = FontWeight.SemiBold)
                                    Spacer(Modifier.height(4.dp))
                                    Text(res.extract, color = textColor, fontSize = 12.sp)
                                }
                            }
                        }
                    }
                }
                activeTab.url.startsWith("edge://wiki/") -> {
                    val rBg = when (readerTheme) {
                        0 -> Color.White
                        1 -> Color(0xFFFBF0D9)
                        else -> Color(0xFF18181B)
                    }
                    val rFg = if (readerTheme == 2) Color(0xFFF4F4F5) else Color(0xFF18181B)
                    Column(modifier = Modifier.fillMaxSize().background(rBg).verticalScroll(rememberScrollState()).padding(16.dp)) {
                        Row(horizontalArrangement = Arrangement.spacedBy(8.dp), modifier = Modifier.padding(bottom = 12.dp)) {
                            listOf("Light", "Sepia", "Dark").forEachIndexed { idx, lbl ->
                                Text(
                                    lbl,
                                    color = if (readerTheme == idx) Color.White else rFg,
                                    fontSize = 11.sp,
                                    modifier = Modifier
                                        .clip(RoundedCornerShape(4.dp))
                                        .background(if (readerTheme == idx) accentColor else Color.Gray.copy(alpha = 0.25f))
                                        .clickable { readerTheme = idx }
                                        .padding(horizontal = 8.dp, vertical = 4.dp)
                                )
                            }
                        }
                        if (wikiLoading) {
                            CircularProgressIndicator(color = accentColor, modifier = Modifier.size(28.dp))
                        } else {
                            Text(wikiArticle?.title ?: "Article", color = rFg, fontSize = 20.sp, fontWeight = FontWeight.Bold)
                            Spacer(Modifier.height(10.dp))
                            Text(wikiArticle?.extract ?: "", color = rFg, fontSize = 14.sp, lineHeight = 22.sp)
                        }
                    }
                }
                else -> {
                    AndroidView(
                        factory = { ctx ->
                            WebView(ctx).apply {
                                webViewClient = WebViewClient()
                                settings.javaScriptEnabled = true
                                loadUrl(activeTab.url)
                            }
                        },
                        update = { wv ->
                            if (wv.url != activeTab.url) wv.loadUrl(activeTab.url)
                        },
                        modifier = Modifier.fillMaxSize()
                    )
                }
            }
        }
    }
}

@Composable
private fun FavoriteChip(
    label: String,
    icon: androidx.compose.ui.graphics.vector.ImageVector,
    tint: Color,
    textColor: Color,
    onClick: () -> Unit
) {
    Row(
        verticalAlignment = Alignment.CenterVertically,
        modifier = Modifier
            .clip(RoundedCornerShape(4.dp))
            .clickable(onClick = onClick)
            .padding(horizontal = 6.dp, vertical = 3.dp)
    ) {
        Icon(icon, contentDescription = label, tint = tint, modifier = Modifier.size(13.dp))
        Spacer(Modifier.width(4.dp))
        Text(label, color = textColor, fontSize = 11.sp)
    }
}

@Composable
private fun EdgeStartPage(
    isInPrivate: Boolean,
    isDarkTheme: Boolean,
    accentColor: Color,
    onNavigate: (String) -> Unit
) {
    var query by remember { mutableStateOf("") }
    val bg = if (isInPrivate) Color(0xFF1E1B4B) else if (isDarkTheme) Color(0xFF18181B) else Color(0xFFF8FAFC)
    val textColor = if (isInPrivate || isDarkTheme) Color.White else Color(0xFF18181B)

    Column(
        horizontalAlignment = Alignment.CenterHorizontally,
        verticalArrangement = Arrangement.Center,
        modifier = Modifier.fillMaxSize().background(bg).padding(20.dp)
    ) {
        Text(
            text = if (isInPrivate) "You're browsing InPrivate" else SimpleDateFormat("h:mm a", Locale.getDefault()).format(Date()),
            color = textColor,
            fontSize = if (isInPrivate) 20.sp else 36.sp,
            fontWeight = FontWeight.Light
        )
        Spacer(Modifier.height(14.dp))
        Row(
            verticalAlignment = Alignment.CenterVertically,
            modifier = Modifier
                .fillMaxWidth(0.9f)
                .clip(RoundedCornerShape(22.dp))
                .background(if (isDarkTheme || isInPrivate) Color(0xFF27272A) else Color.White)
                .border(1.dp, Color.Gray.copy(alpha = 0.35f), RoundedCornerShape(22.dp))
                .padding(horizontal = 14.dp, vertical = 10.dp)
        ) {
            Icon(Icons.Filled.Search, null, tint = accentColor, modifier = Modifier.size(18.dp))
            Spacer(Modifier.width(8.dp))
            Box(modifier = Modifier.weight(1f)) {
                if (query.isEmpty()) Text("Search Wikipedia or enter web address", color = Color.Gray, fontSize = 12.sp)
                BasicTextField(
                    value = query,
                    onValueChange = { query = it },
                    singleLine = true,
                    textStyle = TextStyle(color = textColor, fontSize = 13.sp),
                    cursorBrush = SolidColor(textColor),
                    keyboardOptions = KeyboardOptions(imeAction = ImeAction.Search),
                    keyboardActions = KeyboardActions(onSearch = { onNavigate(query) }),
                    modifier = Modifier.fillMaxWidth()
                )
            }
        }
        Spacer(Modifier.height(18.dp))
        Row(horizontalArrangement = Arrangement.spacedBy(10.dp)) {
            listOf(
                "Windows 10" to "edge://wiki/Windows_10",
                "Apollo 11" to "edge://wiki/Apollo_program",
                "Edge Surf" to "edge://surf",
                "Snake" to "edge://snake"
            ).forEach { (title, url) ->
                Text(
                    title,
                    color = Color.White,
                    fontSize = 11.sp,
                    modifier = Modifier
                        .clip(RoundedCornerShape(6.dp))
                        .background(accentColor)
                        .clickable { onNavigate(url) }
                        .padding(horizontal = 12.dp, vertical = 8.dp)
                )
            }
        }
    }
}

@Composable
private fun EdgeSurfMiniGame() {
    var lane by remember { mutableIntStateOf(1) } // 0, 1, 2
    var score by remember { mutableIntStateOf(0) }
    var gameOver by remember { mutableStateOf(false) }
    val obstacles = remember { mutableStateListOf<Pair<Int, Float>>() } // lane, y (0..1)

    LaunchedEffect(gameOver) {
        if (gameOver) return@LaunchedEffect
        var spawnTick = 0
        while (!gameOver) {
            delay(50)
            spawnTick++
            if (spawnTick % 18 == 0) {
                obstacles.add(Random.nextInt(3) to 0f)
            }
            for (i in obstacles.indices.reversed()) {
                val (ol, oy) = obstacles[i]
                val nextY = oy + 0.032f
                if (nextY in 0.78f..0.90f && ol == lane) {
                    gameOver = true
                }
                if (nextY > 1.05f) {
                    obstacles.removeAt(i)
                    score += 10
                } else {
                    obstacles[i] = ol to nextY
                }
            }
        }
    }

    Column(
        horizontalAlignment = Alignment.CenterHorizontally,
        modifier = Modifier.fillMaxSize().background(Color(0xFF0284C7)).padding(10.dp)
    ) {
        Row(horizontalArrangement = Arrangement.SpaceBetween, modifier = Modifier.fillMaxWidth()) {
            Text("Edge Surf 🏄", color = Color.White, fontSize = 15.sp, fontWeight = FontWeight.Bold)
            Text("Score: $score", color = Color.White, fontSize = 14.sp, fontWeight = FontWeight.SemiBold)
        }
        Spacer(Modifier.height(6.dp))
        Box(modifier = Modifier.weight(1f).fillMaxWidth().clip(RoundedCornerShape(8.dp)).background(Color(0xFF0EA5E9))) {
            Canvas(modifier = Modifier.fillMaxSize()) {
                val laneW = size.width / 3f
                obstacles.forEach { (ol, oy) ->
                    drawCircle(Color(0xFFEF4444), radius = 16.dp.toPx(), center = Offset(ol * laneW + laneW / 2f, oy * size.height))
                }
                drawRect(
                    color = Color(0xFFFDE047),
                    topLeft = Offset(lane * laneW + laneW / 2f - 16.dp.toPx(), size.height * 0.80f),
                    size = Size(32.dp.toPx(), 24.dp.toPx())
                )
            }
            if (gameOver) {
                Column(
                    horizontalAlignment = Alignment.CenterHorizontally,
                    modifier = Modifier.align(Alignment.Center).background(Color.Black.copy(alpha = 0.7f), RoundedCornerShape(8.dp)).padding(16.dp)
                ) {
                    Text("Wipeout! Score: $score", color = Color.White, fontSize = 16.sp, fontWeight = FontWeight.Bold)
                    Spacer(Modifier.height(8.dp))
                    Button(
                        onClick = {
                            obstacles.clear(); score = 0; lane = 1; gameOver = false
                        },
                        colors = ButtonDefaults.buttonColors(containerColor = Color(0xFF10B981))
                    ) { Text("Surf Again") }
                }
            }
        }
        Spacer(Modifier.height(8.dp))
        Row(horizontalArrangement = Arrangement.spacedBy(16.dp)) {
            Button(onClick = { lane = (lane - 1).coerceAtLeast(0) }) { Text("◀ Left") }
            Button(onClick = { lane = (lane + 1).coerceAtMost(2) }) { Text("Right ▶") }
        }
    }
}

@Composable
private fun EdgeSnakeMiniGame() {
    val gridSize = 14
    var snake by remember { mutableStateOf(listOf(7 to 7, 6 to 7, 5 to 7)) }
    var dir by remember { mutableStateOf(1 to 0) }
    var food by remember { mutableStateOf(10 to 5) }
    var score by remember { mutableIntStateOf(0) }
    var over by remember { mutableStateOf(false) }

    LaunchedEffect(over) {
        if (over) return@LaunchedEffect
        while (!over) {
            delay(200)
            val head = snake.first()
            val next = (head.first + dir.first) to (head.second + dir.second)
            if (next.first !in 0 until gridSize || next.second !in 0 until gridSize || snake.contains(next)) {
                over = true
            } else {
                val ate = next == food
                snake = if (ate) listOf(next) + snake else listOf(next) + snake.dropLast(1)
                if (ate) {
                    score += 10
                    food = Random.nextInt(gridSize) to Random.nextInt(gridSize)
                }
            }
        }
    }

    Column(
        horizontalAlignment = Alignment.CenterHorizontally,
        modifier = Modifier.fillMaxSize().background(Color(0xFF111827)).padding(10.dp)
    ) {
        Row(horizontalArrangement = Arrangement.SpaceBetween, modifier = Modifier.fillMaxWidth()) {
            Text("Snake Arcade 🐍", color = Color(0xFF4ADE80), fontSize = 15.sp, fontWeight = FontWeight.Bold)
            Text("Score: $score", color = Color.White, fontSize = 14.sp)
        }
        Spacer(Modifier.height(6.dp))
        Box(modifier = Modifier.weight(1f).fillMaxWidth().border(1.dp, Color(0xFF374151))) {
            Canvas(modifier = Modifier.fillMaxSize()) {
                val cw = size.width / gridSize
                val ch = size.height / gridSize
                drawRect(Color(0xFFEF4444), topLeft = Offset(food.first * cw, food.second * ch), size = Size(cw, ch))
                snake.forEachIndexed { idx, (x, y) ->
                    drawRect(
                        color = if (idx == 0) Color(0xFF22C55E) else Color(0xFF4ADE80),
                        topLeft = Offset(x * cw + 1f, y * ch + 1f),
                        size = Size(cw - 2f, ch - 2f)
                    )
                }
            }
            if (over) {
                Column(
                    horizontalAlignment = Alignment.CenterHorizontally,
                    modifier = Modifier.align(Alignment.Center).background(Color.Black.copy(alpha = 0.78f), RoundedCornerShape(8.dp)).padding(16.dp)
                ) {
                    Text("Game Over! Score: $score", color = Color.White, fontSize = 15.sp, fontWeight = FontWeight.Bold)
                    Spacer(Modifier.height(8.dp))
                    Button(onClick = { snake = listOf(7 to 7, 6 to 7, 5 to 7); dir = 1 to 0; score = 0; over = false }) { Text("Play Again") }
                }
            }
        }
        Spacer(Modifier.height(6.dp))
        Row(horizontalArrangement = Arrangement.spacedBy(8.dp)) {
            Button(onClick = { if (dir.first != 1) dir = -1 to 0 }) { Text("◀") }
            Button(onClick = { if (dir.second != 1) dir = 0 to -1 }) { Text("▲") }
            Button(onClick = { if (dir.second != -1) dir = 0 to 1 }) { Text("▼") }
            Button(onClick = { if (dir.first != -1) dir = 1 to 0 }) { Text("▶") }
        }
    }
}

private suspend fun fetchWikiSearch(query: String): List<WikiResult> = withContext(Dispatchers.IO) {
    try {
        val url = URL("https://en.wikipedia.org/w/api.php?action=opensearch&search=${URLEncoder.encode(query, "UTF-8")}&limit=6&format=json")
        val conn = (url.openConnection() as HttpURLConnection).apply {
            connectTimeout = 5000
            readTimeout = 5000
            setRequestProperty("User-Agent", "Win10SimulatorAndroid/1.0")
        }
        val text = conn.inputStream.bufferedReader().readText()
        val arr = JSONArray(text)
        val titles = arr.optJSONArray(1) ?: JSONArray()
        val descs = arr.optJSONArray(2) ?: JSONArray()
        List(titles.length()) { i ->
            WikiResult(
                title = titles.optString(i),
                extract = descs.optString(i).ifBlank { "Tap to read full Wikipedia summary." }
            )
        }.ifEmpty { OFFLINE_WIKI.values.toList() }
    } catch (_: Throwable) {
        OFFLINE_WIKI.values.filter {
            it.title.contains(query, true) || it.extract.contains(query, true)
        }.ifEmpty { OFFLINE_WIKI.values.toList() }
    }
}

private suspend fun fetchWikiSummary(slug: String): WikiResult = withContext(Dispatchers.IO) {
    try {
        val url = URL("https://en.wikipedia.org/api/rest_v1/page/summary/${URLEncoder.encode(slug, "UTF-8")}")
        val conn = (url.openConnection() as HttpURLConnection).apply {
            connectTimeout = 5000
            readTimeout = 5000
            setRequestProperty("User-Agent", "Win10SimulatorAndroid/1.0")
        }
        val json = JSONObject(conn.inputStream.bufferedReader().readText())
        WikiResult(
            title = json.optString("title", slug.replace("_", " ")),
            extract = json.optString("extract", "Summary unavailable.")
        )
    } catch (_: Throwable) {
        OFFLINE_WIKI[slug] ?: WikiResult(
            title = slug.replace("_", " "),
            extract = "Offline Wikipedia fallback active. Connect to the internet to fetch live summaries for \"$slug\"."
        )
    }
}
