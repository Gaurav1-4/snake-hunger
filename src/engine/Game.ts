import { Camera } from './Camera';
import { Input } from './Input';
import { Vector2 } from './Vector2';
import { Snake } from '../entities/Snake';
import { Food, type FoodType } from '../entities/Food';
import { Asteroid } from '../entities/Asteroid';
import { Particle } from '../entities/Particle';
import { Powerup, type PowerupType } from '../entities/Powerup';
import { Boss } from '../entities/Boss';
import { BossBullet } from '../entities/BossBullet';
import { playSynthSound } from '../utils/audio';
import { useGameStore } from '../store/useGameStore';
import { usePlayerStore } from '../store/usePlayerStore';

interface CosmicObject {
  x: number;
  y: number;
  radius: number;
  colorStart: string;
  colorEnd: string;
  hasRings: boolean;
  ringColor: string;
  parallax: number;
}

export class Game {
  private canvas: HTMLCanvasElement;
  private ctx: CanvasRenderingContext2D;
  private camera: Camera;
  public input: Input;
  
  private lastTime: number = 0;
  private animationFrameId: number | null = null;
  private isRunning: boolean = false;
  
  public player: Snake;
  public foods: Food[] = [];
  public asteroids: Asteroid[] = [];
  public particles: Particle[] = [];
  public powerups: Powerup[] = [];
  public bosses: Boss[] = [];
  public bossBullets: BossBullet[] = [];
  public aiSnakes: Snake[] = [];
  
  public readonly WORLD_SIZE = 10000;
  
  private activePowerups: Map<PowerupType, number> = new Map(); // Type to time remaining
  private lastBossScore: number = 0;

  private cosmicObjects: CosmicObject[] = [];

  constructor(canvas: HTMLCanvasElement) {
    this.canvas = canvas;
    const ctx = canvas.getContext('2d');
    if (!ctx) throw new Error('Could not get 2d context');
    this.ctx = ctx;

    this.resizeCanvas = this.resizeCanvas.bind(this);
    this.resizeCanvas();
    window.addEventListener('resize', this.resizeCanvas);

    this.camera = new Camera(this.canvas.width, this.canvas.height);
    this.input = new Input();
    (window as any).gameInstance = this;

    this.player = new Snake(0, 0, true);
    
    this.initCosmicBackground();
    this.initWorld();
    
    this.loop = this.loop.bind(this);
  }

  private initCosmicBackground() {
    // Generate distinct cosmic background objects (glowing gas planets & ring planets)
    this.cosmicObjects = [
      {
        x: -2500, y: -2000, radius: 450,
        colorStart: '#1d0b3a', colorEnd: '#bd00ff',
        hasRings: true, ringColor: 'rgba(189, 0, 255, 0.25)',
        parallax: 0.15
      },
      {
        x: 3500, y: -3000, radius: 600,
        colorStart: '#021e2b', colorEnd: '#00f3ff',
        hasRings: false, ringColor: '',
        parallax: 0.1
      },
      {
        x: -4500, y: 4000, radius: 350,
        colorStart: '#2b0c16', colorEnd: '#ff003c',
        hasRings: false, ringColor: '',
        parallax: 0.2
      },
      {
        x: 3000, y: 2500, radius: 500,
        colorStart: '#08321e', colorEnd: '#00ff66',
        hasRings: true, ringColor: 'rgba(0, 255, 102, 0.18)',
        parallax: 0.18
      },
      {
        x: 0, y: -5000, radius: 900,
        colorStart: '#2b2405', colorEnd: '#ffea00',
        hasRings: false, ringColor: '',
        parallax: 0.05
      }
    ];
  }

  private initWorld() {
    // Spawn initial food
    for (let i = 0; i < 500; i++) {
      this.spawnFood();
    }
    
    // Spawn Asteroids
    for (let i = 0; i < 200; i++) {
      this.spawnAsteroid();
    }
    
    // Spawn AI Snakes
    for (let i = 0; i < 20; i++) {
      this.spawnAISnake();
    }
  }

  private spawnAISnake() {
    let x, y;
    do {
      x = (Math.random() - 0.5) * this.WORLD_SIZE;
      y = (Math.random() - 0.5) * this.WORLD_SIZE;
    } while (this.player && this.player.position && new Vector2(x, y).distance(this.player.position) < 800);
    
    const ai = new Snake(x, y, false);
    ai.grow(Math.floor(5 + Math.random() * 15)); // Start with decent size
    this.aiSnakes.push(ai);
  }

