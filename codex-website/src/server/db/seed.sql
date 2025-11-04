-- =====================================================
-- Codex RP Database Seed Data
-- Comprehensive test data for development and testing
-- =====================================================

-- =====================================================
-- ADMINS AND SYSTEM USERS
-- =====================================================

-- Create system administrators (password: 'admin123' hashed with bcrypt)
INSERT INTO admins (id, username, email, password_hash, role, is_active) VALUES
('550e8400-e29b-41d4-a716-446655440000', 'admin', 'admin@codexrp.com', '$2b$12$LQv3c1yqBwUunCzT1MDjUOS9PhqRJqcJg8C7oOG9LfR7v5dkh7Rty', 'super_admin', true),
('550e8400-e29b-41d4-a716-446655440001', 'moderator1', 'mod1@codexrp.com', '$2b$12$LQv3c1yqBwUunCzT1MDjUOS9PhqRJqcJg8C7oOG9LfR7v5dkh7Rty', 'moderator', true),
('550e8400-e29b-41d4-a716-446655440002', 'admin2', 'admin2@codexrp.com', '$2b$12$LQv3c1yqBwUunCzT1MDjUOS9PhqRJqcJg8C7oOG9LfR7v5dkh7Rty', 'admin', true);

-- =====================================================
-- REGULATION CATEGORIES
-- =====================================================

INSERT INTO regulation_categories (id, name, description, icon, color, sort_order, created_by) VALUES
('660e8400-e29b-41d4-a716-446655440000', 'Règles Générales', 'Règles de base du serveur applicables à tous', 'shield', '#3B82F6', 1, '550e8400-e29b-41d4-a716-446655440000'),
('660e8400-e29b-41d4-a716-446655440001', 'Roleplay', 'Règles spécifiques au jeu de rôle', 'theater-masks', '#8B5CF6', 2, '550e8400-e29b-41d4-a716-446655440000'),
('660e8400-e29b-41d4-a716-446655440002', 'Communication', 'Règles de communication et comportement', 'message-circle', '#10B981', 3, '550e8400-e29b-41d4-a716-446655440000'),
('660e8400-e29b-41d4-a716-446655440003', 'Sanctions', 'Système de sanctions et procédures', 'alert-triangle', '#F59E0B', 4, '550e8400-e29b-41d4-a716-446655440000'),
('660e8400-e29b-41d4-a716-446655440004', 'Économie RP', 'Règles économiques et commerciales', 'coins', '#06B6D4', 5, '550e8400-e29b-41d4-a716-446655440000');

-- =====================================================
-- REGULATIONS
-- =====================================================

-- Règles Générales
INSERT INTO regulations (category_id, title, description, severity, penalty_description, sort_order, created_by) VALUES
('660e8400-e29b-41d4-a716-446655440000', 'Respect mutuel obligatoire', 'Tous les joueurs doivent faire preuve de respect envers les autres membres de la communauté. Aucune forme de harcèlement, discrimination ou toxicité ne sera tolérée.', 'critical', 'Avertissement → Exclusion temporaire → Bannissement définitif', 1, '550e8400-e29b-41d4-a716-446655440000'),

('660e8400-e29b-41d4-a716-446655440000', 'Interdiction de triche', 'L''utilisation de logiciels tiers, exploits, bugs ou toute forme de triche est strictement interdite. Cela inclut les mods non autorisés et les scripts automatisés.', 'critical', 'Bannissement immédiat', 2, '550e8400-e29b-41d4-a716-446655440000'),

('660e8400-e29b-41d4-a716-446655440000', 'Majorité requise', 'L''accès au serveur est réservé aux personnes majeures (18 ans et plus) ou munies d''une autorisation parentale vérifiée.', 'major', 'Exclusion jusqu''à vérification d''âge', 3, '550e8400-e29b-41d4-a716-446655440000'),

('660e8400-e29b-41d4-a716-446655440000', 'Comptes multiples interdits', 'Chaque joueur ne peut posséder qu''un seul compte sur le serveur. Les comptes multiples entraînent le bannissement de tous les comptes associés.', 'major', 'Bannissement de tous les comptes', 4, '550e8400-e29b-41d4-a716-446655440000'),

