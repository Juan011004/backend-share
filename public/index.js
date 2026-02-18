document.addEventListener("DOMContentLoaded", () => {
  const nombre = localStorage.getItem("nombre");
  const usuario = localStorage.getItem("usuario");
  const token = localStorage.getItem("token");

  if (!usuario || !token) {
    window.location.href = "/login";
    return;
  }

  // Saludo
  const saludo = document.getElementById("saludo");
  saludo.textContent = `👋 Hola, ${nombre || usuario}`;

  // SIMULACIÓN de visitas (para demo)
  const visitasHoy = 8; // luego esto vendrá del backend
  document.getElementById("contadorVisitas").textContent = visitasHoy;

  // Botón ir a visitas
  document.getElementById("btnVerVisitas").onclick = () => {
    window.location.href = "/visitas";
  };

  // Botón sincronizar
  document.getElementById("btnSync").onclick = () => {
    alert("Sincronizando información...");
  };

  // Logout
  document.getElementById("logoutBtn").onclick = () => {
    localStorage.clear();
    window.location.href = "/login";
  };
});
