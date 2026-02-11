const video = document.getElementById("video");
const startBtn = document.getElementById("startSession");
const takeBtn = document.getElementById("takePhoto");
const photoLayer = document.getElementById("photoLayer");
const stickerLayer = document.getElementById("stickerLayer");
const frameBackground = document.getElementById("frameBackground");
const canvasContainer = document.getElementById("canvasContainer");

let photosTaken = 0;
let mode = localStorage.getItem("templateMode") || "strip";

/* ========================
   CAMERA START
======================== */

startBtn.onclick = async () => {

const stream = await navigator.mediaDevices.getUserMedia({
video: {
width: { ideal: 1080 },
height: { ideal: 1920 },
facingMode: "user"
}
});

video.srcObject = stream;
};

/* ========================
   SET TEMPLATE SIZE
======================== */

window.onload = () => {

if(mode === "strip"){
canvasContainer.style.width = "300px";
canvasContainer.style.height = "900px";
frameBackground.src = "https://your-canva-strip.png";
}

if(mode === "4x6"){
canvasContainer.style.width = "600px";
canvasContainer.style.height = "900px";
frameBackground.src = "https://your-canva-4x6.png";
}
};

/* ========================
   TAKE PHOTO (PORTRAIT)
======================== */

takeBtn.onclick = () => {

if(photosTaken >= 4) return;

const canvas = document.createElement("canvas");

canvas.width = 1080;
canvas.height = 1920;

const ctx = canvas.getContext("2d");
ctx.drawImage(video, 0, 0, canvas.width, canvas.height);

const img = document.createElement("img");
img.src = canvas.toDataURL();
img.style.objectFit = "cover";

if(mode === "strip"){
img.style.width = "260px";
img.style.height = "200px";
img.style.left = "20px";
img.style.top = (photosTaken * 210 + 50) + "px";
}

if(mode === "4x6"){
img.style.width = "250px";
img.style.height = "350px";
img.style.left = (photosTaken * 70 + 60) + "px";
img.style.top = "200px";
makeDraggable(img);
makeResizable(img);
}

photoLayer.appendChild(img);
photosTaken++;
};

/* ========================
   DRAG
======================== */

function makeDraggable(el){

let offsetX, offsetY;

el.onmousedown = e => {
offsetX = e.offsetX;
offsetY = e.offsetY;

document.onmousemove = ev => {
el.style.left = ev.pageX - offsetX + "px";
el.style.top = ev.pageY - offsetY + "px";
};

document.onmouseup = () => document.onmousemove = null;
};
}

/* ========================
   RESIZE
======================== */

function makeResizable(el){
el.ondblclick = () => {
el.style.width = (el.offsetWidth + 20) + "px";
};
}

/* ========================
   ADD STICKER
======================== */

function addSticker(){

const sticker = document.createElement("img");
sticker.src = "https://your-canva-sticker.png";
sticker.style.width = "120px";
sticker.style.top = "300px";
sticker.style.left = "100px";

stickerLayer.appendChild(sticker);
makeDraggable(sticker);
makeResizable(sticker);
}

/* ========================
   RESET
======================== */

function resetSession(){
photoLayer.innerHTML = "";
stickerLayer.innerHTML = "";
photosTaken = 0;
}

/* ========================
   DOWNLOAD (WORKING)
======================== */

function downloadStrip(){

if(photosTaken < 4){
alert("Please take 4 photos first");
return;
}

html2canvas(canvasContainer).then(canvas => {

const link = document.createElement("a");
link.download = "scrapfoto.png";
link.href = canvas.toDataURL("image/png");
link.click();

});
}

