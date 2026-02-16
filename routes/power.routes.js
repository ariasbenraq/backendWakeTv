const express = require("express");
const router = express.Router();
const powerController = require("../controllers/power.controller");

router.post("/on", powerController.powerOn);
router.get("/on", powerController.powerOn);
router.post("/off", powerController.powerOff);
router.get("/off", powerController.powerOff);
router.post("/on-disney", powerController.powerOnAndOpenDisney);
router.get("/on-disney", powerController.powerOnAndOpenDisney);
router.post("/disney-smart", powerController.smartOpenDisney);
router.get("/disney-smart", powerController.smartOpenDisney);



module.exports = router;

