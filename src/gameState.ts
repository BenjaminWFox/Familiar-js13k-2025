import { Button } from "./button";
import { canvas, ctx } from "./elements";

export enum SCENES {
  start,
  playing,
  gameoverLost,
  gameoverWon,
}

class GameState {
  waves = 13;
  gameTime: number = 0;
  image: HTMLImageElement | undefined;
  paused: boolean = false;
  state: SCENES = SCENES.start;
  canvas: HTMLCanvasElement;
  ctx: CanvasRenderingContext2D;
  wave: number = 1;

  waveSelectBtns: Array<Button> = [];

  constructor() {
    this.canvas = canvas
    this.ctx = ctx;
  }
}

const gameState = new GameState();

export { gameState }
