(() => {
  "use strict";

  // =========================
  // KONFIG
  // =========================
  const KEY_UNLOCK = "gesya_unlocked";
  const MAX_LEVEL = 6;

  // =========================
  // HELPER
  // =========================
  function goHome(){
    window.location.href = "index.html";
  }

  function isAllLevelDone(){
    for (let i = 1; i <= MAX_LEVEL; i++){
      const done = localStorage.getItem(`ek_level${i}_selesai`);
      if (done !== "1") return false;
    }
    return true;
  }

  function getInt(key){
    const v = parseInt(localStorage.getItem(key) || "0", 10);
    return Number.isFinite(v) ? v : 0;
  }

  // Konversi skor -> 5 bintang (mapping aman)
  function toStars(score){
    let n = 0;
    if (score <= 0) n = 0;
    else if (score <= 2) n = 1;
    else if (score <= 5) n = 2;
    else if (score <= 8) n = 3;
    else if (score <= 11) n = 4;
    else n = 5;

    const on = "★".repeat(n);
    const off = "★".repeat(5 - n);
    return `<span class="on">${on}</span><span class="off">${off}</span>`;
  }

  function setText(id, text){
    const el = document.getElementById(id);
    if (el) el.textContent = text;
  }

  function setHTML(id, html){
    const el = document.getElementById(id);
    if (el) el.innerHTML = html;
  }

  // =========================
  // GUARD / PROTEKSI
  // =========================
  if (localStorage.getItem(KEY_UNLOCK) !== "1") {
    goHome();
    return;
  }

  if (!isAllLevelDone()){
    goHome();
    return;
  }

  // =========================
  // RENDER IDENTITAS
  // =========================
  const nama = (localStorage.getItem("ek_nama") || "").trim();
  const umur = (localStorage.getItem("ek_umur") || "").trim();
  const sekolah = (localStorage.getItem("ek_sekolah") || "").trim();

  setText("cNama", nama ? nama.toUpperCase() : "TEMAN");
  setText("cUmur", umur ? `${umur} tahun` : "-");
  setText("cSekolah", sekolah ? sekolah.toUpperCase() : "-");

  // =========================
  // RENDER BINTANG PER LEVEL
  // =========================
  const s1 = getInt("ek_level1_skor");
  const s2 = getInt("ek_level2_skor");
  const s3 = getInt("ek_level3_skor");
  const s4 = getInt("ek_level4_skor");
  const s5 = getInt("ek_level5_skor");
  const s6 = getInt("ek_level6_skor");

  setHTML("star1", toStars(s1));
  setHTML("star2", toStars(s2));
  setHTML("star3", toStars(s3));
  setHTML("star4", toStars(s4));
  setHTML("star5", toStars(s5));
  setHTML("star6", toStars(s6));

  // =========================
  // TANGGAL
  // =========================
  const now = new Date();
  const tgl = now.toLocaleDateString("id-ID", { day:"2-digit", month:"long", year:"numeric" });
  setText("cDate", `📅 Tanggal: ${tgl}`);

  // =========================
  // CONFETTI
  // =========================
  function spawnConfetti(){
    const confetti = document.getElementById("confetti");
    if (!confetti) return;

    const colors = ["#ffb703","#3b82f6","#10b981","#ef4444","#a855f7","#f59e0b"];
    const count = 40;

    // bersihin dulu kalau ada (biar gak numpuk kalau reload)
    confetti.innerHTML = "";

    for (let i = 0; i < count; i++){
      const p = document.createElement("i");

      p.style.left = (Math.random() * 100) + "vw";
      p.style.animationDuration = (4 + Math.random() * 4.5) + "s";
      p.style.animationDelay = (Math.random() * 2.2) + "s";
      p.style.width  = (7 + Math.random() * 7) + "px";
      p.style.height = (10 + Math.random() * 12) + "px";
      p.style.background = colors[Math.floor(Math.random() * colors.length)];
      p.style.opacity = (0.65 + Math.random() * 0.35).toFixed(2);

      confetti.appendChild(p);
    }
  }

  spawnConfetti();

  // =========================
  // TOMBOL SIMPAN PDF / CETAK
  // =========================
  // NOTE: Browser tidak mengizinkan "auto download PDF" native tanpa dialog print.
  // Solusi paling aman: buka dialog, user pilih "Save as PDF / Microsoft Print to PDF".
  window.openSavePDF = function(){
    window.print();
  };

})();
