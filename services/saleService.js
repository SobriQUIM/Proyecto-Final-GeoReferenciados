const Sale = require('../models/Sale');
const Product = require('../models/Product');
const Store = require('../models/Store');

const createSale = async (saleData) => {
    const { user, store, products } = saleData;

    // Verify store exists
    const storeExists = await Store.findById(store);
    if (!storeExists) {
        throw new Error('Store not found');
    }

    let total = 0;
    const productsToSave = [];

    // Iterate through products to check stock and calculate total
    for (const item of products) {
        const product = await Product.findById(item.product);

        if (!product) {
            throw new Error(`Product not found: ${item.product}`);
        }

        if (product.store.toString() !== store) {
            throw new Error(`Product ${product.name} does not belong to this store`);
        }

        if (product.stock < item.quantity) {
            throw new Error(`Insufficient stock for product: ${product.name}`);
        }

        // Deduct stock
        product.stock -= item.quantity;
        await product.save();

        total += product.price * item.quantity;

        productsToSave.push({
            product: product._id,
            quantity: item.quantity,
            priceAtSale: product.price
        });
    }

    // Create sale
    const sale = await Sale.create({
        user,
        store,
        products: productsToSave,
        total,
        date: Date.now()
    });

    return await Sale.findById(sale._id)
        .populate('user', 'name email')
        .populate('store', 'name address')
        .populate('products.product', 'name');
};

const getSales = async () => {
    return await Sale.find()
        .populate('user', 'name')
        .populate('store', 'name')
        .sort({ date: -1 });
};

const getSaleById = async (id) => {
    const sale = await Sale.findById(id)
        .populate('user', 'name email')
        .populate('store', 'name address')
        .populate('products.product', 'name price');

    if (!sale) {
        throw new Error('Sale not found');
    }

    return sale;
};

const getSalesByStore = async (storeId) => {
    return await Sale.find({ store: storeId })
        .populate('user', 'name')
        .populate('products.product', 'name')
        .sort({ date: -1 });
};

const getSalesByUser = async (userId) => {
    return await Sale.find({ user: userId })
        .populate('store', 'name')
        .populate('products.product', 'name')
        .sort({ date: -1 });
};

module.exports = {
    createSale,
    getSales,
    getSaleById,
    getSalesByStore,
    getSalesByUser
};