  private spawnFood() {
    const x = (Math.random() - 0.5) * this.WORLD_SIZE;
    const y = (Math.random() - 0.5) * this.WORLD_SIZE;
    
    const r = Math.random();
    let type: FoodType = 'basic';
    if (r < 0.01) type = 'legendary';
    else if (r < 0.05) type = 'epic';
    else if (r < 0.2) type = 'rare';
    
    this.foods.push(new Food(x, y, type));
  }

  private spawnAsteroid() {
    const x = (Math.random() - 0.5) * this.WORLD_SIZE;
    const y = (Math.random() - 0.5) * this.WORLD_SIZE;
    if (Math.abs(x) < 500 && Math.abs(y) < 500) return;
    
    const radius = 50 + Math.random() * 150;
    this.asteroids.push(new Asteroid(x, y, radius));
  }

  public spawnParticles(x: number, y: number, color: string, count: number) {
    for (let i = 0; i < count; i++) {
      const angle = Math.random() * Math.PI * 2;
      const speed = 50 + Math.random() * 150;
      const vel = new Vector2(Math.cos(angle) * speed, Math.sin(angle) * speed);
      this.particles.push(new Particle(x, y, vel, color, 0.5 + Math.random() * 0.5, 3 + Math.random() * 5));
    }
  }

  private resizeCanvas() {
    this.canvas.width = window.innerWidth;
    this.canvas.height = window.innerHeight;

    if (this.camera) {
      this.camera.resize(this.canvas.width, this.canvas.height);
    }
  }

  public start() {
    if (this.isRunning) return;
    
    if (this.player.isDead) {
      this.player = new Snake(0, 0, true);
      this.foods = [];
      this.asteroids = [];
      this.particles = [];
      this.bosses = [];
      this.bossBullets = [];
      this.aiSnakes = [];
      this.lastBossScore = 0;
      this.activePowerups.clear();
      this.camera.position = new Vector2(0, 0);
      this.initWorld();
      this.input.joystickDir = new Vector2(0, 0);
      this.input.isBoosting = false;
      
      // Reset game store stats but keep the current gameState (e.g. 'menu')
      const store = useGameStore.getState();
      store.setScore(0);
      store.setLevel(1);
    } else if (this.player) {
      const pStore = usePlayerStore.getState();
      this.player.name = pStore.nickname || 'ASTRONAUT';
      this.player.trailType = pStore.equippedTrail || 'none';
      
      // Update glow/skin
      const skin = pStore.equippedSkin;
      if (skin === 'neon_green') {
        (this.player as any).glowColor = '#00ff66';
      } else if (skin === 'cyber_red') {
        (this.player as any).glowColor = '#ff003c';
      } else if (skin === 'plasma') {
        (this.player as any).glowColor = '#ff00ea';
      } else if (skin === 'gold') {
        (this.player as any).glowColor = '#ffea00';
      } else {
        (this.player as any).glowColor = '#00f3ff';
      }
    }
    
    this.isRunning = true;
    this.lastTime = performance.now();
    this.animationFrameId = requestAnimationFrame(this.loop);
  }

  public startMenuBackground() {
    this.start();
  }

  public pause() {
    this.isRunning = false;
    if (this.animationFrameId) {
      cancelAnimationFrame(this.animationFrameId);
      this.animationFrameId = null;
    }
  }

  public destroy() {
    this.pause();
    window.removeEventListener('resize', this.resizeCanvas);
  }

  private loop(currentTime: number) {
    if (!this.isRunning) return;

    const deltaTime = (currentTime - this.lastTime) / 1000;
    this.lastTime = currentTime;

    const safeDeltaTime = Math.min(deltaTime, 0.1);

    this.update(safeDeltaTime);
    this.render();

    if (this.isRunning) {
      this.animationFrameId = requestAnimationFrame(this.loop);
    }
  }

