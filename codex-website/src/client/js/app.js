// src/client/js/app.js

// Identifiants admin
const ADMIN_CREDENTIALS = {
    username: 'root',
    password: 'VYJEve_120508'
};

let isAdminLoggedIn = false;

document.addEventListener('DOMContentLoaded', () => {
    console.log('Serveur Codex RP - Client Initialisé');
    initializeApp();
});

function initializeApp() {
    loadRegulations();
    setupEventListeners();
}

function setupEventListeners() {
    // Bouton Interface Admin
    const adminBtn = document.getElementById('admin-btn');
    if (adminBtn) {
        adminBtn.addEventListener('click', showAdminLogin);
    }

    // Bouton de connexion
    const loginBtn = document.getElementById('login-btn');
    if (loginBtn) {
        loginBtn.addEventListener('click', handleLogin);
    }

    // Bouton d'annulation
    const cancelBtn = document.getElementById('cancel-btn');
    if (cancelBtn) {
        cancelBtn.addEventListener('click', hideAdminSection);
    }

    // Bouton de déconnexion
    const logoutBtn = document.getElementById('logout-btn');
    if (logoutBtn) {
        logoutBtn.addEventListener('click', handleLogout);
    }

    // Bouton de gestion des types
    const manageTypesBtn = document.getElementById('manage-types-btn');
    if (manageTypesBtn) {
        manageTypesBtn.addEventListener('click', toggleTypeManagement);
    }

    // Gestion de la touche Entrée dans les champs de connexion
    const usernameInput = document.getElementById('username');
    const passwordInput = document.getElementById('password');
    
    if (usernameInput && passwordInput) {
        usernameInput.addEventListener('keypress', (e) => {
            if (e.key === 'Enter') {
                passwordInput.focus();
            }
        });
        
        passwordInput.addEventListener('keypress', (e) => {
            if (e.key === 'Enter') {
                handleLogin();
            }
        });
    }
}

function loadRegulations() {
    fetch('/data/regulations.json')
        .then(response => response.json())
        .then(data => {
            // Stocker les données globalement
            window.regulationsData = data;
            
            if (data.regulations && data.types) {
                displayRegulationsByType(data.regulations, data.types);
            } else {
                // Format ancien, convertir
                displayRegulations(data);
            }
        })
        .catch(error => {
            console.error('Erreur lors du chargement des règlements:', error);
            // Utiliser les données statiques en cas d'erreur
            const staticData = getStaticData();
            window.regulationsData = staticData;
            displayRegulationsByType(staticData.regulations, staticData.types);
        });
}

function getStaticData() {
    return {
        types: [
            {
                id: 1,
                name: "Règles Générales",
                description: "Règles de base pour tous les joueurs du serveur"
            },
            {
                id: 2,
                name: "Règles de Roleplay", 
                description: "Règles spécifiques au jeu de rôle et aux interactions"
            },
            {
                id: 3,
                name: "Règles Techniques",
                description: "Règles concernant l'utilisation des systèmes et outils"
            }
        ],
        regulations: [
            {
                id: 1,
                title: "Respect des autres joueurs",
                description: "Tous les joueurs doivent respecter les autres joueurs, sans harcèlement ni comportement toxique.",
                type_id: 1
            },
            {
                id: 2,
                title: "Règles de jeu de rôle",
                description: "Les joueurs doivent suivre les règles établies pour le jeu, y compris les règles de rôle et les scénarios.",
                type_id: 2
            },
            {
                id: 3,
                title: "Interdiction de triche",
                description: "La triche est strictement interdite. Tout joueur surpris en train de tricher sera sanctionné.",
                type_id: 1
            },
            {
                id: 4,
                title: "Utilisation des canaux de communication",
                description: "Les joueurs doivent utiliser les canaux de communication appropriés pour discuter des stratégies et des scénarios.",
                type_id: 3
            }
        ]
    };
}

