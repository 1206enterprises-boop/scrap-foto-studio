const video = document.getElementById("video");
const canvas = document.getElementById("canvas");
const captureBtn = document.getElementById("captureBtn");
const slots = document.querySelectorAll(".photo-slot");
const resetBtn = document.getElementById("resetBtn");
const exportBtn = document.getElementById("exportBtn");
const photoCounter = document.getElementById("photoCounter");
const scrapArea = document.getElementById("scrapArea");
const stickers = document.querySelectorAll(".sticker");
const productSelect = document.getElementById("productType");

let photoIndex = 0;
let hasPaid = localStorage.getItem("paid") === "true";

/* CAMERA */
async function startCamera(){
  const stream = await navigator.mediaDevices.getUserMedia({ video:true });
  video.srcObject = stream;
}
startCamera();

/* TAKE PHOTO */
captureBtn.addEventListener("click", ()=>{
  if(photoIndex >= 4) return;

  canvas.width = video.videoWidth;
  canvas.height = video.videoHeight;
  canvas.getContext("2d").drawImage(video,0,0);

  const img = document.createElement("img");
  img.src = canvas.toDataURL("image/png");

  slots[photoIndex].appendChild(img);
  photoIndex++;
  photoCounter.innerText = photoIndex + " / 4";

  if(photoIndex === 4){
    captureBtn.disabled = true;
  }
});

/* STICKERS */
stickers.forEach(sticker=>{
  sticker.addEventListener("click", ()=>{
    const wrapper = document.createElement("div");
    wrapper.style.position="absolute";
    wrapper.style.top="100px";
    wrapper.style.left="50px";

    const img = document.createElement("img");
    img.src = sticker.src;
    img.style.width="80px";
    wrapper.appendChild(img);

    const del = document.createElement("div");
    del.className="delete-btn";
    del.innerText="×";
    del.onclick=()=>wrapper.remove();
    wrapper.appendChild(del);

    scrapArea.appendChild(wrapper);

    interact(wrapper)
      .draggable({
        listeners:{
          move(event){
            const x=(parseFloat(wrapper.getAttribute("data-x"))||0)+event.dx;
            const y=(parseFloat(wrapper.getAttribute("data-y"))||0)+event.dy;
            wrapper.style.transform=`translate(${x}px,${y}px)`;
            wrapper.setAttribute("data-x",x);
            wrapper.setAttribute("data-y",y);
          }
        }
      })
      .resizable({
        edges:{left:true,right:true,bottom:true,top:true},
        listeners:{
          move(event){
            img.style.width=event.rect.width+"px";
          }
        }
      });
  });
});

/* RESET */
resetBtn.addEventListener("click", ()=>{
  slots.forEach(slot=>slot.innerHTML="");
  document.querySelectorAll(".delete-btn").forEach(btn=>btn.parentElement.remove());
  photoIndex=0;
  photoCounter.innerText="0 / 4";
  captureBtn.disabled=false;
  localStorage.removeItem("paid");
});

/* DOWNLOAD LOCK */
exportBtn.addEventListener("click", ()=>{
  if(!hasPaid){
    window.location.href="https://buy.stripe.com/YOUR_STRIPE_LINK";
    return;
  }
  html2canvas(scrapArea).then(canvas=>{
    const link=document.createElement("a");
    link.href=canvas.toDataURL();
    link.download="scrap.png";
    link.click();
  });
});









