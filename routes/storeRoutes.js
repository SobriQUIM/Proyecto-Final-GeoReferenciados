const express = require('express');
const router = express.Router();
const {
    getStores,
    getStoreById,
    createStore,
    updateStore,
    deleteStore,
    searchStores
} = require('../controllers/storeController');
const { getSalesByStore } = require('../controllers/saleController');
const { protect } = require('../middleware/authMiddleware');

// Note: Put specific routes like /search BEFORE /:id to avoid conflict
router.get('/search', protect, searchStores);
router.get('/:id/sales', protect, getSalesByStore);

router.route('/')
    .get(protect, getStores)
    .post(protect, createStore);

router.route('/:id')
    .get(protect, getStoreById)
    .patch(protect, updateStore)
    .delete(protect, deleteStore);

module.exports = router;
