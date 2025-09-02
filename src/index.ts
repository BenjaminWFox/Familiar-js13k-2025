import { HEIGHT, WIDTH, STRINGS, } from "./constants";
import { cashes, catchers, cats, Critter, critters, dialog, Entity, fetchers, Menu, menus, menuTowers, particles, towers, witches } from "./entity";
import { hasMouseMoved, registerListeners } from "./listeners";
import { mapCtx, ctx, canvas } from "./elements";
import { gameState, SCENES } from "./gameState";
import { drawMouseTile, setFont } from "./utils";
import { sprites } from "./sprites";
import { selectWave, startBtn } from "./entity";

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
    if (gameState.state !== SCENES.dialog) {
      clearScreen();
    }
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
    gameState.waveTime += 1;
    gameState.runWave();
    
    critters.forEach(e => e.render());
    cats.forEach(e => e.render());
    particles.forEach(e => e.render());
    towers.forEach(e => e.render());
    fetchers.forEach(e => e.render());
    catchers.forEach(e => e.render());
    witches.forEach(e => e.render());
    menus.forEach(e => e.render());
    menuTowers.forEach(e => e.render());
    cashes.forEach(e => e.render());

    purgeDeleted<Critter>(critters, deleteCritter);
    purgeDeleted(cats);
    purgeDeleted(particles);
    purgeDeleted(cashes);
    purgeDeleted(towers);
    purgeDeleted(fetchers);
    purgeDeleted(witches);

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
  } else if (gameState.state === SCENES.dialog) {
    dialog.render();
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
  gameState.setState(SCENES.start);
  new Menu();

  mapCtx.imageSmoothingEnabled = false;
  ctx.imageSmoothingEnabled = false;
  registerListeners(canvas);

  gameState.startWave();

  requestAnimationFrame(gameLoop);
}
