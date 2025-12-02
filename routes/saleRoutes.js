const express = require('express');
const router = express.Router();
const {
    createSale,
    getSales,
    getSaleById,
    getSalesByStore,
    getSalesByUser
} = require('../controllers/saleController');
const { protect } = require('../middleware/authMiddleware');

router.route('/')
    .post(protect, createSale)
    .get(protect, getSales);

router.route('/:id')
    .get(protect, getSaleById);

// Special routes for filtering
// Note: These might be better placed in storeRoutes and userRoutes but for simplicity and to match the request structure, 
// we can also handle them here if we redirect from there, or just define them here if the path is /api/sales/store/:id etc.
// However, the requirement is /api/stores/:id/sales. 
// To support that, we need to mount this router in app.js or handle it in storeRoutes.
// For now, I will export the controller functions to be used in other routers if needed, 
// OR I will define these routes here as /store/:id and /user/:id for simplicity if the user accepts /api/sales/store/:id
// BUT strict requirement says /api/stores/:id/sales.
// So I will update storeRoutes.js and userRoutes.js to include these specific routes.

module.exports = router;
