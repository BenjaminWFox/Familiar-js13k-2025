import { Path, PATH_1, PATH_2, STRINGS } from "./constants";

class WaveData {
  allowedTowers: string[] = [];
  allowedCritters: string[] = [];
  allowedCats: boolean = true;
  path: Path = [];
  maxSpawns: number;
  lives: number;
  spawnFrequency: number;
  startingCash: number;

  constructor(
    allowedTowers: string[],
    allowedCritters: string[],
    allowedCats: boolean,
    path: Path,
    maxSpawns: number,
    lives: number,
    spawnFrequency: number,
    startingCash: number,
) {
    this.allowedTowers = allowedTowers;
    this.allowedCritters = allowedCritters;
    this.allowedCats = allowedCats;
    this.path = path;
    this.maxSpawns = maxSpawns;
    this.lives = lives;
    this.spawnFrequency = spawnFrequency;
    this.startingCash = startingCash;
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
    300
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
