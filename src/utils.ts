import { WIDTH, X_TILE_WIDTH, Y_TILE_HEIGHT, type Tile } from "./constants";
import { entities, Entity, NEXT_DIR } from "./entity";
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

/**
 * Gets the min X Y points (in Canvas coords) needed to draw the tile which contains the passed X Y 
 * @param canvasX X location in canvas coords
 * @param canvasY Y location in canvas coords
 * @returns the X and Y canvas coords to begin drawing a tile
 */
export function getTileLockedXY(canvasX: number, canvasY: number) {
  return { tileLockedX: Math.floor(canvasX / X_TILE_WIDTH) * X_TILE_WIDTH, tileLockedY: Math.floor(canvasY / Y_TILE_HEIGHT) * Y_TILE_HEIGHT }
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
  ctx.fillRect(mouseTile.x, mouseTile.y, X_TILE_WIDTH, Y_TILE_HEIGHT);
  ctx.fillStyle = 'white';
  ctx.font = "40px Arial"
  ctx.fillText(`${mouseTile.x / X_TILE_WIDTH}, ${mouseTile.y / Y_TILE_HEIGHT} | ${mouseTile.x}, ${mouseTile.y}`, 2550, 75)
}

/**
 * Debug function - logs data for a tile when clicked by mouse
 */
export function mouseHitTest() {
  console.log('Tile', TILE_DATA_OBJ[`${mouseTile.x / X_TILE_WIDTH},${mouseTile.y / Y_TILE_HEIGHT}`]);
  // console.log('Data', entities);
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
    pathX: tileLockedX / X_TILE_WIDTH,
    pathY: tileLockedY / Y_TILE_HEIGHT
  }
}

export function getExpanededDraggingTileBounds() {
  return {
    expandedMinX: (mouseTile.x - X_TILE_WIDTH) / X_TILE_WIDTH,
    expandedMaxX: (mouseTile.x + X_TILE_WIDTH) / X_TILE_WIDTH,
    expandedMinY: (mouseTile.y - Y_TILE_HEIGHT) / Y_TILE_HEIGHT,
    expandedMaxY: (mouseTile.y + Y_TILE_HEIGHT) / Y_TILE_HEIGHT,
  }
}

export function convertTileToMapBounds(tile: Tile, mDir: NEXT_DIR) {
  const minX = tile[0] * X_TILE_WIDTH;
  const minY = tile[1] * Y_TILE_HEIGHT;
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
      directionalMinX = (tile[0] - 1) * X_TILE_WIDTH;
      directionalMaxX = (tile[0] + 2) * X_TILE_WIDTH;
      directionalMinY = minY;
      directionalMaxY = (tile[1] + 1) * Y_TILE_HEIGHT;
      break;
    case NEXT_DIR.E:
    case NEXT_DIR.W:
    default:
      directionalMinX = minX;
      directionalMaxX = (tile[0] + 1) * X_TILE_WIDTH;
      directionalMinY = (tile[1] - 1) * Y_TILE_HEIGHT;
      directionalMaxY = (tile[1] + 2) * Y_TILE_HEIGHT;
      break;
  }

  const conversionData = {
    minX,
    minY,
    maxX: tile[0] * X_TILE_WIDTH + X_TILE_WIDTH,
    maxY: tile[1] * Y_TILE_HEIGHT + Y_TILE_HEIGHT,
    midX: tile[0] * X_TILE_WIDTH + (X_TILE_WIDTH * .5),
    midY: tile[1] * Y_TILE_HEIGHT + (Y_TILE_HEIGHT * .5),
    expanededMinX: 0,
    expanededMaxX: 0,
    expanededMinY: 0,
    expanededMaxY: 0,
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
