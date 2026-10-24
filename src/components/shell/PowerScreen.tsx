import React, { useEffect, useRef } from 'react';

interface PowerScreenProps {
  mode: 'shutdown' | 'restart';
  onDone: () => void;
}

export const PowerScreen: React.FC<PowerScreenProps> = ({ mode, onDone }) => {
  const onDoneRef = useRef(onDone);
  onDoneRef.current = onDone;

  useEffect(() => {
    const timer = setTimeout(() => {
      onDoneRef.current();
    }, 2500);
    return () => clearTimeout(timer);
  }, []);

  return (
    <div className="fixed inset-0 z-[110] bg-[#005a9e] text-white flex flex-col items-center justify-center font-sans select-none">
      {/* Circling dots animation */}
      <div className="relative w-16 h-16 mb-6">
        {Array.from({ length: 6 }).map((_, i) => (
          <div
            key={i}
            className="absolute inset-0 flex items-start justify-center animate-spin"
            style={{
              animationDuration: '2.5s',
              animationDelay: `${i * 0.18}s`,
              animationTimingFunction: 'cubic-bezier(0.5, 0.1, 0.5, 0.9)',
            }}
          >
            <div className="w-2.5 h-2.5 rounded-full bg-white shadow-sm" />
          </div>
        ))}
      </div>

      <h2 className="text-xl font-light tracking-wide">
        {mode === 'shutdown' ? 'Shutting down...' : 'Restarting...'}
      </h2>
    </div>
  );
};
