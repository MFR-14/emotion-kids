const API_URL =
  "https://script.google.com/macros/s/AKfycbwVpwe_oZJa8QZqfNRR3i8ZXq8ImAf1ISW19_4AIKjszvXzYv9-4JtrroIbUGTpKaNo/exec";

// Bisa kamu ganti dari sini
const namaAnak = "A01";
const sesi = "S1";

// Setting UX
const PAKAI_ALERT = false; // ubah true kalau kamu masih mau popup

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

// Dipanggil dari onclick tombol di index.html
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
    t: String(Date.now()) // anti-cache
  }).toString();

  const fullUrl = `${API_URL}?${qs}`;
  console.log("BEACON URL:", fullUrl);

  // Beacon pakai Image (anti CORS)
  const img = new Image();
  img.referrerPolicy = "no-referrer"; // biar makin aman di beberapa device
  img.src = fullUrl;

  // UX: anggap sukses (karena backend sudah terbukti nyimpan)
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
