import React, { useState, useRef, useEffect } from 'react';
import { AppId } from '../../types/os';
import { soundEngine } from '../../utils/sound';

interface CommandPromptProps {
  onLaunchApp?: (appId: AppId) => void;
  onTriggerBSOD?: () => void;
}

interface HistoryItem {
  id: string;
  type: 'cmd' | 'output' | 'matrix';
  text?: string;
  lines?: string[];
  color?: string;
}

export const CommandPrompt: React.FC<CommandPromptProps> = ({
  onLaunchApp,
  onTriggerBSOD,
}) => {
  const [history, setHistory] = useState<HistoryItem[]>([
    {
      id: 'init-1',
      type: 'output',
      lines: [
        'Microsoft Windows [Version 10.0.19045.3803]',
        '(c) Microsoft Corporation. All rights reserved.',
        '',
        "Type 'help' to see available commands or 'matrix' / 'bsod' for fun.",
        '',
      ],
    },
  ]);
  const [currentInput, setCurrentInput] = useState('');
  const [commandHistory, setCommandHistory] = useState<string[]>([]);
  const [historyIndex, setHistoryIndex] = useState<number>(-1);
  const [textColor, setTextColor] = useState<string>('text-zinc-200');
  const [isMatrixActive, setIsMatrixActive] = useState<boolean>(false);

  const bottomRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: 'auto' });
  }, [history, isMatrixActive]);

  const handleCommand = (cmdStr: string) => {
    const trimmed = cmdStr.trim();
    if (!trimmed) {
      setHistory((prev) => [
        ...prev,
        { id: String(Date.now()), type: 'cmd', text: `C:\\Users\\User> ` },
      ]);
      return;
    }

    setCommandHistory((prev) => [trimmed, ...prev]);
    setHistoryIndex(-1);

    const parts = trimmed.split(' ');
    const cmd = parts[0].toLowerCase();
    const args = parts.slice(1);

    const cmdEntry: HistoryItem = {
      id: String(Date.now()),
      type: 'cmd',
      text: `C:\\Users\\User> ${cmdStr}`,
    };

    let outputLines: string[] = [];

    switch (cmd) {
      case 'help':
        outputLines = [
          'For more information on a specific tool, visit the docs.',
          'HELP           Provides Help information for Windows commands.',
          'CLS            Clears the screen.',
          'DIR            Displays a list of files and subdirectories in a directory.',
          'VER            Displays the Windows version.',
          'SYSTEMINFO     Displays machine specific properties and configuration.',
          'IPCONFIG       Displays all current TCP/IP network configuration values.',
          'PING <host>    Ping target server with ICMP echo request packets.',
          'DATE / TIME    Displays the current system date and time.',
          'ECHO <msg>     Displays messages on screen.',
          'COLOR <attr>   Sets default console foreground colors (e.g. 0a, 0c, 0f).',
          'CALC           Starts the Windows Calculator application.',
          'NOTEPAD        Starts the Windows Notepad text editor.',
          'PAINT          Starts the MS Paint canvas editor.',
          'EXPLORER       Opens File Explorer.',
          'MATRIX         Enters the falling digital rain matrix mode.',
          'BSOD           Triggers Blue Screen of Death diagnostic test.',
          'EXIT           Closes the Command Prompt.',
        ];
        break;

      case 'cls':
      case 'clear':
        setHistory([]);
        return;

      case 'ver':
        outputLines = ['Microsoft Windows [Version 10.0.19045.3803]'];
        break;

      case 'systeminfo':
        outputLines = [
          'Host Name:                 DESKTOP-WIN10SIM',
          'OS Name:                   Microsoft Windows 10 Pro',
          'OS Version:                10.0.19045 N/A Build 19045',
          'OS Manufacturer:           Microsoft Corporation',
          'OS Configuration:          Standalone Workstation',
          'OS Build Type:             Multiprocessor Free',
          'Registered Owner:          User',
          'System Manufacturer:       AI Studio Virtual Machine',
          'System Model:              Hyper-Core x64 Simulation',
          'Processor(s):              1 Processor(s) Installed.',
          '                           [01]: Intel64 Family 6 Model 183 Stepping 1 ~3200 Mhz',
          'Total Physical Memory:     32,768 MB',
          'Available Physical Memory: 24,512 MB',
          'Virtual Memory: Max Size:  37,632 MB',
        ];
        break;

      case 'ipconfig':
        outputLines = [
          'Windows IP Configuration',
          '',
          'Wireless LAN adapter Wi-Fi:',
          '   Connection-specific DNS Suffix  . : localdomain',
          '   IPv6 Address. . . . . . . . . . . : fe80::5c41:9a8d:e12f:9812%12',
          '   IPv4 Address. . . . . . . . . . . : 192.168.1.142',
          '   Subnet Mask . . . . . . . . . . . : 255.255.255.0',
          '   Default Gateway . . . . . . . . . : 192.168.1.1',
        ];
        break;

      case 'ping':
        const host = args[0] || '127.0.0.1';
        outputLines = [
          `Pinging ${host} with 32 bytes of data:`,
          `Reply from ${host}: bytes=32 time=12ms TTL=118`,
          `Reply from ${host}: bytes=32 time=10ms TTL=118`,
          `Reply from ${host}: bytes=32 time=14ms TTL=118`,
          `Reply from ${host}: bytes=32 time=11ms TTL=118`,
          '',
          `Ping statistics for ${host}:`,
          '    Packets: Sent = 4, Received = 4, Lost = 0 (0% loss),',
          'Approximate round trip times in milli-seconds:',
          '    Minimum = 10ms, Maximum = 14ms, Average = 11ms',
        ];
        break;

      case 'date':
        outputLines = [`The current date is: ${new Date().toLocaleDateString()}`];
        break;

      case 'time':
        outputLines = [`The current time is: ${new Date().toLocaleTimeString()}`];
        break;

      case 'dir':
        outputLines = [
          ' Volume in drive C has no label.',
          ' Volume Serial Number is 4E21-A90F',
          '',
          ' Directory of C:\\Users\\User',
          '',
          '10/24/2026  09:00 AM    <DIR>          .',
          '10/24/2026  09:00 AM    <DIR>          ..',
          '10/24/2026  09:00 AM    <DIR>          Desktop',
          '10/24/2026  09:00 AM    <DIR>          Documents',
          '10/24/2026  09:00 AM    <DIR>          Downloads',
          '10/24/2026  09:00 AM    <DIR>          Pictures',
          '10/24/2026  09:00 AM    <DIR>          Music',
          '10/24/2026  09:00 AM             1,248 Welcome.txt',
          '               1 File(s)          1,248 bytes',
          '               7 Dir(s)  428,912,482,304 bytes free',
        ];
        break;

      case 'echo':
        outputLines = [args.join(' ')];
        break;

      case 'color':
        const code = (args[0] || '').toLowerCase();
        if (code === '0a') setTextColor('text-green-400');
        else if (code === '0c') setTextColor('text-red-400');
        else if (code === '0b') setTextColor('text-cyan-400');
        else if (code === '0e') setTextColor('text-yellow-300');
        else if (code === '0f') setTextColor('text-white');
        else setTextColor('text-zinc-200');
        outputLines = [`Console color attribute set to '${code}'.`];
        break;

      case 'calc':
        onLaunchApp?.('calc');
        outputLines = ['Launching Calculator...'];
        break;

      case 'notepad':
        onLaunchApp?.('notepad');
        outputLines = ['Launching Notepad...'];
        break;

      case 'paint':
        onLaunchApp?.('paint');
        outputLines = ['Launching MS Paint...'];
        break;

      case 'explorer':
        onLaunchApp?.('explorer');
        outputLines = ['Launching File Explorer...'];
        break;

      case 'bsod':
        soundEngine.playDing();
        onTriggerBSOD?.();
        return;

      case 'matrix':
        setIsMatrixActive(true);
        soundEngine.playNotification();
        setTimeout(() => setIsMatrixActive(false), 8000);
        outputLines = ['Entering the Matrix stream...'];
        break;

      case 'exit':
        outputLines = ['Process terminated. Click window close (X) to exit.'];
        break;

      default:
        outputLines = [
          `'${cmd}' is not recognized as an internal or external command,`,
          'operable program or batch file. Type "help" for a list of commands.',
        ];
        break;
    }

    setHistory((prev) => [
      ...prev,
      cmdEntry,
      {
        id: String(Date.now() + 1),
        type: 'output',
        lines: outputLines,
      },
    ]);
  };

  const handleKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === 'Enter') {
      handleCommand(currentInput);
      setCurrentInput('');
    } else if (e.key === 'ArrowUp') {
      e.preventDefault();
      if (commandHistory.length > 0) {
        const nextIndex = Math.min(historyIndex + 1, commandHistory.length - 1);
        setHistoryIndex(nextIndex);
        setCurrentInput(commandHistory[nextIndex]);
      }
    } else if (e.key === 'ArrowDown') {
      e.preventDefault();
      if (historyIndex > 0) {
        const nextIndex = historyIndex - 1;
        setHistoryIndex(nextIndex);
        setCurrentInput(commandHistory[nextIndex]);
      } else if (historyIndex === 0) {
        setHistoryIndex(-1);
        setCurrentInput('');
      }
    }
  };

  return (
    <div
      className={`flex flex-col h-full bg-black ${textColor} font-mono text-xs p-3 overflow-y-auto select-text cursor-text relative`}
      onClick={() => inputRef.current?.focus()}
    >
      {/* Matrix rain animation overlay */}
      {isMatrixActive && (
        <div className="absolute inset-0 bg-black/90 pointer-events-none flex flex-wrap gap-2 text-green-500 font-mono text-sm overflow-hidden p-4 z-20">
          {Array.from({ length: 40 }).map((_, i) => (
            <div
              key={i}
              className="animate-pulse"
              style={{ animationDelay: `${(i * 120) % 2000}ms` }}
            >
              {Math.random().toString(36).substring(2, 10).toUpperCase()}
            </div>
          ))}
        </div>
      )}

      {history.map((item) => (
        <div key={item.id} className="mb-1 leading-relaxed">
          {item.type === 'cmd' && <div className="font-semibold">{item.text}</div>}
          {item.type === 'output' && (
            <div>
              {item.lines?.map((line, idx) => (
                <div key={idx} className="whitespace-pre-wrap">
                  {line}
                </div>
              ))}
            </div>
          )}
        </div>
      ))}

      {/* Active Input Line */}
      <div className="flex items-center leading-relaxed">
        <span className="font-semibold whitespace-pre">C:\Users\User&gt; </span>
        <input
          ref={inputRef}
          type="text"
          value={currentInput}
          onChange={(e) => setCurrentInput(e.target.value)}
          onKeyDown={handleKeyDown}
          autoFocus
          spellCheck={false}
          className="flex-1 bg-transparent outline-none border-none text-inherit font-mono p-0 m-0"
        />
      </div>

      <div ref={bottomRef} />
    </div>
  );
};
