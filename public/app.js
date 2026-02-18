async function login() {
  const usuario = document.getElementById("usuario").value;
  const password = document.getElementById("password").value;

  const res = await fetch("/login", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ usuario, password }),
  });

  const data = await res.json();

  if (res.ok) {
    localStorage.setItem("usuario", data.usuario);
    localStorage.setItem("nombre", data.nombre);
    localStorage.setItem("token", data.token);

    window.location.href = "/index.html";
  } else {
    alert(data.mensaje);
  }
}
window.addEventListener("online", async () => {
  console.log("📶 Internet restaurado, sincronizando...");

  const pendientes = await obtenerPendientes();
  if (pendientes.length === 0) return;

  for (const item of pendientes) {
    await fetch("/api/tareas", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(item),
    });
  }

  await limpiarPendientes();
  alert("✅ Datos sincronizados");
});
