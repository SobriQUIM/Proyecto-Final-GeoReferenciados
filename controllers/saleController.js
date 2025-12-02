const asyncHandler = require('express-async-handler');
const saleService = require('../services/saleService');

// @desc    Create new sale
// @route   POST /api/sales
// @access  Private
const createSale = asyncHandler(async (req, res) => {
    try {
        // Add user from token to body
        req.body.user = req.user.id;
        const sale = await saleService.createSale(req.body);
        res.status(201).json(sale);
    } catch (error) {
        res.status(400);
        throw new Error(error.message);
    }
});

// @desc    Get all sales
// @route   GET /api/sales
// @access  Private/Admin
const getSales = asyncHandler(async (req, res) => {
    const sales = await saleService.getSales();
    res.status(200).json(sales);
});

// @desc    Get sale by ID
// @route   GET /api/sales/:id
// @access  Private
const getSaleById = asyncHandler(async (req, res) => {
    try {
        const sale = await saleService.getSaleById(req.params.id);
        res.status(200).json(sale);
    } catch (error) {
        res.status(404);
        throw new Error(error.message);
    }
});

// @desc    Get sales by store
// @route   GET /api/stores/:id/sales
// @access  Private
const getSalesByStore = asyncHandler(async (req, res) => {
    const sales = await saleService.getSalesByStore(req.params.id);
    res.status(200).json(sales);
});

// @desc    Get sales by user
// @route   GET /api/users/:id/sales
// @access  Private
const getSalesByUser = asyncHandler(async (req, res) => {
    const sales = await saleService.getSalesByUser(req.params.id);
    res.status(200).json(sales);
});

module.exports = {
    createSale,
    getSales,
    getSaleById,
    getSalesByStore,
    getSalesByUser
};
