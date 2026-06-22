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

    // Determine cyber color theme (alternating based on coordinates)
    const isCyan = Math.floor((this.position.x + this.position.y) / 100) % 2 === 0;
    const primaryColor = isCyan ? '#00f3ff' : '#bd00ff';
    const secondaryColor = isCyan ? 'rgba(0, 243, 255, 0.15)' : 'rgba(189, 0, 255, 0.15)';
    const coreColor = isCyan ? '#ffffff' : '#ff00aa';

    // 1. Draw crystalline outer shape
    ctx.beginPath();
    ctx.moveTo(this.points[0].x * camera.zoom, this.points[0].y * camera.zoom);
    for (let i = 1; i < this.points.length; i++) {
      ctx.lineTo(this.points[i].x * camera.zoom, this.points[i].y * camera.zoom);
    }
    ctx.closePath();

    // 2. Crystalline gradient fill
    const grad = ctx.createRadialGradient(0, 0, 0, 0, 0, screenRadius);
    grad.addColorStop(0, 'rgba(15, 15, 30, 0.9)');
    grad.addColorStop(0.7, secondaryColor);
    grad.addColorStop(1, 'rgba(5, 5, 15, 0.6)');
    ctx.fillStyle = grad;
    ctx.fill();

    // 3. Draw internal crystal facet lines for a 3D wireframe look
    ctx.strokeStyle = isCyan ? 'rgba(0, 243, 255, 0.3)' : 'rgba(189, 0, 255, 0.3)';
    ctx.lineWidth = 1 * camera.zoom;
    
    // Connect outer vertices to the center
    ctx.beginPath();
    for (let i = 0; i < this.points.length; i++) {
      ctx.moveTo(0, 0);
      ctx.lineTo(this.points[i].x * camera.zoom, this.points[i].y * camera.zoom);
    }
    ctx.stroke();

    // Draw inner concentric crystal wireframe
    ctx.beginPath();
    ctx.moveTo(this.points[0].x * 0.5 * camera.zoom, this.points[0].y * 0.5 * camera.zoom);
    for (let i = 1; i < this.points.length; i++) {
      ctx.lineTo(this.points[i].x * 0.5 * camera.zoom, this.points[i].y * 0.5 * camera.zoom);
    }
    ctx.closePath();
    ctx.stroke();

    // 4. Pulsating energetic core
    const pulse = 1 + 0.15 * Math.sin(Date.now() * 0.003 + this.position.x);
    const coreRadius = this.radius * 0.18 * pulse * camera.zoom;
    const coreGrad = ctx.createRadialGradient(0, 0, 0, 0, 0, coreRadius);
    coreGrad.addColorStop(0, '#ffffff');
    coreGrad.addColorStop(0.3, coreColor);
    coreGrad.addColorStop(1, 'rgba(0, 0, 0, 0)');
    ctx.fillStyle = coreGrad;
    ctx.beginPath();
    ctx.arc(0, 0, coreRadius * 1.6, 0, Math.PI * 2);
    ctx.fill();

    // 5. Outer glowing border
    ctx.shadowBlur = 15 * camera.zoom;
    ctx.shadowColor = primaryColor;
    ctx.strokeStyle = primaryColor;
    ctx.lineWidth = 2 * camera.zoom;
    
    ctx.beginPath();
    ctx.moveTo(this.points[0].x * camera.zoom, this.points[0].y * camera.zoom);
    for (let i = 1; i < this.points.length; i++) {
      ctx.lineTo(this.points[i].x * camera.zoom, this.points[i].y * camera.zoom);
    }
    ctx.closePath();
    ctx.stroke();

    ctx.restore();
  }
}
