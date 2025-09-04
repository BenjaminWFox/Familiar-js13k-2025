import { type Tile, COLOR_MAP_GREEN, HEIGHT, MENU_START_X, PATH_OBJ, STRINGS, TILE_WIDTH, WIDTH, X_TILES, Y_TILES } from "./constants";
import { Animal, getDirectionFromTo, NEXT_DIR, PlacedTower, TileCoveringTower } from "./entity";
import { gameState } from "./gameState";
import { sprites } from "./sprites";
import { convertTileToMapBounds, getRandomInt } from "./utils";

function testPath(x: number, y: number): keyof typeof PATH_OBJ {
  return `${x},${y}` as keyof typeof PATH_OBJ;
}

function findPathIndex(x: number, y: number) {
  return gameState.waveData.path.findIndex(([_x, _y]) => {
    return _x === x && _y === y
  });
}

export class TileData {
  x: number;
  y: number;
  isPath: boolean;
  hasTower: boolean = false;
  towerAtTile?: PlacedTower;
  fillinDir?: NEXT_DIR;
  pathIndex?: number;
  towersCoveringTile: TileCoveringTower[] = [];
  critters: Record<string, Animal> = {};
  imageRotation: number = 0;

  constructor(x: number, y: number, isPath: boolean = false, pathIndex?: number) {
    this.x = x;
    this.y = y;
    this.isPath = isPath;
    this.pathIndex = pathIndex;
  }

  removeOccupyingTower() {
    this.hasTower = false;
    this.towerAtTile = undefined;
  }

  addOccupyingTower(tower: PlacedTower) {
    this.hasTower = true;
    this.towerAtTile = tower;
  }
}

export const TILE_DATA_OBJ: Record<string, TileData> = {}
export const getTileDataKey = (x: number, y: number) => `${x},${y}`;
export const getTileDataEntry = (x: number, y: number) => TILE_DATA_OBJ[getTileDataKey(x, y)];

const fillerOptions = [STRINGS.tree1, STRINGS.tree2, STRINGS.grass1, STRINGS.grass2];
const images = {
  path: {x: 30},
  edge: {x: 20},
  inside: {x: 10},
  outside: {x: 0}
}

