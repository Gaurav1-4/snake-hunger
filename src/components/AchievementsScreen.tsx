import React from 'react';
import { useGameStore } from '../store/useGameStore';
import { usePlayerStore } from '../store/usePlayerStore';
import { ArrowLeft, Trophy, Star } from 'lucide-react';

const ACHIEVEMENTS = [
  { id: 'first_blood', name: 'First Meal', description: 'Eat your first food', threshold: 1, icon: <Star /> },
  { id: 'score_100', name: 'Apprentice Hunter', description: 'Reach a score of 100', threshold: 100, icon: <Trophy /> },
  { id: 'score_500', name: 'Expert Hunter', description: 'Reach a score of 500', threshold: 500, icon: <Trophy /> },
  { id: 'score_1000', name: 'Legendary Hunter', description: 'Reach a score of 1000', threshold: 1000, icon: <Trophy /> },
];

const AchievementsScreen: React.FC = () => {
  const { setGameState } = useGameStore();
  const { highScore = 0 } = usePlayerStore();

  return (
    <div className="flex-center fade-in" style={{ width: '100%', height: '100%', flexDirection: 'column', backgroundColor: 'rgba(5, 5, 15, 0.6)', backdropFilter: 'blur(8px)' }}>
      <div className="glass-panel" style={{ width: '85%', maxWidth: '900px', height: '85%', display: 'flex', flexDirection: 'column', padding: '40px' }}>
        
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '40px' }}>
          <button className="btn btn-secondary" style={{ padding: '12px 24px' }} onClick={() => setGameState('menu')}>
            <ArrowLeft size={20} /> BACK
          </button>
          <h2 className="text-gradient" style={{ fontSize: '3rem', letterSpacing: '6px' }}>ACHIEVEMENTS</h2>
          <div style={{ width: '100px' }}></div> {/* Spacer */}
        </div>

        <div style={{ flex: 1, overflowY: 'auto', paddingRight: '16px', display: 'flex', flexDirection: 'column', gap: '20px' }}>
          {ACHIEVEMENTS.map(ach => {
            const isUnlocked = highScore >= ach.threshold;
            return (
              <div key={ach.id} className="glass-panel-hud" style={{ 
                padding: '24px', 
                display: 'flex', 
                alignItems: 'center', 
                gap: '24px',
                opacity: isUnlocked ? 1 : 0.5,
                borderColor: isUnlocked ? 'var(--primary-neon)' : 'rgba(255,255,255,0.05)',
                transition: 'all 0.3s ease'
              }}>
                <div style={{ color: isUnlocked ? 'var(--primary-neon)' : 'var(--text-muted)' }}>
                  {ach.icon}
                </div>
                <div>
                  <h3 style={{ color: isUnlocked ? 'var(--text-main)' : 'var(--text-muted)', fontSize: '1.2rem', letterSpacing: '2px', marginBottom: '8px' }}>{ach.name}</h3>
                  <div className="text-muted" style={{ fontSize: '0.9rem' }}>{ach.description}</div>
                </div>
                <div style={{ marginLeft: 'auto', color: isUnlocked ? 'var(--primary-neon)' : 'var(--text-muted)', fontWeight: isUnlocked ? 'bold' : 'normal', fontSize: '0.9rem', letterSpacing: '1px' }}>
                  {isUnlocked ? 'UNLOCKED' : `REQUIRES SCORE: ${ach.threshold}`}
                </div>
              </div>
            );
          })}
        </div>

      </div>
    </div>
  );
};

export default AchievementsScreen;
