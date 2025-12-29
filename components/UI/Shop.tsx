
import React from 'react';
import { Player, GameState } from '../../types';
import { PRICING } from '../../constants';

interface ShopProps {
  player: Player;
  setGameState: React.Dispatch<React.SetStateAction<GameState>>;
  onClose: () => void;
}

const Shop: React.FC<ShopProps> = ({ player, setGameState, onClose }) => {
  const buy = (item: keyof typeof PRICING | 'SEED' | 'HORSE' | 'SWORD' | 'ARMOR', price: number) => {
    if (player.gold >= price) {
      setGameState(prev => {
        const p = { ...prev.player };
        p.gold -= price;
        if (item === 'SEED') p.inventory.seeds += 5;
        if (item === 'HORSE') p.inventory.horse = true;
        if (item === 'SWORD') p.inventory.swordLevel++;
        if (item === 'ARMOR') {
          p.inventory.armorLevel++;
          p.maxHealth += 50;
          p.health += 50;
        }
        return { ...prev, player: p };
      });
    }
  };

  const sell = (item: 'wood' | 'stone' | 'meat' | 'carrots', price: number) => {
    if (player.inventory[item] > 0) {
      setGameState(prev => {
        const p = { ...prev.player };
        p.inventory[item]--;
        p.gold += price;
        return { ...prev, player: p };
      });
    }
  };

  const sellAll = () => {
    setGameState(prev => {
      const p = { ...prev.player };
      const woodGold = p.inventory.wood * PRICING.WOOD.sell;
      const stoneGold = p.inventory.stone * PRICING.STONE.sell;
      const meatGold = p.inventory.meat * PRICING.MEAT.sell;
      const carrotGold = p.inventory.carrots * PRICING.CARROT.sell;
      
      p.gold += (woodGold + stoneGold + meatGold + carrotGold);
      p.inventory.wood = 0;
      p.inventory.stone = 0;
      p.inventory.meat = 0;
      p.inventory.carrots = 0;
      
      return { ...prev, player: p };
    });
  };

  return (
    <div className="absolute inset-0 z-40 bg-black/60 backdrop-blur-sm flex items-center justify-center p-4">
      <div className="bg-[#3e2723] w-full max-w-2xl rounded-3xl border-4 border-[#5d4037] shadow-2xl flex flex-col h-[85vh] overflow-hidden">
        <div className="bg-[#5d4037] p-6 flex justify-between items-center text-white">
          <h2 className="text-3xl font-bold italic">🛒 المتجر الملكي</h2>
          <button onClick={onClose} className="text-4xl hover:text-red-400 transition-colors leading-none">&times;</button>
        </div>
        
        <div className="flex-1 overflow-y-auto p-6 space-y-8 bg-[#efdcd0]">
          {/* Buying Equipment */}
          <section>
            <h3 className="text-xl font-bold mb-4 text-[#3e2723] border-b-2 border-[#3e2723]/20 pb-2">⚔️ معدات قتالية</h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <ShopAction name="ترقية السيف" price={PRICING.SWORD.buy} icon="🗡️" onAction={() => buy('SWORD', PRICING.SWORD.buy)} disabled={player.gold < PRICING.SWORD.buy} />
              <ShopAction name="درع قوي" price={PRICING.ARMOR.buy} icon="🛡️" onAction={() => buy('ARMOR', PRICING.ARMOR.buy)} disabled={player.gold < PRICING.ARMOR.buy} />
              {!player.inventory.horse && <ShopAction name="حصان سريع" price={PRICING.HORSE.buy} icon="🐎" onAction={() => buy('HORSE', PRICING.HORSE.buy)} disabled={player.gold < PRICING.HORSE.buy} />}
            </div>
          </section>

          {/* Buying Consumables */}
          <section>
            <h3 className="text-xl font-bold mb-4 text-[#3e2723] border-b-2 border-[#3e2723]/20 pb-2">🌱 بذور ومؤن</h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <ShopAction name="بذور جزر (x5)" price={PRICING.SEED.buy} icon="🌾" onAction={() => buy('SEED', PRICING.SEED.buy)} disabled={player.gold < PRICING.SEED.buy} />
            </div>
          </section>

          {/* Selling Resources */}
          <section>
            <div className="flex justify-between items-center mb-4 border-b-2 border-[#3e2723]/20 pb-2">
              <h3 className="text-xl font-bold text-[#3e2723]">💰 بيع الموارد والمنتجات</h3>
              <button 
                onClick={sellAll}
                className="bg-green-700 hover:bg-green-600 text-white px-4 py-1 rounded-lg text-sm font-bold shadow-md transition-all active:scale-95"
              >
                بيع كل المحصول 🧺
              </button>
            </div>
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
              <SellAction name="خشب" price={PRICING.WOOD.sell} amount={player.inventory.wood} icon="🪵" onAction={() => sell('wood', PRICING.WOOD.sell)} disabled={player.inventory.wood <= 0} />
              <SellAction name="حجر" price={PRICING.STONE.sell} amount={player.inventory.stone} icon="🪨" onAction={() => sell('stone', PRICING.STONE.sell)} disabled={player.inventory.stone <= 0} />
              <SellAction name="لحم" price={PRICING.MEAT.sell} amount={player.inventory.meat} icon="🥩" onAction={() => sell('meat', PRICING.MEAT.sell)} disabled={player.inventory.meat <= 0} />
              <SellAction name="جزر" price={PRICING.CARROT.sell} amount={player.inventory.carrots} icon="🥕" onAction={() => sell('carrots', PRICING.CARROT.sell)} disabled={player.inventory.carrots <= 0} />
            </div>
          </section>
        </div>

        <div className="p-4 bg-[#5d4037] text-white flex justify-between items-center px-10 text-xl font-bold">
          <div className="flex items-center gap-2">
            <span>رصيدك الحالي:</span>
            <span className="text-yellow-400">{player.gold} 💰</span>
          </div>
          <div className="text-sm opacity-80">نصيحة: بَع المحاصيل لتطوير عتادك</div>
        </div>
      </div>
    </div>
  );
};

const ShopAction: React.FC<{ name: string, price: number, icon: string, onAction: () => void, disabled: boolean }> = ({ name, price, icon, onAction, disabled }) => (
  <button 
    onClick={onAction} 
    disabled={disabled}
    className="flex items-center justify-between p-4 bg-white rounded-xl shadow hover:shadow-md transition-all active:scale-95 disabled:opacity-50 border-b-4 border-gray-200"
  >
    <div className="flex items-center gap-3">
      <span className="text-2xl">{icon}</span>
      <span className="font-bold text-gray-800">{name}</span>
    </div>
    <span className="text-yellow-600 font-bold">{price} ذهب</span>
  </button>
);

const SellAction: React.FC<{ name: string, price: number, amount: number, icon: string, onAction: () => void, disabled: boolean }> = ({ name, price, amount, icon, onAction, disabled }) => (
  <button 
    onClick={onAction} 
    disabled={disabled}
    className="flex flex-col items-center justify-center p-4 bg-white rounded-xl shadow hover:shadow-md transition-all active:scale-95 disabled:opacity-50 border-b-4 border-gray-200"
  >
    <span className="text-3xl mb-1">{icon}</span>
    <span className="text-xs font-bold text-gray-500 mb-1">{name} ({amount})</span>
    <span className="text-green-600 font-bold text-sm">+{price} 💰</span>
  </button>
);

export default Shop;
