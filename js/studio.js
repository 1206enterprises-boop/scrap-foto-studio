const video = document.getElementById("video");
const startBtn = document.getElementById("startBtn");
const slots = document.querySelectorAll(".photo-slot");
const photoStrip = document.getElementById("photoStrip");
const downloadBtn = document.getElementById("downloadBtn");

let currentPhoto = 0;
let capturedImages = [];

/* CAMERA */
navigator.mediaDevices.getUserMedia({ video: true })
.then(stream => video.srcObject = stream)
.catch(err => alert("Camera access required"));

/* LOAD MODE */
const boothMode = localStorage.getItem("boothMode") || "strip";
const selectedFrame = localStorage.getItem("selectedFrame");

photoStrip.style.backgroundImage = `url('../img/${selectedFrame}')`;
photoStrip.style.backgroundSize = "cover";

/* START SESSION */
startBtn.addEventListener("click", async () => {
  currentPhoto = 0;
  capturedImages = [];
  for (let slot of slots) slot.innerHTML = "";

  for (let i = 0; i < 4; i++) {
    await takePhoto();
  }
});

/* TAKE PHOTO */
function takePhoto() {
  return new Promise(resolve => {
    setTimeout(() => {
      const canvas = document.createElement("canvas");
      canvas.width = video.videoWidth;
      canvas.height = video.videoHeight;
      const ctx = canvas.getContext("2d");
      ctx.drawImage(video, 0, 0);

      const img = document.createElement("img");
      img.src = canvas.toDataURL("image/png");
      img.classList.add("strip-photo");

      slots[currentPhoto].innerHTML = "";
      slots[currentPhoto].appendChild(img);

      capturedImages.push(img.src);
      currentPhoto++;
      resolve();
    }, 1500);
  });
}

/* STICKERS */
document.querySelectorAll(".sticker-item").forEach(sticker => {
  sticker.addEventListener("click", () => {
    const clone = sticker.cloneNode();
    clone.classList.add("sticker");
    clone.style.position = "absolute";
    clone.style.top = "50%";
    clone.style.left = "50%";

    makeDraggable(clone);
    photoStrip.appendChild(clone);
  });
});

function makeDraggable(el) {
  let offsetX, offsetY;
  el.onmousedown = function(e) {
    offsetX = e.clientX - el.offsetLeft;
    offsetY = e.clientY - el.offsetTop;
    document.onmousemove = function(e) {
      el.style.left = (e.clientX - offsetX) + "px";
      el.style.top = (e.clientY - offsetY) + "px";
    };
    document.onmouseup = function() {
      document.onmousemove = null;
    };
  };
}

/* DOWNLOAD */
downloadBtn.addEventListener("click", () => {
  html2canvas(photoStrip).then(canvas => {
    const link = document.createElement("a");
    link.download = "scrap-foto.png";
    link.href = canvas.toDataURL("image/png");
    link.click();
  });
});
