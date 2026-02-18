const DB_NAME = "op-bavaria-offline";
const STORE_NAME = "cola";

function openDB() {
  return new Promise((resolve, reject) => {
    const request = indexedDB.open(DB_NAME, 1);

    request.onupgradeneeded = (e) => {
      const db = e.target.result;
      if (!db.objectStoreNames.contains(STORE_NAME)) {
        db.createObjectStore(STORE_NAME, {
          keyPath: "id",
          autoIncrement: true,
        });
      }
    };

    request.onsuccess = () => resolve(request.result);
    request.onerror = () => reject("Error abriendo IndexedDB");
  });
}

async function guardarOffline(data) {
  const db = await openDB();
  const tx = db.transaction(STORE_NAME, "readwrite");
  tx.objectStore(STORE_NAME).add({
    ...data,
    fecha: new Date().toISOString(),
  });
}

async function obtenerPendientes() {
  const db = await openDB();
  const tx = db.transaction(STORE_NAME, "readonly");
  return tx.objectStore(STORE_NAME).getAll();
}

async function limpiarPendientes() {
  const db = await openDB();
  const tx = db.transaction(STORE_NAME, "readwrite");
  tx.objectStore(STORE_NAME).clear();
}
async function enviarTarea(data) {
  if (!navigator.onLine) {
    await guardarOffline(data);
    alert("📴 Sin internet. Guardado para enviar luego.");
    return;
  }

  try {
    await fetch("/api/tareas", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(data),
    });
  } catch (err) {
    await guardarOffline(data);
  }
}
