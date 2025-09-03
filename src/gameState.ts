import { TOTAL_WAVES, WAVE_DATA } from "./waves";
import { canvas, ctx, mapCtx } from "./elements";
import { Button, cashes, cats, Critter, critters, dialog, particles, selectWave, startBtn, towers, Witch, witches } from "./entity";
import { drawTileMap } from "./maps";
import { createP1 } from "./p1";
import { sounds } from "./sounds";
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
  waves = Object.keys(WAVE_DATA).length;
  gameTime: number = 0;
  image: HTMLImageElement | undefined;
  paused: boolean = false;
  state?: SCENES = undefined;
  canvas: HTMLCanvasElement;
  ctx: CanvasRenderingContext2D;
  wave: number = 1;
  cash: number = 250;
  p1: any;
  music: boolean = false;

  escaped: number = 0;
  waveSpawns: number = 0;
  waveTime: number = 0;
  ended: boolean = false;

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
    this.p1 = createP1();
  }

  addEscaped(n: number = 1) {
    this.escaped += n;
  }

  closeDialog(scene: SCENES = SCENES.playing) {
    this.setState(scene);
    this.dialogShowing = false;
    dialog.hasRendered = false;
  }

  _waveData = WAVE_DATA[1]();
  get waveData() {
    return this._waveData;
  }

  startWave() {
    /** For debug **/
      // this.wave = 1;
      // this.setState(SCENES.playing);
    /** For debug **/
    this._waveData = WAVE_DATA[this.wave as keyof typeof WAVE_DATA]();
    this.clearBoard();
    this.ended = false;
    this.cash = this.waveData.startingCash;
    this.waveData.restart();
    this.waveTime = 0;
    this.escaped = 0;
    this.waveSpawns = 0;

    drawTileMap(mapCtx);

    new Witch();
  }

  clearBoard() {
    towers.forEach(t => t.remove());
    cashes.forEach(c => c.deleted = true);
    cats.forEach(c => c.deleted = true);
    witches.forEach(w => w.deleted = true);
    critters.forEach(c => c.deleted = true);
    particles.forEach(p => p.deleted = true);
  }

  nextWave() {
    this.wave += 1;
    this.startWave();
  }

  runWave() {
    // Finish wave
    this.waveData.waveEvent(this);
    if (
      this.waveData.complete &&
      this.waveSpawns >= this.waveData.maxSpawns &&
      critters.length === 0 &&
      cats.every(c => c.distracted) &&
      this.escaped < this.waveData.lives &&
      !this.ended
    ) {
      this.ended = true;
      const msg = [`Wave ${this.wave} complete!`, ''];
      if (this.wave < TOTAL_WAVES) {
        msg.push(`On to Wave ${this.wave + 1}!`);
      } else if (this.wave === TOTAL_WAVES) {
        msg.push(`You did it! The Witches Cauldron was never filled!`);
      }

      setTimeout(() => {
        this.showDialog(
          msg,
          () => {
            if (this.wave === TOTAL_WAVES) {
              this.wave = 1;
              this.setState(SCENES.start);
            } else {
              this.nextWave();
            }
          })
      }, 2000);
    } else if (
      this.escaped >= this.waveData.lives &&
      !this.ended
    ) {
      this.ended = true;

      setTimeout(() => {
        this.showDialog([
          'Oh no you failed!', '',
          'The witch has completed her brew!'
        ], () => { this.setState(SCENES.start) })
      }, 2000);
    }

    // Spawn Critters
    if (
      this.waveTime % this.waveData.spawnFrequency === 0 &&
      this.waveSpawns < this.waveData.maxSpawns &&
      this.waveData.allowedCritters.length
    ) {
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
      sounds.dialogOrPlacement();
      this.state = SCENES.dialog;
      this.dialogCallback = callback || this.defaultCallback;
      this.dialogText = text;
      this.dialogShowCancel = showCancel;
      this.dialogShowing = true;
    }
  }
  play() {
    if (this.music) return;

    this.music = true;
    // p1`50.25
    // |C----H--|--------|        |J----A--|--------|        |F----E--|--------|        |H----F--|--------|        |A----C--|--------|        |E----C--|--------|        |F----J--|--------|        |C----F--|--------|     |`
    // |C---H---|--------|        |J---A---|--------|        |F---E---|--------|        |H---F---|--------|        |A---C---|--------|        |E---C---|--------|        |F---J---|--------|        |C---F---|--------|     |
    // 
    // |V-Y-c-V-|d---c-a-|V-Y-c-V-|d---c-a-|
    this.p1`90
    |Y-c-h-g-|----fef-|b-a-----|e-g-k-h-|g---Y-c-|e-b-----|----bcb-|Y-c-h-g-|----e-g-|k-h-g---|----bcb-|fef-lkl-|h-g-hkg-|ekd-e---|c-b-Y-Z-|c-b-Z---|Y-c-h-g-|----fef-|b-a-----|e-g-k-h-|g---Y-c-|e-b-----|----bcb-|Y-c-h-g-|----e-g-|k-h-g---|----bcb-|fef-lkl-|h-g-hkg-|ekd-e---|c-b-Y-Z-|c-b-Z---|
    |A---A---|D---D---|A-------|F-------|I-------|J-------|I-------|F-------|A-------|H-------|A-------|K---K---|I-------|H-------|F-------|F-------|A---A---|D---D---|A-------|F-------|I-------|J-------|I-------|F-------|A-------|H-------|A-------|K---K---|I-------|H-------|F-------|F-------|
    `
  }
  stop() {
    this.music = false;
    this.p1``;
  }
}

const gameState = new GameState();

export { gameState }
