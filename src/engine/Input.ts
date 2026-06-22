import { Vector2 } from './Vector2';

export class Input {
  public keys: { [key: string]: boolean } = {};
  public mousePosition: Vector2 = new Vector2();
  public isMouseDown: boolean = false;
  
  // Virtual Joystick support
  public joystickDir: Vector2 = new Vector2();
  public isBoosting: boolean = false;

  constructor() {
    window.addEventListener('keydown', (e) => this.keys[e.key.toLowerCase()] = true);
    window.addEventListener('keyup', (e) => this.keys[e.key.toLowerCase()] = false);
    
    window.addEventListener('mousemove', (e) => {
      this.mousePosition.x = e.clientX;
      this.mousePosition.y = e.clientY;
    });
    
    window.addEventListener('mousedown', () => this.isMouseDown = true);
    window.addEventListener('mouseup', () => this.isMouseDown = false);
  }

  isKeyPressed(key: string): boolean {
    return !!this.keys[key.toLowerCase()];
  }

  getBoostInput(): boolean {
    return this.isKeyPressed('shift') || this.isBoosting;
  }

  // Returns normalized direction vector based on WASD/Arrows or Joystick
  getDirectionInput(): Vector2 {
    let dir = new Vector2();

    if (this.isKeyPressed('w') || this.isKeyPressed('arrowup')) dir.y -= 1;
    if (this.isKeyPressed('s') || this.isKeyPressed('arrowdown')) dir.y += 1;
    if (this.isKeyPressed('a') || this.isKeyPressed('arrowleft')) dir.x -= 1;
    if (this.isKeyPressed('d') || this.isKeyPressed('arrowright')) dir.x += 1;

    // If keyboard input exists, use it
    if (dir.magSq() > 0) {
      return dir.normalize();
    }

    // Otherwise use joystick direction (which should already be normalized)
    return this.joystickDir;
  }
}
