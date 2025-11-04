-- =====================================================
-- Codex RP Database Schema
-- Complete database structure for a roleplay server
-- =====================================================

-- Enable UUID extension for better ID generation
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- =====================================================
-- CORE SYSTEM TABLES
-- =====================================================

-- Administrators table with enhanced security
CREATE TABLE admins (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    username VARCHAR(50) UNIQUE NOT NULL,
    email VARCHAR(255) UNIQUE NOT NULL,
    password_hash VARCHAR(255) NOT NULL,
    role ENUM('super_admin', 'admin', 'moderator') DEFAULT 'admin',
    is_active BOOLEAN DEFAULT true,
    last_login_at TIMESTAMP NULL,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    created_by UUID REFERENCES admins(id) ON DELETE SET NULL
);

-- Regulation categories for better organization
CREATE TABLE regulation_categories (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    name VARCHAR(100) NOT NULL UNIQUE,
    description TEXT,
    icon VARCHAR(50), -- For UI icons
    color VARCHAR(7), -- Hex color code
    sort_order INTEGER DEFAULT 0,
    is_active BOOLEAN DEFAULT true,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    created_by UUID REFERENCES admins(id) ON DELETE SET NULL
);

-- Enhanced regulations table
CREATE TABLE regulations (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    category_id UUID REFERENCES regulation_categories(id) ON DELETE SET NULL,
    title VARCHAR(255) NOT NULL,
    description TEXT NOT NULL,
    severity ENUM('info', 'warning', 'major', 'critical') DEFAULT 'info',
    penalty_description TEXT,
    sort_order INTEGER DEFAULT 0,
    is_active BOOLEAN DEFAULT true,
    version INTEGER DEFAULT 1,
    effective_date DATE DEFAULT CURRENT_DATE,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    created_by UUID REFERENCES admins(id) ON DELETE SET NULL,
    updated_by UUID REFERENCES admins(id) ON DELETE SET NULL
);

-- =====================================================
-- USER AND CHARACTER MANAGEMENT
-- =====================================================

-- Players/Users table
CREATE TABLE players (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    username VARCHAR(50) UNIQUE NOT NULL,
    email VARCHAR(255) UNIQUE NOT NULL,
    discord_id VARCHAR(50) UNIQUE,
    steam_id VARCHAR(50) UNIQUE,
    is_whitelisted BOOLEAN DEFAULT false,
    is_banned BOOLEAN DEFAULT false,
    ban_reason TEXT,
    ban_expires_at TIMESTAMP NULL,
    total_playtime_hours INTEGER DEFAULT 0,
    last_seen_at TIMESTAMP,
    registration_date TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
);

-- Character profiles for RP
CREATE TABLE characters (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    player_id UUID NOT NULL REFERENCES players(id) ON DELETE CASCADE,
    name VARCHAR(100) NOT NULL,
    surname VARCHAR(100),
    age INTEGER,
    gender ENUM('male', 'female', 'other'),
    occupation VARCHAR(100),
    backstory TEXT,
    appearance_description TEXT,
    personality_traits TEXT,
    is_active BOOLEAN DEFAULT true,
    is_approved BOOLEAN DEFAULT false,
    approved_by UUID REFERENCES admins(id) ON DELETE SET NULL,
    approved_at TIMESTAMP NULL,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    UNIQUE(player_id, name) -- One character name per player
);

-- =====================================================
-- MODERATION AND REPORTING SYSTEM
-- =====================================================

-- Player reports and complaints
CREATE TABLE player_reports (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    reporter_id UUID REFERENCES players(id) ON DELETE SET NULL,
    reported_player_id UUID NOT NULL REFERENCES players(id) ON DELETE CASCADE,
    character_id UUID REFERENCES characters(id) ON DELETE SET NULL,
    report_type ENUM('rule_violation', 'harassment', 'cheating', 'griefing', 'other') NOT NULL,
    title VARCHAR(255) NOT NULL,
    description TEXT NOT NULL,
    evidence_urls TEXT[], -- Array of evidence links
    status ENUM('pending', 'investigating', 'resolved', 'dismissed') DEFAULT 'pending',
    priority ENUM('low', 'medium', 'high', 'urgent') DEFAULT 'medium',
    assigned_to UUID REFERENCES admins(id) ON DELETE SET NULL,
    resolution_notes TEXT,
    resolved_at TIMESTAMP NULL,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
);

