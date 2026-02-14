const express = require("express");
const mongoose = require("mongoose");
const bodyParser = require("body-parser");
const path = require("path");

const app = express();

/* ================= DATABASE ================= */

mongoose.connect(process.env.MONGO_URI || "mongodb://127.0.0.1:27017/jilaUpdate")
.then(()=>console.log("Mongo Connected"))
.catch(err=>console.log(err));

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
  isTop: { type: Boolean, default: false },
  createdAt: { type: Date, default: Date.now },
  views: { type: Number, default: 0 }
});

const News = mongoose.model("News", newsSchema);

/* ================= HOME ================= */

app.get("/", async (req,res)=>{
  const breakingNews = await News.find({isBreaking:true}).sort({createdAt:-1});
  const topNews = await News.find({isTop:true}).sort({createdAt:-1});
  const localNews = await News.find({category:"Local"}).sort({createdAt:-1}).limit(2);
  const sportsNews = await News.find({category:"Sports"}).sort({createdAt:-1}).limit(2);
  const businessNews = await News.find({category:"Business"}).sort({createdAt:-1}).limit(2);
const politicsNews = await News.find({ category: "Politics" })
  .sort({ createdAt: -1 })
  .limit(2);

  res.render("index",{
    breakingNews,
    topNews,
    localNews,
    sportsNews,
    businessNews
  });
});

/* ================= CATEGORY ================= */

app.get("/category/:name", async (req,res)=>{
  const news = await News.find({category:req.params.name}).sort({createdAt:-1});
  res.render("category",{category:req.params.name,news});
});

/* ================= NEWS DETAIL ================= */

app.get("/news/:id", async (req,res)=>{
  const news = await News.findById(req.params.id);
  if(!news) return res.send("Not Found");

  news.views++;
  await news.save();

  res.render("news-detail",{news});
});

/* ================= ADMIN ================= */

app.get("/admin", async (req,res)=>{
  const allNews = await News.find().sort({createdAt:-1});
  res.render("admin",{allNews});
});

app.post("/admin/add", async (req,res)=>{
  const news = new News({
    title:req.body.title,
    content:req.body.content,
    category:req.body.category,
    image:req.body.image,
    isBreaking:req.body.isBreaking==="on",
    isTop:req.body.isTop==="on"
  });
  await news.save();
  res.redirect("/admin");
});

app.get("/admin/delete/:id", async (req,res)=>{
  await News.findByIdAndDelete(req.params.id);
  res.redirect("/admin");
});

/* ================= PORT ================= */

app.listen(process.env.PORT || 3000, ()=>{
  console.log("Server Running");
});