import React from 'react';

export const GoogleGIcon: React.FC<{ className?: string; size?: number }> = ({
  className = 'w-5 h-5',
  size,
}) => (
  <svg
    viewBox="0 0 24 24"
    className={className}
    width={size}
    height={size}
    aria-label="Google"
  >
    <path
      fill="#4285F4"
      d="M23.745 12.27c0-.7-.06-1.4-.19-2.07H12v4.51h6.6c-.29 1.52-1.14 2.8-2.4 3.65v3.03h3.88c2.27-2.09 3.66-5.17 3.66-9.12z"
    />
    <path
      fill="#34A853"
      d="M12 24c3.24 0 5.95-1.08 7.93-2.91l-3.88-3.03c-1.08.72-2.45 1.16-4.05 1.16-3.12 0-5.77-2.1-6.72-4.93H1.27v3.13C3.25 21.3 7.31 24 12 24z"
    />
    <path
      fill="#FBBC05"
      d="M5.28 14.29c-.25-.72-.38-1.49-.38-2.29s.13-1.57.38-2.29V6.58H1.27C.46 8.2 0 10.05 0 12s.46 3.8 1.27 5.42l4.01-3.13z"
    />
    <path
      fill="#EA4335"
      d="M12 4.75c1.77 0 3.35.61 4.6 1.8l3.42-3.42C17.95 1.19 15.24 0 12 0 7.31 0 3.25 2.7 1.27 6.58l4.01 3.13c.95-2.83 3.6-4.96 6.72-4.96z"
    />
  </svg>
);

export const YouTubeIcon: React.FC<{ className?: string; size?: number }> = ({
  className = 'w-6 h-6',
  size,
}) => (
  <svg
    viewBox="0 0 24 24"
    className={className}
    width={size}
    height={size}
    fill="currentColor"
    aria-label="YouTube"
  >
    <path
      fill="#FF0000"
      d="M23.498 6.186a3.016 3.016 0 0 0-2.122-2.136C19.505 3.545 12 3.545 12 3.545s-7.505 0-9.377.505A3.017 3.017 0 0 0 .502 6.186C0 8.07 0 12 0 12s0 3.93.502 5.814a3.016 3.016 0 0 0 2.122 2.136c1.871.505 9.376.505 9.376.505s7.505 0 9.377-.505a3.015 3.015 0 0 0 2.122-2.136C24 15.93 24 12 24 12s0-3.93-.502-5.814z"
    />
    <path fill="#FFFFFF" d="m9.545 15.568 6.273-3.568-6.273-3.568z" />
  </svg>
);

export const GmailIcon: React.FC<{ className?: string; size?: number }> = ({
  className = 'w-5 h-5',
  size,
}) => (
  <svg
    viewBox="0 0 24 24"
    className={className}
    width={size}
    height={size}
    aria-label="Gmail"
  >
    <path
      fill="#4285F4"
      d="M1.5 5.25v13.5a1.5 1.5 0 0 0 1.5 1.5h2.25V9.75L12 15l6.75-5.25v10.5H21a1.5 1.5 0 0 0 1.5-1.5V5.25a1.5 1.5 0 0 0-2.4-1.2L12 10.2 3.9 4.05a1.5 1.5 0 0 0-2.4 1.2z"
    />
    <path
      fill="#EA4335"
      d="M21.6 4.05 12 11.25 2.4 4.05A1.5 1.5 0 0 1 4.5 3h15a1.5 1.5 0 0 1 2.1 1.05z"
    />
  </svg>
);

export const GoogleDriveIcon: React.FC<{ className?: string; size?: number }> = ({
  className = 'w-5 h-5',
  size,
}) => (
  <svg
    viewBox="0 0 24 24"
    className={className}
    width={size}
    height={size}
    aria-label="Google Drive"
  >
    <path fill="#FFC107" d="M8.2 3.5 15.8 3.5 22.8 15.5 15.2 15.5z" />
    <path fill="#2684FC" d="M15.8 3.5 8.2 3.5 1.2 15.5 8.8 15.5z" />
    <path fill="#00AC47" d="M1.2 15.5 4.8 21.5 19.8 21.5 22.8 15.5z" />
  </svg>
);

export const GoogleMapsIcon: React.FC<{ className?: string; size?: number }> = ({
  className = 'w-5 h-5',
  size,
}) => (
  <svg
    viewBox="0 0 24 24"
    className={className}
    width={size}
    height={size}
    aria-label="Google Maps"
  >
    <path
      fill="#4285F4"
      d="M12 2C8.13 2 5 5.13 5 9c0 5.25 7 13 7 13s7-7.75 7-13c0-3.87-3.13-7-7-7z"
    />
    <circle cx="12" cy="9" r="2.8" fill="#FFFFFF" />
  </svg>
);

export const GoogleGeminiIcon: React.FC<{ className?: string; size?: number }> = ({
  className = 'w-5 h-5',
  size,
}) => (
  <svg
    viewBox="0 0 24 24"
    className={className}
    width={size}
    height={size}
    fill="none"
    aria-label="Gemini"
  >
    <path
      d="M12 2C12 7.52 7.52 12 2 12C7.52 12 12 16.48 12 22C12 16.48 16.48 12 22 12C16.48 12 12 7.52 12 2Z"
      fill="url(#gemini-gradient)"
    />
    <defs>
      <linearGradient
        id="gemini-gradient"
        x1="2"
        y1="2"
        x2="22"
        y2="22"
        gradientUnits="userSpaceOnUse"
      >
        <stop stopColor="#1B73E8" />
        <stop offset="0.5" stopColor="#8AB4F8" />
        <stop offset="1" stopColor="#D93025" />
      </linearGradient>
    </defs>
  </svg>
);

export const GoogleTranslateIcon: React.FC<{ className?: string; size?: number }> = ({
  className = 'w-5 h-5',
  size,
}) => (
  <svg
    viewBox="0 0 24 24"
    className={className}
    width={size}
    height={size}
    fill="currentColor"
    aria-label="Translate"
  >
    <path
      fill="#4285F4"
      d="M12.87 15.07l-2.54-2.51.03-.03c1.74-1.94 2.98-4.17 3.71-6.53H17V4h-7V2H8v2H1v1.99h11.17C11.5 7.92 10.44 9.75 9 11.35 8.07 10.32 7.3 9.19 6.69 8h-2c.73 1.63 1.73 3.17 2.98 4.56l-5.11 5.02L4 19l5-5 3.11 3.11.76-2.04zM18.5 10h-2L12 22h2l1.12-3h4.75L21 22h2l-4.5-12zm-2.62 7l1.62-4.33L19.12 17h-3.24z"
    />
  </svg>
);

export const GoogleKeepIcon: React.FC<{ className?: string; size?: number }> = ({
  className = 'w-5 h-5',
  size,
}) => (
  <svg
    viewBox="0 0 24 24"
    className={className}
    width={size}
    height={size}
    fill="currentColor"
    aria-label="Keep"
  >
    <path
      fill="#FBBC04"
      d="M9 21c0 .55.45 1 1 1h4c.55 0 1-.45 1-1v-1H9v1zm3-19C8.14 2 5 5.14 5 9c0 2.38 1.19 4.47 3 5.74V17c0 .55.45 1 1 1h6c.55 0 1-.45 1-1v-2.26c1.81-1.27 3-3.36 3-5.74 0-3.86-3.14-7-7-7z"
    />
  </svg>
);
