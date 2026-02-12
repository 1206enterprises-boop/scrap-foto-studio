// ================== STRIPE + WATERMARK ==================
const STRIPE_URL = "https://buy.stripe.com/YOUR_LINK_HERE";

function addWatermark(canvas) {
  const ctx = canvas.getContext("2d");
  ctx.font = "bold 40px Arial";
  ctx.fillStyle = "rgba(255,255,255,0.25)";
  ctx.textAlign = "center";
  ctx.fillText("VISURA HAUS", canvas.width/2, canvas.height/2);
}

// ================== CAMERA ==================
const video = document.getElementById('video');
const startBtn = document.getElementById('startBtn');
const takePhotoBtn = document.getElementById('takePhotoBtn');
const resetBtn = document.getElementById('resetBtn');
const downloadBtn = document.getElementById('downloadBtn');
const scrapCanvas = document.getElementById('scrapCanvas');
const photoLayer = document.getElementById('photoLayer');
const stickerLayer = document.getElementById('stickerLayer');
const stickerBar = document.getElementById('stickerBar');

let photos = [];

async function startCamera() {
  try {
    const stream = await navigator.mediaDevices.getUserMedia({ video: { facingMode: "user" }, audio: false });
    video.srcObject = stream;
  } catch(err) {
    alert("Camera not accessible: " + err);
  }
}

startBtn.addEventListener('click', startCamera);

// ================== TAKE PHOTO ==================
takePhotoBtn.addEventListener('click', () => {
  if(!video.videoWidth) return;

  const canvas = document.createElement('canvas');
  canvas.width = video.videoWidth;
  canvas.height = video.videoHeight;
  const ctx = canvas.getContext('2d');
  ctx.filter = "none"; // filters preview only
  ctx.drawImage(video, 0, 0, canvas.width, canvas.height);

  const img = document.createElement('img');
  img.src = canvas.toDataURL('image/png');

  // 4x6: draggable/resizable
  img.style.width = "150px";
  img.style.height = "auto";
  img.style.top = "10px";
  img.style.left = "10px";
  makeDraggableResizable(img, scrapCanvas);

  photos.push(img);
  photoLayer.appendChild(img);
});

// ================== RESET ==================
resetBtn.addEventListener('click', () => {
  photos = [];
  photoLayer.innerHTML = '';
  stickerLayer.innerHTML = '';
});

// ================== STICKERS ==================
const stickers = [
  "https://i.imgur.com/Sticker1.png",
  "https://i.imgur.com/Sticker2.png",
  "https://i.imgur.com/Sticker3.png"
];

stickers.forEach(url => {
  const btn = document.createElement('button');
  const img = document.createElement('img');
  img.src = url;
  btn.appendChild(img);
  btn.addEventListener('click', () => {
    const sticker = document.createElement('img');
    sticker.src = url;
    sticker.style.width = "80px";
    sticker.style.height = "80px";
    sticker.style.top = "20px";
    sticker.style.left = "20px";
    makeDraggableResizable(sticker, scrapCanvas);
    stickerLayer.appendChild(sticker);
  });
  stickerBar.appendChild(btn);
});

