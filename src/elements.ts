const mapCanvas = document.querySelector('#mc') as HTMLCanvasElement;
const mapCtx = mapCanvas.getContext('2d') as CanvasRenderingContext2D;
const canvas = document.querySelector('#gc') as HTMLCanvasElement;
const ctx = canvas.getContext('2d') as CanvasRenderingContext2D;
// const overlayCanvas = document.querySelector('#oc') as HTMLCanvasElement;
// const overlayCtx = overlayCanvas.getContext('2d') as CanvasRenderingContext2D;

export {
  mapCtx, ctx, canvas
}
