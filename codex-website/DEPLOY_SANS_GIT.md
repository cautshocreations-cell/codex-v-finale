# Instructions de deploiement SANS Git
# ======================================

## Methode 1: Upload direct sur GitHub

1. Va sur https://github.com
2. Connecte-toi à ton compte
3. Clique "New repository" (bouton vert)
4. Nom du repository: "codex-website"
5. Description: "Site web Codex RP avec gestion des reglements"
6. Choisis Public ou Private
7. COCHE "Add a README file"
8. Clique "Create repository"

9. Dans ton nouveau repo:
   - Clique "Add file" → "Upload files"
   - Glisse tous les fichiers de ton dossier codex-website
   - OU utilise "choose your files" pour selectionner
   
10. Message de commit: "Initial Codex RP setup"
11. Clique "Commit changes"

## Methode 2: GitHub Desktop (Recommande)

1. Telecharge GitHub Desktop: https://desktop.github.com/
2. Installe et connecte ton compte GitHub
3. Clique "Create a New Repository on your hard drive"
4. Name: codex-website
5. Local path: choisis ton dossier
6. Clique "Create repository"
7. "Publish repository" → Choisis public/private
8. Ton code sera automatiquement uploade!

## Apres upload sur GitHub:

1. Va sur https://railway.app
2. "Sign up with GitHub"
3. "New Project"
4. "Deploy from GitHub repo"
5. Selectionne "ton-username/codex-website"
6. Railway detecte Node.js automatiquement

7. Ajoute PostgreSQL:
   - "Add Service" → "Database" → "PostgreSQL"
   - DATABASE_URL sera cree automatiquement

8. Variables d'environnement (onglet "Variables"):
   NODE_ENV=production
   JWT_SECRET=ton-secret-jwt-super-securise-123
   SESSION_SECRET=ton-secret-session-super-securise-456
   DEFAULT_ADMIN_PASSWORD=MotDePasseAdmin123!

9. Deploy automatique!
   Ton site sera sur: https://TON-PROJET.up.railway.app

## Alternative: Vercel (Frontend seulement)

Si tu veux juste le frontend:
1. Va sur https://vercel.com
2. "Sign up with GitHub"
3. "New Project"
4. Selectionne ton repo
5. Deploy automatique!

Note: Vercel ne supporte pas les backends complets,
mais parfait pour tester l'interface utilisateur.

## En cas de probleme:

- Assure-toi que package.json est à la racine
- Verifie que les variables d'environnement sont definies
- Railway logs: onglet "Deployments" → clique sur ton deploy

Ton site Codex RP sera en ligne en 10 minutes! 🚀