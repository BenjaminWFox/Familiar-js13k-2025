import { HEIGHT, WIDTH } from "./constants";
import { drawTileMap } from "./maps";
import { Critter, entities } from "../x_template_files/entity";

const mapCanvas = document.querySelector('#mc') as HTMLCanvasElement;
const mapCtx = mapCanvas.getContext('2d') as CanvasRenderingContext2D;
const canvas = document.querySelector('#c') as HTMLCanvasElement;
const ctx = canvas.getContext('2d') as CanvasRenderingContext2D;
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

function render(): void {
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
drawTileMap(mapCtx);
requestAnimationFrame(gameLoop);
