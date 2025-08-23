import { PATH, X_TILE_WIDTH, Y_TILE_HEIGHT, type Tile, HEIGHT, MENU_START_X, LAYERS } from "./constants";
import { gameState } from "./gameState";
import { getTileDataEntry, TILE_DATA_OBJ, TileData } from "./maps";
import { angleToTarget, convertCanvasXYToPathXY, convertTileToMapBounds, getExpanededDraggingTileBounds, getTileLockedXY, hitTest, mouseTile, movePoint, translateXYMouseToCanvas } from "./utils";

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

export class Entity {
  static ENTITY_ID = 0;

  x: number;
  y: number;
  dx: number;
  dy: number;
  width: number;
  height: number;
  direction: number;
  grounded: boolean;
  frame: number;
  health: number;
  cooldown: number;
  deleted: boolean = false;
  id: number;
  layer: number;

  constructor(x: number, y: number, dx = 0, dy = 0, width = 0, height = 0, layer = LAYERS.base) {
    this.id = ++Entity.ENTITY_ID;
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
    this.layer = layer;
    this.width = width;
    this.height = height;
    // Extend to allow passing in constructor
    entities.push(this);
    entities.sort((e1, e2) => e1.layer - e2.layer)
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
  // Each critter has a reference to its current tile.
  // The currentTile will have a reference (`critters`) to all critters within
  currentTile: TileData | undefined;
  lastTile: TileData | undefined;
  chased: boolean = false;
  caught: boolean = false;

  // assigned in constructor via `getNextDirection`
  att: number = 0;
  destX: number = 0;
  destY: number = 0;

  get nextPathIndex() { return this.pathIndex + 1 }

  constructor() {
    super(0, 0, 0, 0, 20, 20, LAYERS.critters);

    this.pathIndex = 0;
    this.moveDir = getDirectionFromTo(PATH[this.pathIndex], PATH[this.nextPathIndex]);
    // this.moveDir = angleToTarget()
    
    const { directionalMinX, directionalMaxX, directionalMaxY, directionalMinY } = convertTileToMapBounds(PATH[this.pathIndex], this.moveDir);
    
    this.x = getRandomInt(directionalMinX, directionalMaxX - this.width);
    this.y = getRandomInt(directionalMinY, directionalMaxY - this.height);
    this.getNextDirection();
  }

  getNextDirection() {
      const { directionalMinX, directionalMaxX, directionalMinY, directionalMaxY } = convertTileToMapBounds(PATH[this.nextPathIndex], this.moveDir);
      this.destX = getRandomInt(directionalMinX, directionalMaxX - this.width);
      this.destY = getRandomInt(directionalMinY, directionalMaxY - this.height);
      this.att = angleToTarget({x: this.x, y: this.y}, {x: this.destX, y: this.destY});
  }

  setCaught() {
    this.caught = true;
    this.layer = LAYERS.fetchersCarry;
    this.dx = 0;
    this.dy = 0;
    this.removeFromTile();
  }

  removeFromTile() {
    if (this.currentTile) {
      delete this.currentTile.critters[this.id]
    }
  }

  addToTile() {
    if (this.currentTile) {
      this.currentTile.critters[this.id] = this;
    }
  }

  override render(ctx: CanvasRenderingContext2D) {
    if (!this.caught && !this.deleted) {
      const {x, y} = movePoint(this, this.att, 5);
      this.x = x;
      this.y = y;

      ctx.fillStyle = 'yellow';
      ctx.fillRect(this.destX, this.destY, 5, 5)

      const {tileLockedX, tileLockedY} = getTileLockedXY(this.x, this.y);
      const tile = TILE_DATA_OBJ[`${tileLockedX / X_TILE_WIDTH},${tileLockedY / Y_TILE_HEIGHT}`];
      if (tile && (!this.currentTile || tile !== this.currentTile)) {
        this.removeFromTile();
        this.lastTile = this.currentTile;
        this.currentTile = tile;
        this.addToTile();
      }

      if (hitTest(this, {x: this.destX, y: this.destY, width: 10, height: 10})) {
        this.pathIndex += 1;
        
        if (!PATH[this.nextPathIndex]) {
          this.deleted = true;

          return;
        }

        this.moveDir = getDirectionFromTo(PATH[this.pathIndex], PATH[this.nextPathIndex]);
        this.getNextDirection();
      }
    }

    ctx.fillStyle = 'rgba(255, 0, 0, 1)';
    ctx.fillRect(this.x, this.y, this.width, this.height);
  }
}

export class BaseTower extends Entity {
  color: string;
  
