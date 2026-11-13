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

const SHELL_ENV_DEFAULTS: Record<string, string> = {
  USER: 'User',
  HOME: 'C:\\Users\\User',
  PWD: 'C:\\Users\\User',
  PATH: 'C:\\Windows\\System32',
  SHELL: 'cmd.exe',
};

const tokenizeCommand = (input: string): string[] => {
  const tokens: string[] = [];
  let current = '';
  let quoteChar: string | null = null;

  for (let i = 0; i < input.length; i += 1) {
    const char = input[i];
    const prev = input[i - 1];

    if ((char === '"' || char === "'") && prev !== '\\') {
      if (quoteChar === char) {
        quoteChar = null;
      } else if (!quoteChar) {
        quoteChar = char;
      } else {
        current += char;
      }
      continue;
    }

    if (/\s/.test(char) && !quoteChar) {
      if (current.trim()) {
        tokens.push(current.trim());
        current = '';
      }
      continue;
    }

    current += char;
  }

  if (current.trim()) {
    tokens.push(current.trim());
  }

  return tokens;
};

const splitCommandChain = (input: string): string[] => {
  const parts: string[] = [];
  let current = '';
  let quoteChar: string | null = null;

  for (let i = 0; i < input.length; i += 1) {
    const char = input[i];
    const next = input[i + 1];
    const prev = input[i - 1];

    if ((char === '"' || char === "'") && prev !== '\\') {
      if (quoteChar === char) {
        quoteChar = null;
      } else if (!quoteChar) {
        quoteChar = char;
      }
      current += char;
      continue;
    }

    if (!quoteChar && (char === '&' || char === '|')) {
      if (next === char) {
        if (current.trim()) {
          parts.push(current.trim());
          current = '';
        }
        parts.push(`${char}${char}`);
        i += 1;
        continue;
      }
    }

    if (!quoteChar && char === ';') {
      if (current.trim()) {
        parts.push(current.trim());
        current = '';
      }
      parts.push(';');
      continue;
    }

    if (!quoteChar && /\s/.test(char) && (next === '&' || next === '|')) {
      if (current.trim()) {
        parts.push(current.trim());
        current = '';
      }
      continue;
    }

    current += char;
  }

  if (current.trim()) {
    parts.push(current.trim());
  }

  return parts.filter(Boolean);
};

const expandShellVariables = (value: string, env: Record<string, string>) =>
  value.replace(/\$([A-Z_][A-Z0-9_]*)/gi, (_, key: string) => env[key.toUpperCase()] ?? '');

const toDisplayPath = (path: string) => path.replace(/\\/g, '/');

