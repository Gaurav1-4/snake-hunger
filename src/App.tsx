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
    </>
  );
}

export default App;
