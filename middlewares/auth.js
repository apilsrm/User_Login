const User = require("../models/user");
const jwt = require("jsonwebtoken");
const catchAsyncErrors = require("./catchAsyncErrors");
const ErrorHandler = require("../utils/errorHandler");

exports.auth = catchAsyncErrors(async (req, res, next) => {
  let token = req?.headers?.authorization?.replace("Bearer ", "");
  if (!token) return next(new ErrorHandler("Please login at first !", 401));

  const decodedData = jwt.verify(token, process.env.JWT_SECRET);
  const user = await User.findById(decodedData.id);
  if (!user) {
    return next(new ErrorHandler("User not found !", 404));
  }
  req.user = user;
  next();

  if (error.name === "TokenExpiredError") {
    return next(new ErrorHandler("Token Expired !", 401));
  }
});

//authorize (admin/role)

exports.isAuthAdmin = catchAsyncErrors((req, res, next) => {
  if (!req.user) {
    return next(
      new ErrorHandler("you must be authenticate to acces this resources!", 401)
    );
  }

  if (req.user.role !== "admin") {
    return next(
      new ErrorHandler(
        `${req.user.role} is not authorize to access this resources`,
        401
      )
    );
  }
  next();
});