-- Moderation actions log
CREATE TABLE moderation_actions (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    admin_id UUID NOT NULL REFERENCES admins(id) ON DELETE CASCADE,
    target_player_id UUID NOT NULL REFERENCES players(id) ON DELETE CASCADE,
    action_type ENUM('warning', 'kick', 'ban', 'unban', 'whitelist', 'unwhitelist', 'note') NOT NULL,
    reason TEXT NOT NULL,
    duration_hours INTEGER, -- For temporary bans
    related_report_id UUID REFERENCES player_reports(id) ON DELETE SET NULL,
    is_active BOOLEAN DEFAULT true,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    expires_at TIMESTAMP NULL
);

-- =====================================================
-- APPLICATION AND WHITELIST SYSTEM
-- =====================================================

-- Whitelist applications
CREATE TABLE whitelist_applications (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    player_id UUID NOT NULL REFERENCES players(id) ON DELETE CASCADE,
    application_text TEXT NOT NULL,
    character_concept TEXT,
    previous_rp_experience TEXT,
    why_join_server TEXT,
    status ENUM('pending', 'approved', 'rejected', 'needs_revision') DEFAULT 'pending',
    reviewer_id UUID REFERENCES admins(id) ON DELETE SET NULL,
    reviewer_notes TEXT,
    reviewed_at TIMESTAMP NULL,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
);

-- =====================================================
-- EVENTS AND ANNOUNCEMENTS
-- =====================================================

-- Server events and activities
CREATE TABLE server_events (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    title VARCHAR(255) NOT NULL,
    description TEXT NOT NULL,
    event_type ENUM('community', 'rp_event', 'tournament', 'maintenance', 'update') NOT NULL,
    start_time TIMESTAMP NOT NULL,
    end_time TIMESTAMP,
    max_participants INTEGER,
    current_participants INTEGER DEFAULT 0,
    requirements TEXT,
    rewards TEXT,
    location VARCHAR(255),
    organizer_id UUID NOT NULL REFERENCES admins(id) ON DELETE CASCADE,
    is_active BOOLEAN DEFAULT true,
    is_featured BOOLEAN DEFAULT false,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
);

-- Event participants
CREATE TABLE event_participants (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    event_id UUID NOT NULL REFERENCES server_events(id) ON DELETE CASCADE,
    player_id UUID NOT NULL REFERENCES players(id) ON DELETE CASCADE,
    character_id UUID REFERENCES characters(id) ON DELETE SET NULL,
    registration_date TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    attendance_status ENUM('registered', 'attended', 'no_show') DEFAULT 'registered',
    UNIQUE(event_id, player_id)
);

-- Server announcements
CREATE TABLE announcements (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    title VARCHAR(255) NOT NULL,
    content TEXT NOT NULL,
    announcement_type ENUM('general', 'update', 'maintenance', 'rule_change', 'event') NOT NULL,
    priority ENUM('low', 'normal', 'high', 'urgent') DEFAULT 'normal',
    is_pinned BOOLEAN DEFAULT false,
    target_audience ENUM('all', 'whitelisted', 'staff') DEFAULT 'all',
    expires_at TIMESTAMP NULL,
    author_id UUID NOT NULL REFERENCES admins(id) ON DELETE CASCADE,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
);

-- =====================================================
-- GAME STATISTICS AND LOGS
-- =====================================================

-- Player session logs
CREATE TABLE player_sessions (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    player_id UUID NOT NULL REFERENCES players(id) ON DELETE CASCADE,
    character_id UUID REFERENCES characters(id) ON DELETE SET NULL,
    session_start TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    session_end TIMESTAMP NULL,
    duration_minutes INTEGER,
    server_version VARCHAR(50),
    disconnect_reason VARCHAR(100)
);

