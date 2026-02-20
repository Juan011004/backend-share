document.addEventListener("DOMContentLoaded", () => {
  const nombre = localStorage.getItem("nombre");
  const usuario = localStorage.getItem("usuario");
  const token = localStorage.getItem("token");

  if (!usuario || !token) {
    window.location.href = "/login";
    return;
  }

  const saludo = document.getElementById("saludo");
  saludo.textContent = `👋 Hola, ${nombre || usuario}`;

  fetch("/api/contador-visitas", {
    headers: {
      Authorization: "Bearer " + token,
    },
  })
    .then((res) => res.json())
    .then((data) => {
      document.getElementById("contadorVisitas").textContent =
        `${data.total} visitas programadas`;
    })
    .catch((err) => console.error(err));
  document.getElementById("contadorVisitas").textContent = visitasHoy;

  document.getElementById("btnVerVisitas").onclick = () => {
    window.location.href = "/visitas";
  };

  document.getElementById("btnSync").onclick = () => {
    alert("Sincronizando información...");
  };

  document.getElementById("logoutBtn").onclick = () => {
    localStorage.clear();
    window.location.href = "/login";
  };
});
