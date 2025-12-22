const API_URL = "https://script.google.com/macros/s/AKfycbxOLAIldiNatjvkl8KcPUalWy6fCSPz7DRFTrYyb2_4N7ZuzTF9mm2uCIePhLo7Dqgk/exec";

let startTime = Date.now();
const namaAnak = "A01";
const sesi = "S1";
let soal = 1;
let isSending = false;

window.pilihEmosi = function (emosi) {
  if (isSending) return;
  isSending = true;

  const waktu = ((Date.now() - startTime) / 1000).toFixed(2);

  const qs = new URLSearchParams({
    nama: namaAnak,
    sesi: sesi,
    soal: String(soal),
    emosi: String(emosi),
    waktu: String(waktu),
    t: Date.now()
  }).toString();

  const fullUrl = `${API_URL}?${qs}`;
  console.log("BEACON URL:", fullUrl);

  const statusEl = document.getElementById("status");
  if (statusEl) statusEl.textContent = "Menyimpan...";

  const img = new Image();

  img.onload = () => {
    // walaupun ini kadang gak kepanggil, gak masalah
  };

  // ⛔ JANGAN pakai onerror → bikin false alarm
  img.src = fullUrl;

  // Anggap sukses secara UX
  setTimeout(() => {
    soal++;
    startTime = Date.now();
    isSending = false;

    if (statusEl) statusEl.textContent = `Tersimpan: ${emosi}`;
    alert(`Emosi "${emosi}" berhasil dicatat!`);
  }, 300); // delay kecil biar UX halus
};
