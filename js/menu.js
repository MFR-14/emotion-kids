// ============================
// GESYA MENU.JS (FULL)
// ============================

(() => {
  // ===== KONFIG =====
  const PIN_BENAR = "esya";               // ganti kalau mau
  const KEY_UNLOCK = "gesya_unlocked";

  // ===== AMBIL ELEMEN =====
  const gateOverlay = document.getElementById("gateOverlay");
  const pinStep     = document.getElementById("pinStep");
  const introStep   = document.getElementById("introStep");

  const input   = document.getElementById("pinInput");
  const btnPin  = document.getElementById("btnPin");
  const err     = document.getElementById("pinError");
  const btnLanjut = document.getElementById("btnLanjut");

  const btnReset = document.getElementById("btnReset");
  const progressNote = document.getElementById("progressNote");
  const btnReward = document.getElementById("btnReward");

  // Safety: kalau elemen inti gak ketemu, berhenti biar gak error liar
  if (!gateOverlay || !pinStep || !introStep) {
    console.error("GESYA: Elemen gateOverlay/pinStep/introStep tidak ditemukan. Cek id di HTML.");
    return;
  }

  // ============================
  // INTRO FX (WAH VERSION)
  // ============================
  function spawnIntroFX(){
    const fx = document.getElementById("introFx");
    if (!fx) return;

    fx.innerHTML = "";

    const STAR_COUNT = 14;
    for (let i = 0; i < STAR_COUNT; i++){
      const star = document.createElement("div");
      star.className = "fx-star";

      const angle = (Math.PI * 2) * (i / STAR_COUNT) + Math.random() * 0.4;
      const radius = 110 + Math.random() * 80;

      const x = Math.cos(angle) * radius;
      const y = Math.sin(angle) * radius * 0.7;

      star.style.setProperty("--x", `${x.toFixed(1)}px`);
      star.style.setProperty("--y", `${y.toFixed(1)}px`);
      star.style.setProperty("--s", (0.9 + Math.random()).toFixed(2));

      const colors = ["#ffb703", "#ffd27d", "#8ecae6", "#ffe7b6"];
      star.style.setProperty("--c", colors[Math.floor(Math.random() * colors.length)]);

      star.style.animationDelay = `${(Math.random() * 0.18).toFixed(2)}s`;
      fx.appendChild(star);
    }
  }

  // ============================
  // GATE FLOW: PIN -> INTRO -> MENU
  // ============================
  function showPin(){
    pinStep.style.display = "block";
    introStep.style.display = "none";
    gateOverlay.style.display = "flex";
    if (err) err.style.display = "none";

    setTimeout(() => input && input.focus(), 150);
  }

  function showIntro(){
    pinStep.style.display = "none";
    introStep.style.display = "block";
    gateOverlay.style.display = "flex";

    // efek wah tiap intro muncul
    spawnIntroFX();
  }

  function hideGate(){
    gateOverlay.style.display = "none";
  }

  function cekPin(){
    const val = (input?.value || "").trim();

    if (val === PIN_BENAR) {
      if (err) err.style.display = "none";
      localStorage.setItem(KEY_UNLOCK, "1");
      showIntro();
    } else {
      if (err) err.style.display = "block";
      if (input) {
        input.value = "";
        input.focus();
      }
    }
  }

  // Pasang event PIN (ini yang bikin PIN “bisa”)
  if (btnPin) btnPin.addEventListener("click", cekPin);
  if (input) input.addEventListener("keydown", (e) => {
    if (e.key === "Enter") cekPin();
  });

  // Lanjut ke menu
  if (btnLanjut) btnLanjut.addEventListener("click", hideGate);

  // Saat load: kalau belum unlock -> pin, kalau sudah -> intro (selalu)
  const unlocked = localStorage.getItem(KEY_UNLOCK) === "1";
  if (!unlocked) showPin();
  else showIntro();

  // ============================
  // MENU GAME (level)
  // ============================
  function goLevel(lvl){
    if (lvl >= 7) {
      alert("Level ini masih dikunci ya 😄");
      return;
    }
    window.location.href = `level${lvl}.html`;
  }

  function isAllLevelDone(){
    for (let i = 1; i <= 6; i++){
      const done = localStorage.getItem(`ek_level${i}_selesai`);
      if (done !== "1") return false;
    }
    return true;
  }

  function goReward(){
    if (!isAllLevelDone()){
      alert("Selesaikan dulu sampai Level 6 ya, baru sertifikatnya kebuka 😁");
      return;
    }
    window.location.href = "reward.html";
  }

  // Klik tombol level pakai data-lvl biar rapi (kalau masih pakai onclick di HTML, ini tetap aman)
  document.querySelectorAll(".lvl[data-lvl]").forEach(btn => {
    btn.addEventListener("click", () => {
      const lvl = parseInt(btn.getAttribute("data-lvl") || "0", 10);
      if (lvl) goLevel(lvl);
    });
  });

  // Tombol reward
  if (btnReward) {
    btnReward.addEventListener("click", () => goReward());
  }

  // ============================
  // PROGRES NOTE
  // ============================
  const s1 = parseInt(localStorage.getItem("ek_level1_skor") || "0", 10);
  const s2 = parseInt(localStorage.getItem("ek_level2_skor") || "0", 10);
  const s3 = parseInt(localStorage.getItem("ek_level3_skor") || "0", 10);
  const s4 = parseInt(localStorage.getItem("ek_level4_skor") || "0", 10);
  const s5 = parseInt(localStorage.getItem("ek_level5_skor") || "0", 10);
  const s6 = parseInt(localStorage.getItem("ek_level6_skor") || "0", 10);
  const total = s1 + s2 + s3 + s4 + s5 + s6;

  const nama = (localStorage.getItem("ek_nama") || "").trim();
  const umur = (localStorage.getItem("ek_umur") || "").trim();
  const sekolah = (localStorage.getItem("ek_sekolah") || "").trim();

  if (progressNote && (nama || umur || sekolah || total)) {
    const namaTampil = nama ? nama.toUpperCase() : "TEMAN";
    const umurTampil = umur ? `${umur} tahun` : "-";
    const sekolahTampil = sekolah || "-";
    progressNote.textContent = `Halo ${namaTampil}! Umur ${umurTampil} • Sekolah ${sekolahTampil} • Skor sementara ${total} ⭐`;
  }

  // Aktifkan reward kalau semua level selesai
  if (btnReward) {
    if (isAllLevelDone()){
      btnReward.disabled = false;
      btnReward.style.opacity = "1";
    } else {
      btnReward.disabled = true;
      btnReward.style.opacity = ".55";
    }
  }

  // ============================
  // RESET
  // ============================
  if (btnReset) {
    btnReset.addEventListener("click", () => {
      if (!confirm("Reset nama, umur, sekolah, dan semua skor?")) return;

      localStorage.removeItem("ek_nama");
      localStorage.removeItem("ek_umur");
      localStorage.removeItem("ek_sekolah");

      const keys = [
        "ek_level1_skor","ek_level2_skor","ek_level3_skor","ek_level4_skor","ek_level5_skor","ek_level6_skor",
        "ek_level1_selesai","ek_level2_selesai","ek_level3_selesai","ek_level4_selesai","ek_level5_selesai","ek_level6_selesai",
        "ek_level1_alasan","ek_level2_alasan","ek_level3_alasan","ek_level4_alasan","ek_level5_alasan","ek_level6_alasan"
      ];
      keys.forEach(k => localStorage.removeItem(k));

      // reset unlock biar minta PIN lagi
      localStorage.removeItem(KEY_UNLOCK);

      location.reload();
    });
  }

})();
