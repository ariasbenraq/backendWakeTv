// 🔌 Importación de módulos necesarios
const express = require("express"); // Framework web para crear el servidor
const wol = require("wol"); // Librería para enviar paquetes Wake-on-LAN
const cors = require("cors"); // Permite conexiones desde otros orígenes (como el frontend)

// 🌐 Configuración del servidor Express
const app = express();
const port = 5000; // Puerto en el que correrá el backend

// 🧠 Middlewares para permitir CORS y parsear JSON
app.use(cors()); // Permite que el frontend pueda comunicarse con este backend
app.use(express.json()); // Permite recibir datos en formato JSON

// 🛠️ Configuración del televisor
const MAC_ADDRESS = "14:c9:13:7b:b7:14"; // MAC del televisor para Wake-on-LAN

// ⚡ Ruta para ENCENDER el televisor (Wake-on-LAN)
app.post("/power/on", (req, res) => {
    wol.wake(MAC_ADDRESS, (err) => {
        if (err) {
            console.error("Error al enviar Wake-on-LAN:", err);
            return res.status(500).send("Error al encender el televisor");
        }
        console.log("Wake-on-LAN enviado");
        res.send("Encendiendo el televisor...");
    });
});

// 🛑 Ruta para APAGAR el televisor usando lgtv2 (webOS)
app.post("/power/off", (req, res) => {
    // Creamos una nueva instancia de conexión con el televisor
    const lgtv = require("lgtv2")({
        url: "ws://192.168.18.19:3000", // WebSocket del televisor LG
        reconnect: false, // Evita reconexión automática
    });

    // Evento cuando se logra conectar al televisor
    lgtv.on("connect", () => {
        console.log("Conectado al TV, enviando comando de apagado...");

        // Se envía la solicitud para apagar el TV
        lgtv.request("ssap://system/turnOff", (err, result) => {
            if (err) {
                console.error("Error al apagar el televisor:", err);
                res.status(500).send("No se pudo apagar el televisor");
            } else {
                console.log("Televisor apagado correctamente");
                res.send("Televisor apagado correctamente");
            }

            // Cerramos la conexión al terminar
            lgtv.disconnect();
        });
    });

    // Evento si ocurre un error al intentar conectar con el TV
    lgtv.on("error", (err) => {
        console.error("Error al conectar con el televisor:", err);
        res.status(500).send("Error al conectar con el televisor");
    });
});

// 🚀 Inicialización del servidor
app.listen(port, () => {
    console.log(`Servidor backend corriendo en http://localhost:${port}`);
});
