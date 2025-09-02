import { Path, PATH_1, PATH_2, PATH_3, STRINGS } from "./constants";
import { Cat, cats, critters } from "./entity";
import { GameState } from "./gameState";

class WaveData {
  allowedTowers: string[] = [];
  allowedCritters: string[] = [];
  allowedCats: boolean = true;
  path: Path = [];
  maxSpawns: number;
  lives: number;
  spawnFrequency: number;
  startingCash: number;

  waveEvent: (gs: GameState) => void;

  complete: boolean = false;

  constructor(
    allowedTowers: string[],
    allowedCritters: string[],
    allowedCats: boolean,
    path: Path,
    maxSpawns: number,
    lives: number,
    spawnFrequency: number,
    startingCash: number,
    waveEvent: (gs: GameState) => void = defaultWaveEvent
) {
    this.allowedTowers = allowedTowers;
    this.allowedCritters = allowedCritters;
    this.allowedCats = allowedCats;
    this.path = path;
    this.maxSpawns = maxSpawns;
    this.lives = lives;
    this.spawnFrequency = spawnFrequency;
    this.startingCash = startingCash;
    this.waveEvent = waveEvent.bind(this);
  }

  restart() {
    this.complete = false;
  }
}

function defaultWaveEvent (this: WaveData, _: GameState) {
  this.complete = true;
}

function wave1Event (this: WaveData, gameState: GameState) {
  if (gameState.waveTime === 120) {
    gameState.showDialog([
      'Oh no! The witch is making her brew...',
      'Dont let her catch critters to fill her cauldron.',
      '',
      'Place towers along the path to catch critters!',
      'Catching critters earns you $ to build more towers.',
      '',
      'Get some "High-energy Kids" out there now!',
      'Tower coverage shows in light blue when placing.'
    ])
  }

  if (
    !this.complete &&
    gameState.waveSpawns >= this.maxSpawns
  ) {
    this.allowedTowers.push(STRINGS.fish, STRINGS.scratch);
    new Cat();
    this.complete = true;
    gameState.showDialog(
      [
        'Oh no, a black cat!! It counts as 10 critters!', '',
        'It will also CURSE many of your towers!', '',
        'Add a Fish on a Stick to distract it!', '',
        'Click a tower to sell it for extra cash if needed.'
      ]);
  }
}

function wave2Event (this: WaveData, gameState: GameState) {
  if (gameState.waveTime === 150) {
    gameState.showDialog([
      'FLIIIES!', '',
      'The kids cant catch flies.', '',
      'Send out the guy with the net!', '',
      'Watch out for Black Cats and snakes...',
    ])
  }
  if (gameState.waveTime === 600) {
    this.allowedCritters.push(STRINGS.snake);
  }
  if (gameState.waveTime === 1200) {
    new Cat();
    this.complete = true;
  }
}

function wave3Event (this: WaveData, gameState: GameState) {
  if (gameState.waveTime === 150) {
    gameState.showDialog([
      'Oh geez, the rest of our team fell behind!',
      '',
      'Fortunately we have these fans and vaccuums.',
      '',
      'Stop the critters with fans, and collect them',
      'with vaccuums!',
    ])
  }
  if(
    !this.complete &&
    gameState.waveSpawns >= this.maxSpawns &&
    cats.length === 0
  ) {
    new Cat();
  }
  if (
    !this.complete &&
    gameState.waveSpawns >= this.maxSpawns &&
    critters.length === 0 // &&
    // cats.length === 0
  ) {
    this.allowedTowers.push(STRINGS.fish, STRINGS.scratch);
    new Cat();
    // new Cat();
    // new Cat();
    // new Cat();
    this.complete = true;
    gameState.showDialog(
      [
        'Oh no a herd of Black Cats!', '',
        'Our appliances are no match for them!!', '',
        'Quickly, put out a Scratching Post!', '',
      ],
      () => {
        for (let i = 1; i < 4;i++) {
          setTimeout(() => {
            new Cat();
          }, i * 500)
        }
      }
    );
  }
}

function wave4Event (this: WaveData, gameState: GameState) {
  if (!this.complete &&
    gameState.waveTime % 240 === 0
  ) {
    new Cat();
  }

  if (gameState.waveTime > 2200) {
    this.complete = true;
  }
}


export const WAVE_DATA = {
  1: () => new WaveData(
    [STRINGS.kid],
    [STRINGS.frog, STRINGS.lizard, STRINGS.snake],
    false,
    PATH_1,
    20,
    10,
    40,
    300,
    wave1Event
  ),
  2: () => new WaveData(
    [STRINGS.kid, STRINGS.net, STRINGS.fish, STRINGS.scratch],
    [STRINGS.fly],
    false,
    PATH_2,
    40,
    10,
    30,
    400,
    wave2Event
  ),
  3: () => new WaveData(
    [STRINGS.vaccuum, STRINGS.fan, STRINGS.fish, STRINGS.scratch],
    [STRINGS.fly, STRINGS.lizard, STRINGS.frog],
    false,
    PATH_3,
    50,
    25,
    30,
    500,
    wave3Event,
  ),
  4:  () => new WaveData(
    [STRINGS.kid, STRINGS.net, STRINGS.vaccuum, STRINGS.fan, STRINGS.fish, STRINGS.scratch],
    [STRINGS.fly, STRINGS.lizard, STRINGS.frog],
    false,
    PATH_3,
    100,
    250,
    20,
    500,
    wave4Event,
  ),
}

export const TOTAL_WAVES = Object.keys(WAVE_DATA).length;
