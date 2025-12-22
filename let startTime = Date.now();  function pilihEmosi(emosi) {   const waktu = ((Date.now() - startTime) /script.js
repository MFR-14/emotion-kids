const API_URL = "https://script.google.com/macros/s/AKfycbzb0NPr4Mi7mCIVP0SErMJyO2M8DVf1FzmTKAmqpRTLAj916-qCNmN0WoGIibx5F86H/exec";

let startTime = Date.now();
const namaAnak = "A01";
const sesi = "S1";
let soal = 1;

window.pilihEmosi = function(emosi) {
  console.log("Klik emosi:", emosi);

  const waktu = ((Date.now() - startTime) / 1000).toFixed(2);

  fetch(API_URL, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ nama: namaAnak, sesi: sesi, soal, emosi, waktu })
  })
  .then(res => res.text())
  .then(res => {
    console.log("Response API:", res);
    soal++;
    startTime = Date.now();
  })
  .catch(err => {
    console.error("FETCH ERROR:", err);
    alert("Gagal menyimpan data");
  });
}
