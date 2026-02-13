const express = require("express");
const mongoose = require("mongoose");
const bodyParser = require("body-parser");
const path = require("path");

const app = express();

/* ===== Middleware ===== */
app.use(bodyParser.urlencoded({ extended: true }));
app.use(express.static(path.join(__dirname, "public")));
app.set("view engine", "ejs");

/* ===== MongoDB Connection ===== */
mongoose.connect(process.env.MONGO_URI, {
  useNewUrlParser: true,
  useUnifiedTopology: true
})
.then(() => console.log("MongoDB Connected"))
.catch(err => console.log(err));

/* ===== Schema ===== */
const newsSchema = new mongoose.Schema({
  title: String,
  content: String,
  category: String,
  date: { type: Date, default: Date.now }
});

const News = mongoose.model("News", newsSchema);

/* ===== Routes ===== */

// Homepage
app.get("/", async (req, res) => {
  const news = await News.find().sort({ date: -1 });
  res.render("index", { news });
});

// Category Page
app.get("/category/:name", async (req, res) => {
  const news = await News.find({ category: req.params.name });
  res.render("category", { news, category: req.params.name });
});

// Admin Panel
app.get("/admin", (req, res) => {
  res.render("admin");
});

// Add News
app.post("/add-news", async (req, res) => {
  const newNews = new News({
    title: req.body.title,
    content: req.body.content,
    category: req.body.category
  });

  await newNews.save();
  res.redirect("/");
});

/* ===== PORT FIX (IMPORTANT FOR RENDER) ===== */
const PORT = process.env.PORT || 3000;

app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});