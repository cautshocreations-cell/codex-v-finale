#!/bin/bash

echo "🚀 Démarrage de Codex RP Server..."

# Vérifier les variables d'environnement essentielles
if [ -z "$DATABASE_URL" ]; then
    echo "❌ DATABASE_URL non définie"
    echo "ℹ️  Railway/Render/Heroku fourniront automatiquement cette variable"
fi

if [ -z "$JWT_SECRET" ]; then
    echo "⚠️  JWT_SECRET non définie, utilisation d'une valeur par défaut (NON SÉCURISÉ en production)"
    export JWT_SECRET="default-jwt-secret-change-me"
fi

if [ -z "$SESSION_SECRET" ]; then
    echo "⚠️  SESSION_SECRET non définie, utilisation d'une valeur par défaut (NON SÉCURISÉ en production)"
    export SESSION_SECRET="default-session-secret-change-me"
fi

# Définir NODE_ENV si pas défini
if [ -z "$NODE_ENV" ]; then
    export NODE_ENV="production"
fi

echo "✅ Configuration:"
echo "   NODE_ENV: $NODE_ENV"
echo "   PORT: ${PORT:-3000}"
echo "   DATABASE_URL: ${DATABASE_URL:+✅ Définie}"

# Démarrer l'application
echo "🎮 Lancement de Codex RP..."
exec node src/server/app.js