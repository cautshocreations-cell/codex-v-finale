/**
 * Player Model for Codex RP
 * Manages player accounts, characters, and related data
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

class Player {
    constructor(data) {
        this.id = data.id;
        this.username = data.username;
        this.email = data.email;
        this.discord_id = data.discord_id;
        this.steam_id = data.steam_id;
        this.is_whitelisted = data.is_whitelisted;
        this.is_banned = data.is_banned;
        this.ban_reason = data.ban_reason;
        this.ban_expires_at = data.ban_expires_at;
        this.total_playtime_hours = data.total_playtime_hours;
        this.last_seen_at = data.last_seen_at;
        this.registration_date = data.registration_date;
        this.created_at = data.created_at;
        this.updated_at = data.updated_at;
    }

    /**
     * Get all players with pagination
     */
    static async getAll(page = 1, limit = 50, filters = {}) {
        try {
            const offset = (page - 1) * limit;
            let whereConditions = [];
            let values = [];
            let paramCount = 1;

            // Build filter conditions
            if (filters.is_whitelisted !== undefined) {
                whereConditions.push(`is_whitelisted = $${paramCount++}`);
                values.push(filters.is_whitelisted);
            }

            if (filters.is_banned !== undefined) {
                whereConditions.push(`is_banned = $${paramCount++}`);
                values.push(filters.is_banned);
            }

            if (filters.search) {
                whereConditions.push(`(username ILIKE $${paramCount} OR email ILIKE $${paramCount})`);
                values.push(`%${filters.search}%`);
                paramCount++;
            }

            const whereClause = whereConditions.length > 0 ? `WHERE ${whereConditions.join(' AND ')}` : '';

            const query = `
                SELECT 
                    p.*,
                    COUNT(c.id) as character_count,
                    COALESCE(AVG(ps.duration_minutes), 0) as avg_session_duration
                FROM players p
                LEFT JOIN characters c ON p.id = c.player_id AND c.is_active = true
                LEFT JOIN player_sessions ps ON p.id = ps.player_id
                ${whereClause}
                GROUP BY p.id
                ORDER BY p.registration_date DESC
                LIMIT $${paramCount} OFFSET $${paramCount + 1}
            `;

            values.push(limit, offset);
            const result = await pool.query(query, values);

            // Get total count for pagination
            const countQuery = `
                SELECT COUNT(*) FROM players p ${whereClause}
            `;
            const countResult = await pool.query(countQuery, values.slice(0, -2));
            const total = parseInt(countResult.rows[0].count);

            return {
                players: result.rows.map(row => new Player(row)),
                pagination: {
                    page,
                    limit,
                    total,
                    pages: Math.ceil(total / limit)
                }
            };
        } catch (error) {
            console.error('Error getting all players:', error);
            throw error;
        }
    }

    /**
     * Find player by ID
     */
    static async findById(id) {
        try {
            const query = `
                SELECT 
                    p.*,
                    COUNT(c.id) as character_count,
                    COALESCE(SUM(ps.duration_minutes), 0) as total_session_minutes
                FROM players p
                LEFT JOIN characters c ON p.id = c.player_id AND c.is_active = true
                LEFT JOIN player_sessions ps ON p.id = ps.player_id
                WHERE p.id = $1
                GROUP BY p.id
            `;

            const result = await pool.query(query, [id]);
            return result.rows[0] ? new Player(result.rows[0]) : null;
        } catch (error) {
            console.error('Error finding player by ID:', error);
            throw error;
        }
    }

    /**
     * Find player by username
     */
    static async findByUsername(username) {
        try {
            const query = 'SELECT * FROM players WHERE username = $1';
            const result = await pool.query(query, [username]);
            return result.rows[0] ? new Player(result.rows[0]) : null;
        } catch (error) {
            console.error('Error finding player by username:', error);
            throw error;
        }
    }

    /**
     * Find player by Discord ID
     */
    static async findByDiscordId(discordId) {
        try {
            const query = 'SELECT * FROM players WHERE discord_id = $1';
            const result = await pool.query(query, [discordId]);
            return result.rows[0] ? new Player(result.rows[0]) : null;
        } catch (error) {
            console.error('Error finding player by Discord ID:', error);
            throw error;
        }
    }

    /**
     * Create a new player
     */
    static async create(playerData) {
        try {
            const query = `
                INSERT INTO players (
                    username, email, discord_id, steam_id, is_whitelisted
                ) VALUES ($1, $2, $3, $4, $5)
                RETURNING *
            `;

            const values = [
                playerData.username,
                playerData.email,
                playerData.discord_id || null,
                playerData.steam_id || null,
                playerData.is_whitelisted || false
            ];

            const result = await pool.query(query, values);
            return new Player(result.rows[0]);
        } catch (error) {
            console.error('Error creating player:', error);
            throw error;
        }
    }

    /**
     * Update player information
     */
    static async update(id, updateData) {
        try {
            const updateFields = [];
            const values = [];
            let paramCount = 1;

            if (updateData.username) {
                updateFields.push(`username = $${paramCount++}`);
                values.push(updateData.username);
            }

            if (updateData.email) {
                updateFields.push(`email = $${paramCount++}`);
                values.push(updateData.email);
            }

            if (updateData.discord_id) {
                updateFields.push(`discord_id = $${paramCount++}`);
                values.push(updateData.discord_id);
            }

            if (updateData.steam_id) {
                updateFields.push(`steam_id = $${paramCount++}`);
                values.push(updateData.steam_id);
            }

            if (updateData.is_whitelisted !== undefined) {
                updateFields.push(`is_whitelisted = $${paramCount++}`);
                values.push(updateData.is_whitelisted);
            }

            if (updateData.total_playtime_hours !== undefined) {
                updateFields.push(`total_playtime_hours = $${paramCount++}`);
                values.push(updateData.total_playtime_hours);
            }

            if (updateData.last_seen_at) {
                updateFields.push(`last_seen_at = $${paramCount++}`);
                values.push(updateData.last_seen_at);
            }

            if (updateFields.length === 0) {
                throw new Error('No fields to update');
            }

            updateFields.push(`updated_at = CURRENT_TIMESTAMP`);
            values.push(id);

            const query = `
                UPDATE players SET ${updateFields.join(', ')}
                WHERE id = $${paramCount}
                RETURNING *
            `;

            const result = await pool.query(query, values);
            return result.rows[0] ? new Player(result.rows[0]) : null;
        } catch (error) {
            console.error('Error updating player:', error);
            throw error;
        }
    }

    /**
     * Ban a player
     */
    static async ban(id, reason, expiresAt = null) {
        try {
            const query = `
                UPDATE players SET 
                    is_banned = true,
                    ban_reason = $2,
                    ban_expires_at = $3,
                    updated_at = CURRENT_TIMESTAMP
                WHERE id = $1
                RETURNING *
            `;

            const result = await pool.query(query, [id, reason, expiresAt]);
            return result.rows[0] ? new Player(result.rows[0]) : null;
        } catch (error) {
            console.error('Error banning player:', error);
            throw error;
        }
    }

    /**
     * Unban a player
     */
    static async unban(id) {
        try {
            const query = `
                UPDATE players SET 
                    is_banned = false,
                    ban_reason = NULL,
                    ban_expires_at = NULL,
                    updated_at = CURRENT_TIMESTAMP
                WHERE id = $1
                RETURNING *
            `;

            const result = await pool.query(query, [id]);
            return result.rows[0] ? new Player(result.rows[0]) : null;
        } catch (error) {
            console.error('Error unbanning player:', error);
            throw error;
        }
    }

    /**
     * Get player's characters
     */
    async getCharacters() {
        try {
            const query = `
                SELECT * FROM characters 
                WHERE player_id = $1 AND is_active = true
                ORDER BY created_at DESC
            `;

            const result = await pool.query(query, [this.id]);
            return result.rows;
        } catch (error) {
            console.error('Error getting player characters:', error);
            throw error;
        }
    }

    /**
     * Get player statistics
     */
    static async getStats() {
        try {
            const query = `
                SELECT 
                    COUNT(*) as total_players,
                    COUNT(CASE WHEN is_whitelisted = true THEN 1 END) as whitelisted_players,
                    COUNT(CASE WHEN is_banned = true THEN 1 END) as banned_players,
                    COUNT(CASE WHEN last_seen_at > CURRENT_TIMESTAMP - INTERVAL '7 days' THEN 1 END) as active_last_week,
                    COUNT(CASE WHEN last_seen_at > CURRENT_TIMESTAMP - INTERVAL '30 days' THEN 1 END) as active_last_month,
                    AVG(total_playtime_hours) as avg_playtime_hours
                FROM players
            `;

            const result = await pool.query(query);
            return result.rows[0];
        } catch (error) {
            console.error('Error getting player stats:', error);
            throw error;
        }
    }

    /**
     * Check if player is currently banned
     */
    isBanned() {
        if (!this.is_banned) return false;
        
        if (this.ban_expires_at) {
            return new Date() < new Date(this.ban_expires_at);
        }
        
        return true; // Permanent ban
    }

    /**
     * Get safe player data (without sensitive info)
     */
    toSafeObject() {
        return {
            id: this.id,
            username: this.username,
            is_whitelisted: this.is_whitelisted,
            is_banned: this.is_banned,
            total_playtime_hours: this.total_playtime_hours,
            registration_date: this.registration_date,
            character_count: this.character_count
        };
    }
}

module.exports = Player;