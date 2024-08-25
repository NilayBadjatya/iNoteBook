const express = require("express");
const router = express.Router();
const User = require("../models/User");
const { body, validationResult } = require("express-validator");
const bcrypt = require("bcryptjs");
var jwt = require("jsonwebtoken");
const JWT_SECRET = "nilaybadjatya";
var fetchuser = require("../middleware/fetchuser");
// Route 1: Create a user using: POST "/api/auth/createuser". No login required

router.post(
  "/createuser",
  [
    // Using Express Validator npm package website version 6.12.0
    body("name", "Enter a valid name").isLength({ min: 3 }),
    body("email", "Enter a valid Email").isEmail(),
    body("password", "Password must be at least 5 characters").isLength({
      min: 5,
    }),
  ],
  async (req, res) => {
    let success = false;
    // If there are errors return Bad Request (express-validator)
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ success, errors: errors.array() });
    }

    try {
      // Check whether the user exists (express-validator)
      const salt = await bcrypt.genSalt(10);
      const secPass = await bcrypt.hash(req.body.password, salt);

      // Create a new user
      const user = await User.create({
        name: req.body.name,
        email: req.body.email,
        password: secPass,
      });

      const data = {
        id: user.id,
      };
      const authtoken = jwt.sign(data, JWT_SECRET);

      // Return the auth token
      success = true;
      res.json({ success, authtoken });
    } catch (err) {
      console.error(err.message);
      res.status(500).send("Internal Server Error");
    }
  }
);

// Route 2: Authenticate a user: POST "/api/auth/login". No login required
router.post(
  "/login",
  [
    // Using Express Validator npm package website version 6.12.0
    body("email", "Enter a valid Email").isEmail(),
    body("password", "Password cannot be blank").exists(),
  ],
  async (req, res) => {
    let success = false;
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ errors: errors.array() });
    }
    const { email, password } = req.body;
    try {
      let user = await User.findOne({ email });
      if (!user) {
        success = false;
        return res
          .status(400)
          .json({ success, error: "Please login with correct credentials" });
      }
      const passwordCompare = await bcrypt.compare(password, user.password);
      if (!passwordCompare) {
        success = false;
        return res
          .status(400)
          .json({ success, error: "Please login with correct credentials" });
      }
      const data = {
        id: user.id,
      };
      const authtoken = jwt.sign(data, JWT_SECRET);

      // Return the auth token
      success = true;
      res.json({ success, authtoken });
    } catch (err) {
      console.error(err.message);
      res.status(500).send("Internal Server Error");
    }
  }
);

// ROUTE 3: Get logged in user details using : POST /api/auth/getuser. Login required
router.post("/getuser", fetchuser, async (req, res) => {
  try {
    userId = req.user.id;
    const user = await User.findById(userId).select("-password");
    res.send(user);
  } catch (err) {
    console.error(err.message);
    res.status(500).send("Internal Server Error");
  }
});
module.exports = router;
