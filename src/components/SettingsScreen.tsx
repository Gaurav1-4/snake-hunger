import React, { useState, useEffect } from 'react';
import { useGameStore } from '../store/useGameStore';
import { ArrowLeft, Volume2, Monitor, Download } from 'lucide-react';

const SettingsScreen: React.FC = () => {
  const { setGameState } = useGameStore();
  const [deferredPrompt, setDeferredPrompt] = useState<any>(null);
  const [showInstallBtn, setShowInstallBtn] = useState(false);

  useEffect(() => {
    const handleBeforeInstallPrompt = (e: Event) => {
      e.preventDefault();
      setDeferredPrompt(e);
      setShowInstallBtn(true);
    };

    window.addEventListener('beforeinstallprompt', handleBeforeInstallPrompt);

    // Check if already in standalone app mode
    if (window.matchMedia('(display-mode: standalone)').matches) {
      setShowInstallBtn(false);
    }

    return () => {
      window.removeEventListener('beforeinstallprompt', handleBeforeInstallPrompt);
    };
  }, []);

  const handleInstallClick = async () => {
    if (!deferredPrompt) return;
    deferredPrompt.prompt();
    const { outcome } = await deferredPrompt.userChoice;
    console.log(`User install outcome: ${outcome}`);
    setDeferredPrompt(null);
    setShowInstallBtn(false);
  };

  const isIOS = /iPad|iPhone|iPod/.test(navigator.userAgent) && !(window as any).MSStream;
  const isStandalone = window.matchMedia('(display-mode: standalone)').matches;

  return (
    <div className="flex-center fade-in" style={{ width: '100%', height: '100%', flexDirection: 'column', backgroundColor: 'rgba(5, 5, 15, 0.6)', backdropFilter: 'blur(8px)' }}>
      <div className="glass-panel" style={{ width: '60%', maxWidth: '600px', padding: '40px', maxHeight: '90vh', overflowY: 'auto' }}>
        
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

          {/* App Installation */}
          {showInstallBtn && (
            <div className="glass-panel-hud" style={{ padding: '24px' }}>
              <h3 className="text-neon" style={{ display: 'flex', alignItems: 'center', gap: '12px', marginBottom: '16px', letterSpacing: '2px' }}>
                <Download size={24} /> INSTALL GAME
              </h3>
              <p style={{ color: 'var(--text-muted)', marginBottom: '16px', fontSize: '0.95rem' }}>
                Install Snake Hunger on your device to play offline as a standalone landscape app.
              </p>
              <button className="btn btn-primary" onClick={handleInstallClick} style={{ width: '100%', padding: '14px' }}>
                INSTALL NOW
              </button>
            </div>
          )}

          {isIOS && !isStandalone && (
            <div className="glass-panel-hud" style={{ padding: '24px' }}>
              <h3 className="text-neon" style={{ display: 'flex', alignItems: 'center', gap: '12px', marginBottom: '16px', letterSpacing: '2px' }}>
                <Download size={24} /> INSTALL GAME
              </h3>
              <p style={{ color: 'var(--text-muted)', fontSize: '0.95rem', lineHeight: '1.6' }}>
                To install this game on your iPhone/iPad: tap the <strong>Share</strong> button (the square with an up arrow) in Safari, scroll down, and select <strong>\"Add to Home Screen\"</strong>.
              </p>
            </div>
          )}

        </div>
      </div>
    </div>
  );
};

export default SettingsScreen;