-- Règles Roleplay
('660e8400-e29b-41d4-a716-446655440001', 'Cohérence du personnage', 'Votre personnage doit avoir une personnalité cohérente et réaliste. Les changements de personnalité drastiques doivent être justifiés par des événements RP.', 'warning', 'Avertissement → Révision du personnage', 1, '550e8400-e29b-41d4-a716-446655440000'),

('660e8400-e29b-41d4-a716-446655440001', 'Interdiction du MétagJeu', 'Il est interdit d''utiliser des informations obtenues hors-jeu (Discord, streams, etc.) dans vos actions RP. Chaque personnage a ses propres connaissances.', 'major', 'Avertissement → Exclusion temporaire', 2, '550e8400-e29b-41d4-a716-446655440000'),

('660e8400-e29b-41d4-a716-446655440001', 'Respect de la mort RP', 'Quand votre personnage meurt, vous devez respecter un délai avant de revenir et votre personnage ne se souvient pas des circonstances de sa mort.', 'warning', 'Avertissement → Formation RP obligatoire', 3, '550e8400-e29b-41d4-a716-446655440000'),

('660e8400-e29b-41d4-a716-446655440001', 'Limites du pouvoir-jeu', 'Vous ne pouvez pas forcer les actions d''autres joueurs. Laissez toujours la possibilité de réaction et de contre-action dans vos RP.', 'warning', 'Avertissement → Formation RP', 4, '550e8400-e29b-41d4-a716-446655440000'),

-- Règles Communication
('660e8400-e29b-41d4-a716-446655440002', 'Langage approprié', 'Le langage doit rester correct en toutes circonstances. Les insultes, propos discriminatoires ou à caractère sexuel sont interdits.', 'major', 'Avertissement → Mute temporaire → Exclusion', 1, '550e8400-e29b-41d4-a716-446655440000'),

('660e8400-e29b-41d4-a716-446655440002', 'Canaux de communication', 'Respectez l''usage de chaque canal Discord. Le vocal doit être utilisé uniquement pour le RP, le hors-RP se fait dans les canaux dédiés.', 'info', 'Rappel → Avertissement', 2, '550e8400-e29b-41d4-a716-446655440000'),

('660e8400-e29b-41d4-a716-446655440002', 'Pas de spam ni flood', 'Évitez le spam de messages, l''utilisation excessive d''emojis ou de stickers, et les messages répétitifs.', 'warning', 'Mute temporaire', 3, '550e8400-e29b-41d4-a716-446655440000'),

-- Règles Sanctions
('660e8400-e29b-41d4-a716-446655440003', 'Système d''avertissements', 'Les sanctions suivent une progression : Rappel → Avertissement → Exclusion temporaire → Bannissement. Les cas graves peuvent sauter des étapes.', 'info', 'Application automatique', 1, '550e8400-e29b-41d4-a716-446655440000'),

('660e8400-e29b-41d4-a716-446655440003', 'Droit de recours', 'Tout joueur sanctionné peut faire appel de sa sanction en contactant l''administration avec des preuves ou justifications.', 'info', 'Procédure d''appel disponible', 2, '550e8400-e29b-41d4-a716-446655440000'),

-- Règles Économie RP
('660e8400-e29b-41d4-a716-446655440004', 'Commerce équitable', 'Les prix doivent être réalistes et justifiés. Les monopoles abusifs ou la manipulation des prix sont interdits.', 'warning', 'Avertissement → Régulation forcée', 1, '550e8400-e29b-41d4-a716-446655440000'),

('660e8400-e29b-41d4-a716-446655440004', 'Transactions documentées', 'Les grosses transactions commerciales doivent être documentées et peuvent être auditées par l''administration.', 'info', 'Audit économique', 2, '550e8400-e29b-41d4-a716-446655440000');

-- =====================================================
-- PLAYERS (TEST DATA)
-- =====================================================

INSERT INTO players (id, username, email, discord_id, steam_id, is_whitelisted, total_playtime_hours) VALUES
('770e8400-e29b-41d4-a716-446655440000', 'Alexandre_Martin', 'alex.martin@email.com', '123456789012345678', 'STEAM_0:1:12345678', true, 250),
('770e8400-e29b-41d4-a716-446655440001', 'Marie_Dubois', 'marie.dubois@email.com', '123456789012345679', 'STEAM_0:1:12345679', true, 180),
('770e8400-e29b-41d4-a716-446655440002', 'Thomas_Bernard', 'thomas.bernard@email.com', '123456789012345680', 'STEAM_0:1:12345680', true, 420),
('770e8400-e29b-41d4-a716-446655440003', 'Sophie_Moreau', 'sophie.moreau@email.com', '123456789012345681', 'STEAM_0:1:12345681', true, 95),
('770e8400-e29b-41d4-a716-446655440004', 'Lucas_Petit', 'lucas.petit@email.com', '123456789012345682', 'STEAM_0:1:12345682', false, 0);

