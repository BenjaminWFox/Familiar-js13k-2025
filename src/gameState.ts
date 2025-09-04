import { TOTAL_WAVES, WAVE_DATA } from "./waves";
import { canvas, ctx, mapCtx } from "./elements";
import { Button, cashes, cats, Critter, critters, dialog, particles, selectWave, startBtn, towers, waveBest, WaveStars, Witch, witches } from "./entity";
import { drawTileMap } from "./maps";
import { createP1 } from "./p1";
import { sounds } from "./sounds";
import { getLocalStorageWaveData, getStarsResultForWave, setLocalStorageWaveData } from "./utils";
import { MENU_START_X } from "./constants";
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
  touchStartAt: number = 0;
  hasTouchDown: boolean = false;
  isTouchDragging: boolean = false;
  yTouchOffset: number = 0;
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
  waveBestResult: number = 0;

  escaped: number = 0;
  waveSpawns: number = 0;
  waveTime: number = 0;
  waveMissedCritters: number = 0;
  waveMissedCats: number = 0;
  ended: boolean = false;
  starResults: number | undefined;

  dialogCallback: () => void;
  dialogText: string[] = [];
  dialogShowCancel: boolean = false;

  waveSelectBtns: Array<Button> = [];
  waveStars: Array<WaveStars> = [];

  defaultCallback = () => {
    this.closeDialog();
  }

  setState(scene: SCENES) {
    switch(scene) {
      case SCENES.start:
        this.clearBoard();
        startBtn.addListener();
        selectWave.addListener();
        this.updateCurrentStars();
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

  get totalStars() {
    return this.waves * 3;
  }

  _currentStars = 0;
  get currentStars() {
    return this._currentStars;
  }

  updateCurrentStars() {
    console.log('updateCurrentStars')
    let stars = 0;
    for (let i = 1;i<=gameState.waves;i++) {
      const cs = getLocalStorageWaveData(i)
      console.log('Running for', i, cs)
      stars += cs.stars || 0
    }
    this._currentStars = stars;
  }

  addEscapedCritter() {
    this.waveMissedCritters++;
  }

  addEscapedCat() {
    this.waveMissedCats++;
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
      // this.wave = 7;
      // this.setState(SCENES.playing);
    /** For debug **/
    this._waveData = WAVE_DATA[this.wave as keyof typeof WAVE_DATA]();
    this.clearBoard();
    this.ended = false;
    this.starResults = undefined;
    this.cash = this.waveData.startingCash;
    this.waveData.restart();
    this.waveTime = 0;
    this.escaped = 0;
    this.waveSpawns = 0;
    this.waveMissedCats = 0;
    this.waveMissedCritters = 0;
    this.waveBestResult = getLocalStorageWaveData(this.wave).stars;
    waveBest.push(
      new WaveStars(MENU_START_X + 175, 150, this.waveBestResult > 0, false),
      new WaveStars(MENU_START_X + 245, 150, this.waveBestResult > 1, false),
      new WaveStars(MENU_START_X + 315, 150, this.waveBestResult > 2, false)
    )
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
    waveBest.forEach(s => s.deleted = true);
  }

  nextWave() {
    this.wave += 1;
    this.startWave();
  }

  runWave() {
    this.waveData.waveEvent(this);

    // Finish wave
    if (
      this.waveData.complete &&
      this.waveSpawns >= this.waveData.maxSpawns &&
      critters.length === 0 &&
      cats.every(c => c.distracted) &&
      this.escaped < this.waveData.lives &&
      !this.ended
    ) {
      this.ended = true;
      this.starResults = getStarsResultForWave(gameState.waveMissedCritters, gameState.waveMissedCats);
      setLocalStorageWaveData(this.wave, this.starResults);

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
      // // Lose condition removed in favor of 3-star condition

      // this.ended = true;

      // setTimeout(() => {
      //   this.showDialog([
      //     'Oh no you failed!', '',
      //     'The witch has completed her brew!'
      //   ], () => { this.setState(SCENES.start) })
      // }, 2000);
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
      sounds.dialog();
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

    // See https://github.com/curtastic/p1
    // Tune 1 by Ben Fox
    // Tune 2 by Google Gemini
    this.p1`120.100
      |Y-c-h-g-|----fef-|b-a-----|e-g-k-h-|g---Y-c-|e-b-----|----bcb-|Y-c-h-g-|----e-g-|k-h-g---|----bcb-|fef-lkl-|h-g-hkg-|ekd-e---|c-b-Y-Z-|c-b-Z---|Y-c-h-g-|----fef-|b-a-----|e-g-k-h-|g---Y-c-|e-b-----|----bcb-|Y-c-h-g-|----e-g-|k-h-g---|----bcb-|fef-lkl-|h-g-hkg-|ekd-e---|c-b-Y-Z-|c-b-Z---|----    |hhaajjkk|k---j-h-|kkccddff|f-c-h---|k-h-c-a-|ccccddff|a-Y-c-j-|h-------|l-h-t-j-|k---j-h-|kkcch-tt|wwvvkk--|d-c-h-a-|Y-a-c-Y-|h---h---|h-------|hhaajjkk|k---j-h-|k-h-c-a-|d-c-h---|ccccddff|a-Y-c-j-|f-c-h---|h-------|kkccddff|h-h-k-k-|wwvvkk--|Y-Y-a-a-|k-j-h-d-|c-a-Y-c-|c-h-k-h-|h-------|
      |A---A---|D---D---|A-------|F-------|I-------|J-------|I-------|F-------|A-------|H-------|A-------|K---K---|I-------|H-------|F-------|F-------|A---A---|D---D---|A-------|F-------|I-------|J-------|I-------|F-------|A-------|H-------|A-------|K---K---|I-------|H-------|F-------|F-------|----    |J-Q-J-Q-|R---Q-J-|T---Q-J-|R---Q-J-|J---Q-R-|T---Q-J-|J-Q-J-Q-|J-------|J-T-J-T-|R-Q-J-Q-|J-J-J-J-|R-R-R-R-|T-Q-J-Q-|R---J-Q-|J---J---|J-------|J-Q-J-Q-|R---Q-J-|J---Q-R-|T---Q-J-|J-Q-J-Q-|T-Q-J-Q-|R---Q-J-|J-------|J-J-J-J-|R-R-R-R-|T-T-T-T-|Q---Q-J-|Q---Q---|Q-Q-J-J-|J---J---|J-------|
    `
}
  stop() {
    this.music = false;
    this.p1``;
  }
}

const gameState = new GameState();

export { gameState }
