// ================== STRIPE + WATERMARK ==================
const STRIPE_URL = "https://buy.stripe.com/YOUR_LINK_HERE";

function addWatermark(canvas) {
  const ctx = canvas.getContext("2d");
  ctx.font = "bold 40px Arial";
  ctx.fillStyle = "rgba(255,255,255,0.25)";
  ctx.textAlign = "center";
  ctx.fillText("VISURA HAUS", canvas.width / 2, canvas.height / 2);
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
const frameLayer = document.getElementById('frameLayer');
const framesGallery = document.getElementById("framesGallery");

// ================== 4x6 Canvas Setup ==================
let currentMode = "4x6"; // "strip" or "4x6"
if (currentMode === "4x6") {
  scrapCanvas.style.height = '1000px'; // adjust for mobile
  scrapCanvas.style.position = 'relative';
  photoLayer.style.position = 'absolute';
  stickerLayer.style.position = 'absolute';
  frameLayer.style.position = 'absolute';
}

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

    // ✅ Mobile-friendly frame styling
    frameImg.style.position = "absolute";
    frameImg.style.top = 0;
    frameImg.style.left = 0;
    frameImg.style.width = "100%";
    frameImg.style.height = "100%";
    frameImg.style.objectFit = "cover";
    frameImg.style.zIndex = 5;
    frameImg.style.pointerEvents = "none";

    frameLayer.appendChild(frameImg);
  });

  framesGallery.appendChild(btn);
});

// ================== CAMERA START ==================
async function startCamera() {
  try {
    const stream = await navigator.mediaDevices.getUserMedia({ video: { facingMode: "user" }, audio: false });
    video.srcObject = stream;
    video.play();
  } catch(err) {
    alert("Camera not accessible: " + err);
  }
}

startBtn.addEventListener('click', startCamera);

let photos = [];

// ================== CAPTURE PHOTO ==================
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
    const gap = 10;
    const size = (scrapCanvas.offsetWidth - gap) / 2;
    const row = Math.floor(index / 2);
    const col = index % 2;
    img.style.width = size + "px";
    img.style.height = size + "px";
    img.style.left = (col * (size + gap)) + "px";
    img.style.top = (row * (size + gap)) + "px";
  }

  photos.push(img);
  photoLayer.appendChild(img);
}

// ================== COUNTDOWN + TAKE PHOTO ==================
function startCountdown(seconds, callback) {
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

  overlay.classList.add("countdown-scale");

  const interval = setInterval(() => {
    count--;

    if (count > 0) {
      overlay.textContent = count;
      overlay.classList.remove("countdown-scale");
      void overlay.offsetWidth; // restart animation
      overlay.classList.add("countdown-scale");
    } else {
      clearInterval(interval);
      overlay.style.background = "#fff";
      overlay.style.color = "#000";
      overlay.style.textShadow = "none";
      overlay.textContent = "";

      setTimeout(() => {
        overlay.style.display = "none";
        overlay.style.background = "rgba(0,0,0,0.5)";
        overlay.style.color = "#fff";
        overlay.style.textShadow = "0 0 20px gold";
        callback(); // take photo
      }, 200);
    }
  }, 1000);
}

// ================== TAKE PHOTO BUTTON ==================
takePhotoBtn.addEventListener('click', async () => {
  if (!video.videoWidth) return;

  photos = [];
  photoLayer.innerHTML = '';
  stickerLayer.innerHTML = '';

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

// ================== DRAG & RESIZE ==================
function makeDraggableResizable(el, container) {
  el.style.position = "absolute";
  el.style.cursor = "move";
  el.style.transform = "rotate(0deg)";
  let isDragging = false, offsetX, offsetY;
  let currentRotation = 0;

  el.addEventListener("mousedown", e => {
    isDragging = true;
    offsetX = e.offsetX;
    offsetY = e.offsetY;
  });

  document.addEventListener("mousemove", e => {
    if (!isDragging) return;
    const rect = container.getBoundingClientRect();
    let x = e.clientX - rect.left - offsetX;
    let y = e.clientY - rect.top - offsetY;
    x = Math.max(0, Math.min(container.offsetWidth - el.offsetWidth, x));
    y = Math.max(0, Math.min(container.offsetHeight - el.offsetHeight, y));
    el.style.left = x + "px";
    el.style.top = y + "px";
  });

  document.addEventListener("mouseup", () => isDragging = false);

  el.addEventListener("wheel", e => {
    e.preventDefault();
    let newWidth = el.offsetWidth + (e.deltaY < 0 ? 10 : -10);
    if (newWidth > 50 && newWidth < 800) el.style.width = newWidth + "px";
  });

  // Touch support
  let initialDistance = null;
  el.addEventListener("touchstart", e => {
    if (e.touches.length === 2) {
      initialDistance = Math.hypot(
        e.touches[0].clientX - e.touches[1].clientX,
        e.touches[0].clientY - e.touches[1].clientY
      );
    } else if (e.touches.length === 1) {
      isDragging = true;
      const touch = e.touches[0];
      const rect = el.getBoundingClientRect();
      offsetX = touch.clientX - rect.left;
      offsetY = touch.clientY - rect.top;
    }
  });

  el.addEventListener("touchmove", e => {
    if (e.touches.length === 2 && initialDistance) {
      e.preventDefault();
      let currentDistance = Math.hypot(
        e.touches[0].clientX - e.touches[1].clientX,
        e.touches[0].clientY - e.touches[1].clientY
      );
      let scale = currentDistance / initialDistance;
      let newWidth = el.offsetWidth * scale;
      if (newWidth > 50 && newWidth < 800) el.style.width = newWidth + "px";
      initialDistance = currentDistance;
    } else if (e.touches.length === 1 && isDragging) {
      const touch = e.touches[0];
      const rect = container.getBoundingClientRect();
      let x = touch.clientX - rect.left - offsetX;
      let y = touch.clientY - rect.top - offsetY;
      el.style.left = x + "px";
      el.style.top = y + "px";
    }
  });

  el.addEventListener("touchend", e => {
    if (e.touches.length < 2) initialDistance = null;
    if (e.touches.length === 0) isDragging = false;
  });

  el.rotate = function(deg) {
    currentRotation += deg;
    el.style.transform = `rotate(${currentRotation}deg)`;
  };
}

// ================== DOWNLOAD / STRIPE ==================
let isPaid = false;
downloadBtn.addEventListener('click', async () => {
  if (!isPaid) {
    window.open(STRIPE_URL, "_blank");
    const urlParams = new URLSearchParams(window.location.search);
    if (urlParams.get("paid") === "true") isPaid = true;
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
        const style = window.getComputedStyle(el);
        const transform = style.transform;
        ctx.save();
        ctx.translate(x + el.offsetWidth/2, y + el.offsetHeight/2);

        if (transform && transform !== "none") {
          const values = transform.match(/matrix\(([^)]+)\)/);
          if (values) {
            const parts = values[1].split(',').map(parseFloat);
            const a = parts[0];
            const b = parts[1];
            const scaleX = Math.sqrt(a*a + b*b);
            const angle = Math.atan2(b, a);
            ctx.rotate(angle);
            ctx.scale(scaleX, scaleX);
          }
        }

        ctx.drawImage(img, -el.offsetWidth/2, -el.offsetHeight/2, el.offsetWidth, el.offsetHeight);
        ctx.restore();
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
  if (e.target.tagName === 'IMG') e.preventDefault();
});
