/**
 * Regulation Model for Codex RP
 * Enhanced database operations with PostgreSQL integration
 */

const { Pool } = require('pg');
require('dotenv').config();

// Database configuration
const dbConfig = {
    user: process.env.DB_USER || 'postgres',
    host: process.env.DB_HOST || 'localhost',
    database: process.env.DB_NAME || 'codex_rp',
    password: process.env.DB_PASSWORD || 'password',
    port: process.env.DB_PORT || 5432,
    ssl: process.env.NODE_ENV === 'production' ? { rejectUnauthorized: false } : false
};

const pool = new Pool(dbConfig);

/**
 * Get all regulations with their categories
 */
async function getAllRegulations() {
    try {
        const query = `
            SELECT 
                r.id,
                r.title,
                r.description,
                r.severity,
                r.penalty_description,
                r.sort_order,
                r.is_active,
                r.version,
                r.effective_date,
                r.created_at,
                r.updated_at,
                rc.name as category_name,
                rc.description as category_description,
                rc.icon as category_icon,
                rc.color as category_color,
                a.username as created_by_username
            FROM regulations r
            LEFT JOIN regulation_categories rc ON r.category_id = rc.id
            LEFT JOIN admins a ON r.created_by = a.id
            WHERE r.is_active = true
            ORDER BY rc.sort_order, r.sort_order, r.created_at
        `;
        
        const result = await pool.query(query);
        return result.rows;
    } catch (error) {
        console.error('Error fetching regulations:', error);
        throw error;
    }
}

/**
 * Get regulations grouped by category
 */
async function getRegulationsByCategory() {
    try {
        const regulations = await getAllRegulations();
        const grouped = {};
        
        regulations.forEach(regulation => {
            const categoryName = regulation.category_name || 'Règles Générales';
            
            if (!grouped[categoryName]) {
                grouped[categoryName] = {
                    name: categoryName,
                    description: regulation.category_description,
                    icon: regulation.category_icon,
                    color: regulation.category_color,
                    regulations: []
                };
            }
            
            grouped[categoryName].regulations.push({
                id: regulation.id,
                title: regulation.title,
                description: regulation.description,
                severity: regulation.severity,
                penalty_description: regulation.penalty_description,
                sort_order: regulation.sort_order,
                version: regulation.version,
                effective_date: regulation.effective_date,
                created_at: regulation.created_at,
                updated_at: regulation.updated_at,
                created_by_username: regulation.created_by_username
            });
        });
        
        return grouped;
    } catch (error) {
        console.error('Error grouping regulations by category:', error);
        throw error;
    }
}

/**
 * Get a single regulation by ID
 */
async function getRegulationById(id) {
    try {
        const query = `
            SELECT 
                r.*,
                rc.name as category_name,
                a.username as created_by_username,
                au.username as updated_by_username
            FROM regulations r
            LEFT JOIN regulation_categories rc ON r.category_id = rc.id
            LEFT JOIN admins a ON r.created_by = a.id
            LEFT JOIN admins au ON r.updated_by = au.id
            WHERE r.id = $1
        `;
        
        const result = await pool.query(query, [id]);
        return result.rows[0] || null;
    } catch (error) {
        console.error('Error fetching regulation by ID:', error);
        throw error;
    }
}

/**
 * Add a new regulation
 */
async function addRegulation(regulation, createdBy) {
    try {
        const query = `
            INSERT INTO regulations (
                category_id, title, description, severity, 
                penalty_description, sort_order, is_active, 
                effective_date, created_by
            ) VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9)
            RETURNING *
        `;
        
        const values = [
            regulation.category_id || null,
            regulation.title,
            regulation.description,
            regulation.severity || 'info',
            regulation.penalty_description || null,
            regulation.sort_order || 0,
            regulation.is_active !== false,
            regulation.effective_date || new Date(),
            createdBy
        ];
        
        const result = await pool.query(query, values);
        return result.rows[0];
    } catch (error) {
        console.error('Error adding regulation:', error);
        throw error;
    }
}

/**
 * Update a regulation
 */
async function updateRegulation(id, regulation, updatedBy) {
    try {
        const query = `
            UPDATE regulations SET
                category_id = $2,
                title = $3,
                description = $4,
                severity = $5,
                penalty_description = $6,
                sort_order = $7,
                is_active = $8,
                effective_date = $9,
                updated_by = $10,
                version = version + 1,
                updated_at = CURRENT_TIMESTAMP
            WHERE id = $1
            RETURNING *
        `;
        
        const values = [
            id,
            regulation.category_id || null,
            regulation.title,
            regulation.description,
            regulation.severity || 'info',
            regulation.penalty_description || null,
            regulation.sort_order || 0,
            regulation.is_active !== false,
            regulation.effective_date || new Date(),
            updatedBy
        ];
        
        const result = await pool.query(query, values);
        return result.rows[0];
    } catch (error) {
        console.error('Error updating regulation:', error);
        throw error;
    }
}

