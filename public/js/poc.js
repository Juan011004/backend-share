document.addEventListener("DOMContentLoaded", () => {
  const token = localStorage.getItem("token");
  const poc = JSON.parse(localStorage.getItem("pocSeleccionado"));

  if (!token || !poc) {
    window.location.href = "/visitas";
    return;
  }

  const info = document.getElementById("infoBasica");

  info.innerHTML = `
    <h3>${poc.CLIENTE}</h3>
<div class="dato">Código: <span>${poc.codigoclientedestinatario}</span></div>
<div class="dato">Dirección: <span>${poc.DIRECCIÓN}</span></div>
<div class="dato">Tiempo visita: <span>${poc.Tiempo}</span></div>
  `;
  fetch(`/api/visita-activa/${poc.codigoclientedestinatario}`, {
    headers: { Authorization: "Bearer " + token },
  })
    .then((res) => res.json())
    .then((data) => {
      console.log("Hora inicio:", data.hora_inicio);
      if (!data.activa) return;

      document.getElementById("btnIniciar").style.display = "none";

      const inicio = new Date(data.hora_inicio);

      setInterval(() => {
        const ahora = new Date();
        const segundos = Math.floor((ahora - inicio) / 1000);

        const horas = String(Math.floor(segundos / 3600)).padStart(2, "0");
        const minutos = String(Math.floor((segundos % 3600) / 60)).padStart(
          2,
          "0",
        );
        const seg = String(segundos % 60).padStart(2, "0");

        document.getElementById("timer").textContent =
          `${horas}:${minutos}:${seg}`;
      }, 1000);
    });

  document.getElementById("btnIniciar").onclick = () => {
    navigator.geolocation.getCurrentPosition(
      (position) => {
        fetch("/api/iniciar-visita", {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            Authorization: "Bearer " + token,
          },
          body: JSON.stringify({
            codigo_cliente: poc.codigoclientedestinatario,
            latitud: position.coords.latitude,
            longitud: position.coords.longitude,
          }),
        })
          .then((res) => res.json())
          .then(() => {
            window.location.href = "/tareas";
          });
      },
      () => {
        alert("No se pudo obtener ubicación");
      },
    );
  };
});
