const video = document.getElementById("video");
const startBtn = document.getElementById("startBtn");
const takeBtn = document.getElementById("takeBtn");
const resetBtn = document.getElementById("resetBtn");
const photoLayer = document.getElementById("photoLayer");
const templateImg = document.getElementById("templateImg");
const stripCanvas = document.getElementById("stripCanvas");
let count = 0;

// Load frame
templateImg.src = localStorage.getItem('frame') || '../img/strip-template.png';

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
  const stripHeight = stripCanvas.clientHeight;
  const slotHeight = stripHeight/4;
  img.style.position = "absolute";
  img.style.top = `${count*slotHeight}px`;
  img.style.left = "0px";
  img.style.width = "100%";
  img.style.height = `${slotHeight}px`;

  photoLayer.appendChild(img);
  count++;
};

// Reset
resetBtn.onclick = () => {
  photoLayer.innerHTML = "";
  count = 0;
};

// Download with payment and watermark
function downloadStrip(){
  const stripeUrl = "https://buy.stripe.com/test_abc123"; 
  if(!confirm("You will be redirected to payment before download. Proceed?")) return;
  window.open(stripeUrl, "_blank");

  setTimeout(()=>{
    html2canvas(stripCanvas).then(canvas=>{
      const watermark = new Image();
      watermark.src='../img/watermark.png';
      watermark.onload = ()=>{
        const finalCanvas = document.createElement("canvas");
        finalCanvas.width = canvas.width;
        finalCanvas.height = canvas.height;
        const ctx = finalCanvas.getContext("2d");
        ctx.drawImage(canvas,0,0);
        ctx.drawImage(watermark, finalCanvas.width-250, finalCanvas.height-100,200,50);
        const link = document.createElement("a");
        link.href = finalCanvas.toDataURL();
        link.download = "strip.png";
        link.click();
      };
    });
  },1000);
}



