exports.togglePlayPause = (req, res) => {
  const lgtv = require("../utils/lgtv")();
  lgtv.on("connect", () => {
    lgtv.request("ssap://media.controls/togglePause", (err) => {
      if (err) return res.status(500).send("No se pudo alternar reproducción/pausa");
      res.send("Comando togglePause enviado correctamente");
      lgtv.disconnect();
    });
  });
  lgtv.on("error", () => res.status(500).send("Error al conectar con el televisor"));
};


exports.playOrStart = (req, res) => {
  const lgtv = require("../utils/lgtv")();
  let toggleSent = false;

  lgtv.on("connect", () => {
    console.log("🕹 Enviando tecla ENTER...");

    // 1. Enviar tecla ENTER
    lgtv.request("ssap://com.webos.service.ime/sendEnterKey", { key: "ENTER" }, (err) => {
      if (err) {
        console.error("❌ Error al enviar ENTER:", err);
        return res.status(500).send("Error al enviar ENTER");
      }

      console.log("✅ ENTER enviado. Esperando para enviar togglePause...");

      // 2. Esperar 1 segundo y luego enviar togglePause
      setTimeout(() => {
        lgtv.request("ssap://media.controls/togglePause", (err2) => {
          toggleSent = true;
          if (err2) {
            console.error("❌ Error al enviar togglePause:", err2);
            res.status(500).send("Error al enviar togglePause");
          } else {
            console.log("🎬 togglePause enviado correctamente");
            res.send("✅ Reproducción iniciada o reanudada");
          }
          lgtv.disconnect();
        });
      }, 1000);
    });
  });

  lgtv.on("error", (err) => {
    if (!toggleSent) {
      console.error("❌ Error al conectar con el televisor:", err);
      res.status(500).send("No se pudo conectar con el televisor");
    }
  });
};

exports.openDisneyPlus = (req, res) => {
  const lgtv = require("../utils/lgtv")();

  lgtv.on("connect", () => {
    console.log("📺 Enviando solicitud para abrir Disney+...");

    lgtv.request("ssap://system.launcher/launch", { id: "com.disney.disneyplus-prod" }, (err) => {
      if (err) {
        console.error("❌ Error al abrir Disney+:", err);
        res.status(500).send("No se pudo abrir Disney+");
      } else {
        console.log("✅ Disney+ abierto con ID: com.disney.disneyplus-prod");
        res.send("✅ Disney+ abierto correctamente");
      }
      lgtv.disconnect();
    });
  });

  lgtv.on("error", (err) => {
    console.error("❌ Error al conectar con el televisor:", err);
    res.status(500).send("No se pudo conectar al televisor");
  });
};

