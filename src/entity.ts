import { PATH, TILE_WIDTH, type Tile, HEIGHT, MENU_START_X, LAYERS, COLOR_MENU_GREEN_1, COLOR_MENU_GREEN_2, TOWER_WIDTH, MENU_TOWER_START_Y, STRINGS } from "./constants";
import { gameState } from "./gameState";
import { getTileDataEntry, TILE_DATA_OBJ, TileData } from "./maps";
import { Sprite, sprites } from "./sprites";
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
  destX: number = 0;
  destY: number = 0;

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
    // entities.push(this);
    // entities.sort((e1, e2) => e1.layer - e2.layer)
  }

  distance(other: Entity): number {
    return Math.hypot(this.x - other.x, this.y - other.y);
  }

  add() {

  }

  render(_: CanvasRenderingContext2D) {};
}

export class Animal extends Entity {
  baseSpeed: number = 2;
  pathIndex: number;
  flying: boolean = false;
  moveDir: NEXT_DIR | undefined;
  speed: number;
  caught: boolean = false;
  distracted: boolean = false;
  currentTile: TileData | undefined;
  chased: boolean = false;
  carried: boolean = false;
  blown: boolean = false;
  type?: string;

  // assigned in constructor via `getNextDirection`
  att: number = 0;

  // Each critter has a reference to its current tile.
  // The currentTile will have a reference (`critters`) to all critters within
  lastTile: TileData | undefined;

  constructor() {
    super(0, 0, 0, 0, 20, 20, LAYERS.critters);
    this.pathIndex = 0;
    this.speed = this.baseSpeed;
    this.moveDir = getDirectionFromTo(PATH[this.pathIndex], PATH[this.nextPathIndex]);
    // this.moveDir = angleToTarget()
    
    const { directionalMinX, directionalMaxX, directionalMaxY, directionalMinY } = convertTileToMapBounds(PATH[this.pathIndex], this.moveDir);
    
    this.x = getRandomInt(directionalMinX, directionalMaxX - this.width);
    this.y = getRandomInt(directionalMinY, directionalMaxY - this.height);
    this.getNextDirection();
  }

  get nextPathIndex() { return this.pathIndex + 1 }

  getNextDirection() {
      const { directionalMinX, directionalMaxX, directionalMinY, directionalMaxY } = convertTileToMapBounds(PATH[this.nextPathIndex], this.moveDir);
      this.destX = getRandomInt(directionalMinX, directionalMaxX - this.width);
      this.destY = getRandomInt(directionalMinY, directionalMaxY - this.height);
      this.att = angleToTarget({x: this.x, y: this.y}, {x: this.destX, y: this.destY});
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

  setCaught() {
    this.caught = true;
    this.removeAutonomy();
  }

  removeAutonomy() {
    this.layer = LAYERS.fetchersCarry;
    this.dx = 0;
    this.dy = 0;
    this.removeFromTile();
  }

  getForcedDirection() {
      this.att = angleToTarget({x: this.x, y: this.y}, {x: this.destX, y: this.destY});
  }

  get canMove() {
    console.log('cm? 1')
    return !this.caught && !this.carried;
  }

  render(ctx: CanvasRenderingContext2D) {
    if (this.canMove) {
      const {x, y} = movePoint(this, this.att, this.speed);
      this.x = x;
      this.y = y;
        
      if (hitTest(this, {x: this.destX - 5, y: this.destY - 5, width: 10, height: 10}) ||
        (this.blown && hitTest(this, {x: this.destX - 15, y: this.destY - 15, width: 30, height: 30}))
      ) {
        this.blown = false;
        this.speed = this.baseSpeed;
        this.pathIndex += 1;
        
        if (!PATH[this.nextPathIndex] || this.caught) {
          this.deleted = true;

          return;
        }

        this.moveDir = getDirectionFromTo(PATH[this.pathIndex], PATH[this.nextPathIndex]);
        this.getNextDirection();
      }

      const {tileLockedX, tileLockedY} = getTileLockedXY(this.x, this.y);
      const tile = TILE_DATA_OBJ[`${tileLockedX / TILE_WIDTH},${tileLockedY / TILE_WIDTH}`];
      
      if (tile && (!this.currentTile || tile !== this.currentTile)) {
        this.removeFromTile();
        this.lastTile = this.currentTile;
        this.currentTile = tile;
        this.addToTile();
      }
    }

    this.sprite?.draw(ctx, this.x - 25, this.y - 25, 50, 50, this.carried || (this.caught && !this.distracted));
  }
}

// When creating the class, we need to get the next point in line
// Then we need to know when the create is at that next point
// When arriving at that point, then we need to get the *next* point
// so we'll need to track which index the critter is on
export class Critter extends Animal {
  static types = [STRINGS.frog, STRINGS.fly, STRINGS.lizard, STRINGS.snake];
  type: string;
  baseSpeed: number = 3;

