const express = require('express');
const jwt = require('jsonwebtoken');
const User = require('../models/User');
const authMiddleware = require('../middleware/authMiddleware'); // For future use with secured routes
const router = express.Router();

const SECRET_KEY = process.env.SECRET_KEY;

/**
 * @route POST /api/users/register
 * @desc Register a new user
 * @access Public
 */
router.post('/register', async (req, res) => {
  const { username, password } = req.body;

  try {
    // Check if username already exists
    const existingUser = await User.findOne({ username });
    if (existingUser) {
      return res.status(400).json({ error: 'Username is already taken.' });
    }

    // Create a new user
    const newUser = new User({ username, password });
    await newUser.save();

    res.status(201).json({ message: 'User registered successfully!' });
  } catch (err) {
    res.status(500).json({ error: 'Server error: Unable to register user.' });
  }
});

/**
 * @route POST /api/users/login
 * @desc Login user and return a JWT
 * @access Public
 */
router.post('/login', async (req, res) => {
  const { username, password } = req.body;

  try {
    // Check if user exists
    const user = await User.findOne({ username });
    if (!user) {
      return res.status(404).json({ error: 'User not found.' });
    }

    // Verify password
    const isMatch = await user.comparePassword(password);
    if (!isMatch) {
      return res.status(401).json({ error: 'Invalid password.' });
    }

    // Generate JWT
    const token = jwt.sign({ id: user._id, username: user.username }, SECRET_KEY, {
      expiresIn: '1h', // Token expires in 1 hour
    });

    res.json({ token, username: user.username, message: 'Login successful!' });
  } catch (err) {
    res.status(500).json({ error: 'Server error: Unable to log in.' });
  }
});
/**
 * @route GET /api/users/profile
 * @desc Get user profile (Example of protected route)
 * @access Private
 */
router.get('/profile', authMiddleware, async (req, res) => {
  try {
    const user = await User.findById(req.user.id).select('-password'); // Exclude password from response
    if (!user) return res.status(404).json({ error: 'User not found.' });

    res.json(user);
  } catch (err) {
    res.status(500).json({ error: 'Server error: Unable to fetch profile.' });
  }
});

module.exports = router;
