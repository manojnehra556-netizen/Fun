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

    const breakingNews = await News.find({ isBreaking: true })
      .sort({ createdAt: -1 });

    const tickerNews = breakingNews; // ticker ke liye bhi same use

    res.render("index", {
      breakingNews,
      tickerNews
    });

  } catch (err) {
    console.log(err);
    res.status(500).send("Internal Server Error");
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
  try {
    const news = await News.findById(req.params.id);
    if (!news) return res.send("Not Found");

    news.views++;
    await news.save();

    const fullUrl = req.protocol + "://" + req.get("host") + req.originalUrl;

    res.render("news-detail", { 
      news,
      fullUrl
    });

  } catch (err) {
    console.log(err);
    res.send("Error loading news");
  }
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
  try {
    await News.findByIdAndDelete(req.params.id);
    res.redirect("/admin");
  } catch (err) {
    console.log(err);
    res.send("Delete Error");
  }
});

/* ================= PORT ================= */

app.listen(process.env.PORT || 3000, () => {
  console.log("🚀 Server Running");
});