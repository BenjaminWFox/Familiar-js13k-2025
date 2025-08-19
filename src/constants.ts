export const WIDTH = 3000;
export const HEIGHT = 2000;
export const X_TILES = 30;
export const Y_TILES = 20;
export const X_TILE_WIDTH = WIDTH / X_TILES / 2;
export const Y_TILE_HEIGHT = HEIGHT / Y_TILES / 2;


export const MENU_TOWER_START_X = 0
export const MENU_TOWER_START_Y = 0

export type Tile = [number, number];
export type Path = Array<Tile>;

export const PATH: Path = [
  [4, -1],
  [4, 0],
  [4, 1],
  [3, 2],
  [3, 3],
  [3, 4],
  [2, 5],
  [2, 6],
  [3, 7],
  [3, 8],
  [4, 9],
  [4, 10],
  [4, 11],
  [4, 12],
  [4, 13],
  [3, 14],
  [2, 15],
  [2, 16],
  [3, 17],
  [4, 17],
  [5, 17],
  [6, 17],
  [7, 16],
  [8, 15],
  [9, 14],
  [10, 13],
  [11, 12],
  [12, 11],
  [12, 10],
  [13, 9],
  [13, 8],
  [14, 7],
  [15, 6],
  [16, 5],
  [17, 5],
  [18, 6],
  [19, 7],
  [20, 8],
  [20, 9],
  [20, 10],
  [21, 11],
  [22, 12],
  [23, 13],
  [24, 13],
  [25, 13],
];

// Wrote this backwards
// it is y,x (not x,y)
export const PATH_OBJ: Record<string, number> = {};

export const CRITTER_MOVE_SPEED = 5;

export const CENTER_X = WIDTH / 2;
export const CENTER_Y = HEIGHT / 2;
export const PLAYER_ACCELERATION = 0.0015;
export const PLAYER_DECCELERATION = 0.002;
export const PLAYER_MAX_SPEED = 0.12;
export const PLAYER_JUMP_POWER = 0.18;
export const GRAVITY = 0.0008;
export const FLOATY_GRAVITY = 0.0004;
export const TILEMAP_WIDTH = 128;
export const TILEMAP_HEIGHT = 16;
export const TILE_SIZE = 16;
export const HALF_TILE_SIZE = TILE_SIZE / 2;