  constructor() {
    super();

    const rng = getRandomInt(0, Critter.types.length - 1);
    const type = Critter.types[rng];

    if (type === 'fly') {
      this.flying = true;
    }
    // @ts-ignore
    this.sprite = sprites[type]();
    this.type = type;

    critters.push(this);
  }

  setCarried() {
    this.carried = true;
    this.removeAutonomy();
  }

  blownBack() {
    const blowback = this.flying ? 4 : 2
    this.blown = true;
    this.speed = 6;
    this.pathIndex = this.pathIndex < blowback ? 0 : this.pathIndex -= blowback;
    this.getNextDirection();
  }

  get canMove() {
    return !this.carried && !this.deleted;
  }

  override render(ctx: CanvasRenderingContext2D) {
    super.render(ctx);

    if (this.canMove) {
      // // Debug
      // ctx.fillRect(this.destX - 5, this.destY - 5, 10, 10)
    }
  }
}

export class Cat extends Animal {
  baseSpeed: number = 6;
  playing: boolean = false;
  caughtBy?: ScratchTower | FishTower;
  nextPlay: number = 0;

  constructor() {
    super();
    this.sprite = sprites[STRINGS.cat]();
    this.speed = this.baseSpeed;
    cats.push(this);
  }

  override get canMove(): boolean {
    return !this.playing;
  }

  override render(ctx: CanvasRenderingContext2D) {
    super.render(ctx);

    if (!this.distracted) {
      const catTowers = (this.currentTile?.towersCoveringTile as CatCatchingTower[])?.filter(t => t.sprite?.type === STRINGS.scratch || t.sprite?.type === STRINGS.fish)!;
      if (catTowers) {
        for (const tower of catTowers) {
          if (tower.caughtCats.length < tower.maxCats) {
            this.caughtBy = tower;
            this.caught = true;
            this.distracted = true
            tower.catch(this);

            this.destX = getRandomInt(tower.x, tower.x + TOWER_WIDTH);
            this.destY = getRandomInt(tower.y, tower.y + TOWER_WIDTH);
            this.getForcedDirection();
            break;
          }
        }
      }
    } else if (!this.playing) {
      if(hitTest(this, {x: this.destX - 10, y: this.destY - 10, width: 20, height: 20})) {
        this.nextPlay = getRandomInt(20, 60);
        this.playing = true;
      }
    } else if (this.playing && gameState.gameTime % this.nextPlay === 0) {
        this.destX = getRandomInt(this.caughtBy!.x, this.caughtBy!.x + TOWER_WIDTH);
        this.destY = getRandomInt(this.caughtBy!.y, this.caughtBy!.y + TOWER_WIDTH);
        this.getForcedDirection();
        this.nextPlay = getRandomInt(20, 60);
        this.playing = false;
    }
  }
}

export class BaseTower extends Entity {
  constructor(x: number, y: number, layer = LAYERS.towers) {
    super(x, y, 0, 0, TOWER_WIDTH, TOWER_WIDTH, layer)
  }

