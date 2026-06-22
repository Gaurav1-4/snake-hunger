import React from 'react';
import { useGameStore } from '../store/useGameStore';
import { usePlayerStore } from '../store/usePlayerStore';
import { RotateCcw, Home } from 'lucide-react';

const GameOverScreen: React.FC = () => {
  const { score, level, resetGame, setGameState } = useGameStore();
  const { highScore = 0, setHighScore } = usePlayerStore();

  // Update high score on mount
  React.useEffect(() => {
    setHighScore(score);
  }, [score, setHighScore]);

  return (
    <div className="flex-center fade-in" style={{ width: '100%', height: '100%', flexDirection: 'column', backgroundColor: 'rgba(5, 5, 15, 0.6)', backdropFilter: 'blur(8px)' }}>
      <div className="glass-panel" style={{ textAlign: 'center', display: 'flex', flexDirection: 'column', minWidth: '450px' }}>
        
        <div className="animate-pulse">
          <h1 className="text-danger-neon screen-title">GAME OVER</h1>
        </div>
        
        <div className="score-box">
          <div className="text-muted" style={{ fontSize: '0.9rem', letterSpacing: '2px', fontWeight: 600 }}>FINAL SCORE</div>
          <div className="text-gradient final-score">{score}</div>
          
          <div className="high-score-box">
            <div style={{ textAlign: 'left' }}>
              <div className="text-muted" style={{ fontSize: '0.8rem', letterSpacing: '1px' }}>HIGH SCORE</div>
              <div className="text-neon" style={{ fontSize: '1.6rem', fontWeight: 'bold' }}>{Math.max(score, highScore)}</div>
            </div>
            <div style={{ textAlign: 'right' }}>
              <div className="text-muted" style={{ fontSize: '0.8rem', letterSpacing: '1px' }}>LEVEL REACHED</div>
              <div className="text-neon-secondary" style={{ fontSize: '1.6rem', fontWeight: 'bold' }}>{level}</div>
            </div>
          </div>
        </div>

        <div className="button-group-row">
          <button className="btn btn-primary" onClick={resetGame} style={{ padding: '14px 20px', flex: 1 }}>
            <RotateCcw size={20} /> PLAY AGAIN
          </button>
          <button className="btn btn-secondary" onClick={() => setGameState('menu')} style={{ padding: '14px 20px', flex: 1 }}>
            <Home size={20} /> MENU
          </button>
        </div>
      </div>
    </div>
  );
};

export default GameOverScreen;
