import { Entity } from './Entity';
import { Camera } from '../engine/Camera';
import { Vector2 } from '../engine/Vector2';

export class Asteroid extends Entity {
  private points: Vector2[] = [];
  private rotation: number = 0;
  private rotationSpeed: number;

  constructor(x: number, y: number, radius: number) {
    super(x, y, radius);
    this.rotationSpeed = (Math.random() - 0.5) * 2; // radians per second
    
    // Generate random asteroid shape (smoother, less variance)
    const numPoints = 8 + Math.floor(Math.random() * 4);
    for (let i = 0; i < numPoints; i++) {
      const angle = (i / numPoints) * Math.PI * 2;
      // Less variance so it's not too jagged
      const r = radius * (0.85 + Math.random() * 0.15);
      this.points.push(new Vector2(Math.cos(angle) * r, Math.sin(angle) * r));
    }
  }

  update(deltaTime: number) {
    this.rotation += this.rotationSpeed * deltaTime;
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
    ctx.rotate(this.rotation);

    // Calculate midpoints for rounded polygon drawing
    const midpoints: Vector2[] = [];
    for (let i = 0; i < this.points.length; i++) {
      const p1 = this.points[i];
      const p2 = this.points[(i + 1) % this.points.length];
      midpoints.push(new Vector2((p1.x + p2.x) / 2, (p1.y + p2.y) / 2));
    }

    ctx.beginPath();
    const startMid = midpoints[0];
    ctx.moveTo(startMid.x * camera.zoom, startMid.y * camera.zoom);
    
    for (let i = 0; i < this.points.length; i++) {
      const p = this.points[(i + 1) % this.points.length];
      const nextMid = midpoints[(i + 1) % midpoints.length];
      ctx.quadraticCurveTo(
         p.x * camera.zoom, p.y * camera.zoom, 
         nextMid.x * camera.zoom, nextMid.y * camera.zoom
      );
    }
    ctx.closePath();

    // Create gradient for 3D spherical asteroid effect
    const grad = ctx.createRadialGradient(
      -screenRadius * 0.3, -screenRadius * 0.3, 0,
      0, 0, screenRadius * 1.2
    );
    grad.addColorStop(0, '#2a2a4e'); // Highlight
    grad.addColorStop(1, '#0b0b14'); // Dark shadow

    ctx.fillStyle = grad;
    ctx.shadowBlur = 10 * camera.zoom;
    ctx.shadowColor = '#000000';
    ctx.fill();
    
    // Draw some simple craters using the asteroid's local points to keep them static
    ctx.shadowBlur = 0;
    ctx.fillStyle = 'rgba(5, 5, 10, 0.6)';
    for (let i = 0; i < Math.min(3, this.points.length); i++) {
      const cx = (this.points[i].x * 0.4) * camera.zoom;
      const cy = (this.points[i].y * 0.4) * camera.zoom;
      const cr = (this.radius * 0.15 + (i%2)*this.radius*0.1) * camera.zoom;
      ctx.beginPath();
      ctx.arc(cx, cy, cr, 0, Math.PI * 2);
      ctx.fill();
    }

    ctx.strokeStyle = '#3a3e59';
    ctx.lineWidth = 2 * camera.zoom;
    ctx.stroke();

    ctx.restore();
  }
}
