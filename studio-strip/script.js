// Elements
const video = document.getElementById("video");
const startBtn = document.getElementById("startBtn");
const takeBtn = document.getElementById("takeBtn");
const photoLayer = document.getElementById("photoLayer");
const templateImg = document.getElementById("templateImg");
const stripCanvas = document.getElementById("stripCanvas");
let count = 0;

// Load selected frame
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
  if(count >= 4) return; // max 4 photos

  // Capture video to canvas
  const canvas = document.createElement("canvas");
  canvas.width = 1080;
  canvas.height = 1920;
  const ctx = canvas.getContext("2d");
  ctx.drawImage(video, 0, 0, canvas.width, canvas.height);

  // Create photo element
  const img = document.createElement("img");
  img.src = canvas.toDataURL("image/png");
  img.style.position = "absolute";

  // Auto-fit into strip
  const stripHeight = stripCanvas.clientHeight;
  const slotHeight = stripHeight / 4; // 4 slots
  img.style.top = `${count * slotHeight}px`;
  img.style.left = "0px";
  img.style.width = "100%";
  img.style.height = `${slotHeight}px`;

  photoLayer.appendChild(img);
  count++;
};

// Download with watermark and payment
function downloadStrip(){
  // Optional: payment before download
  const stripeUrl = "https://buy.stripe.com/test_abc123"; // replace with your Stripe link
  const confirmed = confirm("You will be redirected to payment before download. Proceed?");
  if(!confirmed) return;
  window.open(stripeUrl, "_blank");

  // Wait a moment to ensure payment popup opens
  setTimeout(()=>{
    html2canvas(stripCanvas).then(canvas=>{
      const watermark = new Image();
      watermark.src = '../img/watermark.png'; // add watermark in img folder
      watermark.onload = ()=>{
        const finalCanvas = document.createElement("canvas");
        finalCanvas.width = canvas.width;
        finalCanvas.height = canvas.height;
        const ctx = finalCanvas.getContext("2d");
        ctx.drawImage(canvas,0,0);
        ctx.drawImage(watermark, finalCanvas.width-250, finalCanvas.height-100,200,50); // bottom right
        const link = document.createElement("a");
        link.href = finalCanvas.toDataURL();
        link.download = "strip.png";
        link.click();
      };
    });
  },1000);
}


