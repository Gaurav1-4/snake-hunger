import React, { useState } from 'react';
import { useGameStore } from '../store/useGameStore';
import { usePlayerStore } from '../store/usePlayerStore';
import { ArrowLeft, Check, Lock, Coins, Sparkles } from 'lucide-react';

const SKINS = [
  { id: 'neon_blue', name: 'Neon Blue', price: 0, color: '#00f3ff' },
  { id: 'neon_green', name: 'Neon Green', price: 100, color: '#00ff66' },
  { id: 'cyber_red', name: 'Cyber Red', price: 250, color: '#ff003c' },
  { id: 'plasma', name: 'Plasma Purple', price: 500, color: '#ff00ea' },
  { id: 'gold', name: 'Golden Void', price: 1000, color: '#ffea00' },
];

const TRAILS = [
  { id: 'none', name: 'No Trail', price: 0, desc: 'Classic outline', preview: '#334155' },
  { id: 'neon_pulse', name: 'Neon Pulse', price: 150, desc: 'Neon rings', preview: '#00f3ff' },
  { id: 'sparkles', name: 'Cosmic Sparks', price: 300, desc: 'Twinkling stars', preview: '#ffea00' },
  { id: 'rainbow', name: 'Rainbow Flow', price: 600, desc: 'Cycling colors', preview: 'linear-gradient(90deg, red, yellow, green, cyan, blue, magenta)' },
  { id: 'fire', name: 'Solar Flare', price: 1000, desc: 'Orange flames', preview: '#ff4500' },
];

