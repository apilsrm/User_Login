const mongoose = require("mongoose");
const bcrypt = require("bcryptjs"); //password encryption  bcrypt npm pack
const jwt = require("jsonwebtoken");

const userSchema = new mongoose.Schema(
  {
    fullName: {
      type: String,
      trim: true,
      maxLength: [20, "Character upto 30!"],
      minLength: [3, "Character nust be 4"],
      required: [true, "please filled FullName"],
    },
    avatar: {
      public_id: {
        type: String,
      },
      url: {
        type: String,
      },
    },
    mobileNo: {
      type: Number,
      required: [true, "Please select a contact "],
    },
    email: {
      type: String,
      required: [true, "Please fill email address"],
    },
    password: {
      type: String,
      maxLength: [20, "Character upto 30!"],
      minLength: [8, "Character nust be 4"],
      required: [true, "must filled password"],
      select: false,
    },
    role: {
      type: String,
      enum: ["admin", "user"],
      default: "user",
    },
  },
  { timestamps: true }
);

//hashed password
userSchema.pre("save", async function (next) {
  if (!this.isModified) return next();
  this.password = await bcrypt.hash(this.password, 10);
  next();
});

//generate tocken
userSchema.methods.getJwtToken = function () {
  return jwt.sign({ id: this._id }, process.env.JWT_SECRET, {
    expiresIn: "2 h",
  });
};

//compare password
userSchema.methods.comparePassword = async function (enterdPassword) {
  return await bcrypt.compare(enterdPassword, this.password);
};

const User = mongoose.model("user", userSchema);

module.exports = User;
