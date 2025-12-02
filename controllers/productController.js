const asyncHandler = require('express-async-handler');
const productService = require('../services/productService');

// @desc    Get all products
// @route   GET /api/products
// @access  Private
const getProducts = asyncHandler(async (req, res) => {
    const products = await productService.getProducts();
    res.status(200).json(products);
});

// @desc    Get product by ID
// @route   GET /api/products/:id
// @access  Private
const getProductById = asyncHandler(async (req, res) => {
    try {
        const product = await productService.getProductById(req.params.id);
        res.status(200).json(product);
    } catch (error) {
        res.status(404);
        throw new Error(error.message);
    }
});

// @desc    Create new product
// @route   POST /api/products
// @access  Private
const createProduct = asyncHandler(async (req, res) => {
    try {
        const product = await productService.createProduct(req.body);
        res.status(201).json(product);
    } catch (error) {
        res.status(400);
        throw new Error(error.message);
    }
});

// @desc    Update product
// @route   PATCH /api/products/:id
// @access  Private
const updateProduct = asyncHandler(async (req, res) => {
    try {
        const product = await productService.updateProduct(req.params.id, req.body);
        res.status(200).json(product);
    } catch (error) {
        res.status(400);
        throw new Error(error.message);
    }
});

// @desc    Delete product
// @route   DELETE /api/products/:id
// @access  Private
const deleteProduct = asyncHandler(async (req, res) => {
    try {
        const result = await productService.deleteProduct(req.params.id);
        res.status(200).json(result);
    } catch (error) {
        res.status(400);
        throw new Error(error.message);
    }
});

module.exports = {
    getProducts,
    getProductById,
    createProduct,
    updateProduct,
    deleteProduct
};
