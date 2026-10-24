import React, { useState, useEffect } from 'react';
import { ChevronLeft, ChevronRight } from 'lucide-react';
import { soundEngine } from '../../utils/sound';

interface CalendarFlyoutProps {
  onClose: () => void;
}

export const CalendarFlyout: React.FC<CalendarFlyoutProps> = ({ onClose }) => {
  const [currentDate, setCurrentDate] = useState(new Date());
  const [viewDate, setViewDate] = useState(new Date());

  useEffect(() => {
    const timer = setInterval(() => {
      setCurrentDate(new Date());
    }, 1000);
    return () => clearInterval(timer);
  }, []);

  const year = viewDate.getFullYear();
  const month = viewDate.getMonth();

  const daysInMonth = new Date(year, month + 1, 0).getDate();
  const firstDayIndex = new Date(year, month, 1).getDay();

  const prevMonth = () => {
    soundEngine.playClick();
    setViewDate(new Date(year, month - 1, 1));
  };

  const nextMonth = () => {
    soundEngine.playClick();
    setViewDate(new Date(year, month + 1, 1));
  };

  const monthNames = [
    'January', 'February', 'March', 'April', 'May', 'June',
    'July', 'August', 'September', 'October', 'November', 'December',
  ];

  const isToday = (day: number) => {
    return (
      day === currentDate.getDate() &&
      month === currentDate.getMonth() &&
      year === currentDate.getFullYear()
    );
  };

  return (
    <div
      onClick={(e) => e.stopPropagation()}
      className="fixed bottom-[44px] right-0 w-80 bg-[#1f1f1f]/95 backdrop-blur-xl text-white border-t border-l border-zinc-700/60 shadow-2xl z-50 p-4 font-sans select-none animate-fadeIn"
    >
      {/* Time Display */}
      <div className="border-b border-zinc-700/60 pb-3 mb-3">
        <div className="text-3xl font-light tracking-tight font-mono">
          {currentDate.toLocaleTimeString()}
        </div>
        <div className="text-xs text-blue-400 mt-1 font-medium">
          {currentDate.toLocaleDateString(undefined, {
            weekday: 'long',
            month: 'long',
            day: 'numeric',
            year: 'numeric',
          })}
        </div>
      </div>

      {/* Month Navigation */}
      <div className="flex items-center justify-between mb-3 text-xs font-semibold">
        <span>
          {monthNames[month]} {year}
        </span>
        <div className="flex gap-1">
          <button
            onClick={prevMonth}
            className="p-1 hover:bg-zinc-700 rounded transition-colors text-zinc-300 hover:text-white"
          >
            <ChevronLeft size={16} />
          </button>
          <button
            onClick={nextMonth}
            className="p-1 hover:bg-zinc-700 rounded transition-colors text-zinc-300 hover:text-white"
          >
            <ChevronRight size={16} />
          </button>
        </div>
      </div>

      {/* Day of Week Headers */}
      <div className="grid grid-cols-7 text-center text-[10px] text-zinc-400 font-semibold mb-1">
        <span>Su</span>
        <span>Mo</span>
        <span>Tu</span>
        <span>We</span>
        <span>Th</span>
        <span>Fr</span>
        <span>Sa</span>
      </div>

      {/* Calendar Days Grid */}
      <div className="grid grid-cols-7 gap-1 text-center text-xs">
        {/* Leading blanks */}
        {Array.from({ length: firstDayIndex }).map((_, i) => (
          <div key={`blank-${i}`} className="h-7" />
        ))}

        {/* Days */}
        {Array.from({ length: daysInMonth }).map((_, i) => {
          const dayNum = i + 1;
          const today = isToday(dayNum);
          return (
            <div
              key={dayNum}
              className={`h-7 w-7 mx-auto flex items-center justify-center rounded-sm transition-colors text-xs ${
                today
                  ? 'bg-blue-600 text-white font-bold ring-2 ring-blue-400'
                  : 'hover:bg-zinc-700/60 text-zinc-200'
              }`}
            >
              {dayNum}
            </div>
          );
        })}
      </div>
    </div>
  );
};
