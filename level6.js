// =====================
// GAS WebApp URL (/exec)
// =====================
const GAS_URL =
  "https://script.google.com/macros/s/AKfycbwlKHW60fkzcickncJz6xHOSSxYaNVOUMPR2X-tnz12ia6UtOfp7Tbh6aYxLk2oSBVo/exec";

// ====== KONFIG ======
const LEVEL = 6;
const TOTAL = 10;
const DURATION_SEC = 600;        // 10 menit
const FEEDBACK_DELAY_MS = 2200;

// ====== DATA ======
const QUESTIONS = [
  {
    emoji:"👋",
    title:"Kamu melambaikan tangan ke temanmu, tapi temanmu tidak membalas.",
    neg:"Dia nggak suka aku.",
    options:[
      {emoji:"👀", text:"Mungkin dia nggak lihat karena sedang tidak memperhatikan.", score:1},
      {emoji:"😐", text:"Ya sudah, mungkin dia lagi sibuk.", score:0},
      {emoji:"💢", text:"Dia sengaja biar aku sedih.", score:0},
    ]
  },
  {
    emoji:"🚲",
    title:"Kamu ngajak teman sepedaan, tapi dia menolak.",
    neg:"Dia gak suka main sama aku.",
    options:[
      {emoji:"😴", text:"Mungkin dia capek karena baru pulang sekolah.", score:1},
      {emoji:"📅", text:"Mungkin dia ada kegiatan lain hari ini.", score:1},
      {emoji:"😠", text:"Berarti dia teman yang jelek.", score:0},
    ]
  },
  {
    emoji:"🏃",
    title:"Temanmu melewatimu tanpa menyapa.",
    neg:"Dia sombong.",
    options:[
      {emoji:"💭", text:"Mungkin dia lagi kepikiran sesuatu jadi tidak sadar.", score:1},
      {emoji:"🔊", text:"Mungkin dia nggak dengar karena ramai.", score:1},
      {emoji:"🧨", text:"Dia sengaja merendahkan aku.", score:0},
    ]
  },
  {
    emoji:"📱",
    title:"Teleponmu tidak diangkat temanmu.",
    neg:"Dia gak mau angkat telponku.",
    options:[
      {emoji:"🏫", text:"Mungkin dia sedang aktivitas yang nggak bisa angkat telepon.", score:1},
      {emoji:"🔋", text:"Mungkin HP-nya mati atau habis baterai.", score:1},
      {emoji:"😡", text:"Dia pasti sengaja biar aku kesel.", score:0},
    ]
  },
  {
    emoji:"💬",
    title:"Pesanmu lama dibalas.",
    neg:"Aku nggak penting.",
    options:[
      {emoji:"🧩", text:"Mungkin dia lagi belajar / bantu orang tua dulu.", score:1},
      {emoji:"📴", text:"Mungkin dia lagi nggak pegang HP.", score:1},
      {emoji:"😞", text:"Dia pasti nggak peduli sama aku.", score:0},
    ]
  },
  {
    emoji:"😶",
    title:"Temanmu tidak memilih kamu dalam kelompok.",
    neg:"Aku nggak bisa apa-apa.",
    options:[
      {emoji:"🤝", text:"Mungkin kelompoknya sudah penuh duluan.", score:1},
      {emoji:"🧠", text:"Aku bisa bilang: “Aku bisa bantu bagian ini ya.”", score:1},
      {emoji:"🫥", text:"Aku nggak usah ikut-ikut lagi.", score:0},
    ]
  },
  {
    emoji:"🎮",
    title:"Temanmu tidak mengajakmu main game yang mereka mainkan.",
    neg:"Aku nggak dianggap.",
    options:[
      {emoji:"🙋", text:"Aku bisa tanya baik-baik: “Boleh aku ikut?”", score:1},
      {emoji:"🕹️", text:"Mungkin mereka pikir aku lagi sibuk.", score:1},
      {emoji:"💥", text:"Mereka pasti jahat sama aku.", score:0},
    ]
  },
  {
    emoji:"🧑‍🏫",
    title:"Gurumu terlihat serius saat kamu maju ke depan.",
    neg:"Aku pasti bakal dimarahi.",
    options:[
      {emoji:"🙂", text:"Mungkin itu wajah fokus guru, bukan marah.", score:1},
      {emoji:"✅", text:"Aku bisa jawab pelan-pelan, kalau salah ya belajar.", score:1},
      {emoji:"🏃", text:"Aku mending nggak usah maju.", score:0},
    ]
  },
  {
    emoji:"🍱",
    title:"Temanmu tidak mau mencicipi bekalmu.",
    neg:"Bekalku tidak enak.",
    options:[
      {emoji:"🥗", text:"Mungkin dia sudah kenyang atau ada pantangan makanan.", score:1},
      {emoji:"😷", text:"Mungkin dia lagi kurang enak badan.", score:1},
      {emoji:"😤", text:"Dia menghina aku dan keluargaku.", score:0},
    ]
  },
  {
    emoji:"⚽",
    title:"Kamu nggak dapat umpan saat main bola.",
    neg:"Mereka sengaja nggak mau kasih aku.",
    options:[
      {emoji:"👀", text:"Mungkin mereka belum lihat posisiku bebas.", score:1},
      {emoji:"📣", text:"Aku bisa teriak sopan: “Aku di sini!”", score:1},
      {emoji:"💢", text:"Aku marah dan keluar dari permainan.", score:0},
    ]
  },
];

