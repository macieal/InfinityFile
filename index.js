const express = require("express");
const multer = require("multer");
const path = require("path");
const fs = require("fs");
const cors = require("cors");

const app = express();
const DATA_FILE = "data.json";
const UPLOAD_DIR = "uploads";

if (!fs.existsSync(UPLOAD_DIR)) fs.mkdirSync(UPLOAD_DIR);
if (!fs.existsSync(DATA_FILE)) fs.writeFileSync(DATA_FILE, "[]");

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

function getData() {
  return JSON.parse(fs.readFileSync(DATA_FILE, "utf8"));
}

function saveData(data) {
  fs.writeFileSync(DATA_FILE, JSON.stringify(data, null, 2));
}

app.post("/api/upload", upload.single("file"), (req, res) => {
  if (!req.file) return res.status(400).json({ error: "Nenhum arquivo" });

  const { filename, mimetype } = req.file;
  const caption = req.body.caption || "";

  const posts = getData();
  const post = {
    id: Date.now(),
    filename,
    mimetype,
    caption,
    date: new Date()
  };

  posts.unshift(post);
  saveData(posts);

  res.json(post);
});

app.get("/api/posts", (req, res) => {
  const posts = getData();
  res.json(posts);
});

const PORT = process.env.PORT || 3000;
app.listen(PORT, () => console.log("InfinityFiles rodando na porta", PORT));