
import { Position, Entity, EntityType } from '../types';

export const getDistance = (p1: Position, p2: Position): number => {
  return Math.sqrt(Math.pow(p2.x - p1.x, 2) + Math.pow(p2.y - p1.y, 2));
};

export const getRandomPosition = (width: number, height: number): Position => ({
  x: Math.random() * width,
  y: Math.random() * height
});

export const lerp = (start: number, end: number, amt: number) => {
  return (1 - amt) * start + amt * end;
};

export const getEntityStats = (type: EntityType) => {
  switch (type) {
    case EntityType.WOLF: return { health: 40, damage: 5, speed: 1.25 }; 
    case EntityType.BEAR: return { health: 40, damage: 5, speed: 0.75 }; 
    case EntityType.BANDIT: return { health: 40, damage: 5, speed: 1.1 }; 
    case EntityType.MINION_CANDIDATE: return { health: 40, damage: 5, speed: 1.0 }; 
    case EntityType.CHICKEN: return { health: 20, meat: 2, speed: 0.9 }; 
    case EntityType.SHEEP: return { health: 40, meat: 5, speed: 0.6 }; 
    case EntityType.ROCK: return { health: 3, speed: 0 };
    case EntityType.TREE: return { health: 5, speed: 0 };
    case EntityType.WALL: return { health: 100, speed: 0 };
    case EntityType.GATE: return { health: 150, speed: 0 };
    default: return { health: 100, damage: 0, speed: 0.5 };
  }
};
