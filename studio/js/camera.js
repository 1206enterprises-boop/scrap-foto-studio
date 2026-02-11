const video = document.getElementById("video");
const canvas = document.getElementById("canvas");
const captureBtn = document.getElementById("captureBtn");
const scrapArea = document.getElementById("scrapArea");
const photoStrip = document.getElementById("photoStrip");
const backgroundSelect = document.getElementById("backgroundSelect");
const resetBtn = document.getElementById("resetBtn");
const exportBtn = document.getElementById("exportBtn");
const stickers = document.querySelectorAll(".sticker");

let photosTaken = 0;
const MAX_PHOTOS = 4;

// Start Camera
async function startCamera() {
  try {
    const stream = await navigator.mediaDevices.getUserMedia({ video: true, audio: false });
    video.srcObject = stream;
  } catch (err) {
    alert("Camera access is required!");
    console.error(err);
  }
}

// Take Photo
captureBtn.addEventListener("click", () => {
  if (photosTaken >= MAX_PHOTOS) return;

  const ctx = canvas.getContext("2d");
  canvas.width = video.videoWidth;
  canvas.height = video.videoHeight;
  ctx.drawImage(video, 0, 0);

  const imgData = canvas.toDataURL("image/png");

  const img = document.createElement("img");
  img.src = imgData;
  photoStrip.appendChild(img);

  photosTaken++;
  if (photosTaken >= MAX_PHOTOS) captureBtn.disabled = true;
});

// Background Templates
const templates = {
  template1: "https://YOUR-WIX-URL/template1.png",
  template2: "https://YOUR-WIX-URL/template2.png"
};

backgroundSelect.addEventListener("change", () => {
  const val = backgroundSelect.value;
  if (!val) return;
  scrapArea.style.backgroundImage = `url(${templates[val]})`;
  scrapArea.style.backgroundSize = "cover";
});

// Stickers
stickers.forEach(sticker => {
  sticker.addEventListener("click", () => {
    const wrapper = document.createElement("div");
    wrapper.className = "sticker-wrapper";
    wrapper.style.top = "10px";
    wrapper.style.left = "10px";

    const img = document.createElement("img");
    img.src = sticker.src;
    img.style.width = "50px";
    wrapper.appendChild(img);

    const del = document.createElement("div");
    del.className = "delete-btn";
    del.innerText = "×";
    wrapper.appendChild(del);

    del.addEventListener("click", () => {
      wrapper.remove();
    });

    scrapArea.appendChild(wrapper);

    makeDraggableResizable(wrapper);
  });
});

// Draggable & Resizable
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
          const { width, height } = event.rect;
          el.querySelector("img").style.width = width + "px";
          el.querySelector("img").style.height = height + "px";

          const x = (parseFloat(el.getAttribute('data-x')) || 0) + event.deltaRect.left;
          const y = (parseFloat(el.getAttribute('data-y')) || 0) + event.deltaRect.top;
          el.style.transform = `translate(${x}px, ${y}px)`;
          el.setAttribute('data-x', x);
          el.setAttribute('data-y', y);
        }
      },
      modifiers: [interact.modifiers.restrictEdges({ outer: scrapArea })],
      inertia: true
    });
}

// Reset
resetBtn.addEventListener("click", () => {
  photoStrip.innerHTML = "";
  scrapArea.querySelectorAll(".sticker-wrapper").forEach(el => el.remove());
  scrapArea.style.backgroundImage = "";
  photosTaken = 0;
  captureBtn.disabled = false;
});

// Export
exportBtn.addEventListener("click", () => {
  html2canvas(scrapArea).then(canvas => {
    const link = document.createElement("a");
    link.href = canvas.toDataURL("image/png");
    link.download = "photostrip.png";
    link.click();
  });
});

startCamera();




