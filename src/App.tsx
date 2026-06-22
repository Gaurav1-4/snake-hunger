import { useGameStore } from './store/useGameStore';
import MainMenu from './components/MainMenu';
import HUD from './components/HUD';
import GameOverScreen from './components/GameOverScreen';
import GameCanvas from './components/GameCanvas';
import Shop from './components/Shop';
import SettingsScreen from './components/SettingsScreen';
import AchievementsScreen from './components/AchievementsScreen';
import TouchControls from './components/TouchControls';

function App() {
  const { gameState } = useGameStore();

  return (
    <>
      <GameCanvas />
      
      <div className="ui-layer">
        {gameState === 'menu' && <MainMenu />}
        {gameState === 'playing' && (
          <>
            <HUD />
            <TouchControls />
          </>
        )}
        {gameState === 'gameover' && <GameOverScreen />}
        {gameState === 'shop' && <Shop />}
        {gameState === 'settings' && <SettingsScreen />}
        {gameState === 'achievements' && <AchievementsScreen />}
      </div>

      {/* Fullscreen Rotate Device Graphic (No text notification, pure graphic) */}
      <div className="rotate-overlay">
        <svg className="rotate-icon" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
          <rect x="5" y="2" width="14" height="20" rx="2" ry="2" />
          <path d="M12 18h.01" />
        </svg>
      </div>
    </>
  );
}

export default App;
