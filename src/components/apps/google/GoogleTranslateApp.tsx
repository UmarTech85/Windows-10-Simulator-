import React, { useState } from 'react';
import { GoogleTranslateIcon } from './GoogleIcons';
import { soundEngine } from '../../../utils/sound';

const LANGUAGES = [
  { code: 'en', name: 'English' },
  { code: 'es', name: 'Spanish' },
  { code: 'fr', name: 'French' },
  { code: 'de', name: 'German' },
  { code: 'ja', name: 'Japanese' },
  { code: 'zh', name: 'Chinese (Simplified)' },
  { code: 'ru', name: 'Russian' },
  { code: 'it', name: 'Italian' },
  { code: 'pt', name: 'Portuguese' },
  { code: 'ko', name: 'Korean' },
];

const TRANSLATION_DICTIONARY: Record<string, Record<string, string>> = {
  hello: {
    es: 'Hola',
    fr: 'Bonjour',
    de: 'Hallo',
    ja: 'こんにちは (Konnichiwa)',
    zh: '你好 (Nǐ hǎo)',
    ru: 'Привет (Privet)',
    it: 'Ciao',
    pt: 'Olá',
    ko: '안녕하세요 (Annyeonghaseyo)',
  },
  'windows 10': {
    es: 'Windows 10',
    fr: 'Windows 10',
    de: 'Windows 10',
    ja: 'ウィンドウズ 10',
    zh: '微软视窗 10',
    ru: 'Виндовс 10',
    it: 'Windows 10',
    pt: 'Windows 10',
    ko: '윈도우 10',
  },
  'welcome to microsoft edge': {
    es: 'Bienvenido a Microsoft Edge',
    fr: 'Bienvenue sur Microsoft Edge',
    de: 'Willkommen bei Microsoft Edge',
    ja: 'Microsoft Edge へようこそ',
    zh: '欢迎使用微软 Edge 浏览器',
    ru: 'Добро пожаловать в Microsoft Edge',
    it: 'Benvenuto in Microsoft Edge',
    pt: 'Bem-vindo ao Microsoft Edge',
    ko: 'Microsoft Edge에 오신 것을 환영합니다',
  },
  'google services': {
    es: 'Servicios de Google',
    fr: 'Services Google',
    de: 'Google-Dienste',
    ja: 'Google サービス',
    zh: '谷歌服务',
    ru: 'Сервисы Google',
    it: 'Servizi Google',
    pt: 'Serviços do Google',
    ko: '구글 서비스',
  },
  'how are you': {
    es: '¿Cómo estás?',
    fr: 'Comment vas-tu ?',
    de: 'Wie geht es dir?',
    ja: 'お元気ですか？',
    zh: '你好吗？',
    ru: 'Как дела?',
    it: 'Come stai?',
    pt: 'Como você está?',
    ko: '어떻게 지내세요?',
  },
};

interface GoogleTranslateAppProps {
  onNavigate: (view: any, url: string, title: string) => void;
  onOpenAppsWaffle: () => void;
}

