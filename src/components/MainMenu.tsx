import React from 'react';
import { Play, Settings, Trophy, ShoppingCart } from 'lucide-react';
import { useGameStore } from '../store/useGameStore';
import { usePlayerStore } from '../store/usePlayerStore';

const MainMenu: React.FC = () => {
  const { setGameState } = useGameStore();
  const { nickname = 'ASTRONAUT', setNickname } = usePlayerStore();

  return (
    <div className="flex-center fade-in" style={{ width: '100%', height: '100%', flexDirection: 'column' }}>
      <div className="glass-panel" style={{ padding: '40px 60px', textAlign: 'center', display: 'flex', flexDirection: 'column', gap: '24px', minWidth: '400px' }}>
        
        <div className="animate-float">
          <h1 className="text-gradient" style={{ fontSize: '3.5rem', marginBottom: '8px', letterSpacing: '6px' }}>SNAKE HUNGER</h1>
          <h3 style={{ letterSpacing: '10px', color: 'rgba(255,255,255,0.5)', fontSize: '1rem' }}>ANTIGRAVITY ADVENTURE</h3>
        </div>

        {/* Nickname Input Field */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: '8px', alignItems: 'center' }}>
          <span style={{ fontSize: '0.8rem', color: 'var(--text-muted)', textTransform: 'uppercase', letterSpacing: '2px', fontWeight: 600 }}>Enter Call Sign</span>
          <input 
            type="text" 
            value={nickname} 
            onChange={(e) => setNickname(e.target.value.toUpperCase().slice(0, 12))}
            placeholder="ASTRONAUT"
            className="glass-panel-hud" 
            style={{ 
              padding: '12px 20px', 
              color: '#ffffff', 
              border: '1px solid var(--border-neon)', 
              backgroundColor: 'rgba(5, 5, 15, 0.4)', 
              outline: 'none', 
              fontSize: '1.1rem', 
              textAlign: 'center', 
              letterSpacing: '2px', 
              width: '100%', 
              maxWidth: '260px',
              fontFamily: 'var(--font-heading)',
              fontWeight: 'bold',
              borderRadius: '12px',
              boxShadow: '0 0 10px rgba(0, 243, 255, 0.1)'
            }} 
          />
        </div>

        <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
          <button 
            className="btn btn-primary animate-pulse" 
            onClick={async () => {
              setGameState('playing');
              
              // Attempt to lock to landscape and go full screen for native mobile feel
              try {
                const docEl = document.documentElement as any;
                if (docEl.requestFullscreen) {
                  await docEl.requestFullscreen();
                } else if (docEl.webkitRequestFullscreen) {
                  await docEl.webkitRequestFullscreen();
                } else if (docEl.mozRequestFullScreen) {
                  await docEl.mozRequestFullScreen();
                } else if (docEl.msRequestFullscreen) {
                  await docEl.msRequestFullscreen();
                }
                
                if (screen.orientation && (screen.orientation as any).lock) {
                  await (screen.orientation as any).lock('landscape');
                }
              } catch (e) {
                console.warn('Orientation lock failed:', e);
              }
            }} 
            style={{ padding: '20px' }}
          >
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
