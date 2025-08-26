import { HEIGHT, WIDTH, TILE_WIDTH, MENU_START_X, MENU_TOWER_START_Y } from "./constants";
import { drawTileMap } from "./maps";
import { Critter, entities, Menu, MenuTower } from "./entity";
import { hasMouseMoved, registerListeners } from "./listeners";
import { mapCtx, ctx, canvas } from "./elements";
import { gameState } from "./gameState";
import { SpritesKey } from "./sprites";

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

const towers = ['kid', 'fan', 'vaccuum', 'net', 'fish', 'scratch'];

towers.forEach((key, i) => {
  // const ypos = i % 2 === 0 ? 1 : 2;
  // const xpos = i % 3 === 0 ? 0 : 4;

  const towerX = MENU_START_X;
  const towerY = MENU_TOWER_START_Y + (TILE_WIDTH * i * 5)

  new MenuTower(towerX, towerY, key as SpritesKey);
})

function render(): void {
  gameState.gameTime += 1;
  if (gameState.gameTime % 60 === 0) {
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
    // drawMouseTile(ctx);
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