  private update(deltaTime: number) {
    const gameState = useGameStore.getState().gameState;

    if (gameState === 'playing') {
      // Powerups Update
      for (const [type, time] of this.activePowerups.entries()) {
        const newTime = time - deltaTime;
        if (newTime <= 0) {
          this.activePowerups.delete(type);
          useGameStore.getState().removePowerup(type);
        } else {
          this.activePowerups.set(type, newTime);
        }
      }

      const hasSpeed = this.activePowerups.has('speed');
      const hasMagnet = this.activePowerups.has('magnet');
      const hasDouble = this.activePowerups.has('double_points');
      const hasShield = this.activePowerups.has('shield');

      // Input
      const dir = this.input.getDirectionInput();
      this.player.setDirection(dir);
      this.player.setBoost(this.input.getBoostInput() || hasSpeed);

      // Update Player
      this.player.update(deltaTime, this.particles);

      // Boundaries
      const halfWorld = this.WORLD_SIZE / 2;
      if (this.player.position.x > halfWorld || this.player.position.x < -halfWorld || 
          this.player.position.y > halfWorld || this.player.position.y < -halfWorld) {
          if (!hasShield) {
              this.gameOver();
              return;
          } else {
              // Bounce
              this.player.targetDirection = this.player.targetDirection.mul(-1);
              this.player.currentDirection = this.player.currentDirection.mul(-1);
              this.camera.shake(10);
          }
      }

      // AI Snakes Update
      this.aiSnakes.forEach((ai, i) => {
        if (ai.isDead) return;
        
        let targetPos: Vector2 | null = null;
        let closestFoodDist = Infinity;
        let isFleeing = false;
        let isChasing = false;

        const distToPlayer = ai.position.distance(this.player.position);

        let generalAttraction = new Vector2(0, 0);
        if (distToPlayer > 2000) {
          generalAttraction = this.player.position.sub(ai.position).normalize().mul(0.2);
        }

        if (distToPlayer < 1200 && !this.player.isDead) {
          isChasing = true;
          const predictTime = Math.min(distToPlayer / 300, 2.0);
          const interceptPoint = this.player.position.add(this.player.velocity.mul(predictTime));
          
          const dotProduct = ai.currentDirection.dot(this.player.currentDirection);
          const isBehind = interceptPoint.distance(ai.position) > distToPlayer + 200;
          
          if (isBehind && this.player.segments.length > ai.segments.length + 10) {
             isFleeing = true;
             isChasing = false;
             targetPos = ai.position.add(ai.position.sub(this.player.position).normalize().mul(500));
          } else {
             targetPos = interceptPoint;
             if (distToPlayer < 600 && dotProduct < 0.5) {
               ai.setBoost(true);
             } else {
               ai.setBoost(false);
             }
          }
        }

        if (!isFleeing && !isChasing) {
           ai.setBoost(false);
           this.foods.forEach(f => {
             const dist = ai.position.distance(f.position);
             const effectiveDist = f.type === 'legendary' ? dist * 0.1 : (f.type === 'epic' ? dist * 0.3 : dist);
             if (effectiveDist < closestFoodDist && dist < 1200) {
               closestFoodDist = effectiveDist;
               targetPos = f.position;
             }
           });
           
           if (!targetPos) {
              const timeSec = Date.now() / 2000;
              const wanderNoise = new Vector2(Math.sin(timeSec + i * 5), Math.cos(timeSec + i * 5));
              if (ai.velocity.mag() > 0) {
                targetPos = ai.position.add(ai.velocity.normalize().add(wanderNoise.mul(0.5)).add(generalAttraction).normalize().mul(500));
              } else {
                targetPos = ai.position.add(wanderNoise.add(generalAttraction).mul(500));
              }
           }
        }

        if (targetPos) {
          ai.setDirection(targetPos.sub(ai.position).normalize());
        }

        ai.update(deltaTime, this.particles);

        if (ai.position.x > halfWorld) ai.position.x = halfWorld;
        if (ai.position.x < -halfWorld) ai.position.x = -halfWorld;
        if (ai.position.y > halfWorld) ai.position.y = halfWorld;
        if (ai.position.y < -halfWorld) ai.position.y = -halfWorld;
      });

      // Update bosses & fire plasma bullets
      this.bosses.forEach(b => {
        b.update(deltaTime, this.player);

        // Firing logic
        if (!(b as any).shootTimer) {
          (b as any).shootTimer = 1.5;
        }
        (b as any).shootTimer -= deltaTime;
        
        if ((b as any).shootTimer <= 0) {
          (b as any).shootTimer = 1.2 + Math.random() * 0.8;
          const dist = b.position.distance(this.player.position);
          
          if (dist < 1300 && !this.player.isDead) {
            const dir = this.player.position.sub(b.position).normalize();
            this.bossBullets.push(new BossBullet(b.position.x, b.position.y, dir.mul(450), '#ff003c'));
            playSynthSound('shoot');
          }
        }
      });

      // Update bullets
      this.bossBullets.forEach(bullet => bullet.update(deltaTime));

      // Update other entities
      this.foods.forEach(f => f.update(deltaTime));
      this.asteroids.forEach(a => a.update(deltaTime));
      this.particles.forEach(p => p.update(deltaTime));
      this.powerups.forEach(p => p.update(deltaTime));

      // Remove dead entities
      this.particles = this.particles.filter(p => !p.isDead);
      this.bosses = this.bosses.filter(b => !b.isDead);
      this.bossBullets = this.bossBullets.filter(b => !b.isDead);
      this.aiSnakes = this.aiSnakes.filter(ai => !ai.isDead);

      // Collisions
      this.checkCollisions(hasMagnet, hasDouble, hasShield);

      // Boss Spawning (every 100 score)
      const currentScore = useGameStore.getState().score;
      if (currentScore - this.lastBossScore >= 100) {
        this.lastBossScore = currentScore;
        this.spawnBoss();
        playSynthSound('boss_spawn');
      }

      // Replenish food
      while (this.foods.length < 500) {
        this.spawnFood();
      }
      
      // Replenish AI Snakes
      while (this.aiSnakes.length < 25) {
        this.spawnAISnake();
      }

      // Camera
      const heightScale = Math.max(0.45, Math.min(1.0, this.canvas.height / 900));
      this.camera.targetZoom = (this.player.isBoosting ? 0.8 : 1.0 - (this.player.segments.length * 0.0015)) * heightScale;
      this.camera.targetZoom = Math.max(0.25, Math.min(1.5, this.camera.targetZoom));
      this.camera.update(deltaTime, this.player.position);

    } else if (gameState === 'menu') {
      const angle = performance.now() * 0.0001;
      this.camera.position.x = Math.cos(angle) * 500;
      this.camera.position.y = Math.sin(angle) * 500;
      this.camera.targetZoom = 0.5;
      this.camera.update(deltaTime, this.camera.position);
      this.camera.position = new Vector2(Math.cos(angle) * 500, Math.sin(angle) * 500);
      
      this.asteroids.forEach(a => a.update(deltaTime));
      this.foods.forEach(f => f.update(deltaTime));
    }
  }

