import { type Tile, PATH, PATH_OBJ, X_TILE_WIDTH, X_TILES, Y_TILE_HEIGHT, Y_TILES } from "./constants";
import { Critter, getDirectionFromTo, NEXT_DIR } from "./entity";
import { convertTileToMapBounds } from "./utils";

function testPath(x: number, y: number): keyof typeof PATH_OBJ {
  return `${x},${y}` as keyof typeof PATH_OBJ;
}

function findPathIndex(x: number, y: number) {
  return PATH.findIndex(([_x, _y]) => {
    return _x === x && _y === y
  });
}

// Create an object to prevent iterating every time
// probably overkill
PATH.forEach((e: Tile) => {
  PATH_OBJ[e.toString()] = 1
});

export class TileData {
  x: number;
  y: number;
  isPath: boolean;
  pathIndex?: number;
  isCovered: boolean = false;
  critters: Record<string, Critter> = {};

  constructor(x: number, y: number, isPath: boolean = false, pathIndex?: number) {
    this.x = x;
    this.y = y;
    this.isPath = isPath;
    this.pathIndex = pathIndex;
  }
}

export const TILE_DATA_OBJ: Record<string, TileData> = {}
export const getTileDataKey = (x: number, y: number) => `${x},${y}`;
export const getTileDataEntry = (x: number, y: number) => TILE_DATA_OBJ[getTileDataKey(x, y)];

export function drawTileMap(ctx: CanvasRenderingContext2D): void {
  for(let y = 0; y < Y_TILES; y++) {
    for(let x = 0; x < X_TILES; x++) {
      const currentTile = new TileData(x, y, false);

      if (PATH_OBJ[testPath(x, y)]) {
        currentTile.isPath = true;

        const currentIndex = findPathIndex(x, y);
        const previousPath = PATH[currentIndex - 1]

        // Colors all:
        ctx.fillStyle = 'grey';

        // Fill in extra 1 square all around each tile
        const {minX, minY} = convertTileToMapBounds([x - 1, y - 1], NEXT_DIR.SW)
        ctx.fillRect(
          minX,
          minY,
          X_TILE_WIDTH * 3,
          Y_TILE_HEIGHT * 3
        );

        for(let i = x - 1; i < x + 2;i++) {
          for (let p = y - 1; p < y + 2;p++) {
            if (!getTileDataEntry(i, p)) {
              TILE_DATA_OBJ[getTileDataKey(i, p)] = new TileData(i, p, true, currentIndex);
            } else {
              TILE_DATA_OBJ[getTileDataKey(i, p)].isPath = true;
              TILE_DATA_OBJ[getTileDataKey(i, p)].pathIndex = currentIndex;
            }
          }
        }

        if (previousPath) {
          const dir = getDirectionFromTo(previousPath, PATH[currentIndex]);
          
          // Fill in the extra corners
          ctx.fillStyle = 'teal'
          if (dir === NEXT_DIR.SW) {
            ctx.fillRect(
              (x + 2) * X_TILE_WIDTH,
              y * Y_TILE_HEIGHT,
              X_TILE_WIDTH,
              Y_TILE_HEIGHT
            );
            ctx.fillRect(
              x * X_TILE_WIDTH,
              (y - 2) * Y_TILE_HEIGHT,
              X_TILE_WIDTH,
              Y_TILE_HEIGHT
            );
          }

          // TODO: remove this if no other maps are added with NW direction
          // current map has no NW direction
          if (dir === NEXT_DIR.NW) {
            ctx.fillRect(
              (x + 2) * X_TILE_WIDTH,
              y * Y_TILE_HEIGHT,
              X_TILE_WIDTH,
              Y_TILE_HEIGHT
            );
            ctx.fillRect(
              x * X_TILE_WIDTH,
              (y + 2) * Y_TILE_HEIGHT,
              X_TILE_WIDTH,
              Y_TILE_HEIGHT
            );
          }
            
          if (dir === NEXT_DIR.NE) {
            ctx.fillRect(
              (x - 2) * X_TILE_WIDTH,
              y * Y_TILE_HEIGHT,
              X_TILE_WIDTH,
              Y_TILE_HEIGHT
            );
            ctx.fillRect(
              x * X_TILE_WIDTH,
              (y + 2) * Y_TILE_HEIGHT,
              X_TILE_WIDTH,
              Y_TILE_HEIGHT
            );
          }

          if (dir === NEXT_DIR.SE) {
            ctx.fillRect(
              (x - 2) * X_TILE_WIDTH,
              y * Y_TILE_HEIGHT,
              X_TILE_WIDTH,
              Y_TILE_HEIGHT
            );
            ctx.fillRect(
              x * X_TILE_WIDTH,
              (y - 2) * Y_TILE_HEIGHT,
              X_TILE_WIDTH,
              Y_TILE_HEIGHT
            );
          }
        }

        // Can be enabled to show the specific tiles (from map array) which were drawn
        ctx.fillStyle = 'black';
        ctx.fillRect(x * X_TILE_WIDTH, y * Y_TILE_HEIGHT, X_TILE_WIDTH, Y_TILE_HEIGHT)
      } else if (!getTileDataEntry(x,  y)) {
        TILE_DATA_OBJ[getTileDataKey(x, y)] = currentTile;
      }

    }
  }

  console.log(TILE_DATA_OBJ)
}
