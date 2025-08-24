import { HEIGHT, WIDTH, TILE_WIDTH } from "./constants";
import { drawMouseTile } from './utils';
import { drawTileMap } from "./maps";
import { Critter, entities, Menu, MenuTower } from "./entity";
import { hasMouseMoved, registerListeners } from "./listeners";
import { mapCtx, ctx, canvas } from "./elements";
import { gameState } from "./gameState";

const image = new Image();
image.src = 'path2.png';

// let windowTime = 0;
// let dt = 0;
// let score = 0;
// let viewportX = 0;

// function gameLoop(newTime: number): void {
function gameLoop(): void {
  requestAnimationFrame(gameLoop);

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
new Menu();

const towersObj: Record<string, MenuTower | undefined> = {
  fetcher: undefined,
}
Object.keys(towersObj).forEach((key, i) => {
  const menuLeft = WIDTH - (TILE_WIDTH * 10);
  const towerStartY = TILE_WIDTH * 8;
  const towerX = menuLeft + TILE_WIDTH;
  const towerY = (i * 4 * TILE_WIDTH) + towerStartY;

  new MenuTower(towerX, towerY, key);
})

function render(): void {
  gameState.gameTime += 1;
  if (gameState.gameTime % 5 === 0) {
    new Critter();
  }
  // if (gameState.gameTime % 2 === 0) {
  //   new Critter();
  // }

  entities.forEach(e => e.render(ctx));

  for (let i = 0; i < entities.length; i++) {
    if (entities[i].deleted) {
      if ((entities[i] as Critter).currentTile) {
        delete (entities[i] as Critter).currentTile?.critters[entities[i].id];
        entities.splice(i, 1);
        i--;
      }
    }
  }

  if (hasMouseMoved) {
    drawMouseTile(ctx);
  }
}

function clearScreen(): void {
    ctx.clearRect(0, 0, WIDTH, HEIGHT);
}

image.onload = () => {
  gameState.image = image;
  mapCtx.imageSmoothingEnabled = false;
  ctx.imageSmoothingEnabled = false;
  registerListeners(canvas);
  drawTileMap(mapCtx);
  requestAnimationFrame(gameLoop);
}
