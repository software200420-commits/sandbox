
export const WORLD_WIDTH = 2000;
export const WORLD_HEIGHT = 2000;
export const PLAYER_SPEED = 2; // تم تقليل السرعة للنصف
export const HORSE_SPEED_MULTIPLIER = 2;
export const ATTACK_COOLDOWN = 1000;
export const HUNGER_DECAY_INTERVAL = 10000; // 10 seconds
export const HUNGER_LOSS_HEALTH_DECAY = 2000; 
export const GROWTH_TIME = 15000; // 15 seconds
export const VIEW_DISTANCE = 300; // Distance to start chasing

export const PRICING = {
  WOOD: { sell: 10, buy: 15 },
  STONE: { sell: 15, buy: 23 },
  MEAT: { sell: 20, buy: 30 },
  CARROT: { sell: 12, buy: 18 },
  SEED: { buy: 5 },
  HORSE: { buy: 500 },
  SWORD: { buy: 200 },
  ARMOR: { buy: 250 },
  WALL: { buy: 50 },
  GATE: { buy: 150 }
};

export const INITIAL_PLAYER_STATS = {
  health: 100,
  hunger: 20,
  gold: 50,
  damage: 20, // تم التأكيد على أن ضرر اللاعب 20
  minionDamage: 10
};
