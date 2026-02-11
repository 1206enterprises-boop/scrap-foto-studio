// ----------------------
// Scrap Foto Studio JS
// ----------------------

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

// ---------- 1️⃣ Start Camera ----------
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

// ---------- 2️⃣ Capture Photo ----------
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

  // drag logic handled in scrapArea drop
  thumbnails.appendChild(img);

  if (photos.length === MAX_PHOTOS) captureBtn.disabled = true;
});

// ---------- 3️⃣ Scrap Area Drag & Drop ----------
scrapArea.addEventListener("dragover", e => e.preventDefault());
scrapArea.addEventListener("drop", e => {
  e.preventDefault();
  const src = e.dataTransfer.getData("text/plain");

  // Check if it's a thumbnail in the top bar
  const draggedImg = Array.from(thumbnails.querySelectorAll("img")).find(
    img => img.src === src
  );

  if (draggedImg) {
    // Move the thumbnail itself into scrap area
    draggedImg.style.position = "absolute";
    draggedImg.style.left = e.offsetX + "px";
    draggedImg.style.top = e.offsetY + "px";
    scrapArea.appendChild(draggedImg);
  } else {
    // It's a sticker → duplicate
    const img = document.createElement("img");
    img.src = src;
    img.style.position = "absolute";
    img.style.left = e.offsetX + "px";
    img.style.top = e.offsetY + "px";
    img.style.width = "50px"; // default sticker size
    scrapArea.appendChild(img);
  }
});

// ---------- 4️⃣ Stickers Drag ----------
stickers.forEach(sticker => {
  sticker.addEventListener("dragstart", e => {
    e.dataTransfer.setData("text/plain", e.target.src);
  });
});

// ---------- 5️⃣ Change Background ----------
const backgrounds = {
  "White": "#ffffff",
  "Pink": "#ffc0cb",
  "Blue": "#87ceeb",
  "Pattern1": "https://YOUR-WIX-URL/pattern1.png", // replace with uploaded Canva/WIX images
  "Pattern2": "https://YOUR-WIX-URL/pattern2.png"
};

backgroundSelect.addEventListener("change", () => {
  const value = backgroundSelect.value;
  if (value.startsWith("http")) {
    // Use a background <img> for patterns
    let bgImg = scrapArea.querySelector(".background-img");
    if (!bgImg) {
      bgImg = document.createElement("img");
      bgImg.className = "background-img";
      bgImg.style.position = "absolute";
      bgImg.style.top = 0;
      bgImg.style.left = 0;
      bgImg.style.width = "100%";
      bgImg.style.height = "100%";
      bgImg.style.zIndex = -1;
      scrapArea.appendChild(bgImg);
    }
    bgImg.src = backgrounds[value];
    scrapArea.style.backgroundColor = "";
  } else {
    // Color background
    scrapArea.style.backgroundColor = backgrounds[value];
    const bgImg = scrapArea.querySelector(".background-img");
    if (bgImg) bgImg.remove();
  }
});

// ---------- 6️⃣ Export Scrap ----------
exportBtn.addEventListener("click", () => {
  const exportCanvas = document.createElement("canvas");
  exportCanvas.width = scrapArea.offsetWidth;
  exportCanvas.height = scrapArea.offsetHeight;
  const ctx = exportCanvas.getContext("2d");

  // Draw background color first
  ctx.fillStyle = scrapArea.style.backgroundColor || "#ffffff";
  ctx.fillRect(0, 0, exportCanvas.width, exportCanvas.height);

  // Draw background image if exists
  const bgImg = scrapArea.querySelector(".background-img");
  if (bgImg) {
    ctx.drawImage(bgImg, 0, 0, exportCanvas.width, exportCanvas.height);
  }

  // Draw all images (photos and stickers)
  const images = scrapArea.querySelectorAll("img:not(.background-img)");
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

// ---------- 7️⃣ Initialize ----------
startCamera();


