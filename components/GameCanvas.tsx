
import React, { useRef, useEffect } from 'react';
import { GameState, EntityType } from '../types';

interface GameCanvasProps {
  gameState: GameState;
}

const GameCanvas: React.FC<GameCanvasProps> = ({ gameState }) => {
  const canvasRef = useRef<HTMLCanvasElement>(null);

  useEffect(() => {
    const handleResize = () => {
      if (canvasRef.current) {
        canvasRef.current.width = window.innerWidth;
        canvasRef.current.height = window.innerHeight;
      }
    };
    handleResize();
    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, []);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    const render = () => {
      const { player, entities } = gameState;
      const camX = player.position.x - canvas.width / 2;
      const camY = player.position.y - canvas.height / 2;

      ctx.clearRect(0, 0, canvas.width, canvas.height);

      ctx.fillStyle = '#2d5a27';
      ctx.fillRect(0, 0, canvas.width, canvas.height);

      ctx.fillStyle = '#346b31';
      for (let i = 0; i < 50; i++) {
        const gx = ((i * 313) % 2000) - camX;
        const gy = ((i * 743) % 2000) - camY;
        if (gx > -20 && gx < canvas.width + 20 && gy > -20 && gy < canvas.height + 20) {
           ctx.fillRect(gx, gy, 4, 4);
        }
      }

      const sortedEntities = [...entities].sort((a, b) => a.position.y - b.position.y);
      
      sortedEntities.forEach(entity => {
        const x = entity.position.x - camX;
        const y = entity.position.y - camY;

        if (x < -150 || x > canvas.width + 150 || y < -150 || y > canvas.height + 150) return;

        ctx.save();
        ctx.translate(x, y);

        ctx.fillStyle = 'rgba(0,0,0,0.15)';
        ctx.beginPath(); ctx.ellipse(0, 5, 12, 6, 0, 0, Math.PI * 2); ctx.fill();

        switch (entity.type) {
          case EntityType.TREE:
            ctx.fillStyle = '#4a2c1d';
            ctx.fillRect(-6, 0, 12, 20);
            ctx.fillStyle = '#1e4d1e';
            ctx.beginPath(); ctx.moveTo(0, -45); ctx.lineTo(30, 5); ctx.lineTo(-30, 5); ctx.fill();
            ctx.fillStyle = '#2d5a27';
            ctx.beginPath(); ctx.moveTo(0, -65); ctx.lineTo(25, -20); ctx.lineTo(-25, -20); ctx.fill();
            break;
          case EntityType.ROCK:
            ctx.fillStyle = '#78909c';
            ctx.beginPath(); ctx.arc(0, 0, 18, 0, Math.PI * 2); ctx.fill();
            ctx.fillStyle = '#90a4ae';
            ctx.beginPath(); ctx.arc(-5, -5, 8, 0, Math.PI * 2); ctx.fill();
            break;
          case EntityType.CHICKEN:
            ctx.fillStyle = '#fff'; ctx.fillRect(-6, -6, 12, 12);
            ctx.fillStyle = '#f00'; ctx.fillRect(4, -8, 4, 4);
            break;
          case EntityType.SHEEP:
            ctx.fillStyle = '#fafafa'; ctx.fillRect(-12, -12, 24, 18);
            ctx.fillStyle = '#333'; ctx.fillRect(10, -10, 6, 6);
            break;
          case EntityType.WOLF:
            ctx.fillStyle = '#616161'; ctx.fillRect(-15, -10, 30, 14);
            ctx.fillStyle = '#212121'; ctx.fillRect(12, -12, 8, 8);
            break;
          case EntityType.BEAR:
            ctx.fillStyle = '#4e342e'; ctx.fillRect(-20, -20, 40, 30);
            break;
          case EntityType.BANDIT:
            ctx.fillStyle = '#b71c1c'; ctx.fillRect(-10, -30, 20, 30);
            ctx.fillStyle = '#ffe0b2'; ctx.beginPath(); ctx.arc(0, -38, 9, 0, Math.PI * 2); ctx.fill();
            break;
          case EntityType.MINION_CANDIDATE:
            ctx.fillStyle = '#0d47a1'; ctx.fillRect(-10, -30, 20, 30);
            ctx.fillStyle = '#ffe0b2'; ctx.beginPath(); ctx.arc(0, -38, 9, 0, Math.PI * 2); ctx.fill();
            break;
          case EntityType.MINION:
            ctx.fillStyle = '#2e7d32'; ctx.fillRect(-10, -30, 20, 30);
            ctx.fillStyle = '#ffe0b2'; ctx.beginPath(); ctx.arc(0, -38, 9, 0, Math.PI * 2); ctx.fill();
            ctx.fillStyle = '#fbc02d'; ctx.fillRect(-4, -52, 8, 4);
            break;
          case EntityType.CARROT_PLANT:
            ctx.fillStyle = '#5d4037'; ctx.beginPath(); ctx.ellipse(0, 0, 15, 8, 0, 0, Math.PI*2); ctx.fill();
            if (entity.growthStage !== undefined) {
               const size = (entity.growthStage / 100) * 12;
               ctx.fillStyle = '#fb8c00'; ctx.fillRect(-3, -size, 6, size);
               ctx.fillStyle = '#43a047'; ctx.fillRect(-5, -size - 3, 10, 4);
            }
            break;
          case EntityType.WALL:
            ctx.fillStyle = '#455a64';
            ctx.fillRect(-20, -30, 40, 40);
            ctx.strokeStyle = '#263238'; ctx.lineWidth = 2;
            ctx.strokeRect(-20, -30, 40, 40);
            // تفاصيل الطوب
            ctx.fillStyle = '#546e7a';
            ctx.fillRect(-15, -25, 10, 5); ctx.fillRect(5, -25, 10, 5);
            ctx.fillRect(-15, -15, 30, 5);
            break;
          case EntityType.GATE:
            ctx.fillStyle = '#455a64';
            ctx.fillRect(-20, -40, 8, 50); // عمود أيسر
            ctx.fillRect(12, -40, 8, 50);  // عمود أيمن
            if (entity.isGateOpen) {
              // بوابة مفتوحة (مرسومة جانباً)
              ctx.fillStyle = '#5d4037';
              ctx.fillRect(-12, -35, 4, 35); 
              ctx.fillRect(8, -35, 4, 35);
            } else {
              // بوابة مغلقة
              ctx.fillStyle = '#795548';
              ctx.fillRect(-12, -35, 24, 35);
              ctx.fillStyle = '#3e2723';
              ctx.fillRect(-2, -20, 4, 4); // مقبض
            }
            break;
        }

        if (entity.health < entity.maxHealth && entity.health > 0) {
           ctx.fillStyle = '#212121'; ctx.fillRect(-20, -55, 40, 6);
           ctx.fillStyle = '#ff1744'; ctx.fillRect(-20, -55, 40 * (entity.health / entity.maxHealth), 6);
        }
        ctx.restore();
      });

      ctx.save();
      ctx.translate(canvas.width / 2, canvas.height / 2);
      ctx.fillStyle = 'rgba(0,0,0,0.2)';
      ctx.beginPath(); ctx.ellipse(0, 5, 18, 9, 0, 0, Math.PI*2); ctx.fill();

      if (player.inventory.horse) {
        ctx.fillStyle = '#795548'; ctx.fillRect(-25, -10, 50, 25);
        ctx.fillStyle = '#5d4037'; ctx.fillRect(20, -25, 12, 25);
      }

      ctx.fillStyle = '#1976d2'; ctx.fillRect(-12, -35, 24, 35);
      ctx.fillStyle = '#ffe0b2'; ctx.beginPath(); ctx.arc(0, -45, 12, 0, Math.PI * 2); ctx.fill();
      
      if (player.inventory.swordLevel > 0) {
        ctx.strokeStyle = '#cfd8dc'; ctx.lineWidth = 5;
        ctx.beginPath(); ctx.moveTo(15, -20); ctx.lineTo(40, -35); ctx.stroke();
        ctx.fillStyle = '#fdd835'; ctx.fillRect(12, -22, 6, 8);
      }
      ctx.restore();
    };

    render();
  }, [gameState]);

  return <canvas ref={canvasRef} className="w-full h-full block bg-[#2d5a27]" />;
};

export default GameCanvas;
