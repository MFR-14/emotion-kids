// =====================
// GAS WebApp URL (/exec)
// =====================
const GAS_URL =
  "https://script.google.com/macros/s/AKfycbwlKHW60fkzcickncJz6xHOSSxYaNVOUMPR2X-tnz12ia6UtOfp7Tbh6aYxLk2oSBVo/exec";

// ====== KONFIG GAME ======
const TOTAL = 8;
const DURATION_SEC = 180;        // 3 menit
const FEEDBACK_DELAY_MS = 2200;  // lama tampil notif benar/salah
const LEVEL = 1;

const ROUNDS = [
  { emosi: "BAHAGIA",  img: "./img/bahagia.jpg" },
  { emosi: "SEDIH",    img: "./img/sedih.jpg" },
  { emosi: "TAKUT",    img: "./img/takut.jpg" },
  { emosi: "TERKEJUT", img: "./img/terkejut.jpg" },
  { emosi: "BINGUNG",  img: "./img/bingung.jpg" },
  { emosi: "MALU",     img: "./img/malu.jpg" },
  { emosi: "MARAH",    img: "./img/marah.jpg" },
  { emosi: "CINTA",    img: "./img/cinta.jpg" },
];

// ====== STATE ======
let pool = [];
let idx = 0;
let score = 0;
let timeLeft = DURATION_SEC;
let timerId = null;
let gameEnded = false;
let soalStart = 0;

