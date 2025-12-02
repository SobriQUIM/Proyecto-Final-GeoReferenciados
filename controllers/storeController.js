const asyncHandler = require('express-async-handler');
const storeService = require('../services/storeService');

// @desc    Get all stores
// @route   GET /api/stores
// @access  Private
const getStores = asyncHandler(async (req, res) => {
    const stores = await storeService.getStores();
    res.status(200).json(stores);
});

// @desc    Get store by ID
// @route   GET /api/stores/:id
// @access  Private
const getStoreById = asyncHandler(async (req, res) => {
    try {
        const store = await storeService.getStoreById(req.params.id);
        res.status(200).json(store);
    } catch (error) {
        res.status(404);
        throw new Error(error.message);
    }
});

// @desc    Create new store
// @route   POST /api/stores
// @access  Private
const createStore = asyncHandler(async (req, res) => {
    try {
        const store = await storeService.createStore(req.body);
        res.status(201).json(store);
    } catch (error) {
        res.status(400);
        throw new Error(error.message);
    }
});

// @desc    Update store
// @route   PATCH /api/stores/:id
// @access  Private
const updateStore = asyncHandler(async (req, res) => {
    try {
        const store = await storeService.updateStore(req.params.id, req.body);
        res.status(200).json(store);
    } catch (error) {
        res.status(400);
        throw new Error(error.message);
    }
});

// @desc    Delete store
// @route   DELETE /api/stores/:id
// @access  Private
const deleteStore = asyncHandler(async (req, res) => {
    try {
        const result = await storeService.deleteStore(req.params.id);
        res.status(200).json(result);
    } catch (error) {
        res.status(400);
        throw new Error(error.message);
    }
});

// @desc    Search stores
// @route   GET /api/stores/search
// @access  Private
const searchStores = asyncHandler(async (req, res) => {
    const stores = await storeService.searchStores(req.query);
    res.status(200).json(stores);
});

module.exports = {
    getStores,
    getStoreById,
    createStore,
    updateStore,
    deleteStore,
    searchStores
};
