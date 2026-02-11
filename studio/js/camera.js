const video = document.getElementById("video");
const canvas = document.getElementById("canvas");
const captureBtn = document.getElementById("captureBtn");
const scrapArea = document.getElementById("scrapArea");
const slots = document.querySelectorAll(".photo-slot");
const resetBtn = document.getElementById("resetBtn");
const exportBtn = document.getElementById("exportBtn");
const stickers = document.querySelectorAll(".sticker");

let photoIndex = 0;

// ---- Start Camera ----
async function startCamera() {
  try {
    const stream = await navigator.mediaDevices.getUserMedia({ video: true });
    video.srcObject = stream;
    await video.play();
    console.log("Camera ready ✅");
  } catch (err) {
    alert("Camera access is required!");
    console.error(err);
  }
}

// ---- Load Template Frame ----
const selectedFrame = localStorage.getItem('selectedFrame');
const templates = {
  template1: "../img/template1.png",
  template2: "../img/template2.png"
};
if (selectedFrame && templates[selectedFrame]) {
  scrapArea.style.backgroundImage = `url(${templates[selectedFrame]})`;
  scrapArea.style.backgroundSize = "cover";
  scrapArea.style.backgroundPosition = "center";
}

// ---- Take Photo ----
captureBtn.addEventListener("click", () => {
  if (!video.videoWidth || !video.videoHeight) return alert("Camera not ready!");
  if (photoIndex >= 4) return alert("Max 4 photos reached");

  canvas.width = video.videoWidth;
  canvas.height = video.videoHeight;

  const ctx = canvas.getContext("2d");
  ctx.drawImage(video, 0, 0, canvas.width, canvas.height);
  const imgData = canvas.toDataURL("image/png");

  const img = document.createElement("img");
  img.src = imgData;

  slots[photoIndex].appendChild(img);
  photoIndex++;

  if (photoIndex >= 4) captureBtn.disabled = true;
});

// ---- Stickers ----
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
    del.addEventListener("click", () => wrapper.remove());

    scrapArea.appendChild(wrapper);
    makeDraggableResizable(wrapper);
  });
});

// ---- Draggable & Resizable Stickers ----
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
      edges: { left:true, right:true, top:true, bottom:true },
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

// ---- Reset ----
resetBtn.addEventListener("click", () => {
  slots.forEach(slot => slot.innerHTML = "");
  scrapArea.querySelectorAll(".sticker-wrapper").forEach(el => el.remove());
  scrapArea.style.backgroundImage = selectedFrame ? `url(${templates[selectedFrame]})` : "";
  photoIndex = 0;
  captureBtn.disabled = false;
});

// ---- Export ----
exportBtn.addEventListener("click", () => {
  html2canvas(scrapArea).then(canvas => {
    const link = document.createElement("a");
    link.href = canvas.toDataURL("image/png");
    link.download = "photostrip.png";
    link.click();
  });
});

// ---- Initialize ----
startCamera();









