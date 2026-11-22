package com.example.ui.apps

import android.widget.Toast
import androidx.compose.foundation.Image
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
import androidx.compose.foundation.shape.CircleShape
import androidx.compose.foundation.shape.RoundedCornerShape
import androidx.compose.material.icons.Icons
import androidx.compose.material.icons.filled.ChevronLeft
import androidx.compose.material.icons.filled.ChevronRight
import androidx.compose.material.icons.filled.Delete
import androidx.compose.material.icons.filled.RotateRight
import androidx.compose.material.icons.filled.Wallpaper
import androidx.compose.material.icons.filled.ZoomIn
import androidx.compose.material.icons.filled.ZoomOut
import androidx.compose.material3.Icon
import androidx.compose.material3.Text
import androidx.compose.runtime.Composable
import androidx.compose.runtime.LaunchedEffect
import androidx.compose.runtime.getValue
import androidx.compose.runtime.mutableFloatStateOf
import androidx.compose.runtime.mutableIntStateOf
import androidx.compose.runtime.remember
import androidx.compose.runtime.setValue
import androidx.compose.ui.Alignment
import androidx.compose.ui.Modifier
import androidx.compose.ui.draw.clip
import androidx.compose.ui.graphics.Color
import androidx.compose.ui.graphics.graphicsLayer
import androidx.compose.ui.layout.ContentScale
import androidx.compose.ui.platform.LocalContext
import androidx.compose.ui.platform.testTag
import androidx.compose.ui.res.painterResource
import androidx.compose.ui.text.font.FontWeight
import androidx.compose.ui.text.style.TextOverflow
import androidx.compose.ui.unit.dp
import androidx.compose.ui.unit.sp
import coil.compose.AsyncImage
import com.example.model.FileExtension
import com.example.model.FileItem
import java.io.File
import kotlin.math.roundToInt

