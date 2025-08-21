import { WIDTH, X_TILE_WIDTH, Y_TILE_HEIGHT } from "./constants";
import { overlayCtx } from "./elements";
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

export function getTileLockedXY(x: number, y: number) {
  return { tileLockedX: Math.floor(x / X_TILE_WIDTH) * X_TILE_WIDTH, tileLockedY: Math.floor(y / Y_TILE_HEIGHT) * Y_TILE_HEIGHT }
}

export function setMouseTile(mouseX: number, mouseY: number) {
  const { canvasX, canvasY } = translateXYMouseToCanvas(mouseX, mouseY);
  const {tileLockedX, tileLockedY} = getTileLockedXY(canvasX, canvasY)
  // Get the total number of X & Y tiles in "round" number of tiles where the draw should start

  // Start the draw and the canvas-scaled X & Y for the given tile
  mouseTile.x = tileLockedX;
  mouseTile.y = tileLockedY;
}

export function drawMouseTile() {
  overlayCtx.fillStyle = 'red';
  overlayCtx.fillRect(mouseTile.x, mouseTile.y, X_TILE_WIDTH, Y_TILE_HEIGHT);
  overlayCtx.fillStyle = 'white';
  overlayCtx.font = "40px Arial"
  overlayCtx.fillText(`${mouseTile.x / X_TILE_WIDTH}, ${mouseTile.y / Y_TILE_HEIGHT} | ${mouseTile.x}, ${mouseTile.y}`, 2550, 75)
}

export function hitTest() {
  console.log('Tile', TILE_DATA_OBJ[`${mouseTile.x / X_TILE_WIDTH},${mouseTile.y / Y_TILE_HEIGHT}`]);
}
