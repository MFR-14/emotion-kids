// =====================
// GAS WebApp URL (/exec) - SAMAIN DENGAN LEVEL 1
// =====================
const GAS_URL =
  "https://script.google.com/macros/s/AKfycbwlKHW60fkzcickncJz6xHOSSxYaNVOUMPR2X-tnz12ia6UtOfp7Tbh6aYxLk2oSBVo/exec";

// kirim rekap ke GAS (anti CORS pakai Image beacon)
function sendRekapToGAS({ nama, sesi, soal, emosi, waktu }) {
  if (!GAS_URL) return;

  const u = new URL(GAS_URL);
  u.searchParams.set("nama", nama);
  u.searchParams.set("sesi", sesi);
  u.searchParams.set("soal", String(soal));
  u.searchParams.set("emosi", emosi);
  u.searchParams.set("waktu", String(waktu));

  const beacon = new Image();
  beacon.src = u.toString();
}

// =====================
// KONFIG LEVEL 2
// =====================
const DURATION_SEC = 3 * 60 + 38; // 03:38
const FEEDBACK_DELAY_MS = 700;

const QUESTIONS = [
  {
    text: "Ketika teman mengambil pensilmu tanpa izin, kamu merasa…",
    options: ["a) Marah", "b) Bahagia", "c) Terkejut", "d) Biasa saja"],
    emosiMap: ["MARAH", "BAHAGIA", "TERKEJUT", "BIASA SAJA"],
    correctIndex: 0
  },
  {
    text: "Saat kamu bermain di luar, tiba-tiba turun hujan, kamu merasa…",
    options: ["a) Terkejut", "b) Senang", "c) Marah", "d) Kecewa"],
    emosiMap: ["TERKEJUT", "SENANG", "MARAH", "KECEWA"],
    correctIndex: 0
  },
  {
    text: "Saat temanmu tidak mau bermain denganmu, kamu merasa…",
    options: ["a) Sedih", "b) Bahagia", "c) Terkejut", "d) Berani"],
    emosiMap: ["SEDIH", "BAHAGIA", "TERKEJUT", "BERANI"],
    correctIndex: 0
  },
  {
    text: "Saat kamu kalah dalam lomba, kamu merasa…",
    options: ["a) Kecewa", "b) Takut", "c) Marah", "d) Tidak peduli"],
    emosiMap: ["KECEWA", "TAKUT", "MARAH", "TIDAK PEDULI"],
    correctIndex: 0
  },
  {
    text: "Ketika kamu kehilangan barang kesayanganmu, kamu merasa…",
    options: ["a) Sedih", "b) Bahagia", "c) Marah", "d) Tenang"],
    emosiMap: ["SEDIH", "BAHAGIA", "MARAH", "TENANG"],
    correctIndex: 0
  },
  {
    text: "Saat teman mengejekmu di depan kelas, kamu merasa…",
    options: ["a) Marah", "b) Bahagia", "c) Terkejut", "d) Tenang"],
    emosiMap: ["MARAH", "BAHAGIA", "TERKEJUT", "TENANG"],
    correctIndex: 0
  },
  {
    text: "Saat seseorang mengambil makananmu tanpa izin, kamu merasa…",
    options: ["a) Marah", "b) Senang", "c) Terkejut", "d) Bingung"],
    emosiMap: ["MARAH", "SENANG", "TERKEJUT", "BINGUNG"],
    correctIndex: 0
  },
  {
    text: "Saat kamu tidak bisa mengerjakan soal ulangan, kamu merasa…",
    options: ["a) Cemas", "b) Senang", "c) Malu", "d) Jijik"],
    emosiMap: ["CEMAS", "SENANG", "MALU", "JIJIK"],
    correctIndex: 0
  },
  {
    text: "Jika temanmu merusak barangmu, kamu merasa…",
    options: ["a) Marah", "b) Bahagia", "c) Takut", "d) Terkejut"],
    emosiMap: ["MARAH", "BAHAGIA", "TAKUT", "TERKEJUT"],
    correctIndex: 0
  },
  {
    text: "Saat kamu bertengkar dengan sahabatmu, kamu merasa…",
    options: ["a) Sedih", "b) Senang", "c) Tenang", "d) Terkejut"],
    emosiMap: ["SEDIH", "SENANG", "TENANG", "TERKEJUT"],
    correctIndex: 0
  },
  {
    text: "Ketika kamu datang ke sekolah dan tidak ada teman yang menyapumu, kamu merasa…",
    options: ["a) Sedih", "b) Senang", "c) Marah", "d) Tenang"],
    emosiMap: ["SEDIH", "SENANG", "MARAH", "TENANG"],
    correctIndex: 0
  },
  {
    text: "Saat guru mengatakan besok ada ulangan mendadak, kamu merasa…",
    options: ["a) Cemas", "b) Senang", "c) Terkejut", "d) Jijik"],
    emosiMap: ["CEMAS", "SENANG", "TERKEJUT", "JIJIK"],
    correctIndex: 0
  },
  {
    text: "Saat kamu harus menunggu lama di antrean kantin, kamu merasa…",
    options: ["a) Tidak sabar", "b) Senang", "c) Takut", "d) Bingung"],
    emosiMap: ["TIDAK SABAR", "SENANG", "TAKUT", "BINGUNG"],
    correctIndex: 0
  },
  {
    text: "Jika kamu diminta mengulang pekerjaan karena salah, kamu merasa…",
    options: ["a) Kecewa", "b) Bahagia", "c) Terkejut", "d) Tenang"],
    emosiMap: ["KECEWA", "BAHAGIA", "TERKEJUT", "TENANG"],
    correctIndex: 0
  },
  {
    text: "Saat hujan deras membuatmu terlambat pulang sekolah, kamu merasa…",
    options: ["a) Kesal", "b) Senang", "c) Takut", "d) Malas"],
    emosiMap: ["KESAL", "SENANG", "TAKUT", "MALAS"],
    correctIndex: 0
  },
  {
    text: "Jika sepatumu basah terkena genangan air, kamu merasa…",
    options: ["a) Tidak nyaman", "b) Senang", "c) Malu", "d) Terkejut"],
    emosiMap: ["TIDAK NYAMAN", "SENANG", "MALU", "TERKEJUT"],
    correctIndex: 0
  },
  {
    text: "Saat guru memuji temanmu tetapi tidak memuji kamu, kamu merasa…",
    options: ["a) Kecewa", "b) Senang", "c) Jijik", "d) Takut"],
    emosiMap: ["KECEWA", "SENANG", "JIJIK", "TAKUT"],
    correctIndex: 0
  },
  {
    text: "Ketika kamu sedang berbicara dan teman tidak mendengarkanmu, kamu merasa…",
    options: ["a) Kesal", "b) Senang", "c) Malu", "d) Bingung"],
    emosiMap: ["KESAL", "SENANG", "MALU", "BINGUNG"],
    correctIndex: 0
  },
  {
    text: "Jika kamu dimarahi karena lupa mengerjakan PR, kamu merasa…",
    options: ["a) Takut", "b) Senang", "c) Jijik", "d) Tenang"],
    emosiMap: ["TAKUT", "SENANG", "JIJIK", "TENANG"],
    correctIndex: 0
  },
  {
    text: "Jika kamu mendapatkan tugas yang sulit, kamu merasa…",
    options: ["a) Senang", "b) Cemas", "c) Marah", "d) Jijik"],
    emosiMap: ["SENANG", "CEMAS", "MARAH", "JIJIK"],
    correctIndex: 1
  }
];

