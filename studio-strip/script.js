document.addEventListener("DOMContentLoaded", function () {

const video = document.getElementById('video');
const startBtn = document.getElementById('startBtn');
const takePhotoBtn = document.getElementById('takePhotoBtn');
const resetBtn = document.getElementById('resetBtn');
const downloadBtn = document.getElementById('downloadBtn');

const scrapCanvas = document.getElementById('scrapCanvas');
const templateImg = document.getElementById('templateImg');
const photoLayer = document.getElementById('photoLayer');
const stickerLayer = document.getElementById('stickerLayer');
const stickerBar = document.getElementById('stickerBar');

const mode = document.body.dataset.mode; // strip or four

// Load frame
const frameUrl = localStorage.getItem('frame');
if (templateImg && frameUrl) templateImg.src = frameUrl;

// START CAMERA
async function startCamera() {
  try {
    const stream = await navigator.mediaDevices.getUserMedia({ video: true });
    video.srcObject = stream;
    video.play();
  } catch (err) {
    alert("Camera error: " + err);
  }
}

if (startBtn) {
  startBtn.addEventListener("click", startCamera);
}

// AUTO START camera (optional — remove if you don’t want auto start)
startCamera();

let photos = [];

// TAKE PHOTO
if (takePhotoBtn) {
  takePhotoBtn.addEventListener("click", () => {

    if (!video.videoWidth) return;

    const canvas = document.createElement("canvas");
    canvas.width = video.videoWidth;
    canvas.height = video.videoHeight;

    const ctx = canvas.getContext("2d");
    ctx.drawImage(video, 0, 0);

    const img = document.createElement("img");
    img.src = canvas.toDataURL("image/png");
    img.style.position = "absolute";

    if (mode === "strip") {

      // 1x3 layout (4 stacked)
      const slotHeight = scrapCanvas.offsetHeight / 4;

      img.style.width = "100%";
      img.style.height = slotHeight + "px";
      img.style.left = "0px";
      img.style.top = (photos.length * slotHeight) + "px";

    } else {

      // 4x6 draggable
      img.style.width = "180px";
      img.style.left = "20px";
      img.style.top = "20px";

      makeDraggableResizable(img, scrapCanvas);
    }

    photos.push(img);
    photoLayer.appendChild(img);

  });
}

// RESET
if (resetBtn) {
  resetBtn.addEventListener("click", () => {
    photos = [];
    photoLayer.innerHTML = "";
    stickerLayer.innerHTML = "";
  });
}

// STICKERS
const stickers = [
  "YOUR_STICKER_1.png",
  "YOUR_STICKER_2.png",
  "YOUR_STICKER_3.png"
];

if (stickerBar) {
  stickers.forEach(url => {

    const btn = document.createElement("button");
    const preview = document.createElement("img");

    preview.src = url;
    preview.style.width = "50px";
    preview.style.height = "50px";

    btn.appendChild(preview);

    btn.addEventListener("click", () => {

      const sticker = document.createElement("img");
      sticker.src = url;
      sticker.style.position = "absolute";
      sticker.style.width = "100px";
      sticker.style.left = "30px";
      sticker.style.top = "30px";

      makeDraggableResizable(sticker, scrapCanvas);
      stickerLayer.appendChild(sticker);

    });

    stickerBar.appendChild(btn);
  });
}

// DRAG FUNCTION
function makeDraggableResizable(el, container) {

  let isDragging = false;
  let offsetX, offsetY;

  el.addEventListener("mousedown", (e) => {
    isDragging = true;
    const rect = el.getBoundingClientRect();
    offsetX = e.clientX - rect.left;
    offsetY = e.clientY - rect.top;
  });

  document.addEventListener("mousemove", (e) => {
    if (!isDragging) return;

    const containerRect = container.getBoundingClientRect();

    let x = e.clientX - offsetX - containerRect.left;
    let y = e.clientY - offsetY - containerRect.top;

    x = Math.max(0, Math.min(container.offsetWidth - el.offsetWidth, x));
    y = Math.max(0, Math.min(container.offsetHeight - el.offsetHeight, y));

    el.style.left = x + "px";
    el.style.top = y + "px";
  });

  document.addEventListener("mouseup", () => {
    isDragging = false;
  });

  // Resize on double click
  el.addEventListener("dblclick", () => {
    const newWidth = prompt("Enter width in px:", el.offsetWidth);
    if (newWidth) {
      el.style.width = newWidth + "px";
    }
  });
}

// DOWNLOAD (html2canvas required)
if (downloadBtn) {
  downloadBtn.addEventListener("click", () => {

    html2canvas(scrapCanvas).then(canvas => {
      const link = document.createElement("a");
      link.download = "scrapfoto.png";
      link.href = canvas.toDataURL();
      link.click();
    });

  });
}

});