export const GoogleTranslateApp: React.FC<GoogleTranslateAppProps> = ({
  onNavigate,
  onOpenAppsWaffle,
}) => {
  const [sourceLang, setSourceLang] = useState('en');
  const [targetLang, setTargetLang] = useState('es');
  const [sourceText, setSourceText] = useState('Welcome to Microsoft Edge');
  const [copied, setCopied] = useState(false);

  // Translation computation
  const getTranslation = (text: string, target: string) => {
    if (!text.trim()) return '';
    const clean = text.trim().toLowerCase();
    if (TRANSLATION_DICTIONARY[clean] && TRANSLATION_DICTIONARY[clean][target]) {
      return TRANSLATION_DICTIONARY[clean][target];
    }
    // Contextual sentence translation mockup
    if (target === 'es') return `Traducción: ${text} [procesado por Google Translate AI]`;
    if (target === 'fr') return `Traduction: ${text} [traité par Google Translate AI]`;
    if (target === 'de') return `Übersetzung: ${text} [verarbeitet von Google Translate AI]`;
    if (target === 'ja') return `翻訳: ${text} [Google 翻訳エンジン]`;
    if (target === 'zh') return `翻译: ${text} [谷歌翻译引擎]`;
    return `${text} (${LANGUAGES.find((l) => l.code === target)?.name || target})`;
  };

  const translatedText = getTranslation(sourceText, targetLang);

  const handleSwapLanguages = () => {
    soundEngine.playClick();
    const temp = sourceLang;
    setSourceLang(targetLang);
    setTargetLang(temp);
    setSourceText(translatedText);
  };

  const handleSpeak = (text: string) => {
    soundEngine.playClick();
    if (typeof window !== 'undefined' && 'speechSynthesis' in window) {
      window.speechSynthesis.cancel();
      const utterance = new SpeechSynthesisUtterance(text);
      utterance.lang = targetLang;
      window.speechSynthesis.speak(utterance);
    }
  };

  const handleCopy = (text: string) => {
    soundEngine.playClick();
    navigator.clipboard?.writeText(text);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <div className="min-h-full flex flex-col bg-[#f8f9fa] dark:bg-[#1a1a1a] text-zinc-800 dark:text-zinc-200 font-sans select-none">
      {/* 1. Header */}
      <header className="px-6 py-3 border-b border-zinc-200 dark:border-zinc-800 flex items-center justify-between bg-white dark:bg-[#202124]">
        <div className="flex items-center gap-2.5">
          <GoogleTranslateIcon className="w-6 h-6 text-blue-600" />
          <span className="font-semibold text-lg text-zinc-700 dark:text-zinc-200">
            Translate
          </span>
        </div>
        <div className="flex items-center gap-3">
          <button
            onClick={onOpenAppsWaffle}
            title="Google apps"
            className="p-2 hover:bg-zinc-100 dark:hover:bg-zinc-800 rounded-full text-zinc-600 dark:text-zinc-300"
          >
            <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 24 24">
              <circle cx="5" cy="5" r="2" />
              <circle cx="12" cy="5" r="2" />
              <circle cx="19" cy="5" r="2" />
              <circle cx="5" cy="12" r="2" />
              <circle cx="12" cy="12" r="2" />
              <circle cx="19" cy="12" r="2" />
              <circle cx="5" cy="19" r="2" />
              <circle cx="12" cy="19" r="2" />
              <circle cx="19" cy="19" r="2" />
            </svg>
          </button>
          <div className="w-8 h-8 rounded-full bg-blue-600 text-white font-medium flex items-center justify-center text-xs">
            W
          </div>
        </div>
      </header>

      {/* 2. Translation Workspace */}
      <div className="flex-1 max-w-5xl mx-auto w-full p-4 sm:p-8">
        {/* Languages Switcher Bar */}
        <div className="bg-white dark:bg-[#242424] rounded-2xl shadow-sm border border-zinc-200 dark:border-zinc-800 overflow-hidden mb-6">
          <div className="flex items-center justify-between px-4 py-3 border-b border-zinc-200 dark:border-zinc-800 text-xs font-semibold">
            {/* Source Lang Picker */}
            <div className="flex items-center gap-2">
              <select
                value={sourceLang}
                onChange={(e) => setSourceLang(e.target.value)}
                className="bg-transparent outline-none cursor-pointer text-blue-600 dark:text-blue-400 font-bold"
              >
                {LANGUAGES.map((l) => (
                  <option key={l.code} value={l.code} className="text-zinc-900">
                    {l.name}
                  </option>
                ))}
              </select>
            </div>

            {/* Swap Button */}
            <button
              onClick={handleSwapLanguages}
              className="p-2 hover:bg-zinc-100 dark:hover:bg-zinc-700 rounded-full transition-colors"
              title="Swap languages"
            >
              ⇄
            </button>

            {/* Target Lang Picker */}
            <div className="flex items-center gap-2">
              <select
                value={targetLang}
                onChange={(e) => setTargetLang(e.target.value)}
                className="bg-transparent outline-none cursor-pointer text-blue-600 dark:text-blue-400 font-bold"
              >
                {LANGUAGES.map((l) => (
                  <option key={l.code} value={l.code} className="text-zinc-900">
                    {l.name}
                  </option>
                ))}
              </select>
            </div>
          </div>

          {/* Dual Input/Output Pane */}
          <div className="grid grid-cols-1 md:grid-cols-2 divide-y md:divide-y-0 md:divide-x divide-zinc-200 dark:divide-zinc-800 min-h-64">
            {/* Source Box */}
            <div className="p-4 flex flex-col justify-between">
              <textarea
                value={sourceText}
                onChange={(e) => setSourceText(e.target.value)}
                placeholder="Enter text here..."
                rows={6}
                className="w-full bg-transparent outline-none resize-none text-base sm:text-lg text-zinc-900 dark:text-white placeholder-zinc-400"
              />
              <div className="flex items-center justify-between pt-3 border-t border-zinc-100 dark:border-zinc-800 text-xs text-zinc-400">
                <button
                  onClick={() => handleSpeak(sourceText)}
                  className="hover:text-blue-600 p-1"
                  title="Listen"
                >
                  🔊 Listen
                </button>
                <span>{sourceText.length} / 5000</span>
              </div>
            </div>

            {/* Target Translated Box */}
            <div className="p-4 bg-zinc-50/50 dark:bg-[#202124] flex flex-col justify-between">
              <div className="text-base sm:text-lg text-zinc-900 dark:text-white leading-relaxed">
                {translatedText || (
                  <span className="text-zinc-400">Translation</span>
                )}
              </div>
              <div className="flex items-center justify-between pt-3 border-t border-zinc-100 dark:border-zinc-800 text-xs text-zinc-400">
                <div className="flex items-center gap-3">
                  <button
                    onClick={() => handleSpeak(translatedText)}
                    className="hover:text-blue-600 p-1"
                    title="Listen translation"
                  >
                    🔊 Listen
                  </button>
                  <button
                    onClick={() => handleCopy(translatedText)}
                    className="hover:text-blue-600 p-1 flex items-center gap-1"
                  >
                    {copied ? '✓ Copied' : '📋 Copy'}
                  </button>
                </div>
                <span className="text-[10px] text-zinc-400 font-mono">
                  Google Neural MT
                </span>
              </div>
            </div>
          </div>
        </div>

        {/* Quick Sample Phrases */}
        <div className="flex flex-wrap items-center gap-2 text-xs">
          <span className="text-zinc-400 font-medium">Quick Phrases:</span>
          {['Hello', 'Windows 10', 'Welcome to Microsoft Edge', 'Google Services'].map(
            (phrase) => (
              <button
                key={phrase}
                onClick={() => setSourceText(phrase)}
                className="px-3 py-1 rounded-full bg-white dark:bg-zinc-800 border border-zinc-200 dark:border-zinc-700 hover:bg-blue-50 dark:hover:bg-zinc-700 transition-colors"
              >
                "{phrase}"
              </button>
            )
          )}
        </div>
      </div>
    </div>
  );
};
