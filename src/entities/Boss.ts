import { Entity } from './Entity';
import { Camera } from '../engine/Camera';
import { Vector2 } from '../engine/Vector2';
import { Snake } from './Snake';

export class Boss extends Entity {
  private health: number;
  private maxHealth: number;
  public scoreValue: number = 500;
  
  private points: Vector2[] = [];
  private timeAlive: number = 0;

  constructor(x: number, y: number, level: number) {
    super(x, y, 100 + level * 20); // Boss gets bigger with level
    
    this.maxHealth = 5 + level * 5;
    this.health = this.maxHealth;

    // Generate shape
    const numPoints = 12;
    for (let i = 0; i < numPoints; i++) {
      const angle = (i / numPoints) * Math.PI * 2;
      const r = this.radius * (0.8 + Math.random() * 0.4);
      this.points.push(new Vector2(Math.cos(angle) * r, Math.sin(angle) * r));
    }
  }

  update(deltaTime: number, player: Snake) {
    this.timeAlive += deltaTime;
    
    // Simple AI: Move towards player slowly
    const dir = player.position.sub(this.position).normalize();
    this.velocity = dir.mul(50); // Slow movement
    
    this.position = this.position.add(this.velocity.mul(deltaTime));
  }

  takeDamage(amount: number) {
    this.health -= amount;
    if (this.health <= 0) {
      this.isDead = true;
    }
  }

  draw(ctx: CanvasRenderingContext2D, camera: Camera) {
    const screenPos = camera.w2s(this.position);
    const screenRadius = this.radius * camera.zoom;

    if (
      screenPos.x < -screenRadius * 1.5 || 
      screenPos.x > camera.viewportWidth + screenRadius * 1.5 ||
      screenPos.y < -screenRadius * 1.5 || 
      screenPos.y > camera.viewportHeight + screenRadius * 1.5
    ) {
      return;
    }

    ctx.save();
    ctx.translate(screenPos.x, screenPos.y);
    
    // Pulsating effect
    const pulse = 1 + Math.sin(this.timeAlive * 5) * 0.1;
    ctx.scale(pulse, pulse);

    ctx.beginPath();
    for (let i = 0; i < this.points.length; i++) {
      const p = this.points[i];
      const px = p.x * camera.zoom;
      const py = p.y * camera.zoom;
      if (i === 0) ctx.moveTo(px, py);
      else ctx.lineTo(px, py);
    }
    ctx.closePath();

    ctx.fillStyle = '#2a0a18';
    ctx.fill();
    ctx.strokeStyle = '#ff003c';
    ctx.lineWidth = 4 * camera.zoom;
    ctx.shadowBlur = 30 * camera.zoom;
    ctx.shadowColor = '#ff003c';
    ctx.stroke();

    // Health bar
    ctx.fillStyle = '#000000';
    ctx.fillRect(-50 * camera.zoom, -screenRadius - 30 * camera.zoom, 100 * camera.zoom, 10 * camera.zoom);
    ctx.fillStyle = '#ff003c';
    ctx.fillRect(-50 * camera.zoom, -screenRadius - 30 * camera.zoom, (this.health / this.maxHealth) * 100 * camera.zoom, 10 * camera.zoom);

    ctx.restore();
  }
}
