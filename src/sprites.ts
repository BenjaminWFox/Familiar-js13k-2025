import { STRINGS } from "./constants";
import { gameState } from "./gameState";

export class Sprite {
  x: number;
  y: number;
  frames: number;
  speed: number;
  width: number;
  height: number;
  defaultFrame: number;
  type: string;
  currentFrame = 0;
  count = 0;
  leftSprites: Array<HTMLCanvasElement> = [];
  rightSprites: Array<HTMLCanvasElement> = [];
  s: HTMLCanvasElement;
  lastX?: number;

  constructor(
    type: string,
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

export const sprites = {
  [STRINGS.cat]: () => new Sprite(STRINGS.cat, 0, 20, 2, 20, 10, 10, 1, true),
  [STRINGS.fly]: () => new Sprite(STRINGS.fly, 0, 30, 2, 20, 10, 10, 1, true),
  [STRINGS.frog]: () => new Sprite(STRINGS.frog, 0, 40, 2, 20, 10, 10, 1, true),
  [STRINGS.snake]: () => new Sprite(STRINGS.snake, 0, 50, 2, 20, 10, 10, 1, true),
  [STRINGS.lizard]: () => new Sprite(STRINGS.lizard, 0, 60, 2, 20, 10, 10, 1, true),
  [STRINGS.kid]: () => new Sprite(STRINGS.kid, 20, 10, 1, 0, 30),
  [STRINGS.fan]: () => new Sprite(STRINGS.fan, 20, 40, 1, 0, 30),
  [STRINGS.vaccuum]: () => new Sprite(STRINGS.vaccuum, 20, 70, 1, 0, 30),
  [STRINGS.net]: () => new Sprite(STRINGS.net, 20, 100, 1, 0, 30),
  [STRINGS.witch]: () => new Sprite(STRINGS.witch, 0, 130, 2, 20, 20, 30),
  [STRINGS.fish]: () => new Sprite(STRINGS.fish, 0, 120, 1, 1, 20),
  [STRINGS.scratch]: () => new Sprite(STRINGS.scratch, 0, 100, 1, 1, 20),
  [STRINGS.fetcher]: () => new Sprite(STRINGS.fetcher, 0, 10, 2, 8, 10, 10, 1, true),
  [STRINGS.catcher]: () => new Sprite(STRINGS.catcher, 40, 0, 1, 0, 10),
}