  private checkCollisions(hasMagnet: boolean, hasDouble: boolean, hasShield: boolean) {
    // Player Food collision
    const magnetRadius = hasMagnet ? 300 : 0;
    
    for (let i = this.foods.length - 1; i >= 0; i--) {
      const food = this.foods[i];
      const distSq = this.player.position.distance(food.position);
      
      if (hasMagnet && distSq < magnetRadius) {
        const dir = this.player.position.sub(food.position).normalize();
        food.position = food.position.add(dir.mul(500 * 0.016));
      }

      if (distSq < this.player.radius + food.radius) {
        playSynthSound('eat');
        const points = food.scoreValue * (hasDouble ? 2 : 1);
        useGameStore.getState().addScore(points);
        usePlayerStore.getState().addCoins(food.scoreValue);
        this.player.grow(food.growthValue);
        this.player.score += points;
        
        this.spawnParticles(food.position.x, food.position.y, food.glowColor || '#ffffff', 10);
        if (food.type === 'legendary') this.camera.shake(5);
        
        if ((food.type === 'legendary' || food.type === 'epic') && Math.random() < 0.3) {
           const types: PowerupType[] = ['speed', 'shield', 'magnet', 'double_points'];
           this.powerups.push(new Powerup(food.position.x, food.position.y, types[Math.floor(Math.random() * types.length)]));
        }
        
        const store = useGameStore.getState();
        if (store.score > store.level * 100) {
            store.setLevel(store.level + 1);
        }

        this.foods.splice(i, 1);
      }
    }

    // AI Food collision
    for (let i = 0; i < this.aiSnakes.length; i++) {
      const ai = this.aiSnakes[i];
      if (ai.isDead) continue;
      
      for (let j = this.foods.length - 1; j >= 0; j--) {
        const food = this.foods[j];
        const dist = ai.position.distance(food.position);
        
        if (dist < ai.radius + food.radius) {
          ai.grow(food.growthValue);
          ai.score += food.scoreValue;
          
          if (Math.random() < 0.15) {
            this.spawnParticles(food.position.x, food.position.y, food.glowColor || '#ffffff', 4);
          }
          this.foods.splice(j, 1);
        }
      }
    }

    // Powerup collision
    for (let i = this.powerups.length - 1; i >= 0; i--) {
      const powerup = this.powerups[i];
      if (this.player.checkCollision(powerup)) {
        playSynthSound('powerup');
        this.activePowerups.set(powerup.type, powerup.duration);
        useGameStore.getState().addPowerup(powerup.type);
        this.spawnParticles(powerup.position.x, powerup.position.y, '#ffff00', 20);
        this.powerups.splice(i, 1);
      }
    }

    // Asteroid collision
    for (let i = 0; i < this.asteroids.length; i++) {
      if (this.player.checkCollision(this.asteroids[i])) {
        if (!hasShield) {
            this.gameOver();
            return;
        } else {
            playSynthSound('hit');
            this.camera.shake(15);
            this.spawnParticles(this.player.position.x, this.player.position.y, '#ff0000', 30);
            this.player.position = this.player.position.sub(this.player.velocity.normalize().mul(50));
        }
      }
    }

    // AI Snake Collision
    for (let i = 0; i < this.aiSnakes.length; i++) {
      const ai = this.aiSnakes[i];
      if (ai.isDead) continue;
      
      // Player head hits AI body -> Player Dies (unless shielded)
      let playerHitAIBody = false;
      for (let j = 0; j < ai.segments.length; j++) {
        if (this.player.position.distance(ai.segments[j].position) < this.player.radius + ai.segments[j].radius) {
          playerHitAIBody = true;
          break;
        }
      }
      
      if (playerHitAIBody) {
        if (!hasShield) {
          this.gameOver();
          return;
        } else {
          playSynthSound('hit');
          this.camera.shake(10);
          this.player.position = this.player.position.sub(this.player.velocity.normalize().mul(50));
        }
      }
      
      // AI head hits Player body -> AI Dies
      let aiHitPlayerBody = false;
      for (let j = 0; j < this.player.segments.length; j++) {
        if (ai.position.distance(this.player.segments[j].position) < ai.radius + this.player.segments[j].radius) {
          aiHitPlayerBody = true;
          break;
        }
      }
      
      if (aiHitPlayerBody) {
        ai.isDead = true;
        this.spawnParticles(ai.position.x, ai.position.y, '#ff003c', 50);
        ai.segments.forEach(seg => {
            if (Math.random() > 0.5) {
                this.foods.push(new Food(seg.position.x, seg.position.y, 'basic'));
            }
        });
      }
      
      // AI Head to Player Head -> Smaller dies
      if (this.player.position.distance(ai.position) < this.player.radius + ai.radius) {
        if (this.player.segments.length >= ai.segments.length || hasShield) {
          ai.isDead = true;
          this.spawnParticles(ai.position.x, ai.position.y, '#ff003c', 50);
        } else {
          this.gameOver();
          return;
        }
      }
    }

    // Boss collision
    for (let i = 0; i < this.bosses.length; i++) {
      const boss = this.bosses[i];
      if (this.player.checkCollision(boss)) {
        if (this.player.isBoosting || hasShield) {
          playSynthSound('hit');
          boss.takeDamage(1);
          this.camera.shake(10);
          this.spawnParticles(boss.position.x, boss.position.y, '#ffea00', 20);
          this.player.position = this.player.position.sub(this.player.velocity.normalize().mul(50));
          
          if (boss.isDead) {
            useGameStore.getState().addScore(boss.scoreValue);
            usePlayerStore.getState().addCoins(boss.scoreValue);
            this.spawnParticles(boss.position.x, boss.position.y, '#ff003c', 100);
            this.camera.shake(30);
            this.powerups.push(new Powerup(boss.position.x + 50, boss.position.y, 'double_points'));
            this.powerups.push(new Powerup(boss.position.x - 50, boss.position.y, 'magnet'));
          }
        } else {
          this.gameOver();
          return;
        }
      }
    }

    // Boss bullets collision
    for (let i = this.bossBullets.length - 1; i >= 0; i--) {
      const bullet = this.bossBullets[i];
      if (this.player.position.distance(bullet.position) < this.player.radius + bullet.radius) {
        bullet.isDead = true;
        
        if (hasShield) {
          playSynthSound('shield_hit');
          this.spawnParticles(bullet.position.x, bullet.position.y, '#00f3ff', 15);
        } else {
          playSynthSound('hit');
          this.camera.shake(12);
          this.spawnParticles(this.player.position.x, this.player.position.y, '#ff003c', 25);
          
          // Unshielded player loses segments
          if (this.player.segments.length > 5) {
            const removed = this.player.segments.splice(this.player.segments.length - 5, 5);
            removed.forEach(seg => {
              this.foods.push(new Food(seg.position.x, seg.position.y, 'basic'));
            });
            const newScore = Math.max(0, useGameStore.getState().score - 5);
            useGameStore.getState().setScore(newScore);
            this.player.score = newScore;
          } else {
            this.gameOver();
            return;
          }
        }
      }
    }
  }

