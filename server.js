// const express = require("express");
// const app = express();
const app =require('./app');
const dbConnect = require('./database connection/config');
require("dotenv").config();
const cloudinary=require("cloudinary");

// cloudinary Configuration
cloudinary.config({
  cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
  api_key: process.env.CLOUDINARY_API_KEY,
  api_secret: process.env.CLOUDINARY_API_SECRET,
});

const PORT = process.env.PORT || 5000;

app.listen(PORT, async() => {
    await dbConnect();
  console.log(`Server runs on http://localhost:${PORT}`);
});
