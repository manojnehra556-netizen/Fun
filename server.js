const express = require("express");
const mongoose = require("mongoose");
const bodyParser = require("body-parser");
const path = require("path");

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
  isTop: { type: Boolean, default: false },
  isLive: { type: Boolean, default: false },
  views: { type: Number, default: 0 },
  createdAt: { type: Date, default: Date.now }
});

const News = mongoose.model("News", newsSchema);

/* =======================
   HOME PAGE
   Only Breaking big show
======================= */

app.get("/", async (req, res) => {
  try {

    const breakingNews = await News.findOne({ isBreaking: true })
      .sort({ createdAt: -1 });

    const localNews = await News.find({ category: "Local" })
      .sort({ createdAt: -1 })
      .limit(4);

    const sportsNews = await News.find({ category: "Sports" })
      .sort({ createdAt: -1 })
      .limit(4);

    const businessNews = await News.find({ category: "Business" })
      .sort({ createdAt: -1 })
      .limit(4);

    const politicsNews = await News.find({ category: "Politics" })
      .sort({ createdAt: -1 })
      .limit(4);

    res.render("index", {
      breakingNews: breakingNews || null,
      localNews: localNews || [],
      sportsNews: sportsNews || [],
      businessNews: businessNews || [],
      politicsNews: politicsNews || []
    });

  } catch (err) {
    console.log("Home Error:", err);
    res.status(500).send("Internal Server Error");
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
      news: news || []
    });

  } catch (err) {
    console.log("Category Error:", err);
    res.send("Error loading category");
  }
});

/* =======================
   SINGLE NEWS PAGE
======================= */

app.get("/news/:id", async (req, res) => {
  try {
    const news = await News.findById(req.params.id);

    if (!news) return res.send("News not found");

    news.views += 1;
    await news.save();

    res.render("news-detail", { news });

  } catch (err) {
    console.log("News Detail Error:", err);
    res.send("Error loading news");
  }
});

/* =======================
   ADMIN PANEL
======================= */

app.get("/admin", async (req, res) => {
  try {
    const allNews = await News.find().sort({ createdAt: -1 });
    res.render("admin", { allNews: allNews || [] });
  } catch (err) {
    res.send("Admin Error");
  }
});

/* =======================
   ADD NEWS
======================= */

app.post("/admin/add", async (req, res) => {
  try {

    const newNews = new News({
      title: req.body.title,
      content: req.body.content,
      category: req.body.category,
      image: req.body.image,
      location: req.body.location,
      isBreaking: req.body.isBreaking === "on",
      isTop: req.body.isTop === "on",
      isLive: req.body.isLive === "on"
    });

    await newNews.save();
    res.redirect("/admin");

  } catch (err) {
    console.log("Add Error:", err);
    res.send("Error adding news");
  }
});

/* =======================
   DELETE NEWS (SAFE POST)
======================= */

app.get("/admin/delete/:id", async (req, res) => {
  try {
    await News.findByIdAndDelete(req.params.id);
    res.redirect("/admin");
  } catch (err) {
    console.log(err);
    res.send("Delete Error");
  }
});

/* =======================
   PORT
======================= */

const PORT = process.env.PORT || 3000;

app.listen(PORT, () => {
  console.log("🚀 Server running on port " + PORT);
});