function displayRegulationsByType(regulations, types) {
    const regulationList = document.getElementById('regulation-list');
    if (!regulationList) return;

    regulationList.innerHTML = '';

    // Grouper les règlements par type
    types.forEach(type => {
        const typeRegulations = regulations.filter(reg => reg.type_id === type.id);
        
        if (typeRegulations.length > 0) {
            // Créer la section du type
            const typeSection = document.createElement('div');
            typeSection.className = 'regulation-type';
            typeSection.innerHTML = `
                <h2>${type.name}</h2>
                <p class="regulation-type-description">${type.description}</p>
            `;
            regulationList.appendChild(typeSection);
            
            // Ajouter les règlements de ce type
            typeRegulations.forEach((regulation, index) => {
                const regulationElement = document.createElement('div');
                regulationElement.className = 'regulation-item';
                
                regulationElement.innerHTML = `
                    <div class="regulation-number">${index + 1}</div>
                    <div class="regulation-content">
                        <h3 class="regulation-title">${regulation.title}</h3>
                        <p class="regulation-description">${regulation.description}</p>
                    </div>
                `;
                
                regulationList.appendChild(regulationElement);
            });
        }
    });
}

// Fonction de compatibilité pour l'ancien format
function displayRegulations(regulations) {
    if (!Array.isArray(regulations)) return;
    
    const regulationList = document.getElementById('regulation-list');
    if (!regulationList) return;

    regulationList.innerHTML = '';

    regulations.forEach((regulation, index) => {
        const regulationElement = document.createElement('div');
        regulationElement.className = 'regulation-item';
        
        regulationElement.innerHTML = `
            <div class="regulation-number">${index + 1}</div>
            <div class="regulation-content">
                <h3 class="regulation-title">${regulation.title}</h3>
                <p class="regulation-description">${regulation.description}</p>
            </div>
        `;
        
        regulationList.appendChild(regulationElement);
    });
}

function showAdminLogin() {
    const adminSection = document.getElementById('admin-section');
    const regulationsDisplay = document.getElementById('regulations-display');
    
    if (adminSection && regulationsDisplay) {
        regulationsDisplay.classList.add('hidden');
        adminSection.classList.remove('hidden');
        
        // Focus sur le champ username
        const usernameInput = document.getElementById('username');
        if (usernameInput) {
            usernameInput.focus();
        }
    }
}

function hideAdminSection() {
    const adminSection = document.getElementById('admin-section');
    const regulationsDisplay = document.getElementById('regulations-display');
    const loginMessage = document.getElementById('login-message');
    
    if (adminSection && regulationsDisplay) {
        adminSection.classList.add('hidden');
        regulationsDisplay.classList.remove('hidden');
        
        // Nettoyer les champs
        clearLoginForm();
        if (loginMessage) {
            loginMessage.innerHTML = '';
        }
    }
}

function handleLogin() {
    const username = document.getElementById('username').value;
    const password = document.getElementById('password').value;
    const loginMessage = document.getElementById('login-message');
    
    if (username === ADMIN_CREDENTIALS.username && password === ADMIN_CREDENTIALS.password) {
        isAdminLoggedIn = true;
        showMessage('Connexion réussie !', 'success');
        
        setTimeout(() => {
            showAdminInterface();
        }, 1000);
    } else {
        showMessage('Nom d\'utilisateur ou mot de passe incorrect.', 'error');
        clearLoginForm();
    }
}

function handleLogout() {
    isAdminLoggedIn = false;
    hideAdminSection();
}

function showAdminInterface() {
    const adminLogin = document.querySelector('.admin-login');
    const adminInterface = document.getElementById('admin-interface');
    
    if (adminLogin && adminInterface) {
        adminLogin.classList.add('hidden');
        adminInterface.classList.remove('hidden');
        
        // Charger l'interface d'administration
        if (typeof initializeAdminInterface === 'function') {
            initializeAdminInterface();
        } else {
            // Fallback si la fonction n'est pas disponible
            loadAdminRegulationsManual();
        }
    }
}

function showMessage(message, type) {
    const loginMessage = document.getElementById('login-message');
    if (loginMessage) {
        loginMessage.innerHTML = message;
        loginMessage.className = `message ${type}`;
    }
}

function clearLoginForm() {
    const usernameInput = document.getElementById('username');
    const passwordInput = document.getElementById('password');
    
    if (usernameInput) usernameInput.value = '';
    if (passwordInput) passwordInput.value = '';
}

async function loadAdminRegulationsManual() {
    try {
        const regulations = await fetchRegulations();
        displayAdminRegulations(regulations);
        createBasicRegulationForm();
    } catch (error) {
        console.error('Erreur lors du chargement des règlements admin:', error);
    }
}

