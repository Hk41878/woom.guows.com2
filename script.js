const TOTAL_FRAMES = 48; // Total 48 frames (001 to 048)
const IMAGE_FOLDER = 'images'; // Folder ka naam

const canvas = document.getElementById('bgCanvas');
const ctx = canvas.getContext('2d');

const images = [];
let loadedCount = 0;

// Helper: 1 ko "001", 10 ko "010" banane ke liye 3-digit zero-padding
function formatFrameNumber(num) {
  return String(num).padStart(3, '0');
}

// Image Path Generator: images/ezgif-frame-001.jpg
function getImagePath(frameIndex) {
  const formattedNumber = formatFrameNumber(frameIndex);
  return `${IMAGE_FOLDER}/ezgif-frame-${formattedNumber}.jpg`;
}

// Window size ke according Canvas setup
function resizeCanvas() {
  canvas.width = window.innerWidth;
  canvas.height = window.innerHeight;
  renderFrame(getCurrentFrameIndex());
}

// Preload all 48 frames for lag-free scrolling
function preloadImages() {
  for (let i = 1; i <= TOTAL_FRAMES; i++) {
    const img = new Image();
    const src = getImagePath(i);
    img.src = src;

    img.onload = () => {
      loadedCount++;
      if (i === 1) {
        renderFrame(1);
      }
    };

    img.onerror = () => {
      console.error(`Frame load nahi ho saka: ${src}. Check karein ki path aur filename sahi hain.`);
    };

    images.push(img);
  }
}

// Scroll Percentage ke according Exact Frame Index (1 to 48) calculate karna
function getCurrentFrameIndex() {
  const scrollTop = window.scrollY || document.documentElement.scrollTop;
  const maxScroll = document.documentElement.scrollHeight - window.innerHeight;
  
  if (maxScroll <= 0) return 1;

  // Scroll ratio between 0.0 and 1.0
  const scrollFraction = Math.min(1, Math.max(0, scrollTop / maxScroll));
  
  // Half scroll (0.5) = Frame 24 | Full scroll (1.0) = Frame 48
  const frameIndex = Math.min(
    TOTAL_FRAMES,
    Math.max(1, Math.floor(scrollFraction * (TOTAL_FRAMES - 1)) + 1)
  );
  
  return frameIndex;
}

// Canvas par frame render karna (Aspect Ratio Preserve karke)
function renderFrame(frameIndex) {
  const img = images[frameIndex - 1];
  if (!img || !img.complete || img.naturalWidth === 0) return;

  ctx.clearRect(0, 0, canvas.width, canvas.height);

  // Background image ko screen me "cover" mode me fit karna
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

// Smooth Frame Updating via RequestAnimationFrame
let isTicking = false;
window.addEventListener('scroll', () => {
  if (!isTicking) {
    window.requestAnimationFrame(() => {
      renderFrame(getCurrentFrameIndex());
      isTicking = false;
    });
    isTicking = true;
  }
});

// Window Resize Handling
window.addEventListener('resize', resizeCanvas);

// App Init
window.addEventListener('DOMContentLoaded', () => {
  resizeCanvas();
  preloadImages();
});
