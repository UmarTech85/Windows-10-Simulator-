import React, { useState, useEffect } from 'react';
import { WindowState } from '../../types/os';
import { AppIcon } from '../common/AppIcon';
import { soundEngine } from '../../utils/sound';

interface TaskManagerProps {
  windows: WindowState[];
  onEndTask: (windowId: string) => void;
}

export const TaskManager: React.FC<TaskManagerProps> = ({ windows, onEndTask }) => {
  const [activeTab, setActiveTab] = useState<'processes' | 'performance'>('processes');
  const [selectedWinId, setSelectedWinId] = useState<string | null>(null);
  const [cpuHistory, setCpuHistory] = useState<number[]>([14, 22, 18, 30, 24, 15, 12, 28, 35, 19]);
  const [currentCpu, setCurrentCpu] = useState<number>(18);
  const [currentRam, setCurrentRam] = useState<number>(7.2);

  // Live performance metrics update
  useEffect(() => {
    const timer = setInterval(() => {
      const activeCount = windows.length;
      const baseCpu = 8 + activeCount * 4;
      const jitter = Math.floor(Math.random() * 8) - 4;
      const newCpu = Math.max(5, Math.min(95, baseCpu + jitter));
      setCurrentCpu(newCpu);
      setCpuHistory((prev) => [...prev.slice(-19), newCpu]);

      const baseRam = 6.4 + activeCount * 0.45;
      setCurrentRam(parseFloat((baseRam + (Math.random() * 0.2 - 0.1)).toFixed(1)));
    }, 1200);

    return () => clearInterval(timer);
  }, [windows.length]);

  const handleEndTask = () => {
    if (!selectedWinId) return;
    soundEngine.playClick();
    onEndTask(selectedWinId);
    setSelectedWinId(null);
  };

  return (
    <div className="flex flex-col h-full bg-white text-zinc-900 select-none font-sans overflow-hidden">
      {/* Top Tabs */}
      <div className="flex items-center gap-1 bg-zinc-100 px-3 pt-1 border-b border-zinc-200 text-xs">
        <button
          onClick={() => {
            setActiveTab('processes');
            soundEngine.playClick();
          }}
          className={`px-3 py-1.5 font-medium border-b-2 transition-colors ${
            activeTab === 'processes'
              ? 'border-blue-600 text-blue-600 bg-white'
              : 'border-transparent text-zinc-600 hover:text-zinc-900'
          }`}
        >
          Processes
        </button>
        <button
          onClick={() => {
            setActiveTab('performance');
            soundEngine.playClick();
          }}
          className={`px-3 py-1.5 font-medium border-b-2 transition-colors ${
            activeTab === 'performance'
              ? 'border-blue-600 text-blue-600 bg-white'
              : 'border-transparent text-zinc-600 hover:text-zinc-900'
          }`}
        >
          Performance
        </button>
      </div>

      {/* Main Tab Views */}
      <div className="flex-1 overflow-y-auto p-3">
        {activeTab === 'processes' ? (
          <div>
            <div className="text-xs font-semibold text-zinc-500 uppercase tracking-wider mb-2">
              Apps ({windows.length})
            </div>

            <table className="w-full text-xs text-left border-collapse">
              <thead>
                <tr className="border-b border-zinc-200 text-zinc-400 font-normal">
                  <th className="py-1 px-2 font-medium">Name</th>
                  <th className="py-1 px-2 font-medium text-right">CPU</th>
                  <th className="py-1 px-2 font-medium text-right">Memory</th>
                  <th className="py-1 px-2 font-medium text-right">Disk</th>
                  <th className="py-1 px-2 font-medium text-right">Network</th>
                </tr>
              </thead>
              <tbody>
                {windows.length === 0 ? (
                  <tr>
                    <td colSpan={5} className="py-8 text-center text-zinc-400">
                      No foreground apps currently open
                    </td>
                  </tr>
                ) : (
                  windows.map((win) => {
                    const isSelected = selectedWinId === win.id;
                    return (
                      <tr
                        key={win.id}
                        onClick={() => setSelectedWinId(win.id)}
                        className={`cursor-pointer transition-colors ${
                          isSelected ? 'bg-blue-100 text-blue-900' : 'hover:bg-zinc-50'
                        }`}
                      >
                        <td className="py-2 px-2 flex items-center gap-2">
                          <AppIcon appId={win.appId} size={16} />
                          <span className="font-medium truncate max-w-xs">{win.title}</span>
                        </td>
                        <td className="py-2 px-2 text-right font-mono text-zinc-600">
                          {(Math.random() * 3 + 0.5).toFixed(1)}%
                        </td>
                        <td className="py-2 px-2 text-right font-mono text-zinc-600">
                          {Math.floor(Math.random() * 120 + 40)} MB
                        </td>
                        <td className="py-2 px-2 text-right font-mono text-zinc-600">0.1 MB/s</td>
                        <td className="py-2 px-2 text-right font-mono text-zinc-600">0 Mbps</td>
                      </tr>
                    );
                  })
                )}

                {/* System Background Processes */}
                <tr className="border-t border-zinc-100">
                  <td colSpan={5} className="pt-4 pb-1 px-2 text-[11px] font-semibold text-zinc-400 uppercase">
                    Background processes (4)
                  </td>
                </tr>
                <tr className="text-zinc-600">
                  <td className="py-1.5 px-2">Desktop Window Manager</td>
                  <td className="py-1.5 px-2 text-right font-mono">1.2%</td>
                  <td className="py-1.5 px-2 text-right font-mono">54.2 MB</td>
                  <td className="py-1.5 px-2 text-right font-mono">0.0 MB/s</td>
                  <td className="py-1.5 px-2 text-right font-mono">0 Mbps</td>
                </tr>
                <tr className="text-zinc-600">
                  <td className="py-1.5 px-2">Windows Audio Device Graph Isolation</td>
                  <td className="py-1.5 px-2 text-right font-mono">0.4%</td>
                  <td className="py-1.5 px-2 text-right font-mono">18.6 MB</td>
                  <td className="py-1.5 px-2 text-right font-mono">0.0 MB/s</td>
                  <td className="py-1.5 px-2 text-right font-mono">0 Mbps</td>
                </tr>
                <tr className="text-zinc-600">
                  <td className="py-1.5 px-2">Antimalware Service Executable</td>
                  <td className="py-1.5 px-2 text-right font-mono">0.2%</td>
                  <td className="py-1.5 px-2 text-right font-mono">148.0 MB</td>
                  <td className="py-1.5 px-2 text-right font-mono">0.3 MB/s</td>
                  <td className="py-1.5 px-2 text-right font-mono">0 Mbps</td>
                </tr>
                <tr className="text-zinc-600">
                  <td className="py-1.5 px-2">Windows Explorer</td>
                  <td className="py-1.5 px-2 text-right font-mono">0.8%</td>
                  <td className="py-1.5 px-2 text-right font-mono">82.1 MB</td>
                  <td className="py-1.5 px-2 text-right font-mono">0.0 MB/s</td>
                  <td className="py-1.5 px-2 text-right font-mono">0 Mbps</td>
                </tr>
              </tbody>
            </table>
          </div>
        ) : (
          /* Performance Charts Tab */
          <div className="space-y-4">
            <div className="p-4 bg-zinc-50 border border-zinc-200 rounded-lg">
              <div className="flex items-center justify-between mb-2">
                <div>
                  <span className="font-semibold text-sm">CPU</span>
                  <div className="text-xs text-zinc-500">Intel(R) Core(TM) i9-14900K @ 3.20GHz</div>
                </div>
                <div className="text-right">
                  <span className="text-2xl font-bold font-mono text-blue-600">{currentCpu}%</span>
                  <div className="text-[11px] text-zinc-500">Utilization</div>
                </div>
              </div>

              {/* Animated SVG Graph */}
              <div className="h-28 w-full bg-zinc-900 rounded p-1 relative overflow-hidden">
                <svg className="w-full h-full" preserveAspectRatio="none" viewBox="0 0 200 100">
                  {/* Grid lines */}
                  <line x1="0" y1="25" x2="200" y2="25" stroke="#333" strokeDasharray="2,2" />
                  <line x1="0" y1="50" x2="200" y2="50" stroke="#333" strokeDasharray="2,2" />
                  <line x1="0" y1="75" x2="200" y2="75" stroke="#333" strokeDasharray="2,2" />
                  {/* CPU Area Polyline */}
                  <polyline
                    fill="rgba(37, 99, 235, 0.2)"
                    stroke="#3b82f6"
                    strokeWidth="2"
                    points={cpuHistory
                      .map((val, idx) => `${(idx / (cpuHistory.length - 1)) * 200},${100 - val}`)
                      .join(' ') + ' 200,100 0,100'}
                  />
                </svg>
              </div>

              <div className="grid grid-cols-4 gap-2 mt-3 text-xs text-zinc-600">
                <div>Speed: <strong className="font-mono text-zinc-900">4.12 GHz</strong></div>
                <div>Processes: <strong className="font-mono text-zinc-900">142</strong></div>
                <div>Threads: <strong className="font-mono text-zinc-900">1,940</strong></div>
                <div>Up time: <strong className="font-mono text-zinc-900">0:14:28:10</strong></div>
              </div>
            </div>

            <div className="p-4 bg-zinc-50 border border-zinc-200 rounded-lg">
              <div className="flex items-center justify-between mb-2">
                <div>
                  <span className="font-semibold text-sm">Memory</span>
                  <div className="text-xs text-zinc-500">32.0 GB DDR5 6000MHz</div>
                </div>
                <div className="text-right">
                  <span className="text-2xl font-bold font-mono text-purple-600">{currentRam} GB</span>
                  <div className="text-[11px] text-zinc-500">In use (23%)</div>
                </div>
              </div>
              <div className="w-full bg-zinc-200 h-3 rounded-full overflow-hidden">
                <div
                  className="bg-purple-600 h-full transition-all duration-500"
                  style={{ width: `${(currentRam / 32) * 100}%` }}
                />
              </div>
            </div>
          </div>
        )}
      </div>

      {/* Bottom Footer Actions */}
      <div className="p-2 border-t border-zinc-200 bg-zinc-100 flex items-center justify-between text-xs">
        <span className="text-zinc-500">Fewer details</span>
        <button
          onClick={handleEndTask}
          disabled={!selectedWinId}
          className="px-4 py-1.5 bg-blue-600 hover:bg-blue-700 disabled:opacity-40 disabled:hover:bg-blue-600 text-white rounded font-medium shadow-xs transition-colors"
        >
          End task
        </button>
      </div>
    </div>
  );
};
