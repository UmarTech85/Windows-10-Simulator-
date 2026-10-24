import React, { useState, useEffect, useRef } from 'react';
import { History, Trash2, Delete } from 'lucide-react';
import { soundEngine } from '../../utils/sound';

export const Calculator: React.FC = () => {
  const [display, setDisplay] = useState('0');
  const [prevValue, setPrevValue] = useState<number | null>(null);
  const [operation, setOperation] = useState<string | null>(null);
  const [newNumber, setNewNumber] = useState(true);
  const [history, setHistory] = useState<string[]>([]);
  const [showHistory, setShowHistory] = useState(false);
  const [memory, setMemory] = useState<number>(0);

  const handleDigit = (digit: string) => {
    soundEngine.playClick();
    if (newNumber) {
      setDisplay(digit);
      setNewNumber(false);
    } else {
      setDisplay(display === '0' ? digit : display + digit);
    }
  };

  const handleDecimal = () => {
    soundEngine.playClick();
    if (newNumber) {
      setDisplay('0.');
      setNewNumber(false);
    } else if (!display.includes('.')) {
      setDisplay(display + '.');
    }
  };

  const handleOp = (op: string) => {
    soundEngine.playClick();
    const current = parseFloat(display);

    if (prevValue === null) {
      setPrevValue(current);
    } else if (operation) {
      const result = executeCalc(prevValue, current, operation);
      setPrevValue(result);
      setDisplay(String(result));
    }

    setOperation(op);
    setNewNumber(true);
  };

  const executeCalc = (a: number, b: number, op: string): number => {
    switch (op) {
      case '+':
        return a + b;
      case '-':
        return a - b;
      case '×':
        return a * b;
      case '÷':
        return b === 0 ? 0 : a / b;
      default:
        return b;
    }
  };

  const handleEquals = () => {
    soundEngine.playClick();
    if (prevValue !== null && operation) {
      const current = parseFloat(display);
      const result = executeCalc(prevValue, current, operation);
      const histItem = `${prevValue} ${operation} ${current} = ${result}`;
      setHistory((prev) => [histItem, ...prev].slice(0, 20));
      setDisplay(String(result));
      setPrevValue(null);
      setOperation(null);
      setNewNumber(true);
    }
  };

  const handleClear = () => {
    soundEngine.playClick();
    setDisplay('0');
    setPrevValue(null);
    setOperation(null);
    setNewNumber(true);
  };

  const handleClearEntry = () => {
    soundEngine.playClick();
    setDisplay('0');
    setNewNumber(true);
  };

  const handleBackspace = () => {
    soundEngine.playClick();
    if (newNumber) return;
    if (display.length > 1) {
      setDisplay(display.slice(0, -1));
    } else {
      setDisplay('0');
      setNewNumber(true);
    }
  };

  const handleUnary = (type: 'sqrt' | 'sqr' | 'inv' | 'neg' | 'pct') => {
    soundEngine.playClick();
    const val = parseFloat(display);
    let res = val;
    switch (type) {
      case 'sqrt':
        res = Math.sqrt(val);
        break;
      case 'sqr':
        res = val * val;
        break;
      case 'inv':
        res = val !== 0 ? 1 / val : 0;
        break;
      case 'neg':
        res = -val;
        break;
      case 'pct':
        res = val / 100;
        break;
    }
    setDisplay(String(res));
    setNewNumber(true);
  };

  const handleDigitRef = useRef(handleDigit);
  handleDigitRef.current = handleDigit;
  const handleDecimalRef = useRef(handleDecimal);
  handleDecimalRef.current = handleDecimal;
  const handleOpRef = useRef(handleOp);
  handleOpRef.current = handleOp;
  const handleEqualsRef = useRef(handleEquals);
  handleEqualsRef.current = handleEquals;
  const handleBackspaceRef = useRef(handleBackspace);
  handleBackspaceRef.current = handleBackspace;
  const handleClearRef = useRef(handleClear);
  handleClearRef.current = handleClear;

  // Keyboard support
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key >= '0' && e.key <= '9') handleDigitRef.current(e.key);
      else if (e.key === '.') handleDecimalRef.current();
      else if (e.key === '+') handleOpRef.current('+');
      else if (e.key === '-') handleOpRef.current('-');
      else if (e.key === '*') handleOpRef.current('×');
      else if (e.key === '/') {
        e.preventDefault();
        handleOpRef.current('÷');
      } else if (e.key === 'Enter' || e.key === '=') {
        e.preventDefault();
        handleEqualsRef.current();
      } else if (e.key === 'Backspace') handleBackspaceRef.current();
      else if (e.key === 'Escape') handleClearRef.current();
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, []);

  return (
    <div className="flex flex-col h-full bg-[#f3f3f3] text-zinc-900 select-none font-sans relative overflow-hidden">
      {/* Top Header */}
      <div className="flex items-center justify-between px-3 pt-2 pb-1">
        <div className="flex items-center gap-2">
          <span className="text-sm font-semibold tracking-wide">Standard</span>
        </div>
        <button
          onClick={() => setShowHistory(!showHistory)}
          title="History"
          className="p-1 rounded hover:bg-zinc-200 transition-colors text-zinc-600"
        >
          <History size={16} />
        </button>
      </div>

      {/* Screen Display */}
      <div className="px-4 py-2 text-right flex flex-col justify-end min-h-[90px]">
        <div className="text-xs text-zinc-500 h-4 font-mono truncate">
          {prevValue !== null && operation ? `${prevValue} ${operation}` : ''}
        </div>
        <div className="text-3xl sm:text-4xl font-semibold tracking-tight font-mono truncate mt-1">
          {display}
        </div>
      </div>

      {/* Memory Bar */}
      <div className="flex items-center justify-between px-2 py-1 text-[11px] font-medium text-zinc-600 border-b border-zinc-200">
        <button
          onClick={() => setMemory(0)}
          className="px-2 py-0.5 hover:bg-zinc-200 rounded disabled:opacity-30"
          disabled={memory === 0}
        >
          MC
        </button>
        <button
          onClick={() => {
            setDisplay(String(memory));
            setNewNumber(true);
          }}
          className="px-2 py-0.5 hover:bg-zinc-200 rounded disabled:opacity-30"
          disabled={memory === 0}
        >
          MR
        </button>
        <button
          onClick={() => setMemory((m) => m + parseFloat(display))}
          className="px-2 py-0.5 hover:bg-zinc-200 rounded"
        >
          M+
        </button>
        <button
          onClick={() => setMemory((m) => m - parseFloat(display))}
          className="px-2 py-0.5 hover:bg-zinc-200 rounded"
        >
          M-
        </button>
        <button
          onClick={() => setMemory(parseFloat(display))}
          className="px-2 py-0.5 hover:bg-zinc-200 rounded"
        >
          MS
        </button>
      </div>

      {/* Calculator Buttons Grid */}
      <div className="grid grid-cols-4 gap-1 p-1.5 flex-1 text-sm font-medium">
        {/* Row 1 */}
        <button
          onClick={() => handleUnary('pct')}
          className="bg-zinc-100 hover:bg-zinc-200 active:bg-zinc-300 rounded transition-colors flex items-center justify-center py-2"
        >
          %
        </button>
        <button
          onClick={handleClearEntry}
          className="bg-zinc-100 hover:bg-zinc-200 active:bg-zinc-300 rounded transition-colors flex items-center justify-center py-2"
        >
          CE
        </button>
        <button
          onClick={handleClear}
          className="bg-zinc-100 hover:bg-zinc-200 active:bg-zinc-300 rounded transition-colors flex items-center justify-center py-2"
        >
          C
        </button>
        <button
          onClick={handleBackspace}
          className="bg-zinc-100 hover:bg-zinc-200 active:bg-zinc-300 rounded transition-colors flex items-center justify-center py-2"
        >
          <Delete size={16} />
        </button>

        {/* Row 2 */}
        <button
          onClick={() => handleUnary('inv')}
          className="bg-zinc-100 hover:bg-zinc-200 active:bg-zinc-300 rounded transition-colors flex items-center justify-center py-2"
        >
          ¹/x
        </button>
        <button
          onClick={() => handleUnary('sqr')}
          className="bg-zinc-100 hover:bg-zinc-200 active:bg-zinc-300 rounded transition-colors flex items-center justify-center py-2"
        >
          x²
        </button>
        <button
          onClick={() => handleUnary('sqrt')}
          className="bg-zinc-100 hover:bg-zinc-200 active:bg-zinc-300 rounded transition-colors flex items-center justify-center py-2"
        >
          ²√x
        </button>
        <button
          onClick={() => handleOp('÷')}
          className="bg-zinc-200 hover:bg-zinc-300 active:bg-zinc-400 rounded transition-colors flex items-center justify-center py-2 text-base"
        >
          ÷
        </button>

        {/* Row 3 */}
        {['7', '8', '9'].map((d) => (
          <button
            key={d}
            onClick={() => handleDigit(d)}
            className="bg-white hover:bg-zinc-100 active:bg-zinc-200 font-semibold rounded shadow-xs transition-colors flex items-center justify-center py-2 text-base"
          >
            {d}
          </button>
        ))}
        <button
          onClick={() => handleOp('×')}
          className="bg-zinc-200 hover:bg-zinc-300 active:bg-zinc-400 rounded transition-colors flex items-center justify-center py-2 text-base"
        >
          ×
        </button>

        {/* Row 4 */}
        {['4', '5', '6'].map((d) => (
          <button
            key={d}
            onClick={() => handleDigit(d)}
            className="bg-white hover:bg-zinc-100 active:bg-zinc-200 font-semibold rounded shadow-xs transition-colors flex items-center justify-center py-2 text-base"
          >
            {d}
          </button>
        ))}
        <button
          onClick={() => handleOp('-')}
          className="bg-zinc-200 hover:bg-zinc-300 active:bg-zinc-400 rounded transition-colors flex items-center justify-center py-2 text-base"
        >
          −
        </button>

        {/* Row 5 */}
        {['1', '2', '3'].map((d) => (
          <button
            key={d}
            onClick={() => handleDigit(d)}
            className="bg-white hover:bg-zinc-100 active:bg-zinc-200 font-semibold rounded shadow-xs transition-colors flex items-center justify-center py-2 text-base"
          >
            {d}
          </button>
        ))}
        <button
          onClick={() => handleOp('+')}
          className="bg-zinc-200 hover:bg-zinc-300 active:bg-zinc-400 rounded transition-colors flex items-center justify-center py-2 text-base"
        >
          +
        </button>

        {/* Row 6 */}
        <button
          onClick={() => handleUnary('neg')}
          className="bg-zinc-100 hover:bg-zinc-200 active:bg-zinc-300 rounded transition-colors flex items-center justify-center py-2"
        >
          ±
        </button>
        <button
          onClick={() => handleDigit('0')}
          className="bg-white hover:bg-zinc-100 active:bg-zinc-200 font-semibold rounded shadow-xs transition-colors flex items-center justify-center py-2 text-base"
        >
          0
        </button>
        <button
          onClick={handleDecimal}
          className="bg-zinc-100 hover:bg-zinc-200 active:bg-zinc-300 font-semibold rounded transition-colors flex items-center justify-center py-2"
        >
          .
        </button>
        <button
          onClick={handleEquals}
          className="bg-blue-600 hover:bg-blue-700 active:bg-blue-800 text-white font-semibold rounded shadow-xs transition-colors flex items-center justify-center py-2 text-base"
        >
          =
        </button>
      </div>

      {/* History Slide-out Drawer */}
      {showHistory && (
        <div className="absolute inset-0 bg-white/95 backdrop-blur-md z-20 flex flex-col p-3 shadow-lg">
          <div className="flex items-center justify-between pb-2 border-b border-zinc-200">
            <span className="font-semibold text-sm">Calculation History</span>
            <div className="flex items-center gap-1">
              <button
                onClick={() => setHistory([])}
                title="Clear History"
                className="p-1 hover:bg-zinc-100 rounded text-zinc-500 hover:text-red-600"
              >
                <Trash2 size={15} />
              </button>
              <button
                onClick={() => setShowHistory(false)}
                className="px-2 py-0.5 text-xs bg-zinc-200 hover:bg-zinc-300 rounded"
              >
                Done
              </button>
            </div>
          </div>
          <div className="flex-1 overflow-y-auto py-2 space-y-2">
            {history.length === 0 ? (
              <p className="text-zinc-400 text-xs text-center py-8">There's no history yet</p>
            ) : (
              history.map((item, idx) => (
                <div
                  key={idx}
                  onClick={() => {
                    const parts = item.split('=');
                    if (parts.length > 1) {
                      setDisplay(parts[1].trim());
                      setNewNumber(true);
                      setShowHistory(false);
                    }
                  }}
                  className="p-2 bg-zinc-50 hover:bg-zinc-100 rounded cursor-pointer text-right font-mono text-xs border border-zinc-200 transition-colors"
                >
                  {item}
                </div>
              ))
            )}
          </div>
        </div>
      )}
    </div>
  );
};
