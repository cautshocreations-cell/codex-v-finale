# 🎮 Codex RP - Hébergement gratuit

## 🚀 Déploiement automatique avec Railway (Recommandé)

### ⚡ Déploiement en 5 minutes

1. **Compte Railway**
   - Aller sur [railway.app](https://railway.app)
   - S'inscrire avec GitHub

2. **Push sur GitHub**
   ```bash
   git init
   git add .
   git commit -m "Initial Codex RP setup"
   git branch -M main
   git remote add origin https://github.com/TON-USERNAME/codex-website.git
   git push -u origin main
   ```

3. **Nouveau projet Railway**
   - "New Project" → "Deploy from GitHub repo"
   - Sélectionner ton repository
   - Railway détecte automatiquement Node.js

4. **Ajouter PostgreSQL**
   - "Add Service" → "Database" → "PostgreSQL"
   - DATABASE_URL créé automatiquement

5. **Variables d'environnement**
   ```
   NODE_ENV=production
   JWT_SECRET=ton-secret-jwt-super-securise
   SESSION_SECRET=ton-secret-session-securise
   DEFAULT_ADMIN_PASSWORD=MotDePasseAdmin123!
   ```

6. **Déployer**
   - Push automatique = déploiement automatique!
   - Ton site sera sur : `https://ton-projet.up.railway.app`

## 🌐 Autres options gratuites

### Render.com
- PostgreSQL gratuit inclus
- Domaine : `*.onrender.com`
- Se met en veille après 15 min d'inactivité

### Vercel (Frontend seulement)
- Parfait si tu veux juste le frontend
- Domaine : `*.vercel.app`
- Pas de backend Node.js complet

### Netlify (Frontend seulement)  
- Pour sites statiques
- Domaine : `*.netlify.app`
- Fonctions serverless limitées

## 🔧 Configuration post-déploiement

1. **Accéder à ton site**
   - URL fournie par Railway/Render
   - Exemple : `https://codex-rp.up.railway.app`

2. **Premier admin**
   - Aller sur `/admin`
   - Utiliser le mot de passe défini dans `DEFAULT_ADMIN_PASSWORD`

3. **Tester les fonctionnalités**
   - Ajouter des règlements
   - Modifier/Supprimer
   - Tester les catégories

## 💡 Conseils

- **Railway** : Meilleur pour fullstack avec DB
- **Vercel** : Meilleur pour frontend uniquement  
- **Render** : Alternative solide mais plus lent
- Tous offrent des domaines HTTPS gratuits
- Tous supportent les domaines personnalisés

## 🎯 URL finale

Ton site Codex RP sera accessible à :
- `https://ton-projet.up.railway.app` (Railway)
- `https://ton-projet.onrender.com` (Render)  
- `https://ton-projet.vercel.app` (Vercel)

**24/7, gratuit, avec SSL automatique !** 🎉