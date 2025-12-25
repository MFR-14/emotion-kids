function pickAvatarByName(nama){
  const first = (nama && nama.trim() ? nama.trim()[0] : "⭐").toUpperCase();
  if ("ABCDE".includes(first)) return "🦁";
  if ("FGHIJ".includes(first)) return "🐼";
  if ("KLMNO".includes(first)) return "🦊";
  if ("PQRST".includes(first)) return "🐯";
  return "⭐";
}

function spawnConfetti(){
  const wrap = document.getElementById("confetti");
  if (!wrap) return;

  const colors = ["#ffb703","#ffd27d","#2b3a55","#8ecae6","#90be6d","#f94144"];
  const count = 95;

  for (let i=0;i<count;i++){
    const d = document.createElement("div");
    d.className = "piece";
    d.style.left = (Math.random()*100) + "vw";
    d.style.background = colors[Math.floor(Math.random()*colors.length)];
    d.style.animationDuration = (2.2 + Math.random()*2.1) + "s";
    d.style.animationDelay = (Math.random()*0.5) + "s";
    d.style.transform = "translateY(0) rotate(" + (Math.random()*360) + "deg)";
    wrap.appendChild(d);
    setTimeout(()=> d.remove(), 5600);
  }
}

function getValue(paramName, lsKey, fallback){
  const url = new URL(window.location.href);
  const vUrl = (url.searchParams.get(paramName) || "").trim();
  if (vUrl) return vUrl;

  const vLs = (localStorage.getItem(lsKey) || "").trim();
  if (vLs) return vLs;

  return fallback;
}

function buildMessage(alasan, nama, skor){
  // skor level4 kamu bisa lebih dari 8 karena ada bonus sikap
  const s = Number(skor);
  const tambahan = (Number.isFinite(s) && s >= 10)
    ? "Keren banget! Kamu sering pilih sikap yang menenangkan 🌿"
    : "Kamu sudah mulai fokus ke hal yang bisa kamu atur 🌱";

  return `${alasan}\nTerima kasih sudah bermain, ${nama}!\n${tambahan}`;
}

window.addEventListener("DOMContentLoaded", () => {
  const nama    = getValue("nama", "ek_nama", "Teman");
  const umur    = getValue("umur", "ek_umur", "-");
  const sekolah = getValue("sekolah", "ek_sekolah", "-");

  // dari URL: skor/alasan, fallback localStorage level4
  const skor   = getValue("skor", "ek_level4_skor", "0");
  const alasan = getValue("alasan", "ek_level4_alasan", "Selesai!");

  const elName = document.getElementById("cgName");
  const elMeta = document.getElementById("cgMeta");
  const elAva  = document.getElementById("cgAvatar");
  const elMsg  = document.getElementById("cgMsg");
  const foot   = document.getElementById("cgFootnote");

  if (elName) elName.textContent = nama.toUpperCase();
  if (elAva)  elAva.textContent  = pickAvatarByName(nama);

  if (elMeta){
    elMeta.textContent = `Umur ${umur} • ${sekolah} • Skor ${skor}`;
  }

  if (elMsg){
    elMsg.textContent = buildMessage(alasan, nama, skor);
  }

  if (foot){
    foot.textContent = "Tips: Kalau tidak bisa diubah, kamu tetap bisa memilih sikap yang baik 🙂";
  }

  spawnConfetti();
});
