document.addEventListener("DOMContentLoaded", () => {
  const token = localStorage.getItem("token");
  const poc = JSON.parse(localStorage.getItem("pocSeleccionado"));
  const btn = document.getElementById("btnIniciar");

  if (!token || !poc) {
    window.location.href = "/visitas";
    return;
  }

  // Mostrar info básica
  const info = document.getElementById("infoBasica");
  info.innerHTML = `
    <h3>${poc.CLIENTE}</h3>
    <div class="dato">Código: <span>${poc.codigoclientedestinatario}</span></div>
    <div class="dato">Dirección: <span>${poc.DIRECCIÓN}</span></div>
    <div class="dato">Tiempo visita: <span>${poc.Tiempo}</span></div>
  `;

  // Función para iniciar timer
  function startTimer(horaInicio) {
    const inicio = new Date(horaInicio.replace(" ", "T"));
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
  }

  // Consultar si ya hay visita activa
  fetch(`/api/visita-activa/${poc.codigoclientedestinatario}`, {
    headers: { Authorization: "Bearer " + token },
  })
    .then((res) => res.json())
    .then((data) => {
      if (data.activa) {
        btn.textContent = "Volver a tareas";
        startTimer(data.hora_inicio);
      } else {
        btn.textContent = "Iniciar visita";
      }

      btn.style.display = "block";

      // Click del botón
      btn.onclick = () => {
        if (data.activa) {
          window.location.href = "/tareas";
          return;
        }

        // iniciar visita
        navigator.geolocation.getCurrentPosition((position) => {
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
            .then((resData) => {
              startTimer(resData.hora_inicio); // iniciar timer inmediatamente
              btn.textContent = "Volver a tareas";
              window.location.href = "/tareas";
            });
        });
      };
    });
});
