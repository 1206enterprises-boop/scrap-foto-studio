// Get elements
const video = document.getElementById('video');
const startBtn = document.getElementById('startBtn');
const takePhotoBtn = document.getElementById('takePhotoBtn');
const resetBtn = document.getElementById('resetBtn');
const downloadBtn = document.getElementById('downloadBtn');

const scrapCanvas = document.getElementById('scrapCanvas');
const templateImg = document.getElementById('templateImg');
const photoLayer = document.getElementById('photoLayer');
const stickerLayer = document.getElementById('stickerLayer');
const stickerBar = document.getElementById('stickerBar');

// Load selected frame
const frameUrl = localStorage.getItem('frame');
if(templateImg && frameUrl) templateImg.src = frameUrl;

// Initialize camera
async function startCamera() {
  try {
    const stream = await navigator.mediaDevices.getUserMedia({ video: true, audio: false });
    video.srcObject = stream;
  } catch(err) {
    alert("Camera not accessible: " + err);
  }
}

// Photo storage
let photos = [];

// Start session
startBtn && startBtn.addEventListener('click', () => {
  startCamera();
});

// Take photo
takePhotoBtn && takePhotoBtn.addEventListener('click', () => {
  const canvas = document.createElement('canvas');
  canvas.width = video.videoWidth;
  canvas.height = video.videoHeight;
  const ctx = canvas.getContext('2d');
  ctx.drawImage(video, 0, 0, canvas.width, canvas.height);
  const img = document.createElement('img');
  img.src = canvas.toDataURL('image/png');

  // Check if 1x3 or 4x6
  if(scrapCanvas.offsetHeight > scrapCanvas.offsetWidth){
    // 1x3 vertical autofit
    const slotHeight = scrapCanvas.offsetHeight / 4;
    img.style.width = '100%';
    img.style.height = `${slotHeight}px`;
    img.style.top = `${photos.length * slotHeight}px`;
    img.style.left = '0';
  } else {
    // 4x6: draggable/resizable
    img.style.width = '150px';
    img.style.height = 'auto';
    img.style.top = '10px';
    img.style.left = '10px';
    makeDraggableResizable(img, scrapCanvas);
  }

  photos.push(img);
  photoLayer.appendChild(img);
});

// Reset
resetBtn && resetBtn.addEventListener('click', () => {
  photos = [];
  photoLayer.innerHTML = '';
  stickerLayer.innerHTML = '';
});

// Stickers - add your Canva URLs here
const stickers = [
  'https://i.imgur.com/Sticker1.png',
  'https://i.imgur.com/Sticker2.png',
  'https://i.imgur.com/Sticker3.png'
];

// Populate sticker bar
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
    sticker.style.top = '20px';
    sticker.style.left = '20px';
    makeDraggableResizable(sticker, scrapCanvas);
    stickerLayer.appendChild(sticker);
  });
  stickerBar.appendChild(btn);
});

// Draggable & Resizable Function
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

    // constrain within container
    x = Math.max(0, Math.min(container.offsetWidth - el.offsetWidth, x));
    y = Math.max(0, Math.min(container.offsetHeight - el.offsetHeight, y));

    el.style.left = x + 'px';
    el.style.top = y + 'px';
  });

  document.addEventListener('mouseup', e => {
    isDragging = false;
  });

  // Simple resizable with corner drag
  el.addEventListener('dblclick', () => {
    const newWidth = prompt('Enter width in px:', el.offsetWidth);
    if(newWidth) el.style.width = newWidth + 'px';
  });
}

// Download placeholder
downloadBtn && downloadBtn.addEventListener('click', () => {
  alert("Payment integration goes here. After payment, download the final image with watermark.");
  // Example for html2canvas:
  // html2canvas(scrapCanvas).then(canvas => {
  //   const link = document.createElement('a');
  //   link.href = canvas.toDataURL('image/png');
  //   link.download = 'scrap.png';
  //   link.click();
  // });
});









