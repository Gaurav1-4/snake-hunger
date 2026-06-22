import { Entity } from './Entity';
import { Vector2 } from '../engine/Vector2';
import { Camera } from '../engine/Camera';
import { usePlayerStore } from '../store/usePlayerStore';

export class SnakeSegment {
  public position: Vector2;
  public radius: number;

  constructor(position: Vector2, radius: number) {
    this.position = position;
    this.radius = radius;
  }
}

export class Snake extends Entity {
  public segments: SnakeSegment[] = [];
  public targetDirection: Vector2 = new Vector2(1, 0);
  public currentDirection: Vector2 = new Vector2(1, 0);
  
  private baseSpeed: number = 300; // units per second
  private boostMultiplier: number = 2;
  public isBoosting: boolean = false;
  
  public score: number = 0;
  private skinColor: string;
  private glowColor: string;

  constructor(x: number, y: number, isPlayer: boolean = false) {
    super(x, y, 20); // Head radius
    
    // Initial segments
    for (let i = 0; i < 5; i++) {
      this.segments.push(new SnakeSegment(new Vector2(x - i * 15, y), this.radius * 0.9));
    }

    if (isPlayer) {
      const skin = usePlayerStore.getState().equippedSkin;
      // Simple color mapping based on skin
      if (skin === 'neon_blue') {
        this.skinColor = '#ffffff';
        this.glowColor = '#00f3ff';
      } else {
        this.skinColor = '#ffffff';
        this.glowColor = '#00ff66';
      }
    } else {
      this.skinColor = '#ffffff';
      this.glowColor = '#ff003c'; // Enemy color
    }
  }

  setDirection(dir: Vector2) {
    if (dir.magSq() > 0) {
      this.targetDirection = dir.normalize();
    }
  }

  setBoost(boost: boolean) {
    this.isBoosting = boost;
  }

  update(deltaTime: number) {
    // Smooth rotation towards target direction
    const turnSpeed = 5 * deltaTime;
    
    // Simple interpolation for direction
    this.currentDirection.x += (this.targetDirection.x - this.currentDirection.x) * turnSpeed;
    this.currentDirection.y += (this.targetDirection.y - this.currentDirection.y) * turnSpeed;
    this.currentDirection = this.currentDirection.normalize();

    // Movement
    const speed = this.baseSpeed * (this.isBoosting ? this.boostMultiplier : 1);
    this.velocity = this.currentDirection.mul(speed);
    
    // Move head
    this.position = this.position.add(this.velocity.mul(deltaTime));

    // Move segments
    let prevPos = this.position.clone();
    
    for (let i = 0; i < this.segments.length; i++) {
      const segment = this.segments[i];
      const dist = segment.position.distance(prevPos);
      const targetDist = i === 0 ? this.radius : this.segments[i - 1].radius * 1.5;

      if (dist > targetDist) {
        const dir = prevPos.sub(segment.position).normalize();
        segment.position = prevPos.sub(dir.mul(targetDist));
      }
      
      prevPos = segment.position.clone();
    }
  }

  grow(amount: number = 1) {
    for (let i = 0; i < amount; i++) {
      const lastSegment = this.segments[this.segments.length - 1];
      this.segments.push(new SnakeSegment(lastSegment.position.clone(), lastSegment.radius));
    }
  }

  draw(ctx: CanvasRenderingContext2D, camera: Camera) {
    const headScreenPos = camera.w2s(this.position);
    const headScreenRadius = this.radius * camera.zoom;

    // Draw continuous spine for the body
    if (this.segments.length > 0) {
      ctx.beginPath();
      ctx.moveTo(headScreenPos.x, headScreenPos.y);
      for (let i = 0; i < this.segments.length; i++) {
        const seg = camera.w2s(this.segments[i].position);
        ctx.lineTo(seg.x, seg.y);
      }
      
      ctx.lineCap = 'round';
      ctx.lineJoin = 'round';
      ctx.lineWidth = headScreenRadius * 1.5;
      
      // Outer glow
      ctx.strokeStyle = this.skinColor;
      ctx.shadowBlur = 25 * camera.zoom;
      ctx.shadowColor = this.glowColor;
      ctx.stroke();
      
      // Inner bright core
      ctx.lineWidth = headScreenRadius * 0.8;
      ctx.strokeStyle = '#ffffff';
      ctx.shadowBlur = 0;
      ctx.stroke();
      ctx.closePath();
    }

    // Draw Head
    ctx.beginPath();
    ctx.arc(headScreenPos.x, headScreenPos.y, headScreenRadius * 1.1, 0, Math.PI * 2);
    ctx.fillStyle = '#ffffff';
    ctx.shadowBlur = 30 * camera.zoom;
    ctx.shadowColor = this.glowColor;
    ctx.fill();
    
    // Add an inner bright spot to the head
    ctx.beginPath();
    ctx.arc(headScreenPos.x, headScreenPos.y, headScreenRadius * 0.5, 0, Math.PI * 2);
    ctx.fillStyle = this.glowColor;
    ctx.shadowBlur = 0;
    ctx.fill();

    // Draw Eyes (sleeker alien eyes)
    const eyeOffset = headScreenRadius * 0.6;
    const eyeLength = headScreenRadius * 0.4;
    
    // Calculate perpendicular vector for eye placement
    const perpX = -this.currentDirection.y;
    const perpY = this.currentDirection.x;

    ctx.fillStyle = '#05050f'; // Deep space background color instead of pure black
    
    // Left eye (slanted oval)
    ctx.beginPath();
    ctx.ellipse(
      headScreenPos.x + this.currentDirection.x * eyeOffset + perpX * eyeOffset,
      headScreenPos.y + this.currentDirection.y * eyeOffset + perpY * eyeOffset,
      eyeLength, eyeLength * 0.5,
      Math.atan2(this.currentDirection.y, this.currentDirection.x) + 0.3,
      0, Math.PI * 2
    );
    ctx.fill();
    
    // Right eye (slanted oval)
    ctx.beginPath();
    ctx.ellipse(
      headScreenPos.x + this.currentDirection.x * eyeOffset - perpX * eyeOffset,
      headScreenPos.y + this.currentDirection.y * eyeOffset - perpY * eyeOffset,
      eyeLength, eyeLength * 0.5,
      Math.atan2(this.currentDirection.y, this.currentDirection.x) - 0.3,
      0, Math.PI * 2
    );
    ctx.fill();
  }
}
