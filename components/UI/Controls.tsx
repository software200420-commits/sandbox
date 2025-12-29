
import React, { useState } from 'react';

interface ControlsProps {
  onDirChange: (dir: string | null) => void;
  onAction: () => void;
  onRide: () => void;
}

const Controls: React.FC<ControlsProps> = ({ onDirChange, onAction, onRide }) => {
  const [activeDir, setActiveDir] = useState<string | null>(null);

  const handleDirStart = (dir: string) => {
    setActiveDir(dir);
    onDirChange(dir);
  };

  const handleDirEnd = () => {
    setActiveDir(null);
    onDirChange(null);
  };

  return (
    <div className="absolute bottom-10 left-0 w-full px-10 flex flex-row-reverse items-end justify-between pointer-events-none z-30">
      {/* أزرار الحركة أصبحت على اليمين الآن بفضل flex-row-reverse */}
      <div className="flex flex-col items-center gap-3 pointer-events-auto">
        <div className="grid grid-cols-3 gap-3">
          <div />
          <ControlButton icon="▲" active={activeDir === 'up'} onTouchStart={() => handleDirStart('up')} onTouchEnd={handleDirEnd} />
          <div />
          
          <ControlButton icon="◀" active={activeDir === 'left'} onTouchStart={() => handleDirStart('left')} onTouchEnd={handleDirEnd} />
          <div className="w-16 h-16 bg-white/10 rounded-full border-2 border-white/20" />
          <ControlButton icon="▶" active={activeDir === 'right'} onTouchStart={() => handleDirStart('right')} onTouchEnd={handleDirEnd} />
          
          <div />
          <ControlButton icon="▼" active={activeDir === 'down'} onTouchStart={() => handleDirStart('down')} onTouchEnd={handleDirEnd} />
          <div />
        </div>
      </div>

      {/* أزرار الأكشن (الهجوم والركوب) أصبحت على اليسار الآن */}
      <div className="flex flex-col gap-6 pointer-events-auto items-center">
        <button 
          onClick={onRide}
          className="w-20 h-20 bg-gradient-to-br from-blue-500 to-blue-800 text-white rounded-full border-4 border-white/30 shadow-2xl active:scale-90 transition-all flex items-center justify-center text-4xl"
        >
          🐎
        </button>
        <button 
          onClick={onAction}
          className="w-32 h-32 bg-gradient-to-br from-red-500 to-red-800 text-white rounded-full border-8 border-white/20 shadow-2xl active:scale-75 transition-all flex items-center justify-center text-5xl group"
        >
          <span className="group-active:rotate-45 transition-transform">⚔️</span>
        </button>
      </div>
    </div>
  );
};

const ControlButton: React.FC<{ icon: string, active: boolean, onTouchStart: () => void, onTouchEnd: () => void }> = ({ icon, active, onTouchStart, onTouchEnd }) => (
  <button 
    onMouseDown={(e) => { e.preventDefault(); onTouchStart(); }}
    onMouseUp={(e) => { e.preventDefault(); onTouchEnd(); }}
    onMouseLeave={(e) => { e.preventDefault(); onTouchEnd(); }}
    onTouchStart={(e) => { e.preventDefault(); onTouchStart(); }}
    onTouchEnd={(e) => { e.preventDefault(); onTouchEnd(); }}
    className={`w-16 h-16 rounded-3xl flex items-center justify-center text-3xl font-black transition-all shadow-2xl backdrop-blur-md ${active ? 'bg-white/90 text-black scale-90 translate-y-1' : 'bg-black/50 text-white border-2 border-white/20'}`}
  >
    {icon}
  </button>
);

export default Controls;
