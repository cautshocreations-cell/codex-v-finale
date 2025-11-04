/**
 * Database Configuration and Connection Pool
 * Centralized database management for Codex RP
 */

const { Pool } = require('pg');
require('dotenv').config();

// Database configuration
const dbConfig = {
    user: process.env.DB_USER || 'postgres',
    host: process.env.DB_HOST || 'localhost',
    database: process.env.DB_NAME || 'codex_rp',
    password: process.env.DB_PASSWORD || 'password',
    port: parseInt(process.env.DB_PORT) || 5432,
    ssl: process.env.NODE_ENV === 'production' ? { rejectUnauthorized: false } : false,
    
    // Connection pool settings
    max: parseInt(process.env.DB_POOL_SIZE) || 10,
    idleTimeoutMillis: parseInt(process.env.DB_IDLE_TIMEOUT) || 30000,
    connectionTimeoutMillis: 2000,
    
    // Retry configuration
    query_timeout: 10000,
    statement_timeout: 10000
};

// Create connection pool
const pool = new Pool(dbConfig);

// Error handling
pool.on('error', (err, client) => {
    console.error('Unexpected error on idle client:', err);
    process.exit(-1);
});

pool.on('connect', (client) => {
    console.log('🗄️  Database client connected');
});

pool.on('remove', (client) => {
    console.log('🗄️  Database client disconnected');
});

/**
 * Test database connection
 */
async function testConnection() {
    try {
        const client = await pool.connect();
        console.log('✅ Database connection successful');
        
        // Test query
        const result = await client.query('SELECT NOW() as current_time, version() as postgres_version');
        console.log('📊 Database info:', {
            current_time: result.rows[0].current_time,
            postgres_version: result.rows[0].postgres_version.split(' ')[0]
        });
        
        client.release();
        return true;
    } catch (error) {
        console.error('❌ Database connection failed:', error.message);
        return false;
    }
}

/**
 * Execute a query with error handling and logging
 */
async function query(text, params = []) {
    const start = Date.now();
    
    try {
        const result = await pool.query(text, params);
        const duration = Date.now() - start;
        
        if (process.env.NODE_ENV === 'development' && process.env.LOG_QUERIES === 'true') {
            console.log('📝 Executed query:', {
                text: text.substring(0, 100) + (text.length > 100 ? '...' : ''),
                duration: `${duration}ms`,
                rows: result.rowCount
            });
        }
        
        return result;
    } catch (error) {
        const duration = Date.now() - start;
        console.error('💥 Query error:', {
            error: error.message,
            query: text.substring(0, 100) + (text.length > 100 ? '...' : ''),
            params: params,
            duration: `${duration}ms`
        });
        throw error;
    }
}

/**
 * Execute multiple queries in a transaction
 */
async function transaction(queries) {
    const client = await pool.connect();
    
    try {
        await client.query('BEGIN');
        
        const results = [];
        for (const { text, params } of queries) {
            const result = await client.query(text, params || []);
            results.push(result);
        }
        
        await client.query('COMMIT');
        console.log('✅ Transaction completed successfully');
        return results;
    } catch (error) {
        await client.query('ROLLBACK');
        console.error('💥 Transaction failed, rolled back:', error.message);
        throw error;
    } finally {
        client.release();
    }
}

/**
 * Get database statistics
 */
async function getStats() {
    try {
        const queries = [
            // Connection pool stats
            {
                name: 'Pool Stats',
                query: `
                    SELECT 
                        ${pool.totalCount} as total_connections,
                        ${pool.idleCount} as idle_connections,
                        ${pool.waitingCount} as waiting_count
                `
            },
            
            // Database size
            {
                name: 'Database Size',
                query: `
                    SELECT 
                        pg_size_pretty(pg_database_size(current_database())) as database_size,
                        current_database() as database_name
                `
            },
            
            // Table sizes
            {
                name: 'Table Sizes',
                query: `
                    SELECT 
                        schemaname,
                        tablename,
                        pg_size_pretty(pg_total_relation_size(schemaname||'.'||tablename)) as size
                    FROM pg_tables 
                    WHERE schemaname = 'public'
                    ORDER BY pg_total_relation_size(schemaname||'.'||tablename) DESC
                    LIMIT 10
                `
            },
            
            // Active connections
            {
                name: 'Active Connections',
                query: `
                    SELECT 
                        COUNT(*) as active_connections,
                        state,
                        application_name
                    FROM pg_stat_activity 
                    WHERE datname = current_database()
                    GROUP BY state, application_name
                `
            }
        ];
        
        const stats = {};
        
        for (const { name, query } of queries) {
            try {
                const result = await pool.query(query);
                stats[name] = result.rows;
            } catch (error) {
                stats[name] = { error: error.message };
            }
        }
        
        return stats;
    } catch (error) {
        console.error('Error getting database stats:', error);
        throw error;
    }
}

/**
 * Health check for the database
 */
async function healthCheck() {
    try {
        const start = Date.now();
        await pool.query('SELECT 1');
        const responseTime = Date.now() - start;
        
        return {
            status: 'healthy',
            responseTime: `${responseTime}ms`,
            timestamp: new Date().toISOString(),
            pool: {
                total: pool.totalCount,
                idle: pool.idleCount,
                waiting: pool.waitingCount
            }
        };
    } catch (error) {
        return {
            status: 'unhealthy',
            error: error.message,
            timestamp: new Date().toISOString()
        };
    }
}

/**
 * Graceful shutdown
 */
async function shutdown() {
    try {
        console.log('🔄 Closing database connections...');
        await pool.end();
        console.log('✅ Database connections closed');
    } catch (error) {
        console.error('❌ Error closing database connections:', error);
    }
}

// Handle process termination
process.on('SIGINT', shutdown);
process.on('SIGTERM', shutdown);

module.exports = {
    pool,
    query,
    transaction,
    testConnection,
    getStats,
    healthCheck,
    shutdown,
    dbConfig: {
        ...dbConfig,
        password: '***' // Hide password in exports
    }
};