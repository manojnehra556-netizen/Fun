const express = require("express");
const mongoose = require("mongoose");
const path = require("path");
const News = require("./models/News");

const app = express();

// MongoDB Connect
mongoose.connect("YOUR_MONGODB_STRING")
.then(() => console.log("MongoDB Connected"))
.catch(err => console.log(err));

app.set("view engine", "ejs");
app.use(express.urlencoded({ extended: true }));
app.use(express.static(path.join(__dirname, "public")));

// =================== HOME ===================

app.get("/", async (req, res) => {

  const latestPosts = await News.find()
    .sort({ createdAt: -1 })
    .limit(3);

  const local = await News.find({ category: "Local" })
    .sort({ createdAt: -1 })
    .limit(2);

  const sports = await News.find({ category: "Sports" })
    .sort({ createdAt: -1 })
    .limit(2);

  const business = await News.find({ category: "Business" })
    .sort({ createdAt: -1 })
    .limit(2);

  res.render("index", {
    latest: latestPosts,
    local,
    sports,
    business
  });
});

// =================== CATEGORY PAGE ===================

app.get("/category/:name", async (req, res) => {
  const posts = await News.find({ category: req.params.name })
    .sort({ createdAt: -1 });

  res.render("category", { posts, category: req.params.name });
});

// =================== DETAILS PAGE ===================

app.get("/news/:id", async (req, res) => {
  const post = await News.findById(req.params.id);
  res.render("details", { post });
});

// =================== ADMIN PAGE ===================

app.get("/admin", (req, res) => {
  res.render("admin");
});

app.post("/admin/add", async (req, res) => {
  await News.create(req.body);
  res.redirect("/admin");
});

// =================== SERVER START ===================

const PORT = process.env.PORT || 3000;
app.listen(PORT, () => console.log("Server Running"));