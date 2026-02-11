// Elements
const video=document.getElementById('video');
const startBtn=document.getElementById('startBtn');
const takePhotoBtn=document.getElementById('takePhotoBtn');
const resetBtn=document.getElementById('resetBtn');
const downloadBtn=document.getElementById('downloadBtn');
const scrapCanvas=document.getElementById('scrapCanvas');
const ctx=scrapCanvas.getContext('2d');
const photoLayer=document.getElementById('photoLayer');
const stickerLayer=document.getElementById('stickerLayer');
const stickerBar=document.getElementById('stickerBar');
const filterBtns=document.querySelectorAll('.filter-btn');
const templateImg=new Image();
templateImg.src=localStorage.getItem('frame')||'../img/strip_frame1.png';
templateImg.onload=()=>{ctx.drawImage(templateImg,0,0,scrapCanvas.width,scrapCanvas.height);};

// GIF/Animated background behind canvas via CSS already

// Camera
async function startCamera(){
  try{
    const stream=await navigator.mediaDevices.getUserMedia({video:true,audio:false});
    video.srcObject=stream;
  }catch(err){alert("Camera not accessible: "+err);}
}
startBtn.addEventListener('click',()=>startCamera());

// Filters
let currentFilter='none';
filterBtns.forEach(btn=>{
  btn.addEventListener('click',()=>{currentFilter=btn.dataset.filter; video.style.filter=filterCss(currentFilter);});
});
function filterCss(f){if(f==='bw')return'grayscale(100%)'; else if(f==='vintage')return'sepia(70%)'; else return'none';}

// Photos
let photos=[];
takePhotoBtn.addEventListener('click',()=>{
  const tempCanvas=document.createElement('canvas');
  tempCanvas.width=video.videoWidth;
  tempCanvas.height=video.videoHeight;
  const tCtx=tempCanvas.getContext('2d');
  tCtx.filter=filterCss(currentFilter);
  tCtx.drawImage(video,0,0,tempCanvas.width,tempCanvas.height);
  const img=document.createElement('img');
  img.src=tempCanvas.toDataURL('image/png');

  const slotHeight=scrapCanvas.height/4;
  img.style.width='100%';
  img.style.height=slotHeight+'px';
  img.style.top=(photos.length*slotHeight)+'px';
  img.style.left='0';
  photoLayer.appendChild(img);
  photos.push(img);

  drawCanvas();
});

// Stickers
const stickers=['https://i.imgur.com/Sticker1.png','https://i.imgur.com/Sticker2.png','https://i.imgur.com/Sticker3.png'];
stickers.forEach(url=>{
  const btn=document.createElement('button');
  const sImg=document.createElement('img'); sImg.src=url; sImg.style.width='50px'; sImg.style.height='50px';
  btn.appendChild(sImg);
  btn.addEventListener('click',()=>{
    const sticker=document.createElement('img');
    sticker.src=url; sticker.style.width='80px'; sticker.style.height='80px'; sticker.style.top='10px'; sticker.style.left='10px';
    makeDraggableResizable(sticker,scrapCanvas);
    stickerLayer.appendChild(sticker);
  });
  stickerBar.appendChild(btn);
});

// Drag/Resize
function makeDraggableResizable(el,container){
  el.style.position='absolute';
  el.style.cursor='move';
  let isDragging=false,offsetX,offsetY;
  el.addEventListener('mousedown',e=>{
    isDragging=true;
    const rect=el.getBoundingClientRect();
    offsetX=e.clientX-rect.left; offsetY=e.clientY-rect.top;
    el.style.zIndex=20;
  });
  document.addEventListener('mousemove',e=>{
    if(!isDragging)return;
    let x=e.clientX-offsetX-container.getBoundingClientRect().left;
    let y=e.clientY-offsetY-container.getBoundingClientRect().top;
    x=Math.max(0,Math.min(container.offsetWidth-el.offsetWidth,x));
    y=Math.max(0,Math.min(container.offsetHeight-el.offsetHeight,y));
    el.style.left=x+'px'; el.style.top=y+'px';
  });
  document.addEventListener('mouseup',()=>{isDragging=false;});
  el.addEventListener('dblclick',()=>{const newW=prompt('Enter width in px',el.offsetWidth);if(newW)el.style.width=newW+'px';});
}

// Reset
resetBtn.addEventListener('click',()=>{
  photos=[]; photoLayer.innerHTML=''; stickerLayer.innerHTML=''; drawCanvas();
});

// Draw canvas with template + photos + stickers + watermark
function drawCanvas(){
  ctx.clearRect(0,0,scrapCanvas.width,scrapCanvas.height);
  ctx.drawImage(templateImg,0,0,scrapCanvas.width,scrapCanvas.height);
  photos.forEach(p=>{
    const img=new Image();
    img.src=p.src;
    ctx.drawImage(img,0,p.offsetTop,scrapCanvas.width,scrapCanvas.height/4);
  });
  Array.from(stickerLayer.children).forEach(s=>{
    const img=new Image();
    img.src=s.src;
    ctx.drawImage(img,parseInt(s.style.left),parseInt(s.style.top),s.offsetWidth,s.offsetHeight);
  });
  // Watermark
  ctx.font='30px Arial';
  ctx.fillStyle='rgba(255,255,255,0.5)';
  ctx.fillText('SCRAP-FOTO',10,scrapCanvas.height-10);
}

// Home / Back
function goHome(){window.location.href='../../landing.html';}
function goBack(){window.history.back();}

// Stripe / Download
downloadBtn.addEventListener('click',()=>{
  drawCanvas();
  // Stripe checkout redirect
  // Replace YOUR_STRIPE_CHECKOUT_LINK with your actual Stripe checkout
  window.location.href='https://buy.stripe.com/YOUR_STRIPE_CHECKOUT_LINK';
});







