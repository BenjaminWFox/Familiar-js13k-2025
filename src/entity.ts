import { PATH, TILE_WIDTH, type Tile, HEIGHT, MENU_START_X, LAYERS, COLOR_MENU_GREEN_1, COLOR_MENU_GREEN_2, TOWER_WIDTH, MENU_TOWER_START_Y } from "./constants";
import { gameState } from "./gameState";
import { getTileDataEntry, TILE_DATA_OBJ, TileData } from "./maps";
import { Sprite, sprites, SpritesKey } from "./sprites";
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
  if (!tFrom || !tTo) {
    return;
  }
  
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
  count: number = 0;
  sprite?: Sprite;

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
  static types = ['frog', 'fly', 'snake', 'lizard'];
  pathIndex: number;
  moveDir: NEXT_DIR | undefined;
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

    this.sprite = sprites[Critter.types[getRandomInt(0, Critter.types.length - 1)] as keyof typeof sprites]();
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
      const {x, y} = movePoint(this, this.att, 2);
      this.x = x;
      this.y = y;

      // ctx.fillStyle = 'yellow';
      // ctx.fillRect(this.destX, this.destY, 5, 5)

      const {tileLockedX, tileLockedY} = getTileLockedXY(this.x, this.y);
      const tile = TILE_DATA_OBJ[`${tileLockedX / TILE_WIDTH},${tileLockedY / TILE_WIDTH}`];
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

    // ctx.fillStyle = 'rgba(255, 0, 0, 1)';
    // ctx.fillRect(this.x, this.y, this.width, this.height);
    // const type = critterTypes[this.type];
    this.sprite?.draw(ctx, this.x, this.y, 50);
    // if (this.count < 8) {
    //   ctx.drawImage(gameState.image!, this.sprite.x, type.y, 10, 10, this.x, this.y, this.width * 2, this.height * 2);
    // } else if (this.count < 16) {
    //   ctx.drawImage(gameState.image!, type.x + 10, type.y, 10, 10, this.x, this.y, this.width * 2, this.height * 2);
    //   if (this.count === 15) {
    //     this.count = 0;
    //   }
    // }
    // this.count++;
    
  }
}

export class BaseTower extends Entity {
  constructor(x: number, y: number, layer = LAYERS.towers) {
    super(x, y, 0, 0, TILE_WIDTH * 3, TILE_WIDTH * 3, layer)
  }

  override render(ctx: CanvasRenderingContext2D) {
    this.sprite?.draw(ctx, this.x, this.y, TILE_WIDTH * 3)
  }
}

export class MenuTower extends BaseTower {
  dragging: boolean = false;

  constructor(x: number, y: number, key: SpritesKey) {
    super(x, y, LAYERS.menuTowers);

    this.sprite = sprites[key]();

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
        expandedMaxX > (MENU_START_X - TILE_WIDTH) / TILE_WIDTH ||
        expandedMinY / TILE_WIDTH < 0 ||
        expandedMaxY > (HEIGHT - TILE_WIDTH) / TILE_WIDTH
      ) {
        // Tower is outside of the game board
        this._isValidPlacement = false;
      } else {
        const towerTiles = [
          [expandedMinX, expandedMinY],
          [expandedMaxX, expandedMinY],
          [mouseTile.x / TILE_WIDTH, mouseTile.y / TILE_WIDTH],
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
      ctx?.fillRect(mouseTile.x - (TILE_WIDTH * 3), mouseTile.y - (TILE_WIDTH * 3), TILE_WIDTH * 7, TILE_WIDTH * 7)

      // Draw tower
      this.sprite?.draw(ctx, mouseTile.x - TILE_WIDTH, mouseTile.y - TILE_WIDTH, TOWER_WIDTH);
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
        const x = mouseTile.x - TILE_WIDTH
        const y = mouseTile.y - TILE_WIDTH
        console.log(this.sprite?.type);
        switch(this.sprite?.type) {
          case 'kid':
            new FetcherTower(x, y)
            break;
          case 'fan':
            new FanTower(x, y)
            break;
          case 'vaccuum':
            new VaccuumTower(x, y)
            break;
          case 'net':
            new NetTower(x, y)
            break;
          case 'scratch':
            new ScratchTower(x, y)
            break;
          case 'fish':
            new FishTower(x, y)
            break;
        }
      }
    }
  }
}

class PlacedTower extends BaseTower {
  coveredTiles: Array<TileData> = [];

