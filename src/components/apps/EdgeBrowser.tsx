      lower === 'gemini' ||
      lower === 'gemini.google.com' ||
      lower === 'bard.google.com' ||
      lower === 'https://gemini.google.com' ||
      isHttpsUrlForHost(q, 'gemini.google.com')
    ) {
      navigateTo('gemini', 'https://gemini.google.com', 'Google Gemini');
    } else if (
