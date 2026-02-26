// ================== STRIPE ==================
const STRIPE_DIGITAL_URL = "https://buy.stripe.com/dRmcN753l51z0JS2gq2Nq01"; // $5 digital copy

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

// ================== NEW COUNTDOWN ANIMATION ==================
function startCountdown(seconds) {
  const overlay = document.getElementById("countdownOverlay");
  if (!overlay) return;

  let count = seconds;
  overlay.style.display = "flex";

  const countdownStep = () => {
    if (count > 0) {
      overlay.textContent = count;
      overlay.style.animation = "countdown-scale 1s ease-in-out";
      setTimeout(() => {
        overlay.style.animation = "none"; // Reset animation
      }, 1000);
      count--;
      setTimeout(countdownStep, 1000);
    } else {
      overlay.style.display = "none";
      takePhoto();
    }
  };

  countdownStep();
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

  // Touch support omitted for brevity
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

  localStorage.setItem('scrapPhoto', tempCanvas.toDataURL('image/png'));

  window.open(STRIPE_DIGITAL_URL, "_blank");
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
