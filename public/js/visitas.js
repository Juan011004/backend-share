document.addEventListener("DOMContentLoaded", () => {
  const token = localStorage.getItem("token");

  if (!token) {
    window.location.href = "/login";
    return;
  }

  fetch("/api/visitas-hoy", {
    headers: {
      Authorization: "Bearer " + token,
    },
  })
    .then((res) => res.json())
    .then((visitas) => {
      const contenedor = document.getElementById("listaVisitas");

      visitas.forEach((v) => {
        const div = document.createElement("div");
        div.className = "visita";

        div.innerHTML = `
          <h3>${v.CLIENTE}</h3>
          <p>Código: ${v.codigoclientedestinatario}</p>
          <p>📍 ${v.DIRECCIÓN}</p>
          <p>⏱ ${v.Tiempo} | 📝 ${v.tareas} tareas</p>
        `;

        div.onclick = () => {
          localStorage.setItem("pocSeleccionado", JSON.stringify(v));
          window.location.href = "/poc";
        };

        contenedor.appendChild(div);
      });
    })
    .catch((err) => console.error(err));
});
