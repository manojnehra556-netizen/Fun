const express = require("express");
const mongoose = require("mongoose");
const bodyParser = require("body-parser");

const app = express();

/* =======================
   DATABASE CONNECT
======================= */

mongoose.connect(process.env.MONGO_URI || "mongodb://127.0.0.1:27017/jilaUpdate", {
  useNewUrlParser: true,
  useUnifiedTopology: true
})
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
  textColor: { type: String, default: "#000000" },  // 👈 ADD THIS
  isBreaking: { type: Boolean, default: false },
  isTop: { type: Boolean, default: false },
  isLive: { type: Boolean, default: false },
  views: { type: Number, default: 0 },
  createdAt: { type: Date, default: Date.now }
});

const News = mongoose.model("News", newsSchema);

/* =======================
   HOME ROUTE
======================= */

app.get("/", async (req, res) => {
  try {

    const breakingNews = await News.find({ isBreaking: true }).sort({ createdAt: -1 }).limit(5);
    const liveNews = await News.find({ isLive: true }).sort({ createdAt: -1 }).limit(3);
    const topNews = await News.find({ isTop: true }).sort({ createdAt: -1 }).limit(5);

    const localNews = await News.find({ category: "Local" }).sort({ createdAt: -1 }).limit(2);
    const sportsNews = await News.find({ category: "Sports" }).sort({ createdAt: -1 }).limit(2);
    const businessNews = await News.find({ category: "Business" }).sort({ createdAt: -1 }).limit(2);
    const politicsNews = await News.find({ category: "Politics" }).sort({ createdAt: -1 }).limit(2);

    res.render("index", {
      breakingNews,
      liveNews,
      topNews,
      localNews,
      sportsNews,
      businessNews,
      politicsNews
    });

  } catch (err) {
    console.log("Homepage Error:", err);
    res.status(500).send("Internal Server Error");
  }
});

/* =======================
   CATEGORY PAGE
======================= */

app.get("/category/:name", async (req, res) => {
  try {
    const categoryNews = await News.find({ category: req.params.name })
      .sort({ createdAt: -1 });

    res.render("category", {
      category: req.params.name,
      categoryNews
    });

  } catch (err) {
    console.log("Category Error:", err);
    res.status(500).send("Internal Server Error");
  }
});

/* =======================
   SINGLE NEWS PAGE
======================= */

app.get("/news/:id", async (req, res) => {
  try {

    const news = await News.findById(req.params.id);

    if (!news) {
      return res.status(404).send("News not found");
    }

    news.views += 1;
    await news.save();

    res.render("news-detail", { news });

  } catch (err) {
    console.log("News Detail Error:", err);
    res.status(500).send("Internal Server Error");
  }
});

/* =======================
   ADMIN PANEL
======================= */

app.get("/admin", async (req, res) => {
  try {
    const allNews = await News.find().sort({ createdAt: -1 });
    res.render("admin", { allNews });
  } catch (err) {
    res.send("Admin error");
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
  textColor: req.body.textColor || "#000000",  // 👈 ADD THIS
  isBreaking: req.body.isBreaking === "on",
  isTop: req.body.isTop === "on",
  isLive: req.body.isLive === "on"
});
    await newNews.save();
    res.redirect("/admin");

  } catch (err) {
    console.log("Add News Error:", err);
    res.send("Error adding news");
  }
});

/* =======================
   DELETE NEWS
======================= */

app.get("/admin/delete/:id", async (req, res) => {
  try {
    await News.findByIdAndDelete(req.params.id);
    res.redirect("/admin");
  } catch (err) {
    res.send("Delete error");
  }
});

/* =======================
   PORT
======================= */

const PORT = process.env.PORT || 3000;

app.listen(PORT, () => {
  console.log("🚀 Server running on port " + PORT);
});