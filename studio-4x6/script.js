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

  if (photos.length >= 4) {
    alert("You can only add up to 4 photos on a 4x6 layout.");
    return;
  }

  const canvasTmp = document.createElement('canvas');
  canvasTmp.width = video.videoWidth;
  canvasTmp.height = video.videoHeight;
  const ctx = canvasTmp.getContext('2d');
  ctx.drawImage(video, 0, 0, canvasTmp.width, canvasTmp.height);

  const img = document.createElement('img');
  img.src = canvasTmp.toDataURL('image/png');

  // ==== 4x6 photo sizing ====
  const padding = 10;
  const maxWidth = scrapCanvas.offsetWidth - padding*2;
  const maxHeight = scrapCanvas.offsetHeight - padding*2;
  const aspectRatio = canvasTmp.width / canvasTmp.height;

  let photoWidth = maxWidth;
  let photoHeight = photoWidth / aspectRatio;
  if(photoHeight > maxHeight){
    photoHeight = maxHeight;
    photoWidth = photoHeight * aspectRatio;
  }

  img.style.width = photoWidth + "px";
  img.style.height = photoHeight + "px";
  img.style.position = "absolute";

  // Start in center
  const startLeft = (scrapCanvas.offsetWidth - photoWidth)/2;
  const startTop = (scrapCanvas.offsetHeight - photoHeight)/2;

  // Free dragging/resizing
  makeDraggableResizable(img, scrapCanvas, startLeft, startTop);

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
function makeDraggableResizable(el, container, startLeft=0, startTop=0){
  const wrapper = document.createElement("div");
  wrapper.style.position = "absolute";
  wrapper.style.top = startTop + "px";
  wrapper.style.left = startLeft + "px";
  wrapper.style.width = el.style.width;
  wrapper.style.height = el.style.height;
  wrapper.style.cursor = "move";
  wrapper.style.zIndex = 20;

  el.style.position = "absolute";
  el.style.top = "0";
  el.style.left = "0";
  el.style.width = "100%";
  el.style.height = "100%";
  wrapper.appendChild(el);
  container.appendChild(wrapper);

  // DELETE & RESIZE handle code stays the same...
}

  // === DELETE BUTTON ===
  const deleteBtn = document.createElement("div");
  deleteBtn.innerHTML = "✖";
  deleteBtn.style.position = "absolute";
  deleteBtn.style.top = "-10px";
  deleteBtn.style.right = "-10px";
  deleteBtn.style.width = "20px";
  deleteBtn.style.height = "20px";
  deleteBtn.style.background = "red";
  deleteBtn.style.color = "#fff";
  deleteBtn.style.borderRadius = "50%";
  deleteBtn.style.display = "flex";
  deleteBtn.style.alignItems = "center";
  deleteBtn.style.justifyContent = "center";
  deleteBtn.style.fontSize = "14px";
  deleteBtn.style.cursor = "pointer";
  deleteBtn.style.zIndex = "30";
  deleteBtn.addEventListener("click", () => {
    wrapper.remove();
    photos = photos.filter(p => p !== el);
  });
  wrapper.appendChild(deleteBtn);

  // === RESIZE HANDLE ===
  const resizeHandle = document.createElement("div");
  resizeHandle.style.position = "absolute";
  resizeHandle.style.width = "15px";
  resizeHandle.style.height = "15px";
  resizeHandle.style.background = "gold";
  resizeHandle.style.right = "-5px";
  resizeHandle.style.bottom = "-5px";
  resizeHandle.style.cursor = "nwse-resize";
  resizeHandle.style.zIndex = "30";
  wrapper.appendChild(resizeHandle);

  let isDragging = false, dragOffsetX, dragOffsetY;
  let isResizing = false, startWidth, startHeight, startX, startY;

  // === DRAGGING ===
  wrapper.addEventListener("mousedown", e => {
    if(e.target === resizeHandle || e.target === deleteBtn) return;
    isDragging = true;
    dragOffsetX = e.offsetX;
    dragOffsetY = e.offsetY;
  });

  document.addEventListener("mousemove", e => {
    if(isDragging){
      const rect = container.getBoundingClientRect();
      let x = e.clientX - rect.left - dragOffsetX;
      let y = e.clientY - rect.top - dragOffsetY;
      x = Math.max(0, Math.min(container.offsetWidth - wrapper.offsetWidth, x));
      y = Math.max(0, Math.min(container.offsetHeight - wrapper.offsetHeight, y));
      wrapper.style.left = x + "px";
      wrapper.style.top = y + "px";
    }

    if(isResizing){
      const dx = e.clientX - startX;
      const dy = e.clientY - startY;
      let newWidth = startWidth + dx;
      let newHeight = startHeight + dy;
      const aspectRatio = startWidth / startHeight;

      // maintain aspect ratio
      if(newWidth / newHeight > aspectRatio) newHeight = newWidth / aspectRatio;
      else newWidth = newHeight * aspectRatio;

      // bounds check
      newWidth = Math.min(newWidth, container.offsetWidth - wrapper.offsetLeft);
      newHeight = Math.min(newHeight, container.offsetHeight - wrapper.offsetTop);
      newWidth = Math.max(newWidth, 50);
      newHeight = Math.max(newHeight, 50);

      wrapper.style.width = newWidth + "px";
      wrapper.style.height = newHeight + "px";
    }
  });

  document.addEventListener("mouseup", () => {
    isDragging = false;
    isResizing = false;
  });

  // === RESIZING ===
  resizeHandle.addEventListener("mousedown", e => {
    e.stopPropagation();
    isResizing = true;
    startWidth = wrapper.offsetWidth;
    startHeight = wrapper.offsetHeight;
    startX = e.clientX;
    startY = e.clientY;
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