// ================== DRAG & RESIZE ==================
function makeDraggableResizable(el, container) {
  el.style.position = "absolute";
  el.style.cursor = "move";
  el.style.transformOrigin = "center center"; // important for rotation
  let isDragging = false, offsetX = 0, offsetY = 0;

  let rotation = 0;        // rotation in degrees
  let scale = 1;           // current scale

  // --- MOUSE EVENTS ---
  el.addEventListener("mousedown", e => {
    isDragging = true;
    offsetX = e.offsetX;
    offsetY = e.offsetY;
  });

  document.addEventListener("mousemove", e => {
    if (!isDragging) return;
    moveElement(e.clientX, e.clientY);
  });

  document.addEventListener("mouseup", () => isDragging = false);

  // --- TOUCH EVENTS ---
  let initialDistance = 0;
  let initialRotation = 0;
  el.addEventListener("touchstart", e => {
    if (e.touches.length === 1) {
      isDragging = true;
      const touch = e.touches[0];
      const rect = el.getBoundingClientRect();
      offsetX = touch.clientX - rect.left;
      offsetY = touch.clientY - rect.top;
    } else if (e.touches.length === 2) {
      isDragging = false;
      initialDistance = getDistance(e.touches[0], e.touches[1]) / scale;
      initialRotation = getAngle(e.touches[0], e.touches[1]) - rotation;
    }
    e.preventDefault();
  }, { passive: false });

  document.addEventListener("touchmove", e => {
    if (e.touches.length === 1 && isDragging) {
      const touch = e.touches[0];
      moveElement(touch.clientX, touch.clientY);
    } else if (e.touches.length === 2) {
      // pinch to scale
      const newDistance = getDistance(e.touches[0], e.touches[1]);
      scale = newDistance / initialDistance;
      // rotate
      rotation = getAngle(e.touches[0], e.touches[1]) - initialRotation;
      updateTransform();
    }
    e.preventDefault();
  }, { passive: false });

  document.addEventListener("touchend", () => {
    isDragging = false;
  });

  // --- WHEEL (RESIZE & ROTATE) ---
  el.addEventListener("wheel", e => {
    e.preventDefault();
    if (e.shiftKey) {
      // Rotate if shift is held
      rotation += e.deltaY < 0 ? 5 : -5;
    } else {
      // Resize
      scale += e.deltaY < 0 ? 0.05 : -0.05;
      scale = Math.max(0.1, Math.min(5, scale));
    }
    updateTransform();
  });

  // --- HELPER FUNCTIONS ---
  function moveElement(clientX, clientY) {
    const rect = container.getBoundingClientRect();
    let x = clientX - rect.left - offsetX;
    let y = clientY - rect.top - offsetY;
    x = Math.max(0, Math.min(container.offsetWidth - el.offsetWidth * scale, x));
    y = Math.max(0, Math.min(container.offsetHeight - el.offsetHeight * scale, y));
    el.style.left = x + "px";
    el.style.top = y + "px";
  }

  function updateTransform() {
    el.style.transform = `scale(${scale}) rotate(${rotation}deg)`;
  }

  function getDistance(touch1, touch2) {
    return Math.hypot(touch2.clientX - touch1.clientX, touch2.clientY - touch1.clientY);
  }

  function getAngle(touch1, touch2) {
    return Math.atan2(touch2.clientY - touch1.clientY, touch2.clientX - touch1.clientX) * 180 / Math.PI;
  }
}

// ================== DOWNLOAD / STRIPE FIX ==================
let isPaid = false; // make sure this exists at the top of your JS if not already

downloadBtn.addEventListener('click', async () => {

  if (!isPaid) {
    // Open Stripe
    window.open(STRIPE_URL, "_blank");

    // Confirm payment
    const confirmDownload = confirm("After completing payment, click OK to unlock and download your design.");
    if (!confirmDownload) return;

    isPaid = true;
  }

  const canvas = document.createElement('canvas');
  canvas.width = scrapCanvas.offsetWidth;
  canvas.height = scrapCanvas.offsetHeight;
  const ctx = canvas.getContext('2d');

  const elements = scrapCanvas.querySelectorAll('img');

  for (let el of elements) {
    const rect = el.getBoundingClientRect();
    const parentRect = scrapCanvas.getBoundingClientRect();
    const x = rect.left - parentRect.left;
    const y = rect.top - parentRect.top;

    await new Promise(resolve => {
      const img = new Image();
      img.crossOrigin = "anonymous";
      img.src = el.src;
      img.onload = () => {

        // Get current transform
        const style = window.getComputedStyle(el);
        const transform = style.transform;

        ctx.save(); // save current context

        // Move to element center
        ctx.translate(x + (el.offsetWidth / 2), y + (el.offsetHeight / 2));

        if (transform && transform !== "none") {
          // Parse scale and rotation from matrix
          const values = transform.match(/matrix\(([^)]+)\)/);
          if (values) {
            const parts = values[1].split(',').map(parseFloat);
            const a = parts[0]; // scaleX * cosθ
            const b = parts[1]; // scaleX * sinθ
            const scaleX = Math.sqrt(a*a + b*b);
            const angle = Math.atan2(b, a);
            ctx.rotate(angle);
            ctx.scale(scaleX, scaleX);
          }
        }

        // Draw the image centered
        ctx.drawImage(img, -el.offsetWidth/2, -el.offsetHeight/2, el.offsetWidth, el.offsetHeight);

        ctx.restore(); // restore context
        resolve();
      };
    });
  }

  addWatermark(canvas);

  const link = document.createElement('a');
  link.href = canvas.toDataURL('image/png');
  link.download = "visura-4x6.png";
  link.click();
});

// ===== Disable Right Click on Images =====
document.addEventListener('contextmenu', function(e) {
  if (e.target.tagName === 'IMG') {
    e.preventDefault();
  }
});

