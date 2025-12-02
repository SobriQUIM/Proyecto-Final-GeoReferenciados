
const mongoose = require('mongoose');

const productSchema = new mongoose.Schema({
    name: {
        type: String,
        required: [true, 'Please add a product name'],
        trim: true
    },
    sku: {
        type: String,
        required: [true, 'Please add a SKU'],
        unique: true,
        trim: true
    },
    price: {
        type: Number,
        required: [true, 'Please add a price']
    },
    stock: {
        type: Number,
        required: [true, 'Please add stock quantity'],
        default: 0
    },
    minStock: {
        type: Number,
        required: [true, 'Please add minimum stock'],
        default: 5
    },
    maxStock: {
        type: Number,
        required: [true, 'Please add maximum stock'],
        default: 100
    },
    store: {
        type: mongoose.Schema.ObjectId,
        ref: 'Store',
        required: true
    },
    createdAt: {
        type: Date,
        default: Date.now
    }
});

// Virtual for stock status (semaphore)
productSchema.virtual('status').get(function () {
    if (this.stock === 0) return 'red';
    if (this.stock < this.minStock) return 'yellow';
    return 'green';
});

// Ensure virtuals are included in JSON
productSchema.set('toJSON', { virtuals: true });
productSchema.set('toObject', { virtuals: true });

module.exports = mongoose.model('Product', productSchema);
