// regulations.js - Gestion des règlements côté client

const apiUrl = '/api/regulations';

// Fonction pour récupérer les règlements depuis le serveur
async function fetchRegulations() {
    try {
        const response = await fetch(apiUrl);
        if (!response.ok) {
            throw new Error('Erreur réseau lors de la récupération des règlements');
        }
        const regulations = await response.json();
        return regulations;
    } catch (error) {
        console.error('Erreur lors de la récupération des règlements:', error);
        // Retourner des données par défaut en cas d'erreur
        return getDefaultRegulations();
    }
}

// Fonction pour obtenir les règlements par défaut
function getDefaultRegulations() {
    return [
        {
            id: 1,
            title: "Respect des autres joueurs",
            description: "Tous les joueurs doivent respecter les autres joueurs, sans harcèlement ni comportement toxique."
        },
        {
            id: 2,
            title: "Règles de jeu",
            description: "Les joueurs doivent suivre les règles établies pour le jeu, y compris les règles de rôle et les scénarios."
        },
        {
            id: 3,
            title: "Pas de triche",
            description: "La triche est strictement interdite. Tout joueur surpris en train de tricher sera sanctionné."
        },
        {
            id: 4,
            title: "Utilisation des canaux de communication",
            description: "Les joueurs doivent utiliser les canaux de communication appropriés pour discuter des stratégies et des scénarios."
        }
    ];
}

// Fonction pour afficher les règlements dans l'interface admin
function displayAdminRegulations(regulations) {
    const adminRegulationList = document.getElementById('admin-regulation-list');
    if (!adminRegulationList) return;

    adminRegulationList.innerHTML = '';

    if (regulations.length === 0) {
        adminRegulationList.innerHTML = `
            <div class="empty-state">
                <p>Aucun règlement trouvé. Ajoutez votre premier règlement ci-dessus.</p>
            </div>
        `;
        return;
    }

    regulations.forEach(regulation => {
        const regulationItem = document.createElement('div');
        regulationItem.className = 'admin-regulation-item';
        
        // Obtenir le nom de la catégorie et la couleur
        const categoryInfo = getCategoryInfo(regulation.category_id || regulation.type);
        const severityLabel = getSeverityLabel(regulation.severity);
        
        regulationItem.innerHTML = `
            <div class="admin-regulation-content">
                <div class="regulation-header">
                    <span class="regulation-category" style="background: ${categoryInfo.color};">
                        ${categoryInfo.name}
                    </span>
                    <span class="regulation-severity severity-${regulation.severity || 'info'}">
                        ${severityLabel}
                    </span>
                </div>
                <h4 class="regulation-title">${regulation.title}</h4>
                <p class="regulation-description">${regulation.description}</p>
                ${regulation.penalty_description ? `
                    <div class="regulation-penalty">
                        <strong>Sanctions :</strong> ${regulation.penalty_description}
                    </div>
                ` : ''}
                ${regulation.fine_amount ? `
                    <div class="regulation-fine">
                        <strong>Amende :</strong> ${regulation.fine_amount}€
                    </div>
                ` : ''}
            </div>
            <div class="admin-regulation-actions">
                <button class="btn btn-secondary edit-btn" onclick="editRegulation('${regulation.id}')">
                    📝 Modifier
                </button>
                <button class="btn btn-danger delete-btn" onclick="deleteRegulationAdmin('${regulation.id}')">
                    🗑️ Supprimer
                </button>
            </div>
        `;
        
        adminRegulationList.appendChild(regulationItem);
    });
}

