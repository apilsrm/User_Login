const User = require("../models/user");
const getDataUri = require("../utils/datauri");
const cloudinary = require("cloudinary");
const { use } = require("../routes/productRoutes");
const catchAsyncErrors = require("../middlewares/catchAsyncErrors");
const ErrorHandler = require("../utils/errorHandler");

exports.register = catchAsyncErrors(async (req, res, next) => {
  const { fullName, mobileNo, email, password } = req.body;
  if (!fullName || !mobileNo || !email || !password)
    return next(new ErrorHandler("filled can't be empty!"));

  if (!/^\d{10}$|^\d{1,9}$/.test(mobileNo))
    return next(new ErrorHandler("mobileNo must be 10 digit long!"));
  else if (mobileNo.length < 10)
    return next(new ErrorHandler("mobileNo must be at least 10 digit long!"));
  else if (mobileNo.length > 10)
    return next(new ErrorHandler("mobileNo can't be less than 10 digit!"));

  if (!/\S+@\S+\.\S+/.test(email))
    return next(new ErrorHandler("Email must be valid !"));

  if (password.length < 8)
    return next(new ErrorHandler("password must have 8 characters long!"));

  let file;
  if (req.file) {
    file = req.file;
    // console.log(file);
  } else return next(new ErrorHandler("file is not upload", 400));
  const exists = await User.findOne({ email });
  if (exists) return next(new ErrorHandler("email already exits!", 400));

  const fileUri = getDataUri(file);
  const myCloud = await cloudinary.v2.uploader.upload(fileUri.content, {
    folder: "user_profileImg",
  });

  const user = await User.create({
    fullName,
    mobileNo,
    email,
    password,
    avatar: {
      public_id: myCloud.public_id,
      url: myCloud.secure_url,
    },
  });
  res.status(200).json({
    success: true,
    message: "user register successfully!",
    user,
  });
});

//login

exports.login = catchAsyncErrors(async (req, res, next) => {
  const { email, password } = req.body;
  if (!email || !password)
    return next(new ErrorHandler("filled must be filled!", 400));

  if (!/\S+@\S+\.\S+/.test(email))
    return next(new ErrorHandler("email must be valid!", 400));

  const user = await User.findOne({ email }).select("+password");
  if (!user) return next(new ErrorHandler("user doesnot found!", 400));

  const isMatch = await user.comparePassword(password);
  if (!isMatch) return next(new ErrorHandler("Invalid credentialst", 400));

  const token = user.getJwtToken();
  return res.status(200).json({
    success: true,
    message: "login successfull",
    user,
    token,
  });
});

//update profile
exports.profileUpdate = catchAsyncErrors(async (req, res, next) => {
  const { fullName, mobileNo, email } = req.body;
  if (!fullName || !mobileNo || !email)
    return next(new ErrorHandler("filled must be filled!", 400));

  if (!/^\d{10}$|^\d{1,9}$/.test(mobileNo))
    return next(new ErrorHandler("Please input valid number", 400));
  else if (mobileNo.length < 10)
    return next(new ErrorHandler("mobileNo must be at least 10 digit!", 400));
  else if (mobileNo.length > 10)
    return next(new ErrorHandler("mobileNo can't be more than 10 digit!", 400));

  if (!/\S+@\S+\.\S+/.test(email))
    return next(new ErrorHandler("email must be valid", 400));

  let file;
  if (req.file) {
    file = req.file;
  } else return next(new ErrorHandler("file was not upload", 400));

  let user = await User.findById(req.user.id);
  if (!user) return next(new ErrorHandler("user not found", 400));

  let myCloud;
  if (file) {
    if (user.avatar.public_id) {
      await cloudinary.v2.uploader.destroy(user.avatar.public_id, {
        folder: "user_profileImg",
      });
    }
    const fileUri = getDataUri(file);
    myCloud = await cloudinary.v2.uploader.upload(fileUri.content, {
      folder: "user_profileImg",
    });
  }
  user = await User.findByIdAndUpdate(
    req.user.id,
    {
      fullName,
      mobileNo,
      email,
      avatar: {
        public_id: myCloud.public_id,
        url: myCloud.secure_url,
      },
    },
    { new: true, runValidators: true, useFindAndModify: false }
  );
  res.status(200).json({
    success: true,
    message: "profile updated successfully! ",
    user,
  });
});

//change password
exports.changePassword = catchAsyncErrors(async (req, res, next) => {
  const { oldPassword, newPassword, confirmPassword } = req.body;
  if (!oldPassword || !newPassword)
    return next(new ErrorHandler("filled must be filled", 400));

  if (newPassword !== confirmPassword)
    return next(new ErrorHandler("password must be filled", 400));

  const user = await User.findById(req.user.id).select("+password");
  if (!user) return next(new ErrorHandler("user not found", 400));

  const isMatch = await user.comparePassword(oldPassword);
  if (!isMatch) return next(new ErrorHandler("old password is incorrest", 400));

  user.password = newPassword;
  await user.save();
  res.status(200).json({
    success: true,
    message: "password changed successfully!",
  });
});

//logged in  single user

exports.singleUser = catchAsyncErrors(async (req, res, next) => {
  const user = await User.findById(req.user.id);
  if (!user) return next(new ErrorHandler("user doesnot exits", 404));

  res.status(200).json({
    success: true,
    message: "user get successfully",
    user,
  });
});

//admin get all user (only admin can)

exports.getAllUsers = catchAsyncErrors(async (req, res, next) => {
  const user = await User.find();
  if (!user) return next(new ErrorHandler("user not found", 404));
  res.status(200).json({
    success: true,
    message: "user get successfully",
    user,
  });
});

//get single user by only admin
exports.getSingleUserByAdmin = catchAsyncErrors(async (req, res, next) => {
  const user = await User.findById(req.params.id);
  if (!user)
    return next(new ErrorHandler("user doesnot  exits with this id", 404));
  res.status(200).json({
    success: true,
    message: "user get successfully",
    user,
  });
});

//delete user from database(only admin can do)
exports.deleteSingleUser = catchAsyncErrors(async (req, res, next) => {
  let user = await User.findById(req.params.id);
  if (!user) return next(new ErrorHandler("user not found", 404));

  const imgId = user.avatar.public_id;
  if (imgId) {
    await cloudinary.v2.uploader.destroy(imgId, {
      folder: "user_profileImg",
    });
  }

  await user.remove();
  res.status(200).json({
    success: true,
    message: "user remove successfully",
  });
});
