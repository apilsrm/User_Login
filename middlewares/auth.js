const User = require("../models/user");
const jwt = require("jsonwebtoken");
exports.auth = async (req, res, next) => {
  try {
    let token = req?.headers?.authorization?.replace("Bearer ", "");
    if (!token) {
      return res.status(401).json({
        success: false,
        message: "please login at first!",
      });
    }
    const decodedData = jwt.verify(token, process.env.JWT_SECRET);
    const user = await User.findById(decodedData.id);
    if (!user) {
      return res.status(404).json({
        success: false,
        message: "user not found!",
      });
    }
    req.user = user;
    next();
  } catch (error) {
    if (error.name === "TokenExpiredError") {
      return res.status(401).json({
        success: false,
        message: "Token Expired!",
      });
    } else {
      return (
        res.status(500),
        json({
          success: false,
          message: error.message,
        })
      );
    }
  }
};

//authorize (admin/role)

exports.isAuthAdmin = (req, res, next) => {
  if (!req.user) {
    return res.status(401).json({
      success: false,
      message: "you must be authenticate to acces this resources",
    });
  }

  if (req.user.role !== "admin") {
    return res.status(403).json({
      success: false,
      message: `${req.user.role} is not authorize to access this resources`,
    });
  }
  next();
};
