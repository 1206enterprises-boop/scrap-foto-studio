const video = document.getElementById("video");
const startBtn = document.getElementById("startBtn");
const slots = document.querySelectorAll(".photo-slot");
const photoStrip = document.getElementById("photoStrip");
const downloadBtn = document.getElementById("downloadBtn");
const productType = document.getElementById("productType");

let currentPhoto = 0;
let hasPaid = localStorage.getItem("paid") === "true";

/* CAMERA */
navigator.mediaDevices.getUserMedia({ video: true })
.then(stream => video.srcObject = stream)
.catch(err => alert("Camera permission required"));

/* MODE LOGIC */
const boothMode = localStorage.getItem("boothMode") || "strip";
const selectedFrame = localStorage.getItem("selectedFrame");

photoStrip.style.backgroundImage = `url('../img/${selectedFrame}')`;
photoStrip.style.backgroundSize = "cover";

/* REAL 4x6 SIZE */
if (boothMode === "portrait") {
  photoStrip.classList.add("portrait-mode");
} else {
  photoStrip.classList.add("strip-mode");
}

/* START SESSION */
startBtn.addEventListener("click", async () => {
  currentPhoto = 0;
  slots.forEach(slot => slot.innerHTML = "");

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
      img.style.position = "absolute";

      makeDraggable(img);

      slots[currentPhoto].appendChild(img);
      currentPhoto++;
      resolve();
    }, 1500);
  });
}

/* DRAG SYSTEM */
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

/* STICKERS */
document.querySelectorAll(".sticker-item").forEach(sticker => {
  sticker.addEventListener("click", () => {
    const clone = document.createElement("img");
    clone.src = sticker.src;
    clone.classList.add("sticker");
    clone.style.position = "absolute";
    clone.style.top = "50%";
    clone.style.left = "50%";

    makeDraggable(clone);
    photoStrip.appendChild(clone);
  });
});

/* DOWNLOAD + PAYMENT */
downloadBtn.addEventListener("click", () => {

  if (!hasPaid) {

    let stripeLink = "";

    if (productType.value === "digital") {
      stripeLink = "https://buy.stripe.com/YOUR_DIGITAL_LINK";
    }

    if (productType.value === "print") {
      stripeLink = "https://buy.stripe.com/YOUR_PRINT_LINK";
    }

    if (productType.value === "keychain") {
      stripeLink = "https://buy.stripe.com/YOUR_KEYCHAIN_LINK";
    }

    window.location.href = stripeLink;
    return;
  }

  html2canvas(photoStrip).then(canvas => {
    const link = document.createElement("a");
    link.download = "scrap-foto.png";
    link.href = canvas.toDataURL("image/png");
    link.click();
  });
});

