import { canvas, ctx } from "./elements";
import { Button } from "./button";
import { COLOR_MENU_GREEN_1, COLOR_MENU_GREEN_2, HEIGHT, MENU_START_X, TILE_WIDTH, WIDTH } from "./constants";
import { setFont } from "./utils";

export enum SCENES {
  start,
  playing,
  gameoverLost,
  gameoverWon,
  dialog,
}

class Dialog {
  rendered: boolean = false;

  constructor() {
    
  }
}

export const dialog = new Dialog();

class GameState {
  waves = 13;
  gameTime: number = 0;
  image: HTMLImageElement | undefined;
  paused: boolean = false;
  state: SCENES = SCENES.start;
  canvas: HTMLCanvasElement;
  ctx: CanvasRenderingContext2D;
  wave: number = 1;
  cash: number = 250;
  escaped: number = 0;

  waveSelectBtns: Array<Button> = [];

  constructor() {
    this.canvas = canvas
    this.ctx = ctx;
  }

  addEscaped(n: number = 1) {
    this.escaped += n;
  }

  dialogShowing = false;
  showDialog(text: string[], okButton: Button, closeButton?: Button) {
    if (!this.dialogShowing) {
      this.dialogShowing = true;
      ctx.fillStyle = 'rgba(255, 255, 255, .25)'
      ctx.fillRect(0, 0, WIDTH, HEIGHT);
      ctx.fillStyle = COLOR_MENU_GREEN_1;
      ctx.strokeStyle = COLOR_MENU_GREEN_2;
      ctx.lineWidth = 50;
      ctx.fillRect(WIDTH * .5 - 500 - (WIDTH - MENU_START_X), HEIGHT * .5 - 450, 1500, 700);
      ctx.strokeRect(WIDTH * .5 - 525 - (WIDTH - MENU_START_X), HEIGHT * .5 - 475, 1550, 750);
      okButton.render();
      if (closeButton) {
        closeButton.render();
      }

      text.forEach((str, i) => {
        setFont(45);
        ctx.textAlign = 'left'
        ctx.textBaseline = 'bottom'
        ctx.fillText(str, 450, 650 + (i * TILE_WIDTH))
      })
    }
  }
}

const gameState = new GameState();

export { gameState }
