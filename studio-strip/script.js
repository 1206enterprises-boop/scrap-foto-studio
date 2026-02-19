function makeDraggableResizable(el, container) {
  el.style.position = "absolute";
  el.style.transformOrigin = "center center";
  el.style.cursor = "move";

  let rotation = 0;
  let scale = 1;
  let isDragging = false;
  let startX, startY, startLeft, startTop;

  // === DRAG MOVE ===
  el.addEventListener("mousedown", (e) => {
    if (e.target.classList.contains("resize-handle") || 
        e.target.classList.contains("rotate-handle")) return;

    isDragging = true;
    startX = e.clientX;
    startY = e.clientY;
    startLeft = parseFloat(el.style.left) || 0;
    startTop = parseFloat(el.style.top) || 0;
  });

  document.addEventListener("mousemove", (e) => {
    if (!isDragging) return;
    let dx = e.clientX - startX;
    let dy = e.clientY - startY;
    el.style.left = startLeft + dx + "px";
    el.style.top = startTop + dy + "px";
  });

  document.addEventListener("mouseup", () => isDragging = false);

  // === RESIZE HANDLES ===
  const corners = ["nw", "ne", "sw", "se"];

  corners.forEach(pos => {
    const handle = document.createElement("div");
    handle.className = "resize-handle " + pos;
    handle.style.position = "absolute";
    handle.style.width = "12px";
    handle.style.height = "12px";
    handle.style.background = "#FFD700";
    handle.style.borderRadius = "50%";
    handle.style.zIndex = "1000";

    positionHandle(handle, pos);

    let resizing = false;
    let startWidth, startHeight;

    handle.addEventListener("mousedown", (e) => {
      e.stopPropagation();
      resizing = true;
      startX = e.clientX;
      startY = e.clientY;
      startWidth = el.offsetWidth;
      startHeight = el.offsetHeight;
    });

    document.addEventListener("mousemove", (e) => {
      if (!resizing) return;
      let dx = e.clientX - startX;
      let newWidth = startWidth + dx;
      if (newWidth > 50) el.style.width = newWidth + "px";
    });

    document.addEventListener("mouseup", () => resizing = false);

    el.appendChild(handle);
  });

  // === ROTATE HANDLE ===
  const rotateHandle = document.createElement("div");
  rotateHandle.className = "rotate-handle";
  rotateHandle.style.position = "absolute";
  rotateHandle.style.top = "-25px";
  rotateHandle.style.left = "50%";
  rotateHandle.style.transform = "translateX(-50%)";
  rotateHandle.style.width = "14px";
  rotateHandle.style.height = "14px";
  rotateHandle.style.background = "#FF4D4D";
  rotateHandle.style.borderRadius = "50%";
  rotateHandle.style.cursor = "grab";
  rotateHandle.style.zIndex = "1000";

  el.appendChild(rotateHandle);

  let rotating = false;

  rotateHandle.addEventListener("mousedown", (e) => {
    e.stopPropagation();
    rotating = true;
  });

  document.addEventListener("mousemove", (e) => {
    if (!rotating) return;

    const rect = el.getBoundingClientRect();
    const centerX = rect.left + rect.width / 2;
    const centerY = rect.top + rect.height / 2;

    const angle = Math.atan2(
      e.clientY - centerY,
      e.clientX - centerX
    );

    rotation = angle * (180 / Math.PI);
    el.style.transform = `rotate(${rotation}deg)`;
  });

  document.addEventListener("mouseup", () => rotating = false);

  // === HELPER ===
  function positionHandle(handle, pos) {
    if (pos.includes("n")) handle.style.top = "-6px";
    if (pos.includes("s")) handle.style.bottom = "-6px";
    if (pos.includes("w")) handle.style.left = "-6px";
    if (pos.includes("e")) handle.style.right = "-6px";
  }
}
