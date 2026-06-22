import { create } from 'zustand';

export type GameState = 'menu' | 'playing' | 'paused' | 'gameover' | 'shop' | 'settings' | 'achievements';

interface GameStore {
  gameState: GameState;
  score: number;
  level: number;
  activePowerups: string[];
  
  setGameState: (state: GameState) => void;
  setScore: (score: number) => void;
  addScore: (amount: number) => void;
  setLevel: (level: number) => void;
  addPowerup: (powerup: string) => void;
  removePowerup: (powerup: string) => void;
  resetGame: () => void;
}

export const useGameStore = create<GameStore>((set) => ({
  gameState: 'menu',
  score: 0,
  level: 1,
  activePowerups: [],
  
  setGameState: (state) => set({ gameState: state }),
  setScore: (score) => set({ score }),
  addScore: (amount) => set((state) => ({ score: state.score + amount })),
  setLevel: (level) => set({ level }),
  addPowerup: (powerup) => set((state) => ({ activePowerups: [...state.activePowerups, powerup] })),
  removePowerup: (powerup) => set((state) => ({ activePowerups: state.activePowerups.filter(p => p !== powerup) })),
  resetGame: () => set({ score: 0, level: 1, activePowerups: [], gameState: 'playing' }),
}));
