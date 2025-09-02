const bcrypt = require('bcrypt');
const jwt = require('jsonwebtoken');
const { ObjectId } = require('mongodb');

module.exports = function (db) {
  const users = db.collection('users');

  return {
    /**
     * @desc    Register a new user
     * @route   POST /api/users/register
     * @access  Public
     */
    registerUser: async (req, res) => {
      try {
        const { name, email, password, role } = req.body;

        if (!name || !email || !password || !role) {
          return res.status(400).json({ error: "All fields are required" });
        }

        const existing = await users.findOne({ email });
        if (existing) {
          return res.status(400).json({ error: "User already exists" });
        }

        const hashedPassword = await bcrypt.hash(password, 10);

        const result = await users.insertOne({
          name,
          email,
          password: hashedPassword,
          role,
          enrolledCourses: [],
        });

        res.status(201).json({
          message: "User registered successfully",
          userId: result.insertedId
        });
      } catch (err) {
        console.error("Registration Error:", err);
        res.status(500).json({ error: "Internal server error" });
      }
    },

    /**
     * @desc    Authenticate user & get token
     * @route   POST /api/users/login
     * @access  Public
     */
    loginUser: async (req, res) => {
      try {
        const { email, password } = req.body;

        if (!email || !password) {
          return res.status(400).json({ error: "Email and password are required" });
        }

        const user = await users.findOne({ email });
        if (!user) {
          return res.status(401).json({ error: "Invalid email or password" });
        }

        const isPasswordValid = await bcrypt.compare(password, user.password);
        if (!isPasswordValid) {
          return res.status(401).json({ error: "Invalid email or password" });
        }

        const token = jwt.sign(
          { userId: user._id, role: user.role ,  name: user.name },
          process.env.JWT_SECRET,
          { expiresIn: "1h" }
        );

        res.status(200).json({ message: "Login successful", token });
      } catch (err) {
        console.log("Login Error:", err);
        res.status(500).json({ error: "Internal server error" });
      }
    },

    /**
     * @desc    Get user profile
     * @route   GET /api/users/profile
     * @access  Private
     */
    getUserProfile: async (req, res) => {
      try {
        // Find user by ID from the token payload
        const user = await users.findOne(
          { _id: new ObjectId(req.user.userId) }, // <-- USE THE CORRECT ObjectId HERE
          { projection: { password: 0 } }
        );

        if (!user) {
          return res.status(404).json({ error: "User not found" });
        }

        res.status(200).json({ user });
      } catch (err) {
        console.error("Get Profile Error:", err);
        res.status(500).json({ error: "Error fetching profile" });
      }
    }
  };
};
