# Codex RP - Guide de déploiement

## 🚀 Hébergement gratuit avec Railway

### Étape 1 : Préparation
1. Créer un compte sur [Railway.app](https://railway.app)
2. Connecter votre compte GitHub
3. Fork ou push ce projet sur GitHub

### Étape 2 : Déploiement
1. Cliquer "New Project" sur Railway
2. Sélectionner "Deploy from GitHub repo"
3. Choisir votre repository codex-website
4. Railway détectera automatiquement Node.js

### Étape 3 : Base de données
1. Cliquer "Add Service" → "Database" → "PostgreSQL"
2. Railway créera automatiquement DATABASE_URL
3. Pas besoin de configuration manuelle !

### Étape 4 : Variables d'environnement
Ajouter dans l'onglet "Variables" :
```
NODE_ENV=production
JWT_SECRET=votre-cle-jwt-super-secrete
SESSION_SECRET=votre-cle-session-secrete
DEFAULT_ADMIN_PASSWORD=MotDePasseAdmin123!
```

### Étape 5 : Domaine
1. Aller dans "Settings" → "Domains"
2. Railway fournit un domaine gratuit : `*.up.railway.app`
3. Optionnel : connecter votre propre domaine

## 🌐 Alternatives

### Vercel (Frontend uniquement)
- Parfait pour sites statiques
- Domaine : `*.vercel.app`
- Déploiement Git automatique

### Render
- Support PostgreSQL gratuit
- Domaine : `*.onrender.com`
- Redémarrage après inactivité

### Netlify (Frontend uniquement)
- Excellent pour JAMstack
- Domaine : `*.netlify.app`
- Fonctions serverless limitées

## ⚡ Configuration rapide Railway

1. **Créer un compte** : https://railway.app
2. **Nouveau projet** → "Deploy from GitHub"
3. **Ajouter PostgreSQL** : "+ Add Service" → "PostgreSQL"
4. **Variables d'environnement** :
   - `NODE_ENV=production`
   - `JWT_SECRET=changez-moi`
   - `SESSION_SECRET=changez-moi-aussi`
5. **Déployer** : Automatique à chaque push !

## 📝 Post-déploiement

1. Accéder à votre URL Railway
2. Créer le premier admin via l'interface
3. Tester l'ajout/suppression de règlements
4. Configurer votre domaine personnalisé (optionnel)

Votre site Codex RP sera accessible 24/7 gratuitement ! 🎉