  override render(ctx: CanvasRenderingContext2D) {
    this.sprite?.draw(ctx, this.x, this.y, TOWER_WIDTH)
  }
}

/**
 * Returns `true` by default - runs the passed predicate to determine if the condition holds true - predicate should return false if not.
 */
function checkConditionForTowerTiles(minX: number, maxX: number, minY: number, maxY: number, predicate: (ta: number[]) => boolean): boolean {
  let test = true;

  const towerTiles = [
    [minX, minY],
    [minX, minY + 1],
    [minX + 1, minY],
    [maxX, minY],
    [maxX, minY + 1],
    [minX, maxY],
    [minX + 1, maxY],
    [maxX, maxY],
  ]

  towerTiles.forEach(tileArr => {
    const result = predicate(tileArr);
    if (!result) {
      test = result;
    }
  })

  return test;
}

export class MenuTower extends BaseTower {
  dragging: boolean = false;

  constructor(x: number, y: number, key: string) {
    super(x, y, LAYERS.menuTowers);

    this.sprite = sprites[key]();

    window.addEventListener('mousedown', this.dragHandler.bind(this));
    window.addEventListener('mouseup', this.releaseHandler.bind(this));

    menuTowers.push(this);
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

        function isValidPlacement(tileArr: number[]) {
          const tile = TILE_DATA_OBJ[tileArr.toString()];
          if(tile.isPath || tile.hasTower) {
            // Tower is overlapping a part of the path
            return false;
          }
          return true;
        }

        this._isValidPlacement = checkConditionForTowerTiles(expandedMinX, expandedMaxX, expandedMinY, expandedMaxY, isValidPlacement);
      }

      if (this._isValidPlacement) {
        ctx.fillStyle = "rgba(140, 243, 248, 0.33)";
      } else {
        ctx.fillStyle = "rgba(255, 0, 0, .33)";
      }

      if (this.sprite?.type === 'vaccuum' || this.sprite?.type === 'fan') {
        const { tileLockedX, tileLockedY } = getTileLockedXY(mouseTile.x, mouseTile.y);

        // ctx.fillStyle = 'red'
        // ctx.fillRect(tileLockedX, tileLockedY, TILE_WIDTH, TILE_WIDTH);
        // ctx.fillStyle = "rgba(140, 243, 248, 0.33)";

        const tiles = this.sprite?.type === 'vaccuum' ? VaccuumTower.CoveredTiles : FanTower.CoveredTiles;
        for(let i = 0;i<tiles.length;i+=2)  {
          const xDiff = (tiles[i] * TILE_WIDTH) // tiles[i] > 0 ? (TOWER_WIDTH) + (tiles[i] * TILE_WIDTH) : (tiles[i] * TILE_WIDTH);
          const yDiff = (tiles[i+1] * TILE_WIDTH) // tiles[i+1] > 0 ? (TOWER_WIDTH) + (tiles[i+1] * TILE_WIDTH) : (tiles[i+1] * TILE_WIDTH);;
          ctx?.fillRect(tileLockedX - (TILE_WIDTH) + xDiff, tileLockedY - (TILE_WIDTH) + yDiff, TILE_WIDTH, TILE_WIDTH)
        }
      } else if (this.sprite?.type === 'net') {
        ctx?.fillRect(mouseTile.x - (TOWER_WIDTH + TILE_WIDTH), mouseTile.y - (TOWER_WIDTH + TILE_WIDTH), TILE_WIDTH * 9, TILE_WIDTH * 9)
      } else {
        // Draw "valid" range for tower
        ctx?.fillRect(mouseTile.x - (TOWER_WIDTH), mouseTile.y - (TOWER_WIDTH), TILE_WIDTH * 7, TILE_WIDTH * 7)
      }

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
        const markHasTower = (tileArr: number[]) => {
          TILE_DATA_OBJ[tileArr.toString()].hasTower = true;
          return true;
        };
        const { expandedMinX, expandedMaxX, expandedMinY, expandedMaxY } = getExpanededDraggingTileBounds()
        checkConditionForTowerTiles(expandedMinX, expandedMaxX, expandedMinY, expandedMaxY, markHasTower);
        const x = mouseTile.x - TILE_WIDTH
        const y = mouseTile.y - TILE_WIDTH
        
