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
    sticker.style.position = "absolute";
    sticker.style.top = "20px";
    sticker.style.left = "20px";
    makeDraggableResizable(sticker, scrapCanvas);
    stickerLayer.appendChild(sticker);
  });

  stickerBar.appendChild(btn);
});

// ================== FRAMES ==================
const frames = [
"https://static.wixstatic.com/media/67478d_f571bbe25fa64624a6610dbaa0c0daa5~mv2.png",
"https://static.wixstatic.com/media/67478d_ef3f01a6181540639d224868888348de~mv2.png",
"https://i.imgur.com/frame3.png"
];

const frameLayer = document.getElementById('frameLayer');
const framesGallery = document.getElementById("framesGallery");

frames.forEach(url => {
  const btn = document.createElement('button');
  const thumb = document.createElement("img");
  thumb.src = url;
  thumb.classList.add("frame-thumbnail");
  btn.appendChild(thumb);

  btn.addEventListener('click', () => {
    frameLayer.innerHTML = ""; // clear previous frame
    const frameImg = document.createElement('img');
    frameImg.src = url;
    frameLayer.appendChild(frameImg);
  });

  framesGallery.appendChild(btn); // ensure this points to your frame container
});

// Append button to your existing frame selector container
document.getElementById("framesGallery").appendChild(btn); // Replace 'document.body' with your actual container
});

let photos = [];

async function startCamera() {
  try {
    const stream = await navigator.mediaDevices.getUserMedia({ video: { facingMode: "user" }, audio: false });
    video.srcObject = stream; // attach stream directly to existing <video>
    video.play();
  } catch(err) {
    alert("Camera not accessible: " + err);
  }
}

// Attach start button
startBtn.addEventListener('click', startCamera);

let currentMode = "4x6"; // "strip" or "4x"

