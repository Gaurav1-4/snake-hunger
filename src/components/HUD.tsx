import React from 'react';
import { useGameStore } from '../store/useGameStore';
import { usePlayerStore } from '../store/usePlayerStore';
import { Shield, Zap, Magnet, Star } from 'lucide-react';

const HUD: React.FC = () => {
  const { score, activePowerups, gameState } = useGameStore();
  const { coins } = usePlayerStore();
  const [leaderboard, setLeaderboard] = React.useState<Array<{ name: string; score: number; isPlayer: boolean }>>([]);

  React.useEffect(() => {
    if (gameState !== 'playing') return;

    const interval = setInterval(() => {
      const game = (window as any).gameInstance;
      if (game && typeof game.getLeaderboard === 'function') {
        setLeaderboard(game.getLeaderboard());
      }
    }, 250);

    return () => clearInterval(interval);
  }, [gameState]);

  if (gameState !== 'playing') return null;

  return (
    <div className="hud-container fade-in" style={{ padding: '24px', pointerEvents: 'none', display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', flex: 1 }}>
      
      {/* Top Left: Stats */}
      <div className="stats-container" style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
        <div className="glass-panel-hud" style={{ padding: '16px 24px', display: 'flex', flexDirection: 'column', gap: '4px' }}>
          <span style={{ fontSize: '0.8rem', color: 'var(--text-muted)', textTransform: 'uppercase', letterSpacing: '2px', fontWeight: 600 }}>Score</span>
          <h2 className="text-neon" style={{ fontSize: '2rem', margin: 0 }}>{score}</h2>
        </div>
        <div className="glass-panel-hud" style={{ padding: '12px 24px', display: 'flex', flexDirection: 'column', gap: '4px' }}>
          <span style={{ fontSize: '0.8rem', color: 'var(--text-muted)', textTransform: 'uppercase', letterSpacing: '2px', fontWeight: 600 }}>Coins</span>
          <h3 className="text-neon-secondary" style={{ fontSize: '1.5rem', margin: 0 }}>{coins}</h3>
        </div>
      </div>

      {/* Top Right: Powerups & Leaderboard */}
      <div className="right-container" style={{ display: 'flex', flexDirection: 'column', alignItems: 'flex-end', gap: '20px' }}>
        
        {/* Leaderboard */}
        <div className="glass-panel-hud" style={{ padding: '16px 20px', display: 'flex', flexDirection: 'column', gap: '6px', minWidth: '220px', pointerEvents: 'auto' }}>
          <h4 className="text-neon" style={{ fontSize: '0.9rem', letterSpacing: '2px', borderBottom: '1px solid rgba(0, 243, 255, 0.2)', paddingBottom: '6px', marginBottom: '4px' }}>LEADERBOARD</h4>
          {leaderboard.map((entry, idx) => (
            <div key={idx} style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.8rem', color: entry.isPlayer ? 'var(--primary-neon)' : 'var(--text-main)', fontWeight: entry.isPlayer ? 'bold' : 'normal' }}>
              <span style={{ textOverflow: 'ellipsis', overflow: 'hidden', whiteSpace: 'nowrap', maxWidth: '140px' }}>{idx + 1}. {entry.name}</span>
              <span>{entry.score}</span>
            </div>
          ))}
        </div>

        {/* Powerups List */}
        <div className="powerups-list" style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
          {activePowerups.map((type, index) => (
            <div key={`${type}-${index}`} className="glass-panel-hud" style={{ padding: '10px 16px', display: 'flex', alignItems: 'center', gap: '12px', minWidth: '160px' }}>
              {type === 'speed' && <Zap size={20} color="var(--primary-neon)" />}
              {type === 'shield' && <Shield size={20} color="var(--primary-neon)" />}
              {type === 'magnet' && <Magnet size={20} color="var(--primary-neon)" />}
              {type === 'double_points' && <Star size={20} color="var(--warning-neon)" />}
              
              <div style={{ flex: 1 }}>
                <div style={{ fontSize: '0.8rem', textTransform: 'uppercase', fontWeight: 'bold' }}>{typeof type === 'string' ? type.replace('_', ' ') : 'POWERUP'}</div>
                <div style={{ width: '100%', height: '4px', background: 'rgba(255,255,255,0.1)', borderRadius: '2px', marginTop: '6px', overflow: 'hidden' }}>
                  <div style={{ width: '100%', height: '100%', background: 'var(--primary-neon)' }} />
                </div>
              </div>
            </div>
          ))}
        </div>
        
      </div>
    </div>
  );
};

export default HUD;
