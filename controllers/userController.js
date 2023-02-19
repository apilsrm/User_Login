const User = require("../models/user");
const getDataUri = require("../utils/datauri");
const cloudinary = require("cloudinary");
const { use } = require("../routes/productRoutes");

exports.register = async (req, res) => {
  const { fullName, mobileNo, email, password } = req.body;
  if (!fullName || !mobileNo || !email || !password) {
    return res.status(400).json({
      success: false,
      message: "filled can't be empty!",
    });
  }
  if (!/^\d{10}$|^\d{1,9}$/.test(mobileNo)) {
    return res.status(400).json({
      success: false,
      message: "mobileNo must be 10 digit long!",
    });
  } else if (mobileNo.length < 10) {
    return res.status(400).json({
      success: false,
      message: "mobileNo must be at least 10 digit long!",
    });
  } else if (mobileNo.length > 10) {
    return res.status(400).json({
      success: false,
      message: "mobileNo can't be less than 10 digit!",
    });
  }
  if (!/\S+@\S+\.\S+/.test(email)) {
    return res.status(400).json({
      success: false,
      message: "Email must be valid!",
    });
  }
  if (password.length < 8) {
    return res.status(400).json({
      success: false,
      message: "password must have 8 characters long!",
    });
  }
  let file;
  if (req.file) {
    file = req.file;
    // console.log(file);
  } else {
    return res.status(400).json({
      success: false,
      message: "file is not upload",
    });
  }
  try {
    const exists = await User.findOne({ email });
    if (exists) {
      return res.status(400).json({
        success: false,
        message: "email already exists!",
      });
    }
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
  } catch (error) {
    return res.status(500).json({
      success: false,
      message: error.message,
    });
  }
};

//login

exports.login = async (req, res) => {
  const { email, password } = req.body;
  if (!email || !password) {
    return res.status(500).json({
      success: false,
      message: "filled must be filledd,",
    });
  }
  if (!/\S+@\S+\.\S+/.test(email)) {
    return res.status(400).json({
      success: false,
      message: "Email must be valid!",
    });
  }

  try {
    const user = await User.findOne({ email }).select("+password");
    if (!user) {
      return res.status(400).json({
        success: false,
        message: "user doesnt found",
      });
    }
    const isMatch = await user.comparePassword(password);
    if (!isMatch) {
      return res.status(400).json({
        success: false,
        message: "Invalid credentialst",
      });
    }

    const token = user.getJwtToken();
    return res.status(200).json({
      success: true,
      message: "login successfull",
      user,
      token,
    });
  } catch (error) {
    return res.status(400).json({
      success: false,
      message: error.message,
    });
  }
};

//update profile
exports.profileUpdate = async (req, res) => {
  const { fullName, mobileNo, email } = req.body;
  if (!fullName || !mobileNo || !email) {
    return (
      res.status(400),
      json({
        success: false,
        message: "filled must be filed!",
      })
    );
  }
  if (!/^\d{10}$|^\d{1,9}$/.test(mobileNo)) {
    return res.status(400).json({
      success: false,
      message: "mobileNo must be 10 digit long!",
    });
  } else if (mobileNo.length < 10) {
    return res.status(400).json({
      success: false,
      message: "mobileNo must be at least 10 digit long!",
    });
  } else if (mobileNo.length > 10) {
    return res.status(400).json({
      success: false,
      message: "mobileNo can't be less than 10 digit!",
    });
  }
  if (!/\S+@\S+\.\S+/.test(email)) {
    return res.status(400).json({
      success: false,
      message: "Email must be valid!",
    });
  }
  let file;
  if (req.file) {
    file = req.file;
  } else {
    return res.status(400).json({
      success: false,
      message: "file was not upload!",
    });
  }
  try {
    let user = await User.findById(req.user.id);
    if (!user) {
      return res.status(404).json({
        success: false,
        message: "user not found!",
      });
    }
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
  } catch (error) {
    return res.status(500).json({
      success: false,
      message: error.message,
    });
  }
};

//change password
exports.changePassword = async (req, res) => {
  const { oldPassword, newPassword, confirmPassword } = req.body;
  if (!oldPassword || !newPassword) {
    return res.status(400).json({
      success: false,
      message: "filled must be filled!",
    });
  }
  if (newPassword !== confirmPassword) {
    return res.status(400).json({
      status: false,
      message: "password must be match!",
    });
  }
  try {
    const user = await User.findById(req.user.id).select("+password");
    if (!user) {
      return res.status(400).json({
        success: false,
        message: "User not found!",
      });
    }
    const isMatch = await user.comparePassword(oldPassword);
    if (!isMatch) {
      return res.status(400).json({
        success: false,
        message: "Old password is incorrect!",
      });
    }
    user.password = newPassword;
    await user.save();
    res.status(200).json({
      success: true,
      message: "password changed successfully!",
    });
  } catch (error) {
    return res.status(500).json({
      success: false,
      message: error.message,
    });
  }
};

//logged in  single user

exports.singleUser = async (req, res) => {
  try {
    const user = await User.findById(req.user.id);
    if (!user) {
      return res.status(404).json({
        success: false,
        message: "user doesnot exits",
        user,
      });
    }
    res.status(200).json({
      success: true,
      message: "user get successfully",
      user,
    });
  } catch (error) {
    return res.status(500).json({
      success: false,
      message: error.message,
    });
  }
};

//admin get all user (only admin can)

exports.getAllUsers = async (req, res) => {
  try {
    const user = await User.find();
    if (!user) {
      return res.status(404).json({
        success: false,
        message: "user not found",
        user,
      });
    }
    res.status(200).json({
      success: true,
      message: "user get successfully",
      user,
    });
  } catch (error) {
    return res.status(500).json({
      success: false,
      message: error.message,
    });
  }
};

//get single user by only admin
exports.getSingleUserByAdmin = async (req, res) => {
  try {
    const user = await User.findById(req.params.id);
    if (!user) {
      return res.status(404).json({
        success: false,
        message: "user doesnot exit with this id ",
      });
    }
    res.status(200).json({
      success: true,
      message: "user get successfully",
      user,
    });
  } catch (error) {
    return res.status(500).json({
      success: false,
      message: error.message,
    });
  }
};

//delete user from database(only admin can do)
exports.deleteSingleUser = async (req, res) => {
  try {
    let user = await User.findById(req.params.id);
    if (!user) {
      return res.status(500).json({
        success: false,
        message: "user doesnot exit with this id ",
      });
    }
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
  } catch (error) {
    return res.status(500).json({
      success: false,
      message: error.message,
    });
  }
};
