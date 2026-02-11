const video = document.getElementById("video");
const startBtn = document.getElementById("startBtn");
const takeBtn = document.getElementById("takeBtn");
const resetBtn = document.getElementById("resetBtn");
const photoLayer = document.getElementById("photoLayer");
const templateImg = document.getElementById("templateImg");
const scrapCanvas = document.getElementById("scrapCanvas");
let count = 0;

// Load frame
templateImg.src = localStorage.getItem('frame') || '../img/4x6-template.png';

// Start camera
startBtn.onclick = async () => {
  const stream = await navigator.mediaDevices.getUserMedia({
    video: { width: {ideal:1080}, height:{ideal:1920}, facingMode:"user" }
  });
  video.srcObject = stream;
};

// Take photo
takeBtn.onclick = () => {
  if(count >=4) return;
  const canvas = document.createElement("canvas");
  canvas.width = 1080; canvas.height = 1920;
  const ctx = canvas.getContext("2d");
  ctx.drawImage(video,0,0,canvas.width,canvas.height);

  const img = document.createElement("img");
  img.src = canvas.toDataURL("image/png");
  img.style.position="absolute";
  img.style.left="50px";
  img.style.top=`${50 + count*100}px`;
  img.style.width="200px";
  img.style.height="250px";
  img.style.cursor="move";

  makeDraggable(img, scrapCanvas);
  makeResizable(img);
  photoLayer.appendChild(img);
  count++;
};

// Reset
resetBtn.onclick = () => {
  photoLayer.innerHTML="";
  count=0;
};

// Add stickers
function addSticker(url){
  const sticker = document.createElement("img");
  sticker.src=url;
  sticker.style.position="absolute";
  sticker.style.left="50px";
  sticker.style.top="50px";
  sticker.style.width="100px";
  sticker.style.height="100px";
  sticker.style.cursor="move";
  makeDraggable(sticker, scrapCanvas);
  makeResizable(sticker);
  photoLayer.appendChild(sticker);
}

// Drag inside canvas only
function makeDraggable(el, container){
  let offsetX, offsetY;
  el.onmousedown = e=>{
    e.preventDefault();
    offsetX = e.offsetX;
    offsetY = e.offsetY;
    document.onmousemove = ev=>{
      let x = ev.pageX - container.getBoundingClientRect().left - offsetX;
      let y = ev.pageY - container.getBoundingClientRect().top - offsetY;
      x = Math.max(0, Math.min(x, container.clientWidth - el.offsetWidth));
      y = Math.max(0, Math.min(y, container.clientHeight - el.offsetHeight));
      el.style.left = x + "px";
      el.style.top = y + "px";
    };
    document.onmouseup = ()=>{document.onmousemove=null;}
  };
}

// Resizable
function makeResizable(el){
  el.style.resize="both";
  el.style.overflow="hidden";
}

// Download with watermark + payment
function downloadScrap(){
  const stripeUrl = "https://buy.stripe.com/test_abc123";
  if(!confirm("You will be redirected to payment before download. Proceed?")) return;
  window.open(stripeUrl,"_blank");

  setTimeout(()=>{
    html2canvas(scrapCanvas).then(canvas=>{
      const watermark = new Image();
      watermark.src='../img/watermark.png';
      watermark.onload = ()=>{
        const finalCanvas = document.createElement("canvas");
        finalCanvas.width = canvas.width;
        finalCanvas.height = canvas.height;
        const ctx = finalCanvas.getContext("2d");
        ctx.drawImage(canvas,0,0);
        ctx.drawImage(watermark, finalCanvas.width-250, finalCanvas.height-100,200,50);
        const link=document.createElement("a");
        link.href=finalCanvas.toDataURL();
        link.download="scrap.png";
        link.click();
      };
    });
  },1000);
}





