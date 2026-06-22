import React, { useEffect, useRef } from 'react';
import { useGameStore } from '../store/useGameStore';
import { Game } from '../engine/Game';

const GameCanvas: React.FC = () => {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const gameRef = useRef<Game | null>(null);
  const { gameState } = useGameStore();

  useEffect(() => {
    if (!canvasRef.current) return;

    // Initialize Game Engine
    if (!gameRef.current) {
      gameRef.current = new Game(canvasRef.current);
    }

    // Start/Stop engine based on game state
    if (gameState === 'playing') {
      gameRef.current.start();
    } else if (gameState === 'paused' || gameState === 'gameover' || gameState === 'menu') {
      // Just stop the update loop, but maybe we want to render the menu background?
      // Let's have the game engine handle its own state internally too, or just pause updates.
      if (gameState === 'menu') {
         gameRef.current.startMenuBackground();
      } else {
         gameRef.current.pause();
      }
    }

    return () => {
      // Cleanup on unmount (though GameCanvas shouldn't unmount)
      gameRef.current?.destroy();
    };
  }, [gameState]);

  return (
    <canvas 
      ref={canvasRef} 
      className="game-canvas"
    />
  );
};

export default GameCanvas;
