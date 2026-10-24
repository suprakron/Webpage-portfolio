(() => {
  "use strict";
  const $ = (id) => document.getElementById(id);
  const canvas = $("scanCanvas"),
    context = canvas.getContext("2d");
  const state = {
    image: null,
    crop: null,
    start: null,
    dragging: false,
    online: false,
    busy: false,
    sample: null,
    api: "http://127.0.0.1:8000",
    blobUrl: null,
    samples: [],
    request: 0,
  };
  const labels = { empty: "ช่องว่าง", selecttrue: "ช่องที่ฝนแล้ว" };
  const local =
    location.hostname === "localhost" || location.hostname === "127.0.0.1";
  // Remote portfolio visitors do not get automatic requests to their private network.
  // Connecting locally remains an explicit action; local presentations connect on load.
  function message(text, error = false) {
    $("labMessage").textContent = text;
    $("labMessage").classList.toggle("error", error);
  }
  function updateButton() {
    $("scanButton").disabled = !state.online || !state.image || state.busy;
    $("useWhole").disabled = !state.image || state.busy;
    $("imageUpload").disabled = state.busy;
    document
      .querySelectorAll(".sample-button")
      .forEach((b) => (b.disabled = state.busy));
  }
  function resetResult() {
    $("resultEmpty").hidden = false;
    $("resultBody").hidden = true;
    $("resultBody").className = "";
  }
  async function connect() {
    if (state.busy) return;
    state.online = false;
    updateButton();
    const badge = $("connectionBadge");
    badge.className = "connection-badge pending";
    badge.replaceChildren(
      document.createElement("i"),
      document.createTextNode("กำลังตรวจสอบโมเดล"),
    );
    try {
      const url = new URL($("apiOrigin").value);
      if (
        !["http:", "https:"].includes(url.protocol) ||
        url.username ||
        url.password
      )
        throw new Error("ใช้ Backend URL แบบ http:// หรือ https:// เท่านั้น");
      state.api = url.origin;
      const response = await fetch(state.api + "/health/ai", {
        signal: AbortSignal.timeout(8000),
        cache: "no-store",
      });
      if (!response.ok) throw new Error("Backend ตอบกลับไม่สำเร็จ");
      const health = await response.json();
      if (!health.yolo?.loaded || !health.yolo?.enabled)
        throw new Error("Backend เปิดอยู่ แต่โมเดล YOLO ยังไม่พร้อม");
      state.online = true;
      badge.className = "connection-badge online";
      badge.replaceChildren(
        document.createElement("i"),
        document.createTextNode("YOLO พร้อมใช้งาน · Live API"),
      );
      $("modelLabel").textContent = health.yolo.architecture;
      message("เชื่อมต่อโมเดลจริงแล้ว เลือกภาพและกดวิเคราะห์เพื่อเริ่มต้น");
    } catch (error) {
      badge.className = "connection-badge offline";
      badge.replaceChildren(
        document.createElement("i"),
        document.createTextNode("ยังไม่เชื่อมต่อ Backend"),
      );
      message(
        error.name === "TypeError" || error.name === "TimeoutError"
          ? "ยังเชื่อมต่อระบบในเครื่องไม่ได้ เปิด FastAPI ที่พอร์ต 8000 แล้วกดเชื่อมต่ออีกครั้ง"
          : error.message,
        true,
      );
    }
    updateButton();
  }
  $("reconnect").addEventListener("click", connect);
  $("saveOrigin").addEventListener("click", connect);

  function sizeCanvas() {
    if (!state.image) return;
    const width = Math.max(160, $("canvasStage").clientWidth - 50);
    const height = document.body.classList.contains("is-presenting")
      ? 220
      : 300;
    const scale = Math.min(
      width / state.image.width,
      height / state.image.height,
    );
    canvas.style.width = `${Math.round(state.image.width * scale)}px`;
    canvas.style.height = `${Math.round(state.image.height * scale)}px`;
    draw();
  }
  function draw() {
    if (!state.image) return;
    context.clearRect(0, 0, canvas.width, canvas.height);
    context.drawImage(state.image, 0, 0);
    if (!state.crop) return;
    const r = state.crop,
      scale = canvas.getBoundingClientRect().width / canvas.width || 1;
    context.save();
    context.fillStyle = "#18345928";
    context.beginPath();
    context.rect(0, 0, canvas.width, canvas.height);
    context.rect(r.x, r.y, r.w, r.h);
    context.fill("evenodd");
    context.strokeStyle = "#88b3f0";
    context.lineWidth = 2 / scale;
    context.strokeRect(r.x, r.y, r.w, r.h);
    context.restore();
  }
  function updateCropFields() {
    if (!state.crop) return;
    $("cropX").value = state.crop.x;
    $("cropY").value = state.crop.y;
    $("cropW").value = state.crop.w;
    $("cropH").value = state.crop.h;
  }
  function wholeImage() {
    if (!state.image || state.busy) return;
    state.crop = { x: 0, y: 0, w: state.image.width, h: state.image.height };
    draw();
    updateCropFields();
    resetResult();
  }
  async function loadImage(src, name, sample = null) {
    if (state.busy) return;
    const request = ++state.request;
    try {
      const image = new Image();
      image.src = src;
      await image.decode();
      if (request !== state.request) return;
      if (
        image.width < 8 ||
        image.height < 8 ||
        image.width > 12000 ||
        image.height > 12000 ||
        image.width * image.height > 24000000
      )
        throw new Error(
          "เลือกภาพที่อ่านได้ชัดเจน ขนาดด้านละ 8–12,000 px และไม่เกิน 24 ล้านพิกเซล",
        );
      state.image = image;
      state.sample = sample;
      canvas.width = image.width;
      canvas.height = image.height;
      state.crop = { x: 0, y: 0, w: image.width, h: image.height };
      $("imageName").textContent = name;
      $("canvasStage").classList.add("has-image");
      resetResult();
      sizeCanvas();
      updateCropFields();
      document
        .querySelectorAll(".sample-button")
        .forEach((b) => b.classList.toggle("selected", b.dataset.src === src));
      message(
        sample
          ? "ภาพจริงจากชุดทดสอบ เลือกใช้ทั้งภาพได้เลย แล้วกดวิเคราะห์"
          : "ลากกรอบรอบวงกลมคำตอบหนึ่งช่อง แล้วกดวิเคราะห์",
      );
      updateButton();
    } catch (error) {
      message(
        error.message || "เปิดภาพไม่สำเร็จ ลองเลือก PNG, JPG หรือ WebP",
        true,
      );
    }
  }
  $("imageUpload").addEventListener("change", (event) => {
    const file = event.target.files?.[0];
    if (!file) return;
    if (file.size > 8 * 1024 * 1024) {
      message("เลือกไฟล์ไม่เกิน 8 MB", true);
      event.target.value = "";
      return;
    }
    if (state.blobUrl) URL.revokeObjectURL(state.blobUrl);
    state.blobUrl = URL.createObjectURL(file);
    loadImage(state.blobUrl, file.name);
    event.target.value = "";
  });
  $("useWhole").addEventListener("click", wholeImage);
  $("applyCrop").addEventListener("click", () => {
    if (!state.image || state.busy) return;
    const x = Math.max(
      0,
      Math.min(
        state.image.width - 8,
        Math.round(Number($("cropX").value) || 0),
      ),
    );
    const y = Math.max(
      0,
      Math.min(
        state.image.height - 8,
        Math.round(Number($("cropY").value) || 0),
      ),
    );
    const w = Math.max(
      8,
      Math.min(
        state.image.width - x,
        Math.round(Number($("cropW").value) || 8),
      ),
    );
    const h = Math.max(
      8,
      Math.min(
        state.image.height - y,
        Math.round(Number($("cropH").value) || 8),
      ),
    );
    state.crop = { x, y, w, h };
    draw();
    updateCropFields();
    resetResult();
  });
  function pointerPosition(event) {
    const bounds = canvas.getBoundingClientRect();
    return {
      x: Math.max(
        0,
        Math.min(
          canvas.width,
          ((event.clientX - bounds.left) * canvas.width) / bounds.width,
        ),
      ),
      y: Math.max(
        0,
        Math.min(
          canvas.height,
          ((event.clientY - bounds.top) * canvas.height) / bounds.height,
        ),
      ),
    };
  }
  canvas.addEventListener("pointerdown", (event) => {
    if (!state.image || state.busy) return;
    event.preventDefault();
    state.start = pointerPosition(event);
    state.dragging = true;
    canvas.setPointerCapture(event.pointerId);
  });
  canvas.addEventListener("pointermove", (event) => {
    if (!state.dragging) return;
    const p = pointerPosition(event),
      a = state.start;
    state.crop = {
      x: Math.round(Math.min(a.x, p.x)),
      y: Math.round(Math.min(a.y, p.y)),
      w: Math.round(Math.abs(p.x - a.x)),
      h: Math.round(Math.abs(p.y - a.y)),
    };
    draw();
    updateCropFields();
  });
  function endDrag() {
    if (!state.dragging) return;
    state.dragging = false;
    if (!state.crop || state.crop.w < 8 || state.crop.h < 8) wholeImage();
    else {
      resetResult();
      draw();
      updateCropFields();
    }
  }
  canvas.addEventListener("pointerup", endDrag);
  canvas.addEventListener("pointercancel", endDrag);

  function cropCanvas() {
    const r = state.crop;
    if (!r || r.w < 8 || r.h < 8)
      throw new Error("เลือกกรอบวงกลมคำตอบอย่างน้อย 8 × 8 px");
    const output = document.createElement("canvas");
    output.width = r.w;
    output.height = r.h;
    output
      .getContext("2d")
      .drawImage(state.image, r.x, r.y, r.w, r.h, 0, 0, r.w, r.h);
    return output;
  }
  function showResult(result, preview) {
    $("resultEmpty").hidden = true;
    $("resultBody").hidden = false;
    $("resultBody").className = "decision-" + result.decision;
    $("decisionText").textContent =
      result.decision === "review"
        ? "ควรตรวจทาน"
        : labels[result.prediction] || result.prediction;
    $("decisionDescription").textContent = result.accepted
      ? "ความมั่นใจถึงเกณฑ์ที่ตั้งไว้ รับผลจากโมเดลได้"
      : `โมเดลเอนเอียงไปทาง “${labels[result.prediction]}” แต่ยังไม่ถึงเกณฑ์รับผล`;
    $("cropPreview").src = preview;
    const confidence = result.confidence * 100;
    $("confidenceText").textContent = confidence.toFixed(2) + "%";
    $("confidenceBar").style.width = confidence + "%";
    $("thresholdText").textContent =
      `เกณฑ์รับผล ${(result.threshold * 100).toFixed(0)}% · ${result.accepted ? "ผ่านเกณฑ์" : "ส่งตรวจทาน / fallback ในระบบหลัก"}`;
    for (const [key, bar, text] of [
      ["selecttrue", "filledBar", "filledPercent"],
      ["empty", "emptyBar", "emptyPercent"],
    ]) {
      const probability = result.probabilities[key] * 100;
      $(bar).style.width = probability + "%";
      $(text).textContent = probability.toFixed(2) + "%";
    }
    $("latencyText").textContent = result.latency_ms.toFixed(2) + " ms";
    $("inputText").textContent =
      `${result.input.width} × ${result.input.height} px`;
    $("groundTruth").textContent = state.sample
      ? `ป้ายกำกับต้นทาง: ${labels[state.sample.label]} — เป็น annotation ของผู้เผยแพร่ แยกจากผลที่โมเดลทำนายด้านบน`
      : "ภาพที่คุณเลือก — ยังไม่มีป้ายกำกับจริงสำหรับคำนวณความถูกต้องของภาพนี้";
    $("rawResponse").textContent = JSON.stringify(result, null, 2);
  }
  $("scanButton").addEventListener("click", async () => {
    if (!state.online || !state.image || state.busy) return;
    state.busy = true;
    updateButton();
    $("canvasStage").classList.add("is-scanning");
    $("scanButton").textContent = "YOLO กำลังประมวลผล…";
    message("กำลังส่งภาพวงกลมที่เลือกให้โมเดลจริงในเครื่อง");
    resetResult();
    try {
      const output = cropCanvas();
      const preview = output.toDataURL("image/png");
      const blob = await new Promise((resolve) =>
        output.toBlob(resolve, "image/png"),
      );
      if (!blob) throw new Error("เตรียมภาพไม่สำเร็จ");
      const form = new FormData();
      form.append("image", blob, "bubble-crop.png");
      const response = await fetch(state.api + "/ai/classify-bubble", {
        method: "POST",
        body: form,
        signal: AbortSignal.timeout(30000),
      });
      const result = await response.json();
      if (!response.ok)
        throw new Error(
          typeof result.detail === "string"
            ? result.detail
            : "โมเดลตอบกลับไม่สำเร็จ",
        );
      if (
        !["empty", "selecttrue"].includes(result.prediction) ||
        !Number.isFinite(result.confidence)
      )
        throw new Error("ข้อมูลตอบกลับจากโมเดลไม่ถูกต้อง");
      showResult(result, preview);
      message(
        "ประมวลผลสำเร็จจาก API จริง · ไม่ได้บันทึกภาพหรือผลลงฐานข้อมูลนักเรียน",
      );
    } catch (error) {
      message(
        error.name === "TypeError" || error.name === "TimeoutError"
          ? "เชื่อมต่อโมเดลไม่สำเร็จ ตรวจว่า Backend ยังเปิดอยู่ แล้วลองใหม่"
          : error.message,
        true,
      );
    } finally {
      state.busy = false;
      $("canvasStage").classList.remove("is-scanning");
      $("scanButton").replaceChildren(
        document.createTextNode("วิเคราะห์ด้วย YOLO "),
        Object.assign(document.createElement("span"), { textContent: "↗" }),
      );
      updateButton();
    }
  });
  async function loadSamples() {
    try {
      const response = await fetch("./assets/ai-exam/model-info.json");
      if (!response.ok) throw new Error("samples");
      const info = await response.json();
      state.samples = info.samples;
      for (const [index, sample] of state.samples.entries()) {
        const button = document.createElement("button");
        button.type = "button";
        button.className = "sample-button";
        button.dataset.src = sample.file;
        button.setAttribute(
          "aria-label",
          `เลือกภาพ ${sample.title} ${index + 1}`,
        );
        const image = document.createElement("img");
        image.src = sample.file;
        image.alt = sample.title;
        image.width = 36;
        image.height = 36;
        const title = document.createElement("span");
        title.textContent = sample.title;
        button.append(image, title);
        button.addEventListener("click", () =>
          loadImage(
            sample.file,
            `ภาพวิจัย ${index + 1} / ${sample.title}`,
            sample,
          ),
        );
        $("sampleGrid").append(button);
      }
      if (state.samples.length)
        loadImage(
          state.samples[0].file,
          "ภาพวิจัย 1 / " + state.samples[0].title,
          state.samples[0],
        );
    } catch {
      message(
        "โหลดภาพตัวอย่างไม่สำเร็จ เปิดหน้านี้ผ่านเว็บเซิร์ฟเวอร์ หรือเลือกอัปโหลดภาพของคุณ",
        true,
      );
    }
  }

  const slides = [...document.querySelectorAll("[data-slide]")];
  let current = 0,
    presenting = false;
  function showSlide(index) {
    current = Math.max(0, Math.min(slides.length - 1, index));
    slides.forEach((section, i) =>
      section.classList.toggle("slide-active", i === current),
    );
    $("slideCounter").textContent =
      `${String(current + 1).padStart(2, "0")} / ${String(slides.length).padStart(2, "0")}`;
    $("slideTitle").textContent = slides[current].dataset.title;
    $("presentationProgress").style.width =
      `${((current + 1) / slides.length) * 100}%`;
    $("previousSlide").disabled = current === 0;
    $("nextSlide").disabled = current === slides.length - 1;
    if (presenting) $("main").scrollTop = 0;
    sizeCanvas();
  }
  function enterPresentation() {
    presenting = true;
    document.body.classList.add("is-presenting");
    $("presentToolbar").hidden = false;
    $("presentBottom").hidden = false;
    showSlide(current);
    $("nextSlide").focus();
  }
  function exitPresentation() {
    presenting = false;
    document.body.classList.remove("is-presenting", "show-notes");
    $("presentToolbar").hidden = true;
    $("presentBottom").hidden = true;
    slides.forEach((s) => s.classList.remove("slide-active"));
    if (document.fullscreenElement) document.exitFullscreen().catch(() => {});
    slides[current].scrollIntoView({ behavior: "instant" });
    sizeCanvas();
    $("presentButton").focus();
  }
  $("presentButton").addEventListener("click", () => {
    current = 0;
    enterPresentation();
  });
  $("exitPresentation").addEventListener("click", exitPresentation);
  $("previousSlide").addEventListener("click", () => showSlide(current - 1));
  $("nextSlide").addEventListener("click", () => showSlide(current + 1));
  $("notesToggle").addEventListener("click", () => {
    const enabled = document.body.classList.toggle("show-notes");
    $("notesToggle").setAttribute("aria-pressed", String(enabled));
  });
  $("fullScreenButton").addEventListener("click", () => {
    if (document.fullscreenElement) document.exitFullscreen().catch(() => {});
    else document.documentElement.requestFullscreen?.().catch(() => {});
  });
  document.querySelectorAll('a[href="#ai-lab"]').forEach((link) =>
    link.addEventListener("click", (event) => {
      if (presenting) {
        event.preventDefault();
        showSlide(slides.findIndex((s) => s.id === "ai-lab"));
      }
    }),
  );
  document.addEventListener("keydown", (event) => {
    if (
      !presenting ||
      event.target.matches("input,textarea,select") ||
      event.altKey ||
      event.ctrlKey ||
      event.metaKey
    )
      return;
    if (["ArrowRight", "PageDown"].includes(event.key)) {
      event.preventDefault();
      showSlide(current + 1);
    }
    if (["ArrowLeft", "PageUp"].includes(event.key)) {
      event.preventDefault();
      showSlide(current - 1);
    }
    if (event.key === "Escape") {
      event.preventDefault();
      exitPresentation();
    }
  });
  window.addEventListener("resize", sizeCanvas);
  window.addEventListener("beforeunload", () => {
    if (state.blobUrl) URL.revokeObjectURL(state.blobUrl);
  });
  if (new URLSearchParams(location.search).get("present") === "1")
    enterPresentation();
  loadSamples();
  if (local) connect();
  else {
    $("connectionBadge").className = "connection-badge offline";
    $("connectionBadge").replaceChildren(
      document.createElement("i"),
      document.createTextNode("เชื่อมต่อ Backend เพื่อทดลอง AI"),
    );
    message(
      "เปิด Backend ในเครื่อง แล้วกด “เชื่อมต่ออีกครั้ง” เพื่อใช้งานโมเดลจริง",
    );
  }
})();
