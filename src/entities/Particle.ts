import { Entity } from './Entity';
import { Camera } from '../engine/Camera';
import { Vector2 } from '../engine/Vector2';

export class Particle extends Entity {
  private life: number;
  private maxLife: number;
  private color: string;
  private sizeDecay: number;

  constructor(x: number, y: number, velocity: Vector2, color: string, maxLife: number = 1.0, initialRadius: number = 5) {
    super(x, y, initialRadius);
    this.velocity = velocity;
    this.color = color;
    this.maxLife = maxLife;
    this.life = maxLife;
    this.sizeDecay = initialRadius / maxLife;
  }

  update(deltaTime: number) {
    this.position = this.position.add(this.velocity.mul(deltaTime));
    this.life -= deltaTime;
    
    // Slow down over time (friction)
    this.velocity = this.velocity.mul(0.95);
    
    // Shrink over time
    this.radius -= this.sizeDecay * deltaTime;
    if (this.radius < 0) this.radius = 0;

    if (this.life <= 0) {
      this.isDead = true;
    }
  }

  draw(ctx: CanvasRenderingContext2D, camera: Camera) {
    if (this.radius <= 0) return;

    const screenPos = camera.w2s(this.position);
    const screenRadius = this.radius * camera.zoom;

    // Fade out based on life
    const alpha = Math.max(0, this.life / this.maxLife);
    
    ctx.beginPath();
    ctx.arc(screenPos.x, screenPos.y, screenRadius, 0, Math.PI * 2);
    ctx.fillStyle = this.color;
    ctx.globalAlpha = alpha;
    ctx.fill();
    ctx.closePath();
    ctx.globalAlpha = 1.0; // Reset
  }
}
