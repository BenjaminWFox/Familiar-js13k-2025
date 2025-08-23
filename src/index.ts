import { HEIGHT, WIDTH, X_TILE_WIDTH, Y_TILE_HEIGHT } from "./constants";
import { drawMouseTile } from './utils';
import { drawTileMap } from "./maps";
import { Critter, entities, Menu, MenuTower } from "./entity";
import { hasMouseMoved, registerListeners } from "./listeners";
import { mapCtx, ctx, canvas } from "./elements";
import { gameState } from "./gameState";


// const image = new Image();

// image.src = 'i.png';

// const MOD_PATH = PATH.map(([x, y]) => [x * 2, y * 2]);
// console.log(MOD_PATH);

// let windowTime = 0;
// let dt = 0;
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
new Menu();

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
  gameState.gameTime += 1;
  if (gameState.gameTime % 7 === 0) {
    new Critter();
  }

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
}

registerListeners(canvas);
drawTileMap(mapCtx);
requestAnimationFrame(gameLoop);
