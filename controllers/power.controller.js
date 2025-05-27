const wol = require("wol");
const { MAC_ADDRESS } = require("../config/tv.config");

exports.powerOn = (req, res) => {
  wol.wake(MAC_ADDRESS, (err) => {
    if (err) return res.status(500).send("Error al encender el televisor");
    res.send("Encendiendo el televisor...");
  });
};

exports.powerOff = (req, res) => {
  const lgtv = require("../utils/lgtv")();
  lgtv.on("connect", () => {
    lgtv.request("ssap://system/turnOff", (err) => {
      if (err) return res.status(500).send("Error al apagar el televisor");
      res.send("Televisor apagado correctamente");
      lgtv.disconnect();
    });
  });
  lgtv.on("error", () => res.status(500).send("Error al conectar con el televisor"));
};

exports.powerOnAndOpenDisney = (req, res) => {
  const wol = require("wol");
  const { MAC_ADDRESS } = require("../config/tv.config");

  wol.wake(MAC_ADDRESS, async (err) => {
    if (err) {
      console.error("❌ Error al enviar Wake-on-LAN:", err);
      return res.status(500).send("Error al encender el televisor");
    }

    console.log("⚡ Wake-on-LAN enviado. Esperando que inicie webOS...");

    // Esperar 15 segundos para que el televisor termine de iniciar
    setTimeout(() => {
      const lgtv = require("../utils/lgtv")();

      lgtv.on("connect", () => {
        console.log("📺 Conectado. Abriendo Disney+...");

        lgtv.request("ssap://system.launcher/launch", { id: "com.disney.disneyplus-prod" }, (err2) => {
          if (err2) {
            console.error("❌ No se pudo abrir Disney+:", err2);
            res.status(500).send("El TV se encendió, pero no se pudo abrir Disney+");
          } else {
            console.log("✅ Disney+ abierto automáticamente después de encender");
            res.send("TV encendido y Disney+ abierto correctamente");
          }
          lgtv.disconnect();
        });
      });

      lgtv.on("error", (err3) => {
        console.error("❌ Error al conectar con el televisor:", err3);
        res.status(500).send("El TV se encendió, pero no se pudo conectar vía WebSocket");
      });
    }, 15000); // 15 segundos
  });
};

exports.smartOpenDisney = async (req, res) => {
  const wol = require("wol");
  const { MAC_ADDRESS } = require("../config/tv.config");

  // Función para intentar conectar al TV
  const tryConnect = () => {
    return new Promise((resolve, reject) => {
      const lgtv = require("lgtv2")({
        url: "ws://192.168.18.19:3000",
        reconnect: false,
      });

      lgtv.on("connect", () => resolve(lgtv));
      lgtv.on("error", () => reject(new Error("No se pudo conectar")));
    });
  };

  // Función que lanza Disney+
  const sendDisneyLaunch = (socket) => {
    socket.request("ssap://system.launcher/launch", { id: "com.disney.disneyplus-prod" }, (err) => {
      if (err) {
        console.error("❌ Error al abrir Disney+:", err);
        res.status(500).send("No se pudo abrir Disney+");
      } else {
        res.send("✅ Disney+ abierto correctamente");
      }
      socket.disconnect();
    });
  };

  // Función que hace timeout manual
  const timeout = (ms) =>
    new Promise((_, reject) =>
      setTimeout(() => reject(new Error("timeout")), ms)
    );

  // Verificar si el TV ya está encendido (máx 3s)
  try {
    console.log("⚡ Verificando si el TV está encendido (espera 3s máx)...");
    const lgtv = await Promise.race([tryConnect(), timeout(3000)]);
    console.log("✅ El TV está encendido. Abriendo Disney+...");
    sendDisneyLaunch(lgtv);
  } catch (error) {
    console.log("🔌 El TV parece estar apagado. Enviando Wake-on-LAN...");

    wol.wake(MAC_ADDRESS, (err2) => {
      if (err2) {
        console.error("❌ Error al enviar Wake-on-LAN:", err2);
        return res.status(500).send("No se pudo encender el televisor");
      }

      console.log("⚡ Encendido solicitado. Esperando 15 segundos...");

      setTimeout(() => {
        const lgtv2 = require("lgtv2")({
          url: "ws://192.168.18.19:3000",
          reconnect: false,
        });

        lgtv2.on("connect", () => {
          console.log("📺 Conectado después de encender. Abriendo Disney+...");
          sendDisneyLaunch(lgtv2);
        });

        lgtv2.on("error", (err3) => {
          console.error("❌ No se pudo conectar tras el encendido:", err3);
          res.status(500).send("TV encendido, pero no se pudo conectar para abrir Disney+");
        });
      }, 15000); // esperar a que webOS termine de cargar
    });
  }
};




