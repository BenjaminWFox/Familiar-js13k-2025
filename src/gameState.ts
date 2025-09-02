import { canvas, ctx } from "./elements";
import { Button, dialog } from "./entity";
// import { COLOR_MENU_GREEN_1, COLOR_MENU_GREEN_2, HEIGHT, MENU_START_X, TILE_WIDTH, WIDTH } from "./constants";
// import { setFont } from "./utils";

export enum SCENES {
  start,
  playing,
  gameoverLost,
  gameoverWon,
  dialog,
}

class GameState {
  mouseDownAt: number = 0;
  waves = 13;
  gameTime: number = 0;
  image: HTMLImageElement | undefined;
  paused: boolean = false;
  state: SCENES = SCENES.playing;
  canvas: HTMLCanvasElement;
  ctx: CanvasRenderingContext2D;
  wave: number = 1;
  cash: number = 250;
  escaped: number = 0;

  dialogCallback: () => void;
  dialogText: string[] = [];
  dialogShowCancel: boolean = false;

  waveSelectBtns: Array<Button> = [];

  defaultCallback = () => {
    this.closeDialog();
  }

  constructor() {
    this.canvas = canvas
    this.ctx = ctx;

    this.dialogCallback = () => {};
  }

  addEscaped(n: number = 1) {
    this.escaped += n;
  }

  closeDialog(scene: SCENES = SCENES.playing) {
    this.state = scene;
    this.dialogShowing = false;
    dialog.hasRendered = false;
  }

  dialogShowing = false;
  showDialog(text: string[], callback?: () => void, showCancel: boolean = false) {
    if (!this.dialogShowing) {
      this.state = SCENES.dialog;
      this.dialogCallback = callback || this.defaultCallback;
      this.dialogText = text;
      this.dialogShowCancel = showCancel;
      this.dialogShowing = true;
    }
    //   ctx.fillStyle = 'rgba(255, 255, 255, .25)'
    //   ctx.fillRect(0, 0, WIDTH, HEIGHT);
    //   ctx.fillStyle = COLOR_MENU_GREEN_1;
    //   ctx.strokeStyle = COLOR_MENU_GREEN_2;
    //   ctx.lineWidth = 50;
    //   ctx.fillRect(WIDTH * .5 - 500 - (WIDTH - MENU_START_X), HEIGHT * .5 - 450, 1500, 700);
    //   ctx.strokeRect(WIDTH * .5 - 525 - (WIDTH - MENU_START_X), HEIGHT * .5 - 475, 1550, 750);
    //   okButton.render();
    //   if (closeButton) {
    //     closeButton.render();
    //   }

    //   text.forEach((str, i) => {
    //     setFont(45);
    //     ctx.textAlign = 'left'
    //     ctx.textBaseline = 'bottom'
    //     ctx.fillText(str, 450, 650 + (i * TILE_WIDTH))
    //   })
    // }
  }
}

const gameState = new GameState();

export { gameState }
