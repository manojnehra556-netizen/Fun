const express = require("express");
const mongoose = require("mongoose");
const bodyParser = require("body-parser");

const app = express();

/* ================= DATABASE ================= */

mongoose.connect(process.env.MONGO_URI || "mongodb://127.0.0.1:27017/jilaUpdate")
.then(()=>console.log("✅ MongoDB Connected"))
.catch(err=>console.log("❌ Mongo Error:", err));

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
  isBreaking: { type: Boolean, default: false },
  createdAt: { type: Date, default: Date.now },
  views: { type: Number, default: 0 }
});

const News = mongoose.model("News", newsSchema);

/* ================= HOME (ONLY BREAKING) ================= */

app.get("/", async (req, res) => {
  try {

    // Latest 1 Breaking News
    const breakingNews = await News.find({ isBreaking: true })
      .sort({ createdAt: -1 })
      .limit(1);

    res.render("index", {
      breakingNews: breakingNews || []
    });

  } catch (err) {
    console.log("Home Error:", err);
    res.status(500).send("Internal Server Error");
  }
});

/* ================= CATEGORY PAGE ================= */

app.get("/category/:name", async (req, res) => {
  try {

    const news = await News.find({
      category: { $regex: new RegExp(req.params.name, "i") }
    }).sort({ createdAt: -1 });

    res.render("category", {
      category: req.params.name,
      news: news || []
    });

  } catch (err) {
    console.log("Category Error:", err);
    res.status(500).send("Error loading category");
  }
});

/* ================= SINGLE NEWS PAGE ================= */

app.get("/news/:id", async (req, res) => {
  try {

    const news = await News.findById(req.params.id);

    if (!news) return res.send("News Not Found");

    news.views += 1;
    await news.save();

    res.render("news-detail", { news });

  } catch (err) {
    console.log("News Detail Error:", err);
    res.status(500).send("Error loading news");
  }
});

/* ================= ADMIN PANEL ================= */

app.get("/admin", async (req, res) => {
  try {
    const allNews = await News.find().sort({ createdAt: -1 });
    res.render("admin", { allNews });
  } catch (err) {
    res.status(500).send("Admin Error");
  }
});

/* ================= ADD NEWS ================= */

app.post("/admin/add", async (req, res) => {
  try {

    const newNews = new News({
      title: req.body.title,
      content: req.body.content,
      category: req.body.category,
      image: req.body.image,
      isBreaking: req.body.isBreaking === "on"
    });

    await newNews.save();
    res.redirect("/admin");

  } catch (err) {
    console.log("Add News Error:", err);
    res.status(500).send("Error adding news");
  }
});

/* ================= DELETE NEWS ================= */

app.get("/admin/delete/:id", async (req, res) => {
  try {
    await News.findByIdAndDelete(req.params.id);
    res.redirect("/admin");
  } catch (err) {
    res.status(500).send("Delete Error");
  }
});

/* ================= PORT ================= */

const PORT = process.env.PORT || 3000;

app.listen(PORT, () => {
  console.log("🚀 Server Running on Port " + PORT);
});