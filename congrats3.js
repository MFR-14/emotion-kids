function pickAvatarByName(nama){
  const h = (nama?.trim()?.[0] || "🙂").toUpperCase();
  if ("ABCDE".includes(h)) return "🦁";
  if ("FGHIJ".includes(h)) return "🐼";
  if ("KLMNO".includes(h)) return "🦊";
  if ("PQRST".includes(h)) return "🐯";
  return "⭐";
}

function spawnConfetti(){
  const wrap = document.getElementById("confetti");
  if (!wrap) return;

  const colors = ["#ffb703","#ffd27d","#2b3a55","#8ecae6","#90be6d","#f94144"];
  for (let i=0;i<80;i++){
    const d = document.createElement("div");
    d.className = "piece";
    d.style.left = Math.random()*100 + "vw";
    d.style.background = colors[Math.floor(Math.random()*colors.length)];
    d.style.animationDuration = (2 + Math.random()*2) + "s";
    wrap.appendChild(d);
    setTimeout(()=>d.remove(), 5000);
  }
}

window.addEventListener("DOMContentLoaded", () => {
  const nama   = localStorage.getItem("ek_nama") || "Teman";
  const sesi   = localStorage.getItem("ek_sesi") || "-";
  const skor   = localStorage.getItem("ek_level3_skor") || "0";
  const alasan = localStorage.getItem("ek_level3_alasan") || "Level 3 selesai!";

  document.getElementById("cgName").textContent = nama.toUpperCase();
  document.getElementById("cgMeta").textContent = `Sesi ${sesi} • Skor ${skor}/8`;
  document.getElementById("cgAvatar").textContent = pickAvatarByName(nama);

  document.getElementById("cgMsg").innerHTML =
    `${alasan}<br>Terima kasih sudah bermain, ${nama}!<br>Besok main lagi ya 😄`;

  spawnConfetti();
});
