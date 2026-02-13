const express = require("express");
const mongoose = require("mongoose");
const bodyParser = require("body-parser");

const app = express();

app.use(bodyParser.urlencoded({ extended: true }));
app.use(express.static("public"));
app.set("view engine", "ejs");

/* ===== MongoDB ===== */

mongoose.connect(process.env.MONGO_URI)
  .then(() => console.log("MongoDB Connected"))
  .catch(err => console.log(err));

/* ===== Schema ===== */

const newsSchema = new mongoose.Schema({
  title: String,
  content: String,
  image: String,
  category: String,
  breaking: Boolean,
  createdAt: { type: Date, default: Date.now }
});

const News = mongoose.model("News", newsSchema);

/* ===== Homepage ===== */

app.get("/", async (req, res) => {
  try {
    const breakingNews = await News.find({ breaking: true })
      .sort({ createdAt: -1 })
      .limit(5);

    const topNews = await News.find()
      .sort({ createdAt: -1 })
      .limit(5);

    const local = await News.find({ category: "Local" })
      .sort({ createdAt: -1 })
      .limit(2);

    const sports = await News.find({ category: "Sports" })
      .sort({ createdAt: -1 })
      .limit(2);

    const business = await News.find({ category: "Business" })
      .sort({ createdAt: -1 })
      .limit(2);

    const politics = await News.find({ category: "Politics" })
      .sort({ createdAt: -1 })
      .limit(2);

    const entertainment = await News.find({ category: "Entertainment" })
      .sort({ createdAt: -1 })
      .limit(2);

    const technology = await News.find({ category: "Technology" })
      .sort({ createdAt: -1 })
      .limit(2);

    res.render("index", {
      breakingNews,
      topNews,
      local,
      sports,
      business,
      politics,
      entertainment,
      technology
    });

  } catch (err) {
    console.log(err);
    res.send("Error loading homepage");
  }
});

/* ===== Category Page ===== */

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

/* ===== News Detail ===== */

app.get("/news/:id", async (req, res) => {
  try {
    const newsItem = await News.findById(req.params.id);
    res.render("news-detail", { newsItem });
  } catch (err) {
    console.log(err);
    res.send("News not found");
  }
});

/* ===== Admin ===== */

app.get("/admin", async (req, res) => {
  const news = await News.find().sort({ createdAt: -1 });
  res.render("admin", { news });
});

/* ===== Add News ===== */

app.post("/add-news", async (req, res) => {
  const newNews = new News({
    title: req.body.title,
    content: req.body.content,
    image: req.body.image,
    category: req.body.category,
    breaking: req.body.breaking ? true : false
  });

  await newNews.save();
  res.redirect("/admin");
});

/* ===== Delete ===== */

app.post("/delete/:id", async (req, res) => {
  await News.findByIdAndDelete(req.params.id);
  res.redirect("/admin");
});

/* ===== Server ===== */

const PORT = process.env.PORT || 3000;
app.listen(PORT, () => console.log("Server running on port " + PORT));