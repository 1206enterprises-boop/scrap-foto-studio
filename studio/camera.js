const video = document.getElementById("video");
const canvas = document.getElementById("canvas");
const captureBtn = document.getElementById("captureBtn");
const thumbnails = document.getElementById("thumbnails");

let photos = [];
const MAX_PHOTOS = 4; // user can take up to 4 photos

// 1️⃣ Start the camera
async function startCamera() {
  try {
    const stream = await navigator.mediaDevices.getUserMedia({
      video: { facingMode: "user" }, // front camera
      audio: false
    });
    video.srcObject = stream;
  } catch (err) {
    alert("Camera access is required to use Scrap Foto Studio");
    console.error(err);
  }
}

// 2️⃣ Capture photo
captureBtn.addEventListener("click", () => {
  if (photos.length >= MAX_PHOTOS) return;

  const ctx = canvas.getContext("2d");
  canvas.width = video.videoWidth;
  canvas.height = video.videoHeight;

  ctx.drawImage(video, 0, 0);

  const imageData = canvas.toDataURL("image/png");
  photos.push(imageData);

  // Show thumbnail
  const img = document.createElement("img");
  img.src = imageData;
  img.className = "thumbnail";
  thumbnails.appendChild(img);

  if (photos.length === MAX_PHOTOS) {
    captureBtn.disabled = true;
  }
});

// 3️⃣ Initialize
startCamera();