  private spawnBoss() {
    const level = useGameStore.getState().level;
    const angle = Math.random() * Math.PI * 2;
    const distance = 800 + Math.random() * 400;
    const x = this.player.position.x + Math.cos(angle) * distance;
    const y = this.player.position.y + Math.sin(angle) * distance;
    
    this.bosses.push(new Boss(x, y, level));
    this.camera.shake(20);
  }

  private gameOver() {
    playSynthSound('gameover');
    this.player.isDead = true;
    this.spawnParticles(this.player.position.x, this.player.position.y, '#ff003c', 100);
    this.camera.shake(20);
    
    this.player.segments.forEach(seg => {
        if (Math.random() > 0.5) {
            this.foods.push(new Food(seg.position.x, seg.position.y, 'basic'));
        }
    });

    useGameStore.getState().setGameState('gameover');
  }

  public getLeaderboard() {
    const list = [
      { name: this.player.name, score: useGameStore.getState().score, isPlayer: true }
    ];
    
    this.aiSnakes.forEach(ai => {
      if (!ai.isDead) {
        list.push({ name: ai.name, score: ai.score, isPlayer: false });
      }
    });
    
    return list.sort((a, b) => b.score - a.score).slice(0, 10);
  }

  private render() {
    this.ctx.fillStyle = '#020205'; 
    this.ctx.fillRect(0, 0, this.canvas.width, this.canvas.height);

    this.drawBackground();

    // Draw entities based on depth/type
    this.asteroids.forEach(a => a.draw(this.ctx, this.camera));
    this.bosses.forEach(b => b.draw(this.ctx, this.camera));
    this.bossBullets.forEach(bullet => bullet.draw(this.ctx, this.camera));
    this.powerups.forEach(p => p.draw(this.ctx, this.camera));
    this.foods.forEach(f => f.draw(this.ctx, this.camera));
    this.aiSnakes.forEach(ai => ai.draw(this.ctx, this.camera));
    
    if (!this.player.isDead) {
      this.player.draw(this.ctx, this.camera);
    }
    
    this.particles.forEach(p => p.draw(this.ctx, this.camera));

    if (useGameStore.getState().gameState === 'playing') {
      this.drawMinimap();
    }
  }