// Fonction pour afficher les règlements dans l'interface principale
function displayRegulations(regulations) {
    const regulationList = document.getElementById('regulation-list');
    if (!regulationList) return;

    regulationList.innerHTML = '';

    // Grouper les règlements par type (si available)
    const groupedRegulations = groupRegulationsByType(regulations);

    Object.keys(groupedRegulations).forEach(type => {
        const typeData = groupedRegulations[type];
        
        // Créer l'en-tête du type
        const typeHeader = document.createElement('div');
        typeHeader.className = 'regulation-type';
        
        // Ajouter la couleur de la catégorie si disponible
        if (typeData.color) {
            typeHeader.style.background = `linear-gradient(135deg, ${typeData.color}, ${adjustColorBrightness(typeData.color, -20)})`;
        }
        
        typeHeader.innerHTML = `
            <h2>${type}</h2>
            <p class="regulation-type-description">${typeData.description || 'Règles essentielles à respecter'}</p>
        `;
        regulationList.appendChild(typeHeader);

        // Ajouter les règlements de ce type
        typeData.regulations.forEach((regulation, index) => {
            const regulationItem = document.createElement('div');
            regulationItem.className = 'regulation-item';
            
            // Ajouter une classe pour la gravité
            if (regulation.severity) {
                regulationItem.classList.add(`severity-${regulation.severity}`);
            }
            
            // Icône de gravité
            const severityIcon = getSeverityIcon(regulation.severity);
            
            regulationItem.innerHTML = `
                <div class="regulation-number">${index + 1}</div>
                <div class="regulation-content">
                    <h4 class="regulation-title">
                        ${severityIcon} ${regulation.title}
                    </h4>
                    <p class="regulation-description">${regulation.description}</p>
                    ${regulation.penalty_description ? `
                        <div class="regulation-penalty">
                            <strong>Sanctions :</strong> ${regulation.penalty_description}
                        </div>
                    ` : ''}
                </div>
            `;
            
            regulationList.appendChild(regulationItem);
        });
    });
}

// Fonction pour grouper les règlements par type
function groupRegulationsByType(regulations) {
    const grouped = {};
    
    regulations.forEach(regulation => {
        const type = regulation.type || 'Règles Générales';
        if (!grouped[type]) {
            grouped[type] = {
                regulations: [],
                description: getTypeDescription(type),
                color: getTypeColor(type)
            };
        }
        grouped[type].regulations.push(regulation);
    });
    
    // Trier les règlements dans chaque type par sort_order
    Object.keys(grouped).forEach(type => {
        grouped[type].regulations.sort((a, b) => {
            return (a.sort_order || 0) - (b.sort_order || 0);
        });
    });
    
    return grouped;
}

// Obtenir la description d'un type
function getTypeDescription(type) {
    const descriptions = {
        'Règles Générales': 'Règles de base du serveur applicables à tous',
        'Roleplay': 'Règles spécifiques au jeu de rôle',
        'Communication': 'Règles de communication et comportement',
        'Sanctions': 'Système de sanctions et procédures',
        'Économie RP': 'Règles économiques et commerciales'
    };
    return descriptions[type] || 'Règles importantes du serveur';
}

// Obtenir la couleur d'un type
function getTypeColor(type) {
    const colors = {
        'Règles Générales': '#3B82F6',
        'Roleplay': '#8B5CF6',
        'Communication': '#10B981',
        'Sanctions': '#F59E0B',
        'Économie RP': '#06B6D4'
    };
    return colors[type] || '#3B82F6';
}

// Obtenir l'icône de gravité
function getSeverityIcon(severity) {
    const icons = {
        'critical': '❌',
        'major': '🚨',
        'warning': '⚠️',
        'info': '📋'
    };
    return icons[severity] || '📋';
}

// Obtenir le label de sévérité
function getSeverityLabel(severity) {
    const labels = {
        'critical': 'Critique',
        'major': 'Majeure',
        'warning': 'Avertissement',
        'info': 'Information'
    };
    return labels[severity] || 'Information';
}

