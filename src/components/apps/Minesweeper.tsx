import React, { useState, useEffect, useCallback, useRef } from 'react';
import { Flag, RotateCcw } from 'lucide-react';
import { soundEngine } from '../../utils/sound';

type Difficulty = 'beginner' | 'intermediate' | 'expert';

interface Config {
  rows: number;
  cols: number;
  mines: number;
}

const CONFIGS: Record<Difficulty, Config> = {
  beginner: { rows: 9, cols: 9, mines: 10 },
  intermediate: { rows: 16, cols: 16, mines: 40 },
  expert: { rows: 16, cols: 30, mines: 99 },
};

interface Cell {
  row: number;
  col: number;
  isMine: boolean;
  isRevealed: boolean;
  isFlagged: boolean;
  neighborMines: number;
}

const NUMBER_COLORS = [
  '',
  'text-blue-600',
  'text-emerald-600',
  'text-red-600',
  'text-indigo-900',
  'text-amber-800',
  'text-teal-600',
  'text-black',
  'text-zinc-600',
];

export const Minesweeper: React.FC = () => {
  const [difficulty, setDifficulty] = useState<Difficulty>('beginner');
  const [grid, setGrid] = useState<Cell[][]>([]);
  const [gameStatus, setGameStatus] = useState<'idle' | 'playing' | 'won' | 'lost'>('idle');
  const [faceState, setFaceState] = useState<'normal' | 'worried' | 'won' | 'dead'>('normal');
  const [flagMode, setFlagMode] = useState<boolean>(false);
  const [mineCount, setMineCount] = useState<number>(10);
  const [timer, setTimer] = useState<number>(0);

  const timerRef = useRef<number | null>(null);

  const initBoard = useCallback((diff: Difficulty) => {
    const config = CONFIGS[diff];
    const newGrid: Cell[][] = [];

    for (let r = 0; r < config.rows; r++) {
      const row: Cell[] = [];
      for (let c = 0; c < config.cols; c++) {
        row.push({
          row: r,
          col: c,
          isMine: false,
          isRevealed: false,
          isFlagged: false,
          neighborMines: 0,
        });
      }
      newGrid.push(row);
    }

    setGrid(newGrid);
    setGameStatus('idle');
    setFaceState('normal');
    setMineCount(config.mines);
    setTimer(0);
    if (timerRef.current) clearInterval(timerRef.current);
  }, []);

  useEffect(() => {
    initBoard(difficulty);
    return () => {
      if (timerRef.current) clearInterval(timerRef.current);
    };
  }, [difficulty, initBoard]);

  const plantMines = (firstRow: number, firstCol: number, currentGrid: Cell[][]) => {
    const config = CONFIGS[difficulty];
    let planted = 0;
    const newGrid = currentGrid.map((row) => row.map((cell) => ({ ...cell })));

    while (planted < config.mines) {
      const r = Math.floor(Math.random() * config.rows);
      const c = Math.floor(Math.random() * config.cols);

      // Don't place on first clicked cell or neighbors
      if (Math.abs(r - firstRow) <= 1 && Math.abs(c - firstCol) <= 1) continue;
      if (newGrid[r][c].isMine) continue;

      newGrid[r][c].isMine = true;
      planted++;
    }

    // Compute neighbors
    for (let r = 0; r < config.rows; r++) {
      for (let c = 0; c < config.cols; c++) {
        if (newGrid[r][c].isMine) continue;
        let count = 0;
        for (let dr = -1; dr <= 1; dr++) {
          for (let dc = -1; dc <= 1; dc++) {
            const nr = r + dr;
            const nc = c + dc;
            if (nr >= 0 && nr < config.rows && nc >= 0 && nc < config.cols) {
              if (newGrid[nr][nc].isMine) count++;
            }
          }
        }
        newGrid[r][c].neighborMines = count;
      }
    }

    return newGrid;
  };

  const startTimer = () => {
    if (timerRef.current) clearInterval(timerRef.current);
    timerRef.current = window.setInterval(() => {
      setTimer((t) => Math.min(999, t + 1));
    }, 1000);
  };

  const revealCell = (r: number, c: number) => {
    if (gameStatus === 'won' || gameStatus === 'lost') return;

    let currentGrid = grid;

    if (gameStatus === 'idle') {
      currentGrid = plantMines(r, c, grid);
      setGameStatus('playing');
      startTimer();
    }

    const cell = currentGrid[r][c];
    if (cell.isRevealed || cell.isFlagged) return;

    if (cell.isMine) {
      // Game Over
      soundEngine.playExplosion();
      if (timerRef.current) clearInterval(timerRef.current);
      setGameStatus('lost');
      setFaceState('dead');

      // Reveal all mines
      const revealedGrid = currentGrid.map((row) =>
        row.map((cl) => (cl.isMine ? { ...cl, isRevealed: true } : cl))
      );
      setGrid(revealedGrid);
      return;
    }

    soundEngine.playClick();
    const nextGrid = currentGrid.map((row) => row.map((cl) => ({ ...cl })));

    // Flood fill
    const queue: [number, number][] = [[r, c]];
    nextGrid[r][c].isRevealed = true;

    while (queue.length > 0) {
      const [currR, currC] = queue.shift()!;
      const currCell = nextGrid[currR][currC];

      if (currCell.neighborMines === 0) {
        for (let dr = -1; dr <= 1; dr++) {
          for (let dc = -1; dc <= 1; dc++) {
            const nr = currR + dr;
            const nc = currC + dc;
            if (
              nr >= 0 &&
              nr < CONFIGS[difficulty].rows &&
              nc >= 0 &&
              nc < CONFIGS[difficulty].cols
            ) {
              const neighbor = nextGrid[nr][nc];
              if (!neighbor.isRevealed && !neighbor.isFlagged && !neighbor.isMine) {
                neighbor.isRevealed = true;
                queue.push([nr, nc]);
              }
            }
          }
        }
      }
    }

    // Check Win
    let unrevealedSafeCells = 0;
    for (let row = 0; row < CONFIGS[difficulty].rows; row++) {
      for (let col = 0; col < CONFIGS[difficulty].cols; col++) {
        if (!nextGrid[row][col].isMine && !nextGrid[row][col].isRevealed) {
          unrevealedSafeCells++;
        }
      }
    }

    if (unrevealedSafeCells === 0) {
      // Victory!
      soundEngine.playWin();
      if (timerRef.current) clearInterval(timerRef.current);
      setGameStatus('won');
      setFaceState('won');
      setMineCount(0);
    }

    setGrid(nextGrid);
  };

  const toggleFlag = (e: React.MouseEvent, r: number, c: number) => {
    e.preventDefault();
    if (gameStatus === 'won' || gameStatus === 'lost') return;
    const cell = grid[r][c];
    if (cell.isRevealed) return;

    soundEngine.playClick();
    const nextGrid = grid.map((row) => row.map((cl) => ({ ...cl })));
    const target = nextGrid[r][c];
    target.isFlagged = !target.isFlagged;

    setMineCount((prev) => (target.isFlagged ? prev - 1 : prev + 1));
    setGrid(nextGrid);
  };

  const handleCellClick = (e: React.MouseEvent, r: number, c: number) => {
    if (flagMode || e.button === 2) {
      toggleFlag(e, r, c);
    } else {
      revealCell(r, c);
    }
  };

  return (
    <div className="flex flex-col h-full bg-[#c0c0c0] text-zinc-900 select-none font-sans p-3 overflow-auto items-center">
      {/* Top Difficulty Tabs */}
      <div className="flex items-center gap-2 mb-3 text-xs">
        {(['beginner', 'intermediate', 'expert'] as Difficulty[]).map((d) => (
          <button
            key={d}
            onClick={() => {
              setDifficulty(d);
              soundEngine.playClick();
            }}
            className={`px-3 py-1 font-medium capitalize border border-zinc-400 shadow-xs transition-colors ${
              difficulty === d ? 'bg-zinc-800 text-white' : 'bg-zinc-200 hover:bg-zinc-300'
            }`}
          >
            {d}
          </button>
        ))}
      </div>

      {/* Retro Inset Outer Frame */}
      <div className="border-4 border-t-zinc-400 border-l-zinc-400 border-r-white border-b-white p-3 bg-[#c0c0c0] shadow-md inline-block">
        {/* Header Display */}
        <div className="border-4 border-t-zinc-700 border-l-zinc-700 border-r-white border-b-white bg-[#c0c0c0] p-2 flex items-center justify-between mb-3">
          {/* Mine Counter */}
          <div className="bg-black text-red-600 font-mono text-2xl font-bold px-2 py-0.5 tracking-widest border border-zinc-600">
            {String(Math.max(-99, Math.min(999, mineCount))).padStart(3, '0')}
          </div>

          {/* Reset Face */}
          <div className="flex items-center gap-2">
            <button
              onClick={() => {
                initBoard(difficulty);
                soundEngine.playClick();
              }}
              onMouseDown={() => setFaceState('worried')}
              onMouseUp={() => setFaceState(gameStatus === 'won' ? 'won' : gameStatus === 'lost' ? 'dead' : 'normal')}
              className="w-10 h-10 bg-[#c0c0c0] border-2 border-t-white border-l-white border-r-zinc-600 border-b-zinc-600 active:border-zinc-600 active:border-t-zinc-800 text-xl flex items-center justify-center hover:bg-zinc-200"
            >
              {faceState === 'normal' && '🙂'}
              {faceState === 'worried' && '😮'}
              {faceState === 'won' && '😎'}
              {faceState === 'dead' && '😵'}
            </button>

            {/* Flag Mode Toggle Button (Mobile/Touch friendly) */}
            <button
              onClick={() => {
                setFlagMode(!flagMode);
                soundEngine.playClick();
              }}
              title="Toggle Flagging Mode"
              className={`p-2 border-2 border-t-white border-l-white border-r-zinc-600 border-b-zinc-600 transition-colors ${
                flagMode ? 'bg-red-200 border-red-500' : 'bg-[#c0c0c0]'
              }`}
            >
              <Flag size={16} className={flagMode ? 'text-red-600 fill-red-600' : 'text-zinc-700'} />
            </button>
          </div>

          {/* Timer Display */}
          <div className="bg-black text-red-600 font-mono text-2xl font-bold px-2 py-0.5 tracking-widest border border-zinc-600">
            {String(timer).padStart(3, '0')}
          </div>
        </div>

        {/* Board Cells */}
        <div
          className="border-4 border-t-zinc-700 border-l-zinc-700 border-r-white border-b-white grid gap-[1px] bg-zinc-400 p-[1px]"
          style={{
            gridTemplateColumns: `repeat(${CONFIGS[difficulty].cols}, minmax(0, 1fr))`,
          }}
          onContextMenu={(e) => e.preventDefault()}
        >
          {grid.map((row, r) =>
            row.map((cell, c) => {
              const isRevealed = cell.isRevealed;

              return (
                <button
                  key={`${r}-${c}`}
                  onClick={(e) => handleCellClick(e, r, c)}
                  onContextMenu={(e) => toggleFlag(e, r, c)}
                  onMouseDown={() => {
                    if (!isRevealed && gameStatus !== 'lost' && gameStatus !== 'won') {
                      setFaceState('worried');
                    }
                  }}
                  onMouseUp={() => {
                    if (gameStatus !== 'lost' && gameStatus !== 'won') {
                      setFaceState('normal');
                    }
                  }}
                  className={`w-6 h-6 sm:w-7 sm:h-7 text-xs font-bold flex items-center justify-center transition-none ${
                    isRevealed
                      ? cell.isMine
                        ? 'bg-red-500 text-black border border-zinc-500'
                        : 'bg-[#c0c0c0] border border-zinc-300'
                      : 'bg-[#c0c0c0] border-2 border-t-white border-l-white border-r-zinc-600 border-b-zinc-600 active:border-zinc-500'
                  }`}
                >
                  {isRevealed ? (
                    cell.isMine ? (
                      '💣'
                    ) : cell.neighborMines > 0 ? (
                      <span className={NUMBER_COLORS[cell.neighborMines]}>
                        {cell.neighborMines}
                      </span>
                    ) : null
                  ) : cell.isFlagged ? (
                    '🚩'
                  ) : null}
                </button>
              );
            })
          )}
        </div>
      </div>
    </div>
  );
};
