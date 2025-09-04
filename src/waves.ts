import { Path, PATH_STRIGHT, PATH_2, PATH_4, PATH_5, STRINGS, PATH_CLOSE_RIGHT, PATH_6, PATH_7, CRITTER_DEFAULT_SPEED, CAT_DEFAULT_SPEED } from "./constants";
import { Cat, cats, critters } from "./entity";
import { GameState } from "./gameState";

class WaveData {
  allowedTowers: string[] = [];
  allowedCritters: string[] = [];
  path: Path = [];
  maxSpawns: number;
  spawnFrequency: number;
  startingCash: number;
  critterSpeed: number;
  catSpeed: number;

  waveEvent: (gs: GameState) => void;

  complete: boolean = false;

  constructor(
    allowedTowers: string[],
    allowedCritters: string[],
    path: Path,
    maxSpawns: number,
    spawnFrequency: number,
    startingCash: number,
    critterSpeed: number,
    catSpeed: number,
    waveEvent: (gs: GameState) => void = defaultWaveEvent
) {
    this.allowedTowers = allowedTowers;
    this.allowedCritters = allowedCritters;
    this.path = path;
    this.maxSpawns = maxSpawns;
    this.spawnFrequency = spawnFrequency;
    this.startingCash = startingCash;
    this.critterSpeed = critterSpeed;
    this.catSpeed = catSpeed;
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
  if (gameState.waveTime === 30) {
    gameState.showDialog([
      'Oh no! The Witch is making her evil soup...',
      'dont let her catch critters to fill her cauldron!',
      '',
      'Drag towers from menu to map to catch critters...',
      'catching critters earns you $ to build more towers!',
      '',
      'Get some "High-energy Kids" out there now...',
      'a tower covers the blue squares shown while dragging!'
    ])
  }

  if (
    !this.complete &&
    gameState.waveSpawns >= this.maxSpawns
  ) {
    this.allowedTowers.push(STRINGS.fish, STRINGS.scratch);
    this.complete = true;
    gameState.showDialog(
      [
        'Oh no, a Black Cat!! Its much faster than critters!', '',
        'It will also CURSE many of your towers as it passes!', '',
        'Place a Fish on a Stick to distract it!', '',
        'Click a tower to sell it for extra cash if needed.'
      ], () => new Cat());
  }
}

function wave2Event (this: WaveData, gameState: GameState) {
  if (gameState.waveTime === 30) {
    gameState.showDialog([
      'FLIIIES!', '',
      'The kids cant catch flies.', '',
      'Send out the guy with the net!', '',
      'Watch out for Black Cats and snakes...',
    ])
  }
  if (gameState.waveTime === 600) {
    gameState.showDialog([
      'SNAKES ON A PATH!', '',
      'Snakes are too sneaky for a net...',
      'put out some kids to chase them down!', '',
      'Black Cats are coming soon...',
      'Fish on a Stick anyone?!'
    ])
    this.allowedTowers.push(STRINGS.kid, STRINGS.fish, STRINGS.scratch);
    this.allowedCritters.push(STRINGS.snake);
  }
  if (gameState.waveTime === 1200) {
    new Cat();
    this.complete = true;
  }
}

function staggerSpawnCats(n: number) {
  for (let i = 1; i <= n;i++) {
    setTimeout(() => {
      new Cat();
    }, i * 500)
  }
}

function wave3Event (this: WaveData, gameState: GameState) {
  if (gameState.waveTime === 30) {
    gameState.showDialog([
      'Oh geez oh geez the Witch is right there!', '',
      'And our critter catching kids have fallen behind!', '',
      'Slow the critters down with these fans...',
      'until the kids catch up!',
    ])
  }
  if (gameState.waveTime === 1200) {
    gameState.showDialog([
      'Ahh here they are, put those kids to work!', '',
      'Watch out for snakes sneaking under the fans.',
    ])
    this.allowedTowers.push(STRINGS.kid);
    this.allowedCritters.push(STRINGS.snake);
    this.complete = true;
  }
}

function wave4Event (this: WaveData, gameState: GameState) {
  if (gameState.waveTime === 30) {
    gameState.showDialog([
      'Oh geez, the rest of our team is lost again!',
      '',
      'But we found some vaccuums to go with our fans!',
      '',
      'Stop the critters with fans...',
      'and collect them with vaccuums!',
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
    critters.length === 0
  ) {
    this.allowedTowers.push(STRINGS.fish, STRINGS.scratch);
    new Cat();
    this.complete = true;
    gameState.showDialog(
      [
        'Oh no a herd of Black Cats!', '',
        'Our appliances are no match for them!!', '',
        'Quickly, put out a Scratching Post!', '',
      ],
      () => {
        staggerSpawnCats(3);
      }
    );
  }
}

function wave5Event (this: WaveData, gameState: GameState) {
  if(
    gameState.waveTime === 60 ||
    gameState.waveTime === 400
  ) {
      new Cat();
  }

  if (gameState.waveTime === 30) {
    gameState.showDialog([
      'Well, our guys havent caught up yet...',
      'and we are out of appliances!',
      '',
      'Hold off these Black Cats until we can regroup!',
    ])
  }

  if (gameState.waveTime === 1000) {
    gameState.showDialog([
      'Oooh I found $200 under a rock!',
      '',
      'Good things too, more Black Cats are coming!',
      '',
      'Sell a Fish on a Stick to buy a Scratching Post...',
      'but be quick, selling it will release the cat!',
    ], () => {
      gameState.cash += 200;
      new Cat();
      staggerSpawnCats(2);
      this.complete = true;
    })
  }
}

function wave6Event (this: WaveData, gameState: GameState) {
  if (gameState.waveTime === 30) {
    gameState.showDialog([
      '(Wave 6)', '',
      'Whew, everyone has caught up!', '',
      'Just in time for our final stand!', '',
      'Use everything you can to thwart the Witch!',
    ])
  }
  this.complete = true;
}

function wave7Event (this: WaveData, _: GameState) {
  // if (gameState.waveTime === 30) {
  //   gameState.showDialog([
  //     '(Wave 7)', '',
  //     'Whew, everyone has caught up!', '',
  //     'Just in time for our final stand!', '',
  //     'Use everything you can to thwart the Witch!',
  //   ])
  // }
  this.complete = true;
}

export const WAVE_DATA = {
  1: () => new WaveData(
    [STRINGS.kid],
    [STRINGS.frog, STRINGS.lizard, STRINGS.snake],
    PATH_STRIGHT,
    25,
    75,
    400,
    CRITTER_DEFAULT_SPEED,
    CAT_DEFAULT_SPEED,
    wave1Event
  ),
  2: () => new WaveData(
    [STRINGS.net],
    [STRINGS.fly],
    PATH_2,
    40,
    30,
    300,
    CRITTER_DEFAULT_SPEED,
    CAT_DEFAULT_SPEED,
    wave2Event
  ),
  3: () => new WaveData(
    [STRINGS.fan,],
    [STRINGS.lizard, STRINGS.frog],
    PATH_CLOSE_RIGHT,
    50,
    50,
    400,
    CRITTER_DEFAULT_SPEED,
    CAT_DEFAULT_SPEED,
    wave3Event,
  ),
  4: () => new WaveData(
    [STRINGS.vaccuum, STRINGS.fan, STRINGS.fish, STRINGS.scratch],
    [STRINGS.fly, STRINGS.lizard, STRINGS.frog],
    PATH_4,
    50,
    30,
    500,
    CRITTER_DEFAULT_SPEED,
    CAT_DEFAULT_SPEED,
    wave4Event,
  ),
  5:  () => new WaveData(
    [STRINGS.fish, STRINGS.scratch],
    [],
    PATH_5,
    0,
    20,
    200,
    CRITTER_DEFAULT_SPEED,
    CAT_DEFAULT_SPEED,
    wave5Event,
  ),
  6: () => new WaveData(
    [STRINGS.fan, STRINGS.kid, STRINGS.vaccuum, STRINGS.net, STRINGS.fish, STRINGS.scratch],
    [STRINGS.fly, STRINGS.frog, STRINGS.snake, STRINGS.lizard],
    PATH_6,
    150,
    20,
    500,
    CRITTER_DEFAULT_SPEED,
    CAT_DEFAULT_SPEED,
    wave6Event
  ),
  7: () => new WaveData(
    [STRINGS.fan, STRINGS.kid, STRINGS.vaccuum, STRINGS.net, STRINGS.fish, STRINGS.scratch],
    [STRINGS.fly, STRINGS.frog, STRINGS.snake, STRINGS.lizard],
    PATH_7,
    2000,
    10,
    500,
    CRITTER_DEFAULT_SPEED + 1,
    CAT_DEFAULT_SPEED + 1,
    wave7Event
  ),
}

export const TOTAL_WAVES = Object.keys(WAVE_DATA).length;
