# Script de deploiement Codex RP pour Windows
# Utilise PowerShell pour configurer et deployer

Write-Host "Codex RP - Script de deploiement" -ForegroundColor Cyan
Write-Host "=================================" -ForegroundColor Cyan

# Verifier si Git est installe
try {
    git --version | Out-Null
    Write-Host "Git detecte" -ForegroundColor Green
} catch {
    Write-Host "Git n'est pas installe. Telecharge Git depuis: https://git-scm.com/" -ForegroundColor Red
    Read-Host "Appuie sur Entree pour fermer"
    exit 1
}

# Demander les informations GitHub
$githubUsername = Read-Host "Ton nom d'utilisateur GitHub"
$repoName = Read-Host "Nom du repository (ex: codex-website)"

if ([string]::IsNullOrEmpty($githubUsername) -or [string]::IsNullOrEmpty($repoName)) {
    Write-Host "Nom d'utilisateur et repository requis" -ForegroundColor Red
    Read-Host "Appuie sur Entree pour fermer"
    exit 1
}

# Initialiser Git si pas deja fait
if (!(Test-Path ".git")) {
    Write-Host "Initialisation du repository Git..." -ForegroundColor Yellow
    git init
    git branch -M main
}

# Ajouter tous les fichiers
Write-Host "Ajout des fichiers..." -ForegroundColor Yellow
git add .

# Commit
$commitMessage = Read-Host "Message de commit (ou appuie sur Entree pour 'Initial Codex RP setup')"
if ([string]::IsNullOrEmpty($commitMessage)) {
    $commitMessage = "Initial Codex RP setup"
}

git commit -m $commitMessage

# Ajouter remote origin si pas deja fait
$remoteUrl = "https://github.com/$githubUsername/$repoName.git"

try {
    $existingRemote = git remote get-url origin 2>$null
    Write-Host "Remote deja configure: $existingRemote" -ForegroundColor Green
} catch {
    Write-Host "Ajout du remote GitHub..." -ForegroundColor Yellow
    git remote add origin $remoteUrl
}

# Push vers GitHub
Write-Host "Push vers GitHub..." -ForegroundColor Yellow
git push -u origin main

if ($LASTEXITCODE -eq 0) {
    Write-Host "Code envoye sur GitHub avec succes!" -ForegroundColor Green
    Write-Host ""
    Write-Host "Prochaines etapes:" -ForegroundColor Cyan
    Write-Host "1. Va sur https://railway.app" -ForegroundColor White
    Write-Host "2. Connecte ton compte GitHub" -ForegroundColor White
    Write-Host "3. Clique 'New Project' -> 'Deploy from GitHub repo'" -ForegroundColor White
    Write-Host "4. Selectionne ton repository: $githubUsername/$repoName" -ForegroundColor White
    Write-Host "5. Ajoute une base PostgreSQL: 'Add Service' -> 'PostgreSQL'" -ForegroundColor White
    Write-Host "6. Configure les variables d'environnement:" -ForegroundColor White
    Write-Host "   - NODE_ENV=production" -ForegroundColor Gray
    Write-Host "   - JWT_SECRET=ton-secret-jwt" -ForegroundColor Gray
    Write-Host "   - SESSION_SECRET=ton-secret-session" -ForegroundColor Gray
    Write-Host ""
    Write-Host "Ton site sera disponible sur: https://TON-PROJET.up.railway.app" -ForegroundColor Green
} else {
    Write-Host "Erreur lors du push. Verifie tes credentials GitHub." -ForegroundColor Red
    Write-Host "Tu peux creer le repository manuellement sur GitHub.com" -ForegroundColor Yellow
}

Write-Host ""
Write-Host "Consulte HOSTING.md pour plus de details" -ForegroundColor Cyan
Read-Host "Appuie sur Entree pour fermer"