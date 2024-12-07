const express = require('express');
const Post = require('../models/Post');
const authMiddleware = require('../middleware/authMiddleware'); // Middleware for JWT verification
const router = express.Router();

/**
 * @route POST /api/posts
 * @desc Create a new post
 * @access Private
 */
router.post('/', authMiddleware, async (req, res) => {
  try {
    const newPost = new Post({
      title: req.body.title,
      content: req.body.content,
    });
    const savedPost = await newPost.save();
    res.status(201).json(savedPost);
  } catch (err) {
    res.status(400).json({ error: err.message });
  }
});

/**
 * @route GET /api/posts
 * @desc Get all posts
 * @access Public
 */
router.get('/', async (req, res) => {
  try {
    const posts = await Post.find();
    res.json(posts);
  } catch (err) {
    res.status(400).json({ error: err.message });
  }
});

/**
 * @route GET /api/posts/:id
 * @desc Get a single post by ID
 * @access Public
 */
router.get('/:id', async (req, res) => {
  try {
    const post = await Post.findById(req.params.id);
    if (!post) return res.status(404).json({ error: 'Post not found.' });
    res.json(post);
  } catch (err) {
    res.status(400).json({ error: err.message });
  }
});

/**
 * @route PUT /api/posts/:id
 * @desc Update a post by ID
 * @access Private
 */
router.put('/:id', authMiddleware, async (req, res) => {
  try {
    const updatedPost = await Post.findByIdAndUpdate(
      req.params.id,
      { title: req.body.title, content: req.body.content },
      { new: true }
    );
    if (!updatedPost) return res.status(404).json({ error: 'Post not found.' });
    res.json(updatedPost);
  } catch (err) {
    res.status(400).json({ error: err.message });
  }
});

/**
 * @route DELETE /api/posts/:id
 * @desc Delete a post by ID
 * @access Private
 */
router.delete('/:id', authMiddleware, async (req, res) => {
  try {
    const deletedPost = await Post.findByIdAndDelete(req.params.id);
    if (!deletedPost) return res.status(404).json({ error: 'Post not found.' });
    res.json({ message: 'Post deleted successfully.' });
  } catch (err) {
    res.status(400).json({ error: err.message });
  }
});

/**
 * @route PUT /api/posts/like/:id
 * @desc Like a post by ID
 * @access Private
 */
router.put('/like/:id', authMiddleware, async (req, res) => {
  try {
    const post = await Post.findById(req.params.id);
    if (!post) return res.status(404).json({ error: 'Post not found.' });
    post.likes++;
    await post.save();
    res.json(post);
  } catch (err) {
    res.status(400).json({ error: err.message });
  }
});

/**
 * @route PUT /api/posts/dislike/:id
 * @desc Dislike a post by ID
 * @access Private
 */
router.put('/dislike/:id', authMiddleware, async (req, res) => {
  try {
    const post = await Post.findById(req.params.id);
    if (!post) return res.status(404).json({ error: 'Post not found.' });
    post.dislikes++;
    await post.save();
    res.json(post);
  } catch (err) {
    res.status(400).json({ error: err.message });
  }
});

/**
 * @route POST /api/posts/comment/:id
 * @desc Add a comment to a post by ID
 * @access Private
 */
router.post('/comment/:id', authMiddleware, async (req, res) => {
  const { username, comment } = req.body;
  try {
    const post = await Post.findById(req.params.id);
    if (!post) return res.status(404).json({ error: 'Post not found.' });
    post.comments.push({ username, comment });
    await post.save();
    res.json(post);
  } catch (err) {
    res.status(400).json({ error: err.message });
  }
});

module.exports = router;
