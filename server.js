const express = require("express");
const mongoose = require("mongoose");
const bodyParser = require("body-parser");

const app = express();

/* ================= DATABASE ================= */

mongoose.connect(process.env.MONGO_URI || "mongodb://127.0.0.1:27017/jilaUpdate")
.then(()=> console.log("Mongo Connected"))
.catch(err=> console.log(err));

/* ================= MIDDLEWARE ================= */

app.use(bodyParser.urlencoded({ extended:true }));
app.use(express.static("public"));
app.set("view engine","ejs");

/* ================= SCHEMA ================= */

const newsSchema = new mongoose.Schema({
  title:String,
  content:String,
  category:String,
  image:String,
  location:String,
  isBreaking:{ type:Boolean, default:false },
  isLive:{ type:Boolean, default:false },
  createdAt:{ type:Date, default:Date.now }
});

const News = mongoose.model("News", newsSchema);

/* ================= HOME ================= */

app.get("/", async (req,res)=>{
  try{

    const breakingNews = await News.find({ isBreaking:true })
      .sort({ createdAt:-1 });

    res.render("index",{
      breakingNews: breakingNews || []
    });

  }catch(err){
    console.log(err);
    res.send("Error loading homepage");
  }
});

/* ================= CATEGORY ================= */

app.get("/category/:name", async (req,res)=>{
  try{
    const news = await News.find({ category:req.params.name })
      .sort({ createdAt:-1 });

    res.render("category",{
      category:req.params.name,
      news
    });

  }catch(err){
    res.send("Category Error");
  }
});

/* ================= NEWS DETAIL ================= */

app.get("/news/:id", async (req,res)=>{
  try{
    const news = await News.findById(req.params.id);
    if(!news) return res.send("Not Found");

    res.render("news-detail",{ news });

  }catch(err){
    res.send("News Error");
  }
});

/* ================= ADMIN ================= */

app.get("/admin", async (req,res)=>{
  const allNews = await News.find().sort({ createdAt:-1 });
  res.render("admin",{ allNews });
});

app.post("/admin/add", async (req,res)=>{
  await News.create({
    title:req.body.title,
    content:req.body.content,
    category:req.body.category,
    image:req.body.image,
    location:req.body.location,
    isBreaking:req.body.isBreaking === "on",
    isLive:req.body.isLive === "on"
  });

  res.redirect("/admin");
});

/* ================= PORT ================= */

const PORT = process.env.PORT || 3000;
app.listen(PORT, ()=> console.log("Server running"));