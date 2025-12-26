const express = require("express");
const router = express.Router();
const mediaController = require("../controllers/media.controller");

router.post("/toggle", mediaController.togglePlayPause);
router.post("/play-or-start", mediaController.playOrStart);
router.post("/disney", mediaController.openDisneyPlus);
router.post("/remote-playpause", mediaController.remotePlayPause);
router.post("/remote-play", mediaController.remotePlay);
router.post("/remote-pause", mediaController.remotePause);


module.exports = router;
