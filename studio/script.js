const video = document.getElementById("video");
const takeBtn = document.getElementById("takePhoto");
const startBtn = document.getElementById("startSession");
const photoLayer = document.getElementById("photoLayer");
const stickerLayer = document.getElementById("stickerLayer");
const frameBackground = document.getElementById("frameBackground");

let photosTaken = 0;
let mode = localStorage.getItem("templateMode");
let selectedFrame = localStorage.getItem("selectedFrame");

const stripe = Stripe("YOUR_STRIPE_PUBLIC_KEY");

// ================== CANVA BACKGROUNDS ==================
const backgrounds = {
strip: {
frame1: "https://your-canva-strip-frame1.png",
frame2: "https://your-canva-strip-frame2.png"
},
"4x6": {
frame1: "https://your-canva-4x6-frame1.png",
frame2: "https://your-canva-4x6-frame2.png"
}
};

const stickers = [
"https://your-canva-sticker1.png",
"https://your-canva-sticker2.png"
];

// ================== LOAD FRAME ==================
window.onload = () => {

if(mode === "strip"){
document.getElementById("stripContainer").style.height = "900px";
}
if(mode === "4x6"){
document.getElementById("stripContainer").style.height = "600px";
}

frameBackground.src = backgrounds[mode][selectedFrame];
};

// ================== START CAMERA ==================
startBtn.onclick = async () => {
const stream = await navigator.mediaDevices.getUserMedia({video:true});
video.srcObject = stream;
};

// ================== TAKE PHOTO ==================
takeBtn.onclick = () => {

if(photosTaken >= 4) return;

const canvas = document.createElement("canvas");
canvas.width = video.videoWidth;
canvas.height = video.videoHeight;
canvas.getContext("2d").drawImage(video,0,0);

const img = document.createElement("img");
img.src = canvas.toDataURL();

if(mode === "strip"){
img.style.width = "250px";
img.style.left = "25px";
img.style.top = (photosTaken * 210 + 50) + "px";
}else{
img.style.width = "200px";
img.style.left = (50 + photosTaken*60) + "px";
img.style.top = "100px";
makeDraggable(img);
makeResizable(img);
}

photoLayer.appendChild(img);
photosTaken++;
};

// ================== STICKERS ==================
function addSticker(){
const img = document.createElement("img");
img.src = stickers[0];
img.style.width="100px";
img.style.top="200px";
img.style.left="100px";
stickerLayer.appendChild(img);
makeDraggable(img);
makeResizable(img);
}

// ================== DRAG ==================
function makeDraggable(el){
let offsetX, offsetY;
el.onmousedown = e=>{
offsetX=e.offsetX;
offsetY=e.offsetY;
document.onmousemove = ev=>{
el.style.left = ev.pageX - offsetX + "px";
el.style.top = ev.pageY - offsetY + "px";
};
document.onmouseup=()=>document.onmousemove=null;
};
}

// ================== RESIZE ==================
function makeResizable(el){
el.ondblclick = ()=>{
el.style.width = (el.offsetWidth + 20)+"px";
};
}

// ================== RESET ==================
function resetSession(){
photoLayer.innerHTML="";
stickerLayer.innerHTML="";
photosTaken=0;
}

// ================== WATERMARK + PAYMENT ==================
function downloadStrip(){

if(photosTaken<4){
alert("Take 4 photos first");
return;
}

if(!localStorage.getItem("paid")){
alert("Redirecting to Payment");
stripe.redirectToCheckout({
lineItems:[{price:"YOUR_STRIPE_PRICE_ID",quantity:1}],
mode:"payment",
successUrl:window.location.href+"?paid=true",
cancelUrl:window.location.href
});
return;
}

const container=document.getElementById("stripContainer");
html2canvas(container).then(canvas=>{
const link=document.createElement("a");
link.download="scrapfoto.png";
link.href=canvas.toDataURL();
link.click();
});
}
