/**
 * Admin Model for Codex RP
 * Enhanced admin management with PostgreSQL integration
 */

const { Pool } = require('pg');
const bcrypt = require('bcrypt');
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
const saltRounds = parseInt(process.env.BCRYPT_ROUNDS) || 12;

class Admin {
    constructor(data) {
        this.id = data.id;
        this.username = data.username;
        this.email = data.email;
        this.role = data.role;
        this.is_active = data.is_active;
        this.last_login_at = data.last_login_at;
        this.created_at = data.created_at;
        this.updated_at = data.updated_at;
        this.created_by = data.created_by;
    }

    /**
     * Find admin by username
     */
    static async findByUsername(username) {
        try {
            const query = `
                SELECT 
                    a.*,
                    ca.username as created_by_username
                FROM admins a
                LEFT JOIN admins ca ON a.created_by = ca.id
                WHERE a.username = $1 AND a.is_active = true
            `;
            
            const result = await pool.query(query, [username]);
            return result.rows[0] ? new Admin(result.rows[0]) : null;
        } catch (error) {
            console.error('Error finding admin by username:', error);
            throw error;
        }
    }

    /**
     * Find admin by email
     */
    static async findByEmail(email) {
        try {
            const query = `
                SELECT 
                    a.*,
                    ca.username as created_by_username
                FROM admins a
                LEFT JOIN admins ca ON a.created_by = ca.id
                WHERE a.email = $1 AND a.is_active = true
            `;
            
            const result = await pool.query(query, [email]);
            return result.rows[0] ? new Admin(result.rows[0]) : null;
        } catch (error) {
            console.error('Error finding admin by email:', error);
            throw error;
        }
    }

    /**
     * Find admin by ID
     */
    static async findById(id) {
        try {
            const query = `
                SELECT 
                    a.*,
                    ca.username as created_by_username
                FROM admins a
                LEFT JOIN admins ca ON a.created_by = ca.id
                WHERE a.id = $1
            `;
            
            const result = await pool.query(query, [id]);
            return result.rows[0] ? new Admin(result.rows[0]) : null;
        } catch (error) {
            console.error('Error finding admin by ID:', error);
            throw error;
        }
    }

    /**
     * Get all admins
     */
    static async getAll() {
        try {
            const query = `
                SELECT 
                    a.id,
                    a.username,
                    a.email,
                    a.role,
                    a.is_active,
                    a.last_login_at,
                    a.created_at,
                    ca.username as created_by_username
                FROM admins a
                LEFT JOIN admins ca ON a.created_by = ca.id
                ORDER BY a.role, a.created_at
            `;
            
            const result = await pool.query(query);
            return result.rows.map(row => new Admin(row));
        } catch (error) {
            console.error('Error getting all admins:', error);
            throw error;
        }
    }

    /**
     * Create a new admin
     */
    static async create(adminData, createdBy = null) {
        try {
            // Hash the password
            const hashedPassword = await bcrypt.hash(adminData.password, saltRounds);
            
            const query = `
                INSERT INTO admins (
                    username, email, password_hash, role, is_active, created_by
                ) VALUES ($1, $2, $3, $4, $5, $6)
                RETURNING *
            `;
            
            const values = [
                adminData.username,
                adminData.email,
                hashedPassword,
                adminData.role || 'admin',
                adminData.is_active !== false,
                createdBy
            ];
            
            const result = await pool.query(query, values);
            return new Admin(result.rows[0]);
        } catch (error) {
            console.error('Error creating admin:', error);
            throw error;
        }
    }

    /**
     * Update admin information
     */
    static async update(id, updateData) {
        try {
            const updateFields = [];
            const values = [];
            let paramCount = 1;

            // Build dynamic update query
            if (updateData.username) {
                updateFields.push(`username = $${paramCount++}`);
                values.push(updateData.username);
            }
            
            if (updateData.email) {
                updateFields.push(`email = $${paramCount++}`);
                values.push(updateData.email);
            }
            
            if (updateData.role) {
                updateFields.push(`role = $${paramCount++}`);
                values.push(updateData.role);
            }
            
            if (updateData.is_active !== undefined) {
                updateFields.push(`is_active = $${paramCount++}`);
                values.push(updateData.is_active);
            }

            if (updateFields.length === 0) {
                throw new Error('No fields to update');
            }

            updateFields.push(`updated_at = CURRENT_TIMESTAMP`);
            values.push(id);

            const query = `
                UPDATE admins SET ${updateFields.join(', ')}
                WHERE id = $${paramCount}
                RETURNING *
            `;
            
            const result = await pool.query(query, values);
            return result.rows[0] ? new Admin(result.rows[0]) : null;
        } catch (error) {
            console.error('Error updating admin:', error);
            throw error;
        }
    }

