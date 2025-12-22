const API_URL =
  "https://script.google.com/macros/s/AKfycbwVpwe_oZJa8QZqfNRR3i8ZXq8ImAf1ISW19_4AIKjszvXzYv9-4JtrroIbUGTpKaNo/exec";

const namaAnak = "A01";
const sesi = "S1";

const PAKAI_ALERT = false;

let startTime = Date.now();
let soal = 1;
let isSending = false;

function setStatus(text) {
  const el = document.getElementById("status");
  if (el) el.textContent = text;
}

function lockButtons(lock) {
  document.querySelectorAll(".emotion").forEach((btn) => {
    btn.disabled = lock;
    btn.style.opacity = lock ? "0.6" : "1";
    btn.style.pointerEvents = lock ? "none" : "auto";
  });
}

window.pilihEmosi = function (emosi) {
  if (isSending) return;

  isSending = true;
  lockButtons(true);
  setStatus("Menyimpan...");

  const waktu = ((Date.now() - startTime) / 1000).toFixed(2);

  const qs = new URLSearchParams({
    nama: namaAnak,
    sesi: sesi,
    soal: String(soal),
    emosi: String(emosi),
    waktu: String(waktu),
    t: String(Date.now())
  }).toString();

  const fullUrl = `${API_URL}?${qs}`;
  console.log("BEACON URL:", fullUrl);

  const img = new Image();
  img.referrerPolicy = "no-referrer";
  img.src = fullUrl;

  setTimeout(() => {
    soal++;
    startTime = Date.now();

    isSending = false;
    lockButtons(false);

    setStatus(`Tersimpan: ${emosi}`);

    if (PAKAI_ALERT) {
      alert(`Emosi "${emosi}" berhasil dicatat!`);
    }
  }, 300);
};
