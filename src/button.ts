import { WIDTH } from "./constants";
import { Entity } from "./entity";
import { gameState, SCENES } from "./gameState";
import { hitTest, mouseTile, setFont } from "./utils";

export class Button extends Entity {
  text: string;
  removeOnClick: boolean;
  listening: boolean = false;
  callback: () => void;
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
    this.eventCallback = this.hitTest.bind(this)

    this.addListener();
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
    if (hitTest(this, {x: mouseTile.x, y: mouseTile.y, width: 1, height: 1})) {
      console.log('Click')
      this.runCallback();
    }
  }

  runCallback() {
    this.removeListener();
    this.callback();
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
  WIDTH * .5 - 200,
  1500,
  400,
  150,
  'START', () => {
    selectWave.removeListener(true);
    console.log('click'); gameState.state = SCENES.playing 
    setTimeout(() => {
      gameState.state = SCENES.dialog;
    }, 500)
})

export const selectWave = new Button(
  WIDTH * .5 - 800,
  1500,
  500,
  150,
  'WAVE 1',
  () => {
    for(let i = 1;i <= gameState.waves;i++) {
        const add = i > 9 ? 50 * (i - 9 - .5) : 0;
      const xOffset = 200 * (i - 1);
      const x = -550 + selectWave.x + xOffset + add;
      gameState.waveSelectBtns.push(new Button(x, selectWave.y - 200, 150, 150, `${i}`, () => {
        gameState.wave = i;
        gameState.waveSelectBtns.forEach(e => e.setDeleted());
      }));
    }
  },
  false
)

export const okButton = new Button(1650, 1100, 200, 100, 'Okay',
  () => {
      gameState.state = SCENES.playing;
    }
)

export const cancelButton = new Button(450, 1100, 200, 100, 'Cancel',
  () => {
      gameState.state = SCENES.playing;
    }
)

okButton.font = 50;
cancelButton.font = 50;
