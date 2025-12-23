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
  const count = 90;

  for (let i=0;i<count;i++){
    const d = document.createElement("div");
    d.className = "piece";
    d.style.left = (Math.random()*100) + "vw";
    d.style.background = colors[Math.floor(Math.random()*colors.length)];
    d.style.animationDuration = (2.2 + Math.random()*2.0) + "s";
    d.style.animationDelay = (Math.random()*0.5) + "s";
    d.style.transform = `translateY(0) rotate(${Math.random()*360}deg)`;
    wrap.appendChild(d);
    setTimeout(()=> d.remove(), 5200);
  }
}

window.addEventListener("DOMContentLoaded", ()=>{
  const url = new URL(window.location.href);
  const p = url.searchParams;

  // ✅ Ambil dari URL dulu
  const nama   = p.get("nama")   || localStorage.getItem("ek_nama") || "Teman";
  const sesi   = p.get("sesi")   || localStorage.getItem("ek_sesi") || "-";
  const skor   = p.get("skor")   || localStorage.getItem("ek_level1_skor") || "0";
  const alasan = p.get("alasan") || localStorage.getItem("ek_level1_alasan") || "Selesai";

  const cgName   = document.getElementById("cgName");
  const cgMeta   = document.getElementById("cgMeta");
  const cgAvatar = document.getElementById("cgAvatar");
  const cgMsg    = document.getElementById("cgMsg");

  if (cgName) cgName.textContent = nama.toUpperCase();
  if (cgMeta) cgMeta.textContent = `Sesi ${sesi} • Skor ${skor}/8`;
  if (cgAvatar) cgAvatar.textContent = pickAvatarByName(nama);

  const msg =
`${alasan}
Terima kasih sudah bermain, ${nama}!
Besok main lagi biar makin jago ya 😄`;
  if (cgMsg) cgMsg.textContent = msg;

  spawnConfetti();
});