-- =====================================================
-- CHARACTERS
-- =====================================================

INSERT INTO characters (id, player_id, name, surname, age, gender, occupation, backstory, personality_traits, is_active, is_approved, approved_by, approved_at) VALUES
('880e8400-e29b-41d4-a716-446655440000', '770e8400-e29b-41d4-a716-446655440000', 'Alexandre', 'Martin', 32, 'male', 'Mécanicien', 'Ancien militaire reconverti dans la mécanique automobile. A servi 10 ans dans l''armée avant de revenir à la vie civile.', 'Pragmatique, loyal, perfectionniste', true, true, '550e8400-e29b-41d4-a716-446655440000', CURRENT_TIMESTAMP),

('880e8400-e29b-41d4-a716-446655440001', '770e8400-e29b-41d4-a716-446655440001', 'Marie', 'Dubois', 28, 'female', 'Médecin', 'Jeune médecin fraîchement diplômée, venue s''installer en ville pour ouvrir son propre cabinet.', 'Empathique, déterminée, perfectionniste', true, true, '550e8400-e29b-41d4-a716-446655440000', CURRENT_TIMESTAMP),

('880e8400-e29b-41d4-a716-446655440002', '770e8400-e29b-41d4-a716-446655440002', 'Thomas', 'Bernard', 45, 'male', 'Commissaire de Police', 'Vétéran de la police avec 20 ans d''expérience. Connu pour son intégrité et sa détermination à faire respecter la loi.', 'Juste, intègre, parfois inflexible', true, true, '550e8400-e29b-41d4-a716-446655440000', CURRENT_TIMESTAMP),

('880e8400-e29b-41d4-a716-446655440003', '770e8400-e29b-41d4-a716-446655440003', 'Sophie', 'Moreau', 25, 'female', 'Journaliste', 'Jeune journaliste ambitieuse, toujours à la recherche du scoop qui fera sa carrière.', 'Curieuse, tenace, parfois imprudente', true, true, '550e8400-e29b-41d4-a716-446655440001', CURRENT_TIMESTAMP);

-- =====================================================
-- SERVER EVENTS
-- =====================================================

INSERT INTO server_events (id, title, description, event_type, start_time, end_time, max_participants, organizer_id, is_featured) VALUES
('990e8400-e29b-41d4-a716-446655440000', 'Tournoi de Course Automobile', 'Grand prix de course automobile organisé sur le circuit de la ville. Inscriptions ouvertes à tous les pilotes licenciés.', 'tournament', CURRENT_TIMESTAMP + INTERVAL '3 days', CURRENT_TIMESTAMP + INTERVAL '3 days' + INTERVAL '4 hours', 20, '550e8400-e29b-41d4-a716-446655440000', true),

('990e8400-e29b-41d4-a716-446655440001', 'Marché de Noël', 'Événement communautaire avec stands de nourriture, artisanat et animations festives sur la place centrale.', 'community', CURRENT_TIMESTAMP + INTERVAL '1 week', CURRENT_TIMESTAMP + INTERVAL '1 week' + INTERVAL '6 hours', 100, '550e8400-e29b-41d4-a716-446655440001', true),

('990e8400-e29b-41d4-a716-446655440002', 'Formation Nouveaux Joueurs', 'Session de formation pour les nouveaux arrivants sur le serveur. Découverte des règles RP et des mécaniques de jeu.', 'community', CURRENT_TIMESTAMP + INTERVAL '2 days', CURRENT_TIMESTAMP + INTERVAL '2 days' + INTERVAL '2 hours', 15, '550e8400-e29b-41d4-a716-446655440001', false);

-- =====================================================
-- ANNOUNCEMENTS
-- =====================================================

