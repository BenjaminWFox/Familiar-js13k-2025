import { PATH, PATH_OBJ, X_TILE_WIDTH, X_TILES, Y_TILE_HEIGHT, Y_TILES } from "./constants";

const canvas = document.querySelector('#c') as HTMLCanvasElement;
const ctx = canvas.getContext('2d') as CanvasRenderingContext2D;
const image = new Image();

image.src = 'i.png';

let windowTime = 0;
let dt = 0;
let gameTime = 0;
let score = 0;
let viewportX = 0;

function gameLoop(newTime: number): void {
  // requestAnimationFrame(gameLoop);

  // console.log('GAME!');

  render();
  windowTime = newTime;
  dt = 0;
}

function handleInput(): void {}

function updateEntities(): void {}

function collisionDetection(): void {}

function updateCamera(): void {}

function render(): void {
  clearScreen();
  drawTileMap();
  drawEntities();
}

function clearScreen(): void {}

function testPath(x: number, y: number): keyof typeof PATH_OBJ {
  let xStr = `${x/2}`;
  let yStr = `${y/2}`;

  return `${xStr},${yStr}` as keyof typeof PATH_OBJ;
}

function findPathIndex(x: number, y: number) {
  return PATH.findIndex(([_x, _y]) => {
    return _x === x && _y === y
  });
}

function drawTileMap(): void {

  let cornerXRight = 0;
  let cornerXLeft = 0;
  let cornerY = 0;

  for(let y = 0; y < Y_TILES * 2; y++) {
    for(let x = 0; x < X_TILES * 2; x++) {
      
      // else if (lastX > x) {
      //   cornerXRight = 0;
      //   cornerXLeft = 1;
      // } else {
      //   cornerXRight = 0;
      //   cornerXLeft = 0;
      // }

      if (PATH_OBJ[testPath(x, y)]) {
        const normalizedX = x / 2
        const normalizedY = y / 2
        const currentIndex = findPathIndex(normalizedX, normalizedY);
        const lastIndex = currentIndex - 1;
        const [lastX, lastY] = PATH[lastIndex] || [null, null];

        console.log({
          test: testPath(x, y),
          lastX: lastX,
          curX: normalizedX,
          lastY: lastY,
          curY: normalizedY,
        });

        // Colors all:
        ctx.fillStyle = 'grey';

        ctx.fillRect(
          (x - 1) * X_TILE_WIDTH,
          (y - 1) * Y_TILE_HEIGHT,
          X_TILE_WIDTH * (3),
          Y_TILE_HEIGHT * 3
        );

        // ctx.fillStyle = 'black';
        // ctx.fillRect(x * X_TILE_WIDTH, y * Y_TILE_HEIGHT, X_TILE_WIDTH, Y_TILE_HEIGHT)

        // ctx.fillStyle = 'red'
        if (lastX > normalizedX) {
          if (lastY < normalizedY) {
            ctx.fillRect(
              (x + 2) * X_TILE_WIDTH,
              y * Y_TILE_HEIGHT,
              X_TILE_WIDTH,
              Y_TILE_HEIGHT
            );
            ctx.fillRect(
              x * X_TILE_WIDTH,
              (y - 2) * Y_TILE_HEIGHT,
              X_TILE_WIDTH,
              Y_TILE_HEIGHT
            );
          }
          // Possibly not correct, also not implemented with current path
          // if (lastY > normalizedY) {
          //   ctx.fillRect(
          //     (x - 2) * X_TILE_WIDTH,
          //     y * Y_TILE_HEIGHT,
          //     X_TILE_WIDTH,
          //     Y_TILE_HEIGHT
          //   );
          //   ctx.fillRect(
          //     x * X_TILE_WIDTH,
          //     (y + 2) * Y_TILE_HEIGHT,
          //     X_TILE_WIDTH,
          //     Y_TILE_HEIGHT
          //   );
          // }
        }

        if (lastX < normalizedX) {

          if (lastY > normalizedY) {
            ctx.fillRect(
              (x - 2) * X_TILE_WIDTH,
              y * Y_TILE_HEIGHT,
              X_TILE_WIDTH,
              Y_TILE_HEIGHT
            );
            ctx.fillRect(
              x * X_TILE_WIDTH,
              (y + 2) * Y_TILE_HEIGHT,
              X_TILE_WIDTH,
              Y_TILE_HEIGHT
            );
          }

          if (lastY < normalizedY) {
            ctx.fillRect(
              (x - 2) * X_TILE_WIDTH,
              y * Y_TILE_HEIGHT,
              X_TILE_WIDTH,
              Y_TILE_HEIGHT
            );
            ctx.fillRect(
              x * X_TILE_WIDTH,
              (y - 2) * Y_TILE_HEIGHT,
              X_TILE_WIDTH,
              Y_TILE_HEIGHT
            );
          }
        }
      } else {
        // ctx.strokeRect(x * X_TILE_WIDTH, y * Y_TILE_HEIGHT, X_TILE_WIDTH, Y_TILE_HEIGHT)
      }

    }
  }
}

function drawEntities(): void {}

requestAnimationFrame(gameLoop);
