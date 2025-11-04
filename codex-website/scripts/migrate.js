#!/usr/bin/env node

/**
 * Database Migration Script for Codex RP
 * Handles database initialization, schema updates, and data seeding
 */

const fs = require('fs');
const path = require('path');
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

// ANSI color codes for console output
const colors = {
    reset: '\x1b[0m',
    red: '\x1b[31m',
    green: '\x1b[32m',
    yellow: '\x1b[33m',
    blue: '\x1b[34m',
    magenta: '\x1b[35m',
    cyan: '\x1b[36m',
    white: '\x1b[37m'
};

function log(message, color = 'white') {
    console.log(`${colors[color]}${message}${colors.reset}`);
}

function logSuccess(message) {
    log(`✅ ${message}`, 'green');
}

function logError(message) {
    log(`❌ ${message}`, 'red');
}

function logInfo(message) {
    log(`ℹ️  ${message}`, 'cyan');
}

function logWarning(message) {
    log(`⚠️  ${message}`, 'yellow');
}

/**
 * Read SQL file content
 */
function readSQLFile(filename) {
    const filePath = path.join(__dirname, '..', 'src', 'server', 'db', filename);
    if (!fs.existsSync(filePath)) {
        throw new Error(`SQL file not found: ${filePath}`);
    }
    return fs.readFileSync(filePath, 'utf8');
}

/**
 * Execute SQL query with error handling
 */
async function executeSQL(query, description) {
    try {
        logInfo(`Executing: ${description}`);
        await pool.query(query);
        logSuccess(`Completed: ${description}`);
        return true;
    } catch (error) {
        logError(`Failed: ${description}`);
        logError(`Error: ${error.message}`);
        return false;
    }
}

/**
 * Check if database exists
 */
async function checkDatabase() {
    try {
        const client = await pool.connect();
        await client.query('SELECT 1');
        client.release();
        logSuccess('Database connection established');
        return true;
    } catch (error) {
        logError(`Database connection failed: ${error.message}`);
        return false;
    }
}

/**
 * Check if tables exist
 */
async function checkTablesExist() {
    try {
        const query = `
            SELECT COUNT(*) as table_count 
            FROM information_schema.tables 
            WHERE table_schema = 'public' 
            AND table_type = 'BASE TABLE'
        `;
        
        const result = await pool.query(query);
        const tableCount = parseInt(result.rows[0].table_count);
        
        if (tableCount > 0) {
            logInfo(`Found ${tableCount} existing tables`);
            return true;
        }
        
        logInfo('No tables found - fresh installation');
        return false;
    } catch (error) {
        logError(`Error checking tables: ${error.message}`);
        return false;
    }
}

/**
 * Create database schema
 */
async function createSchema() {
    try {
        logInfo('Creating database schema...');
        const schemaSQL = readSQLFile('schema.sql');
        
        // Split the schema into individual statements
        const statements = schemaSQL
            .split(';')
            .map(stmt => stmt.trim())
            .filter(stmt => stmt.length > 0 && !stmt.startsWith('--'));
        
        for (let i = 0; i < statements.length; i++) {
            const statement = statements[i] + ';';
            if (statement.trim() !== ';') {
                await executeSQL(statement, `Schema statement ${i + 1}/${statements.length}`);
            }
        }
        
        logSuccess('Database schema created successfully');
        return true;
    } catch (error) {
        logError(`Schema creation failed: ${error.message}`);
        return false;
    }
}

/**
 * Seed database with initial data
 */
async function seedDatabase() {
    try {
        logInfo('Seeding database with initial data...');
        const seedSQL = readSQLFile('seed.sql');
        
        // Split the seed data into individual statements
        const statements = seedSQL
            .split(';')
            .map(stmt => stmt.trim())
            .filter(stmt => stmt.length > 0 && !stmt.startsWith('--'));
        
        for (let i = 0; i < statements.length; i++) {
            const statement = statements[i] + ';';
            if (statement.trim() !== ';') {
                await executeSQL(statement, `Seed statement ${i + 1}/${statements.length}`);
            }
        }
        
        logSuccess('Database seeded successfully');
        return true;
    } catch (error) {
        logError(`Database seeding failed: ${error.message}`);
        return false;
    }
}

/**
 * Drop all tables (for reset)
 */
async function dropAllTables() {
    try {
        logWarning('Dropping all tables...');
        
        // Get all table names
        const tablesQuery = `
            SELECT tablename 
            FROM pg_tables 
            WHERE schemaname = 'public'
        `;
        
        const result = await pool.query(tablesQuery);
        const tables = result.rows.map(row => row.tablename);
        
        if (tables.length === 0) {
            logInfo('No tables to drop');
            return true;
        }
        
        // Drop tables with CASCADE to handle dependencies
        for (const table of tables) {
            await executeSQL(`DROP TABLE IF EXISTS "${table}" CASCADE`, `Dropping table: ${table}`);
        }
        
        // Drop extensions
        await executeSQL('DROP EXTENSION IF EXISTS "uuid-ossp"', 'Dropping UUID extension');
        
        logSuccess('All tables dropped successfully');
        return true;
    } catch (error) {
        logError(`Failed to drop tables: ${error.message}`);
        return false;
    }
}

/**
 * Create backup of current database
 */
