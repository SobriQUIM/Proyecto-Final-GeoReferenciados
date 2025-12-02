const asyncHandler = require('express-async-handler');
const authService = require('../services/authService');

// @desc    Register new user
// @route   POST /api/auth/register
// @access  Public
const registerUser = asyncHandler(async (req, res) => {
    try {
        const user = await authService.registerUser(req.body);
        res.status(201).json(user);
    } catch (error) {
        res.status(400);
        throw new Error(error.message);
    }
});

// @desc    Authenticate a user
// @route   POST /api/auth/login
// @access  Public
const loginUser = asyncHandler(async (req, res) => {
    try {
        const user = await authService.loginUser(req.body);
        res.json(user);
    } catch (error) {
        res.status(400);
        throw new Error(error.message);
    }
});

// @desc    Get user data
// @route   GET /api/auth/me
// @access  Private
const getMe = asyncHandler(async (req, res) => {
    const user = await authService.getMe(req.user.id);
    res.status(200).json(user);
});

module.exports = {
    registerUser,
    loginUser,
    getMe
};
