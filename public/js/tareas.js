document.addEventListener("DOMContentLoaded", () => {
  const lista = document.getElementById("listaTareas");

  // Simulación de tareas (luego vendrán del backend)
  const tareas = [
    { id: 1, descripcion: "Verificar exhibición de cerveza" },
    { id: 2, descripcion: "Revisar precios visibles" },
    { id: 3, descripcion: "Validar material POP" },
  ];

  tareas.forEach((t) => {
    const div = document.createElement("div");
    div.className = "tarea";

    div.innerHTML = `
      <h4>${t.descripcion}</h4>

      <div class="acciones">
        <button class="foto">Tomar foto</button>
        <button class="justificar">Justificar</button>
      </div>

      <div class="estado" id="estado-${t.id}">
        Pendiente
      </div>
    `;

    // Tomar foto (demo)
    div.querySelector(".foto").onclick = () => {
      document.getElementById(`estado-${t.id}`).textContent = "📸 Foto tomada";
    };

    // Justificar
    div.querySelector(".justificar").onclick = () => {
      const motivo = prompt(
        "Motivo por el cual no se puede completar la tarea:",
      );

      if (motivo) {
        document.getElementById(`estado-${t.id}`).textContent =
          "📝 Justificada";
      }
    };

    lista.appendChild(div);
  });

  // Cerrar visita
  document.getElementById("btnCerrar").onclick = () => {
    const poc = JSON.parse(localStorage.getItem("pocSeleccionado"));

    navigator.geolocation.getCurrentPosition((position) => {
      fetch("/api/cerrar-visita", {
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
      }).then(() => {
        window.location.href = "/";
      });
    });
  };
});
