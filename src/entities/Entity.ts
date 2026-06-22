import { Vector2 } from '../engine/Vector2';

export abstract class Entity {
  public position: Vector2;
  public velocity: Vector2;
  public radius: number;
  public isDead: boolean = false;

  constructor(x: number, y: number, radius: number) {
    this.position = new Vector2(x, y);
    this.velocity = new Vector2(0, 0);
    this.radius = radius;
  }

  abstract update(deltaTime: number, ...args: any[]): void;
  abstract draw(ctx: CanvasRenderingContext2D, camera: any): void;

  checkCollision(other: Entity): boolean {
    if (this.isDead || other.isDead) return false;
    const distSq = this.position.distance(other.position);
    return distSq < (this.radius + other.radius);
  }
}
