import React, { useState } from 'react';
import { GoogleGeminiIcon } from './GoogleIcons';
import { soundEngine } from '../../../utils/sound';

interface ChatMessage {
  id: string;
  role: 'user' | 'model';
  content: string;
  time: string;
  codeSnippet?: string;
}

const INITIAL_MESSAGES: ChatMessage[] = [
  {
    id: 'msg-0',
    role: 'model',
    content:
      "Hello! I'm Gemini, your AI assistant in Microsoft Edge on Windows 10. How can I help you today? I can answer technical questions about DirectX 12, write code, optimize your simulator system, or draft content.",
    time: '10:00 AM',
  },
];

const PRESET_PROMPTS = [
  'Explain DirectX 12 vs DirectX 11 architectures',
  'Write a Python script for organizing Windows desktop files',
  'How does Microsoft Edge utilize WebGL hardware acceleration?',
  'Give me 5 pro tips for multitasking in Windows 10',
];

interface GoogleGeminiAppProps {
  onNavigate: (view: any, url: string, title: string) => void;
  onOpenAppsWaffle: () => void;
}

export const GoogleGeminiApp: React.FC<GoogleGeminiAppProps> = ({
  onNavigate,
  onOpenAppsWaffle,
}) => {
  const [messages, setMessages] = useState<ChatMessage[]>(INITIAL_MESSAGES);
  const [inputPrompt, setInputPrompt] = useState('');
  const [isGenerating, setIsGenerating] = useState(false);
  const [copiedId, setCopiedId] = useState<string | null>(null);

  const handleSendPrompt = (promptText?: string) => {
    const text = (promptText || inputPrompt).trim();
    if (!text || isGenerating) return;

    soundEngine.playClick();
    const userMsg: ChatMessage = {
      id: `u-${Date.now()}`,
      role: 'user',
      content: text,
      time: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
    };

    setMessages((prev) => [...prev, userMsg]);
    setInputPrompt('');
    setIsGenerating(true);

    // Dynamic smart simulated model response
    setTimeout(() => {
      soundEngine.playDing();
      let responseText = '';
      let codeSnippet: string | undefined = undefined;

      const lower = text.toLowerCase();
      if (lower.includes('directx') || lower.includes('dx12') || lower.includes('dx11')) {
        responseText =
          '**DirectX 12 vs DirectX 11 Overview:**\n\n' +
          '• **Low-Level Hardware Access:** DirectX 12 reduces driver abstraction, allowing games and 3D web engines to talk directly to the GPU command queues.\n' +
          '• **Multi-Threaded Draw Calls:** In DX11, draw-calls were funneled through a single render thread. DX12 distributes draw-call generation across all CPU cores.\n' +
          '• **Ultimate Features:** DirectX 12 Ultimate introduces DirectX Raytracing (DXR tier 1.1), Variable Rate Shading (VRS tier 2), Mesh Shaders, and Sampler Feedback.\n' +
          '• **Result:** Higher average FPS, smoother 1% low frame rates, and lower CPU overhead in high-intensity gaming scenes.';
        codeSnippet =
          '// DirectX 12 Command Queue Submission Example (C++ / HLSL)\n' +
          'ID3D12CommandQueue* pCommandQueue;\n' +
          'ID3D12GraphicsCommandList* pCommandList;\n' +
          'pCommandList->Close();\n' +
          'ID3D12CommandList* ppCommandLists[] = { pCommandList };\n' +
          'pCommandQueue->ExecuteCommandLists(1, ppCommandLists);';
      } else if (lower.includes('python') || lower.includes('script') || lower.includes('code')) {
        responseText =
          "Here is a clean Python automation script to organize your Windows 10 Downloads and Desktop folders by file extension:";
        codeSnippet =
          'import os\n' +
          'import shutil\n' +
          'from pathlib import Path\n\n' +
          'DOWNLOADS_DIR = Path.home() / "Downloads"\n' +
          'EXTENSIONS_MAP = {\n' +
          '    "Images": [".jpg", ".png", ".gif", ".webp"],\n' +
          '    "Documents": [".pdf", ".docx", ".txt", ".xlsx"],\n' +
          '    "Audio": [".mp3", ".wav", ".flac"],\n' +
          '    "Archives": [".zip", ".rar", ".7z"],\n' +
          '}\n\n' +
          'for file in DOWNLOADS_DIR.iterdir():\n' +
          '    if file.is_file():\n' +
          '        for folder, exts in EXTENSIONS_MAP.items():\n' +
          '            if file.suffix.lower() in exts:\n' +
          '                target_dir = DOWNLOADS_DIR / folder\n' +
          '                target_dir.mkdir(exist_ok=True)\n' +
          '                shutil.move(str(file), str(target_dir / file.name))\n' +
          '                print(f"Moved {file.name} to {folder}/")';
      } else if (lower.includes('edge') || lower.includes('browser') || lower.includes('webgl')) {
        responseText =
          '**Microsoft Edge Hardware Acceleration:**\n\n' +
          '• Edge utilizes Chromium\'s ANGLE (Almost Native Graphics Layer Engine) backend to translate WebGL and WebGPU calls directly into native Direct3D 11 or Direct3D 12.\n' +
          '• Video decoding (VP9, AV1, H.264) is offloaded to GPU fixed-function video decoders, reducing battery drain and CPU utilization.\n' +
          '• In this Windows 10 Simulator, Edge runs inside a secure sandboxed execution context with high-speed Web Audio synthesis and offline caching.';
      } else {
        responseText =
          `I analyzed your query: "${text}".\n\n` +
          'Windows 10 combines the agility of desktop multitasking with robust cloud connectivity through Google Services and Microsoft cloud backends. ' +
          'You can use the 9-dot launcher to jump between YouTube, Gmail, and Google Drive seamlessly, or run performance diagnostics anytime.';
      }

      const modelMsg: ChatMessage = {
        id: `m-${Date.now()}`,
        role: 'model',
        content: responseText,
        codeSnippet,
        time: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
      };

      setMessages((prev) => [...prev, modelMsg]);
      setIsGenerating(false);
    }, 700);
  };

  const handleCopyCode = (id: string, code: string) => {
    soundEngine.playClick();
    navigator.clipboard?.writeText(code);
    setCopiedId(id);
    setTimeout(() => setCopiedId(null), 2000);
  };

  return (
    <div className="min-h-full flex flex-col bg-[#131314] text-zinc-100 font-sans select-none">
      {/* 1. Gemini Header */}
      <header className="px-6 py-3 border-b border-zinc-800 flex items-center justify-between bg-[#131314]/90 backdrop-blur-md sticky top-0 z-20">
        <div className="flex items-center gap-3">
          <GoogleGeminiIcon className="w-6 h-6" />
          <span className="font-semibold text-lg tracking-tight bg-gradient-to-r from-blue-400 via-indigo-300 to-rose-400 bg-clip-text text-transparent">
            Gemini
          </span>
          <span className="text-[11px] font-mono px-2 py-0.5 rounded-full bg-blue-950/70 border border-blue-800/60 text-blue-300">
            2.5 Pro
          </span>
        </div>

        <div className="flex items-center gap-3">
          <button
            onClick={onOpenAppsWaffle}
            title="Google apps"
            className="p-2 hover:bg-zinc-800 rounded-full text-zinc-300"
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

      {/* 2. Messages Container */}
      <div className="flex-1 max-w-3xl mx-auto w-full p-4 sm:p-6 overflow-y-auto space-y-6">
        {messages.map((msg) => (
          <div
            key={msg.id}
            className={`flex gap-3 text-xs sm:text-sm leading-relaxed ${
              msg.role === 'user' ? 'justify-end' : 'justify-start'
            }`}
          >
            {msg.role === 'model' && (
              <div className="w-8 h-8 rounded-full bg-zinc-800 border border-zinc-700 flex items-center justify-center shrink-0 shadow-xs">
                <GoogleGeminiIcon className="w-4 h-4" />
              </div>
            )}

            <div
              className={`max-w-[85%] rounded-2xl p-4 shadow-sm ${
                msg.role === 'user'
                  ? 'bg-[#282a2c] text-white rounded-tr-xs'
                  : 'bg-[#1e1f20] text-zinc-200 border border-zinc-800 rounded-tl-xs'
              }`}
            >
              <div className="whitespace-pre-wrap">{msg.content}</div>

              {/* Code Snippet Box */}
              {msg.codeSnippet && (
                <div className="mt-3 bg-[#0d0d0e] rounded-xl border border-zinc-800 overflow-hidden text-xs font-mono">
                  <div className="flex items-center justify-between px-3 py-1.5 bg-zinc-900 border-b border-zinc-800 text-[11px] text-zinc-400">
                    <span>Code Snippet</span>
                    <button
                      onClick={() => handleCopyCode(msg.id, msg.codeSnippet!)}
                      className="hover:text-white flex items-center gap-1 cursor-pointer"
                    >
                      {copiedId === msg.id ? '✓ Copied!' : '📋 Copy'}
                    </button>
                  </div>
                  <pre className="p-3 text-emerald-400 overflow-x-auto">
                    <code>{msg.codeSnippet}</code>
                  </pre>
                </div>
              )}

              <div className="text-[10px] text-zinc-500 mt-2 text-right">
                {msg.time}
              </div>
            </div>

            {msg.role === 'user' && (
              <div className="w-8 h-8 rounded-full bg-blue-600 text-white font-medium flex items-center justify-center text-xs shrink-0">
                W
              </div>
            )}
          </div>
        ))}

        {isGenerating && (
          <div className="flex gap-3 items-center text-xs text-zinc-400">
            <GoogleGeminiIcon className="w-5 h-5 animate-spin" />
            <span>Gemini is thinking...</span>
          </div>
        )}
      </div>

      {/* 3. Preset Chips & Omnibox Prompt Input */}
      <div className="max-w-3xl mx-auto w-full p-4">
        {/* Prompt Suggestions */}
        <div className="flex items-center gap-2 overflow-x-auto pb-3 scrollbar-none">
          {PRESET_PROMPTS.map((p, i) => (
            <button
              key={i}
              onClick={() => handleSendPrompt(p)}
              className="px-3 py-1.5 rounded-full bg-zinc-800/80 hover:bg-zinc-700 text-zinc-300 text-xs whitespace-nowrap transition-colors border border-zinc-700/60"
            >
              ✨ {p}
            </button>
          ))}
        </div>

        {/* Input Bar */}
        <form
          onSubmit={(e) => {
            e.preventDefault();
            handleSendPrompt();
          }}
          className="flex items-center bg-[#1e1f20] border border-zinc-700 rounded-2xl px-4 py-2.5 shadow-xl focus-within:border-blue-500"
        >
          <input
            type="text"
            value={inputPrompt}
            onChange={(e) => setInputPrompt(e.target.value)}
            placeholder="Ask Gemini a question or request code..."
            className="w-full bg-transparent outline-none text-xs sm:text-sm text-white placeholder-zinc-500"
          />
          <button
            type="submit"
            disabled={!inputPrompt.trim() || isGenerating}
            className="p-2 bg-blue-600 hover:bg-blue-500 disabled:opacity-40 text-white rounded-xl transition-colors ml-2"
          >
            ➤
          </button>
        </form>
      </div>
    </div>
  );
};
