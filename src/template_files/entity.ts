import { PATH, X_TILE_WIDTH, Y_TILE_HEIGHT, type Tile, type Path, CRITTER_MOVE_SPEED } from "../constants";
import { convertPointPathToMap, convertTileToMapBounds } from "../maps";

export const ENTITY_TYPE_PLAYER = 0;
export const ENTITY_TYPE_COIN = 1;
export const ENTITY_TYPE_JUMPPAD = 2;
export const ENTITY_TYPE_WALKING_ENEMY = 3;

export class Entity {
  render: (ctx: CanvasRenderingContext2D) => void;
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
    this.render = () => {}
    entities.push(this);
  }

  distance(other: Entity): number {
    return Math.hypot(this.x - other.x, this.y - other.y);
  }
}

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

interface SourceTargetPoints {
  x1: number;
  x2: number;
  y1: number;
  y2: number;
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

function getRandomInt(min: number, max: number) {
    min = Math.ceil(min);
    max = Math.floor(max);
    return Math.floor(Math.random() * (max - min + 1)) + min;
}

export class Critter extends Entity {
  pathIndex: number;
  moveDir: NEXT_DIR;
  shouldUpdateMoveDir;
  destX;
  destY;

  get nextPathIndex() { return this.pathIndex + 1 }

  constructor() {
    super(0, 0, 0, 0);

    this.pathIndex = 0;
    this.moveDir = getDirectionFromTo(PATH[this.pathIndex], PATH[this.nextPathIndex]);
    
    const { expandedMinX, expandedMaxX, expandedMaxY, expandedMinY } = convertTileToMapBounds(PATH[this.pathIndex], this.moveDir);
    const { midX: nextMidX, midY: nextMidY } = convertTileToMapBounds(PATH[this.nextPathIndex], this.moveDir);
    
    this.x = getRandomInt(expandedMinX + X_TILE_WIDTH, expandedMaxX - X_TILE_WIDTH);
    this.y = getRandomInt(expandedMinY, expandedMaxY );
    this.render = critterRender.bind(this);

    const { moveD, arrivedAtTest } = getDataForDirection(this.moveDir);

    this.dx = moveD.dx;
    this.dy = moveD.dy;
    this.shouldUpdateMoveDir = arrivedAtTest

    
    this.destX = nextMidX;
    this.destY = nextMidY;
  }
}

function critterRender(this: Critter, ctx: CanvasRenderingContext2D) {
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

      const { midX, midY, expandedMinX, expandedMaxX, expandedMaxY, expandedMinY, minX, minY, maxX, maxY } = convertTileToMapBounds(PATH[this.nextPathIndex], this.moveDir);
      this.destX = getRandomInt(minX - X_TILE_WIDTH * .25, maxX - X_TILE_WIDTH * .5);
      this.destY = getRandomInt(minY - Y_TILE_HEIGHT * .5, maxY - Y_TILE_HEIGHT * 1.25);

      this.shouldUpdateMoveDir = arrivedAtTest;
    }
}

// When creating the class, we need to get the next point in line
// Then we need to know when the create is at that next point
// When arriving at that point, then we need to get the *next* point
// so we'll need to track which index the critter is on

export const entities: Entity[] = [];
