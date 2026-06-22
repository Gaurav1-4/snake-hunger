import { Camera } from './Camera';
import { Input } from './Input';
import { Vector2 } from './Vector2';
import { Snake } from '../entities/Snake';
import { Food, type FoodType } from '../entities/Food';
import { Asteroid } from '../entities/Asteroid';
import { Particle } from '../entities/Particle';
import { Powerup, type PowerupType } from '../entities/Powerup';
import { Boss } from '../entities/Boss';
import { playSynthSound } from '../utils/audio';
import { useGameStore } from '../store/useGameStore';
import { usePlayerStore } from '../store/usePlayerStore';

export class Game {
  private canvas: HTMLCanvasElement;
  private ctx: CanvasRenderingContext2D;
  private camera: Camera;
  private input: Input;
  
  private lastTime: number = 0;
  private animationFrameId: number | null = null;
  private isRunning: boolean = false;
  
  private player: Snake;
  private foods: Food[] = [];
  private asteroids: Asteroid[] = [];
  private particles: Particle[] = [];
  private powerups: Powerup[] = [];
  private bosses: Boss[] = [];
  private aiSnakes: Snake[] = [];
  
  public readonly WORLD_SIZE = 10000;
  
  private activePowerups: Map<PowerupType, number> = new Map(); // Type to time remaining
  private lastBossScore: number = 0;

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

    this.player = new Snake(0, 0, true);
    
    this.initWorld();
    
