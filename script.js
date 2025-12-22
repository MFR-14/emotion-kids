const API_URL = "https://script.google.com/macros/s/AKfycbxOLAIldiNatjvkl8KcPUalWy6fCSPz7DRFTrYyb2_4N7ZuzTF9mm2uCIePhLo7Dqgk/exec";

let startTime = Date.now();
const namaAnak = "A01";
const sesi = "S1";
let soal = 1;

window.pilihEmosi = function (emosi) {
  const waktu = ((Date.now() - startTime) / 1000).toFixed(2);

  const qs = new URLSearchParams({
    nama: namaAnak,
    sesi: sesi,
    soal: String(soal),
    emosi: String(emosi),
    waktu: String(waktu),
    t: String(Date.now())
  }).toString();

  const img = new Image();
  img.onload = () => {
    soal++;
    startTime = Date.now();
    alert(`Emosi "${emosi}" berhasil dicatat!`);
  };
  img.onerror = (e) => {
    console.error("Beacon error:", e);
    alert("Gagal menyimpan data");
  };
const fullUrl = `${API_URL}?${qs}`;
console.log("BEACON URL:", fullUrl);
img.src = fullUrl;

  img.src = `${API_URL}?${qs}`;
};
