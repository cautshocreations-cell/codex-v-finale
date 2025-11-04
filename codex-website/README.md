# Serveur Codex RP - Interface de Règlement

Une interface web moderne pour consulter et gérer les règlements du serveur de jeu de rôle Codex.

## Fonctionnalités

### Interface Utilisateur
- **Lecture du règlement** : Interface claire et moderne pour lire tous les règlements
- **Design responsive** : Compatible avec tous les appareils (mobile, tablette, desktop)
- **Navigation intuitive** : Interface simple et épurée

### Interface Administrateur
- **Authentification sécurisée** : Accès protégé par nom d'utilisateur et mot de passe
- **Gestion des règlements** : Ajouter, modifier et supprimer des règlements
- **Interface d'administration** : Outils complets pour la gestion du contenu

## Identifiants Administrateur

- **Nom d'utilisateur** : `root`
- **Mot de passe** : `VYJEve_120508`

## Installation et Démarrage

### Prérequis
- Node.js (version 14 ou supérieure)
- npm ou yarn

### Installation
```bash
# Installer les dépendances
npm install
```

### Démarrage Rapide (Mode Test)
```bash
# Démarrer le serveur de test
npm run test
```

Puis ouvrez votre navigateur à l'adresse : `http://localhost:3000`

### Démarrage Complet
```bash
# Démarrer le serveur principal
npm start
```

## Structure du Projet

```
src/
├── client/
│   ├── index.html          # Page principale
│   ├── css/
│   │   └── styles.css      # Styles CSS
│   └── js/
│       ├── app.js          # Logique principale
│       ├── regulations.js  # Gestion des règlements
│       └── admin.js        # Interface d'administration
├── server/                 # Backend (Node.js/Express)
└── data/
    └── regulations.json    # Données des règlements
```

## Utilisation

### Pour les Utilisateurs
1. Ouvrez l'interface web
2. Consultez les règlements affichés
3. Tous les règlements sont visibles d'un coup d'œil

### Pour les Administrateurs
1. Cliquez sur le bouton "Interface Admin" en haut à droite
2. Connectez-vous avec les identifiants fournis
3. Utilisez l'interface pour :
   - Ajouter de nouveaux règlements
   - Modifier les règlements existants
   - Supprimer des règlements obsolètes

## Technologies Utilisées

- **Frontend** : HTML5, CSS3, JavaScript vanilla
- **Backend** : Node.js, Express.js
- **Base de données** : JSON (évolutif vers MongoDB)
- **Design** : CSS moderne avec animations et responsive design

## Configuration

Les règlements sont stockés dans `data/regulations.json` et peuvent être modifiés directement ou via l'interface d'administration.

## Sécurité

- Authentification côté client pour l'interface d'administration
- Protection des routes sensibles
- Validation des données d'entrée

## Support

Pour toute question ou problème, consultez la documentation du code ou contactez l'administrateur système.