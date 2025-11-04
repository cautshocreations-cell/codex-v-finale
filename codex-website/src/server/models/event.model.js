/**
 * Event Model for Codex RP
 * Manages server events, activities, and announcements
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

class Event {
    constructor(data) {
        this.id = data.id;
        this.title = data.title;
        this.description = data.description;
        this.event_type = data.event_type;
        this.start_time = data.start_time;
        this.end_time = data.end_time;
        this.max_participants = data.max_participants;
        this.current_participants = data.current_participants;
        this.requirements = data.requirements;
        this.rewards = data.rewards;
        this.location = data.location;
        this.organizer_id = data.organizer_id;
        this.is_active = data.is_active;
        this.is_featured = data.is_featured;
        this.created_at = data.created_at;
        this.updated_at = data.updated_at;
        this.organizer_username = data.organizer_username;
    }

    /**
     * Get all events with pagination and filters
     */
    static async getAll(page = 1, limit = 20, filters = {}) {
        try {
            const offset = (page - 1) * limit;
            let whereConditions = ['e.is_active = true'];
            let values = [];
            let paramCount = 1;

            if (filters.event_type) {
                whereConditions.push(`e.event_type = $${paramCount++}`);
                values.push(filters.event_type);
            }

            if (filters.upcoming) {
                whereConditions.push(`e.start_time > CURRENT_TIMESTAMP`);
            }

            if (filters.featured) {
                whereConditions.push(`e.is_featured = true`);
            }

            const whereClause = whereConditions.join(' AND ');

            const query = `
                SELECT 
                    e.*,
                    a.username as organizer_username,
                    COUNT(ep.id) as current_participants
                FROM server_events e
                LEFT JOIN admins a ON e.organizer_id = a.id
                LEFT JOIN event_participants ep ON e.id = ep.event_id
                WHERE ${whereClause}
                GROUP BY e.id, a.username
                ORDER BY e.is_featured DESC, e.start_time ASC
                LIMIT $${paramCount} OFFSET $${paramCount + 1}
            `;

            values.push(limit, offset);
            const result = await pool.query(query, values);

            return result.rows.map(row => new Event(row));
        } catch (error) {
            console.error('Error getting all events:', error);
            throw error;
        }
    }

    /**
     * Get event by ID
     */
    static async findById(id) {
        try {
            const query = `
                SELECT 
                    e.*,
                    a.username as organizer_username,
                    COUNT(ep.id) as current_participants
                FROM server_events e
                LEFT JOIN admins a ON e.organizer_id = a.id
                LEFT JOIN event_participants ep ON e.id = ep.event_id
                WHERE e.id = $1
                GROUP BY e.id, a.username
            `;

            const result = await pool.query(query, [id]);
            return result.rows[0] ? new Event(result.rows[0]) : null;
        } catch (error) {
            console.error('Error finding event by ID:', error);
            throw error;
        }
    }

    /**
     * Create a new event
     */
    static async create(eventData, organizerId) {
        try {
            const query = `
                INSERT INTO server_events (
                    title, description, event_type, start_time, end_time,
                    max_participants, requirements, rewards, location,
                    organizer_id, is_featured
                ) VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11)
                RETURNING *
            `;

            const values = [
                eventData.title,
                eventData.description,
                eventData.event_type,
                eventData.start_time,
                eventData.end_time || null,
                eventData.max_participants || null,
                eventData.requirements || null,
                eventData.rewards || null,
                eventData.location || null,
                organizerId,
                eventData.is_featured || false
            ];

            const result = await pool.query(query, values);
            return new Event(result.rows[0]);
        } catch (error) {
            console.error('Error creating event:', error);
            throw error;
        }
    }

    /**
     * Update an event
     */
    static async update(id, eventData) {
        try {
            const updateFields = [];
            const values = [];
            let paramCount = 1;

            const fields = [
                'title', 'description', 'event_type', 'start_time', 'end_time',
                'max_participants', 'requirements', 'rewards', 'location', 'is_featured'
            ];

            fields.forEach(field => {
                if (eventData[field] !== undefined) {
                    updateFields.push(`${field} = $${paramCount++}`);
                    values.push(eventData[field]);
                }
            });

            if (updateFields.length === 0) {
                throw new Error('No fields to update');
            }

            updateFields.push(`updated_at = CURRENT_TIMESTAMP`);
            values.push(id);

            const query = `
                UPDATE server_events SET ${updateFields.join(', ')}
                WHERE id = $${paramCount}
                RETURNING *
            `;

            const result = await pool.query(query, values);
            return result.rows[0] ? new Event(result.rows[0]) : null;
        } catch (error) {
            console.error('Error updating event:', error);
            throw error;
        }
    }

    /**
     * Delete an event (soft delete)
     */
    static async delete(id) {
        try {
            const query = `
                UPDATE server_events SET 
                    is_active = false,
                    updated_at = CURRENT_TIMESTAMP
                WHERE id = $1
                RETURNING *
            `;

            const result = await pool.query(query, [id]);
            return result.rows[0];
        } catch (error) {
            console.error('Error deleting event:', error);
            throw error;
        }
    }

    /**
     * Register player for event
     */
    static async registerPlayer(eventId, playerId, characterId = null) {
        try {
            const query = `
                INSERT INTO event_participants (event_id, player_id, character_id)
                VALUES ($1, $2, $3)
                ON CONFLICT (event_id, player_id) DO NOTHING
                RETURNING *
            `;

            const result = await pool.query(query, [eventId, playerId, characterId]);
            return result.rows[0];
        } catch (error) {
            console.error('Error registering player for event:', error);
            throw error;
        }
    }

    /**
     * Unregister player from event
     */
    static async unregisterPlayer(eventId, playerId) {
        try {
            const query = `
                DELETE FROM event_participants 
                WHERE event_id = $1 AND player_id = $2
                RETURNING *
            `;

            const result = await pool.query(query, [eventId, playerId]);
            return result.rows[0];
        } catch (error) {
            console.error('Error unregistering player from event:', error);
            throw error;
        }
    }

    /**
     * Get event participants
     */
    async getParticipants() {
        try {
            const query = `
                SELECT 
                    ep.*,
                    p.username as player_username,
                    c.name as character_name
                FROM event_participants ep
                JOIN players p ON ep.player_id = p.id
                LEFT JOIN characters c ON ep.character_id = c.id
                WHERE ep.event_id = $1
                ORDER BY ep.registration_date
            `;

            const result = await pool.query(query, [this.id]);
            return result.rows;
        } catch (error) {
            console.error('Error getting event participants:', error);
            throw error;
        }
    }
}