// ================== TAKE PHOTO + COUNTDOWN ==================
function takePhoto() {
  if (!video.videoWidth) return;

  const canvas = document.createElement('canvas');
  canvas.width = video.videoWidth;
  canvas.height = video.videoHeight;

  const ctx = canvas.getContext('2d');
  ctx.filter = "none"; // apply video filter if needed
  ctx.drawImage(video, 0, 0, canvas.width, canvas.height);

  const wrapper = document.createElement('div');
  wrapper.style.position = "absolute";
  wrapper.style.top = "10px";
  wrapper.style.left = "10px";

  const img = document.createElement('img');
  img.src = canvas.toDataURL('image/png');
  img.style.width = "150px";
  img.style.height = "auto";

  wrapper.appendChild(img);
  makeDraggableResizable(wrapper, scrapCanvas);
  photoLayer.appendChild(wrapper);

  // 4x6: draggable/resizable
  img.style.width = "150px";
  img.style.height = "auto";
  img.style.top = "10px";
  img.style.left = "10px";
  makeDraggableResizable(img, scrapCanvas);

  photos.push(img);
  photoLayer.appendChild(img);

  // ✅ Add rotate button
const rotateBtn = document.createElement('button');
rotateBtn.innerHTML = '⟳';
rotateBtn.style.position = 'absolute';
rotateBtn.style.top = '-15px';
rotateBtn.style.right = '-15px';
rotateBtn.style.zIndex = 20;
rotateBtn.style.background = '#FFD700';
rotateBtn.style.border = 'none';
rotateBtn.style.borderRadius = '50%';
rotateBtn.style.width = '30px';
rotateBtn.style.height = '30px';
rotateBtn.style.cursor = 'pointer';

rotateBtn.addEventListener('click', () => {
  wrapper.rotate(90);
});

wrapper.appendChild(rotateBtn);

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

  function capturePhoto(index, maxPhotos) {

  const canvas = document.createElement('canvas');
  canvas.width = video.videoWidth;
  canvas.height = video.videoHeight;
  const ctx = canvas.getContext('2d');

  ctx.filter = currentFilter || "none";
  ctx.drawImage(video, 0, 0, canvas.width, canvas.height);

  const img = document.createElement('img');
  img.src = canvas.toDataURL('image/png');

  img.style.position = "absolute";
  img.style.left = "0px";
  img.style.width = "100%";
  img.style.objectFit = "cover";

  if (currentMode === "4x6") {

    const topMargin = 20;
    const bottomMargin = 60;
    const gap = 20;

    const usableHeight = scrapCanvas.offsetHeight - topMargin - bottomMargin - (gap * (maxPhotos - 1));
    const slotHeight = usableHeight / maxPhotos;

    img.style.height = slotHeight + "px";
    img.style.top = (topMargin + index * (slotHeight + gap)) + "px";

  } else {

    // 4x layout (2x2 grid)
    const gap = 10;
    const size = (scrapCanvas.offsetWidth - gap) / 2;

    img.style.width = size + "px";
    img.style.height = size + "px";

    const row = Math.floor(index / 2);
    const col = index % 2;

    img.style.left = (col * (size + gap)) + "px";
    img.style.top = (row * (size + gap)) + "px";

  }

  photos.push(img);
  photoLayer.appendChild(img);
}

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
takePhotoBtn.addEventListener('click', async () => {

  if (!video.videoWidth) return;

  photos = [];
  photoLayer.innerHTML = '';

  const maxPhotos = currentMode === "strip" ? 3 : 4;

  for (let i = 0; i < maxPhotos; i++) {

    await new Promise(resolve => {
      startCountdown(3, () => {

        capturePhoto(i, maxPhotos);
        resolve();

      });
    });

  }

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
  el.style.cursor = "move";
  el.style.transform = "rotate(0deg)"; // start with 0 rotation
  let isDragging = false, offsetX, offsetY;
  let currentRotation = 0; // track rotation

  // 🖱 Drag / Mouse events
  el.addEventListener("mousedown", e => {
    isDragging = true;
    offsetX = e.offsetX;
    offsetY = e.offsetY;
  });

  document.addEventListener("mousemove", e => {
    if (!isDragging) return;
    let rect = container.getBoundingClientRect();
    let x = e.clientX - rect.left - offsetX;
    let y = e.clientY - rect.top - offsetY;
    x = Math.max(0, Math.min(container.offsetWidth - el.offsetWidth, x));
    y = Math.max(0, Math.min(container.offsetHeight - el.offsetHeight, y));
    el.style.left = x + "px";
    el.style.top = y + "px";
  });

  document.addEventListener("mouseup", () => isDragging = false);

  // 🖱 Mouse wheel resize
  el.addEventListener("wheel", e => {
    e.preventDefault();
    let newWidth = el.offsetWidth + (e.deltaY < 0 ? 10 : -10);
    if (newWidth > 50 && newWidth < 800) el.style.width = newWidth + "px";
  });

  
  // 📱 Touch pinch zoom (mobile) — prevent rotation/scroll
let initialDistance = null;

el.addEventListener("touchstart", e => {
if (e.touches.length === 2) {
// Pinch zoom start
initialDistance = Math.hypot(
e.touches[0].clientX - e.touches[1].clientX,
e.touches[0].clientY - e.touches[1].clientY
);
} else if (e.touches.length === 1) {
// Single finger drag start
isDragging = true;
const touch = e.touches[0];
const rect = el.getBoundingClientRect();
offsetX = touch.clientX - rect.left;
offsetY = touch.clientY - rect.top;
}
});

el.addEventListener("touchmove", e => {
if (e.touches.length === 2 && initialDistance) {
// Pinch zoom
e.preventDefault(); // only block pinch zoom
let currentDistance = Math.hypot(
e.touches[0].clientX - e.touches[1].clientX,
e.touches[0].clientY - e.touches[1].clientY
);
let scale = currentDistance / initialDistance;
let newWidth = el.offsetWidth * scale;
if (newWidth > 50 && newWidth < 800) el.style.width = newWidth + "px";
initialDistance = currentDistance;
} else if (e.touches.length === 1 && isDragging) {
// Single-finger drag
const touch = e.touches[0];
const rect = container.getBoundingClientRect();
let x = touch.clientX - rect.left - offsetX;
let y = touch.clientY - rect.top - offsetY;
x = Math.max(0, Math.min(container.offsetWidth - el.offsetWidth, x));
y = Math.max(0, Math.min(container.offsetHeight - el.offsetHeight, y));
el.style.left = x + "px";
el.style.top = y + "px";
}
});

el.addEventListener("touchend", e => {
if (e.touches.length < 2) initialDistance = null;
if (e.touches.length === 0) isDragging = false;
});

  // 🔄 Add rotation function (for desktop button)
  el.rotate = function(deg) {
    currentRotation += deg;
    el.style.transform = `rotate(${currentRotation}deg)`;
  };
}

// ================== DOWNLOAD / STRIPE FIX ==================
let isPaid = false; // make sure this exists at the top of your JS if not already

downloadBtn.addEventListener('click', async () => {

  if (!isPaid) {
    // Open Stripe
    window.open(STRIPE_URL, "_blank");

    // Confirm payment
  const urlParams = new URLSearchParams(window.location.search);
  if (urlParams.get("paid") === "true") {
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
