import { HEIGHT, WIDTH, TILE_WIDTH, MENU_START_X, MENU_TOWER_START_Y, STRINGS } from "./constants";
import { drawTileMap } from "./maps";
import { Cat, catchers, cats, Critter, critters, Entity, fetchers, Menu, menus, MenuTower, menuTowers, particles, towers } from "./entity";
import { hasMouseMoved, registerListeners } from "./listeners";
import { mapCtx, ctx, canvas } from "./elements";
import { gameState, SCENES } from "./gameState";
import { drawMouseTile, setFont } from "./utils";
import { sprites } from "./sprites";
import { Button, selectWave, startBtn } from "./button";

const image = new Image();
image.src = 'path2.png';

// let windowTime = 0;
// let dt = 0;
// let score = 0;
// let viewportX = 0;

// function gameLoop(newTime: number): void {
function gameLoop(): void {
  if (!gameState.paused) {
    requestAnimationFrame(gameLoop);
    clearScreen();
    render();
  }
}

// function drawNet(x, y) {
//   ctx.fillStyle = 'white';
//   ctx.fillRect(x, y, 20, 6)
//   ctx.fillRect(x + 40, y + 30, 6, 20)
//   ctx.fillRect(x, y + 70, 20, 6)
//   ctx.fillRect(x - 25, y + 30, 6, 20)
// }

function purgeDeleted<T extends Entity>(arr: T[], extra?: (arr: Array<T>, index: number) => void) {
    for (let i = 0; i < arr.length; i++) {
      if (arr[i].deleted) {
        if (extra) {
          extra(arr, i);
        }
        arr.splice(i, 1);
        i--;
      }
    }
}

function deleteCritter(c: Critter[], i: number) {
  delete (c[i] as Critter).currentTile?.critters[c[i].id];
}

function render(): void {
  if (gameState.state === SCENES.playing) {
    gameState.gameTime += 1;
    if (gameState.gameTime % 25 === 0) {
      new Critter();
    }
    if (gameState.gameTime % 100 === 0) {
      // new Cat();
    }
    // if (gameState.gameTime % 2 === 0) {
    //   new Critter();
    // }

    // entities.forEach(e => e.render(ctx));
    critters.forEach(e => e.render());
    cats.forEach(e => e.render());
    particles.forEach(e => e.render());
    towers.forEach(e => e.render());
    fetchers.forEach(e => e.render());
    catchers.forEach(e => e.render());
    menus.forEach(e => e.render());
    menuTowers.forEach(e => e.render());

    // for (let i = 0; i < critters.length; i++) {
    //   if (critters[i].deleted) {
    //     delete (critters[i] as Critter).currentTile?.critters[critters[i].id];
    //     critters.splice(i, 1);
    //     i--;
    //   }
    // }
    purgeDeleted<Critter>(critters, deleteCritter);
    purgeDeleted(particles);
    // for (let i = 0; i < particles.length; i++) {
    //   if (particles[i].deleted) {
    //     particles.splice(i, 1);
    //     i--;
    //   }
    // }

  } else if (gameState.state === SCENES.start) {
    ctx.fillStyle = 'green'
    ctx.fillRect(0, 0, WIDTH, HEIGHT)
    ctx.fillStyle = 'white'
    ctx.save()
    setFont(250);
    ctx.textAlign = 'center';
    ctx.fillText('Witches Cauldron', WIDTH * .5, 300)
    ctx.restore();
    sprites[STRINGS.witch]().draw(ctx, WIDTH * .5 - 300, 500, 600, 900);
    startBtn.render();
    selectWave.render(`WAVE ${gameState.wave}`);

    gameState.waveSelectBtns.forEach(e => e.render());
    purgeDeleted(gameState.waveSelectBtns);

    // for(let i = 1;i <= gameState.waves;i++) {
    //   const add = i > 9 ? 50 * (i - 9 - .5) : 0;
    //   const xOffset = 200 * (i - 1);
    //   const x = -550 + selectWave.x + xOffset + add;

    //   // const b = new Button(x, selectWave.y - 125, 150, 150, `${i}`, () => gameState.wave = i);

    //   // ctx.fillStyle = 'green'
    //   // ctx.fillRect(x, selectWave.y - 200, 150, 150);
    //   // ctx.fillStyle = 'white'
    //   // ctx.strokeRect(x, selectWave.y - 200, 150, 150);
    //   // ctx.textAlign = 'center'
    //   // ctx.textBaseline = 'middle';
    //   // ctx.fillText(`${i}`, x + 75, selectWave.y - 125)
    // }
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

  new Critter();
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
