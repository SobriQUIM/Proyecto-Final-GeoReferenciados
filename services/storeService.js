const Store = require('../models/Store');

const getStores = async () => {
    return await Store.find();
};

const getStoreById = async (id) => {
    const store = await Store.findById(id);
    if (!store) {
        throw new Error('Store not found');
    }
    return store;
};

const createStore = async (storeData) => {
    const store = await Store.create(storeData);
    return store;
};

const updateStore = async (id, storeData) => {
    const store = await Store.findByIdAndUpdate(id, storeData, {
        new: true,
        runValidators: true
    });

    if (!store) {
        throw new Error('Store not found');
    }

    return store;
};

const deleteStore = async (id) => {
    const store = await Store.findById(id);

    if (!store) {
        throw new Error('Store not found');
    }

    await store.deleteOne();
    return { id };
};

const searchStores = async (query) => {
    const name = query.name;
    if (!name) {
        return [];
    }
    // Case insensitive search
    const stores = await Store.find({ name: { $regex: name, $options: 'i' } });
    return stores;
};

module.exports = {
    getStores,
    getStoreById,
    createStore,
    updateStore,
    deleteStore,
    searchStores
};
