const express = require("express");
const {
  docUpload,
  getAll,
  downloadFile,
  deleteFile,
} = require("../controllers/doc.controller");
const upload = require("../middlewares/multer");

const router = express.Router();

router.post("/upload", upload.single("file"), docUpload);
router.get("/", getAll);
router.get("/:id", downloadFile);
router.delete("/:id", deleteFile);
module.exports = router;
