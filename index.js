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
const mysql = require("mysql2");

console.log("ENV TEST ==================");
console.log("DB_HOST:", process.env.DB_HOST);
console.log("DB_USER:", process.env.DB_USER);
console.log("DB_PASSWORD:", process.env.DB_PASSWORD ? "OK" : "VACÍO");
console.log("DB_NAME:", process.env.DB_NAME);
console.log("DB_PORT:", process.env.DB_PORT);
console.log("============================");

const app = express();
const PORT = process.env.PORT || 3000;

const db = mysql.createConnection({
  host: process.env.DB_HOST,
  user: process.env.DB_USER,
  password: process.env.DB_PASSWORD,
  database: process.env.DB_NAME,
  port: process.env.DB_PORT,
});

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
db.connect((err) => {
  if (err) {
    console.error("❌ Error conectando a MySQL:", err);
  } else {
    console.log("✅ Conectado a MySQL");
  }
});

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

  try {
    const passwordHash = await bcrypt.hash(password, 10);

    const sql = `
      INSERT INTO usuarios (usuario, nombre, password)
      VALUES (?, ?, ?)
    `;

    db.query(sql, [usuario, nombre, passwordHash], (err) => {
      if (err) {
        console.error(err);
        return res.status(500).json({ error: "Error creando usuario" });
      }

      res.json({ mensaje: "Usuario creado correctamente" });
    });
  } catch (error) {
    res.status(500).json({ error: "Error interno" });
  }
});

app.post("/login", (req, res) => {
  const { usuario, password } = req.body;

  if (!usuario || !password) {
    return res.status(400).json({
      mensaje: "Usuario y password son obligatorios",
    });
  }

  const sql = "SELECT * FROM usuarios WHERE usuario = ?";

  db.query(sql, [usuario], async (err, results) => {
    if (err) {
      console.error("Error MySQL:", err);
      return res.status(500).json({ mensaje: "Error servidor" });
    }

    if (results.length === 0) {
      return res.status(401).json({ mensaje: "Usuario no existe" });
    }

    const usuarioDB = results[0];

    if (password !== usuarioDB.password) {
      return res.status(401).json({ mensaje: "Password incorrecto" });
    }

    const token = jwt.sign(
      {
        id: usuarioDB.id,
        usuario: usuarioDB.usuario,
        nombre: usuarioDB.nombre,
      },
      process.env.JWT_SECRET,
      { expiresIn: "8h" },
    );

    res.json({
      mensaje: "Login exitoso",
      token,
      usuario: usuarioDB.usuario,
      nombre: usuarioDB.nombre,
    });
  });
});

app.get("/perfil", verificarToken, (req, res) => {
  res.json({
    mensaje: "Ruta protegida",
    usuario: req.usuario,
  });
});

app.get("/api/visitas-hoy", verificarToken, (req, res) => {
  const usuario = req.usuario.usuario;
  const DIA_ACTUAL = 1;

  const sql = `
    SELECT 
      b.codigoclientedestinatario,
      b.CLIENTE,
      b.DIRECCIÓN,
      b.latitud,
      b.longitud,
      b.Tiempo,
      COUNT(t.id_tarea) as tareas,
      vr.estado
    FROM base b
    LEFT JOIN tareas t 
      ON b.codigoclientedestinatario = t.codigo_cliente
    LEFT JOIN visitas_realizadas vr
      ON b.codigoclientedestinatario = vr.codigo_cliente
      AND vr.usuario = ?
      AND vr.dia = ?
      AND vr.fecha = CURDATE()
    WHERE b.COM = ?
      AND b.dia = ?
    GROUP BY b.codigoclientedestinatario
  `;

  db.query(sql, [usuario, DIA_ACTUAL, usuario, DIA_ACTUAL], (err, results) => {
    if (err) return res.status(500).json({ error: "Error visitas" });

    res.json(results);
  });
});

app.get("/api/contador-visitas", verificarToken, (req, res) => {
  const usuario = req.usuario.usuario;
  const DIA_ACTUAL = 1;

  const sql = `
    SELECT COUNT(*) as total
    FROM base
    WHERE COM = ?
      AND dia = ?
  `;

  db.query(sql, [usuario, DIA_ACTUAL], (err, results) => {
    if (err) {
      return res.status(500).json({ error: "Error contador" });
    }

    res.json({ total: results[0].total });
  });
});
app.post("/api/iniciar-visita", verificarToken, (req, res) => {
  const { codigo_cliente } = req.body;
  const usuario = req.usuario.usuario;
  const DIA_ACTUAL = 1;

  const checkSql = `
    SELECT * FROM visitas_realizadas
    WHERE codigo_cliente = ?
      AND usuario = ?
      AND dia = ?
      AND fecha = CURDATE()
  `;

  db.query(checkSql, [codigo_cliente, usuario, DIA_ACTUAL], (err, rows) => {
    if (rows.length > 0) {
      return res.status(400).json({
        error: "La visita ya fue iniciada hoy",
      });
    }

    const insertSql = `
      INSERT INTO visitas_realizadas
      (codigo_cliente, usuario, dia, fecha, hora_inicio)
      VALUES (?, ?, ?, CURDATE(), NOW())
    `;

    db.query(insertSql, [codigo_cliente, usuario, DIA_ACTUAL], () => {
      res.json({ mensaje: "Visita iniciada" });
    });
  });
});
app.post("/api/cerrar-visita", verificarToken, (req, res) => {
  const { codigo_cliente } = req.body;
  const usuario = req.usuario.usuario;
  const DIA_ACTUAL = 1;

  const sql = `
    UPDATE visitas_realizadas
    SET hora_fin = NOW(),
        estado = 'CERRADA',
        duracion_segundos = TIMESTAMPDIFF(SECOND, hora_inicio, NOW())
    WHERE codigo_cliente = ?
      AND usuario = ?
      AND dia = ?
      AND fecha = CURDATE()
      AND estado = 'ABIERTA'
  `;

  db.query(sql, [codigo_cliente, usuario, DIA_ACTUAL], () => {
    res.json({ mensaje: "Visita cerrada" });
  });
});
app.listen(PORT, () => {
  console.log(`Servidor corriendo en http://localhost:${PORT}`);
});