        switch(this.sprite?.type) {
          case STRINGS.kid:
            new FetcherTower(x, y)
            break;
          case STRINGS.fan:
            new FanTower(x, y)
            break;
          case STRINGS.vaccuum:
            new VaccuumTower(x, y)
            break;
          case STRINGS.net:
            new NetTower(x, y)
            break;
          case STRINGS.scratch:
            new ScratchTower(x, y)
            break;
          case STRINGS.fish:
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

    towers.push(this);
  }

  override render(ctx: CanvasRenderingContext2D) {
    super.render(ctx);
  }
}

class FetcherTower extends PlacedTower {
  fetchers: Array<Fetcher> = [];

  constructor(x: number, y: number) {
    super(x, y);

    this.sprite = sprites[STRINGS.kid]();

    this.fetchers.push(...[
      new Fetcher(this),
      new Fetcher(this),
      // new Fetcher(this),
    ])
  }
}

const getSquareTilesCovered = (min: number, max: number) => {
  let arr = [];
  for (let i = min;i < max;i++) {
    for (let j = min;j < max;j++) {
      const skip = i >= 0 && i <=2 && j >=0 && j <= 2;
      if (!skip) {
        arr.push(i, j);
      }
    }
  }
  return arr;
}

class Particle extends Entity {
  att: number = 0;
  isCircle: boolean = false;
  speed: number = getRandomInt(5, 10);
  cx: number = 0;
  cy: number = 0;
  angle: number = 0;
  radius: number = 0;
  oRadius: number = 0;
  time: number = 0;
  sX: number = 0;
  sY: number = 0;
  isKey: boolean = false;
  carrying: Array<Animal> = [];


  constructor(x: number, y: number, destX: number, destY: number, isCircle = false, cx?: number, cy?: number, r?: number, isKey: boolean = false) {
    super(x, y)

    this.destX = destX;
    this.destY = destY;
    this.cx = cx || 0;
    this.cy = cy || 0;
    this.isCircle = isCircle;
    this.isKey = isKey;

    if (isCircle) {
      this.radius = r || 0 // getRandomInt(90, 220);
      this.oRadius = this.radius;
      this.angle = 0 // getRandomInt(0, 360)
    }

    this.att = angleToTarget({x, y}, {x: destX, y: destY});

    particles.push(this);
  }

