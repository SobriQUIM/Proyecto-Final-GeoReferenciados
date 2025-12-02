const asyncHandler = require('express-async-handler');
const userService = require('../services/userService');

// @desc    Get all users
// @route   GET /api/users
// @access  Private/Admin
const getUsers = asyncHandler(async (req, res) => {
    const users = await userService.getUsers();
    res.status(200).json(users);
});

// @desc    Get user by ID
// @route   GET /api/users/:id
// @access  Private
const getUserById = asyncHandler(async (req, res) => {
    try {
        const user = await userService.getUserById(req.params.id);
        res.status(200).json(user);
    } catch (error) {
        res.status(404);
        throw new Error(error.message);
    }
});

// @desc    Update user
// @route   PATCH /api/users/:id
// @access  Private
const updateUser = asyncHandler(async (req, res) => {
    try {
        const updatedUser = await userService.updateUser(req.params.id, req.body);
        res.status(200).json(updatedUser);
    } catch (error) {
        res.status(400);
        throw new Error(error.message);
    }
});

// @desc    Delete user
// @route   DELETE /api/users/:id
// @access  Private
const deleteUser = asyncHandler(async (req, res) => {
    try {
        const result = await userService.deleteUser(req.params.id);
        res.status(200).json(result);
    } catch (error) {
        res.status(400);
        throw new Error(error.message);
    }
});

module.exports = {
    getUsers,
    getUserById,
    updateUser,
    deleteUser
};
