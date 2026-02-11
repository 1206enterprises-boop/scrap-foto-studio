let video = document.getElementById("video");
let snap = document.getElementById("snap");
let frameOverlay = document.getElementById("frameOverlay");

let photoCount = 0;
let maxPhotos = 4;

navigator.mediaDevices.getUserMedia({ video: true })
.then(stream => {
  video.srcObject = stream;
})
.catch(err => {
  alert("Camera not working. Use HTTPS.");
});

let selectedFrame = localStorage.getItem("selectedFrame");
frameOverlay.src = "../img/frames/" + selectedFrame + ".png";

snap.addEventListener("click", () => {
  if(photoCount >= maxPhotos) return;

  let canvas = document.createElement("canvas");
  canvas.width = video.videoWidth;
  canvas.height = video.videoHeight;

  let ctx = canvas.getContext("2d");
  ctx.drawImage(video, 0, 0);

  let img = document.createElement("img");
  img.src = canvas.toDataURL("image/png");

  photoCount++;
  document.getElementById("slot" + photoCount).appendChild(img);
});

function addSticker() {
  let url = prompt("Paste Canva Sticker Image URL:");
  if(!url) return;

  let sticker = document.createElement("img");
  sticker.src = url;
  sticker.className = "sticker";
  sticker.style.position = "absolute";
  sticker.style.width = "100px";
  sticker.style.top = "200px";
  sticker.style.left = "100px";
  sticker.draggable = true;

  makeDraggable(sticker);

  document.getElementById("photoStrip").appendChild(sticker);
}

function makeDraggable(el) {
  el.onmousedown = function(e) {
    e.preventDefault();
    document.onmousemove = function(e) {
      el.style.left = e.pageX - 50 + "px";
      el.style.top = e.pageY - 50 + "px";
    };
    document.onmouseup = function() {
      document.onmousemove = null;
    };
  };
}

function applyFilter(type) {
  document.querySelectorAll(".photo-slot img").forEach(img=>{
    if(type==="grayscale"){
      img.style.filter="grayscale(100%)";
    }
  });
}

function downloadStrip() {
  html2canvas(document.getElementById("photoStrip")).then(canvas=>{
    let link = document.createElement("a");
    link.download = "photostrip.png";
    link.href = canvas.toDataURL();
    link.click();
  });
}

function resetSession(){
  photoCount = 0;
  document.querySelectorAll(".photo-slot").forEach(slot=>{
    slot.innerHTML="";
  });
  document.querySelectorAll(".sticker").forEach(s=>s.remove());
}
