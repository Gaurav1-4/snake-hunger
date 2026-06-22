import { Entity } from './Entity';
import { Camera } from '../engine/Camera';

export type PowerupType = 'speed' | 'shield' | 'magnet' | 'double_points';

export class Powerup extends Entity {
  public type: PowerupType;
  public duration: number; // in seconds
  private color: string;
  private timeAlive: number = 0;
  private iconText: string;

  constructor(x: number, y: number, type: PowerupType) {
    super(x, y, 15);
    this.type = type;

    switch (type) {
      case 'speed':
        this.duration = 10;
        this.color = '#00f3ff'; // Blue
        this.iconText = '>>';
        break;
      case 'shield':
        this.duration = 15;
        this.color = '#00ff66'; // Green
        this.iconText = 'O';
        break;
      case 'magnet':
        this.duration = 10;
        this.color = '#ff00ea'; // Purple
        this.iconText = 'U';
        break;
      case 'double_points':
        this.duration = 20;
        this.color = '#ffea00'; // Yellow
        this.iconText = 'x2';
        break;
    }
  }

  update(deltaTime: number) {
    this.timeAlive += deltaTime;
  }

  draw(ctx: CanvasRenderingContext2D, camera: Camera) {
    const screenPos = camera.w2s(this.position);
    const floatY = Math.sin(this.timeAlive * 4) * 5 * camera.zoom;
    const screenRadius = this.radius * camera.zoom;

    if (
      screenPos.x < -screenRadius || 
      screenPos.x > camera.viewportWidth + screenRadius ||
      screenPos.y < -screenRadius || 
      screenPos.y > camera.viewportHeight + screenRadius
    ) {
      return;
    }

    // Draw Hexagon for powerups
    ctx.beginPath();
    for (let i = 0; i < 6; i++) {
      const angle = (Math.PI / 3) * i + this.timeAlive;
      const px = screenPos.x + Math.cos(angle) * screenRadius;
      const py = screenPos.y + floatY + Math.sin(angle) * screenRadius;
      if (i === 0) ctx.moveTo(px, py);
      else ctx.lineTo(px, py);
    }
    ctx.closePath();

    ctx.strokeStyle = this.color;
    ctx.lineWidth = 3 * camera.zoom;
    ctx.shadowBlur = 15 * camera.zoom;
    ctx.shadowColor = this.color;
    ctx.stroke();

    // Fill slightly transparent
    ctx.fillStyle = `rgba(0, 0, 0, 0.5)`;
    ctx.fill();

    // Text inside
    ctx.fillStyle = this.color;
    ctx.font = `bold ${14 * camera.zoom}px var(--font-heading)`;
    ctx.textAlign = 'center';
    ctx.textBaseline = 'middle';
    ctx.shadowBlur = 0;
    ctx.fillText(this.iconText, screenPos.x, screenPos.y + floatY);
  }
}
