const wol = require("wol");
const createLgtv = require("../utils/lgtv");
const {
  MAC_ADDRESS,
  WOL_BROADCAST_ADDRESS,
  WOL_PORT,
} = require("../config/tv.config");

const DISNEY_APP_ID = "com.disney.disneyplus-prod";

const wakeTv = () =>
  new Promise((resolve, reject) => {
    wol.wake(
      MAC_ADDRESS,
      {
        address: WOL_BROADCAST_ADDRESS,
        port: WOL_PORT,
      },
      (err) => {
        if (err) {
          reject(err);
          return;
        }

        resolve();
      }
    );
  });

const connectTv = () =>
  new Promise((resolve, reject) => {
    const lgtv = createLgtv();

    const clear = () => {
      lgtv.removeAllListeners("connect");
      lgtv.removeAllListeners("error");
    };

    lgtv.once("connect", () => {
      clear();
      resolve(lgtv);
    });

    lgtv.once("error", (err) => {
      clear();
      try {
        lgtv.disconnect();
      } catch (_) {
        // noop
      }
      reject(err);
    });
  });

const sleep = (ms) => new Promise((resolve) => setTimeout(resolve, ms));

const connectWithRetry = async ({ attempts, delayMs }) => {
  let lastError;

  for (let attempt = 1; attempt <= attempts; attempt += 1) {
    try {
      return await connectTv();
    } catch (error) {
      lastError = error;
      if (attempt < attempts) {
        await sleep(delayMs);
      }
    }
  }

  throw lastError || new Error("No se pudo conectar con el TV");
};

const launchDisney = (lgtv, res) => {
  lgtv.request("ssap://system.launcher/launch", { id: DISNEY_APP_ID }, (err) => {
    if (err) {
      console.error("❌ No se pudo abrir Disney+:", err);
      res.status(500).send("El TV respondió, pero no se pudo abrir Disney+");
    } else {
      res.send("✅ Disney+ abierto correctamente");
    }

    lgtv.disconnect();
  });
};

exports.powerOn = async (req, res) => {
  try {
    await wakeTv();
    res.send("Encendiendo el televisor...");
  } catch (err) {
    console.error("❌ Error al enviar Wake-on-LAN:", err);
    res.status(500).send("Error al encender el televisor");
  }
};

exports.powerOff = (req, res) => {
  const lgtv = createLgtv();
  lgtv.on("connect", () => {
    lgtv.request("ssap://system/turnOff", (err) => {
      if (err) return res.status(500).send("Error al apagar el televisor");
      res.send("Televisor apagado correctamente");
      lgtv.disconnect();
    });
  });
  lgtv.on("error", () => res.status(500).send("Error al conectar con el televisor"));
};

exports.powerOnAndOpenDisney = async (req, res) => {
  try {
    console.log("⚡ Enviando Wake-on-LAN...");
    await wakeTv();

    console.log("⚡ Esperando que webOS termine de iniciar...");
    const lgtv = await connectWithRetry({ attempts: 10, delayMs: 3000 });

    console.log("📺 Conectado después de encender. Abriendo Disney+...");
    launchDisney(lgtv, res);
  } catch (err) {
    console.error("❌ No se pudo conectar tras el encendido:", err);
    res.status(500).send("TV encendido, pero no se pudo conectar para abrir Disney+");
  }
};

exports.smartOpenDisney = async (req, res) => {
  try {
    console.log("⚡ Verificando si el TV está encendido (espera 3s máx)...");
    const lgtv = await Promise.race([
      connectWithRetry({ attempts: 1, delayMs: 0 }),
      sleep(3000).then(() => {
        throw new Error("timeout");
      }),
    ]);

    console.log("✅ El TV está encendido. Abriendo Disney+...");
    launchDisney(lgtv, res);
    return;
  } catch (_) {
    console.log("🔌 El TV parece estar apagado. Enviando Wake-on-LAN...");
  }

  try {
    await wakeTv();
    console.log("⚡ Encendido solicitado. Esperando disponibilidad de webOS...");

    const lgtv = await connectWithRetry({ attempts: 10, delayMs: 3000 });

    console.log("📺 Conectado después de encender. Abriendo Disney+...");
    launchDisney(lgtv, res);
  } catch (err) {
    console.error("❌ No se pudo conectar tras el encendido:", err);
    res.status(500).send("TV encendido, pero no se pudo conectar para abrir Disney+");
  }
};
