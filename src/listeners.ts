import { hitTest, setMouseTile, setScale, translateXYMouseToCanvas } from "./utils";

export function registerListeners(overlayCanvas: HTMLCanvasElement) {
  overlayCanvas.addEventListener('mousedown', (e: MouseEvent) => {
    console.log('DOWN');
    const { canvasX, canvasY } = translateXYMouseToCanvas(e.pageX, e.pageY);
    hitTest(canvasX, canvasY);
  })

  overlayCanvas.addEventListener('mouseup', () => {
    console.log('UP');
  })

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
