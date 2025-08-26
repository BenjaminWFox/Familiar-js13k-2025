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
  leftSprites: Array<HTMLCanvasElement> = [];
  rightSprites: Array<HTMLCanvasElement> = [];
  s: HTMLCanvasElement;
  lastX?: number;

  constructor(
    type: SpritesKey,
    x: number,
    y: number,
    frames: number,
    speed: number,
    width: number,
    height?: number,
    defaultFrame?: number,
    flippable?: boolean
  ) {
    this.type = type;
    this.x = x;
    this.y = y;
    this.frames = frames;
    this.speed = speed;
    this.width = width;
    this.height = height || width;
    this.defaultFrame = defaultFrame || 1;

    this.s = this.getSpriteForImage(this.x, this.y, this.width, this.height);

    for(let i = 0;i<frames;i++) {
      this.rightSprites.push(this.getSpriteForImage(this.x + (this.width * i), this.y, this.width, this.height));
      this.leftSprites.push(this.getSpriteForImage(this.x + (this.width * i), this.y, this.width, this.height, flippable));
    }
  }

  getSpriteForImage(x: number, y: number, width: number, height: number, flip = false) {
    const c = document.createElement('canvas');
    c.style.backgroundColor = 'black';
    const c_ctx = c.getContext('2d') as CanvasRenderingContext2D;
    c.width = width;
    c.height = height;
    c_ctx.imageSmoothingEnabled = false;
    c_ctx.translate(flip ? width : 0, 0);
    c_ctx.scale(flip ? -1 : 1, 1);
    c_ctx.drawImage(
      gameState.image!,
      x,
      y,
      width,
      height,
      0,
      0,
      width,
      height
    );

    return c;
  }

  draw(ctx: CanvasRenderingContext2D, x: number, y: number, width?: number, height?: number, isPaused = false) {
    const left = this.lastX && this.lastX > x;
    this.lastX = x;
    if (this.count > this.speed * (this.currentFrame + 1)) {
      if (this.count > this.frames * this.speed) {
        this.count = 0;
        this.currentFrame = 0;
      } else {
        this.currentFrame++
      }
    }
    
    const s = isPaused ? this.rightSprites[0] : left ? this.leftSprites[this.currentFrame] : this.rightSprites[this.currentFrame];
    ctx.drawImage(s, 0, 0, this.width, this.height, x, y, width || this.width, height || width || this.width);

    this.count++;
  }
}

export type SpritesKey = keyof typeof sprites;
export const sprites = {
  fetcher: () => new Sprite('fetcher', 0, 10, 2, 8, 10, 10, 1, true),
  cat: () => new Sprite('cat', 0, 20, 2, 20, 10, 10, 1, true),
  fly: () => new Sprite('fly', 0, 30, 2, 20, 10, 10, 1, true),
  frog: () => new Sprite('frog', 0, 40, 2, 20, 10, 10, 1, true),
  snake: () => new Sprite('snake', 0, 50, 2, 20, 10, 10, 1, true),
  lizard: () => new Sprite('lizard', 0, 60, 2, 20, 10, 10, 1, true),
  kid: () => new Sprite('kid', 20, 10, 1, 0, 30),
  fan: () => new Sprite('fan', 20, 40, 1, 0, 30),
  vaccuum: () => new Sprite('vaccuum', 20, 70, 1, 0, 30),
  net: () => new Sprite('net', 20, 100, 1, 0, 30),
  witch: () => new Sprite('witch', 0, 70, 1, 0, 20),
  fish: () => new Sprite('fish', 0, 120, 1, 1, 20),
  scratch: () => new Sprite('scratch', 0, 100, 1, 1, 20),
}
