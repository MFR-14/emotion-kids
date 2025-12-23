const API_URL =
  "https://script.google.com/macros/s/AKfycbwVpwe_oZJa8QZqfNRR3i8ZXq8ImAf1ISW19_4AIKjszvXzYv9-4JtrroIbUGTpKaNo/exec";

// ====== DATA EMOSI (sesuaikan nama labelnya kalau mau) ======
const EMOTIONS = Array.from({ length: 25 }, (_, i) => ({
  id: i + 1,
  label: `Emosi ${i + 1}`,
  img: `img/emotion_${i + 1}.png` // sesuai file kamu yg ada di /img/
}));

// halaman 1: 1-12, halaman 2: 13-25
const PAGE_SIZE = 12;

let startTime = Date.now();
let soal = 1;
let isSending = false;

// ambil level dari URL: level.html?level=3
function getLevel() {
  const url = new URL(window.location.href);
  const level = parseInt(url.searchParams.get("level") || "1", 10);
  return Number.isFinite(level) ? Math.min(Math.max(level, 1), 6) : 1;
}

// ambil profile dari input / localStorage
function getProfile() {
  const namaInput = document.getElementById("namaInput");
  const sesiInput = document.getElementById("sesiInput");

  const namaLS = localStorage.getItem("ek_nama") || "A01";
  const sesiLS = localStorage.getItem("ek_sesi") || "S1";

  const nama = (namaInput?.value || namaLS).trim() || "A01";
  const sesi = (sesiInput?.value || sesiLS).trim() || "S1";

  // simpan balik biar konsisten
  localStorage.setItem("ek_nama", nama);
  localStorage.setItem("ek_sesi", sesi);

  return { nama, sesi };
}

function setStatus(text) {
  const el = document.getElementById("status");
  if (el) el.textContent = text;
}

function pushLocalAnswer({ nama, sesi, level, soal, emosi, waktu }) {
  const key = "ek_answers";
  const arr = JSON.parse(localStorage.getItem(key) || "[]");
  arr.push({
    ts: new Date().toISOString(),
    nama,
    sesi,
    level,
    soal,
    emosi,
    waktu: Number(waktu)
  });
  localStorage.setItem(key, JSON.stringify(arr));
}

function sendToGAS({ nama, sesi, level, soal, emosi, waktu }) {
  const qs = new URLSearchParams({
    nama,
    sesi,
    level: String(level),
    soal: String(soal),
    emosi: String(emosi),
    waktu: String(waktu),
    t: String(Date.now())
  }).toString();

  // fire-and-forget
  const img = new Image();
  img.src = `${API_URL}?${qs}`;
}

// ====== RENDER GRID + PAGINATION ======
let currentPage = 1; // 1 atau 2

function renderGrid() {
  const grid = document.getElementById("emotionsGrid");
  if (!grid) return;

  grid.innerHTML = "";

  const startIndex = (currentPage - 1) * PAGE_SIZE;
  const pageItems = EMOTIONS.slice(startIndex, startIndex + PAGE_SIZE);

  pageItems.forEach((item) => {
    const btn = document.createElement("button");
    btn.className = "emotion";
    btn.type = "button";
    btn.setAttribute("aria-label", item.label);

    // MODE DRAG? Level tertentu
    const level = getLevel();
    const dragMode = level >= 3; // level 3-6 drag-drop
    if (dragMode) {
      btn.classList.add("isDraggable");
      btn.draggable = true;
      btn.addEventListener("dragstart", (e) => {
        e.dataTransfer.setData("text/plain", item.label);
        e.dataTransfer.effectAllowed = "move";
      });
    } else {
      btn.addEventListener("click", () => pilihEmosi(item.label));
    }

    const img = document.createElement("img");
    img.src = item.img;
    img.alt = item.label;
    img.loading = "lazy";

    btn.appendChild(img);
    grid.appendChild(btn);
  });

  // tombol prev/next
  const prevBtn = document.getElementById("prevBtn");
  const nextBtn = document.getElementById("nextBtn");

  if (prevBtn) {
    prevBtn.disabled = currentPage === 1;
    prevBtn.onclick = () => {
      currentPage = 1;
      renderGrid();
      setStatus("Pilih emosi (halaman 1).");
    };
  }
  if (nextBtn) {
    nextBtn.disabled = currentPage === 2;
    nextBtn.onclick = () => {
      currentPage = 2;
      renderGrid();
      setStatus("Pilih emosi (halaman 2).");
    };
  }
}

