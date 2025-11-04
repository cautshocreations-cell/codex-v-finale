const express = require('express');
const router = express.Router();
const regulationsController = require('../controllers/regulationsController');

// Get all regulations
router.get('/', regulationsController.getAllRegulations);

// Get a regulation by ID
router.get('/:id', regulationsController.getRegulationById);

// Create a new regulation
router.post('/', regulationsController.createRegulation);

// Update a regulation by ID
router.put('/:id', regulationsController.updateRegulation);

// Delete a regulation by ID
router.delete('/:id', regulationsController.deleteRegulation);

module.exports = router;