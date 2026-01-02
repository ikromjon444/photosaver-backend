const express = require("express");
const pool = require("../db");
const auth = require("../middleware/authMiddleware");
const multer = require("multer");
const fs = require("fs").promises;
const path = require("path");

const router = express.Router();

/* MULTER SETUP */
const storage = multer.diskStorage({
  destination: "uploads/",
  filename: (req, file, cb) => {
    const ext = path.extname(file.originalname);
    const name = Date.now() + "-" + Math.round(Math.random() * 1e9);
    cb(null, name + ext); // serverda collision bo'lmasligi uchun raqamli nom
  }
});

const fileFilter = (req, file, cb) => {
  if (file.mimetype.startsWith("image/")) cb(null, true);
  else cb(new Error("Faqat rasm fayllariga ruxsat beriladi"));
};

const upload = multer({
  storage,
  fileFilter,
  limits: { fileSize: 5 * 1024 * 1024 }
});

/* UPLOAD IMAGE */
router.post("/upload", auth, upload.single("image"), async (req, res) => {
  try {
    if (!req.file) return res.status(400).json({ message: "Rasm tanlanmagan" });

    await pool.query(
      "INSERT INTO images (user_id, filename, original_name) VALUES ($1, $2, $3)",
      [req.user.id, req.file.filename, req.file.originalname] // original_name qo‘shildi
    );

    res.json({ message: "Rasm saqlandi" });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

/* GET USER IMAGES */
router.get("/", auth, async (req, res) => {
  try {
    const images = await pool.query(
      "SELECT id, filename, original_name FROM images WHERE user_id = $1 ORDER BY created_at DESC",
      [req.user.id]
    );
    res.json(images.rows);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

/* DELETE IMAGE */
router.delete("/:id", auth, async (req, res) => {
  try {
    const { id } = req.params;

    const img = await pool.query(
      "SELECT filename FROM images WHERE id = $1 AND user_id = $2",
      [id, req.user.id]
    );

    if (img.rows.length === 0) return res.status(404).json({ message: "Rasm topilmadi" });

    const filePath = path.join("uploads", img.rows[0].filename);

    try { await fs.unlink(filePath); } catch (e) { console.warn("Faylni o‘chirishda xato:", e.message); }

    await pool.query("DELETE FROM images WHERE id = $1", [id]);

    res.json({ message: "Rasm o‘chirildi" });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

module.exports = router;