// Obtenir les informations d'une catégorie
function getCategoryInfo(categoryIdOrType) {
    // Correspondance par ID de catégorie
    const categoriesById = {
        '660e8400-e29b-41d4-a716-446655440000': { name: 'Règles Générales', color: '#3B82F6' },
        '660e8400-e29b-41d4-a716-446655440001': { name: 'Roleplay', color: '#8B5CF6' },
        '660e8400-e29b-41d4-a716-446655440002': { name: 'Communication', color: '#10B981' },
        '660e8400-e29b-41d4-a716-446655440003': { name: 'Sanctions', color: '#F59E0B' },
        '660e8400-e29b-41d4-a716-446655440004': { name: 'Économie RP', color: '#06B6D4' }
    };

    // Correspondance par nom de type
    const categoriesByType = {
        'Règles Générales': { name: 'Règles Générales', color: '#3B82F6' },
        'Roleplay': { name: 'Roleplay', color: '#8B5CF6' },
        'Communication': { name: 'Communication', color: '#10B981' },
        'Sanctions': { name: 'Sanctions', color: '#F59E0B' },
        'Économie RP': { name: 'Économie RP', color: '#06B6D4' }
    };

    return categoriesById[categoryIdOrType] || 
           categoriesByType[categoryIdOrType] || 
           { name: 'Règles Générales', color: '#3B82F6' };
}

// Ajuster la luminosité d'une couleur
function adjustColorBrightness(color, amount) {
    const usePound = color[0] === '#';
    const col = usePound ? color.slice(1) : color;
    const num = parseInt(col, 16);
    let r = (num >> 16) + amount;
    let g = (num >> 8 & 0x00FF) + amount;
    let b = (num & 0x0000FF) + amount;
    r = r > 255 ? 255 : r < 0 ? 0 : r;
    g = g > 255 ? 255 : g < 0 ? 0 : g;
    b = b > 255 ? 255 : b < 0 ? 0 : b;
    return (usePound ? '#' : '') + (r << 16 | g << 8 | b).toString(16).padStart(6, '0');
}

// Fonction pour ajouter un nouveau règlement
async function addRegulation(regulation) {
    try {
        const response = await fetch(apiUrl, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify(regulation),
        });
        
        if (!response.ok) {
            throw new Error('Erreur lors de l\'ajout du règlement');
        }
        
        const newRegulation = await response.json();
        console.log('Règlement ajouté avec succès:', newRegulation);
        
        // Rafraîchir les listes
        refreshRegulations();
        
        return newRegulation;
    } catch (error) {
        console.error('Erreur lors de l\'ajout du règlement:', error);
        alert('Erreur lors de l\'ajout du règlement');
    }
}

// Fonction pour modifier un règlement
async function updateRegulation(id, regulation) {
    try {
        const response = await fetch(`${apiUrl}/${id}`, {
            method: 'PUT',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify(regulation),
        });
        
        if (!response.ok) {
            throw new Error('Erreur lors de la modification du règlement');
        }
        
        const updatedRegulation = await response.json();
        console.log('Règlement modifié avec succès:', updatedRegulation);
        
        // Rafraîchir les listes
        refreshRegulations();
        
        return updatedRegulation;
    } catch (error) {
        console.error('Erreur lors de la modification du règlement:', error);
        alert('Erreur lors de la modification du règlement');
    }
}

// Fonction pour supprimer un règlement
async function deleteRegulation(id) {
    if (!confirm('Êtes-vous sûr de vouloir supprimer ce règlement ?')) {
        return;
    }
    
    try {
        const response = await fetch(`${apiUrl}/${id}`, {
            method: 'DELETE',
        });
        
        if (!response.ok) {
            throw new Error('Erreur lors de la suppression du règlement');
        }
        
        console.log('Règlement supprimé avec succès');
        
        // Rafraîchir les listes
        refreshRegulations();
    } catch (error) {
        console.error('Erreur lors de la suppression du règlement:', error);
        alert('Erreur lors de la suppression du règlement');
    }
}

// Fonction pour éditer un règlement
function editRegulation(id) {
    // Cette fonction sera implémentée pour ouvrir un formulaire d'édition
    console.log('Édition du règlement ID:', id);
    alert('Fonction d\'édition à implémenter');
}

// Fonction pour rafraîchir toutes les listes de règlements
async function refreshRegulations() {
    const regulations = await fetchRegulations();
    
    // Mettre à jour l'affichage principal
    if (typeof displayRegulations === 'function') {
        displayRegulations(regulations);
    }
    
    // Mettre à jour l'affichage admin si visible
    const adminInterface = document.getElementById('admin-interface');
    if (adminInterface && !adminInterface.classList.contains('hidden')) {
        displayAdminRegulations(regulations);
    }
}