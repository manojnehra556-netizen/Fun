const express = require("express");
const mongoose = require("mongoose");
const bodyParser = require("body-parser");

const app = express();

app.use(bodyParser.urlencoded({ extended: true }));
app.use(express.static("public"));
app.set("view engine", "ejs");

/* ================= MONGODB ================= */

mongoose.connect(process.env.MONGO_URI)
  .then(() => console.log("MongoDB Connected"))
  .catch(err => console.log(err));

/* ================= SCHEMA ================= */

const newsSchema = new mongoose.Schema({
  title: String,
  content: String,
  image: String,
  category: String,

  breaking: {
    type: Boolean,
    default: false
  },

  topNews: {
    type: Boolean,
    default: false
  },

  views: {
    type: Number,
    default: 0
  },

  createdAt: {
    type: Date,
    default: Date.now
  }
});

const News = mongoose.model("News", newsSchema);

/* ================= HOMEPAGE ================= */

app.get("/", async (req, res) => {
  try {

    const breakingNews = await News.find({ breaking: true })
      .sort({ createdAt: -1 })
      .limit(5);

    const topNews = await News.find({ topNews: true })
      .sort({ createdAt: -1 })
      .limit(5);

    const local = await News.find({ category: "Local" })
      .sort({ createdAt: -1 })
      .limit(2);

    res.render("index", {
      breakingNews,
      topNews,
      local
    });

  } catch (err) {
    console.log(err);
    res.send("Error loading homepage");
  }
});

/* ================= CATEGORY PAGE ================= */

app.get("/category/:name", async (req, res) => {
  try {

    const categoryNews = await News.find({ category: req.params.name })
      .sort({ createdAt: -1 });

    res.render("category", {
      category: req.params.name,
      categoryNews
    });

  } catch (err) {
    console.log(err);
    res.send("Error loading category");
  }
});

/* ================= NEWS DETAIL ================= */

app.get("/news/:id", async (req, res) => {
  try {

    const newsItem = await News.findByIdAndUpdate(
      req.params.id,
      { $inc: { views: 1 } },
      { new: true }
    );

    if (!newsItem) return res.send("News not found");

    res.render("news-detail", { newsItem });

  } catch (err) {
    console.log(err);
    res.send("Error loading news");
  }
});

/* ================= ADMIN ================= */

app.get("/admin", async (req, res) => {
  try {
    const news = await News.find().sort({ createdAt: -1 });
    res.render("admin", { news });
  } catch (err) {
    res.send("Admin error");
  }
});

/* ================= ADD NEWS ================= */

app.post("/add-news", async (req, res) => {
  try {

    const newNews = new News({
      title: req.body.title,
      content: req.body.content,
      image: req.body.image,
      category: req.body.category,
      breaking: req.body.breaking ? true : false,
      topNews: req.body.topNews ? true : false
    });

    await newNews.save();
    res.redirect("/admin");

  } catch (err) {
    console.log(err);
    res.send("Error saving news");
  }
});

/* ================= DELETE NEWS ================= */

app.post("/delete/:id", async (req, res) => {
  try {
    await News.findByIdAndDelete(req.params.id);
    res.redirect("/admin");
  } catch (err) {
    res.send("Delete error");
  }
});

/* ================= SERVER ================= */

const PORT = process.env.PORT || 3000;

app.listen(PORT, () => {
  console.log("Server running on port " + PORT);
});