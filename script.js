const API_URL =
  "https://script.google.com/macros/s/AKfycbwVpwe_oZJa8QZqfNRR3i8ZXq8ImAf1ISW19_4AIKjszvXzYv9-4JtrroIbUGTpKaNo/exec";

const TOTAL_SOAL = 25;
const PAKAI_ALERT = false;

let startTime = Date.now();
let soal = 1;
let isSending = false;

// rekapan lokal
let jawaban = []; // {no, emosi, waktuRespon, timeISO}

function getNama() {
  const el = document.getElementById("namaInput");
  return (el?.value || "A01").trim() || "A01";
}
function getSesi() {
  const el = document.getElementById("sesiInput");
  return (el?.value || "S1").trim() || "S1";
}

function setStatus(text) {
  const el = document.getElementById("status");
  if (el) el.textContent = text;
}

function lockButtons(lock) {
  document.querySelectorAll(".emotion, #prevBtn, #nextBtn").forEach((btn) => {
    btn.disabled = lock;
    btn.style.opacity = lock ? "0.6" : "1";
    btn.style.pointerEvents = lock ? "none" : "auto";
  });
}

function kirimKeSheet({ nama, sesi, soalNo, emosi, waktu }) {
  const qs = new URLSearchParams({
    nama,
    sesi,
    soal: String(soalNo),
    emosi: String(emosi),
    waktu: String(waktu),
    t: String(Date.now())
  }).toString();

  const fullUrl = `${API_URL}?${qs}`;
  console.log("BEACON URL:", fullUrl);

  const img = new Image();
  img.referrerPolicy = "no-referrer";
  img.src = fullUrl;
}

window.pilihEmosi = function (emosi) {
  if (isSending) return;
  if (soal > TOTAL_SOAL) return;

  isSending = true;
  lockButtons(true);
  setStatus("Menyimpan...");

  const nama = getNama();
  const sesi = getSesi();

  const waktu = ((Date.now() - startTime) / 1000).toFixed(2);

  // simpan rekapan lokal
  jawaban.push({
    no: soal,
    emosi,
    waktuRespon: Number(waktu),
    timeISO: new Date().toISOString()
  });

  // kirim ke sheet (fire & forget)
  kirimKeSheet({ nama, sesi, soalNo: soal, emosi, waktu });

  setTimeout(() => {
    soal++;
    startTime = Date.now();
    isSending = false;
    lockButtons(false);

    setStatus(`Tersimpan: ${emosi}`);

    if (PAKAI_ALERT) alert(`Tersimpan: ${emosi}`);

    // kalau sudah 25 → otomatis selesai
    if (soal > TOTAL_SOAL) {
      selesaiSesi();
    }
  }, 250);
};

// ======= SELESAI & REKAP =======

window.selesaiSesi = function () {
  tampilkanRekap();
  document.getElementById("screenTest").style.display = "none";
  document.getElementById("screenRekap").style.display = "block";
};

function hitungTopEmotion() {
  const freq = {};
  for (const j of jawaban) freq[j.emosi] = (freq[j.emosi] || 0) + 1;

  let top = "-";
  let max = 0;
  for (const [k, v] of Object.entries(freq)) {
    if (v > max) {
      max = v;
      top = `${k} (${v}x)`;
    }
  }
  return top;
}

function rata2Waktu() {
  if (jawaban.length === 0) return 0;
  const total = jawaban.reduce((a, b) => a + (b.waktuRespon || 0), 0);
  return total / jawaban.length;
}

function tampilkanRekap() {
  const nama = getNama();
  const sesi = getSesi();

  document.getElementById("rekapNama").textContent = nama;
  document.getElementById("rekapSesi").textContent = sesi;
  document.getElementById("rekapJumlah").textContent = String(jawaban.length);

  const avg = rata2Waktu();
  document.getElementById("rekapRata2").textContent = `${avg.toFixed(2)} dtk`;
  document.getElementById("rekapTop").textContent = hitungTopEmotion();

  const list = document.getElementById("rekapList");
  list.innerHTML = "";

  if (jawaban.length === 0) {
    list.innerHTML = `<div class="muted">Belum ada jawaban yang tersimpan.</div>`;
    return;
  }

  jawaban.forEach((j) => {
    const row = document.createElement("div");
    row.className = "item";
    row.innerHTML = `
      <div class="badge">#${j.no}</div>
      <div class="txt">
        <div class="emo">${j.emosi}</div>
        <div class="sub">${j.waktuRespon.toFixed(2)} dtk</div>
      </div>
    `;
    list.appendChild(row);
  });
}

window.mulaiTesBaru = function () {
  // reset state
  jawaban = [];
  soal = 1;
  startTime = Date.now();
  isSending = false;

  // opsi: otomatis naik sesi kalau format S<number>
  const sesiEl = document.getElementById("sesiInput");
  if (sesiEl) {
    const m = (sesiEl.value || "").trim().match(/^S(\d+)$/i);
    if (m) {
      const next = Number(m[1]) + 1;
      sesiEl.value = `S${next}`;
    } else {
      // kalau bukan format S1, ya tetap
      sesiEl.value = (sesiEl.value || "S1").trim() || "S1";
    }
  }

  setStatus("Klik salah satu emosi.");

  // balik ke layar tes
  document.getElementById("screenRekap").style.display = "none";
  document.getElementById("screenTest").style.display = "block";
};

window.kembaliKeTes = function () {
  document.getElementById("screenRekap").style.display = "none";
  document.getElementById("screenTest").style.display = "block";
};
