export const WIDTH = 3000;
export const HEIGHT = 2000;
export const X_TILES = 60;
export const Y_TILES = 40;
export const TILE_WIDTH = 50;
export const LAYERS = {
  base: 10,
  pather: 20,
  critters: 30,
  towers: 40,
  fetchers: 50,
  fetchersCarry: 55,
  menu: 60,
  menuTowers: 70
}

export const DEBUG = {
  ignoreTowerCost: true
}

export const TOWER_WIDTH = TILE_WIDTH * 3;

export const MENU_START_X = WIDTH - TILE_WIDTH * 12;
export const MENU_TOWER_START_Y = TILE_WIDTH * 8;
export const MENU_TOWER_Y_OFFSET = 175;

export const COLOR_MAP_GREEN = '#39941a';
export const COLOR_MENU_GREEN_1 = '#26700dff';
export const COLOR_MENU_GREEN_2 = '#164e04ff';

export type Tile = [number, number];
export type Path = Array<Tile>;

export const STRINGS = {
  fetcher: 'fetcher',
  catcher: 'catcher',
  cat: 'cat',
  fly: 'fly',
  frog: 'frog',
  snake: 'snake',
  lizard: 'lizard',
  witch: 'witch',
  kid: 'kid',
  fan: 'fan',
  vaccuum: 'vaccuum',
  net: 'net',
  fish: 'fish',
  scratch: 'scratch',
}

export const TOWER_COST = {
  [STRINGS.kid]: 150,
  [STRINGS.fan]: 50,
  [STRINGS.vaccuum]: 100,
  [STRINGS.net]: 300,
  [STRINGS.fish]: 100,
  [STRINGS.scratch]: 250,
}

export const PATH_1: Path = [
  [-2, 22],
  [0, 22],
  [2, 22],
  [4, 22],
  [6, 22],
  [8, 22],
  [10, 22],
  [12, 22],
  [14, 22],
  [16, 22],
  [18, 22],
  [20, 22],
  [22, 22],
  [24, 22],
  [26, 22],
  [28, 22],
  [30, 22],
  [32, 22],
  [34, 22],
  [36, 22],
  [38, 22],
  [40, 22],
  [42, 22],
  [44, 22],
  [46, 22],
]

// export const PATH: Path = [
//   [8, -2],
//   [8, 0],
//   [8, 2],
//   [6, 4],
//   [6, 6],
//   [6, 8],
//   [4, 10],
//   [4, 12],
//   [6, 14],
//   [6, 16],
//   [8, 18],
//   [8, 20],
//   [8, 22],
//   [8, 24],
//   [8, 26],
//   [6, 28],
//   [4, 30],
//   [4, 32],
//   [6, 34],
//   [8, 34],
//   [10, 34],
//   [12, 34],
//   [14, 32],
//   [16, 30],
//   [18, 28],
//   [20, 26],
//   [22, 24],
//   [24, 22],
//   [24, 20],
//   [26, 18],
//   [26, 16],
//   [28, 14],
//   [30, 12],
//   [32, 10],
//   [34, 10],
//   [36, 12],
//   [38, 14],
//   [40, 16],
//   [40, 18],
//   [40, 20],
//   [42, 22],
//   [44, 24],
//   [46, 26],
//   [48, 26],
//   [50, 26],
// ];

export const PATH_2: Path = [
  [8, -2],
  [8, 0],
  [8, 2],
  [6, 4],
  [6, 6],
  [6, 8],
  [4, 10],
  [4, 12],
  [6, 14],
  [6, 16],
  [8, 18],
  [8, 20],
  [8, 22],
  [8, 24],
  [8, 26],
  [6, 28],
  [4, 30],
  [4, 32],
  [6, 34],
  [8, 34],
  [10, 34],
  [12, 34],
  [14, 32],
  [16, 30],
  [18, 28],
  [18, 26],
  [18, 24],
  [20, 22],
  [20, 20],
  [22, 18],
  [22, 16],
  [24, 14],
  [24, 12],
  [22, 10],
  [20, 8],
  [20, 6],
  [22, 4],
  [24, 4],
  [26, 4],
  [28, 6],
  [28, 8],
  [30, 10],
  [32, 10],
  [34, 12],
  [34, 14],
  [36, 16],
  [36, 18],
  [36, 20],
  [38, 22],
  [40, 22],
  [42, 22],
  [44, 22],
  [46, 22],
];

export const PATH_OBJ: Record<string, number> = {};

export const CRITTER_MOVE_SPEED = 5;
