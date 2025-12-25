// =====================
// GAS WebApp URL (/exec)
// =====================
const GAS_URL =
  "https://script.google.com/macros/s/AKfycbwlKHW60fkzcickncJz6xHOSSxYaNVOUMPR2X-tnz12ia6UtOfp7Tbh6aYxLk2oSBVo/exec";

// ====== KONFIG ======
const LEVEL = 4;
const TOTAL = 8;
const DURATION_SEC = 180;        // 3 menit
const FEEDBACK_DELAY_MS = 1800;

// soal ramah disleksia: pendek + ikon
// zone: "BISA" atau "TIDAK"
// jika "TIDAK", munculkan sikap bijak (att)
const QUESTIONS = [
  { emoji:"😡", text:"PERASAANKU", zone:"BISA",
    att:{ prompt:"Kalau aku marah, aku bisa…", options:[
      {emoji:"🌬️", text:"Tarik napas", good:true},
      {emoji:"😤", text:"Marah besar", good:false},
      {emoji:"🤝", text:"Minta bantuan", good:true},
    ]}
  },
  { emoji:"🗣️", text:"CARA BICARAKU", zone:"BISA",
    att:{ prompt:"Kalau kesal, aku bisa bicara…", options:[
      {emoji:"🧡", text:"Pelan dan baik", good:true},
      {emoji:"📢", text:"Teriak", good:false},
      {emoji:"⏸️", text:"Diam sebentar", good:true},
    ]}
  },
  { emoji:"☔", text:"HUJAN", zone:"TIDAK",
    att:{ prompt:"Kalau hujan, aku bisa…", options:[
      {emoji:"📺", text:"Main di rumah", good:true},
      {emoji:"😠", text:"Ngambek terus", good:false},
      {emoji:"📚", text:"Baca/ambar", good:true},
    ]}
  },
  { emoji:"👦", text:"ORANG LAIN", zone:"TIDAK",
    att:{ prompt:"Kalau ada yang mengejek, aku bisa…", options:[
      {emoji:"🧊", text:"Tenang dan abaikan", good:true},
      {emoji:"💥", text:"Balas mengejek", good:false},
      {emoji:"🧑‍🏫", text:"Lapor guru", good:true},
    ]}
  },
  { emoji:"📚", text:"USAHA BELAJARKU", zone:"BISA",
    att:{ prompt:"Kalau sulit, aku bisa…", options:[
      {emoji:"🧩", text:"Coba pelan-pelan", good:true},
      {emoji:"🧨", text:"Langsung menyerah", good:false},
      {emoji:"🙋", text:"Tanya bantuan", good:true},
    ]}
  },
  { emoji:"🚗", text:"MACET", zone:"TIDAK",
    att:{ prompt:"Kalau macet, aku bisa…", options:[
      {emoji:"🎧", text:"Dengar musik", good:true},
      {emoji:"😡", text:"Marah terus", good:false},
      {emoji:"🫁", text:"Napas pelan", good:true},
    ]}
  },
  { emoji:"🎮", text:"PILIHANKU", zone:"BISA",
    att:{ prompt:"Kalau main game, aku bisa…", options:[
      {emoji:"⏱️", text:"Atur waktu", good:true},
      {emoji:"🌙", text:"Main sampai larut", good:false},
      {emoji:"✅", text:"Istirahat dulu", good:true},
    ]}
  },
  { emoji:"📣", text:"ATURAN SEKOLAH", zone:"TIDAK",
    att:{ prompt:"Kalau ada aturan, aku bisa…", options:[
      {emoji:"👍", text:"Ikuti aturan", good:true},
      {emoji:"🙅", text:"Langgar saja", good:false},
      {emoji:"❓", text:"Tanya kalau bingung", good:true},
    ]}
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

let picked = false; // untuk mode tap kartu (HP)

// ====== UTIL ======
function pad(n){ return String(n).padStart(2,"0"); }

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

  const cardEl     = document.getElementById("situationCard");
  const sitEmojiEl = document.getElementById("sitEmoji");
  const sitTextEl  = document.getElementById("sitText");
  const sitMiniEl  = document.getElementById("sitMini");

  const zoneBisa  = document.getElementById("zoneBisa");
  const zoneTidak = document.getElementById("zoneTidak");

  const attitudePanel = document.getElementById("attitudePanel");
  const attOptionsEl  = document.getElementById("attOptions");

  if (!introEl || !gameEl || !namaInput || !umurInput || !sekolahInput || !btnMulai ||
      !timerEl || !scoreEl || !roundEl || !hintEl || !feedbackEl ||
      !cardEl || !sitEmojiEl || !sitTextEl || !zoneBisa || !zoneTidak || !attitudePanel || !attOptionsEl) {
    alert("Ada elemen HTML yang tidak ketemu. Cek id level4.html kamu.");
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
    feedbackEl.style.opacity = "1";
    feedbackEl.style.visibility = "visible";
    feedbackEl.style.transform = "none";
  }

  function setHint(type, text){
    hintEl.classList.remove("good","bad");
    if (type) hintEl.classList.add(type);
    hintEl.textContent = text;
  }

  function setRoundTitle(){
    roundEl.textContent = `Soal ${idx+1} / ${TOTAL}`;
  }

  function hideAttitude(){
    attitudePanel.classList.add("hidden");
    attOptionsEl.innerHTML = "";
  }

  function showAttitude(q, afterPickCb){
    // tampilkan panel sikap (3 tombol besar)
    attitudePanel.classList.remove("hidden");
    attOptionsEl.innerHTML = "";

    const title = attitudePanel.querySelector(".att-title");
    if (title) title.textContent = q.att?.prompt || "Aku bisa pilih sikap:";

    (q.att?.options || []).forEach((opt) => {
      const btn = document.createElement("button");
      btn.type = "button";
      btn.className = "att-btn";
      btn.innerHTML = `<div class="emo">${opt.emoji}</div><div class="txt">${opt.text}</div>`;
      btn.addEventListener("click", () => afterPickCb(opt, btn));
      attOptionsEl.appendChild(btn);
    });
  }

  function setQuestion(){
    const q = QUESTIONS[idx];

    lockInput = false;
    picked = false;

    setRoundTitle();
    resetFeedback();
    hideAttitude();

    sitEmojiEl.textContent = q.emoji;
    sitTextEl.textContent  = q.text;
    sitMiniEl.textContent  = "Tarik atau tap, lalu pilih lingkaran";

    setHint(null, "Tarik kartu ke lingkaran yang benar");

    // reset zone state
    zoneBisa.classList.remove("over");
    zoneTidak.classList.remove("over");

    soalStart = Date.now();
  }

  function finishLevel(alasan){
    if (ended) return;
    ended = true;
    clearInterval(timerId);

    const nama    = localStorage.getItem("ek_nama") || "";
    const umur    = localStorage.getItem("ek_umur") || "";
    const sekolah = localStorage.getItem("ek_sekolah") || "";

    localStorage.setItem("ek_level4_skor", String(score));
    localStorage.setItem("ek_level4_selesai", "1");
    localStorage.setItem("ek_level4_alasan", alasan || "Selesai");

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

    // congrats4 nanti belakangan
    window.location.href = "./index.html?" + qs.toString();
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

  function logToGAS(soal, emosiText, waktuRespon){
    const nama    = localStorage.getItem("ek_nama") || "";
    const umur    = localStorage.getItem("ek_umur") || "";
    const sekolah = localStorage.getItem("ek_sekolah") || "";

    sendRekapToGAS({
      level: LEVEL,
      nama,
      umur,
      sekolah,
      soal,
      emosi: emosiText,
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

  function handleDrop(zone){
    if (ended || lockInput) return;
    lockInput = true;

    const q = QUESTIONS[idx];
    const benar = (zone === q.zone);

    const waktuRespon = ((Date.now() - soalStart) / 1000).toFixed(2);

    // rekap utama: klasifikasi kontrol
    const status = benar ? "BENAR" : "SALAH";
    logToGAS(idx + 1, `KONTROL:${q.text} -> ${zone} (${status})`, waktuRespon);

    // feedback klasifikasi
    resetFeedback();
    feedbackEl.classList.add(benar ? "good" : "bad");
    feedbackEl.textContent = benar ? "✅ Tepat!" : "❌ Coba lagi ya 🙂";

    setHint(benar ? "good" : "bad", benar ? "Bagus! lanjut ya 👇" : "Pelan-pelan, yuk coba lagi 👇");

    // kalau salah: unlock setelah sebentar (anak boleh ulang)
    if (!benar){
      shake(zone === "BISA" ? zoneBisa : zoneTidak);
      setTimeout(() => {
        lockInput = false;
        resetFeedback();
        setHint(null, "Tarik kartu ke lingkaran yang benar");
      }, 900);
      return;
    }

    // kalau benar dan zone "TIDAK": munculkan sikap bijak (bonus skor)
    if (q.zone === "TIDAK" && q.att){
      setTimeout(() => {
        showAttitude(q, (opt, btn) => {
          // nilai sikap
          const good = !!opt.good;
          btn.classList.add(good ? "good" : "bad");

          // bonus kecil kalau pilih sikap baik
          if (good) score += 1;
          renderScore();

          const waktu2 = ((Date.now() - soalStart) / 1000).toFixed(2);
          logToGAS(idx + 1, `SIKAP:${q.text} -> ${opt.text} (${good ? "BAIK" : "KURANG"})`, waktu2);

          setHint(good ? "good" : "bad", good ? "Mantap! sikapnya keren 😄" : "Yuk pilih yang bikin tenang 🌿");
          setTimeout(() => nextQuestion(), 900);
        });
      }, 600);
      return;
    }

    // kalau benar dan zone "BISA": langsung lanjut
    score += 1;
    renderScore();
    flashOk(zone === "BISA" ? zoneBisa : zoneTidak);

    setTimeout(() => nextQuestion(), FEEDBACK_DELAY_MS);
  }

  // ====== Interaksi drag/tap ======
  cardEl.addEventListener("dragstart", (e) => {
    if (ended || lockInput) return;
    e.dataTransfer.setData("text/plain", "CARD");
  });

  // tap kartu (HP) → mode picked
  cardEl.addEventListener("click", () => {
    if (ended || lockInput) return;
    picked = true;
    setHint(null, "Sekarang tap salah satu lingkaran 👇");
    cardEl.classList.add("picked");
  });

  cardEl.addEventListener("touchstart", (e) => {
    if (ended || lockInput) return;
    e.preventDefault();
    picked = true;
    setHint(null, "Sekarang tap salah satu lingkaran 👇");
    cardEl.classList.add("picked");
  }, { passive:false });

  function bindZone(zoneEl){
    zoneEl.addEventListener("dragover", (e) => {
      e.preventDefault();
      zoneEl.classList.add("over");
    });

    zoneEl.addEventListener("dragleave", () => {
      zoneEl.classList.remove("over");
    });

    zoneEl.addEventListener("drop", (e) => {
      e.preventDefault();
      zoneEl.classList.remove("over");
      if (ended || lockInput) return;

      const zone = zoneEl.dataset.zone;
      cardEl.classList.remove("picked");
      picked = false;
      handleDrop(zone);
    });

    // tap zone (HP)
    zoneEl.addEventListener("click", () => {
      if (ended || lockInput) return;
      if (!picked){
        setHint("bad", "Tap kartunya dulu ya 🙂");
        shake(zoneEl);
        return;
      }
      const zone = zoneEl.dataset.zone;
      cardEl.classList.remove("picked");
      picked = false;
      handleDrop(zone);
    });

    zoneEl.addEventListener("touchstart", (e) => {
      if (ended || lockInput) return;
      e.preventDefault();
      if (!picked){
        setHint("bad", "Tap kartunya dulu ya 🙂");
        shake(zoneEl);
        return;
      }
      const zone = zoneEl.dataset.zone;
      cardEl.classList.remove("picked");
      picked = false;
      handleDrop(zone);
    }, { passive:false });
  }

  bindZone(zoneBisa);
  bindZone(zoneTidak);

  // ====== Start Game ======
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
    picked = false;

    renderScore();
    setQuestion();
    startTimer();
  }

  btnMulai.addEventListener("click", startGame);
  if (btnSelesai) btnSelesai.addEventListener("click", () => finishLevel("Diselesaikan manual"));

  renderTimer();
  renderScore();
  resetFeedback();
});
