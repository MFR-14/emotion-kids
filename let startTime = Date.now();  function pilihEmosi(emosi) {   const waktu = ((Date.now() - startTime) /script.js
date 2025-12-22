const API_URL = "https://script.google.com/macros/s/AKfycbxWbYaorkUtJ7LFvgJve_PGtY6UbFNLpot-HqLLLDVkfnd5RYmgPQWd2PQywlq52N-M/exec";

let startTime = Date.now();
const namaAnak = "A01";
const sesi = "S1";
let soal = 1;

// Buat fungsi tersedia di global scope supaya bisa dipanggil dari HTML onclick
window.pilihEmosi = function(emosi) {
  console.log("Klik emosi:", emosi);

  const waktu = ((Date.now() - startTime) / 1000).toFixed(2);

  fetch(API_URL, {
    method: "POST",
    headers: {
      "Content-Type": "application/json"
    },
    body: JSON.stringify({
      nama: namaAnak,
      sesi: sesi,
      soal: soal,
      emosi: emosi,
      waktu: waktu
    })
  })
  .then(res => res.text())
  .then(res => {
    console.log("Response API:", res);
    soal++;              // naikkan nomor soal
    startTime = Date.now(); // reset timer untuk soal berikutnya
  })
  .catch(err => {
    console.error("FETCH ERROR:", err);
    alert("Gagal menyimpan data");
  });
}
