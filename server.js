const express = require("express");
const mongoose = require("mongoose");
const bodyParser = require("body-parser");
const News = require("./models/News");

const app = express();

app.set("view engine", "ejs");
app.use(bodyParser.urlencoded({ extended: true }));
app.use(express.static("public"));

mongoose.connect("YOUR_MONGODB_CONNECTION_STRING");

app.get("/", async (req, res) => {
  const news = await News.find().sort({ date: -1 });
  res.render("index", { news });
});

app.get("/category/:name", async (req, res) => {
  const news = await News.find({ category: req.params.name });
  res.render("category", { news, category: req.params.name });
});

app.get("/admin", (req, res) => {
  res.render("admin");
});

app.post("/add-news", async (req, res) => {
  const newNews = new News({
    title: req.body.title,
    content: req.body.content,
    category: req.body.category
  });

  await newNews.save();
  res.redirect("/");
});

app.listen(3000, () => {
  console.log("Server running on port 3000");
});