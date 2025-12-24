// =====================
// GAS WebApp URL (/exec)
// =====================
const GAS_URL =
  "https://script.google.com/macros/s/AKfycbwlKHW60fkzcickncJz6xHOSSxYaNVOUMPR2X-tnz12ia6UtOfp7Tbh6aYxLk2oSBVo/exec";

// ====== KONFIG GAME ======
const TOTAL = 8;
const DURATION_SEC = 180;        // 3 menit
const FEEDBACK_DELAY_MS = 2200;  // lama tampil notif benar/salah
const IMG_BASE = "./img/level3";

// 8 pasang sesuai folder kamu
const ROUNDS = [
  { key: "bahagia",  head: `${IMG_BASE}/bahagia-L3.jpg`,  face: `${IMG_BASE}/muka-bahagia.jpg` },
  { key: "bingung",  head: `${IMG_BASE}/bingung-L3.jpg`,  face: `${IMG_BASE}/muka-bingung.jpg` },
  { key: "cinta",    head: `${IMG_BASE}/cinta-L3.jpg`,    face: `${IMG_BASE}/muka-cinta.jpg` },
  { key: "malu",     head: `${IMG_BASE}/malu-L3.jpg`,     face: `${IMG_BASE}/muka-malu.jpg` },
  { key: "marah",    head: `${IMG_BASE}/marah-L3.jpg`,    face: `${IMG_BASE}/muka-marah.jpg` },
  { key: "sedih",    head: `${IMG_BASE}/sedih-L3.jpg`,    face: `${IMG_BASE}/muka-sedih.jpg` },
  { key: "takut",    head: `${IMG_BASE}/takut-L3.jpg`,    face: `${IMG_BASE}/muka-takut.jpg` },
  { key: "terkejut", head: `${IMG_BASE}/terkejut-L3.jpg`, face: `${IMG_BASE}/muka-terkejut.jpg` },
];

// ====== STATE ======
let pool = [];
let idx = 0;
let score = 0;
let timeLeft = DURATION_SEC;
let timerId = null;
let gameEnded = false;
let soalStart = 0;

let picked = null;     // face item untuk mode tap HP
let lockInput = false;

// ====== UTIL ======
function pad(n) { return String(n).padStart(2, "0"); }

function shuffle(arr) {
  const a = arr.slice();
  for (let i = a.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [a[i], a[j]] = [a[j], a[i]];
  }
  return a;
}

function shake(el) {
  el.classList.remove("shake");
  void el.offsetWidth;
  el.classList.add("shake");
}

function flashOk(el) {
  el.classList.remove("ok");
  void el.offsetWidth;
  el.classList.add("ok");
}

// ====== REKAP KE GAS (anti CORS) ======
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

