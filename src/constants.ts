export const WIDTH = 3000;
export const HEIGHT = 2000;
export const X_TILES = 30;
export const Y_TILES = 20;
export const X_TILE_WIDTH = WIDTH / X_TILES / 2;
export const Y_TILE_HEIGHT = HEIGHT / Y_TILES / 2;

export const PATH = [
  [5,0],
  [5,1],
  [4,2],
  [4,3],
  [4,4],
  [3,5],
  [3,6],
  [4,7],
  [4,8],
  [5,9],
  [5,10],
  [5,11],
  [5,12],
  [5,13],
  [4,14],
  [3,15],
  [3,16],
  [4,17],
  [5,17],
  [6,17],
  [7,17],
  [8,16],
  [9,15],
  [10,14],
  [11,13],
  [12,12],
  [13,11],
  [13,10],
  [14,9],
  [14,8],
  [15,7],
  [16,6],
  [17,5],
  [18,5],
  [19,5],
  [20,6],
  [21,7],
  [22,8],
  [22,9],
  [23,10],
  [24,11],
  [25,12],
  [26,13],
  [27,13],
  [28,13],
  [29,13],
];

// Wrote this backwards
// it is y,x (not x,y)
export const PATH_OBJ = {
  '5,0': 1,
  '5,1': 1,
  '4,2': 1,
  '4,3': 1,
  '4,4': 1,
  '3,5': 1,
  '3,6': 1,
  '4,7': 1,
  '4,8': 1,
  '5,9': 1,
  '5,10': 1,
  '5,11': 1,
  '5,12': 1,
  '5,13': 1,
  '4,14': 1,
  '3,15': 1,
  '3,16': 1,
  '4,17': 1,
  '5,17': 1,
  '6,17': 1,
  '7,17': 1,
  '8,16': 1,
  '9,15': 1,
  '10,14': 1,
  '11,13': 1,
  '12,12': 1,
  '13,11': 1,
  '13,10': 1,
  '14,9': 1,
  '14,8': 1,
  '15,7': 1,
  '16,6': 1,
  '17,5': 1,
  '18,5': 1,
  '19,5': 1,
  '20,6': 1,
  '21,7': 1,
  '22,8': 1,
  '22,9': 1,
  '23,10': 1,
  '24,11': 1,
  '25,12': 1,
  '26,13': 1,
  '27,13': 1,
  '28,13': 1,
  '29,13': 1,
}

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