export function drawTileMap(ctx: CanvasRenderingContext2D): void {
  ctx.clearRect(0, 0, WIDTH, HEIGHT);

  Object.keys(PATH_OBJ).forEach(key => {
    delete PATH_OBJ[key];
  })
  
  Object.keys(TILE_DATA_OBJ).forEach(key => {
    delete TILE_DATA_OBJ[key];
  })

  // Create an object to prevent iterating every time
  // probably overkill
  gameState.waveData.path.forEach((e: Tile) => {
    PATH_OBJ[e.toString()] = 1
  });

  const tileWidthAdjust = TILE_WIDTH * .5

  function drawTile(x: number, y: number, type: any, rotation: number = 0) {
    const c = document.createElement('canvas');
    const c_ctx = c.getContext('2d') as CanvasRenderingContext2D;
    c.width = TILE_WIDTH;
    c.height = TILE_WIDTH;
    c_ctx.imageSmoothingEnabled = false;
    c_ctx.translate(tileWidthAdjust, tileWidthAdjust);
    c_ctx.rotate((rotation * Math.PI) / 180);
    c_ctx.drawImage(gameState.image!, type.x, type.y || 0, 10, 10, -tileWidthAdjust, -tileWidthAdjust, TILE_WIDTH, TILE_WIDTH)
    ctx.drawImage(c, x, y);
  }

  ctx.fillStyle = COLOR_MAP_GREEN;
  ctx.fillRect(0, 0, WIDTH, HEIGHT);

  // Build all TileData
  // Extra tiles added to support paths coming from bottom of screen (max Y)
  for(let y = 0; y < Y_TILES + 2; y++) {
    for(let x = 0; x < X_TILES; x++) {
      const currentIndex = findPathIndex(x, y);

      if (PATH_OBJ[testPath(x, y)]) {
        for(let i = x - 1; i < x + 2;i++) {
          for (let p = y - 1; p < y + 2;p++) {
            const tileData = getTileDataEntry(i, p);
            if (!tileData) {
              TILE_DATA_OBJ[getTileDataKey(i, p)] = new TileData(i, p, true, currentIndex);
            } else {
              tileData.isPath = true;
              tileData.pathIndex = currentIndex;
            }
          }
        }
      } else if (!getTileDataEntry(x,  y)) {
        TILE_DATA_OBJ[getTileDataKey(x, y)] = new TileData(x, y, false);
      }
    }
  }


  for(let y = 0; y < Y_TILES; y++) {
    for(let x = 0; x < X_TILES; x++) {

      if (PATH_OBJ[testPath(x, y)]) {
        const currentIndex = findPathIndex(x, y);
        const prevPath = gameState.waveData.path[currentIndex - 1];
        const dirPastToCurrent = getDirectionFromTo(prevPath, gameState.waveData.path[currentIndex]);
        if (dirPastToCurrent) {
          // Fill in the extra corners
          ctx.fillStyle = 'teal'
          let tileData;

          if (dirPastToCurrent === NEXT_DIR.SW) {
            tileData = getTileDataEntry(x, y - 2);
            tileData.fillinDir = NEXT_DIR.SW;
            tileData.isPath = true;

            tileData = getTileDataEntry(x + 2, y);
            tileData.fillinDir = NEXT_DIR.SW;
            tileData.imageRotation = 180;
            tileData.isPath = true;
          }

          // TODO: remove this if no other maps are added with NW direction
          // current map has no NW direction
          if (dirPastToCurrent === NEXT_DIR.NW) {
            tileData = getTileDataEntry(x + 2, y);
            tileData.fillinDir = NEXT_DIR.NW;
            tileData.isPath = true;

            tileData = getTileDataEntry(x, y + 2);
            tileData.fillinDir = NEXT_DIR.NW;
            tileData.isPath = true;

            // ctx.fillRect(
            //   (x + 2) * TILE_WIDTH,
            //   y * TILE_WIDTH,
            //   TILE_WIDTH,
            //   TILE_WIDTH
            // );
            // ctx.fillRect(
            //   x * TILE_WIDTH,
            //   (y + 2) * TILE_WIDTH,
            //   TILE_WIDTH,
            //   TILE_WIDTH
            // );
          }

          if (dirPastToCurrent === NEXT_DIR.NE) {
            tileData = getTileDataEntry(x - 2, y);
            tileData.fillinDir = NEXT_DIR.NE;
            tileData.isPath = true;

            tileData = getTileDataEntry(x, y + 2);
            tileData.imageRotation = 180;
            tileData.fillinDir = NEXT_DIR.NE;
            tileData.isPath = true;
          }

          if (dirPastToCurrent === NEXT_DIR.SE) {
            tileData = getTileDataEntry(x - 2, y);
            tileData.imageRotation = 270;
            tileData.fillinDir = NEXT_DIR.SE;
            tileData.isPath = true;

            tileData = getTileDataEntry(x, y - 2);
            tileData.imageRotation = 90;
            tileData.fillinDir = NEXT_DIR.SE;
            tileData.isPath = true;
          }
        }
      }
    }
  }

  for(let y = 0; y < Y_TILES; y++) {
    for(let x = 0; x < X_TILES; x++) {
      const tileData = getTileDataEntry(x, y);
      
      if (tileData.isPath) {
        let image = images.path;
        let rotation = 0;

        const {minX, minY} = convertTileToMapBounds([x, y]);
        if (!getTileDataEntry(x-1, y).isPath && !getTileDataEntry(x, y-1).isPath) {
          image = images.outside;
        } else if (!getTileDataEntry(x+1, y).isPath && !getTileDataEntry(x, y+1).isPath) {
          image = images.outside;
          rotation = 180;
        } else if (!getTileDataEntry(x+1, y).isPath && !getTileDataEntry(x, y-1).isPath) {
          image = images.outside;
          rotation = 90;
        } else if (!getTileDataEntry(x-1, y).isPath && !getTileDataEntry(x, y+1).isPath) {
          image = images.outside;
          rotation = 270;
        } else if (!getTileDataEntry(x-1, y).isPath) {
          image = images.edge;
        } else if ((!getTileDataEntry(x+1, y).isPath)) {
          image = images.edge;
          rotation = 180;
        }  else if ((!getTileDataEntry(x, y-1).isPath)) {
          image = images.edge;
          rotation = 90;
        }  else if ((!getTileDataEntry(x, y+1).isPath)) {
          image = images.edge;
          rotation = 270;
        } else if (tileData.fillinDir) {
          image = images.inside;
          rotation = tileData.imageRotation;
          return
        }

        drawTile(minX, minY, image, rotation);

        /// For debugging
        // if (PATH_OBJ[testPath(x, y)]) {
        //   ctx.fillStyle = 'black';
        //   ctx.fillRect(minX, minY, 50, 50);
        // }
      } else if (x * TILE_WIDTH < MENU_START_X) {
        const place = getRandomInt(0, 100)
        if (place < 10) {
          const o = getRandomInt(0, 3);
          const s = sprites[fillerOptions[o]]();
          s.draw(ctx, x * TILE_WIDTH, y * TILE_WIDTH, o < 2 ? TILE_WIDTH * 3 : TILE_WIDTH);
        }
      }
    }
  }
}
