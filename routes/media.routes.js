const express = require("express");
const router = express.Router();
const mediaController = require("../controllers/media.controller");

router.post("/toggle", mediaController.togglePlayPause);
router.post("/play-or-start", mediaController.playOrStart);
router.post("/disney", mediaController.openDisneyPlus);


module.exports = router;