/**
 * Delete a regulation (soft delete)
 */
async function deleteRegulation(id, deletedBy) {
    try {
        const query = `
            UPDATE regulations SET
                is_active = false,
                updated_by = $2,
                updated_at = CURRENT_TIMESTAMP
            WHERE id = $1
            RETURNING *
        `;
        
        const result = await pool.query(query, [id, deletedBy]);
        return result.rows[0];
    } catch (error) {
        console.error('Error deleting regulation:', error);
        throw error;
    }
}

/**
 * Hard delete a regulation (permanent removal)
 */
async function hardDeleteRegulation(id) {
    try {
        const query = 'DELETE FROM regulations WHERE id = $1 RETURNING *';
        const result = await pool.query(query, [id]);
        return result.rows[0];
    } catch (error) {
        console.error('Error hard deleting regulation:', error);
        throw error;
    }
}

/**
 * Get all regulation categories
 */
async function getAllCategories() {
    try {
        const query = `
            SELECT * FROM regulation_categories 
            WHERE is_active = true 
            ORDER BY sort_order, name
        `;
        
        const result = await pool.query(query);
        return result.rows;
    } catch (error) {
        console.error('Error fetching categories:', error);
        throw error;
    }
}

/**
 * Add a new regulation category
 */
async function addCategory(category, createdBy) {
    try {
        const query = `
            INSERT INTO regulation_categories (
                name, description, icon, color, sort_order, created_by
            ) VALUES ($1, $2, $3, $4, $5, $6)
            RETURNING *
        `;
        
        const values = [
            category.name,
            category.description || null,
            category.icon || null,
            category.color || '#3B82F6',
            category.sort_order || 0,
            createdBy
        ];
        
        const result = await pool.query(query, values);
        return result.rows[0];
    } catch (error) {
        console.error('Error adding category:', error);
        throw error;
    }
}

/**
 * Update a regulation category
 */
async function updateCategory(id, category) {
    try {
        const query = `
            UPDATE regulation_categories SET
                name = $2,
                description = $3,
                icon = $4,
                color = $5,
                sort_order = $6,
                updated_at = CURRENT_TIMESTAMP
            WHERE id = $1
            RETURNING *
        `;
        
        const values = [
            id,
            category.name,
            category.description || null,
            category.icon || null,
            category.color || '#3B82F6',
            category.sort_order || 0
        ];
        
        const result = await pool.query(query, values);
        return result.rows[0];
    } catch (error) {
        console.error('Error updating category:', error);
        throw error;
    }
}

/**
 * Delete a category (soft delete)
 */
async function deleteCategory(id) {
    try {
        const query = `
            UPDATE regulation_categories SET
                is_active = false,
                updated_at = CURRENT_TIMESTAMP
            WHERE id = $1
            RETURNING *
        `;
        
        const result = await pool.query(query, [id]);
        return result.rows[0];
    } catch (error) {
        console.error('Error deleting category:', error);
        throw error;
    }
}

/**
 * Search regulations by title or description
 */
async function searchRegulations(searchTerm) {
    try {
        const query = `
            SELECT 
                r.id,
                r.title,
                r.description,
                r.severity,
                rc.name as category_name
            FROM regulations r
            LEFT JOIN regulation_categories rc ON r.category_id = rc.id
            WHERE r.is_active = true
            AND (
                r.title ILIKE $1 
                OR r.description ILIKE $1
                OR rc.name ILIKE $1
            )
            ORDER BY 
                CASE WHEN r.title ILIKE $1 THEN 1 
                     WHEN rc.name ILIKE $1 THEN 2 
                     ELSE 3 END,
                r.sort_order
        `;
        
        const searchPattern = `%${searchTerm}%`;
        const result = await pool.query(query, [searchPattern]);
        return result.rows;
    } catch (error) {
        console.error('Error searching regulations:', error);
        throw error;
    }
}

/**
 * Get regulation statistics
 */
async function getRegulationStats() {
    try {
        const query = `
            SELECT 
                COUNT(*) as total_regulations,
                COUNT(CASE WHEN severity = 'critical' THEN 1 END) as critical_regulations,
                COUNT(CASE WHEN severity = 'major' THEN 1 END) as major_regulations,
                COUNT(CASE WHEN severity = 'warning' THEN 1 END) as warning_regulations,
                COUNT(CASE WHEN severity = 'info' THEN 1 END) as info_regulations,
                COUNT(DISTINCT category_id) as total_categories
            FROM regulations
            WHERE is_active = true
        `;
        
        const result = await pool.query(query);
        return result.rows[0];
    } catch (error) {
        console.error('Error fetching regulation stats:', error);
        throw error;
    }
}

module.exports = {
    getAllRegulations,
    getRegulationsByCategory,
    getRegulationById,
    addRegulation,
    updateRegulation,
    deleteRegulation,
    hardDeleteRegulation,
    getAllCategories,
    addCategory,
    updateCategory,
    deleteCategory,
    searchRegulations,
    getRegulationStats
};