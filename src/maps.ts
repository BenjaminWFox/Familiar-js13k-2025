import { type Tile, PATH, PATH_OBJ, X_TILE_WIDTH, X_TILES, Y_TILE_HEIGHT, Y_TILES } from "./constants";
import { getDirectionFromTo, NEXT_DIR } from "./entity";

function testPath(x: number, y: number): keyof typeof PATH_OBJ {
  const [xStr, yStr] = convertPointMapToPath(x, y);

  return `${xStr},${yStr}` as keyof typeof PATH_OBJ;
}

function findPathIndex(x: number, y: number) {
  return PATH.findIndex(([_x, _y]) => {
    return _x === x && _y === y
  });
}

export function convertPointPathToMap(x: number, y: number) {
  return [x*2, y*2];
}

/**
 * On screen, a single "Path" x/y number would increment by .5 for each
 * individual tile on the Map, since "Map" x/y are 2x the "Point" numbers
 * @param x 
 * @param y 
 * @returns 
 */
export function convertPointMapToPath(x: number, y: number) {
  return [x*.5, y*.5];
}

export function convertTileToMapBounds(t: Tile, mDir: NEXT_DIR, isMapPoint = false) {
  const tile = isMapPoint ? t : convertPointPathToMap(t[0], t[1]);
  const minX = tile[0] * X_TILE_WIDTH;
  const minY = tile[1] * Y_TILE_HEIGHT;
  let expandedMinX;
  let expandedMaxX;
  let expandedMinY;
  let expandedMaxY;

  switch(mDir) {
    case NEXT_DIR.SW:
    case NEXT_DIR.S:
    case NEXT_DIR.SE:
    case NEXT_DIR.NW:
    case NEXT_DIR.N:
    case NEXT_DIR.NE:
      expandedMinX = (tile[0] - 1) * X_TILE_WIDTH;
      expandedMaxX = (tile[0] + 2) * X_TILE_WIDTH;
      expandedMinY = minY;
      expandedMaxY = (tile[1] + 1) * Y_TILE_HEIGHT;
      break;
    case NEXT_DIR.E:
    case NEXT_DIR.W:
    default:
      expandedMinX = minX;
      expandedMaxX = (tile[0] + 1) * X_TILE_WIDTH;
      expandedMinY = (tile[1] - 1) * Y_TILE_HEIGHT;
      expandedMaxY = (tile[1] + 2) * Y_TILE_HEIGHT;
      break;
  }

  const conversionData = {
    minX,
    minY,
    maxX: tile[0] * X_TILE_WIDTH + X_TILE_WIDTH,
    maxY: tile[1] * Y_TILE_HEIGHT + Y_TILE_HEIGHT,
    midX: tile[0] * X_TILE_WIDTH + (X_TILE_WIDTH * .5),
    midY: tile[1] * Y_TILE_HEIGHT + (Y_TILE_HEIGHT * .5),
    expandedMinX,
    expandedMaxX,
    expandedMinY,
    expandedMaxY,
  }

  return conversionData
}

// Create an object to prevent iterating every time
// probably overkill
PATH.forEach((e: Tile) => {
  PATH_OBJ[e.toString()] = 1
});

class TileData {
  x: number;
  y: number;
  isPath: boolean;

  constructor(x: number, y: number, isPath: boolean = false) {
    this.x = x;
    this.y = y;
    this.isPath = isPath;
  }
}

export const TILE_DATA_OBJ: Record<string, TileData> = {}

export function drawTileMap(ctx: CanvasRenderingContext2D): void {
  for(let y = 0; y < Y_TILES * 2; y++) {
    for(let x = 0; x < X_TILES * 2; x++) {
      const currentTile = new TileData(x, y, false);

      if (PATH_OBJ[testPath(x, y)]) {
        const [normalizedX, normalizedY] = convertPointMapToPath(x, y)
        currentTile.isPath = true;
        console.log('Current', {
          x, y, normalizedX, normalizedY
        })

        const currentIndex = findPathIndex(normalizedX, normalizedY);
        const previousPath = PATH[currentIndex - 1]

        // Colors all:
        ctx.fillStyle = 'grey';

        // Fill in extra 1 square all around each tile
        const {minX, minY} = convertTileToMapBounds([x - 1, y - 1], NEXT_DIR.SW, true)
        ctx.fillRect(
          minX,
          minY,
          X_TILE_WIDTH * 3,
          Y_TILE_HEIGHT * 3
        );

        for(let i = x - 1; i < x + 2;i++) {
          for (let p = y - 1; p < y + 2;p++) {
            if (!TILE_DATA_OBJ[`${i},${p}`]) {
              TILE_DATA_OBJ[`${i},${p}`] = new TileData(i, p, true);
            } else {
              TILE_DATA_OBJ[`${i},${p}`].isPath = true;
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
      } else if (!TILE_DATA_OBJ[`${x},${y}`]) {
        TILE_DATA_OBJ[`${x},${y}`] = currentTile;
      }

    }
  }

  console.log(TILE_DATA_OBJ)
}
