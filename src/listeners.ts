import { hitTest, setMouseTile, setScale } from "./utils";

export function registerListeners(overlayCanvas: HTMLCanvasElement) {
  overlayCanvas.addEventListener('mousedown', (_: MouseEvent) => {
    // const { canvasX, canvasY } = translateXYMouseToCanvas(e.pageX, e.pageY);
    hitTest();
  })

  // overlayCanvas.addEventListener('mouseup', () => {
  //   console.log('UP');
  // })

  overlayCanvas.addEventListener('mousemove', (e: MouseEvent) => {
    setMouseTile(e.pageX, e.pageY);
  })
}

window.addEventListener('resize', () => {
  setScale();
})

document.addEventListener('DOMContentLoaded', () => {
  setScale();
})
