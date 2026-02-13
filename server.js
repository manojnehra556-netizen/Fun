const express = require("express");
const mongoose = require("mongoose");
const bodyParser = require("body-parser");
const path = require("path");

const app = express();

// Middleware
app.use(bodyParser.urlencoded({ extended: true }));
app.use(express.static("public"));

app.set("view engine", "ejs");

// MongoDB Connection
mongoose.connect(process.env.MONGO_URI)
  .then(() => console.log("MongoDB Connected"))
  .catch(err => console.log(err));

// News Schema
const newsSchema = new mongoose.Schema({
  title: String,
  content: String,
  category: String,
  createdAt: {
    type: Date,
    default: Date.now
  }
});

const News = mongoose.model("News", newsSchema);

// ================= ROUTES =================

// Homepage
app.get("/", async (req, res) => {
  try {
    const news = await News.find().sort({ createdAt: -1 });
    res.render("index", { news });
  } catch (err) {
    console.log(err);
    res.send("Error loading homepage");
  }
});

// Admin Page
app.get("/admin", (req, res) => {
  res.render("admin");
});

// Add News
app.post("/add-news", async (req, res) => {
  const { title, content, category } = req.body;

  try {
    const newNews = new News({
      title,
      content,
      category
    });

    await newNews.save();
    res.redirect("/");
  } catch (err) {
    console.log(err);
    res.send("Error saving news");
  }
});

// ================= SERVER =================

const PORT = process.env.PORT || 3000;

app.listen(PORT, () => {
  console.log("Server running on port " + PORT);
});