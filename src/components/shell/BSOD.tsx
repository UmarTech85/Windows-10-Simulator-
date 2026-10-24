import React, { useState, useEffect } from 'react';
import { QrCode } from 'lucide-react';

interface BSODProps {
  onRestart: () => void;
}

export const BSOD: React.FC<BSODProps> = ({ onRestart }) => {
  const [percent, setPercent] = useState(0);

  useEffect(() => {
    const timer = setInterval(() => {
      setPercent((p) => {
        if (p >= 100) {
          clearInterval(timer);
          return 100;
        }
        return p + Math.floor(Math.random() * 20 + 10);
      });
    }, 600);

    return () => clearInterval(timer);
  }, []);

  return (
    <div
      onClick={onRestart}
      className="fixed inset-0 z-[120] bg-[#0078d7] text-white p-12 sm:p-24 font-sans select-none flex flex-col justify-between cursor-pointer"
    >
      <div>
        <div className="text-8xl sm:text-9xl font-light mb-8 font-mono">:(</div>
        <h1 className="text-2xl sm:text-3xl font-light leading-snug max-w-3xl mb-8">
          Your PC ran into a problem and needs to restart. We're just collecting some error info, and then we'll restart for you.
        </h1>
        <div className="text-xl sm:text-2xl font-light font-mono mb-12">
          {Math.min(100, percent)}% complete
        </div>

        <div className="flex items-start gap-6 max-w-2xl">
          <div className="p-2 bg-white text-blue-700 rounded-xs shrink-0">
            <QrCode size={84} />
          </div>
          <div className="text-xs space-y-1.5 leading-relaxed text-blue-100">
            <p>
              For more information about this issue and possible fixes, visit{' '}
              <span className="underline">https://www.windows.com/stopcode</span>
            </p>
            <p>If you call a support person, give them this info:</p>
            <p className="font-mono text-white pt-1">Stop code: CRITICAL_PROCESS_DIED</p>
            <p className="text-[11px] text-blue-200">Click anywhere to restart simulator immediately.</p>
          </div>
        </div>
      </div>

      <div className="text-xs text-blue-200">
        Windows Diagnostic Kernel Dump Complete.
      </div>
    </div>
  );
};
