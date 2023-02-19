const { diskStorage } = require("multer");
const multer = require("multer");
//make storage
const storage = multer.memoryStorage();
//diskStorage  ma file formate ma ......memoryStorage ma datauri  formate npm run store huncha

const singleUpload = multer({ storage }).single("file");

module.exports = singleUpload;