INSERT INTO announcements (id, title, content, announcement_type, priority, is_pinned, author_id) VALUES
('aa0e8400-e29b-41d4-a716-446655440000', 'Mise à jour du règlement', 'Le règlement a été mis à jour avec de nouvelles règles concernant l''économie RP. Merci de prendre connaissance des changements.', 'rule_change', 'high', true, '550e8400-e29b-41d4-a716-446655440000'),

('aa0e8400-e29b-41d4-a716-446655440001', 'Maintenance programmée', 'Le serveur sera en maintenance ce dimanche de 14h à 16h pour l''installation de nouvelles fonctionnalités.', 'maintenance', 'normal', true, '550e8400-e29b-41d4-a716-446655440000'),

('aa0e8400-e29b-41d4-a716-446655440002', 'Bienvenue aux nouveaux joueurs', 'Nous souhaitons la bienvenue aux 15 nouveaux joueurs qui ont rejoint la communauté cette semaine !', 'general', 'low', false, '550e8400-e29b-41d4-a716-446655440001');

-- =====================================================
-- WHITELIST APPLICATIONS
-- =====================================================

INSERT INTO whitelist_applications (id, player_id, application_text, character_concept, previous_rp_experience, why_join_server, status, reviewer_id, reviewed_at) VALUES
('bb0e8400-e29b-41d4-a716-446655440000', '770e8400-e29b-41d4-a716-446655440004', 'Je souhaite rejoindre Codex RP car j''ai entendu beaucoup de bien de votre communauté.', 'Je voudrais jouer un électricien passionné de musique qui rêve de monter son propre groupe.', 'J''ai joué 2 ans sur un serveur RP français et 6 mois sur un serveur international.', 'Codex RP a une réputation excellente pour la qualité du RP et le sérieux de l''administration.', 'pending', NULL, NULL);

-- =====================================================
-- PLAYER REPORTS (EXAMPLES)
-- =====================================================

INSERT INTO player_reports (id, reporter_id, reported_player_id, report_type, title, description, status, priority, assigned_to) VALUES
('cc0e8400-e29b-41d4-a716-446655440000', '770e8400-e29b-41d4-a716-446655440001', '770e8400-e29b-41d4-a716-446655440003', 'rule_violation', 'Métagame présumé', 'Le joueur semble utiliser des informations Discord en jeu. Il connaissait mon nom sans qu''on se soit jamais rencontrés RP.', 'investigating', 'medium', '550e8400-e29b-41d4-a716-446655440001');

-- =====================================================
-- SERVER STATISTICS
-- =====================================================

INSERT INTO server_statistics (stat_date, total_players, active_players, new_registrations, total_playtime_hours, peak_concurrent_players) VALUES
(CURRENT_DATE - INTERVAL '7 days', 125, 45, 3, 850, 32),
(CURRENT_DATE - INTERVAL '6 days', 127, 52, 2, 920, 38),
(CURRENT_DATE - INTERVAL '5 days', 129, 48, 2, 880, 35),
(CURRENT_DATE - INTERVAL '4 days', 131, 55, 2, 1050, 42),
(CURRENT_DATE - INTERVAL '3 days', 133, 60, 2, 1150, 45),
(CURRENT_DATE - INTERVAL '2 days', 135, 58, 2, 1080, 40),
(CURRENT_DATE - INTERVAL '1 day', 137, 62, 2, 1200, 47),
(CURRENT_DATE, 139, 65, 2, 1250, 50);

-- =====================================================
-- PLAYER SESSIONS (SAMPLE DATA)
-- =====================================================

INSERT INTO player_sessions (player_id, character_id, session_start, session_end, duration_minutes, server_version) VALUES
('770e8400-e29b-41d4-a716-446655440000', '880e8400-e29b-41d4-a716-446655440000', CURRENT_TIMESTAMP - INTERVAL '2 hours', CURRENT_TIMESTAMP - INTERVAL '30 minutes', 90, 'v2.1.0'),
('770e8400-e29b-41d4-a716-446655440001', '880e8400-e29b-41d4-a716-446655440001', CURRENT_TIMESTAMP - INTERVAL '4 hours', CURRENT_TIMESTAMP - INTERVAL '2 hours', 120, 'v2.1.0'),
('770e8400-e29b-41d4-a716-446655440002', '880e8400-e29b-41d4-a716-446655440002', CURRENT_TIMESTAMP - INTERVAL '6 hours', CURRENT_TIMESTAMP - INTERVAL '3 hours', 180, 'v2.1.0');