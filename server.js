const express = require("express");
const mongoose = require("mongoose");
const bodyParser = require("body-parser");

process.env.TZ = "Asia/Kolkata";

const app = express();

/* ================= DATABASE ================= */

mongoose.connect(process.env.MONGO_URI || "mongodb://127.0.0.1:27017/jilaUpdate")
.then(() => console.log("✅ MongoDB Connected"))
.catch(err => console.log("❌ Mongo Error:", err));

/* ================= MIDDLEWARE ================= */

app.use(bodyParser.urlencoded({ extended: true }));
app.use(express.static("public"));
app.set("view engine", "ejs");

/* ================= SCHEMA ================= */

const newsSchema = new mongoose.Schema({
  title: String,
  content: String,
  category: String,
  image: String,
  location: String,
  isBreaking: { type: Boolean, default: false },
  views: { type: Number, default: 0 }
}, { timestamps: true });

const News = mongoose.model("News", newsSchema);

/* ================= HOME ================= */

app.get("/", async (req, res) => {
  try {

    const breakingMain = await News.findOne({ isBreaking: true })
      .sort({ createdAt: -1 });

    const tickerNews = await News.find({ isBreaking: true })
      .sort({ createdAt: -1 })
      .limit(5);

    res.render("index", {
      breakingMain: breakingMain || null,
      tickerNews: tickerNews || []
    });

  } catch (err) {
    res.send("Server Error");
  }
});

/* ================= CATEGORY ================= */

app.get("/category/:name", async (req, res) => {
  const news = await News.find({ category: req.params.name })
    .sort({ createdAt: -1 });

  res.render("category", {
    category: req.params.name,
    news
  });
});

/* ================= NEWS DETAIL ================= */

app.get("/news/:id", async (req, res) => {
  const news = await News.findById(req.params.id);
  if (!news) return res.send("Not Found");

  news.views++;
  await news.save();

  res.render("news-detail", { news });
});

/* ================= ADMIN ================= */

app.get("/admin", async (req, res) => {
  const allNews = await News.find().sort({ createdAt: -1 });
  res.render("admin", { allNews });
});

app.post("/admin/add", async (req, res) => {
  await News.create({
    title: req.body.title,
    content: req.body.content,
    category: req.body.category,
    image: req.body.image,
    location: req.body.location,
    isBreaking: req.body.isBreaking === "on"
  });
  res.redirect("/admin");
});

app.post("/admin/delete/:id", async (req, res) => {
  await News.findByIdAndDelete(req.params.id);
  res.redirect("/admin");
});

/* ================= PORT ================= */

app.listen(process.env.PORT || 3000, () => {
  console.log("🚀 Server Running");
});