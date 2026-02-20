document.addEventListener("DOMContentLoaded", () => {
  const token = localStorage.getItem("token");

  if (!token) {
    window.location.href = "/login";
    return;
  }

  fetch("/api/visitas-hoy", {
    headers: { Authorization: "Bearer " + token },
  })
    .then((res) => res.json())
    .then((visitas) => {
      const contenedor = document.getElementById("listaVisitas");

      // Ordenar: pendientes arriba
      visitas.sort((a, b) => {
        if (a.estado === "CERRADA") return 1;
        if (b.estado === "CERRADA") return -1;
        return 0;
      });

      visitas.forEach((v) => {
        const estado = v.estado === "CERRADA" ? "COMPLETADA" : "PENDIENTE";
        const claseEstado =
          v.estado === "CERRADA" ? "estado-verde" : "estado-azul";

        const opacidad = v.estado === "CERRADA" ? "0.6" : "1";

        const div = document.createElement("div");
        div.className = "visita";
        div.style.opacity = opacidad;

        div.innerHTML = `
        <div class="header-visita">
          <h3>${v.CLIENTE}</h3>
          <span class="badge ${claseEstado}">${estado}</span>
        </div>
        <p>Código: ${v.codigoclientedestinatario}</p>
        <p>📍 ${v.DIRECCIÓN}</p>
        <p>⏱ ${v.Tiempo} | 📝 ${v.tareas} tareas</p>
      `;

        div.onclick = () => {
          if (v.estado === "CERRADA") {
            alert("Esta visita ya fue completada hoy.");
            return;
          }

          localStorage.setItem("pocSeleccionado", JSON.stringify(v));
          window.location.href = "/poc";
        };

        contenedor.appendChild(div);
      });
    })
    .catch((err) => console.error(err));
});
