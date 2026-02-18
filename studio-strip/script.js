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
const frameLayer = document.getElementById('frameLayer');       // overlay frames on photos
const framesGallery = document.getElementById('framesGallery'); // container for vertical gallery

// ================== FRAMES ==================
const frames = [
  "https://static.wixstatic.com/media/67478d_1280ee3cf27345d983b01024064aad10~mv2.png",
  "https://i.imgur.com/frame2.png",
  "https://i.imgur.com/frame3.png"
];

frames.forEach(url => {
  const img = document.createElement('img');
  img.src = url;
  img.className = 'frame-thumbnail'; // CSS handles sizing
  img.addEventListener('click', () => {
    frameLayer.innerHTML = ''; // remove previous frame
    const frameImg = document.createElement('img');
    frameImg.src = url;
    frameImg.style.width = '100%';
    frameImg.style.height = '100%';
    frameImg.style.objectFit = 'cover';
    frameImg.style.position = 'absolute';
    frameImg.style.top = 0;
    frameImg.style.left = 0;
    frameImg.style.zIndex = 5;       // frames above photos
    frameImg.style.pointerEvents = 'none'; // stickers can go over frames
    frameLayer.appendChild(frameImg);
  });
  framesGallery.appendChild(img); // vertical gallery
});

let currentFilter = "none"; // Track the currently selected filter
let isPaid = false;          // Track if payment is completed

function setFilter(value) {
  currentFilter = value;

  // Apply filter on video element
  video.style.filter = value;
  video.style.webkitFilter = value; // ✅ ensures Safari / iOS applies it
}

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

function startCountdown(seconds, callback) {
  const overlay = document.getElementById("countdownOverlay");
  let remaining = seconds;

  overlay.style.display = "flex";
  overlay.textContent = remaining;

  const interval = setInterval(() => {
    remaining--;

    if (remaining > 0) {
      overlay.textContent = remaining;
      overlay.classList.remove("countdown-scale");
      void overlay.offsetWidth; // restart animation
      overlay.classList.add("countdown-scale");
    } else {
      clearInterval(interval);
      overlay.style.display = "none";
      callback();
    }
  }, 1000);
}


// ================== TAKE PHOTO WITH COUNTDOWN (Mobile-Friendly) ==================
takePhotoBtn.addEventListener('click', () => {
  const width = video.videoWidth || video.clientWidth;
  const height = video.videoHeight || video.clientHeight;

  if (!width || !height) {
    alert("Camera not ready yet, please wait a moment.");
    return;
  }

  const maxPhotos = 3;
  if (photos.length >= maxPhotos) {
    alert(`This strip allows only ${maxPhotos} photos.`);
    return;
  }

  startCountdown(3, () => {
    const canvas = document.createElement('canvas');
    canvas.width = width;
    canvas.height = height;
    const ctx = canvas.getContext('2d');

    ctx.filter = currentFilter || "none";
    ctx.drawImage(video, 0, 0, width, height);

    const img = document.createElement('img');
    img.src = canvas.toDataURL('image/png');

    // Photostrip layout settings...
    const sidePadding = 20;
    const topMargin = 40;
    const bottomMargin = 120;
    const gap = 25;
    const numPhotos = maxPhotos;
    const videoRatio = height / width;
    const photoWidth = scrapCanvas.offsetWidth - sidePadding*2;
    const photoHeight = photoWidth * videoRatio;

    scrapCanvas.style.height =
      `${topMargin + bottomMargin + gap*(maxPhotos-1) + photoHeight*maxPhotos}px`;

    img.style.position = "absolute";
    img.style.width = `${photoWidth}px`;
    img.style.height = `${photoHeight}px`;
    img.style.objectFit = "cover";
    img.style.left = `${sidePadding}px`;
    img.style.top = `${topMargin + photos.length * (photoHeight + gap)}px`;
    img.style.borderRadius = "8px";

    photos.push(img);
    photoLayer.appendChild(img);

    // Add caption on last photo
    if (photos.length === maxPhotos) {
      const caption = document.createElement("div");
      caption.innerText = "VISURA HAUS ✨ " + new Date().toLocaleDateString();
      caption.style.position = "absolute";
      caption.style.bottom = "40px";
      caption.style.width = "100%";
      caption.style.textAlign = "center";
      caption.style.fontWeight = "bold";
      caption.style.fontSize = "22px";
      caption.style.fontFamily = "Courier New, monospace";
      caption.style.letterSpacing = "2px";
      caption.style.color = "#111";
      caption.style.zIndex = "6";

      photoLayer.appendChild(caption);
    }
  });
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

// ================== DOWNLOAD / STRIPE ==================
downloadBtn.addEventListener('click', async () => {

  if (!isPaid) {
    window.open(STRIPE_URL, "_blank");

    const confirmDownload = confirm("After completing payment, click OK to unlock and download your design.");
    if (!confirmDownload) return;

    isPaid = true;
  }

  // Create canvas for photostrip
  const canvas = document.createElement('canvas');
  canvas.width = scrapCanvas.offsetWidth;
  canvas.height = scrapCanvas.offsetHeight;
  const ctx = canvas.getContext('2d');

  // Draw all images from scrapCanvas
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
        // ✅ Apply the current filter to the canvas context
        ctx.filter = currentFilter || "none";
        ctx.drawImage(img, x, y, el.offsetWidth, el.offsetHeight);
        resolve();
      };
    });
  }

  addWatermark(canvas);

  // Trigger download
  const link = document.createElement('a');
  link.href = canvas.toDataURL('image/png');
  link.download = "visura-strip.png";
  link.click();
});

// ===== Disable Right Click on Images =====
document.addEventListener('contextmenu', function(e) {
  if (e.target.tagName === 'IMG') {
    e.preventDefault();
  }
});