// ====== MAIN ======
window.addEventListener("DOMContentLoaded", () => {
  const introEl    = document.getElementById("intro");
  const gameEl     = document.getElementById("game");
  const namaInput  = document.getElementById("namaAnak");
  const sesiInput  = document.getElementById("sesiAnak");
  const btnMulai   = document.getElementById("btnMulai");

  const timerEl    = document.getElementById("timer");
  const scoreEl    = document.getElementById("score");
  const hintEl     = document.getElementById("hint");
  const feedbackEl = document.getElementById("answerFeedback");
  const roundEl    = document.getElementById("roundTitle");
  const btnSelesai = document.getElementById("btnSelesai");

  const faceBank   = document.getElementById("faceBank");
  const headBoard  = document.getElementById("headBoard");

  if (!introEl || !gameEl || !namaInput || !sesiInput || !btnMulai || !timerEl || !scoreEl || !hintEl || !feedbackEl || !roundEl || !faceBank || !headBoard) {
    alert("Ada elemen HTML yang tidak ketemu. Cek id: intro, game, namaAnak, sesiAnak, btnMulai, timer, score, hint, answerFeedback, roundTitle, faceBank, headBoard.");
    return;
  }

  // isi otomatis dari localStorage
  const namaLS = (localStorage.getItem("ek_nama") || "").trim();
  const sesiLS = (localStorage.getItem("ek_sesi") || "").trim();
  if (namaLS) namaInput.value = namaLS;
  if (sesiLS) sesiInput.value = sesiLS;

  function renderTimer() {
    const m = Math.floor(timeLeft / 60);
    const s = timeLeft % 60;
    timerEl.textContent = `${pad(m)}:${pad(s)}`;
  }

  function renderScore() {
    scoreEl.textContent = `Skor: ${score} / ${TOTAL}`;
  }

  function resetFeedback() {
    feedbackEl.className = "answer-feedback";
    feedbackEl.textContent = "";
    feedbackEl.style.display = "block";
    feedbackEl.style.opacity = "1";
    feedbackEl.style.visibility = "visible";
    feedbackEl.style.transform = "none";
  }

  function setHint(type, text) {
    hintEl.classList.remove("good","bad");
    if (type) hintEl.classList.add(type);
    hintEl.textContent = text;
  }

  function setRoundTitle() {
    roundEl.textContent = `Soal ${idx + 1} / ${TOTAL}`;
  }

  function setQuestion() {
    const q = pool[idx];

    lockInput = false;
    picked = null;
    resetFeedback();
    setRoundTitle();

    setHint(null, "Tarik muka ke kepala yang cocok");

    // Render 1 muka
    faceBank.innerHTML = `
      <div class="face-item" draggable="true" data-face="${q.key}">
        <img src="${q.face}?v=${Date.now()}" alt="Muka ${q.key}">
      </div>
    `;

    // Render 1 kepala
    headBoard.innerHTML = `
      <div class="head-slot drop-head" data-need="${q.key}">
        <img class="head-base" src="${q.head}?v=${Date.now()}" alt="Kepala ${q.key}">
        <div class="face-holder"></div>
      </div>
    `;

    // bind events
    const faceEl = faceBank.querySelector(".face-item");
    const headEl = headBoard.querySelector(".drop-head");

    setupInteractions(faceEl, headEl);

    soalStart = Date.now();
  }

  function attachFaceToHead(faceEl, headEl) {
    const holder = headEl.querySelector(".face-holder");
    const img = faceEl.querySelector("img");
    if (!holder || !img) return;

    holder.innerHTML = "";
    holder.appendChild(img.cloneNode(true));

    headEl.dataset.done = "1";
    faceEl.classList.add("used");
    faceEl.setAttribute("draggable", "false");
  }

  function finishGame(message) {
  if (gameEnded) return;
  gameEnded = true;

  clearInterval(timerId);

  const nama = localStorage.getItem("ek_nama") || "";
  const sesi = localStorage.getItem("ek_sesi") || "";

  localStorage.setItem("ek_level3_skor", String(score));
  localStorage.setItem("ek_level3_selesai", "1");
  localStorage.setItem("ek_level3_alasan", message || "Selesai");

  // redirect ke congrats3
  window.location.href = "/GESYA/congrats3.html";
}


  function startTimer() {
    renderTimer();
    timerId = setInterval(() => {
      if (gameEnded) return;
      timeLeft--;

      if (timeLeft <= 0) {
        timeLeft = 0;
        renderTimer();

        setHint("bad", "⏳ Waktu habis!");
        lockInput = true;

        setTimeout(() => finishGame("Waktu habis!"), 900);
        return;
      }
      renderTimer();
    }, 1000);
  }

  function handleAnswer(faceEl, headEl) {
    if (gameEnded || lockInput) return;
    lockInput = true;

    const q = pool[idx];
    const correctKey = q.key;

    const pickedKey = faceEl?.dataset?.face || "";
    const needKey   = headEl?.dataset?.need || "";

    const waktuRespon = ((Date.now() - soalStart) / 1000).toFixed(2);

    const nama = localStorage.getItem("ek_nama") || "";
    const sesi = localStorage.getItem("ek_sesi") || "";

    const isBenar = (pickedKey === correctKey) && (needKey === correctKey);
    const status = isBenar ? "BENAR" : "SALAH";

    sendRekapToGAS({
      nama,
      sesi,
      soal: idx + 1,
      emosi: `${pickedKey}→${needKey} (${status})`,
      waktu: waktuRespon
    });

    if (isBenar) {
      score++;
      renderScore();
      attachFaceToHead(faceEl, headEl);
      flashOk(headEl);

      setHint("good", "✅ Benar!");
      resetFeedback();
      feedbackEl.classList.add("good");
      feedbackEl.textContent = "YEEEAAAY! NEMPEL PAS BANGET!!! 🎉🎉";
    } else {
      shake(headEl);

      setHint("bad", "❌ Salah");
      resetFeedback();
      feedbackEl.classList.add("bad");
      feedbackEl.textContent = "YAAAHH… BELUM COCOK 😭";
    }

    idx++;

    if (idx >= TOTAL) {
      setTimeout(() => finishGame("Selesai!"), FEEDBACK_DELAY_MS);
    } else {
      setTimeout(() => setQuestion(), FEEDBACK_DELAY_MS);
    }
  }

  function setupInteractions(faceEl, headEl) {
    // drag desktop
    faceEl.addEventListener("dragstart", (e) => {
      if (gameEnded || lockInput) return;
      e.dataTransfer.setData("text/plain", "FACE");
    });

    headEl.addEventListener("dragover", (e) => {
      e.preventDefault();
      headEl.classList.add("over");
    });

    headEl.addEventListener("dragleave", () => {
      headEl.classList.remove("over");
    });

    headEl.addEventListener("drop", (e) => {
      e.preventDefault();
      headEl.classList.remove("over");
      if (gameEnded || lockInput) return;
      handleAnswer(faceEl, headEl);
    });

    // HP tap muka
    faceEl.addEventListener("click", () => {
      if (gameEnded || lockInput) return;
      picked = faceEl;
      setHint(null, "Sekarang tap kepala yang cocok 👇");
    });

    faceEl.addEventListener("touchstart", (e) => {
      if (gameEnded || lockInput) return;
      e.preventDefault();
      picked = faceEl;
      setHint(null, "Sekarang tap kepala yang cocok 👇");
    }, { passive: false });

    // HP tap kepala
    headEl.addEventListener("click", () => {
      if (gameEnded || lockInput) return;
      if (!picked) {
        setHint("bad", "Tap mukanya dulu ya 🙂");
        shake(headEl);
        return;
      }
      handleAnswer(picked, headEl);
    });

    headEl.addEventListener("touchstart", (e) => {
      if (gameEnded || lockInput) return;
      e.preventDefault();
      if (!picked) {
        setHint("bad", "Tap mukanya dulu ya 🙂");
        shake(headEl);
        return;
      }
      handleAnswer(picked, headEl);
    }, { passive: false });
  }

  function startGame() {
    const nama = (namaInput.value || "").trim();
    const sesi = (sesiInput.value || "").trim();

    if (!nama || !sesi) {
      alert("Nama dan sesi wajib diisi ya 🙂");
      return;
    }

    localStorage.setItem("ek_nama", nama);
    localStorage.setItem("ek_sesi", sesi);

    introEl.classList.add("hidden");
    gameEl.classList.remove("hidden");

    pool = shuffle(ROUNDS).slice(0, TOTAL);
    idx = 0;
    score = 0;
    timeLeft = DURATION_SEC;
    gameEnded = false;
    lockInput = false;

    renderScore();
    setQuestion();
    startTimer();
  }

  btnMulai.addEventListener("click", startGame);

  if (btnSelesai) {
    btnSelesai.addEventListener("click", () => finishGame("Diselesaikan manual"));
  }

  renderTimer();
  renderScore();
  resetFeedback();
});
