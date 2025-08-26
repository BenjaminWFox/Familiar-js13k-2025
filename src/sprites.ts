import { gameState } from "./gameState";
export class Sprite {
  x: number;
  y: number;
  frames: number;
  speed: number;
  width: number;
  height: number;
  defaultFrame: number;
  type: SpritesKey;
  currentFrame = 0;
  count = 0;

  constructor(
    type: SpritesKey,
    x: number,
    y: number,
    frames: number,
    speed: number,
    width: number,
    height?: number,
    defaultFrame?: number
  ) {
    this.type = type;
    this.x = x;
    this.y = y;
    this.frames = frames;
    this.speed = speed;
    this.width = width;
    this.height = height || width;
    this.defaultFrame = defaultFrame || 1;
  }

  draw(ctx: CanvasRenderingContext2D, x: number, y: number, width?: number, height?: number, isPaused = false) {
    if (this.count > this.speed * (this.currentFrame + 1)) {
      if (this.count > this.frames * this.speed) {
        this.count = 0;
        this.currentFrame = 0;
      } else {
        this.currentFrame++
      }
    }
    
    ctx.drawImage(gameState.image!, this.x + (this.width * (isPaused ? 0 : this.currentFrame)), this.y, this.width, this.height, x, y, width || this.width, height || width || this.width);

    this.count++;
  }
}

export type SpritesKey = keyof typeof sprites;
export const sprites = {
  fetcher: () => new Sprite('fetcher', 0, 10, 2, 8, 10),
  cat: () => new Sprite('cat', 0, 20, 2, 20, 10),
  fly: () => new Sprite('fly', 0, 30, 2, 20, 10),
  frog: () => new Sprite('frog', 0, 40, 2, 20, 10),
  snake: () => new Sprite('snake', 0, 50, 2, 20, 10),
  lizard: () => new Sprite('lizard', 0, 60, 2, 20, 10),
  kid: () => new Sprite('kid', 20, 10, 1, 0, 30),
  fan: () => new Sprite('fan', 20, 40, 1, 0, 30),
  vaccuum: () => new Sprite('vaccuum', 20, 70, 1, 0, 30),
  net: () => new Sprite('net', 20, 100, 1, 0, 30),
  witch: () => new Sprite('witch', 0, 70, 1, 0, 20),
  fish: () => new Sprite('fish', 0, 120, 1, 1, 20),
  scratch: () => new Sprite('scratch', 0, 100, 1, 1, 20),
}
