/**
 * Configurator canvas: desenează produsul + zona printabilă + designul urcat de user,
 * cu drag/resize/rotate live și o verificare de rezoluție doar demonstrativă (fără print real).
 */
(function () {
  const params = new URLSearchParams(location.search);
  const slug = params.get("slug");
  const product = getProductBySlug(slug) || CATALOG[0];

  document.title = `${product.name} — ${SITE_NAME}`;

  const canvas = document.getElementById("stage-canvas");
  const ctx = canvas.getContext("2d");
  const wrap = document.getElementById("stage-canvas-wrap");
  const CANVAS_SIZE = 1024;
  canvas.width = CANVAS_SIZE;
  canvas.height = CANVAS_SIZE;

  // --- state -------------------------------------------------------------
  let activeVariant = product.variants[0];
  let baseImage = null; // Image du produs (variantă curentă)
  let designImage = null; // Image urcată de user
  let design = {
    x: 0, // centru, în coordonate canvas
    y: 0,
    scale: 1, // multiplicator peste scala inițială (fit-in-area)
    baseScale: 1,
    rotation: 0, // radiani
    naturalW: 0,
    naturalH: 0,
  };
  let dragging = false;
  let dragStart = { x: 0, y: 0, designX: 0, designY: 0 };

  const PRINT_DPI_TARGET = 300;
  // prag minim de rezoluție pentru "OK" — dimensiunea zonei printabile (în inch la 300dpi aprox.)
  function resolutionOk() {
    if (!designImage) return null;
    const area = product.printArea;
    const renderedW = area.w * design.scale * design.baseScale;
    const renderedH = area.h * design.scale * design.baseScale;
    // pixeli reali disponibili per pixel afișat
    const effDpiX = (designImage.naturalWidth / renderedW) * (CANVAS_SIZE / 1024) * 96;
    const effDpiY = (designImage.naturalHeight / renderedH) * (CANVAS_SIZE / 1024) * 96;
    const effDpi = Math.min(effDpiX, effDpiY);
    return effDpi >= PRINT_DPI_TARGET * 0.55; // prag demonstrativ, nu un calcul real de print
  }

  function loadImage(src) {
    return new Promise((resolve, reject) => {
      const img = new Image();
      img.onload = () => resolve(img);
      img.onerror = reject;
      img.src = src;
    });
  }

  async function setVariant(variant) {
    activeVariant = variant;
    baseImage = await loadImage(variant.image);
    render();
  }

  function drawPrintAreaOutline() {
    const a = product.printArea;
    ctx.save();
    ctx.strokeStyle = "rgba(180, 90, 50, 0.55)";
    ctx.setLineDash([8, 6]);
    ctx.lineWidth = 2;
    ctx.strokeRect(a.x, a.y, a.w, a.h);
    ctx.restore();
  }

  function render() {
    ctx.clearRect(0, 0, CANVAS_SIZE, CANVAS_SIZE);
    if (baseImage) {
      ctx.drawImage(baseImage, 0, 0, CANVAS_SIZE, CANVAS_SIZE);
    }

    const a = product.printArea;

    if (designImage) {
      ctx.save();
      // clip la zona printabilă
      ctx.beginPath();
      ctx.rect(a.x, a.y, a.w, a.h);
      ctx.clip();

      ctx.translate(design.x, design.y);
      ctx.rotate(design.rotation);
      const w = design.naturalW * design.scale * design.baseScale;
      const h = design.naturalH * design.scale * design.baseScale;
      ctx.drawImage(designImage, -w / 2, -h / 2, w, h);
      ctx.restore();
    } else {
      ctx.save();
      ctx.fillStyle = "rgba(120, 80, 60, 0.06)";
      ctx.fillRect(a.x, a.y, a.w, a.h);
      ctx.restore();
    }

    drawPrintAreaOutline();
    updateResolutionIndicator();
  }

  function fitDesignToArea() {
    const a = product.printArea;
    const scaleX = a.w / design.naturalW;
    const scaleY = a.h / design.naturalH;
    design.baseScale = Math.min(scaleX, scaleY) * 0.9;
    design.scale = 1;
    design.rotation = 0;
    design.x = a.x + a.w / 2;
    design.y = a.y + a.h / 2;
  }

  async function handleFile(file) {
    if (!file || !file.type.startsWith("image/")) return;
    const url = URL.createObjectURL(file);
    designImage = await loadImage(url);
    design.naturalW = designImage.naturalWidth;
    design.naturalH = designImage.naturalHeight;
    fitDesignToArea();
    document.getElementById("file-name").textContent = file.name;
    document.getElementById("scale-range").value = "1";
    document.getElementById("rotate-range").value = "0";
    document.getElementById("add-to-cart").disabled = false;
    render();
  }

  function updateResolutionIndicator() {
    const el = document.getElementById("res-indicator");
    if (!designImage) {
      el.hidden = true;
      return;
    }
    const ok = resolutionOk();
    el.hidden = false;
    if (ok) {
      el.className = "res-indicator good";
      el.textContent = "✓ Rezoluție bună pentru print";
    } else {
      el.className = "res-indicator bad";
      el.textContent = "⚠ Rezoluție joasă — printul poate ieși neclar";
    }
  }

  // --- interacțiune: drag / pinch -----------------------------------------
  function canvasPoint(evt) {
    const rect = canvas.getBoundingClientRect();
    const clientX = evt.touches ? evt.touches[0].clientX : evt.clientX;
    const clientY = evt.touches ? evt.touches[0].clientY : evt.clientY;
    return {
      x: ((clientX - rect.left) / rect.width) * CANVAS_SIZE,
      y: ((clientY - rect.top) / rect.height) * CANVAS_SIZE,
    };
  }

  function pointerDown(evt) {
    if (!designImage) return;
    const p = canvasPoint(evt);
    dragging = true;
    wrap.classList.add("dragging");
    dragStart = { x: p.x, y: p.y, designX: design.x, designY: design.y };
    evt.preventDefault();
  }

  function pointerMove(evt) {
    if (!dragging) return;
    const p = canvasPoint(evt);
    design.x = dragStart.designX + (p.x - dragStart.x);
    design.y = dragStart.designY + (p.y - dragStart.y);
    render();
    evt.preventDefault();
  }

  function pointerUp() {
    dragging = false;
    wrap.classList.remove("dragging");
  }

  canvas.addEventListener("mousedown", pointerDown);
  window.addEventListener("mousemove", pointerMove);
  window.addEventListener("mouseup", pointerUp);
  canvas.addEventListener("touchstart", pointerDown, { passive: false });
  window.addEventListener("touchmove", pointerMove, { passive: false });
  window.addEventListener("touchend", pointerUp);

  // pinch-to-zoom simplu (2 degete)
  let pinchStartDist = null;
  let pinchStartScale = 1;
  canvas.addEventListener(
    "touchstart",
    (evt) => {
      if (evt.touches.length === 2) {
        dragging = false;
        const [t1, t2] = evt.touches;
        pinchStartDist = Math.hypot(t2.clientX - t1.clientX, t2.clientY - t1.clientY);
        pinchStartScale = design.scale;
      }
    },
    { passive: true }
  );
  canvas.addEventListener(
    "touchmove",
    (evt) => {
      if (evt.touches.length === 2 && pinchStartDist) {
        const [t1, t2] = evt.touches;
        const dist = Math.hypot(t2.clientX - t1.clientX, t2.clientY - t1.clientY);
        const factor = dist / pinchStartDist;
        design.scale = clamp(pinchStartScale * factor, 0.2, 4);
        document.getElementById("scale-range").value = String(design.scale);
        render();
      }
    },
    { passive: true }
  );
  window.addEventListener("touchend", () => {
    pinchStartDist = null;
  });

  function clamp(v, min, max) {
    return Math.max(min, Math.min(max, v));
  }

  // --- UI: build page ------------------------------------------------------
  function buildVariantSwatches() {
    const row = document.getElementById("variant-row");
    const field = document.getElementById("variant-field");
    if (product.variants.length <= 1) {
      field.hidden = true;
      return;
    }
    row.innerHTML = "";
    product.variants.forEach((variant) => {
      const btn = document.createElement("button");
      btn.type = "button";
      btn.className = "variant-swatch" + (variant === activeVariant ? " active" : "");
      btn.textContent = variant.label;
      btn.addEventListener("click", () => {
        [...row.children].forEach((c) => c.classList.remove("active"));
        btn.classList.add("active");
        setVariant(variant);
      });
      row.appendChild(btn);
    });
  }

  function init() {
    document.getElementById("product-name").textContent = product.name;
    document.getElementById("product-desc").textContent = product.description;
    document.getElementById("product-price").textContent = "de la " + formatRON(product.priceFrom);

    buildVariantSwatches();
    setVariant(activeVariant);

    const fileInput = document.getElementById("file-input");
    fileInput.addEventListener("change", (e) => handleFile(e.target.files[0]));

    document.getElementById("scale-range").addEventListener("input", (e) => {
      design.scale = parseFloat(e.target.value);
      render();
    });

    document.getElementById("rotate-range").addEventListener("input", (e) => {
      design.rotation = (parseFloat(e.target.value) * Math.PI) / 180;
      render();
    });

    document.getElementById("reset-position").addEventListener("click", () => {
      if (!designImage) return;
      fitDesignToArea();
      document.getElementById("scale-range").value = "1";
      document.getElementById("rotate-range").value = "0";
      render();
    });

    document.getElementById("add-to-cart").addEventListener("click", () => {
      if (!designImage) return;
      const thumb = canvas.toDataURL("image/jpeg", 0.82);
      addToCart({
        slug: product.slug,
        name: product.name,
        variant: activeVariant.label,
        price: product.priceFrom,
        thumb,
      });
      updateCartBadge();
      showAddedToast();
    });
  }

  function showAddedToast() {
    const toast = document.getElementById("added-toast");
    toast.hidden = false;
    toast.classList.add("show");
    clearTimeout(showAddedToast._t);
    showAddedToast._t = setTimeout(() => {
      toast.hidden = true;
    }, 2200);
  }

  init();
})();