    /**
     * Update admin password
     */
    static async updatePassword(id, newPassword) {
        try {
            const hashedPassword = await bcrypt.hash(newPassword, saltRounds);
            
            const query = `
                UPDATE admins SET 
                    password_hash = $1,
                    updated_at = CURRENT_TIMESTAMP
                WHERE id = $2
                RETURNING id, username, email
            `;
            
            const result = await pool.query(query, [hashedPassword, id]);
            return result.rows[0];
        } catch (error) {
            console.error('Error updating admin password:', error);
            throw error;
        }
    }

    /**
     * Authenticate admin login
     */
    static async authenticate(username, password) {
        try {
            const query = `
                SELECT * FROM admins 
                WHERE (username = $1 OR email = $1) 
                AND is_active = true
            `;
            
            const result = await pool.query(query, [username]);
            const admin = result.rows[0];
            
            if (!admin) {
                return null;
            }
            
            const isValidPassword = await bcrypt.compare(password, admin.password_hash);
            
            if (!isValidPassword) {
                return null;
            }

            // Update last login time
            await this.updateLastLogin(admin.id);
            
            return new Admin(admin);
        } catch (error) {
            console.error('Error authenticating admin:', error);
            throw error;
        }
    }

    /**
     * Update last login timestamp
     */
    static async updateLastLogin(id) {
        try {
            const query = `
                UPDATE admins SET last_login_at = CURRENT_TIMESTAMP
                WHERE id = $1
            `;
            
            await pool.query(query, [id]);
        } catch (error) {
            console.error('Error updating last login:', error);
            throw error;
        }
    }

    /**
     * Deactivate admin (soft delete)
     */
    static async deactivate(id) {
        try {
            const query = `
                UPDATE admins SET 
                    is_active = false,
                    updated_at = CURRENT_TIMESTAMP
                WHERE id = $1
                RETURNING *
            `;
            
            const result = await pool.query(query, [id]);
            return result.rows[0];
        } catch (error) {
            console.error('Error deactivating admin:', error);
            throw error;
        }
    }

    /**
     * Permanently delete admin
     */
    static async delete(id) {
        try {
            const query = 'DELETE FROM admins WHERE id = $1 RETURNING *';
            const result = await pool.query(query, [id]);
            return result.rows[0];
        } catch (error) {
            console.error('Error deleting admin:', error);
            throw error;
        }
    }

    /**
     * Check if username exists
     */
    static async usernameExists(username, excludeId = null) {
        try {
            let query = 'SELECT id FROM admins WHERE username = $1';
            let values = [username];
            
            if (excludeId) {
                query += ' AND id != $2';
                values.push(excludeId);
            }
            
            const result = await pool.query(query, values);
            return result.rows.length > 0;
        } catch (error) {
            console.error('Error checking username exists:', error);
            throw error;
        }
    }

    /**
     * Check if email exists
     */
    static async emailExists(email, excludeId = null) {
        try {
            let query = 'SELECT id FROM admins WHERE email = $1';
            let values = [email];
            
            if (excludeId) {
                query += ' AND id != $2';
                values.push(excludeId);
            }
            
            const result = await pool.query(query, values);
            return result.rows.length > 0;
        } catch (error) {
            console.error('Error checking email exists:', error);
            throw error;
        }
    }

    /**
     * Get admin statistics
     */
    static async getStats() {
        try {
            const query = `
                SELECT 
                    COUNT(*) as total_admins,
                    COUNT(CASE WHEN role = 'super_admin' THEN 1 END) as super_admins,
                    COUNT(CASE WHEN role = 'admin' THEN 1 END) as admins,
                    COUNT(CASE WHEN role = 'moderator' THEN 1 END) as moderators,
                    COUNT(CASE WHEN is_active = true THEN 1 END) as active_admins,
                    COUNT(CASE WHEN last_login_at > CURRENT_TIMESTAMP - INTERVAL '7 days' THEN 1 END) as active_last_week
                FROM admins
            `;
            
            const result = await pool.query(query);
            return result.rows[0];
        } catch (error) {
            console.error('Error getting admin stats:', error);
            throw error;
        }
    }

    /**
     * Instance method to check if admin has permission
     */
    hasPermission(action) {
        const permissions = {
            'super_admin': ['*'], // All permissions
            'admin': [
                'regulations.create', 'regulations.update', 'regulations.delete',
                'categories.create', 'categories.update', 'categories.delete',
                'users.view', 'users.moderate',
                'reports.view', 'reports.manage',
                'events.create', 'events.update', 'events.delete'
            ],
            'moderator': [
                'regulations.view',
                'users.view', 'users.moderate',
                'reports.view', 'reports.manage'
            ]
        };

        const rolePermissions = permissions[this.role] || [];
        
        return rolePermissions.includes('*') || rolePermissions.includes(action);
    }

    /**
     * Get safe admin data (without sensitive info)
     */
    toSafeObject() {
        return {
            id: this.id,
            username: this.username,
            email: this.email,
            role: this.role,
            is_active: this.is_active,
            last_login_at: this.last_login_at,
            created_at: this.created_at
        };
    }
}

module.exports = Admin;