  constructor(x: number, y: number, color: string, layer = LAYERS.towers) {
    super(x, y, 0, 0, X_TILE_WIDTH * 3, Y_TILE_HEIGHT * 3, layer)

    this.color = color;
  }

  override render(ctx: CanvasRenderingContext2D) {
    ctx.fillStyle = this.color;
    ctx.fillRect(this.x, this.y, this.width, this.height)
  }
}

export class MenuTower extends BaseTower {
  dragging: boolean = false;

  constructor(x: number, y: number, color: string) {
    super(x, y, color, LAYERS.menuTowers);

    window.addEventListener('mousedown', this.dragHandler.bind(this));
    window.addEventListener('mouseup', this.releaseHandler.bind(this))
  }

  _isValidPlacement = true;

  override render(ctx: CanvasRenderingContext2D) {
    super.render(ctx);

    if (this.dragging) {
      this._isValidPlacement = true;
      const { expandedMinX, expandedMaxX, expandedMinY, expandedMaxY } = getExpanededDraggingTileBounds()
      if (
        expandedMinX < 0 || 
        expandedMaxX > (MENU_START_X - X_TILE_WIDTH) / X_TILE_WIDTH ||
        expandedMinY / Y_TILE_HEIGHT < 0 ||
        expandedMaxY > (HEIGHT - Y_TILE_HEIGHT) / Y_TILE_HEIGHT
      ) {
        // Tower is outside of the game board
        this._isValidPlacement = false;
      } else {
        const towerTiles = [
          [expandedMinX, expandedMinY],
          [expandedMaxX, expandedMinY],
          [mouseTile.x / X_TILE_WIDTH, mouseTile.y / Y_TILE_HEIGHT],
          [expandedMinX, expandedMaxY],
          [expandedMaxX, expandedMaxY],
        ]

        towerTiles.forEach(tileArr => {
          if(TILE_DATA_OBJ[tileArr.toString()].isPath) {
            // Tower is overlapping a part of the path
            this._isValidPlacement = false;
          }
        })
      }

      if (this._isValidPlacement) {
        ctx.fillStyle = "rgba(140, 243, 248, 0.33)";
      } else {
        ctx.fillStyle = "rgba(255, 0, 0, .33)";
      }

      // Draw "valid" range for tower
      ctx?.fillRect(mouseTile.x - (X_TILE_WIDTH * 4), mouseTile.y - (Y_TILE_HEIGHT * 4), X_TILE_WIDTH * 9, Y_TILE_HEIGHT * 9)


      ctx.fillStyle = "rgba(85, 255, 0, .75)";
      // Draw tower
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
        new FetcherTower(mouseTile.x - X_TILE_WIDTH, mouseTile.y - Y_TILE_HEIGHT, this.color)
      }
    }
  }
}

class PlacedTower extends BaseTower {
  coveredTiles: Array<TileData> = [];

  constructor(x: number, y: number, color: string) {
    super(x, y, color);

    const pathXY = convertCanvasXYToPathXY(x, y);
    const coverage = {minX: pathXY.pathX - 3, maxX: pathXY.pathX + 6, minY: pathXY.pathY - 3, maxY: pathXY.pathY + 6 };
    
    for(let x = coverage.minX;x < coverage.maxX;x++){
      for(let y = coverage.minY;y < coverage.maxY;y++){
        const tileData = getTileDataEntry(x, y);
        if (tileData?.isPath) {
          this.coveredTiles.push(tileData);
        }
      }
    }
    // Sort so that furthest tiles is first in the list
    this.coveredTiles.sort((a, b) => b.pathIndex! - a.pathIndex!)
  }

