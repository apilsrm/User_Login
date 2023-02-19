const express = require("express");
const path = require("path");
const mongoose = require("mongoose");
mongoose.set("strictQuery", true);
const dotenv = require("dotenv");
const colors = require("colors");
const ConnectionDB = require("./config/db");
const logger = require("morgan"); //its showa hit method in console
const cloudinary = require("cloudinary");

//configure
dotenv.config();
const app = express();
app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(logger("dev"));

//handeled  onCaughtexception      //execution ko bela ko error lai
process.on("uncaughtException", (err) => {
  console.log(`Error:${err.message}`.red);
  console.log(`Shutting  down the server to handled unCaughtException`);
});
//console.log(youtube); //execution ko bela ko error lai

//database connect
ConnectionDB();
//Cloudinary Configuration
cloudinary.v2.config({
  cloud_name: process.env.CLOUDINARY_CLIENT_NAME,
  api_key: process.env.CLOUDINARY_API_KEY,
  api_secret: process.env.CLOUDINARY_API_SECRET,
});

//routes
app.use("/api/v1", require("./routes/userRoutes"));

//url to provide access for inage
app.use(express.static("public/gallery"));

//server is working or not
app.get("/", (req, res) => {
  res.send("<h1>Server is running</h1>");
});

//port
const PORT = process.env.PORT;
app.listen(PORT, () => {
  console.log(
    `Server is running at port: http://localhost:${PORT}`.cyan.underline.bold
  );
});

//to handeled promise rejection
process.on("", (err) => {
  console.log(`Error:${err.message}`.red);
  console.log(`Shutting  down the server to handled promise rejection`);
  server.close(() => {
    process.exit(1);
  });
});
