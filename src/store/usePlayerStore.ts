import { create } from 'zustand';
import { persist } from 'zustand/middleware';

interface PlayerStore {
  highScore: number;
  coins: number;
  unlockedSkins: string[];
  equippedSkin: string;
  unlockedTrails: string[];
  equippedTrail: string;
  sensitivity: number; // turning responsiveness (1 - 10, default 5)
  nickname: string;
  
  setHighScore: (score: number) => void;
  addCoins: (amount: number) => void;
  spendCoins: (amount: number) => boolean;
  unlockSkin: (skinId: string) => void;
  equipSkin: (skinId: string) => void;
  unlockTrail: (trailId: string) => void;
  equipTrail: (trailId: string) => void;
  setSensitivity: (val: number) => void;
  setNickname: (name: string) => void;
}

export const usePlayerStore = create<PlayerStore>()(
  persist(
    (set, get) => ({
      highScore: 0,
      coins: 0,
      unlockedSkins: ['neon_blue'],
      equippedSkin: 'neon_blue',
      unlockedTrails: ['none'],
      equippedTrail: 'none',
      sensitivity: 5,
      nickname: 'ASTRONAUT',

      setHighScore: (score) => {
        if (score > get().highScore) {
          set({ highScore: score });
        }
      },
      addCoins: (amount) => set((state) => ({ coins: state.coins + amount })),
      spendCoins: (amount) => {
        const state = get();
        if (state.coins >= amount) {
          set({ coins: state.coins - amount });
          return true;
        }
        return false;
      },
      unlockSkin: (skinId) => set((state) => ({ unlockedSkins: [...state.unlockedSkins, skinId] })),
      equipSkin: (skinId) => set({ equippedSkin: skinId }),
      unlockTrail: (trailId) => set((state) => ({ unlockedTrails: [...state.unlockedTrails, trailId] })),
      equipTrail: (trailId) => set({ equippedTrail: trailId }),
      setSensitivity: (val) => set({ sensitivity: val }),
      setNickname: (name) => set({ nickname: name }),
    }),
    {
      name: 'snake-hunger-player-storage',
    }
  )
);