-- Server statistics
CREATE TABLE server_statistics (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    stat_date DATE NOT NULL,
    total_players INTEGER DEFAULT 0,
    active_players INTEGER DEFAULT 0,
    new_registrations INTEGER DEFAULT 0,
    total_playtime_hours INTEGER DEFAULT 0,
    peak_concurrent_players INTEGER DEFAULT 0,
    total_reports INTEGER DEFAULT 0,
    resolved_reports INTEGER DEFAULT 0,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    UNIQUE(stat_date)
);

-- =====================================================
-- AUDIT AND CHANGELOG
-- =====================================================

-- System audit log for tracking all changes
CREATE TABLE audit_log (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    table_name VARCHAR(100) NOT NULL,
    record_id UUID NOT NULL,
    action ENUM('INSERT', 'UPDATE', 'DELETE') NOT NULL,
    old_values JSON,
    new_values JSON,
    changed_by UUID REFERENCES admins(id) ON DELETE SET NULL,
    changed_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    ip_address INET,
    user_agent TEXT
);

-- =====================================================
-- INDEXES FOR PERFORMANCE
-- =====================================================

-- Regulations indexes
CREATE INDEX idx_regulations_category ON regulations(category_id);
CREATE INDEX idx_regulations_active ON regulations(is_active);
CREATE INDEX idx_regulations_effective_date ON regulations(effective_date);

-- Players indexes
CREATE INDEX idx_players_username ON players(username);
CREATE INDEX idx_players_discord_id ON players(discord_id);
CREATE INDEX idx_players_steam_id ON players(steam_id);
CREATE INDEX idx_players_whitelisted ON players(is_whitelisted);
CREATE INDEX idx_players_banned ON players(is_banned);

-- Characters indexes
CREATE INDEX idx_characters_player_id ON characters(player_id);
CREATE INDEX idx_characters_active ON characters(is_active);
CREATE INDEX idx_characters_approved ON characters(is_approved);

-- Reports indexes
CREATE INDEX idx_reports_status ON player_reports(status);
CREATE INDEX idx_reports_type ON player_reports(report_type);
CREATE INDEX idx_reports_priority ON player_reports(priority);
CREATE INDEX idx_reports_created_at ON player_reports(created_at);

-- Events indexes
CREATE INDEX idx_events_start_time ON server_events(start_time);
CREATE INDEX idx_events_type ON server_events(event_type);
CREATE INDEX idx_events_active ON server_events(is_active);

-- Sessions indexes
CREATE INDEX idx_sessions_player_id ON player_sessions(player_id);
CREATE INDEX idx_sessions_start_time ON player_sessions(session_start);

-- Audit log indexes
CREATE INDEX idx_audit_table_record ON audit_log(table_name, record_id);
CREATE INDEX idx_audit_changed_at ON audit_log(changed_at);

-- =====================================================
-- TRIGGERS FOR AUTOMATIC UPDATES
-- =====================================================

-- Update timestamp trigger function
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = CURRENT_TIMESTAMP;
    RETURN NEW;
END;
$$ language 'plpgsql';

-- Apply triggers to tables with updated_at columns
CREATE TRIGGER update_admins_updated_at BEFORE UPDATE ON admins FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
CREATE TRIGGER update_regulation_categories_updated_at BEFORE UPDATE ON regulation_categories FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
CREATE TRIGGER update_regulations_updated_at BEFORE UPDATE ON regulations FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
CREATE TRIGGER update_players_updated_at BEFORE UPDATE ON players FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
CREATE TRIGGER update_characters_updated_at BEFORE UPDATE ON characters FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
CREATE TRIGGER update_player_reports_updated_at BEFORE UPDATE ON player_reports FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
CREATE TRIGGER update_whitelist_applications_updated_at BEFORE UPDATE ON whitelist_applications FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
CREATE TRIGGER update_server_events_updated_at BEFORE UPDATE ON server_events FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
CREATE TRIGGER update_announcements_updated_at BEFORE UPDATE ON announcements FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();