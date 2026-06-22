import { Entity } from './Entity';
import { Camera } from '../engine/Camera';
import { Vector2 } from '../engine/Vector2';

export class BossBullet extends Entity {
  private color: string;
  private life: number = 5.0; // 5 seconds lifetime
  private maxLife: number = 5.0;

  constructor(x: number, y: number, velocity: Vector2, color: string = '#ff003c') {
    super(x, y, 10); // bullet radius
    this.velocity = velocity;
    this.color = color;
  }

  update(deltaTime: number) {
    this.position = this.position.add(this.velocity.mul(deltaTime));
    this.life -= deltaTime;
    
    if (this.life <= 0) {
      this.isDead = true;
    }
  }

  draw(ctx: CanvasRenderingContext2D, camera: Camera) {
    if (this.isDead) return;

    const screenPos = camera.w2s(this.position);
    const screenRadius = this.radius * camera.zoom;

    // Cull if off screen
    if (
      screenPos.x < -screenRadius || 
      screenPos.x > camera.viewportWidth + screenRadius ||
      screenPos.y < -screenRadius || 
      screenPos.y > camera.viewportHeight + screenRadius
    ) {
      return;
    }

    const alpha = Math.max(0, this.life / this.maxLife);

    ctx.save();
    ctx.globalAlpha = alpha;

    // Outer plasma glow
    ctx.beginPath();
    ctx.arc(screenPos.x, screenPos.y, screenRadius * 1.5, 0, Math.PI * 2);
    ctx.fillStyle = this.color;
    ctx.shadowBlur = 15 * camera.zoom;
    ctx.shadowColor = this.color;
    ctx.fill();
    ctx.closePath();

    // Inner hot core
    ctx.beginPath();
    ctx.arc(screenPos.x, screenPos.y, screenRadius * 0.7, 0, Math.PI * 2);
    ctx.fillStyle = '#ffffff';
    ctx.shadowBlur = 0;
    ctx.fill();
    ctx.closePath();

    ctx.restore();
  }
}
