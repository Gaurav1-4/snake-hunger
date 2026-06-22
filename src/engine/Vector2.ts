export class Vector2 {
  public x: number;
  public y: number;

  constructor(x: number = 0, y: number = 0) {
    this.x = x;
    this.y = y;
  }

  add(v: Vector2): Vector2 {
    return new Vector2(this.x + v.x, this.y + v.y);
  }

  sub(v: Vector2): Vector2 {
    return new Vector2(this.x - v.x, this.y - v.y);
  }

  mul(scalar: number): Vector2 {
    return new Vector2(this.x * scalar, this.y * scalar);
  }

  div(scalar: number): Vector2 {
    return new Vector2(this.x / scalar, this.y / scalar);
  }

  mag(): number {
    return Math.sqrt(this.x * this.x + this.y * this.y);
  }

  magSq(): number {
    return this.x * this.x + this.y * this.y;
  }

  normalize(): Vector2 {
    const m = this.mag();
    if (m === 0) return new Vector2(0, 0);
    return new Vector2(this.x / m, this.y / m);
  }

  distance(v: Vector2): number {
    return this.sub(v).mag();
  }

  clone(): Vector2 {
    return new Vector2(this.x, this.y);
  }

  dot(v: Vector2): number {
    return this.x * v.x + this.y * v.y;
  }
}
