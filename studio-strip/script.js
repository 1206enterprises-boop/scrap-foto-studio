const video = document.getElementById("video");
const startBtn = document.getElementById("startBtn");
const takeBtn = document.getElementById("takeBtn");
const resetBtn = document.getElementById("resetBtn");
const photoLayer = document.getElementById("photoLayer");
const templateImg = document.getElementById("templateImg");
const stripCanvas = document.getElementById("stripCanvas");
let count = 0;

templateImg.src = localStorage.getItem('frame') || '../img/strip-template1.png';

startBtn.onclick = async () => {
  const stream = await navigator.mediaDevices.getUserMedia({ video: true });
  video.srcObject = stream;
};

takeBtn.onclick = () => {
  if(count >= 4) return;
  const canvas = document.createElement("canvas");
  canvas.width = 1080; canvas.height = 1920;
  canvas.getContext("2d").drawImage(video,0,0,canvas.width,canvas.height);

  const img = document.createElement("img");
  img.src = canvas.toDataURL();
  const slotHeight = stripCanvas.clientHeight/4;
  img.style.position = "absolute";
  img.style.top = `${count*slotHeight}px`;
  img.style.left = "0px";
  img.style.width = "100%";
  img.style.height = `${slotHeight}px`;

  makeDraggable(img, stripCanvas);
  photoLayer.appendChild(img);
  count++;
};

resetBtn.onclick = () => { photoLayer.innerHTML=""; count=0; };

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
      el.style.left=x+"px"; el.style.top=y+"px";
    };
    document.onmouseup=()=>{document.onmousemove=null;}
  };
}

function downloadStrip(){
  const stripeUrl="https://buy.stripe.com/test_abc123";
  if(!confirm("Redirect to payment?")) return;
  window.open(stripeUrl,"_blank");

  setTimeout(()=>{
    html2canvas(stripCanvas).then(canvas=>{
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
        link.download="strip.png";
        link.click();
      };
    });
  },1000);
}




