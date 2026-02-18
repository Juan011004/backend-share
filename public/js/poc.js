document.addEventListener("DOMContentLoaded", () => {
  const token = localStorage.getItem("token");
  const poc = JSON.parse(localStorage.getItem("pocSeleccionado"));

  if (!token || !poc) {
    window.location.href = "/visitas";
    return;
  }

  const info = document.getElementById("infoBasica");

  info.innerHTML = `
    <h3>${poc.nombre}</h3>
    <div class="dato">Código: <span>${poc.codigo}</span></div>
    <div class="dato">Dirección: <span>${poc.direccion}</span></div>
    <div class="dato">Tiempo visita: <span>${poc.tiempo}</span></div>
    <div class="dato">Cantidad tareas: <span>${poc.tareas}</span></div>
  `;

  document.getElementById("btnIniciar").onclick = () => {
    localStorage.setItem("visitaActiva", "true");
    window.location.href = "/tareas";
  };
});
