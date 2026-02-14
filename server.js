const express = require("express");
const mongoose = require("mongoose");
const bodyParser = require("body-parser");

const app = express();

/* =======================
   DATABASE CONNECT
======================= */

mongoose.connect(process.env.MONGO_URI || "mongodb://127.0.0.1:27017/jilaUpdate")
.then(() => console.log("✅ MongoDB Connected"))
.catch(err => console.log("❌ Mongo Error:", err));

/* =======================
   MIDDLEWARE
======================= */

app.use(bodyParser.urlencoded({ extended: true }));
app.use(express.static("public"));
app.set("view engine", "ejs");

/* =======================
   NEWS SCHEMA
======================= */

const newsSchema = new mongoose.Schema({
  title: String,
  content: String,
  category: String,
  image: String,
  location: String,
  isBreaking: { type: Boolean, default: false },
  views: { type: Number, default: 0 },
  createdAt: { type: Date, default: Date.now }
});

const News = mongoose.model("News", newsSchema);

/* =======================
   HOME ROUTE (Only 1 Breaking)
======================= */

app.get("/", async (req, res) => {
  try {

    const breakingNews = await News.find({ isBreaking: true })
      .sort({ createdAt: -1 })
      .limit(1);

    const tickerNews = await News.find({ isBreaking: true })
      .sort({ createdAt: -1 })
      .limit(5);

    res.render("index", {
      breaking: breakingNews[0] || null,
      tickerNews
    });

  } catch (err) {
    console.log(err);
    res.send("Server Error");
  }
});

/* =======================
   CATEGORY PAGE
======================= */

app.get("/category/:name", async (req, res) => {
  try {
    const news = await News.find({ category: req.params.name })
      .sort({ createdAt: -1 });

    res.render("category", {
      category: req.params.name,
      news
    });

  } catch (err) {
    res.send("Category Error");
  }
});

/* =======================
   SINGLE NEWS PAGE
======================= */

app.get("/news/:id", async (req, res) => {
  try {
    const news = await News.findById(req.params.id);
    if (!news) return res.send("Not found");

    news.views += 1;
    await news.save();

    res.render("news-detail", { news });

  } catch (err) {
    res.send("News Error");
  }
});

/* =======================
   ADMIN
======================= */

app.get("/admin", async (req, res) => {
  const allNews = await News.find().sort({ createdAt: -1 });
  res.render("admin", { allNews });
});

app.post("/admin/add", async (req, res) => {

  const newNews = new News({
    title: req.body.title,
    content: req.body.content,
    category: req.body.category,
    image: req.body.image,
    location: req.body.location,
    isBreaking: req.body.isBreaking === "on"
  });

  await newNews.save();
  res.redirect("/admin");
});

app.get("/admin/delete/:id", async (req, res) => {
  await News.findByIdAndDelete(req.params.id);
  res.redirect("/admin");
});

/* =======================
   PORT
======================= */

const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
  console.log("🚀 Server Running on " + PORT);
});