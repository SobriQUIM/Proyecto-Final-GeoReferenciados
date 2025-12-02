const User = require('../models/User');
const jwt = require('jsonwebtoken');

// Generate JWT
const generateToken = (id) => {
    return jwt.sign({ id }, process.env.JWT_SECRET, {
        expiresIn: '30d'
    });
};

const registerUser = async (userData) => {
    const { name, email, password, role, store } = userData;

    // Check if user exists
    const userExists = await User.findOne({ email });

    if (userExists) {
        throw new Error('User already exists');
    }

    // Create user
    const user = await User.create({
        name,
        email,
        password,
        role,
        store
    });

    if (user) {
        return {
            _id: user.id,
            name: user.name,
            email: user.email,
            role: user.role,
            store: user.store,
            token: generateToken(user.id)
        };
    } else {
        throw new Error('Invalid user data');
    }
};

const loginUser = async (userData) => {
    const { email, password } = userData;

    // Check for user email
    const user = await User.findOne({ email }).select('+password');

    if (user && (await user.matchPassword(password))) {
        return {
            _id: user.id,
            name: user.name,
            email: user.email,
            role: user.role,
            store: user.store,
            token: generateToken(user.id)
        };
    } else {
        throw new Error('Invalid credentials');
    }
};

const getMe = async (userId) => {
    const user = await User.findById(userId);
    return {
        id: user.id,
        name: user.name,
        email: user.email,
        role: user.role,
        store: user.store
    };
};

module.exports = {
    registerUser,
    loginUser,
    getMe
};