@Composable
fun PhotosApp(
    files: List<FileItem>,
    initialFileId: String?,
    accentColor: Color,
    onSetWallpaper: (FileItem) -> Unit,
    onDeleteFile: (String) -> Unit,
    onUpdateTitle: (String) -> Unit
) {
    val context = LocalContext.current
    val photos = remember(files) {
        files.filter {
            !it.isRecycled && (it.extension == FileExtension.JPG || it.extension == FileExtension.PNG)
        }
    }

    var currentIndex by remember { mutableIntStateOf(0) }
    var zoom by remember { mutableFloatStateOf(1f) }
    var rotation by remember { mutableFloatStateOf(0f) }

    LaunchedEffect(initialFileId, photos.size) {
        val idx = initialFileId?.let { id -> photos.indexOfFirst { it.id == id } } ?: -1
        if (idx >= 0) currentIndex = idx
    }

    val safeIndex = currentIndex.coerceIn(0, (photos.size - 1).coerceAtLeast(0))
    val currentPhoto = photos.getOrNull(safeIndex)

    LaunchedEffect(currentPhoto?.name) {
        onUpdateTitle(currentPhoto?.let { "${it.name} - Photos" } ?: "Photos")
    }

    Column(
        modifier = Modifier
            .fillMaxSize()
            .background(Color(0xFF141416))
            .testTag("app_photos")
    ) {
        // Top Toolbar
        Row(
            verticalAlignment = Alignment.CenterVertically,
            horizontalArrangement = Arrangement.SpaceBetween,
            modifier = Modifier
                .fillMaxWidth()
                .background(Color(0xFF1E1E22))
                .padding(horizontal = 10.dp, vertical = 6.dp)
        ) {
            Text(
                text = currentPhoto?.name ?: "No photos",
                color = Color.White,
                fontSize = 12.sp,
                fontWeight = FontWeight.Medium,
                maxLines = 1,
                overflow = TextOverflow.Ellipsis,
                modifier = Modifier.weight(1f)
            )
            Row(verticalAlignment = Alignment.CenterVertically, horizontalArrangement = Arrangement.spacedBy(4.dp)) {
                Icon(
                    Icons.Filled.ZoomOut,
                    contentDescription = "Zoom out",
                    tint = Color.White,
                    modifier = Modifier.size(32.dp).clickable { zoom = (zoom - 0.25f).coerceAtLeast(0.5f) }.padding(6.dp)
                )
                Text("${(zoom * 100).roundToInt()}%", color = Color(0xFFA1A1AA), fontSize = 11.sp)
                Icon(
                    Icons.Filled.ZoomIn,
                    contentDescription = "Zoom in",
                    tint = Color.White,
                    modifier = Modifier.size(32.dp).clickable { zoom = (zoom + 0.25f).coerceAtMost(3f) }.padding(6.dp)
                )
                Icon(
                    Icons.Filled.RotateRight,
                    contentDescription = "Rotate 90 degrees",
                    tint = Color.White,
                    modifier = Modifier.size(32.dp).clickable { rotation = (rotation + 90f) % 360f }.padding(6.dp)
                )
                if (currentPhoto != null) {
                    Row(
                        verticalAlignment = Alignment.CenterVertically,
                        modifier = Modifier
                            .clip(RoundedCornerShape(4.dp))
                            .background(accentColor)
                            .clickable {
                                onSetWallpaper(currentPhoto)
                                Toast.makeText(context, "Desktop background updated!", Toast.LENGTH_SHORT).show()
                            }
                            .padding(horizontal = 8.dp, vertical = 5.dp)
                    ) {
                        Icon(Icons.Filled.Wallpaper, "Set as background", tint = Color.White, modifier = Modifier.size(14.dp))
                        Spacer(Modifier.width(4.dp))
                        Text("Wallpaper", color = Color.White, fontSize = 11.sp)
                    }
                    Icon(
                        Icons.Filled.Delete,
                        contentDescription = "Delete photo",
                        tint = Color(0xFFF87171),
                        modifier = Modifier
                            .size(32.dp)
                            .clickable {
                                onDeleteFile(currentPhoto.id)
                                zoom = 1f
                                rotation = 0f
                            }
                            .padding(6.dp)
                    )
                }
            }
        }

        // Main Image Canvas
        Box(
            contentAlignment = Alignment.Center,
            modifier = Modifier
                .weight(1f)
                .fillMaxWidth()
                .padding(12.dp)
        ) {
            if (currentPhoto == null) {
                Text("No images found in Pictures or Desktop.", color = Color(0xFF71717A), fontSize = 13.sp)
            } else {
                val imgModifier = Modifier
                    .fillMaxSize()
                    .graphicsLayer(
                        scaleX = zoom,
                        scaleY = zoom,
                        rotationZ = rotation
                    )

                when {
                    currentPhoto.imageResId != null -> Image(
                        painter = painterResource(currentPhoto.imageResId),
                        contentDescription = currentPhoto.name,
                        contentScale = ContentScale.Fit,
                        modifier = imgModifier
                    )
                    currentPhoto.localFilePath != null -> AsyncImage(
                        model = File(currentPhoto.localFilePath),
                        contentDescription = currentPhoto.name,
                        contentScale = ContentScale.Fit,
                        modifier = imgModifier
                    )
                    currentPhoto.imageUri != null -> AsyncImage(
                        model = currentPhoto.imageUri,
                        contentDescription = currentPhoto.name,
                        contentScale = ContentScale.Fit,
                        modifier = imgModifier
                    )
                    else -> Text("Preview unavailable for ${currentPhoto.name}", color = Color(0xFFA1A1AA), fontSize = 12.sp)
                }

                if (photos.size > 1) {
                    Box(
                        contentAlignment = Alignment.Center,
                        modifier = Modifier
                            .align(Alignment.CenterStart)
                            .size(40.dp)
                            .clip(CircleShape)
                            .background(Color.Black.copy(alpha = 0.55f))
                            .clickable {
                                currentIndex = (safeIndex - 1 + photos.size) % photos.size
                                zoom = 1f; rotation = 0f
                            }
                    ) {
                        Icon(Icons.Filled.ChevronLeft, "Previous photo", tint = Color.White)
                    }
                    Box(
                        contentAlignment = Alignment.Center,
                        modifier = Modifier
                            .align(Alignment.CenterEnd)
                            .size(40.dp)
                            .clip(CircleShape)
                            .background(Color.Black.copy(alpha = 0.55f))
                            .clickable {
                                currentIndex = (safeIndex + 1) % photos.size
                                zoom = 1f; rotation = 0f
                            }
                    ) {
                        Icon(Icons.Filled.ChevronRight, "Next photo", tint = Color.White)
                    }
                }
            }
        }

        // Bottom Thumbnail Strip
        if (photos.isNotEmpty()) {
            Row(
                horizontalArrangement = Arrangement.spacedBy(8.dp),
                verticalAlignment = Alignment.CenterVertically,
                modifier = Modifier
                    .fillMaxWidth()
                    .background(Color(0xFF1E1E22))
                    .horizontalScroll(rememberScrollState())
                    .padding(horizontal = 10.dp, vertical = 8.dp)
            ) {
                photos.forEachIndexed { idx, item ->
                    val selected = idx == safeIndex
                    Box(
                        modifier = Modifier
                            .size(48.dp)
                            .clip(RoundedCornerShape(4.dp))
                            .border(if (selected) 2.dp else 1.dp, if (selected) accentColor else Color.White.copy(alpha = 0.2f), RoundedCornerShape(4.dp))
                            .clickable {
                                currentIndex = idx
                                zoom = 1f; rotation = 0f
                            }
                    ) {
                        when {
                            item.imageResId != null -> Image(
                                painter = painterResource(item.imageResId),
                                contentDescription = item.name,
                                contentScale = ContentScale.Crop,
                                modifier = Modifier.fillMaxSize()
                            )
                            item.localFilePath != null -> AsyncImage(
                                model = File(item.localFilePath),
                                contentDescription = item.name,
                                contentScale = ContentScale.Crop,
                                modifier = Modifier.fillMaxSize()
                            )
                            item.imageUri != null -> AsyncImage(
                                model = item.imageUri,
                                contentDescription = item.name,
                                contentScale = ContentScale.Crop,
                                modifier = Modifier.fillMaxSize()
                            )
                        }
                    }
                }
            }
        }
    }
}
