const Product = require('../models/Product');
const Store = require('../models/Store');

const getProducts = async () => {
    return await Product.find().populate('store', 'name');
};

const getProductById = async (id) => {
    const product = await Product.findById(id).populate('store', 'name');
    if (!product) {
        throw new Error('Product not found');
    }
    return product;
};

const createProduct = async (productData) => {
    // Verify store exists
    const store = await Store.findById(productData.store);
    if (!store) {
        throw new Error('Store not found');
    }

    const product = await Product.create(productData);
    return product;
};

const updateProduct = async (id, productData) => {
    const product = await Product.findByIdAndUpdate(id, productData, {
        new: true,
        runValidators: true
    }).populate('store', 'name');

    if (!product) {
        throw new Error('Product not found');
    }

    return product;
};

const deleteProduct = async (id) => {
    const product = await Product.findById(id);

    if (!product) {
        throw new Error('Product not found');
    }

    await product.deleteOne();
    return { id };
};

module.exports = {
    getProducts,
    getProductById,
    createProduct,
    updateProduct,
    deleteProduct
};
