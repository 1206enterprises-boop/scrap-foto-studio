// ================== STRIPE + WATERMARK ==================
const STRIPE_DIGITAL_URL = "https://buy.stripe.com/dRmcN753l51z0JS2gq2Nq01"; // $5 digital copy

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
const scrapCanvas = document.getElementById('scrapCanvas');
const photoLayer = document.getElementById('photoLayer');
const stickerLayer = document.getElementById('stickerLayer');
const stickerBar = document.getElementById('stickerBar');
const downloadDigitalBtn = document.getElementById('downloadDigitalBtn');
const upgradeBtn = document.getElementById('upgradeBtn');

// ================== FRAMES ==================
const frames = [
  "https://static.wixstatic.com/media/67478d_0cbb389304ff4bfb96eaec471ef31a61~mv2.png",
  "https://i.imgur.com/frame2.png",
  "https://i.imgur.com/frame3.png"
];

const frameLayer = document.getElementById('frameLayer');
frames.forEach(url => {
  const btn = document.createElement('button');
  const thumb = document.createElement("img");
  thumb.src = url;
  thumb.classList.add("frame-thumbnail");
  btn.appendChild(thumb);
  btn.addEventListener('click', () => {
    frameLayer.innerHTML = "";
    const frameImg = document.createElement('img');
    frameImg.src = url;
    frameLayer.appendChild(frameImg);
  });
  document.getElementById("framesGallery").appendChild(btn);
});

let photos = [];

async function startCamera() {
  try {
    const stream = await navigator.mediaDevices.getUserMedia({ video: { facingMode: "user" }, audio: false });
    video.srcObject = stream;
  } catch (err) {
    alert("Camera not accessible: " + err);
  }
}
startBtn.addEventListener('click', startCamera);

// ================== TAKE PHOTO + COUNTDOWN ==================
function takePhoto() {
  if (!video.videoWidth) return;

  const canvas = document.createElement('canvas');
  canvas.width = video.videoWidth;
  canvas.height = video.videoHeight;

  const ctx = canvas.getContext('2d');
  ctx.drawImage(video, 0, 0, canvas.width, canvas.height);

  const img = document.createElement('img');
  img.src = canvas.toDataURL('image/png');

  img.style.width = "150px";
  img.style.height = "auto";
  img.style.top = "10px";
  img.style.left = "10px";
  makeDraggableResizable(img, scrapCanvas);

  photos.push(img);
  photoLayer.appendChild(img);

  // Rotate button
  const rotateBtn = document.createElement('button');
  rotateBtn.innerHTML = '⟳';
  rotateBtn.style.position = 'absolute';
  rotateBtn.style.top = '5px';
  rotateBtn.style.right = '5px';
  rotateBtn.style.zIndex = 20;
  rotateBtn.style.background = '#FFD700';
  rotateBtn.style.border = 'none';
  rotateBtn.style.borderRadius = '50%';
  rotateBtn.style.width = '30px';
  rotateBtn.style.height = '30px';
  rotateBtn.style.cursor = 'pointer';
  rotateBtn.addEventListener('click', () => img.rotate(90));
  img.parentElement.appendChild(rotateBtn);
}

function startCountdown(seconds) {
  const overlay = document.getElementById("countdownOverlay");
  if (!overlay) return;

  let count = seconds;
  overlay.style.display = "flex";
  overlay.textContent = count;

  const interval = setInterval(() => {
    count--;
    if (count > 0) overlay.textContent = count;
    else {
      clearInterval(interval);
      overlay.style.display = "none";
      takePhoto();
    }
  }, 1000);
}

takePhotoBtn.addEventListener('click', () => startCountdown(3));
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
  el.style.transform = "rotate(0deg)";
  let isDragging = false, offsetX, offsetY, currentRotation = 0;
  el.addEventListener("mousedown", e => { isDragging = true; offsetX = e.offsetX; offsetY = e.offsetY; });
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
  el.addEventListener("touchstart", e => {
    if (e.touches.length === 2) {
      initialDistance = Math.hypot(e.touches[0].clientX - e.touches[1].clientX, e.touches[0].clientY - e.touches[1].clientY);
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
      let currentDistance = Math.hypot(e.touches[0].clientX - e.touches[1].clientX, e.touches[0].clientY - e.touches[1].clientY);
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

// ================== DIGITAL DOWNLOAD BUTTON ==================
downloadDigitalBtn.addEventListener('click', () => {
  if (!scrapCanvas) return alert("Canvas not ready");

  const tempCanvas = document.createElement('canvas');
  tempCanvas.width = scrapCanvas.offsetWidth;
  tempCanvas.height = scrapCanvas.offsetHeight;
  const ctx = tempCanvas.getContext('2d');

  const elements = scrapCanvas.querySelectorAll('img');
  elements.forEach(el => {
    const rect = el.getBoundingClientRect();
    const parentRect = scrapCanvas.getBoundingClientRect();
    const x = rect.left - parentRect.left;
    const y = rect.top - parentRect.top;
    ctx.drawImage(el, x, y, el.offsetWidth, el.offsetHeight);
  });

  addWatermark(tempCanvas);
  localStorage.setItem('scrapPhoto', tempCanvas.toDataURL('image/png'));

  window.open('https://buy.stripe.com/dRmcN753l51z0JS2gq2Nq01', "_blank");
  alert("Complete payment in the new tab, then go to the success page to download.");
});

// ================== UPGRADE BUTTON ==================
upgradeBtn.addEventListener('click', () => {
  const imageData = localStorage.getItem('scrapPhoto');
  if (!imageData) return alert("Please download the digital copy first.");
  const encodedImg = encodeURIComponent(imageData);
  window.location.href = `https://www.yourwixsite.com/scrapfoto-upgrades?image=${encodedImg}`;
});

// ===== Disable Right Click on Images =====
document.addEventListener('contextmenu', e => {
  if (e.target.tagName === 'IMG') e.preventDefault();
});
