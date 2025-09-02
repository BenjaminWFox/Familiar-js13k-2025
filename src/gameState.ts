import { TOTAL_WAVES, WAVE_DATA } from "./waves";
import { canvas, ctx, mapCtx } from "./elements";
import { Button, cashes, cats, Critter, critters, dialog, selectWave, startBtn, towers, Witch, witches } from "./entity";
import { drawTileMap } from "./maps";
// import { COLOR_MENU_GREEN_1, COLOR_MENU_GREEN_2, HEIGHT, MENU_START_X, TILE_WIDTH, WIDTH } from "./constants";
// import { setFont } from "./utils";

export enum SCENES {
  start,
  playing,
  gameoverLost,
  gameoverWon,
  dialog,
}

export class GameState {
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
  waveSpawns: number = 0;
  waveTime: number = 0;

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

  get waveData() {
    return WAVE_DATA[this.wave as keyof typeof WAVE_DATA];
  }

  startWave() {
    this.cash = this.waveData.startingCash;
    this.waveTime = 0;
    this.escaped = 0;

    drawTileMap(mapCtx);

    new Witch();
  }

  nextWave() {
    this.wave += 1;
    towers.forEach(t => t.sell());
    cashes.forEach(c => c.deleted = true);
    cats.forEach(c => c.deleted = true);
    witches.forEach(w => w.deleted = true);
    this.startWave();
  }

  runWave() {
    // Finish wave
    this.waveData.waveEvent(this);
    if (this.waveData.complete && this.waveSpawns >= this.waveData.maxSpawns && critters.length === 0 && cats.every(c => c.distracted)) {
      console.log('WAVE COMPLETE');
      const msg = [`Wave ${this.wave} complete!`, ''];
      if (this.wave < TOTAL_WAVES) {
        msg.push(`On to Wave ${this.wave + 1}!`);
      } else if (this.wave === TOTAL_WAVES) {
        msg.push(`You did it! The Witches Cauldron was never filled!`);
      }
      setTimeout(() => {
        this.showDialog(msg, () => this.nextWave())
      }, 2000);
    }

    // Spawn Critters
    if (this.waveTime % this.waveData.spawnFrequency === 0 && this.waveSpawns < this.waveData.maxSpawns) {
      this.waveSpawns++;
      new Critter();
    }

    if (gameState.gameTime % 100 === 0) {
      // new Cat();
    }

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

const wave1Events = () => {

}

const gameState = new GameState();

export { gameState }
