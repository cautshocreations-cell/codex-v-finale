# 🎮 Codex RP - Base de Données Complète

## 📋 Vue d'ensemble

Une base de données PostgreSQL complète et moderne pour votre serveur de jeu de rôle Codex RP, incluant :

- **Système de règlements avancé** avec catégories et versioning
- **Gestion des joueurs et personnages** avec whitelist et modération
- **Système d'événements** et d'annonces
- **Outils de modération** et de rapports
- **Statistiques détaillées** et logs d'audit
- **Interface d'administration** sécurisée

## 🗄️ Structure de la Base de Données

### Tables Principales

| Table | Description |
|-------|-------------|
| `admins` | Administrateurs et modérateurs |
| `regulation_categories` | Catégories de règlements |
| `regulations` | Règlements du serveur |
| `players` | Comptes joueurs |
| `characters` | Personnages RP |
| `server_events` | Événements serveur |
| `announcements` | Annonces officielles |
| `player_reports` | Rapports de joueurs |
| `moderation_actions` | Actions de modération |
| `whitelist_applications` | Demandes de whitelist |

### Tables de Support

- `event_participants` - Participants aux événements
- `player_sessions` - Sessions de jeu
- `server_statistics` - Statistiques serveur
- `audit_log` - Journal d'audit système

## 🚀 Installation Rapide

### 1. Prérequis

```bash
# PostgreSQL 12+ requis
sudo apt-get install postgresql postgresql-contrib

# Node.js 16+ requis
node --version  # Vérifier la version
```

### 2. Configuration

```bash
# Copier le fichier de configuration
cp .env.example .env

# Éditer les paramètres de base de données
nano .env
```

### 3. Variables d'Environnement Essentielles

```env
# Base de données
DB_HOST=localhost
DB_PORT=5432
DB_NAME=codex_rp
DB_USER=postgres
DB_PASSWORD=votre_mot_de_passe

# Sécurité
JWT_SECRET=votre_secret_jwt_très_sécurisé
SESSION_SECRET=votre_secret_session_très_sécurisé
BCRYPT_ROUNDS=12

# Admin par défaut
DEFAULT_ADMIN_USERNAME=admin
DEFAULT_ADMIN_PASSWORD=admin123
DEFAULT_ADMIN_EMAIL=admin@codexrp.com
```

### 4. Installation et Migration

```bash
# Installer les dépendances
npm install

# Créer la base de données
createdb codex_rp

# Exécuter la migration complète
npm run migrate

# Ou avec backup et reset
npm run migrate:reset
```

## 🛠️ Scripts de Migration

### Migration Standard
```bash
# Migration normale (schéma + données)
npm run migrate

# Seulement le schéma (sans données de test)
npm run migrate:schema

# Reset complet avec backup
npm run migrate:reset
```

### Maintenance
```bash
# Créer un backup manuel
npm run db:backup

# Vérifier la santé de la DB
npm run db:health

# Statistiques de la base
npm run db:stats
```

## 📊 Fonctionnalités de la Base de Données

### 🔐 Système d'Administration

```sql
-- Trois niveaux d'accès
- super_admin: Accès complet
- admin: Gestion règlements/joueurs
- moderator: Modération uniquement
```

### 📜 Gestion des Règlements

- **Catégories personnalisables** avec icônes et couleurs
- **Versioning automatique** des règlements
- **Niveaux de gravité** (info, warning, major, critical)
- **Dates d'effet** et archivage
- **Recherche full-text** dans les règlements

### 👥 Gestion des Joueurs

- **Profils complets** avec Discord/Steam
- **Système de whitelist** avec applications
- **Personnages multiples** par joueur
- **Historique de sanctions** et modération
- **Statistiques de temps de jeu**

### 🎉 Système d'Événements

- **Types d'événements** variés (RP, tournois, maintenance)
- **Inscription/désinscription** automatique
- **Limites de participants** et prérequis
- **Récompenses** et système de points

### 📈 Analytics et Rapports

- **Statistiques temps réel** des joueurs
- **Logs d'audit** complets
- **Rapports de modération** détaillés
- **Métriques de performance** serveur

## 🔧 Utilisation Avancée

### Requêtes Utiles

```sql
-- Joueurs les plus actifs
SELECT username, total_playtime_hours 
FROM players 
ORDER BY total_playtime_hours DESC 
LIMIT 10;

-- Règlements par catégorie
SELECT rc.name, COUNT(r.id) as regulation_count
FROM regulation_categories rc
LEFT JOIN regulations r ON rc.id = r.category_id
GROUP BY rc.name;

-- Événements à venir
SELECT title, start_time, current_participants, max_participants
FROM server_events 
WHERE start_time > NOW() 
ORDER BY start_time;
```

### Backup Automatique

```bash
# Configuration du backup automatique (crontab)
0 2 * * * cd /path/to/codex-rp && npm run db:backup
```

### Monitoring

```javascript
// Vérification de santé de la DB
const { healthCheck } = require('./src/server/db/database');
const health = await healthCheck();
console.log(health);
```

## 🐛 Dépannage

### Problèmes Courants

1. **Erreur de connexion PostgreSQL**
   ```bash
   # Vérifier le service
   sudo systemctl status postgresql
   
   # Redémarrer si nécessaire
   sudo systemctl restart postgresql
   ```

2. **Permissions insuffisantes**
   ```sql
   -- Se connecter en tant que postgres
   sudo -u postgres psql
   
   -- Créer utilisateur et permissions
   CREATE USER codex_user WITH PASSWORD 'password';
   GRANT ALL PRIVILEGES ON DATABASE codex_rp TO codex_user;
   ```

3. **Migration échouée**
   ```bash
   # Réinitialiser complètement
   npm run migrate:reset
   
   # Vérifier les logs
   tail -f logs/migration.log
   ```

### Support et Debug

```bash
# Mode debug complet
DEBUG=codex-rp:* npm run dev

# Logs détaillés des requêtes
LOG_QUERIES=true npm run dev

# Test de connexion simple
node -e "require('./src/server/db/database').testConnection()"
```

## 📚 Documentation API

Les modèles incluent des méthodes complètes pour :

- **CRUD operations** sécurisées
- **Validation** des données
- **Transactions** atomiques
- **Pagination** intelligente
- **Filtrage** et recherche
- **Audit trail** automatique

### Exemple d'utilisation

```javascript
const Admin = require('./src/server/models/admin.model');
const { getAllRegulations } = require('./src/server/models/regulation.model');

// Authentification admin
const admin = await Admin.authenticate('username', 'password');

// Récupération des règlements par catégorie
const regulations = await getAllRegulations();
```

## 🔄 Mises à Jour

### Migration de Version

```bash
# Sauvegarder avant mise à jour
npm run db:backup

# Appliquer les nouvelles migrations
npm run migrate

# Vérifier l'intégrité
npm run db:health
```

### Changelog de la DB

- **v2.0** - Base de données complète PostgreSQL
- **v1.0** - Version basique MongoDB

## 📞 Support

Pour toute question ou problème :

1. Vérifiez les logs : `logs/codex-rp.log`
2. Consultez la documentation : `docs/`
3. Créez une issue : GitHub Issues
4. Discord : Serveur Codex RP

---

**🎮 Bon jeu sur Codex RP !**