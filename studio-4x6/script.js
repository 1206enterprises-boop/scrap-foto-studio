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

// ================== PRE-PAYMENT LOCK OVERLAY ==================
let isPaid = false;

// Create overlay
const lockOverlay = document.createElement("div");
lockOverlay.style.position = "absolute";
lockOverlay.style.top = "0";
lockOverlay.style.left = "0";
lockOverlay.style.width = "100%";
lockOverlay.style.height = "100%";
lockOverlay.style.background = "rgba(0,0,0,0.4)";
lockOverlay.style.display = "flex";
lockOverlay.style.alignItems = "center";
lockOverlay.style.justifyContent = "center";
lockOverlay.style.color = "white";
lockOverlay.style.fontSize = "20px";
lockOverlay.style.fontWeight = "bold";
lockOverlay.style.zIndex = "999";
lockOverlay.innerHTML = "🔒 Complete Payment to Download";

scrapCanvas.style.position = "relative";
scrapCanvas.appendChild(lockOverlay);

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

  // ✅ LIMIT TO 4 PHOTOS
  if (photos.length >= 4) {
    alert("You can only add up to 4 photos on a 4x6 layout.");
    return;
  }

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
function makeDraggableResizable(el, container){
  el.style.position = "absolute";
  el.style.cursor = "move";
  let isDragging = false, offsetX, offsetY;

  el.addEventListener("mousedown", e => {
    isDragging = true;
    offsetX = e.offsetX;
    offsetY = e.offsetY;
  });

  document.addEventListener("mousemove", e => {
    if(!isDragging) return;
    let rect = container.getBoundingClientRect();
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
    if(newWidth > 50 && newWidth < 800) el.style.width = newWidth + "px";
  });
}

// ================== DOWNLOAD ==================
downloadBtn.addEventListener('click', async () => {
  
  if (!isPaid) {
    window.open(STRIPE_URL, "_blank");

    const confirmDownload = confirm("After completing payment, click OK to unlock and download your design.");
    if (!confirmDownload) return;

    isPaid = true;
    lockOverlay.remove(); // 🔓 Unlock after payment
  }

  const canvas = document.createElement('canvas');
  canvas.width = scrapCanvas.offsetWidth;
  canvas.height = scrapCanvas.offsetHeight;
  const ctx = canvas.getContext('2d');

  const elements = scrapCanvas.querySelectorAll('img');
  for(let el of elements){
    const rect = el.getBoundingClientRect();
    const parentRect = scrapCanvas.getBoundingClientRect();
    const x = rect.left - parentRect.left;
    const y = rect.top - parentRect.top;

    await new Promise(resolve => {
      const img = new Image();
      img.crossOrigin = "anonymous";
      img.src = el.src;
      img.onload = () => {
        ctx.drawImage(img, x, y, el.offsetWidth, el.offsetHeight);
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

// ================== DOWNLOAD PROTECTION ==================

// Disable right-click inside the studio
scrapCanvas.addEventListener("contextmenu", function(e) {
  e.preventDefault();
});

// Prevent image drag-to-desktop download
scrapCanvas.addEventListener("dragstart", function(e) {
  e.preventDefault();
});

// Disable right-click on entire page (optional but stronger)
document.addEventListener("contextmenu", function(e) {
  e.preventDefault();
});

// Prevent selecting images
document.addEventListener("selectstart", function(e) {
  if (e.target.tagName === "IMG") {
    e.preventDefault();
  }
});












