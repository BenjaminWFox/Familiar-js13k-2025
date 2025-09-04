import { clearTouch, mouseHitTest, setMouseTile, setScale, touchHitTest } from "./utils";

export let hasMouseMoved = false;

export function registerListeners(canvas: HTMLCanvasElement) {
  canvas.addEventListener('mousedown', (_: MouseEvent) => {
    // const { canvasX, canvasY } = translateXYMouseToCanvas(e.pageX, e.pageY);
    mouseHitTest();
  })

  canvas.addEventListener('touchstart', (e: TouchEvent) => {
    // const { canvasX, canvasY } = translateXYMouseToCanvas(e.pageX, e.pageY);
    touchHitTest(e);
  })

  canvas.addEventListener('touchcancel', (e: TouchEvent) => {
    // const { canvasX, canvasY } = translateXYMouseToCanvas(e.pageX, e.pageY);
    if (e.targetTouches.length === 0) {
      clearTouch();
    }
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

  canvas.addEventListener('touchmove', (e: TouchEvent) => {
    if (!hasMouseMoved) {
      hasMouseMoved = true;
    }
    if (e.targetTouches.length === 1) {
      const t = e.targetTouches[0];
      setMouseTile(t.pageX, t.pageY);
    }
  })
}

window.addEventListener('resize', () => {
  setScale();
})

document.addEventListener('DOMContentLoaded', () => {
  setScale();
})
