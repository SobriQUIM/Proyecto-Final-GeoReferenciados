const mongoose = require('mongoose');

const storeSchema = new mongoose.Schema({
    name: {
        type: String,
        required: [true, 'Please add a store name'],
        unique: true,
        trim: true
    },
    address: {
        type: String,
        required: [true, 'Please add an address']
    },
    description: {
        type: String,
        default: ''
    },
    // Specific location (Pin)
    location: {
        type: {
            type: String,
            enum: ['Point'],
            required: false // Optional for now, but recommended
        },
        coordinates: {
            type: [Number],
            index: '2dsphere'
        }
    },
    // Zone stored as a list of coordinates (Polygon)
    zone: {
        type: {
            type: String,
            enum: ['Polygon'],
            required: true,
            default: 'Polygon'
        },
        coordinates: {
            type: [[[Number]]], // Array of arrays of arrays of numbers
            required: true
        }
    },
    createdAt: {
        type: Date,
        default: Date.now
    }
});

// Create geospatial index for zone searches if needed later
storeSchema.index({ zone: '2dsphere' });

module.exports = mongoose.model('Store', storeSchema);
