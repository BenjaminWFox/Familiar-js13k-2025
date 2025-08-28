import { HEIGHT, WIDTH, TILE_WIDTH, MENU_START_X, MENU_TOWER_START_Y, STRINGS } from "./constants";
import { drawTileMap } from "./maps";
import { Cat, cats, Critter, critters, fetchers, Menu, menus, MenuTower, menuTowers, particles, towers } from "./entity";
import { hasMouseMoved, registerListeners } from "./listeners";
import { mapCtx, ctx, canvas } from "./elements";
import { gameState } from "./gameState";
import { drawMouseTile } from "./utils";

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

function render(): void {
  gameState.gameTime += 1;
  if (gameState.gameTime % 25 === 0) {
    // new Critter();
  }
  if (gameState.gameTime % 100 === 0) {
    new Cat();
  }
  // if (gameState.gameTime % 2 === 0) {
  //   new Critter();
  // }

  // entities.forEach(e => e.render(ctx));
  critters.forEach(e => e.render(ctx));
  cats.forEach(e => e.render(ctx));
  particles.forEach(e => e.render(ctx));
  towers.forEach(e => e.render(ctx));
  fetchers.forEach(e => e.render(ctx));
  menus.forEach(e => e.render(ctx));
  menuTowers.forEach(e => e.render(ctx));

  for (let i = 0; i < critters.length; i++) {
    if (critters[i].deleted) {
      delete (critters[i] as Critter).currentTile?.critters[critters[i].id];
      critters.splice(i, 1);
      i--;
    }
  }

  for (let i = 0; i < particles.length; i++) {
    if (particles[i].deleted) {
      particles.splice(i, 1);
      i--;
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

  // new Critter();
  new Menu();
  new Cat();

  const towers = [STRINGS.kid, STRINGS.fan, STRINGS.vaccuum, STRINGS.net, STRINGS.fish, STRINGS.scratch];

  towers.forEach((key, i) => {
    const towerX = MENU_START_X;
    const towerY = MENU_TOWER_START_Y + (TILE_WIDTH * i * 5)

    new MenuTower(towerX, towerY, key);
  })

  mapCtx.imageSmoothingEnabled = false;
  ctx.imageSmoothingEnabled = false;
  registerListeners(canvas);
  drawTileMap(mapCtx);
  requestAnimationFrame(gameLoop);
}