  render(ctx: CanvasRenderingContext2D) {
    if (this.isCircle) {
      this.x = this.cx + this.radius * Math.cos(this.angle)
      this.y = this.cy + this.radius * Math.sin(this.angle)
      if (this.time === 0) {
        this.sX = this.x;
        this.sY = this.y;
      }
      if (this.angle > 2 * Math.PI) {
        this.carrying.forEach(c => {
          c.deleted = true;
        })

        this.deleted = true;
        return;
      }
      this.angle += .15
      this.time += 1;

      if (this.isKey) {
        const {tileLockedX, tileLockedY} = getTileLockedXY(this.x, this.y)
        const ct = getTileDataEntry(tileLockedX / TILE_WIDTH, tileLockedY / TILE_WIDTH);
        const critters = Object.values(ct.critters);
        if (critters.length) {
          critters.forEach((c: Animal) => {
            if (c.type === STRINGS.fly || c.type === STRINGS.frog) {
              c.carried = true;
              c.setCaught()
              this.carrying.push(c);
            }
          })
        }
        const degrees = this.angle * (300/Math.PI);
        if (
          this.radius === this.oRadius &&
          (
            (degrees > 35 && degrees < 55) ||
            (degrees > 125 && degrees < 140) ||
            (degrees > 215 && degrees < 235) ||
            (degrees > 305 && degrees < 325)
          )) {
          this.radius += 40;
        } else if (
          this.radius !== this.oRadius &&
          (
            (degrees < 35 || degrees > 55) &&
            (degrees < 125 || degrees > 140) &&
            (degrees < 215 || degrees > 235) &&
            (degrees < 305 || degrees > 325)
          )
        ) {
          this.radius = this.oRadius;
        }
        
        this.carrying.forEach(c => {
          c.x = this.x;
          c.y = this.y;
        })
      }
      // console.log(Math.round(this.x), Math.round(this.y), this.angle);
    } else {
      // ctx.fillRect(this.destX - 10, this.destY - 10, 20, 20);
      if(hitTest(this, {x: this.destX - 10, y: this.destY - 10, width: 25, height: 25})) {
        this.deleted = true;
        return;
      }

      const {x, y} = movePoint(this, this.att, this.speed);
      this.x = x;
      this.y = y;      
    }
    
    ctx.fillStyle = '#dedede';
    ctx.fillRect(this.x, this.y, 6, 6);

  }
}

export class TileCoveringTower extends PlacedTower {
  constructor(x: number, y: number, tilesCovered: number[]) {
    super(x, y);
    this.coveredTiles = []
    let tiles = tilesCovered;

    for(let i = 0;i<tiles.length;i+=2)  {
      const {tileLockedX, tileLockedY} = getTileLockedXY(this.x + (tiles[i] * TILE_WIDTH), this.y + (tiles[i+1] * TILE_WIDTH));
      const td = TILE_DATA_OBJ[`${tileLockedX / TILE_WIDTH},${tileLockedY/TILE_WIDTH}`]
      if (td) {
        this.coveredTiles.push(td)
        td.towersCoveringTile.push(this);
      }
    }
  }
}

class Catcher extends Entity {
  constructor(x: number, y: number) {
    super(x, y);

    this.sprite = sprites[STRINGS.catcher]();
    catchers.push(this);
  }

  render(ctx: CanvasRenderingContext2D): void {
    this.sprite?.draw(ctx, this.x, this.y, TOWER_WIDTH * .5, TOWER_WIDTH * .5);
  }
}

class NetTower extends TileCoveringTower {
  cX: number;
  cY: number;
  swipeTime: number = 0;
  keyPoints: Record<string, TileData> = {};

  constructor(x: number, y: number) {
    super(x, y, getSquareTilesCovered(-3, 6));
    this.sprite = sprites[STRINGS.net]();
    this.cX = this.x + TILE_WIDTH * 1.5;
    this.cY = this.y + TILE_WIDTH * 1.5;
    // new Catcher(this.x + TOWER_WIDTH, this.y + TOWER_WIDTH)
    this.coveredTiles.forEach((tile) => {
      if (
        this.y + TILE_WIDTH <= tile.y * TILE_WIDTH &&
        this.y + (TILE_WIDTH * 2) > tile.y * TILE_WIDTH &&
        this.x + TOWER_WIDTH <= tile.x * TILE_WIDTH
      ) {
        this.keyPoints[`${tile.x},${tile.y}`] = tile;
      }
    })
  }

  render(ctx: CanvasRenderingContext2D) {
    super.render(ctx);

    if (this.swipeTime % 180 === 0) {
      this.coveredTiles.forEach((tile) => {
        let isKey = false;
        let  r = getRandomInt(90, 220);
        if (this.keyPoints[`${tile.x},${tile.y}`]) {
          isKey = true;
        r = 
          tile.x * TILE_WIDTH === this.x + TOWER_WIDTH ? 124 :
          tile.x * TILE_WIDTH === this.x + TOWER_WIDTH + TILE_WIDTH ? 174 : 224
        }
        new Particle(
          tile.x * TILE_WIDTH + 25,
          tile.y * TILE_WIDTH,
          this.x * TILE_WIDTH * 1.5,
          this.y * TILE_WIDTH * 1.5,
          true, this.cX, this.cY, r, isKey);
        // ctx.fillRect(tile.x * TILE_WIDTH, tile.y * TILE_WIDTH, TILE_WIDTH, TILE_WIDTH);
        // i === 1 ? new Particle(tile.x * TILE_WIDTH, tile.y * TILE_WIDTH, this.x * TILE_WIDTH * 1.5, this.y * TILE_WIDTH * 1.5, true, cx, cy) : null;
      })

      this.keyPoints
    }
    // Debugging:
    // this.coveredTiles.forEach(tile => {
    //   ctx.fillStyle = 'rgba(255, 255, 255, .25)'
    //   ctx.fillRect(tile.x * TILE_WIDTH, tile.y * TILE_WIDTH, TILE_WIDTH, TILE_WIDTH);
    // })
    ++this.swipeTime;
  }
}

class FanTower extends TileCoveringTower {
  static CoveredTiles = [
    1,-1,1,-2,1,-3,
    3,1,4,1,5,1,
    1,3,1,4,1,5,
    -1,1,-2,1,-3,1
  ];
  tick = 0;

