import { canvas, ctx } from "./elements";
import { Button, dialog, selectWave, startBtn } from "./entity";
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
  state?: SCENES = undefined;
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

  setState(scene: SCENES) {
    switch(scene) {
      case SCENES.start:
        startBtn.addListener();
        selectWave.addListener();
        this.state = scene;
      break;
      case SCENES.playing:
        this.state = scene;
      break;
    }
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
    this.setState(scene);
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
  }
}

const gameState = new GameState();

export { gameState }
