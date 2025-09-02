import { WIDTH, TILE_WIDTH, type Tile } from "./constants";
import { Entity, NEXT_DIR } from "./entity";
import { gameState } from "./gameState";
import { TILE_DATA_OBJ } from "./maps";

let scale = 1;

export const getScale = () => scale;

export const setScale = () => {
  scale = getCanvas().offsetWidth / WIDTH;
};

export function getCanvas(): HTMLElement {
  return document.getElementById('gc')! as HTMLElement;
}

export function translateXYMouseToCanvas(mouseX: number, mouseY: number) {
  const c = getCanvas();
  const x = mouseX - c.offsetLeft;
  const y = mouseY - c.offsetTop;

  return {
    canvasX: Math.round(x / getScale()),
    canvasY: Math.round(y / getScale())
  }
}

export const mouseTile = {
  x: 0,
  y: 0,
}

export const canAffordTower = (p: number) => {
  return p <= gameState.cash
}
export const setFont = (size: number) => {
  gameState.ctx.font = `${size}px 'Courier New'`;
}
export const getPriceForAffordability = (p: number) => {
  if (canAffordTower(p)) {
    gameState.ctx.fillStyle = 'white';
    return `- $ ${p}`;
  } else {
    gameState.ctx.fillStyle = '#ffb607';
    return `- $ ${p} (unaffordable))`;
  }
}
export const setColorForPrice = (p: number) => {
  if (canAffordTower(p)) {
    gameState.ctx.fillStyle = 'white';
  } else {
    gameState.ctx.fillStyle = '#ffb607';
  }
}

/**
 * Gets the min X Y points (in Canvas coords) needed to draw the tile which contains the passed X Y 
 * @param canvasX X location in canvas coords
 * @param canvasY Y location in canvas coords
 * @returns the X and Y canvas coords to begin drawing a tile
 */
export function getTileLockedXY(canvasX: number, canvasY: number) {
  return { tileLockedX: Math.floor(canvasX / TILE_WIDTH) * TILE_WIDTH, tileLockedY: Math.floor(canvasY / TILE_WIDTH) * TILE_WIDTH }
}

export function setMouseTile(mouseX: number, mouseY: number) {
  const { canvasX, canvasY } = translateXYMouseToCanvas(mouseX, mouseY);
  const {tileLockedX, tileLockedY} = getTileLockedXY(canvasX, canvasY)
  // Get the total number of X & Y tiles in "round" number of tiles where the draw should start

  // Start the draw and the canvas-scaled X & Y for the given tile
  mouseTile.x = tileLockedX;
  mouseTile.y = tileLockedY;
}

export function drawMouseTile(ctx: CanvasRenderingContext2D) {
  ctx.fillStyle = 'red';
  ctx.fillRect(mouseTile.x, mouseTile.y, TILE_WIDTH, TILE_WIDTH);
  // ctx.fillStyle = 'white';
  // ctx.font = "40px Arial"
  // ctx.fillText(`${mouseTile.x / TILE_WIDTH}, ${mouseTile.y / TILE_WIDTH} | ${mouseTile.x}, ${mouseTile.y}`, 2625, 75)
}

/**
 * Debug function - logs data for a tile when clicked by mouse
 */
export function mouseHitTest() {
  gameState.mouseDownAt = Date.now();
  const tile = TILE_DATA_OBJ[`${mouseTile.x / TILE_WIDTH},${mouseTile.y / TILE_WIDTH}`];
  // console.log('Tile', tile, tile.towerAtTile);
  // console.log('Data', entities);

  if (tile.hasTower) {
    const cb = () => {
      gameState.cash += tile.towerAtTile!.cost * .5;
      gameState.closeDialog();
      tile.towerAtTile!.sell();
    }
    gameState.showDialog(
      [`Really? Sell this tower for ${tile.towerAtTile!.cost * .5}?`], cb, true);
  }
}

function valueInRange(point: number, min: number, max: number) {
  return point >= min && point <= max;
}

type Point = Pick<Entity, 'x' | 'y'>
type HitTestable = Point & Pick<Entity, 'width' | 'height'>

export function hitTest(e1: HitTestable, e2: HitTestable) {
  const xOverlap = valueInRange(e1.x, e2.x, e2.x + e2.width) || valueInRange(e2.x, e1.x, e1.x + e1.width)
  const yOverlap = valueInRange(e1.y, e2.y, e2.y + e2.height) || valueInRange(e2.y, e1.y, e1.y + e1.height)
  return xOverlap && yOverlap;
}

export function convertCanvasXYToPathXY(canvasX: number, canvasY: number) {
  const { tileLockedX, tileLockedY } = getTileLockedXY(canvasX, canvasY);
  return {
    pathX: tileLockedX / TILE_WIDTH,
    pathY: tileLockedY / TILE_WIDTH
  }
}

export function getExpanededDraggingTileBounds() {
  return {
    expandedMinX: (mouseTile.x - TILE_WIDTH) / TILE_WIDTH,
    expandedMaxX: (mouseTile.x + TILE_WIDTH) / TILE_WIDTH,
    expandedMinY: (mouseTile.y - TILE_WIDTH) / TILE_WIDTH,
    expandedMaxY: (mouseTile.y + TILE_WIDTH) / TILE_WIDTH,
  }
}

/**
 * Tile[0] = x
 * 
 * @param tile Tile X Y points as Array<number, number>
 * @param mDir 
 * @returns 
 */
export function convertTileToMapBounds(tile: Tile, mDir?: NEXT_DIR) {
  const [x, y] = tile;

  const minX = x * TILE_WIDTH;
  const minY = y * TILE_WIDTH;
  let directionalMinX;
  let directionalMaxX;
  let directionalMinY;
  let directionalMaxY;

  switch(mDir) {
    case NEXT_DIR.SW:
    case NEXT_DIR.S:
    case NEXT_DIR.SE:
    case NEXT_DIR.NW:
    case NEXT_DIR.N:
    case NEXT_DIR.NE:
      directionalMinX = (x - 1) * TILE_WIDTH;
      directionalMaxX = (x + 2) * TILE_WIDTH;
      directionalMinY = minY;
      directionalMaxY = (y + 1) * TILE_WIDTH;
      break;
    case NEXT_DIR.E:
    case NEXT_DIR.W:
    default:
      directionalMinX = minX;
      directionalMaxX = (x + 1) * TILE_WIDTH;
      directionalMinY = (y - 1) * TILE_WIDTH;
      directionalMaxY = (y + 2) * TILE_WIDTH;
      break;
  }

  const conversionData = {
    minX,
    minY,
    maxX: tile[0] * TILE_WIDTH + TILE_WIDTH,
    maxY: tile[1] * TILE_WIDTH + TILE_WIDTH,
    midX: tile[0] * TILE_WIDTH + (TILE_WIDTH * .5),
    midY: tile[1] * TILE_WIDTH + (TILE_WIDTH * .5),
    directionalMinX,
    directionalMaxX,
    directionalMinY,
    directionalMaxY,
  }

  return conversionData
}

export function angleToTarget(source: Point, target: Point) {
  return Math.atan2(target.y - source.y, target.x - source.x);
}

export function movePoint(point: Point, angle: number, distance: number) {
  return {
    x: point.x + Math.cos(angle) * distance,
    y: point.y + Math.sin(angle) * distance
  };
}
