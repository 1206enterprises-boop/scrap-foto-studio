const video = document.getElementById("video");
const startBtn = document.getElementById("startBtn");
const takeBtn = document.getElementById("takeBtn");
const photoLayer = document.getElementById("photoLayer");
let count = 0;

startBtn.onclick = async () => {
  const stream = await navigator.mediaDevices.getUserMedia({
    video:{width:{ideal:1080},height:{ideal:1920},facingMode:"user"}
  });
  video.srcObject = stream;
};

takeBtn.onclick = () => {
  if(count>=4) return;
  const canvas = document.createElement("canvas");
  canvas.width=1080; canvas.height=1920;
  const ctx=canvas.getContext("2d");
  ctx.drawImage(video,0,0,canvas.width,canvas.height);

  const img=document.createElement("img");
  img.src=canvas.toDataURL("image/png");
  img.style.top=(count*210+50)+"px";
  photoLayer.appendChild(img);
  count++;
};

function downloadStrip(){
  html2canvas(document.getElementById("stripCanvas")).then(canvas=>{
    const link=document.createElement("a");
    link.download="strip.png";
    link.href=canvas.toDataURL();
    link.click();
  });
}

