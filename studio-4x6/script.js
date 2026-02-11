const video = document.getElementById("video");
const startBtn = document.getElementById("startBtn");
const takeBtn = document.getElementById("takeBtn");
const resetBtn = document.getElementById("resetBtn");
const photoLayer = document.getElementById("photoLayer");
const templateImg = document.getElementById("templateImg");
const scrapCanvas = document.getElementById("scrapCanvas");
let count = 0;

templateImg.src = localStorage.getItem('frame') || '../img/4x6-template1.png';

startBtn.onclick = async () => {
  const stream = await navigator.mediaDevices.getUserMedia({ video:true });
  video.srcObject = stream;
};

takeBtn.onclick = () => {
  if(count >= 4) return;
  const canvas = document.createElement("canvas");
  canvas.width=1080; canvas.height=1920;
  canvas.getContext("2d").drawImage(video,0,0,canvas.width,canvas.height);

  const img=document.createElement("img");
  img.src=canvas.toDataURL();
  img.style.position="absolute";
  img.style.left="20px";
  img.style.top=`${20+count*120}px`;
  img.style.width="160px";
  img.style.height="210px";
  makeDraggable(img,scrapCanvas);
  photoLayer.appendChild(img);
  count++;
};

resetBtn.onclick = () => { photoLayer.innerHTML=""; count=0; };

// Stickers from Canva
const stickerUrls = [
  'https://example.com/sticker1.png',
  'https://example.com/sticker2.png'
];
stickerUrls.forEach(url=>{
  const btn=document.createElement("button");
  btn.textContent="Sticker";
  btn.className="modern-btn";
  btn.onclick=()=>addSticker(url);
  document.querySelector('.frame-scroll').appendChild(btn);
});

function addSticker(url){
  const sticker=document.createElement("img");
  sticker.src=url;
  sticker.style.position="absolute";
  sticker.style.left="50px";
  sticker.style.top="50px";
  sticker.style.width="100px";
  sticker.style.height="100px";
  makeDraggable(sticker,scrapCanvas);
  photoLayer.appendChild(sticker);
}

function makeDraggable(el, container){
  el.style.resize="both"; el.style.overflow="hidden";
  let offsetX, offsetY;
  el.onmousedown = e=>{
    e.preventDefault();
    offsetX = e.offsetX; offsetY = e.offsetY;
    document.onmousemove = ev=>{
      let x = ev.pageX-container.getBoundingClientRect().left-offsetX;
      let y = ev.pageY-container.getBoundingClientRect().top-offsetY;
      x=Math.max(0,Math.min(x,container.clientWidth-el.offsetWidth));
      y=Math.max(0,Math.min(y,container.clientHeight-el.offsetHeight));
      el.style.left=x+"px";
      el.style.top=y+"px";
    };
    document.onmouseup=()=>{document.onmousemove=null;}
  };
}

function downloadScrap(){
  const stripeUrl="https://buy.stripe.com/test_abc123";
  if(!confirm("Redirect to payment?")) return;
  window.open(stripeUrl,"_blank");

  setTimeout(()=>{
    html2canvas(scrapCanvas).then(canvas=>{
      const watermark=new Image();
      watermark.src='../img/watermark.png';
      watermark.onload=()=>{
        const finalCanvas=document.createElement("canvas");
        finalCanvas.width=canvas.width; finalCanvas.height=canvas.height;
        const ctx=finalCanvas.getContext("2d");
        ctx.drawImage(canvas,0,0);
        ctx.drawImage(watermark,finalCanvas.width-250,finalCanvas.height-100,200,50);
        const link=document.createElement("a");
        link.href=finalCanvas.toDataURL();
        link.download="scrap.png";
        link.click();
      };
    });
  },1000);
}






