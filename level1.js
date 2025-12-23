// =====================
// GAS WebApp URL (/exec)
// =====================
const GAS_URL = "https://script.google.com/macros/s/AKfycbwlKHW60fkzcickncJz6xHOSSxYaNVOUMPR2X-tnz12ia6UtOfp7Tbh6aYxLk2oSBVo/exec";

// ====== KONFIG GAME ======
const TOTAL = 8;
const DURATION_SEC = 120; // 2 menit

// Soal (8 item). Nanti akan diacak (random)
const ROUNDS = [
  { emosi: "BAHAGIA",  img: "./img/12.jpg" },
  { emosi: "SEDIH",    img: "./img/12.jpg" },
  { emosi: "TAKUT",    img: "./img/12.jpg" },
  { emosi: "TERKEJUT", img: "./img/12.jpg" },
  { emosi: "BINGUNG",  img: "./img/12.jpg" },
  { emosi: "MALU",     img: "./img/12.jpg" },
  { emosi: "MARAH",    img: "./img/12.jpg" },
  { emosi: "CINTA",    img: "./img/12.jpg" },
];

// ====== STATE ======
let pool = [];
let idx = 0;
let score = 0;
let timeLeft = DURATION_SEC;
let timerId = null;
let gameEnded = false;
let soalStart = 0;

// ====== ELEM ======
const introEl   = document.getElementById("intro");
const gameEl    = document.getElementById("game");
const namaInput = document.getElementById("namaAnak");
const sesiInput = document.getElementById("sesiAnak");
const btnMulai  = document.getElementById("btnMulai");

const timerEl   = document.getElementById("timer");
const scoreEl   = document.getElementById("score");
const imgEl     = document.getElementById("questionImg");
const hintEl    = document.getElementById("hint");
const btnSelesai= document.getElementById("btnSelesai");

const giveaway  = document.getElementById("giveaway");
const giveEmoji = document.getElementById("giveEmoji");
const giveText  = document.getElementById("giveText");
const giveBtn   = document.getElementById("giveBtn");

// ====== UTIL ======
function pad(n){ return String(n).padStart(2,"0"); }

function renderTimer(){
  const m = Math.floor(timeLeft/60);
  const s = timeLeft % 60;
  timerEl.textContent = `${pad(m)}:${pad(s)}`;
}

function renderScore(){
  scoreEl.textContent = `Skor: ${score} / ${TOTAL}`;
}

function shuffle(arr){
  // shuffle aman (Fisher-Yates)
  const a = arr.slice();
  for (let i = a.length - 1; i > 0; i--){
    const j = Math.floor(Math.random() * (i + 1));
    [a[i], a[j]] = [a[j], a[i]];
  }
  return a;
}

function shake(el){
  el.classList.remove("shake");
  void el.offsetWidth;
  el.classList.add("shake");
}

function flashOk(el){
  el.classList.remove("ok");
  void el.offsetWidth;
  el.classList.add("ok");
}

// ====== REKAP KE GAS (anti CORS) ======
function sendRekapToGAS({nama, sesi, soal, emosi, waktu}){
  if (!GAS_URL) return;

  const u = new URL(GAS_URL);
  u.searchParams.set("nama", nama);
  u.searchParams.set("sesi", sesi);
  u.searchParams.set("soal", String(soal));
  u.searchParams.set("emosi", emosi);
  u.searchParams.set("waktu", String(waktu));

  // trigger doGet tanpa CORS
  const img = new Image();
  img.src = u.toString();
}

// ====== SET SOAL ======
function setQuestion(){
  const q = pool[idx];
  imgEl.src = q.img;
  imgEl.alt = `Soal ${idx+1}`;
  hintEl.textContent = "Tarik gambar ke emosi yang benar";
  soalStart = Date.now();
}

// ====== TIMER ======
function startTimer(){
  renderTimer();
  timerId = setInterval(()=>{
    if (gameEnded) return;
    timeLeft--;
    if (timeLeft <= 0){
      timeLeft = 0;
      renderTimer();
      finishGame("Waktunya habis. Tapi kamu tetap keren!");
      return;
    }
    renderTimer();
  }, 1000);
}

