import React from 'react';
import { useGameStore } from '../store/useGameStore';
import { usePlayerStore } from '../store/usePlayerStore';
import { ArrowLeft, Check, Lock, Coins } from 'lucide-react';

const SKINS = [
  { id: 'neon_blue', name: 'Neon Blue', price: 0, color: '#00f3ff' },
  { id: 'neon_green', name: 'Neon Green', price: 100, color: '#00ff66' },
  { id: 'cyber_red', name: 'Cyber Red', price: 250, color: '#ff003c' },
  { id: 'plasma', name: 'Plasma Purple', price: 500, color: '#ff00ea' },
  { id: 'gold', name: 'Golden Void', price: 1000, color: '#ffea00' },
];

const Shop: React.FC = () => {
  const { setGameState } = useGameStore();
  const { coins, unlockedSkins, equippedSkin, unlockSkin, equipSkin, spendCoins } = usePlayerStore();

  const handlePurchase = (id: string, price: number) => {
    if (unlockedSkins.includes(id)) {
      equipSkin(id);
    } else {
      if (spendCoins(price)) {
        unlockSkin(id);
        equipSkin(id);
      }
    }
  };

  return (
    <div className="flex-center fade-in" style={{ width: '100%', height: '100%', flexDirection: 'column', backgroundColor: 'rgba(5, 5, 15, 0.6)', backdropFilter: 'blur(8px)' }}>
      <div className="glass-panel" style={{ width: '85%', maxWidth: '900px', height: '85%', display: 'flex', flexDirection: 'column', padding: '40px' }}>
        
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '40px' }}>
          <button className="btn btn-secondary" style={{ padding: '12px 24px' }} onClick={() => setGameState('menu')}>
            <ArrowLeft size={20} /> BACK
          </button>
          <h2 className="text-gradient" style={{ fontSize: '3rem', letterSpacing: '6px' }}>THE SHOP</h2>
          <div className="glass-panel-hud" style={{ padding: '12px 24px', display: 'flex', alignItems: 'center', gap: '12px' }}>
            <Coins className="text-neon-secondary" size={24} />
            <span style={{ fontSize: '1.5rem', fontWeight: 'bold' }}>{coins}</span>
          </div>
        </div>

        <div style={{ flex: 1, overflowY: 'auto', paddingRight: '16px' }}>
          <h3 className="text-muted" style={{ marginBottom: '24px', fontSize: '1.2rem', letterSpacing: '3px' }}>SNAKE SKINS</h3>
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(220px, 1fr))', gap: '24px' }}>
            
            {SKINS.map((skin) => {
              const isUnlocked = unlockedSkins.includes(skin.id);
              const isEquipped = equippedSkin === skin.id;
              
              return (
                <div key={skin.id} className="glass-panel" style={{ padding: '24px', display: 'flex', flexDirection: 'column', gap: '20px', alignItems: 'center', cursor: 'pointer' }} onClick={() => !(!isUnlocked && coins < skin.price) && handlePurchase(skin.id, skin.price)}>
                  <div style={{ width: '80px', height: '80px', borderRadius: '50%', backgroundColor: skin.color, boxShadow: `0 0 30px ${skin.color}80`, border: '2px solid rgba(255,255,255,0.2)' }}></div>
                  <h4 style={{ color: skin.color, fontSize: '1.2rem', letterSpacing: '2px' }}>{skin.name}</h4>
                  
                  <button 
                    className={`btn ${isEquipped ? 'btn-primary' : 'btn-secondary'}`}
                    style={{ width: '100%', fontSize: '1rem', padding: '12px' }}
                    onClick={(e) => { e.stopPropagation(); handlePurchase(skin.id, skin.price); }}
                    disabled={!isUnlocked && coins < skin.price}
                  >
                    {isEquipped ? (
                      <><Check size={18} /> EQUIPPED</>
                    ) : isUnlocked ? (
                      'EQUIP'
                    ) : (
                      <><Lock size={18} /> {skin.price} C</>
                    )}
                  </button>
                </div>
              );
            })}

          </div>
        </div>

      </div>
    </div>
  );
};

export default Shop;
