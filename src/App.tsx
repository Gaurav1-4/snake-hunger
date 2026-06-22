import { useEffect } from 'react';
import { useGameStore } from './store/useGameStore';
import MainMenu from './components/MainMenu';
import HUD from './components/HUD';
import GameOverScreen from './components/GameOverScreen';
import GameCanvas from './components/GameCanvas';
import Shop from './components/Shop';
import SettingsScreen from './components/SettingsScreen';
import AchievementsScreen from './components/AchievementsScreen';
import TouchControls from './components/TouchControls';
import PauseOverlay from './components/PauseOverlay';

function App() {
  const { gameState, setGameState } = useGameStore();

  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      const currentGameState = useGameStore.getState().gameState;
      if (e.key === 'Escape' || e.key === 'p' || e.key === 'P') {
        if (currentGameState === 'playing') {
          setGameState('paused');
          const game = (window as any).gameInstance;
          if (game) game.pause();
        } else if (currentGameState === 'paused') {
          setGameState('playing');
          const game = (window as any).gameInstance;
          if (game) game.start();
        }
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [setGameState]);

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
        {gameState === 'paused' && <PauseOverlay />}
        {gameState === 'gameover' && <GameOverScreen />}
        {gameState === 'shop' && <Shop />}
        {gameState === 'settings' && <SettingsScreen />}
        {gameState === 'achievements' && <AchievementsScreen />}
      </div>
    </>
  );
}

export default App;
