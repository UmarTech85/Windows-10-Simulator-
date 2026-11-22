package com.example.ui.theme

import androidx.compose.material3.MaterialTheme
import androidx.compose.material3.Typography
import androidx.compose.material3.darkColorScheme
import androidx.compose.material3.lightColorScheme
import androidx.compose.runtime.Composable
import androidx.compose.ui.graphics.Color
import androidx.compose.ui.text.TextStyle
import androidx.compose.ui.text.font.FontFamily
import androidx.compose.ui.text.font.FontWeight
import androidx.compose.ui.unit.sp

val WinBlue = Color(0xFF0078D7)
val WinCyan = Color(0xFF00ADEF)
val WinTaskbarDark = Color(0xD90C0C0C)
val WinSurfaceDark = Color(0xFF1F1F1F)
val WinSurfaceElevated = Color(0xFF2B2B2B)
val WinSurfaceLight = Color(0xFFF3F3F3)

private val WinTypography = Typography(
    headlineMedium = TextStyle(
        fontFamily = FontFamily.SansSerif,
        fontWeight = FontWeight.Light,
        fontSize = 26.sp,
        lineHeight = 32.sp
    ),
    titleMedium = TextStyle(
        fontFamily = FontFamily.SansSerif,
        fontWeight = FontWeight.SemiBold,
        fontSize = 15.sp,
        lineHeight = 20.sp
    ),
    bodyMedium = TextStyle(
        fontFamily = FontFamily.SansSerif,
        fontWeight = FontWeight.Normal,
        fontSize = 13.sp,
        lineHeight = 18.sp
    ),
    labelSmall = TextStyle(
        fontFamily = FontFamily.SansSerif,
        fontWeight = FontWeight.Medium,
        fontSize = 11.sp,
        lineHeight = 14.sp
    )
)

@Composable
fun Win10SimulatorTheme(
    darkTheme: Boolean = true,
    accentColor: Color = WinBlue,
    content: @Composable () -> Unit
) {
    val colorScheme = if (darkTheme) {
        darkColorScheme(
            primary = accentColor,
            onPrimary = Color.White,
            secondary = WinCyan,
            background = Color(0xFF091222),
            surface = WinSurfaceDark,
            surfaceVariant = WinSurfaceElevated,
            onBackground = Color.White,
            onSurface = Color.White
        )
    } else {
        lightColorScheme(
            primary = accentColor,
            onPrimary = Color.White,
            secondary = WinCyan,
            background = WinSurfaceLight,
            surface = Color.White,
            surfaceVariant = Color(0xFFE5E5E5),
            onBackground = Color(0xFF18181B),
            onSurface = Color(0xFF18181B)
        )
    }

    MaterialTheme(
        colorScheme = colorScheme,
        typography = WinTypography,
        content = content
    )
}
