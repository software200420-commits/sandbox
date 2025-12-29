
import React, { useState, useEffect, useCallback, useRef } from 'react';
import { Entity, EntityType, Player, GameState, MinionTask, Position } from './types';
import { 
  WORLD_WIDTH, 
  WORLD_HEIGHT, 
  PLAYER_SPEED, 
  HORSE_SPEED_MULTIPLIER, 
  INITIAL_PLAYER_STATS, 
  HUNGER_DECAY_INTERVAL,
  VIEW_DISTANCE,
  GROWTH_TIME
} from './constants';
import { getDistance, getRandomPosition, getEntityStats } from './utils/gameLogic';
import TopBar from './components/UI/TopBar';
import Shop from './components/UI/Shop';
import MinionManager from './components/UI/MinionManager';
import Controls from './components/UI/Controls';
import GameCanvas from './components/GameCanvas';

const App: React.FC = () => {
  const [gameState, setGameState] = useState<GameState>({
    player: {
      position: { x: WORLD_WIDTH / 2, y: WORLD_HEIGHT / 2 },
      health: INITIAL_PLAYER_STATS.health,
      maxHealth: INITIAL_PLAYER_STATS.health,
      hunger: INITIAL_PLAYER_STATS.hunger,
      maxHunger: INITIAL_PLAYER_STATS.hunger,
      gold: INITIAL_PLAYER_STATS.gold,
      level: 1,
      experience: 0,
      inventory: {
        wood: 0,
        stone: 0,
        meat: 0,
        carrots: 0,
        seeds: 10,
        walls: 0,
        gates: 0,
        horse: false,
        swordLevel: 0,
        armorLevel: 0
      }
    },
    entities: [],
    worldSize: { width: WORLD_WIDTH, height: WORLD_HEIGHT },
    isGameOver: false,
    score: 0
  });

  const [uiState, setUiState] = useState({
    shopOpen: false,
    minionOpen: false,
    selectedBuild: null as 'wall' | 'gate' | null
  });

  const activeKeysRef = useRef<Set<string>>(new Set());
  const requestRef = useRef<number>(0);
  const lastHungerDecayRef = useRef<number>(Date.now());
  const lastHealthDecayRef = useRef<number>(Date.now());
  const lastHealthRegenRef = useRef<number>(Date.now());

  const handleInteraction = useCallback(() => {
    setGameState(prev => {
      if (prev.isGameOver) return prev;
      const { player, entities } = prev;
      let newEntities = [...entities];
      let newPlayer = { ...player };
      let interacted = false;

      // 1. Interaction with gates or harvesting
      newEntities = newEntities.map(entity => {
        const dist = getDistance(player.position, entity.position);
        if (dist < 75 && entity.health > 0) {
          if (entity.type === EntityType.GATE) {
            interacted = true;
            return { ...entity, isGateOpen: !entity.isGateOpen };
          }
          if (entity.type === EntityType.CARROT_PLANT && entity.growthStage === 100) {
            interacted = true;
            newPlayer.inventory.carrots += 1;
            return { ...entity, health: 0 };
          }
          if (entity.type === EntityType.MINION || entity.type === EntityType.WALL) return entity;

          interacted = true;
          const damage = INITIAL_PLAYER_STATS.damage + (player.inventory.swordLevel * 15);
          if (entity.type === EntityType.ROCK || entity.type === EntityType.TREE) {
             const newHealth = entity.health - 1;
             if (newHealth <= 0) {
               if (entity.type === EntityType.ROCK) newPlayer.inventory.stone += 5;
               if (entity.type === EntityType.TREE) newPlayer.inventory.wood += 5;
               newPlayer.gold += 2;
             }
             return { ...entity, health: newHealth };
          }
          const newHealth = entity.health - damage;
          if (newHealth <= 0) {
            newPlayer.gold += 10;
            if (entity.type === EntityType.CHICKEN) newPlayer.inventory.meat += 2;
            if (entity.type === EntityType.SHEEP) newPlayer.inventory.meat += 5;
            if (entity.type === EntityType.MINION_CANDIDATE) {
               return { ...entity, type: EntityType.MINION, health: 50, ownerId: 'player', task: MinionTask.FOLLOW };
            }
          }
          return { ...entity, health: newHealth };
        }
        return entity;
      }).filter(e => e.health > 0);

      // 2. Building logic
      if (!interacted) {
        const gridX = Math.round(player.position.x / 40) * 40;
        const gridY = Math.round(player.position.y / 40) * 40;
        const isOccupied = entities.some(e => e.position.x === gridX && e.position.y === gridY && e.health > 0);

        if (uiState.selectedBuild === 'wall' && newPlayer.inventory.walls > 0 && !isOccupied) {
          newPlayer.inventory.walls--;
          newEntities.push({
            id: Math.random().toString(36).substr(2, 9),
            type: EntityType.WALL,
            position: { x: gridX, y: gridY },
            health: 100, maxHealth: 100, state: 'idle', lastMoveTime: Date.now(), waitDuration: 0, speed: 0
          });
        } else if (uiState.selectedBuild === 'gate' && newPlayer.inventory.gates > 0 && !isOccupied) {
          newPlayer.inventory.gates--;
          newEntities.push({
            id: Math.random().toString(36).substr(2, 9),
            type: EntityType.GATE,
            position: { x: gridX, y: gridY },
            health: 150, maxHealth: 150, state: 'closed', lastMoveTime: Date.now(), waitDuration: 0, speed: 0, isGateOpen: false
          });
        } else if (player.inventory.seeds > 0) {
          newPlayer.inventory.seeds--;
          newEntities.push({
            id: Math.random().toString(36).substr(2, 9),
            type: EntityType.CARROT_PLANT,
            position: { ...player.position },
            health: 1, maxHealth: 1, state: 'growing', growthStage: 0, lastMoveTime: Date.now(), waitDuration: GROWTH_TIME, speed: 0
          });
        }
      }
      return { ...prev, player: newPlayer, entities: newEntities };
    });
  }, [uiState.selectedBuild]);

  useEffect(() => {
    const initialEntities: Entity[] = [];
    const types = [EntityType.TREE, EntityType.ROCK, EntityType.CHICKEN, EntityType.SHEEP, EntityType.WOLF, EntityType.BEAR, EntityType.BANDIT, EntityType.MINION_CANDIDATE];
    for (let i = 0; i < 60; i++) {
      const type = types[Math.floor(Math.random() * types.length)];
      const stats = getEntityStats(type);
      initialEntities.push({
        id: Math.random().toString(36).substr(2, 9), type, position: getRandomPosition(WORLD_WIDTH, WORLD_HEIGHT),
        health: stats.health, maxHealth: stats.health, state: 'idle', lastMoveTime: Date.now(), waitDuration: 2000 + Math.random() * 2000, speed: stats.speed, growthStage: 0
      });
    }
    setGameState(prev => ({ ...prev, entities: initialEntities }));

    const handleKeyDown = (e: KeyboardEvent) => {
      activeKeysRef.current.add(e.key.toLowerCase());
      if (e.key === ' ' || e.key.toLowerCase() === 'e') handleInteraction();
    };
    const handleKeyUp = (e: KeyboardEvent) => activeKeysRef.current.delete(e.key.toLowerCase());
    window.addEventListener('keydown', handleKeyDown);
    window.addEventListener('keyup', handleKeyUp);
    return () => {
      window.removeEventListener('keydown', handleKeyDown);
      window.removeEventListener('keyup', handleKeyUp);
    };
  }, [handleInteraction]);

  const update = () => {
    setGameState(prev => {
      if (prev.isGameOver) return prev;
      let { player, entities } = prev;
      let newPlayer = { ...player };
      let newEntities = [...entities];
      const now = Date.now();

      if (now - lastHungerDecayRef.current > HUNGER_DECAY_INTERVAL) {
        newPlayer.hunger = Math.max(0, newPlayer.hunger - 1);
        lastHungerDecayRef.current = now;
      }
      if (newPlayer.hunger <= 0 && now - lastHealthDecayRef.current > 2000) {
        newPlayer.health = Math.max(0, newPlayer.health - 5);
        lastHealthDecayRef.current = now;
      }
      if (newPlayer.hunger > 15 && now - lastHealthRegenRef.current > 2000 && newPlayer.health < newPlayer.maxHealth) {
        newPlayer.health = Math.min(newPlayer.maxHealth, newPlayer.health + 10);
        lastHealthRegenRef.current = now;
      }
      if (newPlayer.health <= 0) return { ...prev, isGameOver: true };

      let dx = 0, dy = 0;
      if (activeKeysRef.current.has('arrowup') || activeKeysRef.current.has('w')) dy -= 1;
      if (activeKeysRef.current.has('arrowdown') || activeKeysRef.current.has('s')) dy += 1;
      if (activeKeysRef.current.has('arrowleft') || activeKeysRef.current.has('a')) dx -= 1;
      if (activeKeysRef.current.has('arrowright') || activeKeysRef.current.has('d')) dx += 1;

      if (dx !== 0 || dy !== 0) {
        const speed = PLAYER_SPEED * (player.inventory.horse ? HORSE_SPEED_MULTIPLIER : 1);
        const length = Math.sqrt(dx * dx + dy * dy);
        const nx = player.position.x + (dx / length) * speed;
        const ny = player.position.y + (dy / length) * speed;
        const collision = entities.some(e => (e.type === EntityType.WALL || (e.type === EntityType.GATE && !e.isGateOpen)) && getDistance({x:nx, y:ny}, e.position) < 30);
        if (!collision) {
          newPlayer.position.x = Math.max(0, Math.min(WORLD_WIDTH, nx));
          newPlayer.position.y = Math.max(0, Math.min(WORLD_HEIGHT, ny));
        }
      }

      newEntities = newEntities.map(entity => {
        let next = { ...entity };
        if (entity.type === EntityType.CARROT_PLANT && entity.growthStage !== undefined && entity.growthStage < 100) {
          next.growthStage = Math.min(100, ((now - entity.lastMoveTime) / GROWTH_TIME) * 100);
          return next;
        }
        const dist = getDistance(entity.position, player.position);
        const isHostile = [EntityType.WOLF, EntityType.BEAR, EntityType.BANDIT].includes(entity.type);
        if (isHostile && dist < VIEW_DISTANCE) {
          const angle = Math.atan2(player.position.y - entity.position.y, player.position.x - entity.position.x);
          const mx = Math.cos(angle) * entity.speed;
          const my = Math.sin(angle) * entity.speed;
          const blocked = entities.some(e => (e.type === EntityType.WALL || (e.type === EntityType.GATE && !e.isGateOpen)) && getDistance({x: entity.position.x+mx, y: entity.position.y+my}, e.position) < 35);
          if (!blocked) {
            next.position.x += mx; next.position.y += my;
          } else {
             const wall = entities.find(e => (e.type === EntityType.WALL || (e.type === EntityType.GATE && !e.isGateOpen)) && getDistance(entity.position, e.position) < 45);
             if (wall && (!entity.lastAttackTime || now - entity.lastAttackTime > 1500)) {
                wall.health -= 5; next.lastAttackTime = now;
             }
          }
          if (dist < 45 && (!entity.lastAttackTime || now - entity.lastAttackTime > 2000)) {
            newPlayer.health = Math.max(0, newPlayer.health - (getEntityStats(entity.type).damage! * (1 - player.inventory.armorLevel * 0.15)));
            next.lastAttackTime = now;
          }
        } else if (entity.speed > 0) {
           // Basic wandering...
        }
        return next;
      }).filter(e => e.health > 0);

      return { ...prev, player: newPlayer, entities: newEntities };
    });
    requestRef.current = requestAnimationFrame(update);
  };

  useEffect(() => {
    requestRef.current = requestAnimationFrame(update);
    return () => cancelAnimationFrame(requestRef.current);
  }, []);

  return (
    <div className="relative w-full h-full bg-[#2d5a27] overflow-hidden select-none touch-none">
      <GameCanvas gameState={gameState} />
      
      {/* Watermark */}
      <div className="fixed bottom-4 left-4 z-[100] bg-black/40 backdrop-blur-md px-4 py-2 rounded-2xl border border-white/10 shadow-lg">
        <span className="text-[10px] text-white font-bold tracking-widest uppercase opacity-70">Creator</span>
        <span className="text-yellow-400 text-sm font-black flex items-center gap-2">📸 @kl_h5</span>
      </div>

      <TopBar player={gameState.player} onOpenShop={() => setUiState(s => ({...s, shopOpen: true}))} onOpenMinions={() => setUiState(s => ({...s, minionOpen: true}))} />
      
      {/* Build UI */}
      <div className="absolute top-24 left-4 flex flex-col gap-3 pointer-events-auto z-10">
        <div className="text-white text-[10px] font-bold bg-black/40 px-2 py-1 rounded-md text-center">وضع البناء</div>
        <button onClick={() => setUiState(s => ({...s, selectedBuild: s.selectedBuild === 'wall' ? null : 'wall'}))} className={`px-4 py-3 rounded-2xl shadow-lg border-b-4 transition-all flex flex-col items-center ${uiState.selectedBuild === 'wall' ? 'bg-indigo-600 border-indigo-900 scale-110' : 'bg-indigo-400 border-indigo-700 opacity-80'}`}>
          <span className="text-xl">🧱</span><span className="text-white font-bold text-xs">سور ({gameState.player.inventory.walls})</span>
        </button>
        <button onClick={() => setUiState(s => ({...s, selectedBuild: s.selectedBuild === 'gate' ? null : 'gate'}))} className={`px-4 py-3 rounded-2xl shadow-lg border-b-4 transition-all flex flex-col items-center ${uiState.selectedBuild === 'gate' ? 'bg-indigo-600 border-indigo-900 scale-110' : 'bg-indigo-400 border-indigo-700 opacity-80'}`}>
          <span className="text-xl">🚪</span><span className="text-white font-bold text-xs">بوابة ({gameState.player.inventory.gates})</span>
        </button>
      </div>

      <div className="absolute top-24 right-4 flex flex-col gap-3 pointer-events-auto z-10">
        <button onClick={() => setGameState(prev => { 
          const p = {...prev.player}; 
          if(p.inventory.meat > 0) { p.inventory.meat--; p.hunger = Math.min(p.maxHunger, p.hunger+8); p.health = Math.min(p.maxHealth, p.health+15); }
          return {...prev, player: p};
        })} className="bg-orange-600 text-white px-4 py-3 rounded-2xl shadow-lg text-sm border-b-4 border-orange-800 disabled:opacity-50 active:translate-y-1 transition-all" disabled={gameState.player.inventory.meat === 0}>🥩 لحم ({gameState.player.inventory.meat})</button>
      </div>

      <Controls onAction={handleInteraction} onDirChange={(dir) => {
          ['arrowup', 'arrowdown', 'arrowleft', 'arrowright'].forEach(k => activeKeysRef.current.delete(k));
          if(dir) activeKeysRef.current.add('arrow' + dir);
        }} onRide={() => setGameState(prev => ({...prev, player: {...prev.player, inventory: {...prev.player.inventory, horse: !prev.player.inventory.horse}}}))} />

      {uiState.shopOpen && <Shop player={gameState.player} setGameState={setGameState} onClose={() => setUiState(s => ({...s, shopOpen: false}))} />}
      {uiState.minionOpen && <MinionManager minions={gameState.entities.filter(e => e.type === EntityType.MINION)} setGameState={setGameState} onClose={() => setUiState(s => ({...s, minionOpen: false}))} />}

      {gameState.isGameOver && (
        <div className="absolute inset-0 z-50 bg-black/80 flex flex-col items-center justify-center text-white p-4">
          <h1 className="text-6xl font-black mb-8 text-red-500 drop-shadow-lg italic">انتهت اللعبة</h1>
          <button onClick={() => window.location.reload()} className="bg-white text-black px-12 py-4 rounded-full font-black text-2xl hover:scale-110 transition-transform shadow-[0_0_30px_rgba(255,255,255,0.3)]">إعادة المحاولة</button>
        </div>
      )}
    </div>
  );
};

export default App;
