const express = require("express");
const mongoose = require("mongoose");
const path = require("path");

const app = express();

/* ================== MIDDLEWARE ================== */

app.set("view engine", "ejs");
app.use(express.urlencoded({ extended: true }));
app.use(express.static(path.join(__dirname, "public")));

/* ================== MONGODB ================== */

mongoose.connect(process.env.MONGO_URI)
  .then(() => console.log("MongoDB Connected"))
  .catch(err => console.log("Mongo Error:", err));

/* ================== SCHEMA ================== */

const newsSchema = new mongoose.Schema({
  title: String,
  content: String,
  image: String,
  category: String,
  location: String,

  breaking: {
    type: Boolean,
    default: false
  },

  topNews: {
    type: Boolean,
    default: false
  },

  createdAt: {
    type: Date,
    default: Date.now
  }
});

const News = mongoose.model("News", newsSchema);

/* ================== HOMEPAGE ================== */

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
      breakingNews: breakingNews || [],
      topNews: topNews || [],
      local: local || []
    });

  } catch (error) {
    console.log("Homepage Error:", error);
    res.status(500).send("Internal Server Error");
  }
});

/* ================== CATEGORY PAGE ================== */

app.get("/category/:name", async (req, res) => {
  try {

    const categoryNews = await News.find({ category: req.params.name })
      .sort({ createdAt: -1 });

    res.render("category", {
      category: req.params.name,
      categoryNews: categoryNews || []
    });

  } catch (error) {
    console.log("Category Error:", error);
    res.status(500).send("Category Error");
  }
});

/* ================== NEWS DETAILS ================== */

app.get("/news/:id", async (req, res) => {
  try {

    const newsItem = await News.findById(req.params.id);

    if (!newsItem) {
      return res.send("News not found");
    }

    res.render("news-detail", { newsItem });

  } catch (error) {
    console.log("Details Error:", error);
    res.status(500).send("Details Error");
  }
});

/* ================== ADMIN PAGE ================== */

app.get("/admin", async (req, res) => {
  try {

    const news = await News.find().sort({ createdAt: -1 });

    res.render("admin", { news: news || [] });

  } catch (error) {
    res.status(500).send("Admin Error");
  }
});

/* ================== ADD NEWS ================== */

app.post("/add-news", async (req, res) => {
  try {

    const newNews = new News({
      title: req.body.title,
      content: req.body.content,
      image: req.body.image,
      category: req.body.category,
      location: req.body.location,
      breaking: req.body.breaking ? true : false,
      topNews: req.body.topNews ? true : false
    });

    await newNews.save();
    res.redirect("/admin");

  } catch (error) {
    console.log("Add Error:", error);
    res.status(500).send("Error saving news");
  }
});

/* ================== DELETE NEWS ================== */

app.post("/delete/:id", async (req, res) => {
  try {

    await News.findByIdAndDelete(req.params.id);
    res.redirect("/admin");

  } catch (error) {
    res.status(500).send("Delete Error");
  }
});

/* ================== SERVER START ================== */

const PORT = process.env.PORT || 3000;

app.listen(PORT, () => {
  console.log("Server running on port " + PORT);
});