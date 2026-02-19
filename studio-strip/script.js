document.addEventListener("DOMContentLoaded", () => {
  // ================== STRIPE + WATERMARK ==================
  const STRIPE_URL = "https://buy.stripe.com/YOUR_LINK_HERE";

  function addWatermark(canvas) {
    const ctx = canvas.getContext("2d");
    ctx.font = "bold 40px Arial";
    ctx.fillStyle = "rgba(255,255,255,0.25)";
    ctx.textAlign = "center";
    ctx.fillText("VISURA HAUS", canvas.width / 2, canvas.height / 2);
  }

  // ================== CAMERA ==================
  const video = document.getElementById('video');
  const startBtn = document.getElementById('startBtn');
  const takePhotoBtn = document.getElementById('takePhotoBtn');
  const resetBtn = document.getElementById('resetBtn');
  const downloadBtn = document.getElementById('downloadBtn');
  const scrapCanvas = document.getElementById('scrapCanvas');
  const photoLayer = document.getElementById('photoLayer');
  const stickerLayer = document.getElementById('stickerLayer');
  const stickerBar = document.getElementById('stickerBar');
  const frameLayer = document.getElementById('frameLayer');
  const framesGallery = document.getElementById('framesGallery');

  let currentFilter = "none";
  let isPaid = false;
  let photos = [];

  function setFilter(value) {
    currentFilter = value;
    video.style.filter = value;
    video.style.webkitFilter = value;
  }

  async function startCamera() {
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ video: { facingMode: "user" }, audio: false });
      video.srcObject = stream;
      video.play();
    } catch (err) {
      alert("Camera not accessible: " + err);
    }
  }

  startBtn.addEventListener('click', startCamera);

  // ================== COUNTDOWN ==================
  function startCountdown(seconds, callback) {
    const overlay = document.getElementById("countdownOverlay");
    let remaining = seconds;
    overlay.style.display = "flex";
    overlay.textContent = remaining;

    const interval = setInterval(() => {
      remaining--;
      if (remaining > 0) {
        overlay.textContent = remaining;
        overlay.classList.remove("countdown-scale");
        void overlay.offsetWidth;
        overlay.classList.add("countdown-scale");
      } else {
        clearInterval(interval);
        overlay.style.display = "none";
        callback();
      }
    }, 1000);
  }

  // ================== TAKE PHOTO ==================
  takePhotoBtn.addEventListener('click', () => {
    if (!video.srcObject) {
      alert("Click 'Start Session' first to start the camera.");
      return;
    }

    const width = video.videoWidth || video.clientWidth;
    const height = video.videoHeight || video.clientHeight;

    if (!width || !height) {
      alert("Camera not ready yet, please wait a moment.");
      return;
    }

    const maxPhotos = 3;
    if (photos.length >= maxPhotos) {
      alert(`This strip allows only ${maxPhotos} photos.`);
      return;
    }

    startCountdown(3, () => {
      const canvas = document.createElement('canvas');
      canvas.width = width;
      canvas.height = height;
      const ctx = canvas.getContext('2d');

      ctx.filter = currentFilter || "none";
      ctx.drawImage(video, 0, 0, width, height);

      const img = document.createElement('img');
      img.src = canvas.toDataURL('image/png');

      // ================== PHOTOSTRIP LAYOUT ==================
      const sidePadding = 20;
      const topMargin = 40;
      const bottomMargin = 120;
      const gap = 25;

      const videoRatio = height / width;
      const photoWidth = scrapCanvas.offsetWidth - sidePadding * 2;
      const photoHeight = photoWidth * videoRatio;

      // scrapCanvas grows naturally
      const calculatedHeight = topMargin + bottomMargin + gap * (maxPhotos - 1) + photoHeight * maxPhotos;
      scrapCanvas.style.height = `${calculatedHeight}px`;

      // set photo position
      img.style.position = "absolute";
      img.style.width = `${photoWidth}px`;
      img.style.height = `${photoHeight}px`;
      img.style.left = `${sidePadding}px`;
      img.style.top = `${topMargin + photos.length * (photoHeight + gap)}px`;
      img.style.objectFit = "cover";
      img.style.borderRadius = "8px";

      photos.push(img);
      photoLayer.appendChild(img);

      // Add caption on last photo
      if (photos.length === maxPhotos) {
        const caption = document.createElement("div");
        caption.innerText = "VISURA HAUS ✨ " + new Date().toLocaleDateString();
        caption.style.position = "absolute";
        caption.style.bottom = "40px";
        caption.style.width = "100%";
        caption.style.textAlign = "center";
        caption.style.fontWeight = "bold";
        caption.style.fontSize = "22px";
        caption.style.fontFamily = "Courier New, monospace";
        caption.style.letterSpacing = "2px";
        caption.style.color = "#111";
        caption.style.zIndex = "6";

        photoLayer.appendChild(caption);
      }
    });
  });

  // ================== RESET ==================
  resetBtn.addEventListener('click', () => {
    photos = [];
    photoLayer.innerHTML = '';
    stickerLayer.innerHTML = '';
  });

  // ================== DOWNLOAD / STRIPE ==================
  downloadBtn.addEventListener('click', async () => {
    if (!isPaid) {
      window.open(STRIPE_URL, "_blank");
      const confirmDownload = confirm("After completing payment, click OK to unlock and download your design.");
      if (!confirmDownload) return;
      isPaid = true;
    }

    const canvas = document.createElement('canvas');
    canvas.width = scrapCanvas.offsetWidth;
    canvas.height = scrapCanvas.offsetHeight;
    const ctx = canvas.getContext('2d');

    const elements = scrapCanvas.querySelectorAll('img');
    for (let el of elements) {
      const rect = el.getBoundingClientRect();
      const parentRect = scrapCanvas.getBoundingClientRect();
      const x = rect.left - parentRect.left;
      const y = rect.top - parentRect.top;

      await new Promise(resolve => {
        const img = new Image();
        img.crossOrigin = "anonymous";
        img.src = el.src;
        img.onload = () => {
          ctx.filter = currentFilter || "none";
          ctx.drawImage(img, x, y, el.offsetWidth, el.offsetHeight);
          resolve();
        };
      });
    }

    addWatermark(canvas);

    const link = document.createElement('a');
    link.href = canvas.toDataURL('image/png');
    link.download = "visura-strip.png";
    link.click();
  });

  // ===== DISABLE RIGHT CLICK =====
  document.addEventListener('contextmenu', function(e) {
    if (e.target.tagName === 'IMG') {
      e.preventDefault();
    }
  });
});
