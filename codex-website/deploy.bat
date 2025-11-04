@echo off
echo =========================================
echo Codex RP - Deploiement simple (Windows)
echo =========================================

REM Verifier si Git est installe
git --version >nul 2>&1
if %errorlevel% neq 0 (
    echo Erreur: Git n'est pas installe
    echo Telecharge Git depuis: https://git-scm.com/
    pause
    exit /b 1
)

echo Git detecte!

REM Demander les informations
set /p githubUsername="Ton nom d'utilisateur GitHub: "
set /p repoName="Nom du repository (ex: codex-website): "

if "%githubUsername%"=="" (
    echo Erreur: Nom d'utilisateur requis
    pause
    exit /b 1
)

if "%repoName%"=="" (
    echo Erreur: Nom du repository requis
    pause
    exit /b 1
)

echo.
echo Preparation du deploiement...

REM Initialiser Git si necessaire
if not exist ".git" (
    echo Initialisation de Git...
    git init
    git branch -M main
)

REM Ajouter tous les fichiers
echo Ajout des fichiers...
git add .

REM Commit
set /p commitMsg="Message de commit (ou Entree pour defaut): "
if "%commitMsg%"=="" set commitMsg=Initial Codex RP setup

git commit -m "%commitMsg%"

REM Ajouter remote
echo Ajout du remote GitHub...
git remote remove origin >nul 2>&1
git remote add origin https://github.com/%githubUsername%/%repoName%.git

REM Push
echo Push vers GitHub...
git push -u origin main

if %errorlevel% equ 0 (
    echo.
    echo ========================================
    echo SUCCES! Code envoye sur GitHub
    echo ========================================
    echo.
    echo Prochaines etapes:
    echo 1. Va sur https://railway.app
    echo 2. Connecte ton compte GitHub
    echo 3. Clique "New Project" puis "Deploy from GitHub repo"
    echo 4. Selectionne: %githubUsername%/%repoName%
    echo 5. Ajoute PostgreSQL: "Add Service" puis "PostgreSQL"
    echo 6. Variables d'environnement:
    echo    - NODE_ENV=production
    echo    - JWT_SECRET=ton-secret-jwt-123
    echo    - SESSION_SECRET=ton-secret-session-456
    echo.
    echo Ton site sera sur: https://TON-PROJET.up.railway.app
) else (
    echo.
    echo Erreur lors du push!
    echo Verifie tes credentials GitHub ou cree le repo manuellement
)

echo.
pause