  override render(ctx: CanvasRenderingContext2D) {
    super.render(ctx);
  }
}

class FetcherTower extends PlacedTower {
  fetchers: Array<Fetcher> = [];

  constructor(x: number, y: number, color: string) {
    super(x, y, color);

    this.fetchers.push(...[
      new Fetcher(this),
      new Fetcher(this),
      new Fetcher(this),
    ])
  }

  override render(ctx: CanvasRenderingContext2D) {
    super.render(ctx);
  }
}

enum FetcherStates {
  chasing,
  waiting,
  fetching,
}
class Fetcher extends Entity {
  parent: PlacedTower;
  chasing?: Critter;
  state: FetcherStates = FetcherStates.waiting;
  destX: number = 0;
  destY: number = 0;

  constructor(parent: PlacedTower) {
    super(-100, -100, 0, 0, 30, 30, LAYERS.fetchers);

    this.parent = parent;
    this.x = getRandomInt(parent.x, parent.x + parent.width - this.width);
    this.y = getRandomInt(parent.y, parent.y + parent.width - this.height);
  }

  search() {
    for (const t of this.parent.coveredTiles) {
      // All covered tiles
      const critters = Object.entries(t.critters);
      if (critters.length) {
        for (const c of critters) {
          if (!c[1].chased && !c[1].caught) {
            const [key, critter] = critters[0];
            delete t.critters[key];
            this.chasing = critter;
            critter.chased = true;
            this.state = FetcherStates.chasing;
            break;
          }
        }
      }
      if (this.state === FetcherStates.chasing) {
        break;
      }
    }
  }

  override render(ctx: CanvasRenderingContext2D) {
    switch (this.state) {
      case FetcherStates.chasing:

        if (this.chasing?.deleted) {
          this.chasing = undefined;
          this.state = FetcherStates.waiting;
          this.search();
          break;
        }

        const chaseAngle = angleToTarget(this, this.chasing!);
        const {x: cX, y: cY} = movePoint(this, chaseAngle, 12);
        this.x = cX;
        this.y = cY;

        if (hitTest(this, this.chasing!)) {
          this.chasing!.setCaught();
          this.state = FetcherStates.fetching;
        }
        break;
      case FetcherStates.fetching:
        if (this.destX === 0) {
          this.destX = getRandomInt(this.parent.x, this.parent.x + this.parent.width - this.width);
          this.destY = getRandomInt(this.parent.y, this.parent.y + this.parent.height - this.height);
        }

        const fetchAngle = angleToTarget(this, {x: this.destX, y: this.destY});
        const {x: fX, y: fY} = movePoint(this, fetchAngle, 8);
        this.x = fX;
        this.y = fY;
        this.chasing!.x = this.x + 5;
        this.chasing!.y = this.y + 5;

        if (hitTest(this, {x: this.destX, y: this.destY, width: 4, height: 4})) {
          this.destX = 0;
          this.destY = 0;
          this.state = FetcherStates.waiting
          // this.chasing!.deleted = true;
          this.chasing = undefined;
        }

        break;
      case FetcherStates.waiting:
        if (gameState.gameTime % 10 === 0) {
          this.search();
        }
        break;
    }

    ctx.fillStyle = 'blue'
    ctx.fillRect(this.x, this.y, 30, 30);
  }
}

export class Menu extends Entity {
  constructor() {
    super(MENU_START_X, 0, 0, 0, X_TILE_WIDTH * 10, HEIGHT, LAYERS.menu);
  }

  override render(ctx: CanvasRenderingContext2D): void {
    ctx.fillStyle = 'blue';
    ctx.fillRect(MENU_START_X, 0, this.width, this.height);
  }
}

// All entities
export const entities: Entity[] = [];
