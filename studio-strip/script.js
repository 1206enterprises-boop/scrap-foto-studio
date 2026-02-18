// Elements
const video = document.getElementById('video');
const startBtn = document.getElementById('startBtn');
const takePhotoBtn = document.getElementById('takePhotoBtn');
const resetBtn = document.getElementById('resetBtn');
const downloadBtn = document.getElementById('downloadBtn');
const scrapCanvas = document.getElementById('studioCanvas');
const templateImg = document.getElementById('templateImg');
const photoLayer = document.getElementById('photoLayer');
const stickerLayer = document.getElementById('stickerLayer');
const stickerBar = document.getElementById('stickerBar');
const filters = document.querySelectorAll('#filters button');

// Load selected frame
const frameUrl = localStorage.getItem('frame');
if(templateImg && frameUrl) templateImg.src = frameUrl;

// Camera
async function startCamera() {
  try {
    const stream = await navigator.mediaDevices.getUserMedia({ video: true, audio: false });
    video.srcObject = stream;
  } catch(err) {
    alert("Camera not accessible: " + err);
  }
}

startBtn.addEventListener('click', startCamera);

let photos = [];

// Take Photo
takePhotoBtn.addEventListener('click', () => {
  if(photos.length >= 3) {
    alert("Maximum 3 photos for this strip.");
    return;
  }

  const canvas = document.createElement('canvas');
  canvas.width = video.videoWidth;
  canvas.height = video.videoHeight;
  const ctx = canvas.getContext('2d');
  ctx.drawImage(video, 0, 0, canvas.width, canvas.height);

  const img = document.createElement('img');
  img.src = canvas.toDataURL('image/png');

  // Autofit for 3-photo strip
  const slotHeight = (scrapCanvas.offsetHeight - 40) / 3; // 40px total spacing
  img.style.width = '100%';
  img.style.height = `${slotHeight}px`;
  img.style.top = `${photos.length * (slotHeight + 10)}px`; // 10px spacing
  img.style.left = '0';
  img.style.position = 'absolute';

  photos.push(img);
  photoLayer.appendChild(img);
});

// Reset
resetBtn.addEventListener('click', () => {
  photos = [];
  photoLayer.innerHTML = '';
  stickerLayer.innerHTML = '';
});

// Stickers (Canva links)
const stickers = [
  'https://i.imgur.com/Sticker1.png',
  'https://i.imgur.com/Sticker2.png',
  'https://i.imgur.com/Sticker3.png'
];

stickers.forEach(url => {
  const btn = document.createElement('button');
  const img = document.createElement('img');
  img.src = url;
  img.style.width = '50px';
  img.style.height = '50px';
  btn.appendChild(img);
  btn.addEventListener('click', () => {
    const sticker = document.createElement('img');
    sticker.src = url;
    sticker.style.width = '80px';
    sticker.style.height = '80px';
    sticker.style.top = '10px';
    sticker.style.left = '10px';
    makeDraggableResizable(sticker, scrapCanvas);
    stickerLayer.appendChild(sticker);
  });
  stickerBar.appendChild(btn);
});

// Draggable & Resizable
function makeDraggableResizable(el, container){
  el.style.position = 'absolute';
  el.style.cursor = 'move';

  let isDragging = false;
  let offsetX, offsetY;

  el.addEventListener('mousedown', e => {
    isDragging = true;
    const rect = el.getBoundingClientRect();
    offsetX = e.clientX - rect.left;
    offsetY = e.clientY - rect.top;
    el.style.zIndex = 20;
  });

  document.addEventListener('mousemove', e => {
    if(!isDragging) return;
    let x = e.clientX - offsetX - container.getBoundingClientRect().left;
    let y = e.clientY - offsetY - container.getBoundingClientRect().top;

    // Constrain inside template
    x = Math.max(0, Math.min(container.offsetWidth - el.offsetWidth, x));
    y = Math.max(0, Math.min(container.offsetHeight - el.offsetHeight, y));

    el.style.left = x + 'px';
    el.style.top = y + 'px';
  });

  document.addEventListener('mouseup', e => {
    isDragging = false;
  });

  el.addEventListener('dblclick', () => {
    const newWidth = prompt('Enter width in px:', el.offsetWidth);
    if(newWidth) el.style.width = newWidth + 'px';
  });
}

// Filters
filters.forEach(btn => {
  btn.addEventListener('click', () => {
    video.style.filter = btn.getAttribute('data-filter');
  });
});

// Download / Pay (Stripe integration placeholder)
downloadBtn.addEventListener('click', () => {
  alert("Integrate Stripe checkout here. Watermark is applied to the final canvas.");
});








