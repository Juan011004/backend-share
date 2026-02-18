console.log("Dashboard cargado");

document.getElementById("visitasHoy").textContent = 8; // Simulado

document.getElementById("cardVisitas").onclick = () => {
  window.location.href = "/visitas.html";
};

document.getElementById("btnPocs").onclick = () => {
  window.location.href = "/visitas.html";
};

document.getElementById("btnLogout").onclick = () => {
  localStorage.clear();
  window.location.href = "/login.html";
};

document.getElementById("btnSync").onclick = () => {
  alert("🔄 Sincronizando datos...");
};
