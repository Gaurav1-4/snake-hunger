import React, { useState, useRef, useEffect } from 'react';
import { Zap } from 'lucide-react';
import { Vector2 } from '../engine/Vector2';

const TouchControls: React.FC = () => {
  const [isTouchDevice, setIsTouchDevice] = useState(false);
  const [joystick, setJoystick] = useState<{
    active: boolean;
    startX: number;
    startY: number;
    currentX: number;
    currentY: number;
  }>({
    active: false,
    startX: 0,
    startY: 0,
    currentX: 0,
    currentY: 0,
  });

  const joystickZoneRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const checkTouch = () => {
      const isTouch = 'ontouchstart' in window || navigator.maxTouchPoints > 0;
      setIsTouchDevice(isTouch);
    };
    checkTouch();
    window.addEventListener('resize', checkTouch);
    return () => window.removeEventListener('resize', checkTouch);
  }, []);

  if (!isTouchDevice) return null;

  const handleTouchStart = (e: React.TouchEvent<HTMLDivElement>) => {
    const touch = e.touches[0];
    setJoystick({
      active: true,
      startX: touch.clientX,
      startY: touch.clientY,
      currentX: touch.clientX,
      currentY: touch.clientY,
    });
  };

  const handleTouchMove = (e: React.TouchEvent<HTMLDivElement>) => {
    if (!joystick.active) return;
    const touch = e.touches[0];
    
    // Calculate distance and angle
    const dx = touch.clientX - joystick.startX;
    const dy = touch.clientY - joystick.startY;
    const dist = Math.sqrt(dx * dx + dy * dy);
    const maxRadius = 50; // pixels
    
    let targetX = touch.clientX;
    let targetY = touch.clientY;
    
    if (dist > maxRadius) {
      const angle = Math.atan2(dy, dx);
      targetX = joystick.startX + Math.cos(angle) * maxRadius;
      targetY = joystick.startY + Math.sin(angle) * maxRadius;
    }
    
    setJoystick(prev => ({
      ...prev,
      currentX: targetX,
      currentY: targetY,
    }));

    // Update game input direction
    const game = (window as any).gameInstance;
    if (game && game.input) {
      const dirX = targetX - joystick.startX;
      const dirY = targetY - joystick.startY;
      const mag = Math.sqrt(dirX * dirX + dirY * dirY);
      if (mag > 0) {
        game.input.joystickDir = new Vector2(dirX / mag, dirY / mag);
      }
    }
  };

  const handleTouchEnd = () => {
    setJoystick({
      active: false,
      startX: 0,
      startY: 0,
      currentX: 0,
      currentY: 0,
    });
    
    // Reset game input direction
    const game = (window as any).gameInstance;
    if (game && game.input) {
      game.input.joystickDir = new Vector2(0, 0);
    }
  };

  const handleBoostStart = (e: React.TouchEvent<HTMLDivElement>) => {
    e.stopPropagation();
    e.preventDefault();
    const game = (window as any).gameInstance;
    if (game && game.input) {
      game.input.isBoosting = true;
    }
  };

  const handleBoostEnd = (e: React.TouchEvent<HTMLDivElement>) => {
    e.stopPropagation();
    e.preventDefault();
    const game = (window as any).gameInstance;
    if (game && game.input) {
      game.input.isBoosting = false;
    }
  };

  // Joystick CSS offset
  const baseStyle: React.CSSProperties = joystick.active ? {
    display: 'block',
    left: `${joystick.startX}px`,
    top: `${joystick.startY}px`,
  } : {};

  const knobStyle: React.CSSProperties = joystick.active ? {
    left: `${joystick.currentX - joystick.startX + 50}px`, // centered inside 100px base
    top: `${joystick.currentY - joystick.startY + 50}px`,
  } : {};

  return (
    <div className="touch-controls-container">
      {/* Steering Zone (Left half of screen) */}
      <div 
        ref={joystickZoneRef}
        className="joystick-zone"
        onTouchStart={handleTouchStart}
        onTouchMove={handleTouchMove}
        onTouchEnd={handleTouchEnd}
        onTouchCancel={handleTouchEnd}
      />

      {/* Visual Joystick */}
      <div className="joystick-base" style={baseStyle}>
        <div className="joystick-knob" style={knobStyle} />
      </div>

      {/* Action Zone (Right half of screen) */}
      <div className="boost-button-zone">
        <div 
          className="boost-button"
          onTouchStart={handleBoostStart}
          onTouchEnd={handleBoostEnd}
          onTouchCancel={handleBoostEnd}
        >
          <Zap size={32} />
        </div>
      </div>
    </div>
  );
};

export default TouchControls;
