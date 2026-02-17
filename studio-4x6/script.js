// ================== CONFIG ==================
const STRIPE_URL = "https://buy.stripe.com/YOUR_LINK_HERE"; // replace with Stripe link

// ================== CAMERA ==================
const video = document.getElementById("video");
const startBtn = document.getElementById("startBtn");
const takePhotoBtn = document.getElementById("takePhotoBtn");
const resetBtn = document.getElementById("resetBtn");
const downloadBtn = document.getElementById("downloadBtn");

const scrapCanvas = document.getElementById("scrapCanvas");
const photoLayer = document.getElementById("photoLayer");
const frameLayer = document.getElementById("frameLayer");
const stickerLayer = document.getElementById("stickerLayer");
const framesGallery = document.getElementById("framesGallery");
const stickerBar = document.getElementById("stickerBar");
const countdownOverlay = document.getElementById("countdownOverlay");

let currentFilter = "none";
let photos = [];
let isPaid = false;

// ================== START CAMERA ==================
async function startCamera() {
  try {
    const stream = await navigator.mediaDevices.getUserMedia({ video: { facingMode: "user" }, audio: false });
    video.srcObject = stream;
  } catch (err) {
    alert("Camera not accessible: " + err);
  }
}
startBtn.addEventListener("click", startCamera);

// ================== FILTERS ==================
function setFilter(value) {
  currentFilter = value;
  video.style.filter = value;
}
window.setFilter = setFilter; // make it global for HTML buttons

// ================== COUNTDOWN & TAKE PHOTO ==================
function startCountdown(seconds, callback) {
  let count = seconds;
  countdownOverlay.style.display = "flex";
  countdownOverlay.textContent = count;

  const interval = setInterval(() => {
    count--;
    if (count > 0) {
      countdownOverlay.textContent = count;
    } else {
      clearInterval(interval);
      countdownOverlay.style.display = "none";
      callback();
    }
  }, 1000);
}

takePhotoBtn.addEventListener("click", () => {
  if (!video.videoWidth) {
    alert("Camera not started!");
    return;
  }
  startCountdown(3, takePhoto);
});

// ================== TAKE PHOTO FUNCTION ==================
function takePhoto() {
  const canvas = document.createElement("canvas");
  canvas.width = video.videoWidth;
  canvas.height = video.videoHeight;
  const ctx = canvas.getContext("2d");
  ctx.filter = currentFilter;
  ctx.drawImage(video, 0, 0, canvas.width, canvas.height);

  const img = document.createElement("img");
  img.src = canvas.toDataURL("image/png");
  img.style.position = "absolute";
  img.style.width = "100%";
  img.style.height = "100%";
  img.style.objectFit = "cover";

  photoLayer.appendChild(img);
  photos.push(img);
}

// ================== RESET ==================
resetBtn.addEventListener("click", () => {
  photos = [];
  photoLayer.innerHTML = "";
  stickerLayer.innerHTML = "";
  frameLayer.innerHTML = "";
});

// ================== FRAMES ==================
const frames = [
  "https://static.wixstatic.com/media/67478d_1280ee3cf27345d983b01024064aad10~mv2.png",
  "https://i.imgur.com/frame2.png",
  "https://i.imgur.com/frame3.png"
];

frames.forEach(url => {
  const img = document.createElement("img");
  img.src = url;
  img.className = "frame-thumbnail";
  img.addEventListener("click", () => {
    frameLayer.innerHTML = "";
    const f = document.createElement("img");
    f.src = url;
    f.style.position = "absolute";
    f.style.width = "100%";
    f.style.height = "100%";
    f.style.objectFit = "cover";
    frameLayer.appendChild(f);
  });
  framesGallery.appendChild(img);
});

// ================== STICKERS ==================
const stickers = [
  "https://static.wixstatic.com/media/67478d_4f71ca963cda42a983f251055f03011a~mv2.png",
  "https://static.wixstatic.com/media/67478d_51e4fa7634da47388a030739486d9da2~mv2.png",
  "https://i.imgur.com/Sticker3.png"
];

stickers.forEach(url => {
  const btn = document.createElement("button");
  const img = document.createElement("img");
  img.src = url;
  btn.appendChild(img);
  btn.addEventListener("click", () => {
    const s = document.createElement("img");
    s.src = url;
    s.style.position = "absolute";
    s.style.width = "80px";
    s.style.height = "80px";
    s.style.top = "20px";
    s.style.left = "20px";
    stickerLayer.appendChild(s);
    makeDraggableResizable(s, scrapCanvas);
  });
  stickerBar.appendChild(btn);
});

// ================== DRAG & RESIZE ==================
function makeDraggableResizable(el, container) {
  el.style.position = "absolute";
  el.style.cursor = "move";
  let isDragging = false, offsetX, offsetY;

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
}

// ================== DOWNLOAD / STRIPE ==================
downloadBtn.addEventListener("click", () => {
  if (!isPaid) {
    window.open(STRIPE_URL, "_blank");
    const confirmDownload = confirm("After completing payment, click OK to unlock and download your design.");
    if (!confirmDownload) return;
    isPaid = true;
  }

  html2canvas(scrapCanvas).then(canvas => {
    const link = document.createElement("a");
    link.href = canvas.toDataURL("image/png");
    link.download = "scrapbook.png";
    link.click();
  });
});