// ====== STATE ======
let idx = 0;
let score = 0;
let timeLeft = DURATION_SEC;
let timerId = null;
let ended = false;
let lockInput = false;
let soalStart = 0;

// ====== UTIL ======
function pad(n){ return String(n).padStart(2,"0"); }

function pulse(el){
  if (!el) return;
  el.classList.remove("pulse");
  void el.offsetWidth;
  el.classList.add("pulse");
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

window.addEventListener("DOMContentLoaded", () => {
  const introEl = document.getElementById("intro");
  const gameEl  = document.getElementById("game");

  const namaInput    = document.getElementById("namaAnak");
  const umurInput    = document.getElementById("umurAnak");
  const sekolahInput = document.getElementById("namaSekolah");
  const btnMulai     = document.getElementById("btnMulai");

  const timerEl    = document.getElementById("timer");
  const scoreEl    = document.getElementById("score");
  const roundEl    = document.getElementById("roundTitle");
  const hintEl     = document.getElementById("hint");
  const feedbackEl = document.getElementById("answerFeedback");
  const btnSelesai = document.getElementById("btnSelesai");

  const qEmojiEl = document.getElementById("qEmoji");
  const qTitleEl = document.getElementById("qTitle");
  const qNegEl   = document.getElementById("qNeg");
  const optWrap  = document.getElementById("options");

  if (!introEl || !gameEl || !namaInput || !umurInput || !sekolahInput || !btnMulai ||
      !timerEl || !scoreEl || !roundEl || !hintEl || !feedbackEl ||
      !qEmojiEl || !qTitleEl || !qNegEl || !optWrap) {
    alert("Ada elemen HTML yang tidak ketemu. Cek id level6.html kamu.");
    return;
  }

  // autofill
  const namaLS    = (localStorage.getItem("ek_nama") || "").trim();
  const umurLS    = (localStorage.getItem("ek_umur") || "").trim();
  const sekolahLS = (localStorage.getItem("ek_sekolah") || "").trim();
  if (namaLS) namaInput.value = namaLS;
  if (umurLS) umurInput.value = umurLS;
  if (sekolahLS) sekolahInput.value = sekolahLS;

  function renderTimer(){
    const m = Math.floor(timeLeft/60);
    const s = timeLeft%60;
    timerEl.textContent = `${pad(m)}:${pad(s)}`;
  }

  function renderScore(){
    scoreEl.textContent = `Skor: ${score}`;
  }

  function resetFeedback(){
    feedbackEl.className = "answer-feedback";
    feedbackEl.textContent = "";
  }

  function setHint(type, text){
    hintEl.classList.remove("good","bad");
    if (type) hintEl.classList.add(type);
    hintEl.textContent = text;
    pulse(hintEl);
  }

  function setRoundTitle(){
    roundEl.textContent = `Soal ${idx+1} / ${TOTAL}`;
  }

  function logToGAS(soal, text, waktuRespon){
    const nama    = localStorage.getItem("ek_nama") || "";
    const umur    = localStorage.getItem("ek_umur") || "";
    const sekolah = localStorage.getItem("ek_sekolah") || "";

    sendRekapToGAS({
      level: LEVEL,
      nama,
      umur,
      sekolah,
      soal,
      emosi: text,
      waktu: waktuRespon
    });
  }

  function finishLevel(alasan){
    if (ended) return;
    ended = true;
    clearInterval(timerId);

    const nama    = localStorage.getItem("ek_nama") || "";
    const umur    = localStorage.getItem("ek_umur") || "";
    const sekolah = localStorage.getItem("ek_sekolah") || "";

    localStorage.setItem("ek_level6_skor", String(score));
    localStorage.setItem("ek_level6_selesai", "1");
    localStorage.setItem("ek_level6_alasan", alasan || "Selesai");

    localStorage.setItem("ek_last_level", String(LEVEL));
    localStorage.setItem("ek_last_level_time", new Date().toISOString());

    const qs = new URLSearchParams({
      level: String(LEVEL),
      nama,
      umur,
      sekolah,
      skor: String(score),
      alasan: alasan || "Selesai"
    });

    window.location.href = "./congrats6.html?" + qs.toString();
  }

  function startTimer(){
    renderTimer();
    timerId = setInterval(() => {
      if (ended) return;
      timeLeft--;

      if (timeLeft <= 0){
        timeLeft = 0;
        renderTimer();
        lockInput = true;
        setHint("bad", "⏳ Waktu habis!");
        setTimeout(() => finishLevel("Waktu habis!"), 700);
        return;
      }
      renderTimer();
    }, 1000);
  }

  function setQuestion(){
    const q = QUESTIONS[idx];
    lockInput = false;
    soalStart = Date.now();

    setRoundTitle();
    resetFeedback();
    setHint(null, "Pilih penjelasan yang lebih positif ya 👇");

    qEmojiEl.textContent = q.emoji;
    qTitleEl.textContent = q.title;
    qNegEl.textContent   = `“${q.neg}”`;

    optWrap.innerHTML = "";
    q.options.forEach((opt, i) => {
      const btn = document.createElement("button");
      btn.type = "button";
      btn.className = "opt-btn";
      btn.innerHTML = `
        <div class="emo">${opt.emoji}</div>
        <div class="txt">${opt.text}</div>
      `;
      btn.addEventListener("click", () => handlePick(opt, btn, i));
      optWrap.appendChild(btn);
    });
  }

  function nextQuestion(){
    idx++;
    if (idx >= TOTAL){
      setTimeout(() => finishLevel("Selesai!"), 700);
    } else {
      setQuestion();
    }
  }

  function handlePick(opt, btn, optIndex){
    if (ended || lockInput) return;
    lockInput = true;

    const q = QUESTIONS[idx];
    const waktuRespon = ((Date.now() - soalStart) / 1000).toFixed(2);

    if (opt.score === 1) score += 1;
    renderScore();

    resetFeedback();

    if (opt.score === 1){
      btn.classList.add("good");
      feedbackEl.classList.add("good");
      feedbackEl.textContent = "✅ Nah gitu! Pikiran yang bikin hati adem 😄";
      pulse(feedbackEl);
      setHint("good", "Mantap! lanjut ya 👇");
    } else {
      btn.classList.add("bad");
      feedbackEl.classList.add("bad");
      feedbackEl.textContent = "🙂 Itu boleh kepikiran… tapi ayo coba cari yang lebih positif ya.";
      pulse(feedbackEl);
      setHint("bad", "Lanjut soal berikutnya ya 👇");
    }

    logToGAS(
      idx + 1,
      `REFRAME:${q.title} | NEG:${q.neg} | PILIH(${optIndex+1}):${opt.text} | SCORE:${opt.score}`,
      waktuRespon
    );

    setTimeout(() => nextQuestion(), FEEDBACK_DELAY_MS);
  }

  function startGame(){
    const nama = (namaInput.value || "").trim();
    const umurRaw = (umurInput.value || "").trim();
    const sekolah = (sekolahInput.value || "").trim();
    const umur = Number(umurRaw);

    if (!nama) { alert("Nama anak wajib diisi ya 🙂"); return; }
    if (!umurRaw || Number.isNaN(umur) || umur < 1 || umur > 18) {
      alert("Umur wajib diisi dan harus angka 1–18 ya 🙂"); return;
    }
    if (!sekolah) { alert("Nama sekolah wajib diisi ya 🙂"); return; }

    localStorage.setItem("ek_nama", nama);
    localStorage.setItem("ek_umur", String(umur));
    localStorage.setItem("ek_sekolah", sekolah);

    introEl.classList.add("hidden");
    gameEl.classList.remove("hidden");

    idx = 0;
    score = 0;
    timeLeft = DURATION_SEC;
    ended = false;
    lockInput = false;

    renderScore();
    setQuestion();
    startTimer();
  }

  btnMulai.addEventListener("click", startGame);
  btnSelesai.addEventListener("click", () => finishLevel("Diselesaikan manual"));

  renderTimer();
  renderScore();
  resetFeedback();
});
