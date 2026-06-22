import React from 'react';
import { Play, Settings, Trophy, ShoppingCart } from 'lucide-react';
import { useGameStore } from '../store/useGameStore';

const MainMenu: React.FC = () => {
  const { setGameState } = useGameStore();

  return (
    <div className="flex-center fade-in" style={{ width: '100%', height: '100%', flexDirection: 'column' }}>
      <div className="glass-panel" style={{ padding: '60px 80px', textAlign: 'center', display: 'flex', flexDirection: 'column', gap: '40px', minWidth: '400px' }}>
        
        <div className="animate-float">
          <h1 className="text-gradient" style={{ fontSize: '3.5rem', marginBottom: '8px', letterSpacing: '6px' }}>SNAKE HUNGER</h1>
          <h3 style={{ letterSpacing: '10px', color: 'rgba(255,255,255,0.5)', fontSize: '1rem' }}>ANTIGRAVITY ADVENTURE</h3>
        </div>

        <div style={{ display: 'flex', flexDirection: 'column', gap: '20px', marginTop: '20px' }}>
          <button className="btn btn-primary animate-pulse" onClick={() => setGameState('playing')} style={{ padding: '20px' }}>
            <Play size={24} /> START GAME
          </button>
          
          <button className="btn btn-secondary" onClick={() => setGameState('shop')}>
            <ShoppingCart size={20} /> SHOP
          </button>

          <button className="btn btn-secondary" onClick={() => setGameState('achievements')}>
            <Trophy size={20} /> ACHIEVEMENTS
          </button>

          <button className="btn btn-secondary" onClick={() => setGameState('settings')}>
            <Settings size={20} /> SETTINGS
          </button>
        </div>
      </div>
    </div>
  );
};

export default MainMenu;
