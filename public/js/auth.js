const usuario = localStorage.getItem("usuario");

if (!usuario) {
  window.location.href = "/login";
}