export const CommandPrompt: React.FC<CommandPromptProps> = ({
  onLaunchApp,
  onTriggerBSOD,
}: CommandPromptProps) => {
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
  const [shellEnv, setShellEnv] = useState<Record<string, string>>(SHELL_ENV_DEFAULTS);

  const bottomRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: 'auto' });
  }, [history, isMatrixActive]);

  const runSingleCommand = (cmdStr: string): { outputLines: string[]; shouldExit?: boolean; clearScreen?: boolean } => {
    const raw = cmdStr.trim();
    if (!raw) {
      return { outputLines: [] };
    }

    const expanded = expandShellVariables(raw, shellEnv);
    const parts = tokenizeCommand(expanded);
    const cmd = parts[0]?.toLowerCase();
    const args = parts.slice(1);

    if (!cmd) {
      return { outputLines: [] };
    }

    switch (cmd) {
      case 'help':
        return {
          outputLines: [
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
            'SET <key>=<value>  Sets a shell variable.',
            'PRINTENV       Shows current shell environment values.',
            'PWD            Prints working directory.',
            'CD <path>      Changes current directory.',
            'LS             Lists current directory items.',
            'WHOAMI         Displays the active user.',
            'HOSTNAME       Displays the machine name.',
            'COLOR <attr>   Sets default console foreground colors (e.g. 0a, 0c, 0f).',
            'CALC           Starts the Windows Calculator application.',
            'NOTEPAD        Starts the Windows Notepad text editor.',
            'PAINT          Starts the MS Paint canvas editor.',
            'EXPLORER       Opens File Explorer.',
            'MATRIX         Enters the falling digital rain matrix mode.',
            'BSOD           Triggers Blue Screen of Death diagnostic test.',
            'EXIT           Closes the Command Prompt.',
          ],
        };

      case 'clear':
      case 'cls':
        return { outputLines: [], clearScreen: true };

      case 'ver':
        return { outputLines: ['Microsoft Windows [Version 10.0.19045.3803]'] };

      case 'systeminfo':
        return {
          outputLines: [
            'Host Name:                 DESKTOP-WIN10SIM',
            'OS Name:                   Microsoft Windows 10 Pro',
            'OS Version:                10.0.19045 N/A Build 19045',
            'OS Manufacturer:           Microsoft Corporation',
            'OS Configuration:          Standalone Workstation',
            'OS Build Type:             Multiprocessor Free',
            'Registered Owner:          User',
            'System Manufacturer:       Microsoft Virtual Machine',
            'System Model:              Hyper-Core x64 Simulation',
            'Processor(s):              1 Processor(s) Installed.',
            '                           [01]: Intel64 Family 6 Model 183 Stepping 1 ~3200 Mhz',
            'Total Physical Memory:     32,768 MB',
            'Available Physical Memory: 24,512 MB',
            'Virtual Memory: Max Size:  37,632 MB',
          ],
        };

      case 'ipconfig':
        return {
          outputLines: [
            'Windows IP Configuration',
            '',
            'Wireless LAN adapter Wi-Fi:',
            '   Connection-specific DNS Suffix  . : localdomain',
            '   IPv6 Address. . . . . . . . . . . : fe80::5c41:9a8d:e12f:9812%12',
            '   IPv4 Address. . . . . . . . . . . : 192.168.1.142',
            '   Subnet Mask . . . . . . . . . . . : 255.255.255.0',
            '   Default Gateway . . . . . . . . . : 192.168.1.1',
          ],
        };

      case 'ping': {
        const host = args[0] || '127.0.0.1';
        return {
          outputLines: [
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
          ],
        };
      }

      case 'date':
        return { outputLines: [`The current date is: ${new Date().toLocaleDateString()}`] };

      case 'time':
        return { outputLines: [`The current time is: ${new Date().toLocaleTimeString()}`] };

      case 'dir':
      case 'ls':
        return {
          outputLines: [
            ' Volume in drive C has no label.',
            ' Volume Serial Number is 4E21-A90F',
            '',
            ` Directory of ${shellEnv.PWD || 'C:\\Users\\User'}`,
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
          ],
        };

      case 'echo':
        return { outputLines: [expandShellVariables(args.join(' '), shellEnv)] };

      case 'printenv':
        return {
          outputLines: Object.entries(shellEnv).map(([key, value]) => `${key}=${value}`),
        };

      case 'set': {
        const assignment = args.join(' ');
        const match = assignment.match(/^([A-Za-z_][A-Za-z0-9_]*)\s*=\s*(.*)$/);
        if (!match) {
          return { outputLines: ['Usage: SET <NAME>=<VALUE>'] };
        }
        const [, name, value] = match;
        const nextValue = expandShellVariables(value, shellEnv);
        setShellEnv((prev) => ({ ...prev, [name.toUpperCase()]: nextValue }));
        return { outputLines: [`${name.toUpperCase()}=${nextValue}`] };
      }

      case 'cd': {
        const target = expandShellVariables(args.join(' ') || shellEnv.HOME || 'C:\\Users\\User', shellEnv);
        const nextPath = target.startsWith('C:') || target.startsWith('/') ? target : `${shellEnv.PWD || 'C:\\Users\\User'}\\${target}`;
        setShellEnv((prev) => ({ ...prev, PWD: nextPath, HOME: prev.HOME || 'C:\\Users\\User' }));
        return { outputLines: [`Current directory: ${nextPath}`] };
      }

      case 'pwd':
        return { outputLines: [`${shellEnv.PWD || 'C:\\Users\\User'}`] };

      case 'whoami':
        return { outputLines: ['DESKTOP-WIN10SIM\\User'] };

      case 'hostname':
        return { outputLines: ['DESKTOP-WIN10SIM'] };

      case 'color': {
        const code = (args[0] || '').toLowerCase();
        if (code === '0a') setTextColor('text-green-400');
        else if (code === '0c') setTextColor('text-red-400');
        else if (code === '0b') setTextColor('text-cyan-400');
        else if (code === '0e') setTextColor('text-yellow-300');
        else if (code === '0f') setTextColor('text-white');
        else setTextColor('text-zinc-200');
        return { outputLines: [`Console color attribute set to '${code}'.`] };
      }

      case 'calc':
        onLaunchApp?.('calc');
        return { outputLines: ['Launching Calculator...'] };

      case 'notepad':
        onLaunchApp?.('notepad');
        return { outputLines: ['Launching Notepad...'] };

      case 'paint':
        onLaunchApp?.('paint');
        return { outputLines: ['Launching MS Paint...'] };

      case 'explorer':
        onLaunchApp?.('explorer');
        return { outputLines: ['Launching File Explorer...'] };

      case 'bsod':
        soundEngine.playDing();
        onTriggerBSOD?.();
        return { outputLines: [], shouldExit: true };

      case 'matrix':
        setIsMatrixActive(true);
        soundEngine.playNotification();
        setTimeout(() => setIsMatrixActive(false), 8000);
        return { outputLines: ['Entering the Matrix stream...'] };

      case 'exit':
        return { outputLines: ['Process terminated. Click window close (X) to exit.'], shouldExit: true };

      default:
        return {
          outputLines: [
            `'${cmd}' is not recognized as an internal or external command,`,
            'operable program or batch file. Type "help" for a list of commands.',
          ],
        };
    }
  };

  const handleCommand = (cmdStr: string) => {
    const trimmed = cmdStr.trim();
    if (!trimmed) {
      setHistory((prev: HistoryItem[]) => [
        ...prev,
        { id: String(Date.now()), type: 'cmd', text: `C:\\Users\\User> ` },
      ]);
      return;
    }

    const chainParts = splitCommandChain(trimmed);
    let commandStatus = true;
    let commandOutput: string[] = [];

    setCommandHistory((prev: string[]) => [trimmed, ...prev]);
    setHistoryIndex(-1);

    const cmdEntry: HistoryItem = {
      id: String(Date.now()),
      type: 'cmd',
      text: `C:\\Users\\User> ${cmdStr}`,
    };

    for (let i = 0; i < chainParts.length; i += 1) {
      const part = chainParts[i];
      if (part === '&&' || part === '||' || part === ';') {
        continue;
      }

      const result = runSingleCommand(part);
      const hasFailure = result.outputLines.some((line) => line.startsWith("'")) && result.outputLines[0]?.includes('not recognized');

      if (part === '&&') {
        continue;
      }

      if (commandStatus && (i === 0 || chainParts[i - 1] !== '||')) {
        commandOutput = result.outputLines;
        if (result.clearScreen) {
          setHistory([]);
          return;
        }
        if (result.shouldExit) {
          setHistory((prev: HistoryItem[]) => [
            ...prev,
            cmdEntry,
            {
              id: String(Date.now() + 1),
              type: 'output',
              lines: result.outputLines,
            },
          ]);
          return;
        }
        if (hasFailure) {
          commandStatus = false;
        }
      } else if (!commandStatus && chainParts[i - 1] === '&&') {
        continue;
      } else if (commandStatus && chainParts[i - 1] === '||') {
        continue;
      } else if (!commandStatus && chainParts[i - 1] === '||') {
        commandOutput = result.outputLines;
      }
    }

    setHistory((prev: HistoryItem[]) => [
      ...prev,
      cmdEntry,
      {
        id: String(Date.now() + 1),
        type: 'output',
        lines: commandOutput.length ? commandOutput : [''],
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

      {history.map((item: HistoryItem) => (
        <div key={item.id} className="mb-1 leading-relaxed">
          {item.type === 'cmd' && <div className="font-semibold">{item.text}</div>}
          {item.type === 'output' && (
            <div>
              {item.lines?.map((line: string, idx: number) => (
                <div key={idx} className="whitespace-pre-wrap">
                  {line}
                </div>
              ))}
            </div>
          )}
        </div>
      ))}

      <div className="flex items-center leading-relaxed">
        <span className="font-semibold whitespace-pre">C:\Users\User&gt; </span>
        <input
          ref={inputRef}
          type="text"
          value={currentInput}
          onChange={(e: React.ChangeEvent<HTMLInputElement>) => setCurrentInput(e.target.value)}
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