    this.loop = this.loop.bind(this);
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
    for (let i = 0; i < 15; i++) {
      this.spawnAISnake();
    }
  }

  private spawnAISnake() {
    // Spawn somewhat near the player so the player isn't lonely
    let x, y;
    do {
      x = (Math.random() - 0.5) * this.WORLD_SIZE;
      y = (Math.random() - 0.5) * this.WORLD_SIZE;
    } while (this.player && this.player.position && new Vector2(x, y).distance(this.player.position) < 800); // Don't spawn right on top of player
    
    const ai = new Snake(x, y, false);
    ai.grow(Math.floor(5 + Math.random() * 15)); // Start with decent size so they are threatening
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
    // Don't spawn near center (player start)
    if (Math.abs(x) < 500 && Math.abs(y) < 500) return;
    
    const radius = 50 + Math.random() * 150;
    this.asteroids.push(new Asteroid(x, y, radius));
  }

  private spawnParticles(x: number, y: number, color: string, count: number) {
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
    
    // Reset game state if it was gameover
    if (this.player.isDead) {
      this.player = new Snake(0, 0, true);
      this.foods = [];
      this.asteroids = [];
      this.particles = [];
      this.bosses = [];
      this.aiSnakes = [];
      this.lastBossScore = 0;
      this.activePowerups.clear();
      this.camera.position = new Vector2(0, 0);
      this.initWorld();
      useGameStore.getState().resetGame();
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
      this.player.update(deltaTime);

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

        // 1. General attraction to the player's general vicinity to keep the map feeling populated
        let generalAttraction = new Vector2(0, 0);
        if (distToPlayer > 2000) {
          generalAttraction = this.player.position.sub(ai.position).normalize().mul(0.2); // Weak pull towards player
        }

        // 2. Aggressive cutoff logic (Killing intent)
        // In snake games, any size can kill any size by cutting off the head.
        if (distToPlayer < 1200 && !this.player.isDead) {
          isChasing = true;
          
          // Calculate the point slightly ahead of the player to cut them off
          const predictTime = Math.min(distToPlayer / 300, 2.0); // Predict max 2 seconds ahead
          const interceptPoint = this.player.position.add(this.player.velocity.mul(predictTime));
          
          // If the AI is behind the player and smaller, maybe don't blindly chase their tail
          const dotProduct = ai.currentDirection.dot(this.player.currentDirection);
          const isBehind = interceptPoint.distance(ai.position) > distToPlayer + 200;
          
          if (isBehind && this.player.segments.length > ai.segments.length + 10) {
             // Too dangerous, player is huge and AI is behind them. Just flee to survive.
             isFleeing = true;
             isChasing = false;
             targetPos = ai.position.add(ai.position.sub(this.player.position).normalize().mul(500));
          } else {
             // Go for the kill!
             targetPos = interceptPoint;
             
             // Boost if close enough to close the gap and secure the cutoff
             if (distToPlayer < 600 && dotProduct < 0.5) { // If crossing paths
               ai.setBoost(true);
             } else {
               ai.setBoost(false);
             }
          }
        }

        // 3. Otherwise, look for food or wander
        if (!isFleeing && !isChasing) {
           ai.setBoost(false);
           
           this.foods.forEach(f => {
             const dist = ai.position.distance(f.position);
             // Prefer higher value foods
             const effectiveDist = f.type === 'legendary' ? dist * 0.1 : (f.type === 'epic' ? dist * 0.3 : dist);
             if (effectiveDist < closestFoodDist && dist < 1200) {
               closestFoodDist = effectiveDist;
               targetPos = f.position;
             }
           });
           
           // Wander if no food nearby
           if (!targetPos) {
              const timeSec = Date.now() / 2000;
              const wanderNoise = new Vector2(Math.sin(timeSec + i * 5), Math.cos(timeSec + i * 5));
              // Slightly curve the current velocity, plus the general attraction to the player
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

        ai.update(deltaTime);

        // Clamp AI bounds
        if (ai.position.x > halfWorld) ai.position.x = halfWorld;
        if (ai.position.x < -halfWorld) ai.position.x = -halfWorld;
        if (ai.position.y > halfWorld) ai.position.y = halfWorld;
        if (ai.position.y < -halfWorld) ai.position.y = -halfWorld;
      });

      // Update entities
      this.foods.forEach(f => f.update(deltaTime));
      this.asteroids.forEach(a => a.update(deltaTime));
      this.particles.forEach(p => p.update(deltaTime));
      this.powerups.forEach(p => p.update(deltaTime));
      this.bosses.forEach(b => b.update(deltaTime, this.player));

      // Remove dead particles and bosses
      this.particles = this.particles.filter(p => !p.isDead);
      this.bosses = this.bosses.filter(b => !b.isDead);
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
      
      // Replenish AI Snakes (keep the game populated with 30 snakes)
      while (this.aiSnakes.length < 30) {
        this.spawnAISnake();
      }

      // Camera
      this.camera.targetZoom = this.player.isBoosting ? 0.8 : 1.0 - (this.player.segments.length * 0.002);
      this.camera.targetZoom = Math.max(0.3, Math.min(1.5, this.camera.targetZoom));
      this.camera.update(deltaTime, this.player.position);

    } else if (gameState === 'menu') {
      // Rotate camera around center
      const angle = performance.now() * 0.0001;
      this.camera.position.x = Math.cos(angle) * 500;
      this.camera.position.y = Math.sin(angle) * 500;
      this.camera.targetZoom = 0.5;
      this.camera.update(deltaTime, this.camera.position); // manual position set, but update does lerp
      this.camera.position = new Vector2(Math.cos(angle) * 500, Math.sin(angle) * 500); // force
      
      this.asteroids.forEach(a => a.update(deltaTime));
      this.foods.forEach(f => f.update(deltaTime));
    }
  }

  private checkCollisions(hasMagnet: boolean, hasDouble: boolean, hasShield: boolean) {
    // Food collision
    const magnetRadius = hasMagnet ? 300 : 0;
    
    for (let i = this.foods.length - 1; i >= 0; i--) {
      const food = this.foods[i];
      const distSq = this.player.position.distance(food.position);
      
      // Magnet effect
      if (hasMagnet && distSq < magnetRadius) {
        const dir = this.player.position.sub(food.position).normalize();
        food.position = food.position.add(dir.mul(500 * 0.016)); // approx 60fps delta
      }

      if (distSq < this.player.radius + food.radius) {
        playSynthSound('eat');
        // Eat food
        const points = food.scoreValue * (hasDouble ? 2 : 1);
        useGameStore.getState().addScore(points);
        usePlayerStore.getState().addCoins(food.scoreValue);
        this.player.grow(food.growthValue);
        
        // Effects
        this.spawnParticles(food.position.x, food.position.y, '#ffffff', 10);
        if (food.type === 'legendary') this.camera.shake(5);
        
        // Random powerup spawn chance from legendary/epic
        if ((food.type === 'legendary' || food.type === 'epic') && Math.random() < 0.3) {
           const types: PowerupType[] = ['speed', 'shield', 'magnet', 'double_points'];
           this.powerups.push(new Powerup(food.position.x, food.position.y, types[Math.floor(Math.random() * types.length)]));
        }
        
        // Level up check
        const store = useGameStore.getState();
        if (store.score > store.level * 100) {
            store.setLevel(store.level + 1);
            // Spawn more asteroids or boss
        }

        this.foods.splice(i, 1);
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
            // Bounce off slightly
            this.player.position = this.player.position.sub(this.player.velocity.normalize().mul(50));
        }
      }
    }

    // Self collision disabled per user request
    /*
    if (!hasShield && this.player.segments.length > 10) {
      // Don't check first few segments
      for (let i = 10; i < this.player.segments.length; i++) {
        const seg = this.player.segments[i];
        if (this.player.position.distance(seg.position) < this.player.radius + seg.radius - 5) {
          this.gameOver();
          return;
        }
      }
    }
    */

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
          // Damage boss
          playSynthSound('hit');
          boss.takeDamage(1);
          this.camera.shake(10);
          this.spawnParticles(boss.position.x, boss.position.y, '#ffea00', 20);
          // Bounce off
          this.player.position = this.player.position.sub(this.player.velocity.normalize().mul(50));
          
          if (boss.isDead) {
            useGameStore.getState().addScore(boss.scoreValue);
            usePlayerStore.getState().addCoins(boss.scoreValue);
            this.spawnParticles(boss.position.x, boss.position.y, '#ff003c', 100);
            this.camera.shake(30);
            
            // Drop powerups
            this.powerups.push(new Powerup(boss.position.x + 50, boss.position.y, 'double_points'));
            this.powerups.push(new Powerup(boss.position.x - 50, boss.position.y, 'magnet'));
          }
        } else {
          this.gameOver();
          return;
        }
      }
    }
  }

  private spawnBoss() {
    const level = useGameStore.getState().level;
    // Spawn somewhat near player but not on top of them
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
    
    // Convert segments to food
    this.player.segments.forEach(seg => {
        if (Math.random() > 0.5) {
            this.foods.push(new Food(seg.position.x, seg.position.y, 'basic'));
        }
    });

    useGameStore.getState().setGameState('gameover');
  }

  private render() {
    this.ctx.fillStyle = '#020205'; // Darker space background
    this.ctx.fillRect(0, 0, this.canvas.width, this.canvas.height);

    this.drawBackground();

    // Draw entities based on depth/type
    this.asteroids.forEach(a => a.draw(this.ctx, this.camera));
    this.bosses.forEach(b => b.draw(this.ctx, this.camera));
    this.powerups.forEach(p => p.draw(this.ctx, this.camera));
    this.foods.forEach(f => f.draw(this.ctx, this.camera));
    this.aiSnakes.forEach(ai => ai.draw(this.ctx, this.camera));
    
    if (!this.player.isDead) {
      this.player.draw(this.ctx, this.camera);
    }
    
    this.particles.forEach(p => p.draw(this.ctx, this.camera));

    // Minimap
    if (useGameStore.getState().gameState === 'playing') {
      this.drawMinimap();
    }
  }

  private drawMinimap() {
    const size = 150;
    const padding = 20;
    const x = this.canvas.width - size - padding;
    const y = this.canvas.height - size - padding;
    
    this.ctx.save();
    
    // Background with blur effect
    this.ctx.fillStyle = 'rgba(5, 5, 15, 0.5)';
    this.ctx.shadowBlur = 10;
    this.ctx.shadowColor = 'rgba(0,0,0,0.5)';
    this.ctx.beginPath();
    this.ctx.roundRect(x, y, size, size, 12);
    this.ctx.fill();
    
    // Border
    this.ctx.strokeStyle = 'rgba(0, 243, 255, 0.3)';
    this.ctx.lineWidth = 1;
    this.ctx.shadowBlur = 5;
    this.ctx.shadowColor = 'rgba(0, 243, 255, 0.5)';
    this.ctx.stroke();

    // Clip inner contents
    this.ctx.clip();
    this.ctx.shadowBlur = 0; // Turn off shadow for dots

    // Helper to map world to minimap
    const scale = size / this.WORLD_SIZE;
    const mapX = (worldX: number) => x + (worldX + this.WORLD_SIZE / 2) * scale;
    const mapY = (worldY: number) => y + (worldY + this.WORLD_SIZE / 2) * scale;

    // Draw Food (only high value)
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
    // 1. Draw Parallax Starfield
    const starGridSize = 200;
    const parallaxFactor = 0.3;
    const startX = Math.floor((this.camera.position.x * parallaxFactor - this.camera.viewportWidth / 2) / starGridSize) * starGridSize;
    const endX = startX + this.camera.viewportWidth + starGridSize;
    const startY = Math.floor((this.camera.position.y * parallaxFactor - this.camera.viewportHeight / 2) / starGridSize) * starGridSize;
    const endY = startY + this.camera.viewportHeight + starGridSize;

    for (let cx = startX; cx <= endX; cx += starGridSize) {
      for (let cy = startY; cy <= endY; cy += starGridSize) {
        // Generate pseudo-random stars for this grid cell
        for (let i = 0; i < 4; i++) {
          const hash = Math.sin(cx * 12.9898 + cy * 78.233 + i * 43.123) * 43758.5453;
          const rx = cx + (hash - Math.floor(hash)) * starGridSize;
          const hash2 = Math.cos(cx * 12.9898 + cy * 78.233 + i * 43.123) * 43758.5453;
          const ry = cy + (hash2 - Math.floor(hash2)) * starGridSize;
          
          const screenX = rx - this.camera.position.x * parallaxFactor + this.camera.viewportWidth / 2;
          const screenY = ry - this.camera.position.y * parallaxFactor + this.camera.viewportHeight / 2;
          
          const size = (hash - Math.floor(hash)) * 1.5 + 0.5;
          const opacity = (hash2 - Math.floor(hash2)) * 0.7 + 0.1;
          
          // Make some stars blink
          const blink = Math.sin(Date.now() / 1000 + hash * 10) * 0.5 + 0.5;
          
          this.ctx.fillStyle = `rgba(255, 255, 255, ${opacity * blink})`;
          this.ctx.beginPath();
          this.ctx.arc(screenX, screenY, size, 0, Math.PI * 2);
          this.ctx.fill();
        }
      }
    }

    // 2. Subtle Grid
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
    
    // 3. World bounds
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
    this.ctx.shadowBlur = 0; // reset
  }
}