async function createBackup() {
    try {
        const timestamp = new Date().toISOString().replace(/[:.]/g, '-');
        const backupFile = path.join(__dirname, '..', 'backups', `backup-${timestamp}.sql`);
        
        // Ensure backup directory exists
        const backupDir = path.dirname(backupFile);
        if (!fs.existsSync(backupDir)) {
            fs.mkdirSync(backupDir, { recursive: true });
        }
        
        logInfo(`Creating backup: ${backupFile}`);
        
        // Use pg_dump to create backup (requires pg_dump to be installed)
        const { spawn } = require('child_process');
        
        return new Promise((resolve, reject) => {
            const pgDump = spawn('pg_dump', [
                '-h', dbConfig.host,
                '-p', dbConfig.port.toString(),
                '-U', dbConfig.user,
                '-d', dbConfig.database,
                '-f', backupFile,
                '--no-password'
            ], {
                env: { ...process.env, PGPASSWORD: dbConfig.password }
            });
            
            pgDump.on('close', (code) => {
                if (code === 0) {
                    logSuccess(`Backup created: ${backupFile}`);
                    resolve(true);
                } else {
                    logError(`Backup failed with code: ${code}`);
                    resolve(false);
                }
            });
            
            pgDump.on('error', (error) => {
                logError(`Backup error: ${error.message}`);
                resolve(false);
            });
        });
    } catch (error) {
        logError(`Backup creation failed: ${error.message}`);
        return false;
    }
}

/**
 * Validate database integrity
 */
async function validateDatabase() {
    try {
        logInfo('Validating database integrity...');
        
        const validationQueries = [
            {
                name: 'Check admin table',
                query: 'SELECT COUNT(*) FROM admins',
                expected: 'rows'
            },
            {
                name: 'Check regulation categories',
                query: 'SELECT COUNT(*) FROM regulation_categories',
                expected: 'rows'
            },
            {
                name: 'Check regulations',
                query: 'SELECT COUNT(*) FROM regulations',
                expected: 'rows'
            },
            {
                name: 'Check foreign key constraints',
                query: `
                    SELECT COUNT(*) FROM information_schema.table_constraints 
                    WHERE constraint_type = 'FOREIGN KEY' AND table_schema = 'public'
                `,
                expected: 'constraints'
            }
        ];
        
        for (const validation of validationQueries) {
            const result = await pool.query(validation.query);
            const count = parseInt(result.rows[0].count);
            logSuccess(`${validation.name}: ${count} ${validation.expected}`);
        }
        
        logSuccess('Database validation completed');
        return true;
    } catch (error) {
        logError(`Database validation failed: ${error.message}`);
        return false;
    }
}

/**
 * Main migration function
 */
async function runMigration(options = {}) {
    const { reset = false, backup = false, seedData = true } = options;
    
    log('\n🚀 Starting Codex RP Database Migration', 'magenta');
    log('=========================================', 'magenta');
    
    try {
        // Check database connection
        const dbConnected = await checkDatabase();
        if (!dbConnected) {
            process.exit(1);
        }
        
        // Create backup if requested
        if (backup) {
            await createBackup();
        }
        
        // Reset database if requested
        if (reset) {
            const tablesExist = await checkTablesExist();
            if (tablesExist) {
                await dropAllTables();
            }
        }
        
        // Check if schema needs to be created
        const tablesExist = await checkTablesExist();
        if (!tablesExist) {
            const schemaCreated = await createSchema();
            if (!schemaCreated) {
                process.exit(1);
            }
        } else {
            logInfo('Schema already exists, skipping creation');
        }
        
        // Seed database if requested
        if (seedData) {
            await seedDatabase();
        }
        
        // Validate database
        await validateDatabase();
        
        log('\n🎉 Migration completed successfully!', 'green');
        log('=====================================', 'green');
        
    } catch (error) {
        logError(`Migration failed: ${error.message}`);
        process.exit(1);
    } finally {
        await pool.end();
    }
}

/**
 * Command line interface
 */
async function main() {
    const args = process.argv.slice(2);
    const options = {};
    
    // Parse command line arguments
    for (const arg of args) {
        switch (arg) {
            case '--reset':
                options.reset = true;
                break;
            case '--backup':
                options.backup = true;
                break;
            case '--no-seed':
                options.seedData = false;
                break;
            case '--help':
                showHelp();
                return;
            default:
                if (arg.startsWith('--')) {
                    logWarning(`Unknown option: ${arg}`);
                }
        }
    }
    
    await runMigration(options);
}

/**
 * Show help information
 */
function showHelp() {
    log('\n📖 Codex RP Database Migration Tool', 'cyan');
    log('====================================', 'cyan');
    log('\nUsage: node migrate.js [options]', 'white');
    log('\nOptions:', 'white');
    log('  --reset     Drop all existing tables and recreate schema', 'white');
    log('  --backup    Create a backup before migration', 'white');
    log('  --no-seed   Skip seeding the database with initial data', 'white');
    log('  --help      Show this help message', 'white');
    log('\nExamples:', 'white');
    log('  node migrate.js                    # Normal migration', 'white');
    log('  node migrate.js --reset --backup   # Reset with backup', 'white');
    log('  node migrate.js --no-seed          # Schema only', 'white');
    log('');
}

// Run if called directly
if (require.main === module) {
    main().catch(error => {
        logError(`Unexpected error: ${error.message}`);
        process.exit(1);
    });
}

module.exports = { runMigration, createSchema, seedDatabase, validateDatabase };