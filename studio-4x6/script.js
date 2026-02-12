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
lockOverlay.style.backdropFilter = "blur(8px)";
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

// ================== DRAG, RESIZE HANDLE & DELETE ==================
function makeDraggableResizable(el, container){

  el.style.position = "absolute";
  el.style.cursor = "move";

  // Wrap element so we can attach controls
  const wrapper = document.createElement("div");
  wrapper.style.position = "absolute";
  wrapper.style.top = el.style.top;
  wrapper.style.left = el.style.left;
  wrapper.style.width = el.style.width;
  wrapper.style.height = el.style.height;
  wrapper.style.cursor = "move";

  container.appendChild(wrapper);
  wrapper.appendChild(el);

  el.style.position = "absolute";
  el.style.top = "0";
  el.style.left = "0";
  el.style.width = "100%";
  el.style.height = "100%";

  // ---------- DELETE BUTTON ----------
  const deleteBtn = document.createElement("div");
  deleteBtn.innerHTML = "✕";
  deleteBtn.style.position = "absolute";
  deleteBtn.style.top = "-10px";
  deleteBtn.style.right = "-10px";
  deleteBtn.style.width = "22px";
  deleteBtn.style.height = "22px";
  deleteBtn.style.background = "black";
  deleteBtn.style.color = "white";
  deleteBtn.style.fontSize = "14px";
  deleteBtn.style.display = "flex";
  deleteBtn.style.alignItems = "center";
  deleteBtn.style.justifyContent = "center";
  deleteBtn.style.borderRadius = "50%";
  deleteBtn.style.cursor = "pointer";
  deleteBtn.style.zIndex = "20";

  deleteBtn.onclick = () => wrapper.remove();
  wrapper.appendChild(deleteBtn);

  // ---------- RESIZE HANDLE ----------
  const resizeHandle = document.createElement("div");
  resizeHandle.style.position = "absolute";
  resizeHandle.style.width = "15px";
  resizeHandle.style.height = "15px";
  resizeHandle.style.right = "0";
  resizeHandle.style.bottom = "0";
  resizeHandle.style.background = "white";
  resizeHandle.style.border = "2px solid black";
  resizeHandle.style.cursor = "se-resize";
  resizeHandle.style.zIndex = "20";

  wrapper.appendChild(resizeHandle);

  // ---------- DRAG ----------
  let isDragging = false, offsetX, offsetY;

  wrapper.addEventListener("mousedown", e => {
    if(e.target === resizeHandle || e.target === deleteBtn) return;
    isDragging = true;
    offsetX = e.offsetX;
    offsetY = e.offsetY;
  });

  document.addEventListener("mousemove", e => {
    if(!isDragging) return;

    let rect = container.getBoundingClientRect();
    let x = e.clientX - rect.left - offsetX;
    let y = e.clientY - rect.top - offsetY;

    x = Math.max(0, Math.min(container.offsetWidth - wrapper.offsetWidth, x));
    y = Math.max(0, Math.min(container.offsetHeight - wrapper.offsetHeight, y));

    wrapper.style.left = x + "px";
    wrapper.style.top = y + "px";
  });

  document.addEventListener("mouseup", () => isDragging = false);

  // ---------- RESIZE (DRAG HANDLE) ----------
  let isResizing = false;

  resizeHandle.addEventListener("mousedown", e => {
    e.stopPropagation();
    isResizing = true;
  });

  document.addEventListener("mousemove", e => {
    if(!isResizing) return;

    let rect = container.getBoundingClientRect();
    let newWidth = e.clientX - rect.left - wrapper.offsetLeft;

    if(newWidth > 50 && newWidth < 800){
      wrapper.style.width = newWidth + "px";
    }
  });

  document.addEventListener("mouseup", () => isResizing = false);
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