  constructor(x: number, y: number) {
    super(x, y, FanTower.CoveredTiles);
    this.sprite = sprites[STRINGS.fan]();
  }

  render(ctx: CanvasRenderingContext2D) {
    super.render(ctx);
    if (++this.tick % 30 === 0) {
    
      const destX = this.x + TILE_WIDTH * 1.5;
      const destY = this.y + TILE_WIDTH * 1.5;
      
      this.coveredTiles.forEach(tile => {
        const amt = getRandomInt(2, 4);
        for (let i = 0;i < amt;i++) {
          new Particle(
            destX,
            destY,
            getRandomInt(tile.x * TILE_WIDTH, tile.x * TILE_WIDTH + TILE_WIDTH),
            getRandomInt(tile.y * TILE_WIDTH, tile.y * TILE_WIDTH + TILE_WIDTH),
          );
        }

        Object.values(tile?.critters).forEach(critter => {
          if ((critter as Critter).type !== STRINGS.snake && !critter.blown) {
            (critter as Critter).blownBack();
          }
        })
      })
    }

    // Debugging:
    // this.coveredTiles.forEach(tile => {
    //   ctx.fillRect(tile.x * TILE_WIDTH, tile.y * TILE_WIDTH, TILE_WIDTH, TILE_WIDTH);
    // })
  }
}

class VaccuumTower extends TileCoveringTower {
  static CoveredTiles = [
    0,0,-1,-1,-2,-2,-3,-3,
    2,2,3,3,4,4,5,5,
    0,2,-1,3,-2,4,-3,5,
    2,0,3,-1,4,-2,5,-3
  ];
  tick = 0;

  constructor(x: number, y: number) {
    super(x, y, VaccuumTower.CoveredTiles);
    this.sprite = sprites[STRINGS.vaccuum]();
  }

  render(ctx: CanvasRenderingContext2D) {
    super.render(ctx);
    
    if (++this.tick % 120 === 0) {
      const destX = this.x + TILE_WIDTH * 1.5;
      const destY = this.y + TILE_WIDTH * 1.5;

      this.coveredTiles.forEach(tile => {
        const amt = getRandomInt(2, 4);
        for (let i = 0;i < amt;i++) {
          new Particle(
            getRandomInt(tile.x * TILE_WIDTH, tile.x * TILE_WIDTH + TILE_WIDTH),
            getRandomInt(tile.y * TILE_WIDTH, tile.y * TILE_WIDTH + TILE_WIDTH),
            destX,
            destY
          );
        }

        Object.values(tile?.critters).forEach(critter => {
          critter.setCaught();
          critter.destX = destX;
          critter.destY = destY;
          critter.getForcedDirection();
        })
      })
    }

    // Debugging:
    // this.coveredTiles.forEach(tile => {
    //   ctx.fillStyle = 'rgba(255, 255, 255, .25)'
    //   ctx.fillRect(tile.x * TILE_WIDTH, tile.y * TILE_WIDTH, TILE_WIDTH, TILE_WIDTH);
    // })
  }
}


class CatCatchingTower extends TileCoveringTower {
  maxCats;
  caughtCats: Cat[] = [];

  constructor(x: number, y: number, maxCats: number) {
    super(x, y, getSquareTilesCovered(-2, 5))
    this.maxCats = maxCats;
  }

