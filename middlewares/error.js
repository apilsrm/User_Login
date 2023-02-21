const ErrorHandler = require("../utils/errorHandler");
module.exports = (err, req, res, next) => {
  err.statusCode = err.statusCode || 500;
  err.message = err.message || "Internal server error!";
  //wrong mongo Id error
  if (err.name === "CastError") {
    const message = `Resource not found :${err.path}`;
    err = new ErrorHandler(message, 400);
  }
  //duplicate fields
  if (err.code === 11000) {
    const message = `Duplicate ${Object.keys(err.keyValue)} Entered`;
    err = new ErrorHandler(message, 400);
  }
  //Json web token error
  if (err.name === "JsonWebTokenError") {
    const message = `Invalid jwt token,try again!`;
    err = new ErrorHandler(message, 400);
  }
  //json web token expired
  if (err.name === "TokenExpiredError") {
    const message = "Token has been expired,try again!";
    err = new ErrorHandler(message, 400);
  }
  res.status(err.statusCode).json({
    success: false,
    message: err.message,
  });
};
