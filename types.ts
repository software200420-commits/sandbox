
export enum EntityType {
  TREE = 'TREE',
  ROCK = 'ROCK',
  CHICKEN = 'CHICKEN',
  SHEEP = 'SHEEP',
  WOLF = 'WOLF',
  BEAR = 'BEAR',
  BANDIT = 'BANDIT',
  MINION_CANDIDATE = 'MINION_CANDIDATE', // Potential slave
  MINION = 'MINION',
  CARROT_PLANT = 'CARROT_PLANT',
  TILL_SPOT = 'TILL_SPOT',
  WALL = 'WALL',
  GATE = 'GATE'
}

export enum MinionTask {
  FOLLOW = 'FOLLOW',
  FARM = 'FARM',
  GATHER = 'GATHER',
  DEFEND = 'DEFEND'
}

export interface Position {
  x: number;
  y: number;
}

export interface Entity {
  id: string;
  type: EntityType;
  position: Position;
  health: number;
  maxHealth: number;
  state: 'idle' | 'moving' | 'attacking' | 'harvesting' | 'growing' | 'open' | 'closed';
  targetPos?: Position;
  lastMoveTime: number;
  waitDuration: number;
  growthStage?: number; // For carrots
  lastAttackTime?: number;
  ownerId?: string; // For minions
  task?: MinionTask;
  speed: number;
  isGateOpen?: boolean;
}

export interface Player {
  position: Position;
  health: number;
  maxHealth: number;
  hunger: number;
  maxHunger: number;
  gold: number;
  level: number;
  experience: number;
  inventory: {
    wood: number;
    stone: number;
    meat: number;
    carrots: number;
    seeds: number;
    walls: number;
    gates: number;
    horse: boolean;
    swordLevel: number;
    armorLevel: number;
  };
}

export interface GameState {
  player: Player;
  entities: Entity[];
  worldSize: { width: number; height: number };
  isGameOver: boolean;
  score: number;
}