// ====== GIVEAWAY ======
function pickGiftByName(){
  const nama = (localStorage.getItem("ek_nama") || "").trim();
  const huruf = (nama[0] || "").toUpperCase();

  let emoji = "🎉";
  let title = `Hebat, ${nama || "Teman"}!`;

  if ("ABCDE".includes(huruf)) emoji = "🦁";
  else if ("FGHIJ".includes(huruf)) emoji = "🐼";
  else if ("KLMNO".includes(huruf)) emoji = "🦊";
  else if ("PQRST".includes(huruf)) emoji = "🐯";
  else if ("UVWXYZ".includes(huruf)) emoji = "⭐";

  return { emoji, title };
}

function showGiveaway(msg){
  const {emoji, title} = pickGiftByName();
  giveEmoji.textContent = emoji;
  giveText.textContent = msg ? `${msg}\n${title}` : title;
  giveaway.classList.remove("hidden");
}

function finishGame(message){
  if (gameEnded) return;
  gameEnded = true;
  clearInterval(timerId);

  localStorage.setItem("ek_level1_skor", String(score));
  localStorage.setItem("ek_level1_selesai", "1");

  showGiveaway(message);

  giveBtn.onclick = ()=>{
    window.location.href = "./index.html";
  };
}

// ====== DRAG IMAGE ======
imgEl.addEventListener("dragstart", (e)=>{
  e.dataTransfer.setData("text/plain", "SOAL");
});

// ====== DROP KE KARTU KUNING ======
function setupDropTargets(){
  const targets = document.querySelectorAll(".drop-target");
  targets.forEach(targetEl=>{
    targetEl.addEventListener("dragover", (e)=>{
      e.preventDefault();
      targetEl.classList.add("over");
    });

    targetEl.addEventListener("dragleave", ()=>{
      targetEl.classList.remove("over");
    });

    targetEl.addEventListener("drop", (e)=>{
      e.preventDefault();
      if (gameEnded) return;
      targetEl.classList.remove("over");

      const pickedEmosi  = targetEl.dataset.emosi;
      const correctEmosi = pool[idx].emosi;

      const waktuRespon = ((Date.now() - soalStart) / 1000).toFixed(2);

      const nama = localStorage.getItem("ek_nama") || "";
      const sesi = localStorage.getItem("ek_sesi") || "";

      const status = (pickedEmosi === correctEmosi) ? "BENAR" : "SALAH";

      // ✅ REKAP SELALU (benar/salah tetap masuk)
      sendRekapToGAS({
        nama,
        sesi,
        soal: idx + 1,
        emosi: `${pickedEmosi} (${status})`,
        waktu: waktuRespon
      });

      if (pickedEmosi === correctEmosi){
        score++;
        renderScore();
        hintEl.textContent = "✅ Benar! Lanjut ya…";
        flashOk(targetEl);

        idx++;
        if (idx >= TOTAL){
          finishGame("Selesai! Kamu hebat 😎");
        } else {
          setTimeout(()=> setQuestion(), 350);
        }
      } else {
        hintEl.textContent = "❌ Salah, coba lagi ya!";
        shake(targetEl);
        // soal TIDAK ganti, tetap soal yang sama
      }
    });
  });
}

// ====== START GAME ======
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
  pool = shuffle(ROUNDS).slice(0, TOTAL); // random 8
  idx = 0;
  score = 0;
  timeLeft = DURATION_SEC;
  gameEnded = false;

  renderScore();
  setQuestion();
  startTimer();
}

// ====== EVENT ======
btnMulai.addEventListener("click", startGame);
btnSelesai.addEventListener("click", ()=> finishGame("Selesai! Mantap!"));

// ====== INIT ======
function init(){
  const namaLS = (localStorage.getItem("ek_nama") || "").trim();
  const sesiLS = (localStorage.getItem("ek_sesi") || "").trim();
  if (namaLS) namaInput.value = namaLS;
  if (sesiLS) sesiInput.value = sesiLS;

  renderTimer();
  renderScore();

  // penting: target drop harus sudah ada di HTML
  setupDropTargets();
}
init();
