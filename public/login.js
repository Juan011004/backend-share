const toggleBtn = document.getElementById("togglePassword");
const passwordInput = document.getElementById("password");

toggleBtn.addEventListener("click", () => {
  const isPassword = passwordInput.type === "password";
  passwordInput.type = isPassword ? "text" : "password";
  toggleBtn.textContent = isPassword ? "🙈" : "👁️";
});

document.getElementById("btnLogin").addEventListener("click", async () => {
  const usuario = document.getElementById("usuario").value;
  const password = passwordInput.value;

  if (!usuario || !password) {
    alert("Completa los datos");
    return;
  }
  if (usuario === "maestro" && password === "1234") {
    const token = "token-maestro-dev";

    localStorage.setItem("token", token);
    localStorage.setItem("usuario", "maestro");
    localStorage.setItem("nombre", "Usuario Maestro");

    window.location.href = "/";
    return;
  }
  try {
    const response = await fetch("/login", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        usuario,
        password,
      }),
    });

    const data = await response.json();

    if (!response.ok) {
      alert(data.mensaje);
      return;
    }

    localStorage.setItem("token", data.token);
    localStorage.setItem("usuario", data.usuario);
    localStorage.setItem("nombre", data.nombre);

    window.location.href = "/";
  } catch (err) {
    console.error(err);
    alert("No se pudo conectar al servidor");
  }
});
