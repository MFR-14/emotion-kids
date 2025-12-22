const API_URL = "https://script.google.com/macros/s/AKfycbxalTMNvzoVZ9PeYQ3LfkPhOVaUOh2xDdpy5MWK4envM3Ntsfp2fZIBNgwCUb54qHIr/exec";

let startTime = Date.now();
const namaAnak = "A01";   // ganti manual bila perlu
const sesi = "S1";
let soal = 1;

function pilihEmosi(emosi) {
  const waktu = ((Date.now() - startTime) / 1000).toFixed(2);

  fetch(API_URL, {
    method: "POST",
    body: JSON.stringify({
      nama: namaAnak,
      sesi: sesi,
      soal: soal,
      emosi: emosi,
      waktu: waktu
    })
  })
  .then(res => res.json())
  .then(() => {
    soal++;
    startTime = Date.now();
  })
  .catch(err => {
    alert("Gagal menyimpan data");
    console.error(err);
  });
}
