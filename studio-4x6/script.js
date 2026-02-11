const video = document.getElementById("video");
const startBtn = document.getElementById("startBtn");
const takeBtn = document.getElementById("takeBtn");
const photoLayer = document.getElementById("photoLayer");
const templateImg = document.getElementById("templateImg");
let count = 0;

// Load frame
templateImg.src = localStorage.getItem('frame') || '../img/4x6-template.png';

// Start camera
startBtn.onclick = async () => {
  const stream = await navigator.mediaDevices.getUserMedia({video:{width:{ideal:1080},height:{ideal:1920},facingMode:"user"}});
  video.srcObject = stream;
};

// Take photo
takeBtn.onclick = () => {
  if(count>=4) return;
  const canvas = document.createElement("canvas");
  canvas.width=1080; canvas.height=1920;
  const ctx = canvas.getContext("2d");
  ctx.drawImage(video,0,0,canvas.width,canvas.height);

  const img = document.createElement("img");
  img.src = canvas.toDataURL("image/png");
  img.style.left=(count*80+80)+"px";
  img.style.top="200px";

  makeDraggable(img);
  photoLayer.appendChild(img);
  count++;
};

// Drag & move
function makeDraggable(el){
  let offsetX,offsetY;
  el.onmousedown=e=>{
    offsetX=e.offsetX;
    offsetY=e.offsetY;
    document.onmousemove=ev=>{
      el.style.left=(ev.pageX-offsetX)+"px";
      el.style.top=(ev.pageY-offsetY)+"px";
    };
    document.onmouseup=()=>document.onmousemove=null;
  };
}

// Download
function downloadScrap(){
  html2canvas(document.getElementById("scrapCanvas")).then(canvas=>{
    const link = document.createElement("a");
    link.download="scrap.png";
    link.href = canvas.toDataURL();
    link.click();
  });
}