  private drawMinimap() {
    const size = Math.max(90, Math.min(150, this.canvas.height * 0.18));
    const padding = Math.max(10, Math.min(20, this.canvas.height * 0.02));
    const x = this.canvas.width - size - padding;
    const y = this.canvas.height - size - padding;
    
    this.ctx.save();
    
    this.ctx.fillStyle = 'rgba(5, 5, 15, 0.5)';
    this.ctx.shadowBlur = 10;
    this.ctx.shadowColor = 'rgba(0,0,0,0.5)';
    this.ctx.beginPath();
    this.ctx.roundRect(x, y, size, size, 12);
    this.ctx.fill();
    
    this.ctx.strokeStyle = 'rgba(0, 243, 255, 0.3)';
    this.ctx.lineWidth = 1;
    this.ctx.shadowBlur = 5;
    this.ctx.shadowColor = 'rgba(0, 243, 255, 0.5)';
    this.ctx.stroke();

    this.ctx.clip();
    this.ctx.shadowBlur = 0;

    const scale = size / this.WORLD_SIZE;
    const mapX = (worldX: number) => x + (worldX + this.WORLD_SIZE / 2) * scale;
    const mapY = (worldY: number) => y + (worldY + this.WORLD_SIZE / 2) * scale;

    // Draw Food
    this.ctx.fillStyle = '#ffea00';
    this.foods.forEach(f => {
      if (f.type === 'legendary' || f.type === 'epic') {
        this.ctx.beginPath();
        this.ctx.arc(mapX(f.position.x), mapY(f.position.y), 1.5, 0, Math.PI * 2);
        this.ctx.fill();
      }
    });

    // Draw AI
    this.ctx.fillStyle = '#ff003c';
    this.aiSnakes.forEach(ai => {
      this.ctx.beginPath();
      this.ctx.arc(mapX(ai.position.x), mapY(ai.position.y), 2.5, 0, Math.PI * 2);
      this.ctx.fill();
    });

    // Draw Boss
    this.ctx.fillStyle = '#ff00ea';
    this.bosses.forEach(b => {
      this.ctx.beginPath();
      this.ctx.arc(mapX(b.position.x), mapY(b.position.y), 4, 0, Math.PI * 2);
      this.ctx.fill();
    });

    // Draw Player
    this.ctx.fillStyle = '#00f3ff';
    if (!this.player.isDead) {
      this.ctx.beginPath();
      this.ctx.arc(mapX(this.player.position.x), mapY(this.player.position.y), 3.5, 0, Math.PI * 2);
      this.ctx.fill();
    }
    
    this.ctx.restore();
  }