const Shop: React.FC = () => {
  const { setGameState } = useGameStore();
  const { 
    coins = 0, 
    unlockedSkins = ['neon_blue'], 
    equippedSkin = 'neon_blue', 
    unlockSkin, 
    equipSkin, 
    unlockedTrails = ['none'], 
    equippedTrail = 'none', 
    unlockTrail, 
    equipTrail, 
    spendCoins 
  } = usePlayerStore();

  const [activeTab, setActiveTab] = useState<'skins' | 'trails'>('skins');

  const handleSkinPurchase = (id: string, price: number) => {
    if (unlockedSkins.includes(id)) {
      equipSkin(id);
    } else {
      if (spendCoins(price)) {
        unlockSkin(id);
        equipSkin(id);
      }
    }
  };

  const handleTrailPurchase = (id: string, price: number) => {
    if (unlockedTrails.includes(id)) {
      equipTrail(id);
    } else {
      if (spendCoins(price)) {
        unlockTrail(id);
        equipTrail(id);
      }
    }
  };

  return (
    <div className="flex-center fade-in" style={{ width: '100%', height: '100%', flexDirection: 'column', backgroundColor: 'rgba(5, 5, 15, 0.6)', backdropFilter: 'blur(8px)' }}>
      <div className="glass-panel" style={{ width: '85%', maxWidth: '900px', height: '85%', display: 'flex', flexDirection: 'column', padding: '30px 40px' }}>
        
        {/* Header */}
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '24px' }}>
          <button className="btn btn-secondary" style={{ padding: '10px 20px', fontSize: '0.95rem' }} onClick={() => setGameState('menu')}>
            <ArrowLeft size={18} /> BACK
          </button>
          <h2 className="text-gradient" style={{ fontSize: '2.5rem', letterSpacing: '5px' }}>COSMETIC LAB</h2>
          <div className="glass-panel-hud" style={{ padding: '10px 20px', display: 'flex', alignItems: 'center', gap: '10px' }}>
            <Coins className="text-neon-secondary" size={20} />
            <span style={{ fontSize: '1.3rem', fontWeight: 'bold' }}>{coins}</span>
          </div>
        </div>

        {/* Tabs */}
        <div style={{ display: 'flex', gap: '16px', marginBottom: '24px', borderBottom: '1px solid rgba(255,255,255,0.08)', paddingBottom: '10px' }}>
          <button 
            className={`btn ${activeTab === 'skins' ? 'btn-primary' : 'btn-secondary'}`}
            style={{ padding: '10px 24px', fontSize: '1rem', flex: 1 }}
            onClick={() => setActiveTab('skins')}
          >
            SNAKE SKINS
          </button>
          <button 
            className={`btn ${activeTab === 'trails' ? 'btn-primary' : 'btn-secondary'}`}
            style={{ padding: '10px 24px', fontSize: '1rem', flex: 1 }}
            onClick={() => setActiveTab('trails')}
          >
            CUSTOM TRAILS
          </button>
        </div>

        {/* Content area */}
        <div style={{ flex: 1, overflowY: 'auto', paddingRight: '8px' }}>
          {activeTab === 'skins' ? (
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(200px, 1fr))', gap: '20px' }}>
              {SKINS.map((skin) => {
                const isUnlocked = unlockedSkins.includes(skin.id);
                const isEquipped = equippedSkin === skin.id;
                
                return (
                  <div 
                    key={skin.id} 
                    className="glass-panel" 
                    style={{ padding: '20px', display: 'flex', flexDirection: 'column', gap: '16px', alignItems: 'center', cursor: 'pointer' }}
                    onClick={() => !(!isUnlocked && coins < skin.price) && handleSkinPurchase(skin.id, skin.price)}
                  >
                    <div style={{ width: '70px', height: '70px', borderRadius: '50%', backgroundColor: skin.color, boxShadow: `0 0 25px ${skin.color}80`, border: '2px solid rgba(255,255,255,0.2)' }}></div>
                    <h4 style={{ color: skin.color, fontSize: '1.1rem', letterSpacing: '1px', textTransform: 'uppercase' }}>{skin.name}</h4>
                    
                    <button 
                      className={`btn ${isEquipped ? 'btn-primary' : 'btn-secondary'}`}
                      style={{ width: '100%', fontSize: '0.9rem', padding: '10px' }}
                      onClick={(e) => { e.stopPropagation(); handleSkinPurchase(skin.id, skin.price); }}
                      disabled={!isUnlocked && coins < skin.price}
                    >
                      {isEquipped ? (
                        <><Check size={16} /> EQUIPPED</>
                      ) : isUnlocked ? (
                        'EQUIP'
                      ) : (
                        <><Lock size={16} /> {skin.price} C</>
                      )}
                    </button>
                  </div>
                );
              })}
            </div>
          ) : (
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(200px, 1fr))', gap: '20px' }}>
              {TRAILS.map((trail) => {
                const isUnlocked = unlockedTrails.includes(trail.id);
                const isEquipped = equippedTrail === trail.id;
                
                return (
                  <div 
                    key={trail.id} 
                    className="glass-panel" 
                    style={{ padding: '20px', display: 'flex', flexDirection: 'column', gap: '12px', alignItems: 'center', cursor: 'pointer' }}
                    onClick={() => !(!isUnlocked && coins < trail.price) && handleTrailPurchase(trail.id, trail.price)}
                  >
                    {/* Visual Preview */}
                    <div style={{ 
                      width: '70px', 
                      height: '70px', 
                      borderRadius: '50%', 
                      background: trail.preview, 
                      boxShadow: trail.id !== 'none' ? `0 0 25px ${trail.preview.includes('gradient') ? '#bd00ff' : trail.preview}80` : 'none', 
                      border: '2px solid rgba(255,255,255,0.2)',
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center'
                    }}>
                      {trail.id !== 'none' && <Sparkles size={24} color="#ffffff" />}
                    </div>

                    <h4 style={{ color: '#ffffff', fontSize: '1.1rem', letterSpacing: '1px', textTransform: 'uppercase', textAlign: 'center' }}>{trail.name}</h4>
                    <p style={{ color: 'var(--text-muted)', fontSize: '0.8rem', textAlign: 'center', margin: '0 0 8px 0', minHeight: '32px' }}>{trail.desc}</p>
                    
                    <button 
                      className={`btn ${isEquipped ? 'btn-primary' : 'btn-secondary'}`}
                      style={{ width: '100%', fontSize: '0.9rem', padding: '10px' }}
                      onClick={(e) => { e.stopPropagation(); handleTrailPurchase(trail.id, trail.price); }}
                      disabled={!isUnlocked && coins < trail.price}
                    >
                      {isEquipped ? (
                        <><Check size={16} /> EQUIPPED</>
                      ) : isUnlocked ? (
                        'EQUIP'
                      ) : (
                        <><Lock size={16} /> {trail.price} C</>
                      )}
                    </button>
                  </div>
                );
              })}
            </div>
          )}
        </div>

      </div>
    </div>
  );
};

export default Shop;