// ====== STATE ======
let idx = 0;
let score = 0;
let timeLeft = DURATION_SEC;
let timerId = null;
let locked = false;
let ended = false;
let soalStart = 0;

// ====== REKAP LOCAL (ek_answers) ======
function getAnswers() {
  return JSON.parse(localStorage.getItem("ek_answers") || "[]");
}
function saveAnswer({ emosi, level, soal, waktu }) {
  const answers = getAnswers();
  answers.push({
    emosi,
    level,
    soal,
    waktu: String(waktu),
    ts: Date.now()
  });
  localStorage.setItem("ek_answers", JSON.stringify(answers));
}

// ====== UTIL ======
function pad(n){ return String(n).padStart(2, "0"); }

function renderTimer(){
  const m = Math.floor(timeLeft / 60);
  const s = timeLeft % 60;
  const el = document.getElementById("timer");
  if (el) el.textContent = `${pad(m)}:${pad(s)}`;
}
function renderScore(){
  const el = document.getElementById("score");
  if (el) el.textContent = `Skor: ${score} / ${QUESTIONS.length}`;
}
function setFeedback(text, type){
  const el = document.getElementById("feedback");
  if (!el) return;
  el.classList.remove("good", "bad");
  if (type) el.classList.add(type);
  el.textContent = text || "";
}
function clearSelected(){
  document.querySelectorAll(".option").forEach(b => b.classList.remove("selected"));
}

function setQuestion(){
  locked = false;
  setFeedback("", "");

  const q = QUESTIONS[idx];
  const t1 = document.getElementById("qTitle");
  const t2 = document.getElementById("qText");
  if (t1) t1.textContent = `Question ${idx + 1}`;
  if (t2) t2.textContent = q.text;

  const wrap = document.getElementById("options");
  if (!wrap) return;
  wrap.innerHTML = "";

  q.options.forEach((label, i) => {
    const btn = document.createElement("button");
    btn.type = "button";
    btn.className = "option";
    btn.textContent = label;
    btn.addEventListener("click", () => chooseAnswer(i, btn));
    wrap.appendChild(btn);
  });

  const btnNext = document.getElementById("btnNext");
  if (btnNext) btnNext.classList.add("hidden");

  soalStart = Date.now();
}

