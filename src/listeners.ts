import { mouseHitTest, setMouseTile, setScale } from "./utils";

export let hasMouseMoved = false;

export function registerListeners(canvas: HTMLCanvasElement) {
  canvas.addEventListener('mousedown', (_: MouseEvent) => {
    // const { canvasX, canvasY } = translateXYMouseToCanvas(e.pageX, e.pageY);
    mouseHitTest();
  })

  // overlayCanvas.addEventListener('mouseup', () => {
  //   console.log('UP');
  // })

  canvas.addEventListener('mousemove', (e: MouseEvent) => {
    if (!hasMouseMoved) {
      hasMouseMoved = true;
    }
    setMouseTile(e.pageX, e.pageY);
  })
}

window.addEventListener('resize', () => {
  setScale();
})

document.addEventListener('DOMContentLoaded', () => {
  setScale();
})
