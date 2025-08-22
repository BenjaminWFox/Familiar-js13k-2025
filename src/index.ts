import { HEIGHT, MENU_START_X, WIDTH, X_TILE_WIDTH, Y_TILE_HEIGHT } from "./constants";
import { drawMouseTile } from './utils';
import { drawTileMap } from "./maps";
import { Critter, critters, MenuTower, towers } from "./entity";
import { registerListeners } from "./listeners";
import { mapCtx, ctx, overlayCtx, overlayCanvas } from "./elements";


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
  clearScreen();
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

const towersObj: Record<string, MenuTower | undefined> = {
  green: undefined,
  yellow: undefined,
  purple: undefined
}
Object.keys(towersObj).forEach((key, i) => {
  const menuLeft = WIDTH - (X_TILE_WIDTH * 10);
  const towerStartY = Y_TILE_HEIGHT * 8;
  const towerX = menuLeft + X_TILE_WIDTH;
  const towerY = (i * 4 * Y_TILE_HEIGHT) + towerStartY;

  new MenuTower(towerX, towerY, key);
})

function render(): void {
  gameTime += 1;
  if (gameTime % 7 === 0) {
    new Critter();
  }
  drawEntities();

  drawMenu();

  critters.forEach(e => e.render(ctx));


  for (let i = 0; i < critters.length; i++) {
    if (critters[i].deleted) {
      delete critters[i].currentTile?.critters[critters[i].id];
      critters.splice(i, 1);
      i--;
    }
  }

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

function clearScreen(): void {
    ctx.clearRect(0, 0, WIDTH, HEIGHT);
    overlayCtx.clearRect(0, 0, WIDTH, HEIGHT);
}

function drawEntities(): void {}

function drawMenu(): void {
  overlayCtx.fillStyle = 'blue';
  overlayCtx.fillRect(MENU_START_X, 0, X_TILE_WIDTH * 10, HEIGHT);

  towers.forEach(e => e.render(overlayCtx, ctx))

  drawMouseTile();
}

registerListeners(overlayCanvas);
drawTileMap(mapCtx);
requestAnimationFrame(gameLoop);
