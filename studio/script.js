/* ---------- GLOBAL ELEMENTS ---------- */
const video = document.getElementById("video");
const startBtn = document.getElementById("startSession");
const takeBtn = document.getElementById("takePhoto");

const photoLayer = document.getElementById("photoLayer");
const stickerLayer = document.getElementById("stickerLayer");
const frameBackground = document.getElementById("frameBackground");
const canvasContainer = document.getElementById("canvasContainer");

const watermark = document.getElementById("watermark");

/* ---------- STATE ---------- */
let photosTaken = 0;

// Mode from landing page
let mode = localStorage.getItem("templateMode") || "strip";

// Stripe public key (replace with your own)
const stripe = Stripe("YOUR_STRIPE_PUBLIC_KEY");

/* ---------- CANVA BACKGROUND LINKS ---------- */
const bgLinks = {
  strip: "https://your-canva-strip-background-url.png",
  "4x6": "https://your-canva-4x6-background-url.png"
};

/* ---------- CANVA STICKER URLs ---------- */
const stickerLibrary = [
  "https://your-canva-sticker1-url.png",
  "https://your-canva-sticker2-url.png",
  "https://your-canva-sticker3-url.png"
];

/* ---------- 1) START CAMERA ---------- */
startBtn.onclick = async () => {
  const stream = await navigator.mediaDevices.getUserMedia({
    video: {
      width: { ideal: 1080 },
      height: { ideal: 1920 },
      facingMode: "user"
    }
  });
  video.srcObject = stream;
};

/* ---------- 2) LOAD TEMPLATE BACKGROUND ---------- */
window.onload = () => {
  frameBackground.src = bgLinks[mode];
  watermark.style.display = "block";
};

/* ---------- 3) TAKE PHOTO (PORTRAIT) ---------- */
takeBtn.onclick = () => {
  if (photosTaken >= 4) return;

  const canvas = document.createElement("canvas");
  canvas.width = 1080;
  canvas.height = 1920;

  const ctx = canvas.getContext("2d");
  ctx.drawImage(video, 0, 0, canvas.width, canvas.height);

  const img = document.createElement("img");
  img.src = canvas.toDataURL("image/png");

  if (mode === "strip") {
    img.style.width = "260px";
    img.style.height = "200px";
    img.style.left = "20px";
    img.style.top = (photosTaken * 210 + 40) + "px";
  } else {
    img.style.width = "250px";
    img.style.height = "350px";
    img.style.left = (photosTaken * 60 + 40) + "px";
    img.style.top = "200px";
    makeDraggable(img);
    makeResizable(img);
  }

  photoLayer.appendChild(img);
  photosTaken++;
};

/* ---------- 4) MAKE DRAGGABLE ---------- */
function makeDraggable(el) {
  let offsetX, offsetY;
  el.onmousedown = (e) => {
    offsetX = e.offsetX;
    offsetY = e.offsetY;

    document.onmousemove = (ev) => {
      el.style.left = (ev.pageX - offsetX) + "px";
      el.style.top = (ev.pageY - offsetY) + "px";
    };

    document.onmouseup = () => document.onmousemove = null;
  };
}

/* ---------- 5) MAKE RESIZABLE ON DOUBLE CLICK ---------- */
function makeResizable(el) {
  el.ondblclick = () => {
    let newSize = el.offsetWidth + 30;
    if (newSize < 800) el.style.width = newSize + "px";
  };
}

/* ---------- 6) ADD STICKER (from Canva URLs) ---------- */
function addSticker() {
  let url = stickerLibrary[photosTaken % stickerLibrary.length];
  const sticker = document.createElement("img");
  sticker.src = url;
  sticker.style.width = "100px";
  sticker.style.top = "300px";
  sticker.style.left = "100px";

  stickerLayer.appendChild(sticker);
  makeDraggable(sticker);
  makeResizable(sticker);
}

/* ---------- 7) RESET SESSION ---------- */
function resetSession() {
  photoLayer.innerHTML = "";
  stickerLayer.innerHTML = "";
  photosTaken = 0;
  watermark.style.display = "block";
}

/* ---------- 8) DOWNLOAD + PAYMENT GATE ---------- */
function handleDownload() {
  if (photosTaken < 4) {
    alert("Take 4 photos first!");
    return;
  }

  if (!localStorage.getItem("paid")) {
    stripe.redirectToCheckout({
      lineItems: [{
        price: "YOUR_STRIPE_PRICE_ID", // replace
        quantity: 1
      }],
      mode: "payment",
      successUrl: window.location.href + "?paid=true",
      cancelUrl: window.location.href
    });
    return;
  }

  // Remove watermark before export
  watermark.style.display = "none";

  html2canvas(canvasContainer).then(canvas => {
    const link = document.createElement("a");
    link.href = canvas.toDataURL("image/png");
    link.download = "scrapfoto.png";
    link.click();
  });
}


