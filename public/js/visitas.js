document.addEventListener("DOMContentLoaded", () => {
  const usuario = localStorage.getItem("usuario");
  const token = localStorage.getItem("token");

  if (!usuario || !token) {
    window.location.href = "/login";
    return;
  }

  const visitasDemo = [
    {
      nombre: "Tienda La Esquina",
      codigo: "POC-001",
      direccion: "Cra 12 #45-33",
      tiempo: "25 min",
      tareas: 5,
      estado: "pendiente",
    },
    {
      nombre: "Supermercado El Ahorro",
      codigo: "POC-002",
      direccion: "Cl 80 #10-21",
      tiempo: "30 min",
      tareas: 3,
      estado: "realizada",
    },
  ];

  const contenedor = document.getElementById("listaVisitas");

  visitasDemo.forEach((v) => {
    const div = document.createElement("div");
    div.className = `visita ${v.estado === "realizada" ? "realizada" : ""}`;

    div.innerHTML = `
      <h3>${v.nombre}</h3>
      <p>Código: ${v.codigo}</p>
      <p>📍 ${v.direccion}</p>
      <p>⏱ ${v.tiempo} | 📝 ${v.tareas} tareas</p>
    `;

    div.onclick = () => {
      localStorage.setItem("pocSeleccionado", JSON.stringify(v));
      window.location.href = "/poc";
    };

    contenedor.appendChild(div);
  });
});
