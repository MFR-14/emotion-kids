// =====================
// GAS WebApp URL (/exec)
// =====================
const GAS_URL =
  "https://script.google.com/macros/s/AKfycbwlKHW60fkzcickncJz6xHOSSxYaNVOUMPR2X-tnz12ia6UtOfp7Tbh6aYxLk2oSBVo/exec";

// ====== KONFIG ======
const LEVEL = 5;
const TOTAL = 10;
const DURATION_SEC = 600;        // 10 menit
const FEEDBACK_DELAY_MS = 900;

// Level 5: “Aku pilih apa saat begini?”
// opsi: 3 pilihan, kita nilai: good (1 poin), neutral (0), bad (0)
// Ini bukan ujian, tapi latihan memilih respon sehat.

const QUESTIONS = [
  {
    emoji: "😢",
    title: "Kamu sedih karena nilai ulanganmu jelek.",
    options: [
      { emoji: "😡", text: "Marah-marah dan nyalahin semua orang.", score: 0 },
      { emoji: "🗣️", text: "Cerita ke orang tua/guru dan minta saran belajar.", score: 1 },
      { emoji: "📘", text: "Coba belajar pelan-pelan lagi, besok latihan sedikit.", score: 1 },
   
    ],
  },
  {
    emoji: "🤯",
    title: "Kamu bingung harus mengerjakan PR yang mana dulu.",
    options: [
      { emoji: "📝", text: "Bikin daftar PR, kerjakan yang paling mudah dulu.", score: 1 },
      { emoji: "🌀", text: "Ditinggal main saja biar lupa.", score: 0 },
      { emoji: "⏱️", text: "Pasang timer 10 menit, fokus satu PR dulu.", score: 1 },
      
    ],
  },
  {
    emoji: "🧍",
    title: "Tidak ada teman yang mengajakmu bermain.",
    options: [
       { emoji: "💢", text: "Ngambek dan bilang semua orang jahat.", score: 0 },
      { emoji: "🙋", text: "Kamu duluan yang ngajak: “Main bareng yuk?”", score: 1 },
      { emoji: "🎨", text: "Main kegiatan sendiri dulu (gambar/baca), nanti coba lagi.", score: 1 },
     
    ],
  },
  {
    emoji: "🗯️",
    title: "Teman-teman tidak setuju dengan pendapatmu.",
    options: [
    
      { emoji: "🤝", text: "Cari jalan tengah yang adil buat semua.", score: 1 },
      { emoji: "📢", text: "Ngomel keras biar semua ikut kamu.", score: 0 },
      { emoji: "👂", text: "Dengar alasan mereka dulu, baru bicara lagi pelan.", score: 1 },
    ],
  },
  {
    emoji: "😠",
    title: "Kamu kesal karena ada yang mengejekmu.",
    options: [
      { emoji: "🧊", text: "Tenang, tarik napas, lalu abaikan.", score: 1 },
      { emoji: "🧑‍🏫", text: "Kalau keterlaluan, lapor guru/orang tua.", score: 1 },
      { emoji: "💥", text: "Balas mengejek lebih keras.", score: 0 },
    ],
  },
  {
    emoji: "😣",
    title: "Kamu takut salah saat maju ke depan kelas.",
    options: [
      { emoji: "🏃", text: "Kabur dan pura-pura sakit.", score: 0 },
      { emoji: "🌬️", text: "Tarik napas 3 kali, lalu coba pelan-pelan.", score: 1 },
      { emoji: "🧠", text: "Ingat: salah itu biasa, yang penting berani.", score: 1 },
    
    ],
  },
  {
    emoji: "😤",
    title: "Kamu marah karena adik mengacak mainanmu.",
    options: [
      { emoji: "🗣️", text: "Bilang baik-baik: “Tolong rapikan bareng ya.”", score: 1 },
      { emoji: "🤬", text: "Bentak adik terus-terusan.", score: 0 },
      { emoji: "📦", text: "Rapikan dulu, lalu simpan mainan di tempat aman.", score: 1 },
    ],
  },
  {
    emoji: "🫣",
    title: "Kamu malu karena salah jawab saat pelajaran.",
    options: [
      { emoji: "🙂", text: "Senyum: “Oh iya, aku salah. Makasih ya.”", score: 1 },
      { emoji: "😖", text: "Ngunci mulut dan nggak mau belajar lagi.", score: 0 },
      { emoji: "❓", text: "Tanya: “Yang benar gimana?” biar kamu ngerti.", score: 1 },
      
    ],
  },
  {
    emoji: "🥺",
    title: "Kamu merasa iri karena temanmu punya barang baru.",
    options: [
      { emoji: "🧡", text: "Ucap selamat, lalu ingat barang kamu juga banyak gunanya.", score: 1 },
      { emoji: "😒", text: "Ngomong jelek tentang barangnya.", score: 0 },
      { emoji: "🎯", text: "Kalau ingin, kamu bisa nabung atau minta di waktu yang tepat.", score: 1 },
    ],
  },
  {
    emoji: "😵‍💫",
    title: "Kamu lagi capek dan gampang bad mood.",
    options: [
      { emoji: "💢", text: "Lampiaskan ke orang rumah.", score: 0 },
      { emoji: "💧", text: "Minum air, istirahat sebentar, baru lanjut aktivitas.", score: 1 },
      { emoji: "🌿", text: "Tarik napas + peregangan ringan 1 menit.", score: 1 },
      
    ],
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

function shake(el){
  el.classList.remove("shake");
  void el.offsetWidth;
  el.classList.add("shake");
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
  const qMiniEl  = document.getElementById("qMini");
  const optWrap  = document.getElementById("options");

  if (!introEl || !gameEl || !namaInput || !umurInput || !sekolahInput || !btnMulai ||
      !timerEl || !scoreEl || !roundEl || !hintEl || !feedbackEl || !btnSelesai ||
      !qEmojiEl || !qTitleEl || !qMiniEl || !optWrap) {
    alert("Ada elemen HTML yang tidak ketemu. Cek id level5.html kamu.");
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
    feedbackEl.style.display = "block";
  }

  function setHint(type, text){
    hintEl.classList.remove("good","bad");
    if (type) hintEl.classList.add(type);
    hintEl.textContent = text;
  }

  function setRoundTitle(){
    roundEl.textContent = `Soal ${idx+1} / ${TOTAL}`;
  }

  function finishLevel(alasan){
    if (ended) return;
    ended = true;
    clearInterval(timerId);

    const nama    = localStorage.getItem("ek_nama") || "";
    const umur    = localStorage.getItem("ek_umur") || "";
    const sekolah = localStorage.getItem("ek_sekolah") || "";

    localStorage.setItem("ek_level5_skor", String(score));
    localStorage.setItem("ek_level5_selesai", "1");
    localStorage.setItem("ek_level5_alasan", alasan || "Selesai");

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

    // arahkan ke congrats5 (kalau sudah ada)
    window.location.href = "./congrats5.html?" + qs.toString();
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

  function nextQuestion(){
    idx++;
    if (idx >= TOTAL){
      setTimeout(() => finishLevel("Selesai!"), 700);
    } else {
      setQuestion();
    }
  }

  function setQuestion(){
    const q = QUESTIONS[idx];
    lockInput = false;
    soalStart = Date.now();

    setRoundTitle();
    resetFeedback();
    setHint(null, "Pilih satu jawaban ya 👇");

    qEmojiEl.textContent = q.emoji;
    qTitleEl.textContent = q.title;
    qMiniEl.textContent  = "Pilih yang paling cocok kamu lakukan.";

    // render opsi
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

  function handlePick(opt, btn, optIndex){
    if (ended || lockInput) return;
    lockInput = true;

    const q = QUESTIONS[idx];
    const waktuRespon = ((Date.now() - soalStart) / 1000).toFixed(2);

    // skor
    if (opt.score === 1) score += 1;
    renderScore();

    // feedback ramah (bukan “salah/benar” keras)
    resetFeedback();

    if (opt.score === 1){
      btn.classList.add("good");
      feedbackEl.classList.add("good");
      feedbackEl.textContent = "✅ Pilihan yang bikin kamu makin kuat 💪";
      setHint("good", "Mantap! lanjut ya 👇");
    } else {
      btn.classList.add("bad");
      feedbackEl.classList.add("bad");
      feedbackEl.textContent = "🙂 Boleh… tapi coba cari cara yang lebih menenangkan ya.";
      setHint("bad", "Yuk latihan lagi, lanjut soal berikutnya 👇");
    }

    // log GAS
    logToGAS(
      idx + 1,
      `PILIHAN:${q.title} -> (${optIndex+1}) ${opt.text} | SCORE:${opt.score}`,
      waktuRespon
    );

    // lanjut
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