function createBasicRegulationForm() {
    const regulationForm = document.getElementById('regulation-form');
    if (!regulationForm) return;

    regulationForm.innerHTML = `
        <h3>Ajouter un nouveau règlement</h3>
        <form id="regulation-admin-form">
            <input type="text" id="regulation-title" placeholder="Titre du règlement" required>
            <textarea id="regulation-description" placeholder="Description du règlement" required></textarea>
            <button type="submit">Ajouter le règlement</button>
        </form>
    `;

    const form = document.getElementById('regulation-admin-form');
    if (form) {
        form.addEventListener('submit', async (event) => {
            event.preventDefault();
            
            const title = document.getElementById('regulation-title').value.trim();
            const description = document.getElementById('regulation-description').value.trim();
            
            if (!title || !description) {
                alert('Veuillez remplir tous les champs');
                return;
            }

            const regulation = { title, description };
            
            try {
                // Simuler l'ajout pour la démo
                console.log('Ajout du règlement:', regulation);
                alert('Règlement ajouté avec succès (mode démo)');
                // Vider le formulaire
                document.getElementById('regulation-title').value = '';
                document.getElementById('regulation-description').value = '';
                // Recharger les règlements
                loadRegulations();
            } catch (error) {
                console.error('Erreur lors de l\'ajout:', error);
            }
        });
    }
}

// Fonctions pour la gestion des types de règlements
function toggleTypeManagement() {
    const typeForm = document.getElementById('type-form');
    const typeList = document.getElementById('admin-type-list');
    
    if (typeForm && typeList) {
        const isHidden = typeForm.classList.contains('hidden');
        
        if (isHidden) {
            typeForm.classList.remove('hidden');
            typeList.classList.remove('hidden');
            loadTypeManagement();
        } else {
            typeForm.classList.add('hidden');
            typeList.classList.add('hidden');
        }
    }
}

function loadTypeManagement() {
    createTypeForm();
    displayAdminTypes();
}

function createTypeForm() {
    const typeForm = document.getElementById('type-admin-form');
    if (!typeForm) return;

    typeForm.addEventListener('submit', handleTypeSubmit);
    
    const cancelBtn = document.getElementById('type-cancel-btn');
    if (cancelBtn) {
        cancelBtn.addEventListener('click', cancelTypeEdit);
    }
}

function handleTypeSubmit(event) {
    event.preventDefault();
    
    const name = document.getElementById('type-name').value.trim();
    const description = document.getElementById('type-description').value.trim();
    
    if (!name) {
        alert('Veuillez saisir un nom pour le type');
        return;
    }

    const type = { name, description };
    
    console.log('Ajout/modification du type:', type);
    alert('Type de règlement ajouté avec succès (mode démo)');
    
    // Vider le formulaire
    document.getElementById('type-name').value = '';
    document.getElementById('type-description').value = '';
    
    // Recharger l'affichage
    displayAdminTypes();
}

function displayAdminTypes() {
    const typeList = document.getElementById('admin-type-list');
    if (!typeList || !window.regulationsData?.types) return;

    typeList.innerHTML = '';

    window.regulationsData.types.forEach(type => {
        const typeItem = document.createElement('div');
        typeItem.className = 'admin-regulation-item';
        
        typeItem.innerHTML = `
            <div class="admin-regulation-content">
                <h4>${type.name}</h4>
                <p>${type.description || 'Aucune description'}</p>
            </div>
            <div class="admin-regulation-actions">
                <button class="edit-btn" onclick="editType(${type.id})">Modifier</button>
                <button class="delete-btn" onclick="deleteType(${type.id})">Supprimer</button>
            </div>
        `;
        
        typeList.appendChild(typeItem);
    });
}

function editType(id) {
    console.log('Édition du type ID:', id);
    alert('Fonction d\'édition des types à implémenter');
}

function deleteType(id) {
    if (confirm('Êtes-vous sûr de vouloir supprimer ce type de règlement ?')) {
        console.log('Suppression du type ID:', id);
        alert('Type supprimé avec succès (mode démo)');
        displayAdminTypes();
    }
}

function cancelTypeEdit() {
    document.getElementById('type-name').value = '';
    document.getElementById('type-description').value = '';
    document.getElementById('type-form-title').textContent = 'Ajouter un nouveau type';
    document.getElementById('type-submit-btn').textContent = 'Ajouter le type';
    document.getElementById('type-cancel-btn').classList.add('hidden');
}

// Rendre les fonctions disponibles globalement
window.editType = editType;
window.deleteType = deleteType;