class Announcement {
    constructor(data) {
        this.id = data.id;
        this.title = data.title;
        this.content = data.content;
        this.announcement_type = data.announcement_type;
        this.priority = data.priority;
        this.is_pinned = data.is_pinned;
        this.target_audience = data.target_audience;
        this.expires_at = data.expires_at;
        this.author_id = data.author_id;
        this.created_at = data.created_at;
        this.updated_at = data.updated_at;
        this.author_username = data.author_username;
    }

    /**
     * Get all announcements
     */
    static async getAll(audience = 'all', limit = 50) {
        try {
            const query = `
                SELECT 
                    an.*,
                    a.username as author_username
                FROM announcements an
                LEFT JOIN admins a ON an.author_id = a.id
                WHERE (an.target_audience = $1 OR an.target_audience = 'all')
                AND (an.expires_at IS NULL OR an.expires_at > CURRENT_TIMESTAMP)
                ORDER BY an.is_pinned DESC, an.priority DESC, an.created_at DESC
                LIMIT $2
            `;

            const result = await pool.query(query, [audience, limit]);
            return result.rows.map(row => new Announcement(row));
        } catch (error) {
            console.error('Error getting announcements:', error);
            throw error;
        }
    }

    /**
     * Create a new announcement
     */
    static async create(announcementData, authorId) {
        try {
            const query = `
                INSERT INTO announcements (
                    title, content, announcement_type, priority,
                    is_pinned, target_audience, expires_at, author_id
                ) VALUES ($1, $2, $3, $4, $5, $6, $7, $8)
                RETURNING *
            `;

            const values = [
                announcementData.title,
                announcementData.content,
                announcementData.announcement_type || 'general',
                announcementData.priority || 'normal',
                announcementData.is_pinned || false,
                announcementData.target_audience || 'all',
                announcementData.expires_at || null,
                authorId
            ];

            const result = await pool.query(query, values);
            return new Announcement(result.rows[0]);
        } catch (error) {
            console.error('Error creating announcement:', error);
            throw error;
        }
    }

    /**
     * Update an announcement
     */
    static async update(id, announcementData) {
        try {
            const updateFields = [];
            const values = [];
            let paramCount = 1;

            const fields = [
                'title', 'content', 'announcement_type', 'priority',
                'is_pinned', 'target_audience', 'expires_at'
            ];

            fields.forEach(field => {
                if (announcementData[field] !== undefined) {
                    updateFields.push(`${field} = $${paramCount++}`);
                    values.push(announcementData[field]);
                }
            });

            if (updateFields.length === 0) {
                throw new Error('No fields to update');
            }

            updateFields.push(`updated_at = CURRENT_TIMESTAMP`);
            values.push(id);

            const query = `
                UPDATE announcements SET ${updateFields.join(', ')}
                WHERE id = $${paramCount}
                RETURNING *
            `;

            const result = await pool.query(query, values);
            return result.rows[0] ? new Announcement(result.rows[0]) : null;
        } catch (error) {
            console.error('Error updating announcement:', error);
            throw error;
        }
    }

    /**
     * Delete an announcement
     */
    static async delete(id) {
        try {
            const query = 'DELETE FROM announcements WHERE id = $1 RETURNING *';
            const result = await pool.query(query, [id]);
            return result.rows[0];
        } catch (error) {
            console.error('Error deleting announcement:', error);
            throw error;
        }
    }
}

module.exports = { Event, Announcement };