  catch(c: Cat) {
    this.caughtCats.push(c);
  }

  release() {
    this.caughtCats.forEach(c => {
      c.distracted = false;
    })
  }
}

class ScratchTower extends CatCatchingTower {
  constructor(x: number, y: number) {
    super(x, y, 4);
    this.sprite = sprites[STRINGS.scratch]();
  }
}

class FishTower extends CatCatchingTower {
  constructor(x: number, y: number) {
    super(x, y, 1);
    this.sprite = sprites[STRINGS.fish]();
  }
}

enum FetcherStates {
  chasing,
  waiting,
  fetching,
}

class Fetcher extends Entity {
  chaseSpeed = 4;
  carrySpeed = 2;
  parent: PlacedTower;
  chasing?: Critter;
  state: FetcherStates = FetcherStates.waiting;

  constructor(parent: PlacedTower) {
    super(-100, -100, 0, 0, 30, 30, LAYERS.fetchers);

    this.parent = parent;
    this.sprite = sprites[STRINGS.fetcher]();
    this.x = getRandomInt(parent.x, parent.x + parent.width - this.width);
    this.y = getRandomInt(parent.y, parent.y + parent.width - this.height);

    fetchers.push(this);
  }

  search() {
    for (const t of this.parent.coveredTiles) {
      // All covered tiles
      const critters = Object.entries(t.critters);
      if (critters.length) {
        for (const c of critters) {
          if (!c[1].chased && !c[1].caught && !c[1].flying) {
            const [key, critter] = critters[0];
            delete t.critters[key];
            this.chasing = critter as Critter;
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
        const {x: cX, y: cY} = movePoint(this, chaseAngle, this.chaseSpeed);
        this.x = cX;
        this.y = cY;

        if (hitTest(this, this.chasing!)) {
          this.chasing!.setCarried();
          this.state = FetcherStates.fetching;
        }
        break;
      case FetcherStates.fetching:
        if (this.destX === 0) {
          this.destX = getRandomInt(this.parent.x + this.width, this.parent.x + this.parent.width - this.width);
          this.destY = getRandomInt(this.parent.y + this.width, this.parent.y + this.parent.height - this.height);
        }

        const fetchAngle = angleToTarget(this, {x: this.destX, y: this.destY});
        const {x: fX, y: fY} = movePoint(this, fetchAngle, this.carrySpeed);
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
    menus.push(this);
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
    ctx.fillText(`Towers`, MENU_START_X, MENU_TOWER_START_Y - TOWER_WIDTH)

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
    ctx.fillText(`- Cant catch flying`, sx, sy(1.5))
    ctx.fillText(`- $ 500`, sx, sy(2.5))

    ctx.fillText(`- Blows critters back`, sx, sy(5.5))
    ctx.fillText(`- Cant blow snakes`, sx, sy(6.5))
    ctx.fillText(`- $ 500`, sx, sy(7.5))

    ctx.fillText(`- Slow`, sx, sy(10.5))
    ctx.fillText(`- Covers many angles`, sx, sy(11.5))
    ctx.fillText(`- $ 500`, sx, sy(12.5))

    ctx.fillText(`- Very Slow`, sx, sy(15.5))
    ctx.fillText(`- Catches flies & frogs`, sx, sy(16.5))
    ctx.fillText(`- $ 500`, sx, sy(17.5))

    ctx.fillText(`- Distract 1 Black Cat`, sx, sy(20.5))
    ctx.fillText(`- $ 100`, sx, sy(21.5))

    ctx.fillText(`- Distract 4 Black Cats`, sx, sy(25.5))
    ctx.fillText(`- $ 350`, sx, sy(26.5))
  }
}

// All entities
export const entities: Entity[] = [];
export const critters: Critter[] = [];
export const cats: Cat[] = [];
export const towers: PlacedTower[] = [];
export const menuTowers: MenuTower[] = [];
export const fetchers: Fetcher[] = [];
export const menus: Menu[] = [];
export const particles: Particle[] = [];
export const catchers: Catcher[] = [];
