import React from 'react';
import { useGameStore } from '../store/useGameStore';
import { usePlayerStore } from '../store/usePlayerStore';
import { RotateCcw, Home } from 'lucide-react';

const GameOverScreen: React.FC = () => {
  const { score, level, resetGame, setGameState } = useGameStore();
  const { highScore, setHighScore } = usePlayerStore();

  // Update high score on mount
  React.useEffect(() => {
    setHighScore(score);
  }, [score, setHighScore]);

  return (
    <div className="flex-center fade-in" style={{ width: '100%', height: '100%', flexDirection: 'column', backgroundColor: 'rgba(5, 5, 15, 0.6)', backdropFilter: 'blur(8px)' }}>
      <div className="glass-panel" style={{ padding: '60px 80px', textAlign: 'center', display: 'flex', flexDirection: 'column', gap: '32px', minWidth: '450px' }}>
        
        <div className="animate-pulse">
          <h1 className="text-danger-neon" style={{ fontSize: '3.5rem', letterSpacing: '6px' }}>GAME OVER</h1>
        </div>
        
        <div style={{ display: 'flex', flexDirection: 'column', gap: '8px', margin: '10px 0' }}>
          <div className="text-muted" style={{ fontSize: '1rem', letterSpacing: '2px', fontWeight: 600 }}>FINAL SCORE</div>
          <div className="text-gradient" style={{ fontSize: '4.5rem', fontFamily: 'var(--font-heading)', fontWeight: 900 }}>{score}</div>
          
          <div style={{ display: 'flex', justifyContent: 'space-between', marginTop: '24px', padding: '20px', background: 'rgba(0,0,0,0.4)', borderRadius: '12px', border: '1px solid rgba(255,255,255,0.05)' }}>
            <div style={{ textAlign: 'left' }}>
              <div className="text-muted" style={{ fontSize: '0.8rem', letterSpacing: '1px' }}>HIGH SCORE</div>
              <div className="text-neon" style={{ fontSize: '1.8rem', fontWeight: 'bold' }}>{Math.max(score, highScore)}</div>
            </div>
            <div style={{ textAlign: 'right' }}>
              <div className="text-muted" style={{ fontSize: '0.8rem', letterSpacing: '1px' }}>LEVEL REACHED</div>
              <div className="text-neon-secondary" style={{ fontSize: '1.8rem', fontWeight: 'bold' }}>{level}</div>
            </div>
          </div>
        </div>

        <div style={{ display: 'flex', gap: '20px', justifyContent: 'center', marginTop: '10px' }}>
          <button className="btn btn-primary" onClick={resetGame} style={{ padding: '16px 24px', flex: 1 }}>
            <RotateCcw size={20} /> PLAY AGAIN
          </button>
          <button className="btn btn-secondary" onClick={() => setGameState('menu')} style={{ padding: '16px 24px', flex: 1 }}>
            <Home size={20} /> MENU
          </button>
        </div>
      </div>
    </div>
  );
};

export default GameOverScreen;
