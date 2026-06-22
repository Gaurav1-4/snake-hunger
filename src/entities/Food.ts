import { Entity } from './Entity';
import { Camera } from '../engine/Camera';

export type FoodType = 'basic' | 'rare' | 'epic' | 'legendary';

export class Food extends Entity {
  public type: FoodType;
  public scoreValue: number;
  public growthValue: number;
  private color: string;
  public glowColor: string;
  private timeAlive: number = 0;
  private hoverOffset: number = Math.random() * Math.PI * 2;

  constructor(x: number, y: number, type: FoodType = 'basic') {
    super(x, y, type === 'basic' ? 10 : type === 'rare' ? 15 : type === 'epic' ? 20 : 30);
    this.type = type;

    switch (type) {
      case 'legendary':
        this.scoreValue = 50;
        this.growthValue = 20;
        this.color = '#ffffff';
        this.glowColor = '#ffea00'; // Yellow/Gold
        break;
      case 'epic':
        this.scoreValue = 15;
        this.growthValue = 7;
        this.color = '#ffffff';
        this.glowColor = '#ff00ea'; // Purple
        break;
      case 'rare':
        this.scoreValue = 5;
        this.growthValue = 3;
        this.color = '#ffffff';
        this.glowColor = '#00f3ff'; // Blue
        break;
      case 'basic':
      default:
        this.scoreValue = 1;
        this.growthValue = 1;
        this.color = '#ffffff';
        this.glowColor = '#00ff66'; // Green
        break;
    }
  }

  update(deltaTime: number) {
    this.timeAlive += deltaTime;
  }

  draw(ctx: CanvasRenderingContext2D, camera: Camera) {
    const screenPos = camera.w2s(this.position);
    
    // Add floating animation
    const floatY = Math.sin(this.timeAlive * 3 + this.hoverOffset) * 5 * camera.zoom;
    
    const screenRadius = this.radius * camera.zoom;

    // Frustum culling
    if (
      screenPos.x < -screenRadius || 
      screenPos.x > camera.viewportWidth + screenRadius ||
      screenPos.y < -screenRadius || 
      screenPos.y > camera.viewportHeight + screenRadius
    ) {
      return;
    }

    ctx.beginPath();
    // Inner core with pulse
    const pulse = 1 + Math.sin(this.timeAlive * 5 + this.hoverOffset) * 0.2;
    ctx.arc(screenPos.x, screenPos.y + floatY, screenRadius * 0.5 * pulse, 0, Math.PI * 2);
    ctx.fillStyle = this.color;
    ctx.shadowBlur = 20 * camera.zoom;
    ctx.shadowColor = this.glowColor;
    ctx.fill();
    ctx.closePath();
    
    // Outer diamond/star shape based on type
    if (this.type !== 'basic') {
      ctx.beginPath();
      const points = this.type === 'legendary' ? 8 : this.type === 'epic' ? 6 : 4;
      const step = (Math.PI * 2) / points;
      const rotation = this.timeAlive * 2;
      
      for (let i = 0; i < points * 2; i++) {
        const r = i % 2 === 0 ? screenRadius : screenRadius * 0.4;
        const angle = rotation + i * step / 2;
        const px = screenPos.x + Math.cos(angle) * r;
        const py = screenPos.y + floatY + Math.sin(angle) * r;
        if (i === 0) ctx.moveTo(px, py);
        else ctx.lineTo(px, py);
      }
      ctx.closePath();
      
      ctx.strokeStyle = this.glowColor;
      ctx.lineWidth = 2 * camera.zoom;
      ctx.shadowBlur = 10 * camera.zoom;
      ctx.stroke();
    } else {
      // Basic food subtle outer ring
      ctx.beginPath();
      ctx.arc(screenPos.x, screenPos.y + floatY, screenRadius * 0.8, 0, Math.PI * 2);
      ctx.strokeStyle = this.glowColor;
      ctx.lineWidth = 1.5 * camera.zoom;
      ctx.globalAlpha = 0.5 + Math.sin(this.timeAlive * 3) * 0.2;
      ctx.stroke();
      ctx.globalAlpha = 1.0;
    }
  }
}