  constructor(x: number, y: number) {
    super(x, y);

    const pathXY = convertCanvasXYToPathXY(x, y);
    const coverage = {minX: pathXY.pathX - 2, maxX: pathXY.pathX + 5, minY: pathXY.pathY - 2, maxY: pathXY.pathY + 5 };
    
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

  constructor(x: number, y: number) {
    super(x, y);

    this.sprite = sprites.kid();

    this.fetchers.push(...[
      new Fetcher(this),
      new Fetcher(this),
      new Fetcher(this),
    ])
  }
}

class NetTower extends PlacedTower {
  constructor(x: number, y: number) {
    super(x, y);
    this.sprite = sprites.net();
  }
}

class FanTower extends PlacedTower {
  constructor(x: number, y: number) {
    super(x, y);
    this.sprite = sprites.fan();
  }
}

class VaccuumTower extends PlacedTower {
  constructor(x: number, y: number) {
    super(x, y);
    this.sprite = sprites.vaccuum();
  }
}

class ScratchTower extends PlacedTower {
    constructor(x: number, y: number) {
    super(x, y);
    this.sprite = sprites.scratch();
  }
}

class FishTower extends PlacedTower {
    constructor(x: number, y: number) {
    super(x, y);
    this.sprite = sprites.fish();
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
    this.sprite = sprites.fetcher();
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
        const {x: cX, y: cY} = movePoint(this, chaseAngle, 4);
        this.x = cX;
        this.y = cY;

        if (hitTest(this, this.chasing!)) {
          this.chasing!.setCaught();
          this.state = FetcherStates.fetching;
        }
        break;
      case FetcherStates.fetching:
        if (this.destX === 0) {
          this.destX = getRandomInt(this.parent.x + this.width, this.parent.x + this.parent.width - this.width);
          this.destY = getRandomInt(this.parent.y + this.width, this.parent.y + this.parent.height - this.height);
        }

        const fetchAngle = angleToTarget(this, {x: this.destX, y: this.destY});
        const {x: fX, y: fY} = movePoint(this, fetchAngle, 2);
        this.x = fX;
        this.y = fY;
        this.chasing!.x = this.x + 5;
        this.chasing!.y = this.y + 5;

        // ctx.fillStyle = "yellow";
        // ctx.fillRect(this.destX, this.destY, 4, 4);

        if (hitTest(this, {x: this.destX, y: this.destY, width: 4, height: 4})) {
          this.destX = 0;
          this.destY = 0;
          this.state = FetcherStates.waiting
          this.chasing!.deleted = true;
          this.chasing = undefined;
        }

        break;
      case FetcherStates.waiting:
        if (gameState.gameTime % 10 === 0) {
          this.search();
        }
        break;
    }

    switch (this.state) {
      case FetcherStates.chasing:
      case FetcherStates.fetching:
        this.sprite?.draw(ctx, this.x, this.y, TILE_WIDTH, TILE_WIDTH)
        break;
      case FetcherStates.waiting:
      default:
        this.sprite?.draw(ctx, this.x, this.y, TILE_WIDTH, TILE_WIDTH, true)
        // ctx.drawImage(gameState.image!, 0, 40, 10, 10, this.x, this.y, TILE_WIDTH, TILE_WIDTH)
        break;
    }
  }
}

export class Menu extends Entity {
  constructor() {
    super(MENU_START_X, 0, 0, 0, TILE_WIDTH * 12, HEIGHT, LAYERS.menu);
  }

  override render(ctx: CanvasRenderingContext2D): void {
    ctx.fillStyle = COLOR_MENU_GREEN_1;
    ctx.fillRect(MENU_START_X, 0, this.width, this.height);
    ctx.fillStyle = COLOR_MENU_GREEN_2;
    ctx.fillRect(MENU_START_X - (TILE_WIDTH * 2), 0, TILE_WIDTH, this.height);
    ctx.fillStyle = COLOR_MENU_GREEN_1;
    ctx.fillRect(MENU_START_X - TILE_WIDTH, 0, TILE_WIDTH, this.height);

    ctx.fillStyle = 'white';

    const sy = (mod: number) => MENU_TOWER_START_Y + TILE_WIDTH * mod;
    const sx = MENU_START_X + (TILE_WIDTH * 4);

    ctx.font = "60px 'Courier New'"
    ctx.fillText(`Towers`, MENU_START_X, MENU_TOWER_START_Y - TILE_WIDTH * 3)

    ctx.font = "35px 'Courier New'"
    ctx.fillText(`Click+Drag to place towers`, MENU_START_X, MENU_TOWER_START_Y - TILE_WIDTH * 2)

    ctx.font = "40px 'Courier New'"
    ctx.fillText(`High-energy Kids`, MENU_START_X, MENU_TOWER_START_Y - TILE_WIDTH * .5)
    ctx.fillText(`Really Big Fans`, MENU_START_X, sy(4.5))
    ctx.fillText(`Powerful Vaccuums`, MENU_START_X, sy(9.5))
    ctx.fillText(`Guy with a Net`, MENU_START_X, sy(14.5))
    ctx.fillText(`Fish on a Stick`, MENU_START_X, sy(19.5))
    ctx.fillText(`Scratching Post`, MENU_START_X, sy(24.5))

    ctx.font = "26px 'Courier New'";
    ctx.fillText(`- Fast`, sx, sy(.5))
    ctx.fillText(`- Can't catch flying`, sx, sy(1.5))
    ctx.fillText(`- $ 500`, sx, sy(2.5))

    ctx.fillText(`- Blows critters back`, sx, sy(5.5))
    ctx.fillText(`- Doesn't catch anything`, sx, sy(6.5))
    ctx.fillText(`- $ 500`, sx, sy(7.5))

    ctx.fillText(`- Slow`, sx, sy(10.5))
    ctx.fillText(`- Covers many angles`, sx, sy(11.5))
    ctx.fillText(`- $ 500`, sx, sy(12.5))

    ctx.fillText(`- Slow`, sx, sy(15.5))
    ctx.fillText(`- Catches big groups`, sx, sy(16.5))
    ctx.fillText(`- $ 500`, sx, sy(17.5))

    ctx.fillText(`- Distract 1 Black Cat`, sx, sy(20.5))
    ctx.fillText(`- $ 100`, sx, sy(21.5))

    ctx.fillText(`- Distract 4 Black Cats`, sx, sy(25.5))
    ctx.fillText(`- $ 350`, sx, sy(26.5))
  }
}

// All entities
export const entities: Entity[] = [];
