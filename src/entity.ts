import { TILE_WIDTH, type Tile, HEIGHT, MENU_START_X, LAYERS, COLOR_MENU_GREEN_1, COLOR_MENU_GREEN_2, TOWER_WIDTH, MENU_TOWER_START_Y, STRINGS, MENU_TOWER_Y_OFFSET, TOWER_COST, WIDTH, DEBUG, CURSE_DURATION, MENU_TITLE_FONT, MENU_HEADER_FONT, MENU_DETAIL_FONT, DETAIL_START_X } from "./constants";
import { gameState, SCENES } from "./gameState";
import { getTileDataEntry, getTileDataKey, TILE_DATA_OBJ, TileData } from "./maps";
import { sounds } from "./sounds";
import { Sprite, sprites } from "./sprites";
import { angleToTarget, canAffordTower, clearTouch, convertCanvasXYToPathXY, convertTileToMapBounds, getExpanededDraggingTileBounds, getLocalStorageWaveData, getPriceForAffordability, getRandomInt, getTileLockedXY, hitTest, mouseTile, movePoint, setFont, translateXYMouseToCanvas } from "./utils";

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

  render() {};
}

export class Witch extends Entity {
  constructor(preventPush = false) {
    const [x, y] = gameState.waveData.path[gameState.waveData.path.length - 1];
    super((x - 4) * TILE_WIDTH + 20, (y - 4) * TILE_WIDTH + 20)
    this.sprite = sprites[STRINGS.witch]();
    if (!preventPush) {
      witches.push(this);
    }
  }

  render(x?:number,y?:number,width?:number,height?:number): void {
    this.sprite?.draw(gameState.ctx, x || this.x, y || this.y, width || TILE_WIDTH * 3, height || TILE_WIDTH * 5)
  }
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
    this.moveDir = getDirectionFromTo(gameState.waveData.path[this.pathIndex], gameState.waveData.path[this.nextPathIndex]);
    // this.moveDir = angleToTarget()
    
    const { directionalMinX, directionalMaxX, directionalMaxY, directionalMinY } = convertTileToMapBounds(gameState.waveData.path[this.pathIndex], this.moveDir);
    
