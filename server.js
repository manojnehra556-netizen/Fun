const express = require("express");
const mongoose = require("mongoose");
const path = require("path");

const app = express();

// ===== MONGODB CONNECT =====
mongoose.connect(process.env.MONGO_URI)
.then(() => console.log("MongoDB Connected"))
.catch(err => console.log(err));

// ===== MIDDLEWARE =====
app.set("view engine", "ejs");
app.use(express.urlencoded({ extended: true }));
app.use(express.static(path.join(__dirname, "public")));

// ===== SCHEMA =====
const newsSchema = new mongoose.Schema({
  title: String,
  content: String,
  image: String,
  category: String,
  location: String,
  createdAt: {
    type: Date,
    default: Date.now
  }
});

const News = mongoose.model("News", newsSchema);

// ===== HOME ROUTE =====
app.get("/", async (req, res) => {
  try {

    const latest = await News.find()
      .sort({ createdAt: -1 })
      .limit(3);

    const local = await News.find({ category: "Local" })
      .sort({ createdAt: -1 })
      .limit(2);

    const sports = await News.find({ category: "Sports" })
      .sort({ createdAt: -1 })
      .limit(2);

    res.render("index", {
      latest: latest || [],
      local: local || [],
      sports: sports || []
    });

  } catch (error) {
    console.log(error);
    res.send("Error loading homepage");
  }
});

// ===== CATEGORY =====
app.get("/category/:name", async (req, res) => {
  try {
    const posts = await News.find({ category: req.params.name })
      .sort({ createdAt: -1 });

    res.render("category", { posts: posts || [], category: req.params.name });
  } catch (error) {
    res.send("Category Error");
  }
});

// ===== DETAILS =====
app.get("/news/:id", async (req, res) => {
  try {
    const post = await News.findById(req.params.id);
    res.render("details", { post });
  } catch (error) {
    res.send("Details Error");
  }
});

// ===== ADMIN =====
app.get("/admin", (req, res) => {
  res.render("admin");
});

app.post("/admin/add", async (req, res) => {
  try {
    await News.create(req.body);
    res.redirect("/admin");
  } catch (error) {
    res.send("Add Error");
  }
});

// ===== START SERVER =====
const PORT = process.env.PORT || 3000;
app.listen(PORT, () => console.log("Server running on port " + PORT));