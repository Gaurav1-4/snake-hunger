import React from 'react';
import { useGameStore } from '../store/useGameStore';
import { usePlayerStore } from '../store/usePlayerStore';
import { Play, Home, Maximize, Sliders, Volume2 } from 'lucide-react';

const PauseOverlay: React.FC = () => {
  const { setGameState } = useGameStore();
  const { sensitivity, setSensitivity } = usePlayerStore();
  const [isFullscreen, setIsFullscreen] = React.useState(false);

  React.useEffect(() => {
    const handleFullscreenChange = () => {
      const doc = document as any;
      setIsFullscreen(!!doc.fullscreenElement || !!doc.webkitFullscreenElement);
    };

    document.addEventListener('fullscreenchange', handleFullscreenChange);
    document.addEventListener('webkitfullscreenchange', handleFullscreenChange);

    handleFullscreenChange();

    return () => {
      document.removeEventListener('fullscreenchange', handleFullscreenChange);
      document.removeEventListener('webkitfullscreenchange', handleFullscreenChange);
    };
  }, []);

  const resumeGame = () => {
    setGameState('playing');
    const game = (window as any).gameInstance;
    if (game) game.start();
  };

  const quitGame = () => {
    setGameState('menu');
    const game = (window as any).gameInstance;
    if (game) game.startMenuBackground();
  };

  const toggleFullscreen = () => {
    const doc = document as any;
    const docEl = document.documentElement as any;
    
    const requestFS = docEl.requestFullscreen || docEl.webkitRequestFullscreen;
    const exitFS = doc.exitFullscreen || doc.webkitExitFullscreen;
    
    if (!doc.fullscreenElement && !doc.webkitFullscreenElement) {
      if (requestFS) requestFS.call(docEl).catch((err: any) => console.log(err));
    } else {
      if (exitFS) exitFS.call(doc).catch((err: any) => console.log(err));
    }
  };

  return (
    <div className="flex-center fade-in" style={{ 
      position: 'absolute', 
      top: 0, 
      left: 0, 
      width: '100%', 
      height: '100%', 
      flexDirection: 'column', 
      backgroundColor: 'rgba(5, 5, 15, 0.65)', 
      backdropFilter: 'blur(8px)',
      zIndex: 1000
    }}>
      <div className="glass-panel" style={{ width: '90%', maxWidth: '500px', padding: '30px 40px', display: 'flex', flexDirection: 'column', gap: '24px', textAlign: 'center' }}>
        
        <h2 className="text-neon" style={{ fontSize: '2.5rem', letterSpacing: '4px' }}>PAUSED</h2>
        
        <div style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
          
          {/* Audio Slider */}
          <div className="glass-panel-hud" style={{ padding: '16px 20px', textAlign: 'left' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
              <span className="text-main" style={{ fontSize: '0.95rem', display: 'flex', alignItems: 'center', gap: '8px' }}>
                <Volume2 size={16} /> Volume
              </span>
              <input type="range" min="0" max="100" defaultValue="50" style={{ width: '150px' }} className="accent-neon" />
            </div>
          </div>

          {/* Sensitivity Setting */}
          <div className="glass-panel-hud" style={{ padding: '16px 20px', textAlign: 'left' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
              <span className="text-main" style={{ fontSize: '0.95rem', display: 'flex', alignItems: 'center', gap: '8px' }}>
                <Sliders size={16} /> Steering Sensitivity
              </span>
              <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                <input 
                  type="range" 
                  min="1" 
                  max="10" 
                  value={sensitivity}
                  onChange={(e) => setSensitivity(Number(e.target.value))}
                  style={{ width: '100px' }} 
                  className="accent-neon" 
                />
                <span className="text-neon" style={{ fontSize: '1rem', fontWeight: 'bold', width: '18px', textAlign: 'right' }}>{sensitivity}</span>
              </div>
            </div>
          </div>

          {/* Fullscreen Button */}
          <button className="btn btn-secondary" onClick={toggleFullscreen} style={{ width: '100%', padding: '12px', fontSize: '0.95rem', gap: '8px' }}>
            <Maximize size={18} /> {isFullscreen ? 'EXIT FULLSCREEN' : 'ENTER FULLSCREEN'}
          </button>
          
          {/* Action Row */}
          <div style={{ display: 'flex', gap: '16px', marginTop: '10px' }}>
            <button className="btn btn-primary animate-pulse" onClick={resumeGame} style={{ flex: 1, padding: '14px', fontSize: '1rem' }}>
              <Play size={18} /> RESUME
            </button>
            <button className="btn btn-secondary" onClick={quitGame} style={{ flex: 1, padding: '14px', fontSize: '1rem' }}>
              <Home size={18} /> QUIT
            </button>
          </div>

        </div>
      </div>
    </div>
  );
};

export default PauseOverlay;