function chooseAnswer(pickIndex, btnEl){
  if (ended || locked) return;
  locked = true;

  clearSelected();
  if (btnEl) btnEl.classList.add("selected");

  const q = QUESTIONS[idx];
  const benar = pickIndex === q.correctIndex;

  // hitung waktu respon
  const waktuRespon = ((Date.now() - soalStart) / 1000).toFixed(2);

  // emosi dipilih
  const emosiDipilih =
    (q.emosiMap && q.emosiMap[pickIndex]) ? q.emosiMap[pickIndex] : "UNKNOWN";

  // ✅ simpan ke local (buat rekap.html)
  saveAnswer({
    emosi: emosiDipilih,
    level: 2,
    soal: idx + 1,
    waktu: waktuRespon
  });

  // ✅ kirim ke GAS (buat Google Sheet) kayak Level 1
  const nama = localStorage.getItem("ek_nama") || "";
  const sesi = localStorage.getItem("ek_sesi") || "";
  const status = benar ? "BENAR" : "SALAH";

  sendRekapToGAS({
    nama,
    sesi,
    soal: idx + 1,
    emosi: `L2 - ${emosiDipilih} (${status})`,
    waktu: waktuRespon
  });

  if (benar){
    score++;
    renderScore();
    setFeedback("✅ Benar!", "good");
  } else {
    setFeedback("❌ Salah!", "bad");
  }

  const btnNext = document.getElementById("btnNext");
  if (btnNext) btnNext.classList.remove("hidden");
}

function nextStep(){
  if (ended) return;
  idx++;
  if (idx >= QUESTIONS.length){
    finishLevel("Selesai!");
  } else {
    setQuestion();
  }
}

function finishLevel(alasan){
  if (ended) return;
  ended = true;
  clearInterval(timerId);

  const nama = localStorage.getItem("ek_nama") || "";
  const sesi = localStorage.getItem("ek_sesi") || "";

  localStorage.setItem("ek_level2_skor", String(score));
  localStorage.setItem("ek_level2_total", String(QUESTIONS.length));
  localStorage.setItem("ek_level2_selesai", "1");
  localStorage.setItem("ek_level2_alasan", alasan || "Selesai");

  const qs = new URLSearchParams({
    nama,
    sesi,
    skor: String(score),
    total: String(QUESTIONS.length),
    alasan: alasan || "Selesai"
  });

  window.location.href = "./congrats2.html?" + qs.toString();
}

function startTimer(){
  renderTimer();
  timerId = setInterval(() => {
    if (ended) return;
    timeLeft--;

    if (timeLeft <= 0){
      timeLeft = 0;
      renderTimer();

      locked = true;
      clearInterval(timerId);

      setFeedback("⏳ Waktu habis!", "bad");

      setTimeout(() => finishLevel("Waktu habis!"), 800);
      return;
    }

    renderTimer();
  }, 1000);
}

// ====== START GAME (INTRO) ======
window.addEventListener("DOMContentLoaded", () => {
  const introEl = document.getElementById("intro");
  const gameEl  = document.getElementById("game");

  const namaInput = document.getElementById("namaAnak");
  const sesiInput = document.getElementById("sesiAnak");
  const btnMulai  = document.getElementById("btnMulai");
  const btnNext   = document.getElementById("btnNext");
  const btnSelesai= document.getElementById("btnSelesai");

  // auto isi dari localStorage
  const namaLS = (localStorage.getItem("ek_nama") || "").trim();
  const sesiLS = (localStorage.getItem("ek_sesi") || "").trim();
  if (namaInput && namaLS) namaInput.value = namaLS;
  if (sesiInput && sesiLS) sesiInput.value = sesiLS;

  function startGame(){
    const nama = (namaInput?.value || "").trim();
    const sesi = (sesiInput?.value || "").trim();

    if (!nama || !sesi){
      alert("Nama dan sesi wajib diisi ya 🙂");
      return;
    }

    localStorage.setItem("ek_nama", nama);
    localStorage.setItem("ek_sesi", sesi);

    if (introEl) introEl.classList.add("hidden");
    if (gameEl)  gameEl.classList.remove("hidden");

    idx = 0;
    score = 0;
    timeLeft = DURATION_SEC;
    locked = false;
    ended = false;

    renderScore();
    setQuestion();
    startTimer();
  }

  if (btnMulai) btnMulai.addEventListener("click", startGame);
  if (btnNext)  btnNext.addEventListener("click", nextStep);
  if (btnSelesai) btnSelesai.addEventListener("click", () => finishLevel("Diselesaikan manual"));

  // init tampilan
  renderTimer();
  renderScore();
});
