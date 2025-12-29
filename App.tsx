
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
    minionOpen: false
  });

  const activeKeysRef = useRef<Set<string>>(new Set());
  const requestRef = useRef<number>(0);
  const lastTimeRef = useRef<number>(0);
  const lastHungerDecayRef = useRef<number>(Date.now());
  const lastHealthDecayRef = useRef<number>(Date.now());
  const lastHealthRegenRef = useRef<number>(Date.now());

  const handleInteraction = useCallback(() => {
    setGameState(prev => {
      if (prev.isGameOver) return prev;
      const { player, entities } = prev;
      let newEntities = [...entities];
      let newPlayer = { ...player };
      let hitSomething = false;

      newEntities = newEntities.map(entity => {
        const dist = getDistance(player.position, entity.position);
        if (dist < 75 && entity.health > 0) {
          // منع إلحاق الضرر بالمساعدين (العبيد)
          if (entity.type === EntityType.MINION) {
            return entity;
          }

          hitSomething = true;
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

          if (entity.type === EntityType.CARROT_PLANT && entity.growthStage === 100) {
             newPlayer.inventory.carrots += 1;
             return { ...entity, health: 0 };
          }

          const newHealth = entity.health - damage;
          if (newHealth <= 0) {
            newPlayer.gold += 10;
            if (entity.type === EntityType.CHICKEN) newPlayer.inventory.meat += 2;
            if (entity.type === EntityType.SHEEP) newPlayer.inventory.meat += 5;
            if (entity.type === EntityType.MINION_CANDIDATE) {
               return { 
                 ...entity, 
                 type: EntityType.MINION, 
                 health: 50, 
                 maxHealth: 50, 
                 ownerId: 'player', 
                 task: MinionTask.FOLLOW 
               };
            }
          }
          return { ...entity, health: newHealth };
        }
        return entity;
      }).filter(e => e.health > 0);

      if (!hitSomething && player.inventory.seeds > 0) {
        newPlayer.inventory.seeds -= 1;
        newEntities.push({
          id: Math.random().toString(36).substr(2, 9),
          type: EntityType.CARROT_PLANT,
          position: { ...player.position },
          health: 1,
          maxHealth: 1,
          state: 'growing',
          growthStage: 0,
          lastMoveTime: Date.now(),
          waitDuration: GROWTH_TIME,
          speed: 0
        });
      }

      return { ...prev, player: newPlayer, entities: newEntities };
    });
  }, []);

  useEffect(() => {
    const initialEntities: Entity[] = [];
    const types = [
      EntityType.TREE, EntityType.ROCK, EntityType.CHICKEN, 
      EntityType.SHEEP, EntityType.WOLF, EntityType.BEAR, 
      EntityType.BANDIT, EntityType.MINION_CANDIDATE
    ];

    for (let i = 0; i < 80; i++) {
      const type = types[Math.floor(Math.random() * types.length)];
      const stats = getEntityStats(type);
      initialEntities.push({
        id: Math.random().toString(36).substr(2, 9),
        type,
        position: getRandomPosition(WORLD_WIDTH, WORLD_HEIGHT),
        health: stats.health,
        maxHealth: stats.health,
        state: 'idle',
        lastMoveTime: Date.now(),
        waitDuration: 2000 + Math.random() * 2000,
        speed: stats.speed,
        growthStage: 0
      });
    }

    setGameState(prev => ({ ...prev, entities: initialEntities }));

    const handleKeyDown = (e: KeyboardEvent) => {
      activeKeysRef.current.add(e.key.toLowerCase());
      if (e.key === ' ' || e.key.toLowerCase() === 'e') {
        handleInteraction();
      }
    };
    const handleKeyUp = (e: KeyboardEvent) => activeKeysRef.current.delete(e.key.toLowerCase());

    window.addEventListener('keydown', handleKeyDown);
    window.addEventListener('keyup', handleKeyUp);
    return () => {
      window.removeEventListener('keydown', handleKeyDown);
      window.removeEventListener('keyup', handleKeyUp);
    };
  }, [handleInteraction]);

  const update = (time: number) => {
    lastTimeRef.current = time;

    setGameState(prev => {
      if (prev.isGameOver) return prev;

      let { player, entities } = prev;
      let newPlayer = { ...player };
      let newEntities = [...entities];
      const now = Date.now();

      // Hunger Decay
      if (now - lastHungerDecayRef.current > HUNGER_DECAY_INTERVAL) {
        newPlayer.hunger = Math.max(0, newPlayer.hunger - 1);
        lastHungerDecayRef.current = now;
      }

      // Health Decay (Starvation)
      if (newPlayer.hunger <= 0 && now - lastHealthDecayRef.current > 2000) {
        newPlayer.health = Math.max(0, newPlayer.health - 5);
        lastHealthDecayRef.current = now;
      }

      // Health Regeneration (Buff)
      if (newPlayer.hunger > 15 && now - lastHealthRegenRef.current > 2000) {
        if (newPlayer.health < newPlayer.maxHealth) {
          newPlayer.health = Math.min(newPlayer.maxHealth, newPlayer.health + 10);
        }
        lastHealthRegenRef.current = now;
      }

      if (newPlayer.health <= 0) {
        return { ...prev, isGameOver: true };
      }

      // Movement logic
      let dx = 0, dy = 0;
      const keys = activeKeysRef.current;
      if (keys.has('arrowup') || keys.has('w')) dy -= 1;
      if (keys.has('arrowdown') || keys.has('s')) dy += 1;
      if (keys.has('arrowleft') || keys.has('a')) dx -= 1;
      if (keys.has('arrowright') || keys.has('d')) dx += 1;

      if (dx !== 0 || dy !== 0) {
        const speed = PLAYER_SPEED * (player.inventory.horse ? HORSE_SPEED_MULTIPLIER : 1);
        const length = Math.sqrt(dx * dx + dy * dy);
        newPlayer.position.x = Math.max(0, Math.min(WORLD_WIDTH, player.position.x + (dx / length) * speed));
        newPlayer.position.y = Math.max(0, Math.min(WORLD_HEIGHT, player.position.y + (dy / length) * speed));
      }

      // Entity AI logic
      newEntities = newEntities.map(entity => {
        let nextEntity = { ...entity };

        if (entity.type === EntityType.CARROT_PLANT && entity.growthStage !== undefined && entity.growthStage < 100) {
          const progress = (now - entity.lastMoveTime) / GROWTH_TIME;
          nextEntity.growthStage = Math.min(100, progress * 100);
          return nextEntity;
        }

        const distToPlayer = getDistance(entity.position, player.position);
        const isHostile = [EntityType.WOLF, EntityType.BEAR, EntityType.BANDIT].includes(entity.type);

        if (isHostile && distToPlayer < VIEW_DISTANCE) {
           const angle = Math.atan2(player.position.y - entity.position.y, player.position.x - entity.position.x);
           nextEntity.position.x += Math.cos(angle) * entity.speed;
           nextEntity.position.y += Math.sin(angle) * entity.speed;
           nextEntity.state = 'attacking';

           if (distToPlayer < 45 && (!entity.lastAttackTime || now - entity.lastAttackTime > 2000)) {
              const damage = getEntityStats(entity.type).damage || 0;
              newPlayer.health = Math.max(0, newPlayer.health - (damage * (1 - (player.inventory.armorLevel * 0.15))));
              nextEntity.lastAttackTime = now;
           }
        } else if (entity.type === EntityType.MINION && entity.task === MinionTask.FOLLOW) {
           if (distToPlayer > 80) {
              const angle = Math.atan2(player.position.y - entity.position.y, player.position.x - entity.position.x);
              nextEntity.position.x += Math.cos(angle) * entity.speed;
              nextEntity.position.y += Math.sin(angle) * entity.speed;
           }
        } else if (entity.speed > 0) {
          if (entity.state === 'idle' && now - entity.lastMoveTime > entity.waitDuration) {
            nextEntity.state = 'moving';
            nextEntity.targetPos = getRandomPosition(WORLD_WIDTH, WORLD_HEIGHT);
            nextEntity.lastMoveTime = now;
          } else if (entity.state === 'moving' && entity.targetPos) {
            const d = getDistance(entity.position, entity.targetPos);
            if (d < 5) {
              nextEntity.state = 'idle';
              nextEntity.lastMoveTime = now;
              nextEntity.waitDuration = 2000 + Math.random() * 3000;
            } else {
              const angle = Math.atan2(entity.targetPos.y - entity.position.y, entity.targetPos.x - entity.position.x);
              nextEntity.position.x += Math.cos(angle) * entity.speed;
              nextEntity.position.y += Math.sin(angle) * entity.speed;
            }
          }
        }
        return nextEntity;
      });

      return { ...prev, player: newPlayer, entities: newEntities };
    });

    requestRef.current = requestAnimationFrame(update);
  };

  useEffect(() => {
    requestRef.current = requestAnimationFrame(update);
    return () => cancelAnimationFrame(requestRef.current!);
  }, []);

  const handleRestart = () => {
    window.location.reload();
  };

  const handleEat = (type: 'meat' | 'carrot') => {
    setGameState(prev => {
      const p = { ...prev.player };
      if (type === 'meat' && p.inventory.meat > 0) {
        p.inventory.meat--;
        p.hunger = Math.min(p.maxHunger, p.hunger + 8);
        p.health = Math.min(p.maxHealth, p.health + 15);
      } else if (type === 'carrot' && p.inventory.carrots > 0) {
        p.inventory.carrots--;
        p.hunger = Math.min(p.maxHunger, p.hunger + 5);
        p.health = Math.min(p.maxHealth, p.health + 10);
      }
      return { ...prev, player: p };
    });
  };

  return (
    <div className="relative w-full h-full bg-[#2d5a27] overflow-hidden select-none touch-none">
      <GameCanvas gameState={gameState} />

      {/* العلامة المائية - Instagram Watermark */}
      <div className="fixed bottom-4 left-4 z-[100] pointer-events-none select-none opacity-40 hover:opacity-100 transition-opacity">
        <div className="flex flex-col items-start bg-black/40 backdrop-blur-md px-4 py-2 rounded-2xl border border-white/10 shadow-lg">
          <span className="text-[10px] text-white font-bold tracking-widest uppercase opacity-70">Creator</span>
          <span className="text-yellow-400 text-sm font-black flex items-center gap-2">
            📸 @kl_h5
          </span>
        </div>
      </div>

      <TopBar 
        player={gameState.player} 
        onOpenShop={() => setUiState(s => ({ ...s, shopOpen: true }))} 
        onOpenMinions={() => setUiState(s => ({ ...s, minionOpen: true }))} 
      />
      
      <div className="absolute top-24 right-4 flex flex-col gap-3 pointer-events-auto z-10">
        <button onClick={() => handleEat('meat')} className="bg-orange-600 text-white px-4 py-3 rounded-2xl shadow-lg text-sm border-b-4 border-orange-800 disabled:opacity-50 active:translate-y-1 transition-all" disabled={gameState.player.inventory.meat === 0}>
          🍖 لحم ({gameState.player.inventory.meat})
        </button>
        <button onClick={() => handleEat('carrot')} className="bg-orange-400 text-white px-4 py-3 rounded-2xl shadow-lg text-sm border-b-4 border-orange-700 disabled:opacity-50 active:translate-y-1 transition-all" disabled={gameState.player.inventory.carrots === 0}>
          🥕 جزر ({gameState.player.inventory.carrots})
        </button>
      </div>

      <Controls 
        onAction={handleInteraction} 
        onDirChange={(dir) => {
          const keys = ['arrowup', 'arrowdown', 'arrowleft', 'arrowright'];
          keys.forEach(k => activeKeysRef.current.delete(k));
          if (dir === 'up') activeKeysRef.current.add('arrowup');
          if (dir === 'down') activeKeysRef.current.add('arrowdown');
          if (dir === 'left') activeKeysRef.current.add('arrowleft');
          if (dir === 'right') activeKeysRef.current.add('arrowright');
        }} 
        onRide={() => {}} 
      />

      {uiState.shopOpen && <Shop player={gameState.player} setGameState={setGameState} onClose={() => setUiState(s => ({ ...s, shopOpen: false }))} />}
      {uiState.minionOpen && (
        <MinionManager 
          minions={gameState.entities.filter(e => e.type === EntityType.MINION)} 
          setGameState={setGameState} 
          onClose={() => setUiState(s => ({ ...s, minionOpen: false }))} 
        />
      )}

      {gameState.isGameOver && (
        <div className="absolute inset-0 z-50 bg-black/80 flex flex-col items-center justify-center text-white p-4">
          <h1 className="text-6xl font-black mb-8 text-red-500 drop-shadow-lg">انتهت اللعبة</h1>
          <button 
            onClick={handleRestart}
            className="bg-white text-black px-12 py-4 rounded-full font-black text-2xl hover:scale-110 transition-transform shadow-[0_0_30px_rgba(255,255,255,0.3)]"
          >
            إعادة المحاولة
          </button>
        </div>
      )}
    </div>
  );
};

export default App;
