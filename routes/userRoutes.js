const express = require('express');
const router = express.Router();
const {
    getUsers,
    getUserById,
    updateUser,
    deleteUser
} = require('../controllers/userController');
const { getSalesByUser } = require('../controllers/saleController');
const { protect } = require('../middleware/authMiddleware');

router.route('/').get(protect, getUsers);
router.get('/:id/sales', protect, getSalesByUser);
router.route('/:id')
    .get(protect, getUserById)
    .patch(protect, updateUser)
    .delete(protect, deleteUser);

module.exports = router;
