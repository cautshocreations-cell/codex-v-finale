// src/server/controllers/adminController.js

const Admin = require('../models/admin.model');

// Function to authenticate admin user
exports.authenticateAdmin = async (req, res) => {
    const { username, password } = req.body;

    try {
        const admin = await Admin.findByUsername(username);
        if (!admin || !admin.validatePassword(password)) {
            return res.status(401).json({ message: 'Invalid credentials' });
        }

        // Generate a session or token for the admin
        req.session.adminId = admin.id;
        res.status(200).json({ message: 'Authentication successful' });
    } catch (error) {
        res.status(500).json({ message: 'Server error', error });
    }
};

// Function to log out admin user
exports.logoutAdmin = (req, res) => {
    req.session.destroy(err => {
        if (err) {
            return res.status(500).json({ message: 'Logout failed', error: err });
        }
        res.status(200).json({ message: 'Logout successful' });
    });
};

// Function to get admin details
exports.getAdminDetails = async (req, res) => {
    try {
        const admin = await Admin.findById(req.session.adminId);
        if (!admin) {
            return res.status(404).json({ message: 'Admin not found' });
        }
        res.status(200).json(admin);
    } catch (error) {
        res.status(500).json({ message: 'Server error', error });
    }
};