const TOTAL_FRAMES = 300;
const MAX_FPS = 30; // Max speed threshold (30 frames per second limit)
const FRAME_INTERVAL = 1000 / MAX_FPS; // ~33.33ms per frame

const canvas = document.getElementById('hero-canvas');
const ctx = canvas.getContext('2d');
const loaderText = document.getElementById('loader-text');
const loader = document.getElementById('loader');

const images = [];
let loadedCount = 0;

let currentFrame = 0;
let targetFrame = 0;
let lastRenderTime = 0;

// Canvas resizing with aspect ratio cover mode
function resizeCanvas() {
  canvas.width = window.innerWidth;
  canvas.height = window.innerHeight;
  renderFrame(Math.round(currentFrame));
}
window.addEventListener('resize', resizeCanvas);

// Image Path Generator
function getImagePath(index) {
  // Pad number to 3 digits (e.g. 1 -> 001, 30 -> 030)
  const paddedIndex = String(index).padStart(3, '0');
  return `ezgif-frame-${paddedIndex}.jpg`; 
}

// Preload Images
for (let i = 1; i <= TOTAL_FRAMES; i++) {
  const img = new Image();
  img.src = getImagePath(i);
  
  img.onload = () => {
    loadedCount++;
    loaderText.innerText = `Loading Images: ${loadedCount} / ${TOTAL_FRAMES}`;
    if (loadedCount === TOTAL_FRAMES) {
      loader.style.display = 'none';
      resizeCanvas();
      requestAnimationFrame(gameLoop);
    }
  };

  img.onerror = () => {
    // Handling missing/error images gracefully
    loadedCount++;
    if (loadedCount === TOTAL_FRAMES) {
      loader.style.display = 'none';
      resizeCanvas();
      requestAnimationFrame(gameLoop);
    }
  };

  images.push(img);
}

// Draw frame on canvas (background object-fit cover effect)
function renderFrame(index) {
  const img = images[index];
  if (!img || !img.complete || img.naturalWidth === 0) return;

  ctx.clearRect(0, 0, canvas.width, canvas.height);

  const canvasRatio = canvas.width / canvas.height;
  const imageRatio = img.width / img.height;

  let drawWidth, drawHeight, offsetX, offsetY;

  if (canvasRatio > imageRatio) {
    drawWidth = canvas.width;
    drawHeight = canvas.width / imageRatio;
    offsetX = 0;
    offsetY = (canvas.height - drawHeight) / 2;
  } else {
    drawWidth = canvas.height * imageRatio;
    drawHeight = canvas.height;
    offsetX = (canvas.width - drawWidth) / 2;
    offsetY = 0;
  }

  ctx.drawImage(img, offsetX, offsetY, drawWidth, drawHeight);
}

// Scroll Event: Calculate Target Frame
window.addEventListener('scroll', () => {
  const scrollTop = window.scrollY;
  const maxScroll = document.documentElement.scrollHeight - window.innerHeight;
  
  if (maxScroll <= 0) return;

  const scrollFraction = Math.min(1, Math.max(0, scrollTop / maxScroll));
  
  // 10% scroll -> ~30 frames
  // 50% scroll -> ~150 frames
  // 100% scroll -> 300 frames
  targetFrame = scrollFraction * (TOTAL_FRAMES - 1);
});

// Main Animation Loop with strict 30 FPS Throttling
function gameLoop(timestamp) {
  if (!lastRenderTime) lastRenderTime = timestamp;

  const elapsed = timestamp - lastRenderTime;

  // Render only if enough time passed (33.3ms for 30 FPS)
  if (elapsed >= FRAME_INTERVAL) {
    lastRenderTime = timestamp - (elapsed % FRAME_INTERVAL);

    // Smooth transition towards target frame (step by step)
    if (Math.abs(targetFrame - currentFrame) > 0.01) {
      if (currentFrame < targetFrame) {
        currentFrame = Math.min(currentFrame + 1, targetFrame);
      } else if (currentFrame > targetFrame) {
        currentFrame = Math.max(currentFrame - 1, targetFrame);
      }
      
      renderFrame(Math.round(currentFrame));
    }
  }

  requestAnimationFrame(gameLoop);
}
