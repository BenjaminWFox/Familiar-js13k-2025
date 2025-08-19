import { WIDTH, X_TILE_WIDTH, X_TILES, Y_TILE_HEIGHT } from "./constants";
import { towers } from "./entity";
import { overlayCtx } from "./elements";

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
    x: Math.round(x / getScale()),
    y: Math.round(y / getScale())
  }
}

const mouseTile = {
  x: 0,
  y: 0,
}

export function setMouseTile(mouseX: number, mouseY: number) {
  const {x, y} = translateXYMouseToCanvas(mouseX, mouseY);
  
  // Get the total number of X & Y tiles in "round" number of tiles where the draw should start
  const tileStartX = Math.floor(x / X_TILE_WIDTH);
  const tileStartY = Math.floor(y / Y_TILE_HEIGHT);

  // Start the draw and the canvas-scaled X & Y for the given tile
  mouseTile.x = tileStartX * X_TILE_WIDTH;
  mouseTile.y = tileStartY * Y_TILE_HEIGHT;
}

export function drawMouseTile() {
  overlayCtx.fillStyle = 'red';
  overlayCtx.fillRect(mouseTile.x, mouseTile.y, X_TILE_WIDTH, Y_TILE_HEIGHT);
}

export function hitTest(x: number, y: number) {
  console.log('Testing', x, y, getScale())
  towers.forEach(t => {
    console.log({ x: t.x, y: t.y, w: t.width, h: t.height})
    console.log(
      t.x < x,
      t.x + t.width > x,
      t.y < y,
      t.y + t.height > y
    )
    if (t.x < x && t.x + t.width > x && t.y < y && t.y + t.height > y) {
      console.log('HIT', t.color)
    }
  })
}