  private drawBackground() {
    // 1. Draw Parallax Space Nebulae and Planets
    this.cosmicObjects.forEach(obj => {
      const screenX = (obj.x - this.camera.position.x * obj.parallax) * this.camera.zoom + this.canvas.width / 2;
      const screenY = (obj.y - this.camera.position.y * obj.parallax) * this.camera.zoom + this.canvas.height / 2;
      const screenRadius = obj.radius * this.camera.zoom * (obj.parallax * 0.7 + 0.3);

      const maxBound = screenRadius * 2.5;
      if (
        screenX < -maxBound || screenX > this.canvas.width + maxBound ||
        screenY < -maxBound || screenY > this.canvas.height + maxBound
      ) {
        return;
      }

      this.ctx.save();
      
      // Draw Atmosphere Glow
      const glowGrad = this.ctx.createRadialGradient(screenX, screenY, 0, screenX, screenY, screenRadius * 1.4);
      glowGrad.addColorStop(0, obj.colorEnd + '35'); 
      glowGrad.addColorStop(0.5, obj.colorEnd + '10'); 
      glowGrad.addColorStop(1, 'rgba(0,0,0,0)');
      this.ctx.fillStyle = glowGrad;
      this.ctx.beginPath();
      this.ctx.arc(screenX, screenY, screenRadius * 1.4, 0, Math.PI * 2);
      this.ctx.fill();

      // Draw Planet Sphere
      const planetGrad = this.ctx.createRadialGradient(
        screenX - screenRadius * 0.3, screenY - screenRadius * 0.3, screenRadius * 0.05,
        screenX, screenY, screenRadius
      );
      planetGrad.addColorStop(0, obj.colorStart);
      planetGrad.addColorStop(0.8, obj.colorEnd);
      planetGrad.addColorStop(1, '#020205'); 
      this.ctx.fillStyle = planetGrad;
      this.ctx.beginPath();
      this.ctx.arc(screenX, screenY, screenRadius, 0, Math.PI * 2);
      this.ctx.fill();

      // Draw Rings
      if (obj.hasRings) {
        this.ctx.strokeStyle = obj.ringColor;
        this.ctx.lineWidth = 14 * this.camera.zoom;
        
        this.ctx.save();
        this.ctx.translate(screenX, screenY);
        this.ctx.rotate(-Math.PI / 6);
        
        this.ctx.beginPath();
        this.ctx.ellipse(0, 0, screenRadius * 1.8, screenRadius * 0.28, 0, 0, Math.PI * 2);
        this.ctx.stroke();
        
        this.ctx.restore();
      }

      this.ctx.restore();
    });

    // 2. Draw Parallax Starfield
    const starGridSize = 200;
    const parallaxFactor = 0.3;
    const startX = Math.floor((this.camera.position.x * parallaxFactor - this.camera.viewportWidth / 2) / starGridSize) * starGridSize;
    const endX = startX + this.camera.viewportWidth + starGridSize;
    const startY = Math.floor((this.camera.position.y * parallaxFactor - this.camera.viewportHeight / 2) / starGridSize) * starGridSize;
    const endY = startY + this.camera.viewportHeight + starGridSize;

    for (let cx = startX; cx <= endX; cx += starGridSize) {
      for (let cy = startY; cy <= endY; cy += starGridSize) {
        for (let i = 0; i < 4; i++) {
          const hash = Math.sin(cx * 12.9898 + cy * 78.233 + i * 43.123) * 43758.5453;
          const rx = cx + (hash - Math.floor(hash)) * starGridSize;
          const hash2 = Math.cos(cx * 12.9898 + cy * 78.233 + i * 43.123) * 43758.5453;
          const ry = cy + (hash2 - Math.floor(hash2)) * starGridSize;
          
          const screenX = rx - this.camera.position.x * parallaxFactor + this.camera.viewportWidth / 2;
          const screenY = ry - this.camera.position.y * parallaxFactor + this.camera.viewportHeight / 2;
          
          const size = (hash - Math.floor(hash)) * 1.5 + 0.5;
          const opacity = (hash2 - Math.floor(hash2)) * 0.7 + 0.1;
          
          const blink = Math.sin(Date.now() / 1000 + hash * 10) * 0.5 + 0.5;
          
          this.ctx.fillStyle = `rgba(255, 255, 255, ${opacity * blink})`;
          this.ctx.beginPath();
          this.ctx.arc(screenX, screenY, size, 0, Math.PI * 2);
          this.ctx.fill();
        }
      }
    }

    // 3. Subtle Grid
    this.ctx.strokeStyle = 'rgba(0, 243, 255, 0.04)';
    this.ctx.lineWidth = 1;

    const gridSize = 200;
    const gStartX = Math.floor((this.camera.position.x - this.camera.viewportWidth / 2 / this.camera.zoom) / gridSize) * gridSize;
    const gEndX = gStartX + (this.camera.viewportWidth / this.camera.zoom) + gridSize;
    
    const gStartY = Math.floor((this.camera.position.y - this.camera.viewportHeight / 2 / this.camera.zoom) / gridSize) * gridSize;
    const gEndY = gStartY + (this.camera.viewportHeight / this.camera.zoom) + gridSize;

    this.ctx.beginPath();
    for (let x = gStartX; x <= gEndX; x += gridSize) {
      const screenStart = this.camera.w2s(new Vector2(x, gStartY));
      const screenEnd = this.camera.w2s(new Vector2(x, gEndY));
      this.ctx.moveTo(screenStart.x, screenStart.y);
      this.ctx.lineTo(screenEnd.x, screenEnd.y);
    }

    for (let y = gStartY; y <= gEndY; y += gridSize) {
      const screenStart = this.camera.w2s(new Vector2(gStartX, y));
      const screenEnd = this.camera.w2s(new Vector2(gEndX, y));
      this.ctx.moveTo(screenStart.x, screenStart.y);
      this.ctx.lineTo(screenEnd.x, screenEnd.y);
    }
    this.ctx.stroke();
    
    // 4. World bounds
    const halfWorld = this.WORLD_SIZE / 2;
    const boundsTL = this.camera.w2s(new Vector2(-halfWorld, -halfWorld));
    const boundsBR = this.camera.w2s(new Vector2(halfWorld, halfWorld));
    const width = boundsBR.x - boundsTL.x;
    const height = boundsBR.y - boundsTL.y;
    
    this.ctx.strokeStyle = 'rgba(255, 0, 60, 0.5)';
    this.ctx.lineWidth = 4 * this.camera.zoom;
    this.ctx.shadowBlur = 20;
    this.ctx.shadowColor = '#ff003c';
    this.ctx.strokeRect(boundsTL.x, boundsTL.y, width, height);
    this.ctx.shadowBlur = 0; 
  }
}