let picked = false;
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
function sendRekapToGAS({ level, nama, umur, sekolah, soal, emosi, waktu }) {
  if (!GAS_URL) return;

  const u = new URL(GAS_URL);
  u.searchParams.set("level", String(level));
  u.searchParams.set("nama", nama);
  u.searchParams.set("umur", String(umur));
  u.searchParams.set("sekolah", sekolah);
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

  // input: versi baru
  const namaInput    = document.getElementById("namaAnak");
  const umurInput    = document.getElementById("umurAnak");
  const sekolahInput = document.getElementById("namaSekolah");

  // fallback (kalau HTML lama masih kepakai)
  const sesiInputLegacy = document.getElementById("sesiAnak");

  const btnMulai   = document.getElementById("btnMulai");

  const timerEl    = document.getElementById("timer");
  const scoreEl    = document.getElementById("score");
  const imgEl      = document.getElementById("questionImg");
  const hintEl     = document.getElementById("hint");
  const feedbackEl = document.getElementById("answerFeedback");
  const btnSelesai = document.getElementById("btnSelesai");

  if (!introEl || !gameEl || !namaInput || !btnMulai || !timerEl || !scoreEl || !imgEl || !hintEl || !feedbackEl) {
    alert("Ada elemen HTML yang tidak ketemu. Cek id: intro, game, namaAnak, umurAnak, namaSekolah, btnMulai, timer, score, questionImg, hint, answerFeedback.");
    return;
  }

  // helper ambil nilai sekolah (baru > legacy)
  function getSekolahValue() {
    const vNew = (sekolahInput && sekolahInput.value ? sekolahInput.value : "").trim();
    if (vNew) return vNew;
    const vOld = (sesiInputLegacy && sesiInputLegacy.value ? sesiInputLegacy.value : "").trim();
    return vOld;
  }

  // ====== isi otomatis dari localStorage ======
  const namaLS    = (localStorage.getItem("ek_nama") || "").trim();
  const umurLS    = (localStorage.getItem("ek_umur") || "").trim();
  const sekolahLS = (localStorage.getItem("ek_sekolah") || "").trim();

  if (namaLS) namaInput.value = namaLS;
  if (umurInput && umurLS) umurInput.value = umurLS;
  if (sekolahInput && sekolahLS) sekolahInput.value = sekolahLS;
  if (sesiInputLegacy && sekolahLS) sesiInputLegacy.value = sekolahLS;

  function renderTimer() {
    const m = Math.floor(timeLeft / 60);
    const s = timeLeft % 60;
    timerEl.textContent = `${pad(m)}:${pad(s)}`;
  }

  function renderScore() {
    scoreEl.textContent = `Skor: ${score} / ${TOTAL}`;
  }

  function setPicked(on) {
    picked = on;
    imgEl.classList.toggle("picked", on);

    hintEl.classList.remove("good", "bad");
    hintEl.textContent = on
      ? "Sekarang tap kartu emosi yang benar 👇"
      : "Tarik / tap gambar ke emosi yang benar";
  }

  function resetFeedback() {
    feedbackEl.className = "answer-feedback";
    feedbackEl.textContent = "";
    feedbackEl.style.display = "block";
    feedbackEl.style.opacity = "1";
    feedbackEl.style.visibility = "visible";
    feedbackEl.style.transform = "none";
  }

  function setQuestion() {
    const q = pool[idx];
    imgEl.src = q.img + "?v=" + Date.now();
    imgEl.alt = `Soal ${idx + 1}`;

    lockInput = false;
    setPicked(false);

    hintEl.classList.remove("good", "bad");
    hintEl.textContent = "Tarik / tap gambar ke emosi yang benar";

    resetFeedback();
    soalStart = Date.now();
  }

  function finishGame(message) {
    if (gameEnded) return;
    gameEnded = true;

    clearInterval(timerId);

    const nama    = localStorage.getItem("ek_nama") || "";
    const umur    = localStorage.getItem("ek_umur") || "";
    const sekolah = localStorage.getItem("ek_sekolah") || "";

    // simpan skor level
    localStorage.setItem("ek_level1_skor", String(score));
    localStorage.setItem("ek_level1_selesai", "1");
    localStorage.setItem("ek_level1_alasan", message || "Selesai");

    // penanda level terakhir
    localStorage.setItem("ek_last_level", String(LEVEL));
    localStorage.setItem("ek_last_level_time", new Date().toISOString());

    // querystring untuk halaman congrats
    const qs = new URLSearchParams({
      level: String(LEVEL),
      nama,
      umur,
      sekolah,
      skor: String(score),
      alasan: message || "Selesai"
    });

    window.location.href = "./congrats1.html?" + qs.toString();
  }

  function startTimer() {
    renderTimer();
    timerId = setInterval(() => {
      if (gameEnded) return;
      timeLeft--;

      if (timeLeft <= 0) {
        timeLeft = 0;
        renderTimer();

        hintEl.classList.remove("good");
        hintEl.classList.add("bad");
        hintEl.textContent = "⏳ Waktu habis!";
        lockInput = true;

        setTimeout(() => finishGame("Waktu habis!"), 900);
        return;
      }
      renderTimer();
    }, 1000);
  }

  // ==== LOGIKA JAWABAN ====
  function handleAnswer(pickedEmosi, targetEl) {
    if (gameEnded || lockInput) return;
    lockInput = true;

    const correctEmosi = pool[idx].emosi;
    const waktuRespon = ((Date.now() - soalStart) / 1000).toFixed(2);

    const nama    = localStorage.getItem("ek_nama") || "";
    const umur    = localStorage.getItem("ek_umur") || "";
    const sekolah = localStorage.getItem("ek_sekolah") || "";

    const status = pickedEmosi === correctEmosi ? "BENAR" : "SALAH";

    // kirim rekap + level
    sendRekapToGAS({
      level: LEVEL,
      nama,
      umur,
      sekolah,
      soal: idx + 1,
      emosi: `${pickedEmosi} (${status})`,
      waktu: waktuRespon
    });

    const isBenar = pickedEmosi === correctEmosi;

    // notif kecil
    hintEl.classList.remove("good", "bad");
    hintEl.classList.add(isBenar ? "good" : "bad");
    hintEl.textContent = isBenar ? "✅ Benar!" : "❌ Salah";

    // notif besar
    resetFeedback();
    feedbackEl.classList.add(isBenar ? "good" : "bad");
    feedbackEl.textContent = isBenar
      ? "YEEEAAAY! KAMU BENAR!!! 🎉🎉"
      : "YAAAHH… SALAAAHHH!!! 😭";

    // efek kartu
    if (isBenar) {
      score++;
      renderScore();
      flashOk(targetEl);
    } else {
      shake(targetEl);
    }

    idx++;
    setPicked(false);

    if (idx >= TOTAL) {
      setTimeout(() => finishGame("Selesai!"), FEEDBACK_DELAY_MS);
    } else {
      setTimeout(() => setQuestion(), FEEDBACK_DELAY_MS);
    }
  }

  // ==== DESKTOP DRAG ====
  imgEl.addEventListener("dragstart", (e) => {
    e.dataTransfer.setData("text/plain", "SOAL");
  });

  // ==== HP TAP GAMBAR ====
  imgEl.addEventListener("click", () => {
    if (gameEnded || lockInput) return;
    setPicked(true);
  });

  imgEl.addEventListener("touchstart", (e) => {
    if (gameEnded || lockInput) return;
    e.preventDefault();
    setPicked(true);
  }, { passive: false });

  // ==== TARGETS (drop + tap) ====
  function setupDropTargets() {
    const targets = document.querySelectorAll(".drop-target");
    if (!targets.length) {
      alert("Drop target tidak ketemu. Pastikan kartu punya class 'drop-target' dan data-emosi.");
      return;
    }

    targets.forEach((targetEl) => {
      targetEl.addEventListener("dragover", (e) => {
        e.preventDefault();
        targetEl.classList.add("over");
      });

      targetEl.addEventListener("dragleave", () => {
        targetEl.classList.remove("over");
      });

      targetEl.addEventListener("drop", (e) => {
        e.preventDefault();
        targetEl.classList.remove("over");
        if (gameEnded || lockInput) return;

        const pickedEmosi = targetEl.dataset.emosi;
        handleAnswer(pickedEmosi, targetEl);
      });

      // HP tap
      targetEl.addEventListener("click", () => {
        if (gameEnded || lockInput) return;

        if (!picked) {
          hintEl.classList.remove("good");
          hintEl.classList.add("bad");
          hintEl.textContent = "Tap gambarnya dulu ya 🙂";
          shake(targetEl);
          return;
        }
        handleAnswer(targetEl.dataset.emosi, targetEl);
      });

      targetEl.addEventListener("touchstart", (e) => {
        if (gameEnded || lockInput) return;
        e.preventDefault();

        if (!picked) {
          hintEl.classList.remove("good");
          hintEl.classList.add("bad");
          hintEl.textContent = "Tap gambarnya dulu ya 🙂";
          shake(targetEl);
          return;
        }
        handleAnswer(targetEl.dataset.emosi, targetEl);
      }, { passive: false });
    });
  }

  function startGame() {
    const nama = (namaInput.value || "").trim();
    const umurRaw = (umurInput && umurInput.value ? umurInput.value : "").trim();
    const sekolah = getSekolahValue();

    const umur = Number(umurRaw);

    if (!nama) {
      alert("Nama anak wajib diisi ya 🙂");
      return;
    }
    if (!umurRaw || Number.isNaN(umur) || umur < 1 || umur > 18) {
      alert("Umur wajib diisi dan harus angka 1–18 ya 🙂");
      return;
    }
    if (!sekolah) {
      alert("Nama sekolah wajib diisi ya 🙂");
      return;
    }

    // simpan identitas
    localStorage.setItem("ek_nama", nama);
    localStorage.setItem("ek_umur", String(umur));
    localStorage.setItem("ek_sekolah", sekolah);

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
  setupDropTargets();
  resetFeedback();
});
