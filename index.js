const express = require("express");
const multer = require("multer");
const path = require("path");
const fs = require("fs");
const cors = require("cors");


const app = express();
const UPLOAD_DIR = "uploads";


if (!fs.existsSync(UPLOAD_DIR)) fs.mkdirSync(UPLOAD_DIR);


const storage = multer.diskStorage({
destination: (req, file, cb) => cb(null, UPLOAD_DIR),
filename: (req, file, cb) => {
const safe = Date.now() + '-' + file.originalname.replace(/\s+/g, "_");
cb(null, safe);
}
});


const upload = multer({ storage });


app.use(cors());
app.use(express.json());
app.use(express.static("public"));
app.use("/uploads", express.static("uploads"));


// Auto delete 24h
setInterval(() => {
const now = Date.now();
fs.readdir(UPLOAD_DIR, (err, files) => {
if (err) return;
files.forEach((file) => {
const filePath = path.join(UPLOAD_DIR, file);
const stats = fs.statSync(filePath);
if (now - stats.mtimeMs > 24 * 60 * 60 * 1000) {
fs.unlinkSync(filePath);
}
});
});
}, 60 * 60 * 1000);


app.post("/api/upload", upload.single("file"), (req, res) => {
if (!req.file) return res.status(400).json({ error: "Nenhum arquivo" });
res.json({ filename: req.file.filename, mimetype: req.file.mimetype });
});


app.get("/api/posts", (req, res) => {
const files = fs.readdirSync(UPLOAD_DIR);
const list = files.map(f => {
const stats = fs.statSync(path.join(UPLOAD_DIR, f));
return {
filename: f,
date: stats.mtime,
mimetype: ""
};
});
res.json(list);
});


const PORT = process.env.PORT || 3000;
app.listen(PORT, () => console.log(`InfinityFiles rodando na porta ${PORT}`));