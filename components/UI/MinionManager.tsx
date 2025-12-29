
import React from 'react';
import { Entity, MinionTask, GameState } from '../../types';

interface MinionManagerProps {
  minions: Entity[];
  setGameState: React.Dispatch<React.SetStateAction<GameState>>;
  onClose: () => void;
}

const MinionManager: React.FC<MinionManagerProps> = ({ minions, setGameState, onClose }) => {
  const setTask = (id: string, task: MinionTask) => {
    setGameState(prev => ({
      ...prev,
      entities: prev.entities.map(e => e.id === id ? { ...e, task } : e)
    }));
  };

  return (
    <div className="absolute inset-0 z-40 bg-black/60 backdrop-blur-sm flex items-center justify-center p-4">
      <div className="bg-[#1a237e] w-full max-w-2xl rounded-3xl border-4 border-[#283593] shadow-2xl flex flex-col h-[70vh] overflow-hidden">
        <div className="bg-[#283593] p-6 flex justify-between items-center text-white">
          <h2 className="text-3xl font-bold">👥 إدارة المساعدين</h2>
          <button onClick={onClose} className="text-4xl leading-none">&times;</button>
        </div>

        <div className="flex-1 overflow-y-auto p-6 bg-[#e8eaf6]">
          {minions.length === 0 ? (
            <div className="text-center py-20 text-gray-500 italic">
              ليس لديك مساعدون بعد. اهزم الأعداء لتحويلهم لصفك!
            </div>
          ) : (
            <div className="grid grid-cols-1 gap-4">
              {minions.map(minion => (
                <div key={minion.id} className="bg-white p-4 rounded-xl shadow-md border border-gray-200 flex flex-col md:flex-row items-center justify-between gap-4">
                  <div className="flex items-center gap-4">
                    <div className="w-12 h-12 bg-green-100 rounded-full flex items-center justify-center text-2xl">👤</div>
                    <div>
                      <h4 className="font-bold text-gray-800">مساعد #{minion.id.slice(0, 4)}</h4>
                      <p className="text-xs text-gray-500">الحالة: {minion.task === MinionTask.FOLLOW ? 'يتبعك' : 'يعمل'}</p>
                    </div>
                  </div>
                  
                  <div className="flex flex-wrap gap-2">
                    <TaskButton active={minion.task === MinionTask.FOLLOW} label="لحاق" onClick={() => setTask(minion.id, MinionTask.FOLLOW)} />
                    <TaskButton active={minion.task === MinionTask.FARM} label="زراعة" onClick={() => setTask(minion.id, MinionTask.FARM)} />
                    <TaskButton active={minion.task === MinionTask.GATHER} label="جمع" onClick={() => setTask(minion.id, MinionTask.GATHER)} />
                    <TaskButton active={minion.task === MinionTask.DEFEND} label="دفاع" onClick={() => setTask(minion.id, MinionTask.DEFEND)} />
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

const TaskButton: React.FC<{ active: boolean, label: string, onClick: () => void }> = ({ active, label, onClick }) => (
  <button 
    onClick={onClick}
    className={`px-4 py-2 rounded-lg font-bold text-sm transition-all ${active ? 'bg-blue-600 text-white shadow-inner' : 'bg-gray-100 text-gray-600 hover:bg-gray-200'}`}
  >
    {label}
  </button>
);

export default MinionManager;
