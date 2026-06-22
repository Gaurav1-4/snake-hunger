import { Entity } from './Entity';
import { Vector2 } from '../engine/Vector2';
import { Camera } from '../engine/Camera';
import { Particle } from './Particle';
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
  private skinColor: string = '#ffffff';
  private glowColor: string = '#00f3ff';
  public isPlayer: boolean;
  public name: string = 'ASTRONAUT';
  public trailType: string = 'none';

  constructor(x: number, y: number, isPlayer: boolean = false) {
    super(x, y, 20); // Head radius
    
    // Initial segments
    for (let i = 0; i < 5; i++) {
      this.segments.push(new SnakeSegment(new Vector2(x - i * 15, y), this.radius * 0.9));
    }

    this.isPlayer = isPlayer;

    if (isPlayer) {
      const pStore = usePlayerStore.getState();
      this.name = pStore.nickname || 'ASTRONAUT';
      this.trailType = pStore.equippedTrail || 'none';
      
      const skin = pStore.equippedSkin;
      if (skin === 'neon_green') {
        this.glowColor = '#00ff66';
      } else if (skin === 'cyber_red') {
        this.glowColor = '#ff003c';
      } else if (skin === 'plasma') {
        this.glowColor = '#ff00ea';
      } else if (skin === 'gold') {
        this.glowColor = '#ffea00';
      } else {
        this.glowColor = '#00f3ff'; // neon_blue
      }
    } else {
      // AI Snake Setup with futuristic names
      const aiNames = [
        'VoidViper', 'CosmoDrifter', 'NovaBoa', 'SolarSerpent', 'StellarPython', 
        'NebulaNoodle', 'ChronoPython', 'GalaxyGlider', 'QuantumWorm', 'EclipseViper', 
        'MeteorConstrictor', 'PulsarPython', 'Hyperion', 'Orion', 'SiriusSerpent', 
        'QuasarWorm', 'AstroViper', 'DarkEnergy', 'RedGiant', 'WarpSpeed', 
        'Supernova', 'BlackHole', 'EventHorizon', 'CosmicDust'
      ];
      this.name = aiNames[Math.floor(Math.random() * aiNames.length)];
      
      // Random cosmetic variety for bot skins
      const botGlows = ['#ff003c', '#bd00ff', '#ff00ea', '#ffea00', '#00ff66', '#00f3ff'];
      this.glowColor = botGlows[Math.floor(Math.random() * botGlows.length)];

      // 25% chance of bots having trails
      if (Math.random() < 0.25) {
        const trails = ['neon_pulse', 'sparkles', 'rainbow', 'fire'];
        this.trailType = trails[Math.floor(Math.random() * trails.length)];
      }
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

  update(deltaTime: number, particles?: Particle[]) {
    // Smooth rotation towards target direction
    let baseTurnSpeed = 5;
    if (this.isPlayer) {
      const userSensitivity = usePlayerStore.getState().sensitivity; // 1 to 10
      // Map 1-10 sensitivity to a turn speed factor (1 -> 1.5, 5 -> 6.1, 10 -> 11.85)
      baseTurnSpeed = 1.5 + (userSensitivity - 1) * 1.15;
    }
    const turnSpeed = baseTurnSpeed * deltaTime;
    
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

    // Spawn trail particles at the tail
    if (particles && this.trailType !== 'none' && this.segments.length > 0) {
      if (Math.random() < 0.6) {
        const lastSeg = this.segments[this.segments.length - 1];
        const pos = lastSeg.position;
        
        // Spawn particle based on trail type
        const speedFactor = 25;
        const angle = Math.random() * Math.PI * 2;
        const drift = new Vector2(Math.cos(angle) * speedFactor, Math.sin(angle) * speedFactor).sub(this.velocity.mul(0.15));
        
        let pColor = this.glowColor;
        let initialRadius = 4;
        let maxLife = 0.5;
        
        if (this.trailType === 'sparkles') {
          pColor = '#ffea00';
          initialRadius = 3;
          maxLife = 0.4;
        } else if (this.trailType === 'rainbow') {
          const hue = (Date.now() / 6) % 360;
          pColor = `hsl(${hue}, 100%, 60%)`;
          initialRadius = 4.5;
          maxLife = 0.6;
        } else if (this.trailType === 'fire') {
          pColor = Math.random() > 0.5 ? '#ff4500' : '#ff8c00';
          initialRadius = 5.5;
          maxLife = 0.75;
          drift.y -= 35; // drift upwards
        }
        
        particles.push(new Particle(pos.x, pos.y, drift, pColor, maxLife, initialRadius));
      }
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

    // Draw Name above head
    ctx.fillStyle = this.isPlayer ? '#00f3ff' : 'rgba(255, 255, 255, 0.75)';
    ctx.font = `bold ${Math.max(10, 11 * camera.zoom)}px var(--font-heading)`;
    ctx.textAlign = 'center';
    ctx.shadowBlur = 4 * camera.zoom;
    ctx.shadowColor = 'black';
    ctx.fillText(this.name, headScreenPos.x, headScreenPos.y - headScreenRadius - 12 * camera.zoom);
    ctx.shadowBlur = 0; // reset
  }
}
