import { PATH, X_TILE_WIDTH, Y_TILE_HEIGHT, type Tile, CRITTER_MOVE_SPEED, HEIGHT, MENU_START_X } from "./constants";
import { convertTileToMapBounds, TILE_DATA_OBJ } from "./maps";
import { mouseTile, translateXYMouseToCanvas } from "./utils";

export const ENTITY_TYPE_PLAYER = 0;
export const ENTITY_TYPE_COIN = 1;
export const ENTITY_TYPE_JUMPPAD = 2;
export const ENTITY_TYPE_WALKING_ENEMY = 3;

export enum NEXT_DIR {
  N,
  NE,
  E,
  SE,
  S,
  SW,
  W,
  NW
}

function getRandomInt(min: number, max: number) {
    min = Math.ceil(min);
    max = Math.floor(max);
    return Math.floor(Math.random() * (max - min + 1)) + min;
}

export function getDirectionFromTo(tFrom: Tile, tTo: Tile) {
  if (tTo[0] < tFrom[0]) {
      if (tTo[1] < tFrom[1]) {
        return NEXT_DIR.NW;
      } else if (tTo[1] > tFrom[1]) {
        return NEXT_DIR.SW;
      } else {
        return NEXT_DIR.W;
      }
  } else if (tTo[0] > tFrom[0]) {
      if (tTo[1] < tFrom[1]) {
        return NEXT_DIR.NE;
      } else if (tTo[1] > tFrom[1]) {
        return NEXT_DIR.SE;
      } else {
        return NEXT_DIR.E;
      }
  } else if (tTo[1] < tFrom[1]) {
    return NEXT_DIR.N;
  } else {
    return NEXT_DIR.S;
  }
}

function getDataForDirection(dir: NEXT_DIR): { moveD: {dx: number, dy: number}, arrivedAtTest: (points: SourceTargetPoints) => boolean } {
  const d = {dx: 0, dy: 0};
  let t = (_: SourceTargetPoints) => true;
  
  switch (dir) {
    case NEXT_DIR.N:
      d.dy = -CRITTER_MOVE_SPEED;
      t = ({y1, y2}) => y1 < y2
      break;
    case NEXT_DIR.NE:
      d.dy = -CRITTER_MOVE_SPEED;
      d.dx = CRITTER_MOVE_SPEED;
      t = ({x1, x2, y1, y2}) => x1 > x2 && y1 < y2
      break;
    case NEXT_DIR.E:
      d.dx = CRITTER_MOVE_SPEED;
      t = ({x1, x2}) => x1 > x2
      break;
    case NEXT_DIR.SE:
      d.dy = CRITTER_MOVE_SPEED;
      d.dx = CRITTER_MOVE_SPEED;
      t = ({x1, x2, y1, y2}) => x1 > x2 && y1 > y2
      break;
    case NEXT_DIR.S:
      d.dy = CRITTER_MOVE_SPEED;
      t = ({y1, y2}) => y1 > y2
      break;
    case NEXT_DIR.SW:
      d.dy = CRITTER_MOVE_SPEED;
      d.dx = -CRITTER_MOVE_SPEED;
      t = ({x1, x2, y1, y2}) => x1 < x2 && y1 > y2
      break;
    case NEXT_DIR.W:
      d.dx = -CRITTER_MOVE_SPEED;
      t = ({x1, x2}) => x1 < x2
      break;
    case NEXT_DIR.NW:
      d.dy = -CRITTER_MOVE_SPEED;
      d.dx = -CRITTER_MOVE_SPEED;
      t = ({x1, x2, y1, y2}) => x1 < x2 && y1 < y2
      break;
    default:
      break;
  }

  return { moveD: d, arrivedAtTest: t };
}

interface SourceTargetPoints {
  x1: number;
  x2: number;
  y1: number;
  y2: number;
}

export class Entity {
  x: number;
  y: number;
  dx: number;
  dy: number;
  direction: number;
  grounded: boolean;
  frame: number;
  health: number;
  cooldown: number;
  deleted: boolean = false;

  constructor(x: number, y: number, dx = 0, dy = 0) {
    // this.entityType = entityType;
    this.x = x;
    this.y = y;
    this.dx = dx;
    this.dy = dy;
    this.direction = 1;
    this.grounded = false;
    this.frame = 0;
    this.health = 100;
    this.cooldown = 0;
    // Extend to allow passing in constructor
    entities.push(this);
  }

  distance(other: Entity): number {
    return Math.hypot(this.x - other.x, this.y - other.y);
  }

  add() {

  }

  render(_: CanvasRenderingContext2D) {};
}


// When creating the class, we need to get the next point in line
// Then we need to know when the create is at that next point
// When arriving at that point, then we need to get the *next* point
// so we'll need to track which index the critter is on
export class Critter extends Entity {
  pathIndex: number;
  moveDir: NEXT_DIR;
  shouldUpdateMoveDir;
  destX;
  destY;

  get nextPathIndex() { return this.pathIndex + 1 }

  constructor() {
    super(0, 0, 0, 0);

    critters.push(this);

    this.pathIndex = 0;
    this.moveDir = getDirectionFromTo(PATH[this.pathIndex], PATH[this.nextPathIndex]);
    
    const { expandedMinX, expandedMaxX, expandedMaxY, expandedMinY } = convertTileToMapBounds(PATH[this.pathIndex], this.moveDir);
    const { midX: nextMidX, midY: nextMidY } = convertTileToMapBounds(PATH[this.nextPathIndex], this.moveDir);
    
    this.x = getRandomInt(expandedMinX + X_TILE_WIDTH, expandedMaxX - X_TILE_WIDTH);
    this.y = getRandomInt(expandedMinY, expandedMaxY );

    const { moveD, arrivedAtTest } = getDataForDirection(this.moveDir);

    this.dx = moveD.dx;
    this.dy = moveD.dy;
    this.shouldUpdateMoveDir = arrivedAtTest

    this.destX = nextMidX;
    this.destY = nextMidY;

  }

