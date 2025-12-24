// =====================
// KONFIG LEVEL 2
// =====================
const DURATION_SEC = 3 * 60 + 38; // 03:38
const FEEDBACK_DELAY_MS = 700;

// Soal (ubah di sini)
const QUESTIONS = [
  {
    text: "Ketika aku sakit, aku merasa ...",
    options: ["a) Bahagia", "b) Sedih", "c) Takut", "d) Malu"],
    correctIndex: 1
  },
  {
    text: "Ketika aku sendirian di rumah, aku merasa ...",
    options: ["a) Bahagia", "b) Sedih", "c) Takut", "d) Malu"],
    correctIndex: 2
  }
];

// ====== STATE ======
let idx = 0;
let score = 0;
let timeLeft = DURATION_SEC;
let timerId = null;
let locked = false;
let ended = false;

function pad(n){ return String(n).padStart(2, "0"); }

function renderTimer(){
  const m = Math.floor(timeLeft / 60);
  const s = timeLeft % 60;
  document.getElementById("timer").textContent = `${pad(m)}:${pad(s)}`;
}

function renderScore(){
  document.getElementById("score").textContent = `Skor: ${score} / ${QUESTIONS.length}`;
}

function setFeedback(text, type){
  const el = document.getElementById("feedback");
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
  document.getElementById("qTitle").textContent = `Question ${idx + 1}`;
  document.getElementById("qText").textContent = q.text;

  const wrap = document.getElementById("options");
  wrap.innerHTML = "";

  q.options.forEach((label, i) => {
    const btn = document.createElement("button");
    btn.type = "button";
    btn.className = "option";
    btn.textContent = label;
    btn.addEventListener("click", () => chooseAnswer(i, btn));
    wrap.appendChild(btn);
  });

  document.getElementById("btnNext").classList.add("hidden");
}

function chooseAnswer(pickIndex, btnEl){
  if (ended || locked) return;
  locked = true;

  clearSelected();
  btnEl.classList.add("selected");

  const q = QUESTIONS[idx];
  const benar = pickIndex === q.correctIndex;

  if (benar){
    score++;
    renderScore();
    setFeedback("✅ Benar!", "good");
  } else {
    setFeedback("❌ Salah!", "bad");
  }

  // tombol lanjut tampil
  document.getElementById("btnNext").classList.remove("hidden");
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

  // simpan seperti level1
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
  ended  = true;
  clearInterval(timerId);

  setFeedback("⏳ Waktu habis!", "bad");

  // ⬇️ LANGSUNG KE CONGRATS (tanpa klik)
  setTimeout(() => {
    finishLevel("Waktu habis!");
  }, 800);

  return;
}

    }
    renderTimer();
  }, 1000);
}

// ====== START GAME (dari intro) ======
window.addEventListener("DOMContentLoaded", () => {
  const introEl = document.getElementById("intro");
  const gameEl  = document.getElementById("game");

  const namaInput = document.getElementById("namaAnak");
  const sesiInput = document.getElementById("sesiAnak");
  const btnMulai  = document.getElementById("btnMulai");
  const btnNext   = document.getElementById("btnNext");
  const btnSelesai= document.getElementById("btnSelesai");

  // auto isi dari localStorage (biar sekali input untuk semua level)
  const namaLS = (localStorage.getItem("ek_nama") || "").trim();
  const sesiLS = (localStorage.getItem("ek_sesi") || "").trim();
  if (namaLS) namaInput.value = namaLS;
  if (sesiLS) sesiInput.value = sesiLS;

  function startGame(){
    const nama = (namaInput.value || "").trim();
    const sesi = (sesiInput.value || "").trim();

    if (!nama || !sesi){
      alert("Nama dan sesi wajib diisi ya 🙂");
      return;
    }

    localStorage.setItem("ek_nama", nama);
    localStorage.setItem("ek_sesi", sesi);

    introEl.classList.add("hidden");
    gameEl.classList.remove("hidden");

    // reset state
    idx = 0;
    score = 0;
    timeLeft = DURATION_SEC;
    locked = false;
    ended = false;

    renderScore();
    setQuestion();
    startTimer();
  }

  btnMulai.addEventListener("click", startGame);
  btnNext.addEventListener("click", nextStep);

  btnSelesai.addEventListener("click", () => finishLevel("Diselesaikan manual"));
});