// ====== DRAG DROP TARGET ======
function setupDropZone() {
  const level = getLevel();
  const dragMode = level >= 3;
  const drop = document.getElementById("dropZone");
  if (!drop) return;

  if (!dragMode) {
    drop.style.display = "none";
    return;
  }

  drop.style.display = "flex";

  drop.addEventListener("dragover", (e) => {
    e.preventDefault();
    drop.classList.add("dropHover");
  });

  drop.addEventListener("dragleave", () => {
    drop.classList.remove("dropHover");
  });

  drop.addEventListener("drop", (e) => {
    e.preventDefault();
    drop.classList.remove("dropHover");
    const label = e.dataTransfer.getData("text/plain");
    if (label) pilihEmosi(label);
  });
}

// ====== CORE: SIMPAN JAWABAN ======
window.pilihEmosi = function (emosi) {
  if (isSending) return;
  isSending = true;

  const { nama, sesi } = getProfile();
  const level = getLevel();

  const waktu = ((Date.now() - startTime) / 1000).toFixed(2);

  setStatus("Menyimpan...");

  // simpan local dulu (pasti sukses)
  pushLocalAnswer({ nama, sesi, level, soal, emosi, waktu });

  // kirim ke spreadsheet (fire-and-forget)
  sendToGAS({ nama, sesi, level, soal, emosi, waktu });

  // UX sukses
  setTimeout(() => {
    soal++;
    startTime = Date.now();
    isSending = false;
    setStatus(`Tersimpan: ${emosi} (Level ${level})`);
  }, 150);
};

// ====== FINISH LEVEL -> CONGRATS ======
function finishLevel() {
  const level = getLevel();
  const { nama } = getProfile();

  // catat event selesai level (optional)
  const key = "ek_levels_done";
  const done = JSON.parse(localStorage.getItem(key) || "{}");
  done[`level${level}`] = new Date().toISOString();
  localStorage.setItem(key, JSON.stringify(done));

  // tampilkan layar congrats
  const screenTest = document.getElementById("screenTest");
  const screenCongrats = document.getElementById("screenCongrats");
  const cName = document.getElementById("congratsName");
  const cLevel = document.getElementById("congratsLevel");

  if (cName) cName.textContent = nama;
  if (cLevel) cLevel.textContent = `Level ${level}`;

  if (screenTest) screenTest.style.display = "none";
  if (screenCongrats) screenCongrats.style.display = "block";

  // tombol lanjut
  const nextBtn = document.getElementById("nextLevelBtn");
  const toRekap = document.getElementById("toRekapBtn");

  if (nextBtn) {
    if (level >= 6) {
      nextBtn.textContent = "Selesai (Ke Rekap)";
      nextBtn.onclick = () => (window.location.href = "rekap.html");
    } else {
      nextBtn.textContent = "Lanjut Level";
      nextBtn.onclick = () => (window.location.href = `level.html?level=${level + 1}`);
    }
  }
  if (toRekap) {
    toRekap.onclick = () => (window.location.href = "rekap.html");
  }
}

// ====== INIT ======
(function init() {
  // badge level
  const level = getLevel();
  const badge = document.getElementById("levelBadge");
  if (badge) badge.textContent = String(level);

  // isi input dari LS
  const namaLS = localStorage.getItem("ek_nama");
  const sesiLS = localStorage.getItem("ek_sesi");
  if (namaLS && document.getElementById("namaInput")) document.getElementById("namaInput").value = namaLS;
  if (sesiLS && document.getElementById("sesiInput")) document.getElementById("sesiInput").value = sesiLS;

  renderGrid();
  setupDropZone();

  const finishBtn = document.getElementById("finishLevelBtn");
  if (finishBtn) finishBtn.onclick = finishLevel;

  setStatus(level >= 3 ? "Seret emosi ke kotak pilihan." : "Klik salah satu emosi.");
})();
