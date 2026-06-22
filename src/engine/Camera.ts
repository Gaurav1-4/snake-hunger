import { Vector2 } from './Vector2';

export class Camera {
  public position: Vector2;
  public zoom: number;
  public targetZoom: number;
  public viewportWidth: number;
  public viewportHeight: number;
  public shakeAmount: number = 0;

  constructor(viewportWidth: number, viewportHeight: number) {
    this.position = new Vector2(0, 0);
    this.zoom = 1;
    this.targetZoom = 1;
    this.viewportWidth = viewportWidth;
    this.viewportHeight = viewportHeight;
  }

  update(deltaTime: number, targetPosition: Vector2) {
    // Smooth follow
    const lerpFactor = 0.1;
    this.position.x += (targetPosition.x - this.position.x) * lerpFactor;
    this.position.y += (targetPosition.y - this.position.y) * lerpFactor;

    // Smooth zoom
    this.zoom += (this.targetZoom - this.zoom) * 0.05;

    // Camera shake decay
    if (this.shakeAmount > 0) {
      this.shakeAmount -= deltaTime * 0.05;
      if (this.shakeAmount < 0) this.shakeAmount = 0;
    }
  }

  shake(amount: number) {
    this.shakeAmount = amount;
  }

  resize(width: number, height: number) {
    this.viewportWidth = width;
    this.viewportHeight = height;
  }

  // World to Screen coordinates
  w2s(worldPos: Vector2): Vector2 {
    let shakeX = 0;
    let shakeY = 0;
    if (this.shakeAmount > 0) {
      shakeX = (Math.random() - 0.5) * this.shakeAmount;
      shakeY = (Math.random() - 0.5) * this.shakeAmount;
    }

    return new Vector2(
      (worldPos.x - this.position.x) * this.zoom + this.viewportWidth / 2 + shakeX,
      (worldPos.y - this.position.y) * this.zoom + this.viewportHeight / 2 + shakeY
    );
  }

  // Screen to World coordinates
  s2w(screenPos: Vector2): Vector2 {
    return new Vector2(
      (screenPos.x - this.viewportWidth / 2) / this.zoom + this.position.x,
      (screenPos.y - this.viewportHeight / 2) / this.zoom + this.position.y
    );
  }
}
