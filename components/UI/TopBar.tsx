
import React from 'react';
import { Player } from '../../types';

interface TopBarProps {
  player: Player;
  onOpenShop: () => void;
  onOpenMinions: () => void;
}

const TopBar: React.FC<TopBarProps> = ({ player, onOpenShop, onOpenMinions }) => {
  return (
    <div className="absolute top-0 left-0 w-full p-4 flex flex-col md:flex-row items-center justify-between pointer-events-none gap-4 z-20">
      <div className="flex gap-3 pointer-events-auto w-full md:w-auto">
        <button onClick={onOpenShop} className="bg-gradient-to-b from-yellow-400 to-yellow-600 hover:from-yellow-300 hover:to-yellow-500 text-white font-black py-2.5 px-8 rounded-2xl shadow-xl border-b-4 border-yellow-800 transition-all active:translate-y-1 active:border-b-0">
          🛒 المتجر
        </button>
        <button onClick={onOpenMinions} className="bg-gradient-to-b from-blue-400 to-blue-600 hover:from-blue-300 hover:to-blue-500 text-white font-black py-2.5 px-8 rounded-2xl shadow-xl border-b-4 border-blue-800 transition-all active:translate-y-1 active:border-b-0">
          👥 الجيش
        </button>
      </div>

      <div className="flex flex-wrap items-center justify-center gap-6 bg-black/60 backdrop-blur-xl px-6 py-4 rounded-[2rem] border-2 border-white/10 pointer-events-auto shadow-2xl">
        <ResourceItem icon="🪵" label="خشب" value={player.inventory.wood} color="text-amber-200" />
        <ResourceItem icon="🪨" label="حجر" value={player.inventory.stone} color="text-gray-300" />
        <ResourceItem icon="🥩" label="لحم" value={player.inventory.meat} color="text-red-300" />
        <ResourceItem icon="🥕" label="جزر" value={player.inventory.carrots} color="text-orange-300" />
        <div className="h-8 w-0.5 bg-white/20 mx-2" />
        <ResourceItem icon="💰" label="ذهب" value={player.gold} color="text-yellow-400 font-black text-lg" />
      </div>

      <div className="flex flex-col gap-2 w-full md:w-72 pointer-events-auto">
        <div className="relative h-8 bg-black/40 rounded-xl overflow-hidden border-2 border-white/10 shadow-inner group">
          <div 
            className="h-full bg-gradient-to-r from-red-600 via-red-500 to-red-400 transition-all duration-500" 
            style={{ width: `${(player.health / player.maxHealth) * 100}%` }}
          />
          <span className="absolute inset-0 flex items-center justify-center text-xs text-white font-black drop-shadow-lg tracking-wider">
            ❤️ {Math.ceil(player.health)} / {player.maxHealth}
          </span>
        </div>
        <div className="relative h-8 bg-black/40 rounded-xl overflow-hidden border-2 border-white/10 shadow-inner">
          <div 
            className="h-full bg-gradient-to-r from-orange-600 via-orange-500 to-orange-400 transition-all duration-500" 
            style={{ width: `${(player.hunger / player.maxHunger) * 100}%` }}
          />
          <span className="absolute inset-0 flex items-center justify-center text-xs text-white font-black drop-shadow-lg tracking-wider">
            🍗 {player.hunger} / {player.maxHunger}
          </span>
        </div>
      </div>
    </div>
  );
};

const ResourceItem: React.FC<{ icon: string, label: string, value: number, color: string }> = ({ icon, label, value, color }) => (
  <div className="flex flex-col items-center group transition-transform hover:scale-110">
    <span className="text-2xl mb-1">{icon}</span>
    <span className={`text-sm font-black ${color}`}>{value}</span>
  </div>
);

export default TopBar;
