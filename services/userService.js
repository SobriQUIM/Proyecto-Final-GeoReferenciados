const User = require('../models/User');

const getUsers = async () => {
    return await User.find().select('-password');
};

const getUserById = async (id) => {
    const user = await User.findById(id).select('-password');
    if (!user) {
        throw new Error('User not found');
    }
    return user;
};

const updateUser = async (id, userData) => {
    const user = await User.findById(id);

    if (!user) {
        throw new Error('User not found');
    }

    // Update fields
    user.name = userData.name || user.name;
    user.email = userData.email || user.email;
    user.role = userData.role || user.role;
    user.store = userData.store || user.store;

    if (userData.password) {
        user.password = userData.password;
    }

    const updatedUser = await user.save();
    return updatedUser;
};

const deleteUser = async (id) => {
    const user = await User.findById(id);

    if (!user) {
        throw new Error('User not found');
    }

    await user.deleteOne();
    return { id };
};

module.exports = {
    getUsers,
    getUserById,
    updateUser,
    deleteUser
};
