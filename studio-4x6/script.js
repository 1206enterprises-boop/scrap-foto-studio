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

let photos = [];

// Load selected Canva frame
const frameUrl = localStorage.getItem('frame');
if (templateImg && frameUrl) {
  templateImg.src = frameUrl;
}

// CAMERA START
async function startCamera() {
  try {
    const stream = await navigator.mediaDevices.getUserMedia({
      video: { facingMode: "user" },
      audio: false
    });

    video.srcObject = stream;
    await video.play();

  } catch (err) {
    alert("Camera not accessible: " + err.message);
  }
}

// Start camera when button clicked
if (startBtn) {
  startBtn.addEventListener("click", startCamera);
}

// OPTIONAL: Auto start camera
startCamera();


// TAKE PHOTO (4x6 ONLY – always draggable)
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
    img.style.width = "200px";
    img.style.left = "30px";
    img.style.top = "30px";
    img.style.cursor = "move";

    makeDraggableResizable(img, scrapCanvas);

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
      sticker.style.width = "120px";
      sticker.style.left = "40px";
      sticker.style.top = "40px";
      sticker.style.cursor = "move";

      makeDraggableResizable(sticker, scrapCanvas);
      stickerLayer.appendChild(sticker);

    });

    stickerBar.appendChild(btn);
  });
}


// DRAG + RESIZE
function makeDraggableResizable(el, container) {

  let isDragging = false;
  let offsetX = 0;
  let offsetY = 0;

  el.addEventListener("mousedown", (e) => {
    isDragging = true;
    const rect = el.getBoundingClientRect();
    offsetX = e.clientX - rect.left;
    offsetY = e.clientY - rect.top;
    el.style.zIndex = 50;
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
    const newWidth = prompt("Enter new width in px:", el.offsetWidth);
    if (newWidth && !isNaN(newWidth)) {
      el.style.width = newWidth + "px";
    }
  });
}


// DOWNLOAD FINAL IMAGE
if (downloadBtn) {
  downloadBtn.addEventListener("click", () => {

    if (typeof html2canvas === "undefined") {
      alert("html2canvas library missing.");
      return;
    }

    html2canvas(scrapCanvas).then(canvas => {
      const link = document.createElement("a");
      link.download = "scrapfoto-4x6.png";
      link.href = canvas.toDataURL();
      link.click();
    });

  });
}

});