  override render(ctx: CanvasRenderingContext2D) {
    ctx.fillStyle = 'red';
    this.x = this.x + this.dx;
    this.y = this.y + this.dy;
    ctx.fillRect(this.x, this.y, X_TILE_WIDTH / 2, Y_TILE_HEIGHT / 2);

    if (!this.deleted && this.shouldUpdateMoveDir({x1: this.x, x2: this.destX, y1: this.y, y2: this.destY})) {

      this.pathIndex += 1

      if (!PATH[this.nextPathIndex]) {
        this.deleted = true;

        return;
      }

      this.moveDir = getDirectionFromTo(PATH[this.pathIndex], PATH[this.nextPathIndex]);

      const { moveD, arrivedAtTest } = getDataForDirection(this.moveDir);
      this.dx = moveD.dx;
      this.dy = moveD.dy;

      const { minX, minY, maxX, maxY } = convertTileToMapBounds(PATH[this.nextPathIndex], this.moveDir);
      this.destX = getRandomInt(minX - X_TILE_WIDTH * .25, maxX - X_TILE_WIDTH * .5);
      this.destY = getRandomInt(minY - Y_TILE_HEIGHT * .5, maxY - Y_TILE_HEIGHT * 1.25);

      this.shouldUpdateMoveDir = arrivedAtTest;
    }
  }
}

// function draggable(this: MenuTower, handler: Function) {
//   window.addEventListener('mousedown', handler.bind(this))
// }

export class BaseTower extends Entity {
  color: string;
  width: number;
  height: number;
  
  constructor(x: number, y: number, color: string) {
    super(x, y)
    towers.push(this);

    this.color = color;
    this.width = X_TILE_WIDTH * 3;
    this.height = Y_TILE_HEIGHT * 3;
  }

  override render(ctx: CanvasRenderingContext2D) {
    ctx.fillStyle = this.color;
    ctx.fillRect(this.x, this.y, this.width, this.height)
  }
}

export class MenuTower extends BaseTower {
  dragging: boolean = false;

  constructor(x: number, y: number, color: string) {
    super(x, y, color);

    window.addEventListener('mousedown', this.dragHandler.bind(this));
    window.addEventListener('mouseup', this.releaseHandler.bind(this))
  }

  _isValidPlacement = true;

  override render(ctx: CanvasRenderingContext2D) {
    super.render(ctx);

    if (this.dragging) {
      this._isValidPlacement = true;

      if (
        (mouseTile.x - X_TILE_WIDTH) / X_TILE_WIDTH < 0 || 
        (mouseTile.x + X_TILE_WIDTH) / X_TILE_WIDTH > (MENU_START_X - X_TILE_WIDTH) / X_TILE_WIDTH ||
        (mouseTile.y - Y_TILE_HEIGHT) / Y_TILE_HEIGHT < 0 ||
        (mouseTile.y + Y_TILE_HEIGHT) / Y_TILE_HEIGHT > (HEIGHT - Y_TILE_HEIGHT) / Y_TILE_HEIGHT
      ) {
        // Tower is outside of the game board
        this._isValidPlacement = false;
      } else {
        const towerTiles = [
          [(mouseTile.x - X_TILE_WIDTH) / X_TILE_WIDTH, (mouseTile.y - Y_TILE_HEIGHT) / Y_TILE_HEIGHT],
          [(mouseTile.x + X_TILE_WIDTH) / X_TILE_WIDTH, (mouseTile.y - Y_TILE_HEIGHT) / Y_TILE_HEIGHT],
          [mouseTile.x / X_TILE_WIDTH, mouseTile.y / Y_TILE_HEIGHT],
          [(mouseTile.x - X_TILE_WIDTH) / X_TILE_WIDTH, (mouseTile.y + Y_TILE_HEIGHT) / Y_TILE_HEIGHT],
          [(mouseTile.x + X_TILE_WIDTH) / X_TILE_WIDTH, (mouseTile.y + Y_TILE_HEIGHT) / Y_TILE_HEIGHT],
        ]

        towerTiles.forEach(tileArr => {
          if(TILE_DATA_OBJ[tileArr.toString()].isPath) {
            // Tower is overlapping a part of the path
            this._isValidPlacement = false;
          }
        })
      }

      if (this._isValidPlacement) {
        ctx.fillStyle = "rgba(85, 255, 0, .5)";
      } else {
        ctx.fillStyle = "rgba(255, 0, 0, .5)";
      }

      ctx.fillRect(
        mouseTile.x - X_TILE_WIDTH,
        mouseTile.y - Y_TILE_HEIGHT,
        X_TILE_WIDTH * 3, Y_TILE_HEIGHT * 3
      );
    }
  }

  dragHandler(e: MouseEvent) {
    const { canvasX, canvasY } = translateXYMouseToCanvas(e.pageX, e.pageY);

    if (!this.dragging) {
      if (this.x < canvasX && this.x + this.width > canvasX && this.y < canvasY && this.y + this.height > canvasY) {
        this.dragging = true;
      }
    }
  }

  releaseHandler() { 
    if (this.dragging) {
      this.dragging = false;
      if (this._isValidPlacement) {
        new BaseTower(mouseTile.x - X_TILE_WIDTH, mouseTile.y - Y_TILE_HEIGHT, this.color)
      }
    }
  }
}

// All entities
export const entities: Entity[] = [];
// Only critters
export const critters: Critter[] = [];
// Only towers
export const towers: BaseTower[] = [];
