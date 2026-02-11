const video = document.getElementById("video");
const canvas = document.getElementById("canvas");
const captureBtn = document.getElementById("captureBtn");
const thumbnails = document.getElementById("thumbnails");
const scrapArea = document.getElementById("scrapArea");
const backgroundSelect = document.getElementById("backgroundSelect");
const exportBtn = document.getElementById("exportBtn");
const stickers = document.querySelectorAll(".sticker");

let photoCount = 0;
const MAX_PHOTOS = 4;

// Start Camera
async function startCamera() {
  try {
    const stream = await navigator.mediaDevices.getUserMedia({ video: { facingMode: "user" }, audio: false });
    video.srcObject = stream;
  } catch (err) {
    alert("Camera access is required!");
    console.error(err);
  }
}

// Capture Photo
captureBtn.addEventListener("click", () => {
  if (photoCount >= MAX_PHOTOS) return;

  const ctx = canvas.getContext("2d");
  canvas.width = video.videoWidth;
  canvas.height = video.videoHeight;
  ctx.drawImage(video, 0, 0);

  const imgData = canvas.toDataURL("image/png");

  const thumb = document.createElement("img");
  thumb.src = imgData;
  thumb.className = "thumbnail";
  thumbnails.appendChild(thumb);

  // Click thumbnail to add to scrap
  thumb.addEventListener("click", () => {
    const img = document.createElement("img");
    img.src = imgData;
    img.style.top = "10px";
    img.style.left = "10px";
    img.style.width = "100px";
    scrapArea.appendChild(img);
    makeDraggableResizable(img);
  });

  photoCount++;
  if (photoCount === MAX_PHOTOS) captureBtn.disabled = true;
});

// Stickers - draggable into scrap
stickers.forEach(sticker => {
  sticker.addEventListener("click", () => {
    const img = document.createElement("img");
    img.src = sticker.src;
    img.style.top = "10px";
    img.style.left = "10px";
    img.style.width = "50px";
    scrapArea.appendChild(img);
    makeDraggableResizable(img);
  });
});

// Backgrounds
const backgrounds = {
  "white": "#ffffff",
  "pink": "#ffc0cb",
  "blue": "#87ceeb",
  "pattern1": "https://YOUR-WIX-URL/pattern1.png",
  "pattern2": "https://YOUR-WIX-URL/pattern2.png"
};

backgroundSelect.addEventListener("change", () => {
  const val = backgroundSelect.value;
  if (val.startsWith("http") || val.startsWith("https")) {
    scrapArea.style.backgroundImage = `url(${backgrounds[val]})`;
    scrapArea.style.backgroundSize = "cover";
    scrapArea.style.backgroundColor = "";
  } else {
    scrapArea.style.backgroundColor = backgrounds[val];
    scrapArea.style.backgroundImage = "";
  }
});

// Export Scrap
exportBtn.addEventListener("click", () => {
  html2canvas(scrapArea).then(canvas => {
    const link = document.createElement("a");
    link.href = canvas.toDataURL("image/png");
    link.download = "scrap.png";
    link.click();
  });
});

// Make element draggable & resizable
function makeDraggableResizable(el) {
  interact(el)
    .draggable({
      inertia: true,
      modifiers: [interact.modifiers.restrictRect({ restriction: scrapArea })],
      listeners: {
        move(event) {
          const x = (parseFloat(el.getAttribute('data-x')) || 0) + event.dx;
          const y = (parseFloat(el.getAttribute('data-y')) || 0) + event.dy;
          el.style.transform = `translate(${x}px, ${y}px)`;
          el.setAttribute('data-x', x);
          el.setAttribute('data-y', y);
        }
      }
    })
    .resizable({
      edges: { left: true, right: true, bottom: true, top: true },
      listeners: {
        move(event) {
          let { width, height } = event.rect;
          el.style.width = width + 'px';
          el.style.height = height + 'px';

          const x = (parseFloat(el.getAttribute('data-x')) || 0) + event.deltaRect.left;
          const y = (parseFloat(el.getAttribute('data-y')) || 0) + event.deltaRect.top;
          el.style.transform = `translate(${x}px, ${y}px)`;
          el.setAttribute('data-x', x);
          el.setAttribute('data-y', y);
        }
      },
      modifiers: [
        interact.modifiers.restrictEdges({ outer: scrapArea })
      ],
      inertia: true
    });
}

startCamera();