    this.x = getRandomInt(directionalMinX, directionalMaxX - this.width);
    this.y = getRandomInt(directionalMinY, directionalMaxY - this.height);
    this.getNextDirection();
  }

  get currentSpeed() {
    return gameState.waveData.critterSpeed || this.baseSpeed;
  }

  get nextPathIndex() { return this.pathIndex + 1 }

  getNextDirection() {
      const { directionalMinX, directionalMaxX, directionalMinY, directionalMaxY } = convertTileToMapBounds(gameState.waveData.path[this.nextPathIndex], this.moveDir);
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
    new Cash(this.x, this.y);
    gameState.cash += 10;
    this.caught = true;
    this.removeAutonomy();
  }

  removeAutonomy() {
    this.layer = LAYERS.fetchersCarry;
    this.dx = 0;
    this.dy = 0;
    this.removeFromTile();
  }

  restoreAutonomy() {
    this.chased = false;
    this.caught = false;
    this.distracted = false;
    this.carried = false;
    this.getNextDirection();
  }

  getForcedDirection() {
      this.att = angleToTarget({x: this.x, y: this.y}, {x: this.destX, y: this.destY});
  }

  get canMove() {
    return !this.caught && !this.carried;
  }

  render() {
    if (this.canMove) {
      const {x, y} = movePoint(this, this.att, this.speed);
      this.x = x;
      this.y = y;

      if (hitTest(this, {x: this.destX - 5, y: this.destY - 5, width: 10, height: 10}) ||
        (this.blown && hitTest(this, {x: this.destX - 15, y: this.destY - 15, width: 30, height: 30}))
      ) {
        this.blown = false;
        this.speed = this.currentSpeed;

        if (this.distracted) {
          return;
        }

        this.pathIndex += 1;
        
        if (!gameState.waveData.path[this.nextPathIndex + 1] || this.caught) {
          if (!this.caught) {
            sounds.bad();
            if (!this.type) {
              gameState.addEscaped(10)
            } else {
              gameState.addEscaped(1)
            }
          }
          this.deleted = true;

          return;
        }

        this.moveDir = getDirectionFromTo(gameState.waveData.path[this.pathIndex], gameState.waveData.path[this.nextPathIndex]);
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

    this.sprite?.draw(gameState.ctx, this.x - 25, this.y - 25, 50, 50, this.carried || (this.caught && !this.distracted));
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

    const rng = getRandomInt(0, gameState.waveData.allowedCritters.length - 1);
    const type = gameState.waveData.allowedCritters[rng];

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
    const blowback = this.flying ? 4 : 3
    this.blown = true;
    this.speed = 6;
    this.pathIndex = this.pathIndex < blowback ? 0 : this.pathIndex -= blowback;
    this.getNextDirection();
  }

  get canMove() {
    return !this.carried && !this.deleted;
  }

  override render() {
    super.render();

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
    sounds.hiss();
  }

  override get currentSpeed() {
    return gameState.waveData.catSpeed || this.baseSpeed;
  }

  override get canMove(): boolean {
    return !this.playing;
  }

  restoreAutonomy(): void {
    this.playing = false;
    super.restoreAutonomy();
  }

  override render() {
    super.render();

    if (!this.distracted) {
      const nonCatTowers: PlacedTower[] = [];
      const catTowers: CatCatchingTower[] = [];
      this.currentTile?.towersCoveringTile.forEach(t => {
        if (t.sprite?.type === STRINGS.scratch || t.sprite?.type === STRINGS.fish) {
          catTowers.push(t as CatCatchingTower);
        } else if (!t.cursed) {
          nonCatTowers.push(t);
          t.curse();
        }
      })
      // const catTowers = (this.currentTile?.towersCoveringTile as CatCatchingTower[])?.filter(t => t.sprite?.type === STRINGS.scratch || t.sprite?.type === STRINGS.fish)!;
      if (catTowers) {
        for (const tower of catTowers) {
          if (tower.caughtCats.length < tower.maxCats) {
            this.caughtBy = tower;
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
  cost: number = 0;

  constructor(x: number, y: number, layer = LAYERS.towers) {
    super(x, y, 0, 0, TOWER_WIDTH, TOWER_WIDTH, layer)
  }

  override render() {
    this.sprite?.draw(gameState.ctx, this.x, this.y, TOWER_WIDTH)
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
    this.cost = TOWER_COST[key as keyof typeof TOWER_COST];

    window.addEventListener('mousedown', this.dragHandler.bind(this));
    window.addEventListener('touchstart', this.touchHandler.bind(this));
    window.addEventListener('mouseup', this.releaseHandler.bind(this));
    window.addEventListener('touchend', this.touchEndHandler.bind(this));

    menuTowers.push(this);
  }

  _isValidPlacement = true;

  override render() {
    if (!gameState.waveData.allowedTowers.includes(this.sprite?.type || '')) {
      return;
    }
    super.render();

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
        gameState.ctx.fillStyle = "rgba(140, 243, 248, 0.33)";
      } else {
        gameState.ctx.fillStyle = "rgba(255, 0, 0, .33)";
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
          gameState.ctx?.fillRect(tileLockedX - (TILE_WIDTH) + xDiff, tileLockedY - (TILE_WIDTH) + yDiff, TILE_WIDTH, TILE_WIDTH)
        }
      } else if (this.sprite?.type === 'net') {
        gameState.ctx?.fillRect(mouseTile.x - (TOWER_WIDTH + TILE_WIDTH), mouseTile.y - (TOWER_WIDTH + TILE_WIDTH), TILE_WIDTH * 9, TILE_WIDTH * 9)
        gameState.ctx?.clearRect(mouseTile.x - TILE_WIDTH, mouseTile.y - TILE_WIDTH, TILE_WIDTH * 3, TILE_WIDTH * 3)
      } else {
        // Draw "valid" range for tower
        gameState.ctx?.fillRect(mouseTile.x - (TOWER_WIDTH), mouseTile.y - (TOWER_WIDTH), TILE_WIDTH * 7, TILE_WIDTH * 7)
        gameState.ctx?.clearRect(mouseTile.x - TILE_WIDTH, mouseTile.y - TILE_WIDTH, TILE_WIDTH * 3, TILE_WIDTH * 3)
      }

      // Draw tower
      this.sprite?.draw(gameState.ctx, mouseTile.x - TILE_WIDTH, mouseTile.y - TILE_WIDTH, TOWER_WIDTH);
    }
  }

  dragHandler(e: MouseEvent) {
    const { canvasX, canvasY } = translateXYMouseToCanvas(e.pageX, e.pageY);

    if (
      !this.dragging &&
      (canAffordTower(this.cost) || DEBUG.ignoreTowerCost) &&
      gameState.state === SCENES.playing
    ) {
      if (this.x < canvasX && this.x + this.width > canvasX && this.y < canvasY && this.y + this.height > canvasY) {
        this.dragging = true;
      }
    }
  }

  touchHandler(e: TouchEvent) {
    if (e.targetTouches.length === 1) {
      const t = e.targetTouches[0];
      this.dragHandler(t as unknown as MouseEvent);
    }
  }

  touchEndHandler() {
    clearTouch();
    this.releaseHandler();
  }

  releaseHandler() {
    if (this.dragging) {
      this.dragging = false;
      if (gameState.dialogShowing) {
        return;
      }
      sounds.placement();
      if (this._isValidPlacement) {
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

export class PlacedTower extends BaseTower {
  coveredTiles: Array<TileData> = [];
  cursed?: Sprite;
  cursedAt: number = 0;

  constructor(x: number, y: number, type: string) {
    super(x, y);

    this.cost = TOWER_COST[type as keyof typeof TOWER_COST];
    gameState.cash -= this.cost;

    const { pathX, pathY } = convertCanvasXYToPathXY(x, y);

    for (let x = pathX;x <= pathX + 2;x++) {
      for (let y = pathY;y <= pathY + 2;y++) {
        const tileData = getTileDataEntry(x, y);
        tileData.addOccupyingTower(this);
      }
    }

    towers.push(this);
  }

  override render() {
    super.render();
    if (this.cursed && this.cursedAt < gameState.gameTime - CURSE_DURATION) {
      this.unCurse();
    } else if (this.cursed) {
      this.cursed.draw(gameState.ctx, this.x, this.y, this.width, this.height);
    }
  }

  curse() {
    this.cursed = sprites[STRINGS.curse]();
    this.cursedAt = gameState.gameTime;
  }

  unCurse() {
    this.cursed = undefined;
  }

  remove() {
    this.deleted = true;
    this.coveredTiles.forEach(tile => {
      tile.towersCoveringTile = tile.towersCoveringTile.filter(t => !t.deleted);
    })
    // const {tileLockedX, tileLockedY} = getTileLockedXY(this.x, this.y);
    const {pathX, pathY} = convertCanvasXYToPathXY(this.x, this.y);
    for(let x = pathX;x <=pathX+2;x++) {
      for(let y = pathY;y <= pathY+2;y++) {
        const t = TILE_DATA_OBJ[ getTileDataKey(x, y) ];
        if (t) {
          t.removeOccupyingTower();
        }
      }
    }
  }

  sell() {
    this.remove();
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

  render() {
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
        if (ct) {
          const critters = Object.values(ct.critters);
          if (critters.length) {
            critters.forEach((c: Animal) => {
              if (c.type === STRINGS.fly || c.type === STRINGS.frog) {
                c.carried = true;
                c.setCaught();
                this.carrying.push(c);
              }
            })
          }
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
    
    gameState.ctx.fillStyle = '#dedede';
    gameState.ctx.fillRect(this.x, this.y, 6, 6);

  }
}

export class Cash extends Entity {
  lifespan: number = 0;
  opacity: number = 1;

  constructor(x: number, y: number) {
    super(x, y);
    cashes.push(this);
  }

  render() {
    setFont(30);
    gameState.ctx.fillStyle = `rgba(255, 255, 255, ${this.opacity})`;
    gameState.ctx.fillText('$', this.x, this.y);

    if (this.lifespan > 30) {
      this.opacity -= .01;
    }
    if (this.opacity <= 0) {
      this.deleted = true;
    }

    this.y -= 1;
    this.lifespan++;
  }
}

export class TileCoveringTower extends PlacedTower {
  constructor(x: number, y: number, tilesCovered: number[], type: string) {
    super(x, y, type);
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
    this.coveredTiles.sort((a, b) => b.pathIndex! - a.pathIndex!)
  }
}

// class Catcher extends Entity {
//   constructor(x: number, y: number) {
//     super(x, y);

//     this.sprite = sprites[STRINGS.catcher]();
//     catchers.push(this);
//   }

//   render(): void {
//     this.sprite?.draw(gameState.ctx, this.x, this.y, TOWER_WIDTH * .5, TOWER_WIDTH * .5);
//   }
// }

class FetcherTower extends TileCoveringTower {
  fetchers: Array<Fetcher> = [];

  constructor(x: number, y: number) {
    super(x, y, getSquareTilesCovered(-2, 5), STRINGS.kid);

    this.sprite = sprites[STRINGS.kid]();

    this.fetchers.push(...[
      new Fetcher(this),
      new Fetcher(this),
      // new Fetcher(this),
    ])
  }

  remove(): void {
    this.fetchers.forEach(f => f.remove());
    super.remove();
  }

  sell() {
    this.fetchers.forEach(f => f.remove());
    super.sell();
  }
}

class NetTower extends TileCoveringTower {
  cX: number;
  cY: number;
  swipeTime: number = 0;
  keyPoints: Record<string, TileData> = {};

  constructor(x: number, y: number) {
    super(x, y, getSquareTilesCovered(-3, 6), STRINGS.net);

    this.sprite = sprites[STRINGS.net]();
    this.cX = this.x + TILE_WIDTH * 1.5;
    this.cY = this.y + TILE_WIDTH * 1.5;
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

  render() {
    super.render();

    if (this.cursed) {
      ++this.swipeTime;

      return;
    }

    if (this.swipeTime % 180 === 0) {
      sounds.swipe();
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
    super(x, y, FanTower.CoveredTiles, STRINGS.fan);
    this.sprite = sprites[STRINGS.fan]();
  }

  render() {
    super.render();

    if (this.cursed) {
      ++this.tick;
      
      return;
    }

    if (++this.tick % 30 === 0) {
      sounds.fan();
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
          const c = critter as Critter;
          if (c.type && c.type !== STRINGS.cat && c.type !== STRINGS.snake && !c.blown && !c.caught) {
            c.blownBack();
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
    -1,-1,-2,-2,-3,-3,
    3,3,4,4,5,5,
    -1,3,-2,4,-3,5,
    3,-1,4,-2,5,-3
  ];
  tick = 0;

  constructor(x: number, y: number) {
    super(x, y, VaccuumTower.CoveredTiles, STRINGS.vaccuum);
    this.sprite = sprites[STRINGS.vaccuum]();
  }

  render() {
    super.render();

    if (this.cursed) {
      ++this.tick;
      return;
    }
    
    if (++this.tick % 60 === 0) {
      sounds.vaccuum();
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
          if (critter.type) {
            critter.setCaught();
            critter.destX = destX;
            critter.destY = destY;
            critter.getForcedDirection();
          }
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

  constructor(x: number, y: number, maxCats: number, type: string) {
    super(x, y, getSquareTilesCovered(-2, 5), type)
    this.maxCats = maxCats;
  }

  catch(c: Cat) {
    this.caughtCats.push(c);
  }

  release() {
    this.caughtCats.forEach(c => {
      c.restoreAutonomy();
    })
  }

  sell() {
    this.release();
    super.sell();
  }
}

class ScratchTower extends CatCatchingTower {
  constructor(x: number, y: number) {
    super(x, y, 4, STRINGS.scratch);
    this.sprite = sprites[STRINGS.scratch]();
  }
}

class FishTower extends CatCatchingTower {
  constructor(x: number, y: number) {
    super(x, y, 1, STRINGS.fish);
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
  curse: Sprite;

  constructor(parent: PlacedTower) {
    super(-100, -100, 0, 0, 30, 30, LAYERS.fetchers);

    this.parent = parent;
    this.sprite = sprites[STRINGS.fetcher]();
    this.x = getRandomInt(parent.x, parent.x + parent.width - this.width);
    this.y = getRandomInt(parent.y, parent.y + parent.width - this.height);

    fetchers.push(this);
    this.curse = sprites[STRINGS.curse]();
  }

  remove() {
    if (this.state === FetcherStates.fetching || this.chasing) {
      this.chasing?.restoreAutonomy();
    }
    this.state = FetcherStates.waiting;
    this.deleted = true;
  }

  search() {
    for (const t of this.parent.coveredTiles) {
      // All covered tiles
      const critters = Object.entries(t.critters);
      if (critters.length) {
        let i = 0;
        for (const c of critters) {
          if (!c[1].chased && !c[1].caught && !c[1].flying) {
            const [key, critter] = critters[i];
            delete t.critters[key];
            this.chasing = critter as Critter;
            critter.chased = true;
            this.state = FetcherStates.chasing;
            break;
          }
          i++
        }
      }
      if (this.state === FetcherStates.chasing) {
        break;
      }
    }
  }

  override render() {
    if (!this.parent.cursed) {
      switch (this.state) {
        case FetcherStates.chasing:
          // Thing we are chasing is no longer chasable
          if (this.chasing?.deleted || this.chasing?.distracted) {
            this.chasing = undefined;
            this.state = FetcherStates.waiting;
            this.search();
            break;
          }

          const chaseAngle = angleToTarget(this, this.chasing!);
          const {x: cX, y: cY} = movePoint(this, chaseAngle, this.chaseSpeed);
          this.x = cX;
          this.y = cY;

          if (hitTest(this, this.chasing!) && this.chasing?.type) {
            this.chasing!.setCarried();
            sounds.catch();
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
            this.chasing!.setCaught();
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
    }

    switch (this.state) {
      case FetcherStates.chasing:
      case FetcherStates.fetching:
        this.sprite?.draw(gameState.ctx, this.x, this.y, TILE_WIDTH, TILE_WIDTH)
        break;
      case FetcherStates.waiting:
      default:
        this.sprite?.draw(gameState.ctx, this.x, this.y, TILE_WIDTH, TILE_WIDTH, true)
        // ctx.drawImage(gameState.image!, 0, 40, 10, 10, this.x, this.y, TILE_WIDTH, TILE_WIDTH)
        break;
    }

    if (this.parent.cursed) {
      this.curse.draw(gameState.ctx, this.x, this.y, TILE_WIDTH, TILE_WIDTH);
    }
  }
}

function addMenuTowers() {
  const towers = [
    STRINGS.kid,
    STRINGS.net,
    STRINGS.vaccuum,
    STRINGS.fan,
    STRINGS.fish,
    STRINGS.scratch
  ];

  towers.forEach((key, i) => {
    const towerX = MENU_START_X;
    const towerY = MENU_TOWER_Y_OFFSET + MENU_TOWER_START_Y + (TILE_WIDTH * i * 5)

    new MenuTower(towerX, towerY, key);
  })
}

export class Menu extends Entity {
  constructor() {
    super(MENU_START_X, 0, 0, 0, TILE_WIDTH * 12, HEIGHT, LAYERS.menu);
    menus.push(this);
    addMenuTowers();
  }

  override render(): void {
    const ctx = gameState.ctx
    ctx.textAlign = 'left';
    ctx.textBaseline = 'middle';

    ctx.fillStyle = COLOR_MENU_GREEN_1;
    ctx.fillRect(MENU_START_X, 0, this.width, this.height);
    ctx.fillStyle = COLOR_MENU_GREEN_2;
    ctx.fillRect(MENU_START_X - (TILE_WIDTH * 2), 0, TILE_WIDTH, this.height);
    ctx.fillStyle = COLOR_MENU_GREEN_1;
    ctx.fillRect(MENU_START_X - TILE_WIDTH, 0, TILE_WIDTH, this.height);

    ctx.fillStyle = 'white';
    setFont(MENU_HEADER_FONT);
    const esc = gameState.escaped > gameState.waveData.lives ? gameState.waveData.lives : gameState.escaped
    ctx.fillText(`${esc} / ${gameState.waveData.lives} Critters`, MENU_START_X, 100)
    // ctx.fillText('100', MENU_START_X + 480, 100)
    setFont(MENU_TITLE_FONT);
    ctx.strokeStyle = 'white'
    ctx.fillText('Witches Cauldron', MENU_START_X, 50)
    ctx.strokeRect(MENU_START_X, 125, 550, 50);
    ctx.fillRect(MENU_START_X, 125, 550 * (esc / gameState.waveData.lives), 50);

    // setFont(50)

    ctx.fillText(`Wave: ${gameState.wave} / 13`, MENU_START_X, 240)

    ctx.fillText(`Cash: $${gameState.cash}`, MENU_START_X, 330)

    const sy = (mod: number) => MENU_TOWER_Y_OFFSET + MENU_TOWER_START_Y + TILE_WIDTH * mod;
    const sx = DETAIL_START_X;
    let price = 0;

    ctx.fillText(`Towers`, MENU_START_X, sy(-2))

    if (gameState.waveData.allowedTowers.includes(STRINGS.kid)) {
      setFont(MENU_HEADER_FONT);
      ctx.fillText(`High-energy Kids`, MENU_START_X, sy(-.5))
      setFont(MENU_DETAIL_FONT);
      ctx.fillText(`Fast`, sx, sy(.5))
      ctx.fillText(`Cant catch flies`, sx, sy(1.5))
      price = TOWER_COST[STRINGS.kid];
      ctx.fillText(`${getPriceForAffordability(price)}`, sx, sy(2.5))
    }

    if (gameState.waveData.allowedTowers.includes(STRINGS.net)) {
      setFont(MENU_HEADER_FONT, 'white');
      ctx.fillText(`Guy with a Net`, MENU_START_X, sy(4.5))
      setFont(MENU_DETAIL_FONT);
      ctx.fillText(`Very Slow`, sx, sy(5.5))
      ctx.fillText(`Catch flies & frogs`, sx, sy(6.5))
      price = TOWER_COST[STRINGS.net];
      ctx.fillText(`${getPriceForAffordability(price)}`, sx, sy(7.5))
    }

    if (gameState.waveData.allowedTowers.includes(STRINGS.fan)) {
      setFont(MENU_HEADER_FONT, 'white');
      ctx.fillText(`Really Big Fans`, MENU_START_X, sy(14.5))
      setFont(MENU_DETAIL_FONT);
      ctx.fillText(`Blows critters back`, sx, sy(15.5))
      ctx.fillText(`Cant blow snakes`, sx, sy(16.5))
      price = TOWER_COST[STRINGS.fan];
      ctx.fillText(`${getPriceForAffordability(price)}`, sx, sy(17.5))
    }

    if (gameState.waveData.allowedTowers.includes(STRINGS.vaccuum)) {
      setFont(MENU_HEADER_FONT, 'white');
      ctx.fillText(`Powerful Vaccuums`, MENU_START_X, sy(9.5))
      setFont(MENU_DETAIL_FONT);
      ctx.fillText(`Slow`, sx, sy(10.5))
      ctx.fillText(`Cover many angles`, sx, sy(11.5))
      price = TOWER_COST[STRINGS.vaccuum];
      ctx.fillText(`${getPriceForAffordability(price)}`, sx, sy(12.5))
    }

    if (gameState.waveData.allowedTowers.includes(STRINGS.fish)) {
      setFont(MENU_HEADER_FONT, 'white');
      ctx.fillText(`Fish on a Stick`, MENU_START_X, sy(19.5))
      setFont(MENU_DETAIL_FONT);
      ctx.fillText(`Distract 1 Black Cat`, sx, sy(20.5))
      price = TOWER_COST[STRINGS.fish];
      ctx.fillText(`${getPriceForAffordability(price)}`, sx, sy(21.5))
    }

    if (gameState.waveData.allowedTowers.includes(STRINGS.scratch)) {
      setFont(MENU_HEADER_FONT, 'white');
      ctx.fillText(`Scratching Post`, MENU_START_X, sy(24.5))
      setFont(MENU_DETAIL_FONT);
      ctx.fillText(`Distract 4 Black Cat`, sx, sy(25.5))
      price = TOWER_COST[STRINGS.scratch];
      ctx.fillText(`${getPriceForAffordability(price)}`, sx, sy(26.5))    
    }
  }
}

export class Dialog extends Entity {
  hasRendered = false;
  openedAt: number = 0

  constructor() {
    super(0, 0);
  }

  render() {
    if (!this.hasRendered) {
      this.hasRendered = true;
      this.openedAt = Date.now();

      gameState.ctx.fillStyle = 'rgba(255, 255, 255, .25)'
      gameState.ctx.fillRect(0, 0, WIDTH, HEIGHT);
      gameState.ctx.fillStyle = COLOR_MENU_GREEN_1;
      gameState.ctx.strokeStyle = COLOR_MENU_GREEN_2;
      gameState.ctx.lineWidth = 50;
      gameState.ctx.fillRect(WIDTH * .5 - 500 - (WIDTH - MENU_START_X), HEIGHT * .5 - 450, 1500, 700);
      gameState.ctx.strokeRect(WIDTH * .5 - 525 - (WIDTH - MENU_START_X), HEIGHT * .5 - 475, 1550, 750);
      
      okButton.addListener();
      okButton.render();

      okButton.extraCallback = gameState.dialogCallback;

      if (gameState.dialogShowCancel) {
        cancelButton.addListener();
        cancelButton.render();
      }

      gameState.dialogText.forEach((str, i) => {
        setFont(45);
        gameState.ctx.textAlign = 'left'
        gameState.ctx.textBaseline = 'bottom'
        gameState.ctx.fillText(str, 450, 650 + (i * TILE_WIDTH))
      })
    }
  }
}

export class Button extends Entity {
  text: string;
  removeOnClick: boolean;
  listening: boolean = false;
  callback: () => void;
  extraCallback: () => void = () => {};
  eventCallback: () => void;
  font: number = 100;
  
  constructor(
    x: number,
    y: number,
    width: number,
    height: number,
    text: string,
    onclick: () => void,
    removeOnClick = true
  ) {
    super(x, y, 0, 0, width, height);
    
    this.text = text;
    this.callback = onclick;
    this.removeOnClick = removeOnClick;
    this.eventCallback = this.hitTest.bind(this);
  }

  render(dynamicText?: string) {
    super.render();

    if (dynamicText) {
      this.text = dynamicText
    }
    
    gameState.ctx.fillStyle = 'green'
    gameState.ctx.fillRect(this.x, this.y, this.width, this.height);

    gameState.ctx.fillStyle = 'white'
    gameState.ctx.strokeStyle = 'white'
    gameState.ctx.lineWidth = 5
    gameState.ctx.strokeRect(this.x, this.y, this.width, this.height);
    setFont(this.font);
    gameState.ctx.textAlign = 'center';
    gameState.ctx.textBaseline = 'middle';
    gameState.ctx.fillText(this.text, this.x + this.width * .5, this.y + this.height * .5, this.width)
  }

  hitTest() {
    if (dialog.hasRendered && gameState.mouseDownAt < dialog.openedAt) {
      return;
    }

    if (hitTest(this, {x: mouseTile.x, y: mouseTile.y, width: 1, height: 1})) {
      this.runCallback();
    }
  }

  runCallback() {
    this.removeListener();
    this.callback();
    this.extraCallback();
  }

  addListener() {
    if (!this.listening) {
      gameState.canvas.addEventListener('click', this.eventCallback)
      this.listening = true;
    }
  }

  removeListener(override = false) {
    if (override || this.removeOnClick) {
      gameState.canvas.removeEventListener('click', this.eventCallback);
      this.listening = false;
    }
  }

  setDeleted() {
    this.removeListener(true);
    this.deleted = true;
  }
}

export const startBtn = new Button(
  WIDTH * .5 + 100,
  1500,
  400,
  150,
  'START', () => {
    gameState.play();
    gameState.startWave();
    selectWave.removeListener(true);
    gameState.setState(SCENES.playing);
})

export const selectWave = new Button(
  WIDTH * .5 - 600,
  1500,
  500,
  150,
  'WAVE 1',
  () => {
    const btnWidth = gameState.waves < 6 ? 350 : gameState.waves < 10 ? 250 : 150
    const spacing = WIDTH / gameState.waves
    const spaceTaken = (spacing * (gameState.waves - 1)) + btnWidth
    const remainder = WIDTH - spaceTaken

    for(let i = 1;i <= gameState.waves;i++) {
      const xOffset = spacing * (i - 1);
      const x = remainder/2 + xOffset;

      for(let p = 0;p < 3;p++) {
        const waveStarData = getLocalStorageWaveData(i)
        const waveStars = waveStarData.stars;
        gameState.waveStars.push(
          new WaveStars(
            15 + x + 70 * p,
            selectWave.y - 225,
            p + 1 <= waveStars
          ));
      }

      const waveBtn = new Button(x, selectWave.y - 200, btnWidth, 150, `${i}`, () => {
        gameState.wave = i;
        gameState.waveSelectBtns.forEach(e => e.setDeleted());
        gameState.waveStars.forEach(s => s.deleted = true);
      })

      waveBtn.addListener();
      gameState.waveSelectBtns.push(waveBtn);
    }
  },
  false
)

export class WaveStars extends Entity {
  constructor(x: number, y: number, isFull: boolean) {
    super(x, y, 0, 0, 50, 50);
    this.sprite = isFull ? sprites[STRINGS.starFull]() : sprites[STRINGS.starEmpty]();
  }
  render() {
    gameState.ctx.fillStyle = 'green'
    gameState.ctx.fillRect(this.x - 10, this.y - 10, this.width + 20, this.width + 20);
    this.sprite?.draw(gameState.ctx, this.x, this.y, this.width)
  }
}

export const okButton = new Button(1650, 1100, 200, 100, 'Okay',
  () => {
      gameState.closeDialog();
      cancelButton.removeListener();
    }
)

export const cancelButton = new Button(450, 1100, 200, 100, 'Cancel',
  () => {
      gameState.closeDialog();
      okButton.removeListener();
    }
)

okButton.font = 50;
cancelButton.font = 50;

// All entities
export const dialog = new Dialog();
export const entities: Entity[] = [];
export const critters: Critter[] = [];
export const cats: Cat[] = [];
export const towers: PlacedTower[] = [];
export const menuTowers: MenuTower[] = [];
export const fetchers: Fetcher[] = [];
export const menus: Menu[] = [];
export const particles: Particle[] = [];
// export const catchers: Catcher[] = [];
export const witches: Witch[] = [];
export const cashes: Witch[] = [];
