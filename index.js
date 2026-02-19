console.log("🚀 Ejecutando index.js");

require("dotenv").config();
const bcrypt = require("bcrypt");
const jwt = require("jsonwebtoken");
const verificarToken = require("./middleware/auth");
console.log("Tipo verificarToken:", typeof verificarToken);

const express = require("express");
const cors = require("cors");
const multer = require("multer");
const { v4: uuidv4 } = require("uuid");
const fs = require("fs");
const path = require("path");
const { createClient } = require("@supabase/supabase-js");

const supabase = createClient(
  process.env.SUPABASE_URL,
  process.env.SUPABASE_ANON_KEY,
);

const app = express();
const PORT = process.env.PORT || 3000;

app.use(cors());
app.use(express.json());
app.use("/uploads", express.static("uploads"));
app.use(express.static("public"));

const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    cb(null, "uploads/fotos/");
  },
  filename: (req, file, cb) => {
    const uniqueName = uuidv4() + path.extname(file.originalname);
    cb(null, uniqueName);
  },
});

const upload = multer({ storage });

const tareasPath = path.join(__dirname, "data", "tareas.json");
const reportesPath = path.join(__dirname, "data", "reportes.json");

app.get("/", (req, res) =>
  res.sendFile(path.join(__dirname, "public/index.html")),
);
app.get("/login", (req, res) =>
  res.sendFile(path.join(__dirname, "public/login.html")),
);
app.get("/tareas", (req, res) =>
  res.sendFile(path.join(__dirname, "public/tareas.html")),
);
app.get("/visitas", (req, res) =>
  res.sendFile(path.join(__dirname, "public/visitas.html")),
);
app.get("/poc", (req, res) =>
  res.sendFile(path.join(__dirname, "public/poc.html")),
);

app.get("/tareas/:codigo", (req, res) => {
  const codigo = req.params.codigo;
  const tareas = JSON.parse(fs.readFileSync(tareasPath, "utf8"));

  const resultado = tareas.filter(
    (t) => t.codigo_cliente === codigo && t.estado === "pendiente",
  );

  res.json(resultado);
});

app.post("/reporte", (req, res) => {
  const { codigo_cliente, usuario, comentarios, latitud, longitud, foto_url } =
    req.body;

  const reportes = JSON.parse(fs.readFileSync(reportesPath, "utf8"));

  const nuevoReporte = {
    id: Date.now(),
    codigo_cliente,
    usuario,
    comentarios,
    latitud,
    longitud,
    foto_url,
    fecha: new Date().toISOString(),
  };

  reportes.push(nuevoReporte);
  fs.writeFileSync(reportesPath, JSON.stringify(reportes, null, 2));

  res.json({
    mensaje: "Reporte guardado con éxito (archivo local)",
    id: nuevoReporte.id,
  });
});

app.post("/reporte-con-foto", upload.single("foto"), (req, res) => {
  try {
    const { codigo_cliente, usuario, comentarios, latitud, longitud } =
      req.body;

    const foto_url = req.file ? `/uploads/fotos/${req.file.filename}` : null;

    const reportes = JSON.parse(fs.readFileSync(reportesPath, "utf8"));

    const nuevoReporte = {
      id: Date.now(),
      codigo_cliente,
      usuario,
      comentarios,
      latitud,
      longitud,
      foto_url,
      fecha: new Date().toISOString(),
    };

    reportes.push(nuevoReporte);
    fs.writeFileSync(reportesPath, JSON.stringify(reportes, null, 2));

    res.json({
      mensaje: "Reporte con foto guardado correctamente",
      reporte: nuevoReporte,
    });
  } catch (error) {
    console.log("ERROR REAL:", error);
    res.status(500).json({ error: "Error guardando el reporte" });
  }
});

app.post("/crear-usuario", async (req, res) => {
  const { usuario, nombre, password } = req.body;

  if (!usuario || !password) {
    return res.status(400).json({ error: "Faltan datos" });
  }

  const passwordHash = await bcrypt.hash(password, 10);

  const { data, error } = await supabase.from("usuarios").insert([
    {
      usuario,
      nombre,
      password: passwordHash,
    },
  ]);

  if (error) {
    console.error(error);
    return res.status(500).json({ error: "Error creando usuario" });
  }

  res.json({ mensaje: "Usuario creado correctamente" });
});

app.post("/login", async (req, res) => {
  const { usuario, password } = req.body;

  if (!usuario || !password) {
    return res.status(400).json({
      mensaje: "Usuario y password son obligatorios",
    });
  }

  const { data, error } = await supabase
    .from("usuarios")
    .select("*")
    .eq("usuario", usuario)
    .single();

  if (error || !data) {
    return res.status(401).json({ mensaje: "Usuario no existe" });
  }

  if (password !== data.password) {
    return res.status(401).json({ mensaje: "Password incorrecto" });
  }

  const token = jwt.sign(
    {
      id: data.id,
      usuario: data.usuario,
      nombre: data.nombre,
    },
    process.env.JWT_SECRET,
    { expiresIn: "8h" },
  );

  res.json({
    mensaje: "Login exitoso",
    token,
    usuario: data.usuario,
    nombre: data.nombre,
  });
});

app.get("/perfil", verificarToken, (req, res) => {
  res.json({
    mensaje: "Ruta protegida",
    usuario: req.usuario,
  });
});

app.listen(PORT, () => {
  console.log(`Servidor corriendo en http://localhost:${PORT}`);
});
