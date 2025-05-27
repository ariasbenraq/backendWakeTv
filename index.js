const env = process.env.NODE_ENV || "development";
require("dotenv").config({ path: `.env.${env}` });

const express = require("express");
const cors = require("cors");

const app = express();
const port = process.env.PORT || 5000;

app.use(cors());
app.use(express.json());

// Importar rutas
app.use("/power", require("./routes/power.routes"));
app.use("/media", require("./routes/media.routes"));

app.listen(port, () => {
  console.log(`🚀 Backend corriendo en http://localhost:${port}`);
});
