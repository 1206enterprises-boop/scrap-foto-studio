document.addEventListener("DOMContentLoaded", function() {

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

// ================== FRAMES ==================
const frames = [
"https://static.wixstatic.com/media/67478d_f571bbe25fa64624a6610dbaa0c0daa5~mv2.png",
"https://static.wixstatic.com/media/67478d_ef3f01a6181540639d224868888348de~mv2.png",
"https://i.imgur.com/frame3.png"
];

const frameLayer = document.getElementById('frameLayer');

// Example: create frame buttons (can style as you like)
frames.forEach(url => {
const btn = document.createElement('button');
const thumb = document.createElement("img");
thumb.src = url;
thumb.classList.add("frame-thumbnail");
btn.appendChild(thumb); // Replace with thumbnail if you want
btn.addEventListener('click', () => {
// Clear previous frame
frameLayer.innerHTML = "";

// Add selected frame
const frameImg = document.createElement('img');
frameImg.src = url;
frameLayer.appendChild(frameImg);
});

// Append button to your existing frame selector container
document.getElementById("framesGallery").appendChild(btn); // Replace 'document.body' with your actual container
});

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

// ================== TAKE PHOTO + COUNTDOWN ==================
function takePhoto() {
  const canvas = document.createElement("canvas");
  canvas.width = video.videoWidth;
  canvas.height = video.videoHeight;
  const ctx = canvas.getContext("2d");
  ctx.drawImage(video, 0, 0, canvas.width, canvas.height);

  const img = document.createElement("img");
  img.src = canvas.toDataURL("image/png");
  img.style.width = "150px";
  img.style.height = "auto";

  photoLayer.appendChild(img);
  makeDraggableResizable(img, scrapCanvas);
}

function startCountdown(seconds) {
  const overlay = document.getElementById("countdownOverlay");
  if (!overlay) return;

  let count = seconds;
  overlay.style.display = "flex";
  overlay.style.alignItems = "center";
  overlay.style.justifyContent = "center";
  overlay.style.fontSize = "120px";
  overlay.style.fontWeight = "bold";
  overlay.style.color = "#fff";
  overlay.style.textShadow = "0 0 20px gold";
  overlay.style.background = "rgba(0,0,0,0.5)";
  overlay.textContent = count;

  // Add CSS animation class
  overlay.classList.add("countdown-scale");

  const interval = setInterval(() => {
    count--;

    if (count > 0) {
      overlay.textContent = count;

      // Restart the scale animation
      overlay.classList.remove("countdown-scale");
      void overlay.offsetWidth; // trigger reflow
      overlay.classList.add("countdown-scale");

    } else {
      clearInterval(interval);

      // Flash effect
      overlay.style.background = "#fff";
      overlay.style.color = "#000";
      overlay.style.textShadow = "none";
      overlay.textContent = "";

      setTimeout(() => {
        overlay.style.display = "none";
        overlay.style.background = "rgba(0,0,0,0.5)";
        overlay.style.color = "#fff";
        overlay.style.textShadow = "0 0 20px gold";
        takePhoto(); // take photo after flash
      }, 200); // flash duration: 200ms
    }
  }, 1000);
}

// ================== BUTTON CLICK ==================
takePhotoBtn.addEventListener('click', () => {
  startCountdown(3); // 3-second countdown
});

// ================== RESET ==================
resetBtn.addEventListener('click', () => {
  photos = [];
  photoLayer.innerHTML = '';
  stickerLayer.innerHTML = '';
});

// ================== STICKERS ==================
const stickers = [
  "https://static.wixstatic.com/media/67478d_4f71ca963cda42a983f251055f03011a~mv2.png",
  "https://static.wixstatic.com/media/67478d_51e4fa7634da47388a030739486d9da2~mv2.png",
  "https://i.imgur.com/Sticker3.png",
  "https://i.imgur.com/Sticker4.png",
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
  el.style.top = "10px";
  el.style.left = "10px";
  el.style.transformOrigin = "center center";

  let rotation = 0;
  let isDragging = false;
  let isResizing = false;
  let isRotating = false;
  let startMouse = { x: 0, y: 0 };
  let startDims = { width: 0, height: 0 };
  let startPos = { x: 0, y: 0 };
  let startRotation = 0;

  // --- Dragging ---
  el.addEventListener("mousedown", (e) => {
    if (e.target.classList.contains("resize-handle") || e.target.classList.contains("rotate-handle")) return;
    isDragging = true;
    startMouse.x = e.clientX;
    startMouse.y = e.clientY;
    startPos.x = parseFloat(el.style.left);
    startPos.y = parseFloat(el.style.top);
  });

  document.addEventListener("mousemove", (e) => {
    if (!isDragging) return;
    const dx = e.clientX - startMouse.x;
    const dy = e.clientY - startMouse.y;
    el.style.left = startPos.x + dx + "px";
    el.style.top = startPos.y + dy + "px";
  });

  document.addEventListener("mouseup", () => isDragging = false);

  // --- Resize handle ---
  const handle = document.createElement("div");
  handle.className = "resize-handle";
  handle.style.position = "absolute";
  handle.style.width = "12px";
  handle.style.height = "12px";
  handle.style.background = "#FFD700";
  handle.style.bottom = "-6px";
  handle.style.right = "-6px";
  handle.style.cursor = "se-resize";
  el.appendChild(handle);

  handle.addEventListener("mousedown", (e) => {
    e.stopPropagation();
    isResizing = true;
    startMouse.x = e.clientX;
    startMouse.y = e.clientY;
    startDims.width = el.offsetWidth;
    startDims.height = el.offsetHeight;
  });

  document.addEventListener("mousemove", (e) => {
    if (!isResizing) return;
    const dx = e.clientX - startMouse.x;
    const dy = e.clientY - startMouse.y;
    el.style.width = Math.max(50, startDims.width + dx) + "px";
    el.style.height = Math.max(50, startDims.height + dy) + "px";
  });

  document.addEventListener("mouseup", () => isResizing = false);

  // --- Rotate handle ---
  const rotateHandle = document.createElement("div");
  rotateHandle.className = "rotate-handle";
  rotateHandle.style.position = "absolute";
  rotateHandle.style.top = "-20px";
  rotateHandle.style.left = "50%";
  rotateHandle.style.transform = "translateX(-50%)";
  rotateHandle.style.width = "14px";
  rotateHandle.style.height = "14px";
  rotateHandle.style.background = "#FF4D4D";
  rotateHandle.style.borderRadius = "50%";
  rotateHandle.style.cursor = "grab";
  el.appendChild(rotateHandle);

  rotateHandle.addEventListener("mousedown", (e) => {
    e.stopPropagation();
    isRotating = true;
    const rect = el.getBoundingClientRect();
    const centerX = rect.left + rect.width / 2;
    const centerY = rect.top + rect.height / 2;
    startRotation = Math.atan2(e.clientY - centerY, e.clientX - centerX) * 180 / Math.PI - rotation;
  });

  document.addEventListener("mousemove", (e) => {
    if (!isRotating) return;
    const rect = el.getBoundingClientRect();
    const centerX = rect.left + rect.width / 2;
    const centerY = rect.top + rect.height / 2;
    const angle = Math.atan2(e.clientY - centerY, e.clientX - centerX) * 180 / Math.PI;
    rotation = angle - startRotation;
    el.style.transform = `rotate(${rotation}deg)`;
  });

  document.addEventListener("mouseup", () => isRotating = false);
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

