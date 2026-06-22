import React from 'react';
import { useGameStore } from '../store/useGameStore';
import { ArrowLeft, Volume2, Monitor } from 'lucide-react';

const SettingsScreen: React.FC = () => {
  const { setGameState } = useGameStore();

  return (
    <div className="flex-center fade-in" style={{ width: '100%', height: '100%', flexDirection: 'column', backgroundColor: 'rgba(5, 5, 15, 0.6)', backdropFilter: 'blur(8px)' }}>
      <div className="glass-panel" style={{ width: '60%', maxWidth: '600px', padding: '40px' }}>
        
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '40px' }}>
          <button className="btn btn-secondary" style={{ padding: '12px 24px' }} onClick={() => setGameState('menu')}>
            <ArrowLeft size={20} /> BACK
          </button>
          <h2 className="text-gradient" style={{ fontSize: '2.5rem', letterSpacing: '4px' }}>SETTINGS</h2>
          <div style={{ width: '100px' }}></div> {/* Spacer for center alignment */}
        </div>

        <div style={{ display: 'flex', flexDirection: 'column', gap: '32px' }}>
          
          {/* Audio Settings */}
          <div className="glass-panel-hud" style={{ padding: '24px' }}>
            <h3 className="text-neon" style={{ display: 'flex', alignItems: 'center', gap: '12px', marginBottom: '24px', letterSpacing: '2px' }}>
              <Volume2 size={24} /> AUDIO
            </h3>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
              <span className="text-main" style={{ fontSize: '1.1rem' }}>Master Volume</span>
              <input type="range" min="0" max="100" defaultValue="50" style={{ width: '200px' }} className="accent-neon" />
            </div>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginTop: '16px' }}>
              <span className="text-main" style={{ fontSize: '1.1rem' }}>Music</span>
              <input type="range" min="0" max="100" defaultValue="40" style={{ width: '200px' }} className="accent-neon" />
            </div>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginTop: '16px' }}>
              <span className="text-main" style={{ fontSize: '1.1rem' }}>SFX</span>
              <input type="range" min="0" max="100" defaultValue="70" style={{ width: '200px' }} className="accent-neon" />
            </div>
          </div>

          {/* Graphics Settings */}
          <div className="glass-panel-hud" style={{ padding: '24px' }}>
            <h3 className="text-neon-secondary" style={{ display: 'flex', alignItems: 'center', gap: '12px', marginBottom: '24px', letterSpacing: '2px' }}>
              <Monitor size={24} /> GRAPHICS
            </h3>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
              <span className="text-main" style={{ fontSize: '1.1rem' }}>Particle Quality</span>
              <select className="glass-panel" style={{ padding: '12px 16px', color: 'white', border: '1px solid var(--border-neon)', backgroundColor: 'transparent', outline: 'none', cursor: 'pointer' }}>
                <option value="low" style={{ background: '#05050f' }}>Low</option>
                <option value="medium" style={{ background: '#05050f' }}>Medium</option>
                <option value="high" selected style={{ background: '#05050f' }}>High</option>
              </select>
            </div>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginTop: '24px' }}>
              <span className="text-main" style={{ fontSize: '1.1rem' }}>Show Grid</span>
              <input type="checkbox" defaultChecked style={{ width: '20px', height: '20px', cursor: 'pointer' }} />
            </div>
          </div>

        </div>
      </div>
    </div>
  );
};

export default SettingsScreen;
