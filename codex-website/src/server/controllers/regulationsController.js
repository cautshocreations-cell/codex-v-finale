// src/server/controllers/regulationsController.js

const fs = require('fs');
const path = require('path');
const regulationsFilePath = path.join(__dirname, '../../data/regulations.json');

// Get all regulations
exports.getRegulations = (req, res) => {
    fs.readFile(regulationsFilePath, 'utf8', (err, data) => {
        if (err) {
            return res.status(500).json({ message: 'Error reading regulations data' });
        }
        res.status(200).json(JSON.parse(data));
    });
};

// Add a new regulation
exports.addRegulation = (req, res) => {
    const newRegulation = req.body;

    fs.readFile(regulationsFilePath, 'utf8', (err, data) => {
        if (err) {
            return res.status(500).json({ message: 'Error reading regulations data' });
        }

        const regulations = JSON.parse(data);
        regulations.push(newRegulation);

        fs.writeFile(regulationsFilePath, JSON.stringify(regulations, null, 2), (err) => {
            if (err) {
                return res.status(500).json({ message: 'Error saving regulation' });
            }
            res.status(201).json(newRegulation);
        });
    });
};

// Update an existing regulation
exports.updateRegulation = (req, res) => {
    const { id } = req.params;
    const updatedRegulation = req.body;

    fs.readFile(regulationsFilePath, 'utf8', (err, data) => {
        if (err) {
            return res.status(500).json({ message: 'Error reading regulations data' });
        }

        let regulations = JSON.parse(data);
        regulations = regulations.map(regulation => regulation.id === id ? updatedRegulation : regulation);

        fs.writeFile(regulationsFilePath, JSON.stringify(regulations, null, 2), (err) => {
            if (err) {
                return res.status(500).json({ message: 'Error updating regulation' });
            }
            res.status(200).json(updatedRegulation);
        });
    });
};

// Delete a regulation
exports.deleteRegulation = (req, res) => {
    const { id } = req.params;

    fs.readFile(regulationsFilePath, 'utf8', (err, data) => {
        if (err) {
            return res.status(500).json({ message: 'Error reading regulations data' });
        }

        let regulations = JSON.parse(data);
        regulations = regulations.filter(regulation => regulation.id !== id);

        fs.writeFile(regulationsFilePath, JSON.stringify(regulations, null, 2), (err) => {
            if (err) {
                return res.status(500).json({ message: 'Error deleting regulation' });
            }
            res.status(204).send();
        });
    });
};