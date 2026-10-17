const TOTAL_FRAMES = 7;
// AGAR images .jpg extension me hain toh yahan '.jpg' kar lein
const IMAGE_EXTENSION = '.jpeg';

const canvas = document.getElementById('bgCanvas');
const ctx = canvas.getContext('2d');

const images = [];
let loadedImagesCount = 0;

// Window size ke hisab se Canvas resize aur draw karna
function resizeCanvas() {
  canvas.width = window.innerWidth;
  canvas.height = window.innerHeight;
  renderFrame(getCurrentFrameIndex());
}

// Preload Images
function preloadImages() {
  for (let i = 1; i <= TOTAL_FRAMES; i++) {
    const img = new Image();
    const src = `${i}${IMAGE_EXTENSION}`;
    img.src = src;

    img.onload = () => {
      loadedImagesCount++;
      if (i === 1) {
        renderFrame(1);
      }
    };

    img.onerror = () => {
      console.warn(`Image load nahi ho saki: ${src}. Make sure file exists in the main folder.`);
    };

    images.push(img);
  }
}

// Current Scroll Percentage ke basis par Frame Calculate karna
function getCurrentFrameIndex() {
  const scrollTop = window.scrollY || document.documentElement.scrollTop;
  const maxScroll = document.documentElement.scrollHeight - window.innerHeight;
  
  if (maxScroll <= 0) return 1;

  const scrollFraction = Math.min(1, Math.max(0, scrollTop / maxScroll));
  
  // Calculate Frame from 1 to TOTAL_FRAMES
  const frameIndex = Math.min(
    TOTAL_FRAMES,
    Math.max(1, Math.floor(scrollFraction * TOTAL_FRAMES) + 1)
  );
  
  return frameIndex;
}

// Draw Frame on Canvas with Cover Aspect Ratio (Image stretch na ho)
function renderFrame(frameIndex) {
  const img = images[frameIndex - 1];
  if (!img || !img.complete || img.naturalWidth === 0) return;

  ctx.clearRect(0, 0, canvas.width, canvas.height);

  // Background Image ko Screen size ke according proportional cover karna
  const hRatio = canvas.width / img.naturalWidth;
  const vRatio = canvas.height / img.naturalHeight;
  const ratio = Math.max(hRatio, vRatio);

  const centerShift_x = (canvas.width - img.naturalWidth * ratio) / 2;
  const centerShift_y = (canvas.height - img.naturalHeight * ratio) / 2;

  ctx.drawImage(
    img,
    0,
    0,
    img.naturalWidth,
    img.naturalHeight,
    centerShift_x,
    centerShift_y,
    img.naturalWidth * ratio,
    img.naturalHeight * ratio
  );
}

// Scroll Event
window.addEventListener('scroll', () => {
  requestAnimationFrame(() => {
    const frameIndex = getCurrentFrameIndex();
    renderFrame(frameIndex);
  });
});

// Window Resize Event
window.addEventListener('resize', resizeCanvas);

// App Init
window.addEventListener('DOMContentLoaded', () => {
  resizeCanvas();
  preloadImages();
});
