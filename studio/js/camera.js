const video = document.getElementById("video");
const canvas = document.getElementById("canvas");
const captureBtn = document.getElementById("captureBtn");
const thumbnails = document.getElementById("thumbnails");

const scrapArea = document.getElementById("scrapArea");
const backgroundSelect = document.getElementById("backgroundSelect");
const exportBtn = document.getElementById("exportBtn");
const stickers = document.querySelectorAll(".sticker");

let photos = [];
const MAX_PHOTOS = 4;

// 1️⃣ Start Camera
async function startCamera() {
  try {
    const stream = await navigator.mediaDevices.getUserMedia({
      video: { facingMode: "user" },
      audio: false
    });
    video.srcObject = stream;
  } catch (err) {
    alert("Camera access is required to use Scrap Foto Studio");
    console.error(err);
  }
}

// 2️⃣ Capture Photo
captureBtn.addEventListener("click", () => {
  if (photos.length >= MAX_PHOTOS) return;

  const ctx = canvas.getContext("2d");
  canvas.width = video.videoWidth;
  canvas.height = video.videoHeight;

  ctx.drawImage(video, 0, 0);

  const imageData = canvas.toDataURL("image/png");
  photos.push(imageData);

  const img = document.createElement("img");
  img.src = imageData;
  img.className = "thumbnail";
  img.draggable = true;

  // Drag to scrap
  img.addEventListener("dragstart", e => {
    e.dataTransfer.setData("text/plain", e.target.src);
  });

  thumbnails.appendChild(img);

  if (photos.length === MAX_PHOTOS) captureBtn.disabled = true;
});

// 3️⃣ Scrap Area Drag & Drop
scrapArea.addEventListener("dragover", e => e.preventDefault());
scrapArea.addEventListener("drop", e => {
  e.preventDefault();
  const src = e.dataTransfer.getData("text/plain");
  const img = document.createElement("img");
  img.src = src;
  img.style.left = e.offsetX + "px";
  img.style.top = e.offsetY + "px";
  scrapArea.appendChild(img);
});

// 4️⃣ Stickers drag
stickers.forEach(sticker => {
  sticker.addEventListener("dragstart", e => {
    e.dataTransfer.setData("text/plain", e.target.src);
  });
});

// 5️⃣ Change Background
backgroundSelect.addEventListener("change", () => {
  scrapArea.style.backgroundColor = backgroundSelect.value;
});

// 6️⃣ Export Scrap
exportBtn.addEventListener("click", () => {
  const exportCanvas = document.createElement("canvas");
  exportCanvas.width = scrapArea.offsetWidth;
  exportCanvas.height = scrapArea.offsetHeight;
  const ctx = exportCanvas.getContext("2d");

  // Draw background
  ctx.fillStyle = scrapArea.style.backgroundColor || "white";
  ctx.fillRect(0, 0, exportCanvas.width, exportCanvas.height);

  // Draw all images inside scrapArea
  const images = scrapArea.querySelectorAll("img");
  images.forEach(img => {
    const x = parseInt(img.style.left) || 0;
    const y = parseInt(img.style.top) || 0;
    ctx.drawImage(img, x, y, img.width, img.height);
  });

  const link = document.createElement("a");
  link.href = exportCanvas.toDataURL("image/png");
  link.download = "scrap.png";
  link.click();
});

startCamera();

