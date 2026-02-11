// -----------------------------
// 1x3 Photo Strip Studio Script
// -----------------------------

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

let photos = [];
let currentFilter = 'none';

// Load selected frame
const frameUrl = localStorage.getItem('frame');
if(templateImg && frameUrl) templateImg.src = frameUrl;

// -----------------------------
// Camera
// -----------------------------
async function startCamera() {
    try {
        const stream = await navigator.mediaDevices.getUserMedia({ video: true, audio: false });
        video.srcObject = stream;
    } catch(err) {
        alert("Camera not accessible: " + err);
    }
}

startBtn.addEventListener('click', startCamera);

// -----------------------------
// Filters
// -----------------------------
function applyFilter(filter) {
    currentFilter = filter;
    video.style.filter = filter;
    photoLayer.childNodes.forEach(img => img.style.filter = filter);
}

// -----------------------------
// Take Photo
// -----------------------------
takePhotoBtn.addEventListener('click', () => {
    if(photos.length >= 4){
        alert('Max 4 photos for 1x3 strip');
        return;
    }

    const canvas = document.createElement('canvas');
    canvas.width = video.videoWidth;
    canvas.height = video.videoHeight;
    const ctx = canvas.getContext('2d');

    // Apply filter
    ctx.filter = currentFilter;
    ctx.drawImage(video, 0, 0, canvas.width, canvas.height);

    const img = document.createElement('img');
    img.src = canvas.toDataURL('image/png');

    // Autofit into strip
    const slotHeight = scrapCanvas.offsetHeight / 4;
    img.style.width = '100%';
    img.style.height = `${slotHeight}px`;
    img.style.top = `${photos.length * slotHeight}px`;
    img.style.left = '0';
    img.style.position = 'absolute';
    img.style.filter = currentFilter;

    photos.push(img);
    photoLayer.appendChild(img);
});

// -----------------------------
// Reset
// -----------------------------
resetBtn.addEventListener('click', () => {
    photos = [];
    photoLayer.innerHTML = '';
    stickerLayer.innerHTML = '';
});

// -----------------------------
// Stickers (Canva URLs)
// -----------------------------
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
        sticker.style.top = '20px';
        sticker.style.left = '20px';
        makeDraggableResizable(sticker, scrapCanvas);
        stickerLayer.appendChild(sticker);
    });

    stickerBar.appendChild(btn);
});

// -----------------------------
// Draggable & Resizable
// -----------------------------
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

    document.addEventListener('mouseup', () => {
        isDragging = false;
    });

    // Resize on double-click
    el.addEventListener('dblclick', () => {
        const newWidth = prompt('Enter width in px:', el.offsetWidth);
        if(newWidth) el.style.width = newWidth + 'px';
    });
}

// -----------------------------
// Download + Stripe + Watermark
// -----------------------------
downloadBtn.addEventListener('click', async () => {
    // Apply watermark before payment
    const watermark = document.createElement('div');
    watermark.innerText = 'SCRAP FOTO STUDIO';
    watermark.style.position = 'absolute';
    watermark.style.bottom = '10px';
    watermark.style.right = '10px';
    watermark.style.color = 'white';
    watermark.style.fontSize = '20px';
    watermark.style.opacity = '0.6';
    scrapCanvas.appendChild(watermark);

    // Stripe checkout
    const stripeSessionId = 'YOUR_STRIPE_SESSION_ID_HERE'; // Replace with your Stripe session logic
    window.location.href = `https://checkout.stripe.com/pay/${stripeSessionId}`;

    // After payment, you can generate high-res download using html2canvas or canvas API
});







