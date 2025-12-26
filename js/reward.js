(() => {
  const KEY_UNLOCK = "gesya_unlocked";

  // keamanan: kalau belum unlock PIN, balik
  if (localStorage.getItem(KEY_UNLOCK) !== "1") {
    window.location.href = "index.html";
    return;
  }

  function isAllLevelDone(){
    for (let i = 1; i <= 6; i++){
      const done = localStorage.getItem(`ek_level${i}_selesai`);
      if (done !== "1") return false;
    }
    return true;
  }

  if (!isAllLevelDone()){
    window.location.href = "index.html";
    return;
  }

  // ===== Identitas =====
  const nama = (localStorage.getItem("ek_nama") || "").trim();
  const umur = (localStorage.getItem("ek_umur") || "").trim();
  const sekolah = (localStorage.getItem("ek_sekolah") || "").trim();

  const elNama = document.getElementById("cNama");
  const elUmur = document.getElementById("cUmur");
  const elSekolah = document.getElementById("cSekolah");

  if (elNama) elNama.textContent = nama ? nama.toUpperCase() : "TEMAN";
  if (elUmur) elUmur.textContent = umur ? `${umur} tahun` : "-";
  if (elSekolah) elSekolah.textContent = sekolah ? sekolah.toUpperCase() : "-";

  // ===== Skor tiap level =====
  const s1 = parseInt(localStorage.getItem("ek_level1_skor") || "0", 10);
  const s2 = parseInt(localStorage.getItem("ek_level2_skor") || "0", 10);
  const s3 = parseInt(localStorage.getItem("ek_level3_skor") || "0", 10);
  const s4 = parseInt(localStorage.getItem("ek_level4_skor") || "0", 10);
  const s5 = parseInt(localStorage.getItem("ek_level5_skor") || "0", 10);
  const s6 = parseInt(localStorage.getItem("ek_level6_skor") || "0", 10);

  // bintang 5 (mapping aman)
  function toStars(score){
    let n = 0;
    if (score <= 0) n = 0;
    else if (score <= 2) n = 1;
    else if (score <= 5) n = 2;
    else if (score <= 8) n = 3;
    else if (score <= 11) n = 4;
    else n = 5;

    const on = "★".repeat(n);
    const off = "★".repeat(5-n);
    return `<span class="on">${on}</span><span class="off">${off}</span>`;
  }

  const map = [
    ["star1", s1],
    ["star2", s2],
    ["star3", s3],
    ["star4", s4],
    ["star5", s5],
    ["star6", s6],
  ];

  map.forEach(([id, val]) => {
    const el = document.getElementById(id);
    if (el) el.innerHTML = toStars(val);
  });

  // tanggal
  const elDate = document.getElementById("cDate");
  const now = new Date();
  const tgl = now.toLocaleDateString("id-ID", { day:"2-digit", month:"long", year:"numeric" });
  if (elDate) elDate.textContent = `📅 Tanggal: ${tgl}`;

  // confetti
  const confetti = document.getElementById("confetti");
  if (confetti){
    const colors = ["#ffb703","#3b82f6","#10b981","#ef4444","#a855f7","#f59e0b"];
    for (let i=0; i<40; i++){
      const p = document.createElement("i");
      p.style.left = (Math.random()*100) + "vw";
      p.style.animationDuration = (4 + Math.random()*4.5) + "s";
      p.style.animationDelay = (Math.random()*2.2) + "s";
      p.style.width  = (7 + Math.random()*7) + "px";
      p.style.height = (10 + Math.random()*12) + "px";
      p.style.background = colors[Math.floor(Math.random()*colors.length)];
      p.style.opacity = (0.65 + Math.random()*0.35).toFixed(2);
      confetti.appendChild(p);
    }
  }
})();
