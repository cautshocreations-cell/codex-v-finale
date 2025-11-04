const express = require('express');
const router = express.Router();
const adminController = require('../controllers/adminController');

// Route for admin login
router.post('/login', adminController.login);

// Route for getting admin details
router.get('/details', adminController.getAdminDetails);

// Route for updating admin information
router.put('/update', adminController.updateAdmin);

// Route for deleting an admin
router.delete('/delete/:id', adminController.deleteAdmin);

module.exports = router;