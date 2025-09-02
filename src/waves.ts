import { Path, PATH_1, PATH_2, STRINGS } from "./constants";
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

  complete: boolean = false;
  waveEvent: (gs: GameState) => void;

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
}

function defaultWaveEvent (this: WaveData, _: GameState) {
  this.complete = true;
}

function wave1Event (this: WaveData, gameState: GameState) {
  if (gameState.waveSpawns >= this.maxSpawns && critters.length === 0 && cats.length === 0) {
    this.allowedTowers.push(STRINGS.fish, STRINGS.scratch);
    new Cat();
    this.complete = true;
    gameState.showDialog(
      ['Oh no, a black cat!!', '',
        'A black cat counts for 10 critters!', '',
        'Add a tower to distract it!', '', '',
        'You can click a tower to sell it for extra cash.'
      ]);
  }
}

export const WAVE_DATA = {
  1: new WaveData(
    [STRINGS.kid],
    [STRINGS.frog, STRINGS.lizard, STRINGS.snake],
    false,
    PATH_1,
    2,
    10,
    40,
    300,
    wave1Event
  ),
  2: new WaveData(
    [STRINGS.kid],
    [STRINGS.frog, STRINGS.lizard, STRINGS.snake],
    false,
    PATH_2,
    30,
    10,
    30,
    300
  ),
}

export const TOTAL_WAVES = Object.keys(WAVE_DATA).length;
