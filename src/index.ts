import { HEIGHT, PATH, PATH_OBJ, WIDTH, X_TILE_WIDTH, Y_TILE_HEIGHT, type Tile } from "./constants";
import { drawTileMap } from "./maps";
import { Critter, entities } from "../x_template_files/entity";

const mapCanvas = document.querySelector('#mc') as HTMLCanvasElement;
const mapCtx = mapCanvas.getContext('2d') as CanvasRenderingContext2D;
const canvas = document.querySelector('#gc') as HTMLCanvasElement;
const ctx = canvas.getContext('2d') as CanvasRenderingContext2D;
const overlayCanvas = document.querySelector('#oc') as HTMLCanvasElement;
const overlayCtx = overlayCanvas.getContext('2d') as CanvasRenderingContext2D;

// const image = new Image();

// image.src = 'i.png';

// const MOD_PATH = PATH.map(([x, y]) => [x * 2, y * 2]);
// console.log(MOD_PATH);

// let windowTime = 0;
// let dt = 0;
let gameTime = 0;
// let score = 0;
// let viewportX = 0;

// function gameLoop(newTime: number): void {
function gameLoop(): void {
  requestAnimationFrame(gameLoop);

  // console.log('GAME!');
  ctx.clearRect(0, 0, WIDTH, HEIGHT);
  render();
  // windowTime = newTime;
  // dt = 0;
}

// function handleInput(): void {}

// function updateEntities(): void {}

// function collisionDetection(): void {}

// function updateCamera(): void {}

// for (let i = 0; i < 5000; i++) {
//   new Critter();
// }
new Critter();

const mouseTile = {
  x: 0,
  y: 0,
}

function render(): void {
  drawMenu();
  gameTime += 1;
  if (gameTime % 7 === 0) {
    new Critter();
  }
  clearScreen();
  drawEntities();
  entities.forEach(e => e.render(ctx));

  for (let i = 0; i < entities.length; i++) {
    if (entities[i].deleted) {
      entities.splice(i, 1);
      i--;
    }
  }

  drawMenu();
  
  // // Show "expanded" data results
  // const data = convertTileToMapBounds(PATH[1], NEXT_DIR.SW);
  // const data2 = convertTileToMapBounds(PATH[1], NEXT_DIR.W);
  // ctx.fillStyle = 'red';
  // ctx.fillRect(data.expandedMinX, data.expandedMinY, 10, 10);
  // ctx.fillRect(data.expandedMaxX, data.expandedMaxY, -10, -10)
  // ctx.fillStyle = 'yellow';
  // ctx.fillRect(data2.expandedMinX, data2.expandedMinY, 10, 10);
  // ctx.fillRect(data2.expandedMaxX, data2.expandedMaxY, -10, -10)
}

function clearScreen(): void {}

function drawEntities(): void {}

class Tower {
  x: number;
  y: number;

  constructor(x: number, y: number) {
    this.x = x;
    this.y = y;
  }
}

const towers: Record<string, Tower | undefined> = {
  green: undefined,
  yellow: undefined,
  purple: undefined
}

function drawMenu(): void {
  overlayCtx.clearRect(0, 0, WIDTH, HEIGHT);

  const menuLeft = WIDTH - (X_TILE_WIDTH * 10);
  const towerStartY = Y_TILE_HEIGHT * 8;

  overlayCtx.fillStyle = 'blue';
  overlayCtx.fillRect(WIDTH - (X_TILE_WIDTH * 10), 0, X_TILE_WIDTH * 10, HEIGHT);

  Object.entries(towers).forEach(([key, value], i) => {
    const towerX = menuLeft + X_TILE_WIDTH;
    const towerY = (i * 4 * Y_TILE_HEIGHT) + towerStartY;
    overlayCtx.fillStyle = key;
    overlayCtx.fillRect(towerX, towerY, X_TILE_WIDTH * 3, Y_TILE_HEIGHT * 3)

    towers[key] = new Tower(towerX, towerY);
  })

  overlayCtx.fillRect(mouseTile.x, mouseTile.y, X_TILE_WIDTH, Y_TILE_HEIGHT);
}

let scale = 1;

function getTileFromMouseCoords(x: number, y: number) {
  const canvasX = Math.round(x / scale);
  const canvasY = Math.round(y / scale);
  const tileStartX = Math.floor(canvasX / X_TILE_WIDTH);
  const tileStartY = Math.floor(canvasY / Y_TILE_HEIGHT);
  mouseTile.x = tileStartX * X_TILE_WIDTH;
  mouseTile.y = tileStartY * Y_TILE_HEIGHT;
}

overlayCanvas.addEventListener('mousemove', (e: MouseEvent) => {
  const x = e.pageX - ((e.currentTarget as HTMLElement)?.offsetLeft || 0);
  const y = e.pageY - ((e.currentTarget as HTMLElement)?.offsetTop || 0);
  
  // const scaledX = WIDTH / (e.currentTarget as HTMLElement).offsetWidth;
  // const scaledY = HEIGHT / (e.currentTarget as HTMLElement).offsetHeight;
  scale = (((e.currentTarget as HTMLElement).offsetWidth / WIDTH));
  // const scaledTileWidth = Math.round(X_TILE_WIDTH * ((e.currentTarget as HTMLElement).offsetWidth / WIDTH));

  getTileFromMouseCoords(x, y);

  // const mnouseTile = x % 
})

drawTileMap(mapCtx);
requestAnimationFrame(gameLoop);
