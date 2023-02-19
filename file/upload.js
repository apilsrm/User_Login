const multer = require("multer");

//storage mpde
const storage = multer.diskStorage({
  destination: function (req, file, cb) {
    cb(null, "./public/gallery");
  },
  filename: function (req, file, cb) {
    cb(null, Date.now() + file.originalname);
  },
});

//filter files
const filefilter = (req, file, cb) => {
  if (
    file.mimeType == "image/jpeg" ||
    file.mimeType === "image/jpg" ||
    file.mimeType === "image/png" ||
    file.mimeType === "image/gif"
  ) {
    cb(null, true);
  } else {
    cb(null, false);
  }
};

const upload = multer({
  storage: storage,
  filefilter: filefilter,
});
module.exports = upload;
