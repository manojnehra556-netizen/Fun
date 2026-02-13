const express = require("express");
const mongoose = require("mongoose");
const bodyParser = require("body-parser");

const app = express();

/* ================= MIDDLEWARE ================= */

app.use(bodyParser.urlencoded({ extended: true }));
app.use(express.static("public"));
app.set("view engine", "ejs");

/* ================= MONGODB CONNECTION ================= */

mongoose.connect(process.env.MONGO_URI)
  .then(() => console.log("✅ MongoDB Connected Successfully"))
  .catch(err => console.log("❌ Mongo Error:", err));

/* ================= SCHEMA ================= */

const newsSchema = new mongoose.Schema({
  title: String,
  content: String,
  image: String,
  category: String,
  breaking: Boolean,
  createdAt: {
    type: Date,
    default: Date.now
  }
});

const News = mongoose.model("News", newsSchema);

/* ================= ROUTES ================= */

/* ===== HOMEPAGE ===== */
app.get("/", async (req, res) => {
  try {

    // Breaking News (Top scrolling)
    const breakingNews = await News.find({ breaking: true })
      .sort({ createdAt: -1 })
      .limit(5);

    // Top News Section
    const topNews = await News.find()
      .sort({ createdAt: -1 })
      .limit(5);

    // Local Preview (Only 2)
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

/* ===== CATEGORY PAGE ===== */
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
    res.send("Error loading category page");
  }
});

/* ===== NEWS DETAIL PAGE ===== */
app.get("/news/:id", async (req, res) => {
  try {

    const newsItem = await News.findById(req.params.id);

    if (!newsItem) {
      return res.send("News not found");
    }

    res.render("news-detail", { newsItem });

  } catch (err) {
    console.log(err);
    res.send("Error loading news detail");
  }
});

/* ===== ADMIN PAGE ===== */
app.get("/admin", async (req, res) => {
  try {
    const news = await News.find().sort({ createdAt: -1 });
    res.render("admin", { news });
  } catch (err) {
    console.log(err);
    res.send("Error loading admin");
  }
});

/* ===== ADD NEWS ===== */
app.post("/add-news", async (req, res) => {
  try {

    const newNews = new News({
      title: req.body.title,
      content: req.body.content,
      image: req.body.image,
      category: req.body.category,
      breaking: req.body.breaking ? true : false
    });

    await newNews.save();
    res.redirect("/admin");

  } catch (err) {
    console.log(err);
    res.send("Error saving news");
  }
});

/* ===== DELETE NEWS ===== */
app.post("/delete/:id", async (req, res) => {
  try {
    await News.findByIdAndDelete(req.params.id);
    res.redirect("/admin");
  } catch (err) {
    console.log(err);
    res.send("Error deleting news");
  }
});

/* ================= SERVER ================= */

const PORT = process.env.PORT || 3000;

app.listen(PORT, () => {
  console.log("🚀 Server running on port " + PORT);
});