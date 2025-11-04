// admin.js - Gestion de l'interface d'administration

let currentEditingId = null;
let categories = [];

// Fonction appelée depuis app.js pour charger l'interface admin
async function loadAdminInterface() {
    await loadCategories();
    createRegulationForm();
    loadAdminRegulations();
}

// Charger les catégories de règlements
async function loadCategories() {
    try {
        // Essayer de charger depuis l'API (pour future implémentation)
        // const response = await fetch('/api/categories');
        // if (response.ok) {
        //     categories = await response.json();
        //     return;
        // }
        
        // Pour l'instant, utiliser des catégories par défaut
        categories = [
            { 
                id: '660e8400-e29b-41d4-a716-446655440000', 
                name: 'Règles Générales', 
                color: '#3B82F6',
                description: 'Règles de base du serveur applicables à tous',
                icon: 'shield'
            },
            { 
                id: '660e8400-e29b-41d4-a716-446655440001', 
                name: 'Roleplay', 
                color: '#8B5CF6',
                description: 'Règles spécifiques au jeu de rôle',
                icon: 'theater-masks'
            },
            { 
                id: '660e8400-e29b-41d4-a716-446655440002', 
                name: 'Communication', 
                color: '#10B981',
                description: 'Règles de communication et comportement',
                icon: 'message-circle'
            },
            { 
                id: '660e8400-e29b-41d4-a716-446655440003', 
                name: 'Sanctions', 
                color: '#F59E0B',
                description: 'Système de sanctions et procédures',
                icon: 'alert-triangle'
            },
            { 
                id: '660e8400-e29b-41d4-a716-446655440004', 
                name: 'Économie RP', 
                color: '#06B6D4',
                description: 'Règles économiques et commerciales',
                icon: 'coins'
            }
        ];
        
        console.log('✅ Catégories chargées:', categories.length);
    } catch (error) {
        console.error('Erreur lors du chargement des catégories:', error);
        // Fallback vers une catégorie par défaut
        categories = [{ 
            id: 'default', 
            name: 'Règles Générales', 
            color: '#3B82F6',
            description: 'Règles générales du serveur',
            icon: 'shield'
        }];
    }
}

// Fonction pour récupérer une catégorie par ID
function getCategoryById(id) {
    return categories.find(cat => cat.id === id) || categories[0];
}

// Fonction pour ajouter une nouvelle catégorie (pour future implémentation)
async function addCategory(categoryData) {
    try {
        // API call à implémenter plus tard
        // const response = await fetch('/api/categories', {
        //     method: 'POST',
        //     headers: { 'Content-Type': 'application/json' },
        //     body: JSON.stringify(categoryData)
        // });
        // return await response.json();
        
        // Pour l'instant, ajouter localement
        const newCategory = {
            id: 'cat_' + Date.now(),
            ...categoryData
        };
        categories.push(newCategory);
        
        // Recréer le formulaire pour inclure la nouvelle catégorie
        createRegulationForm();
        
        return newCategory;
    } catch (error) {
        console.error('Erreur lors de l\'ajout de catégorie:', error);
        throw error;
    }
}

// Créer le formulaire d'ajout/modification de règlement
function createRegulationForm() {
    const regulationForm = document.getElementById('regulation-form');
    if (!regulationForm) return;

    // Générer les options de catégories
    const categoryOptions = categories.map(cat => 
        `<option value="${cat.id}" style="color: ${cat.color}">${cat.name}</option>`
    ).join('');

    // Générer les options de gravité
    const severityOptions = `
        <option value="info">📋 Information</option>
        <option value="warning">⚠️ Avertissement</option>
        <option value="major">🚨 Majeur</option>
        <option value="critical">❌ Critique</option>
    `;

    regulationForm.innerHTML = `
        <h3 id="form-title">Ajouter un nouveau règlement</h3>
        <form id="regulation-admin-form">
            <div class="form-row">
                <div class="form-group">
                    <label for="regulation-category">Catégorie *</label>
                    <select id="regulation-category" required>
                        <option value="">Sélectionner une catégorie</option>
                        ${categoryOptions}
                    </select>
                </div>
                <div class="form-group">
                    <label for="regulation-severity">Gravité *</label>
                    <select id="regulation-severity" required>
                        ${severityOptions}
                    </select>
                </div>
            </div>
            <div class="form-group">
                <label for="regulation-title">Titre du règlement *</label>
                <input type="text" id="regulation-title" placeholder="Ex: Respect mutuel obligatoire" required>
            </div>
            <div class="form-group">
                <label for="regulation-description">Description détaillée *</label>
                <textarea id="regulation-description" 
                         placeholder="Décrivez précisément le règlement et son application..." 
                         required rows="4"></textarea>
            </div>
            <div class="form-group">
                <label for="regulation-penalty">Sanctions prévues</label>
                <textarea id="regulation-penalty" 
                         placeholder="Ex: Avertissement → Exclusion temporaire → Bannissement définitif" 
                         rows="2"></textarea>
            </div>
            <div class="form-row">
                <div class="form-group">
                    <label for="regulation-order">Ordre d'affichage</label>
                    <input type="number" id="regulation-order" placeholder="0" min="0" value="0">
                </div>
                <div class="form-group">
                    <label for="regulation-effective-date">Date d'effet</label>
                    <input type="date" id="regulation-effective-date" value="${new Date().toISOString().split('T')[0]}">
                </div>
            </div>
            <div class="form-actions">
                <button type="submit" id="submit-btn">Ajouter le règlement</button>
                <button type="button" id="preview-btn" class="preview-btn">Aperçu</button>
                <button type="button" id="cancel-edit-btn" class="cancel-btn hidden">Annuler</button>
            </div>
        </form>
        <div id="regulation-preview" class="regulation-preview hidden"></div>
    `;

    // Ajouter les gestionnaires d'événements
    const form = document.getElementById('regulation-admin-form');
    const cancelBtn = document.getElementById('cancel-edit-btn');
    const previewBtn = document.getElementById('preview-btn');
    const categorySelect = document.getElementById('regulation-category');

    if (form) {
        form.addEventListener('submit', handleFormSubmit);
    }

    if (cancelBtn) {
        cancelBtn.addEventListener('click', cancelEdit);
    }

    if (previewBtn) {
        previewBtn.addEventListener('click', showPreview);
    }

    // Changer la couleur du select selon la catégorie choisie
    if (categorySelect) {
        categorySelect.addEventListener('change', function() {
            const selectedCategory = categories.find(cat => cat.id === this.value);
            if (selectedCategory) {
                this.style.borderColor = selectedCategory.color;
                this.style.boxShadow = `0 0 0 2px ${selectedCategory.color}20`;
            } else {
                this.style.borderColor = '';
                this.style.boxShadow = '';
            }
        });
    }
}

// Gérer la soumission du formulaire
async function handleFormSubmit(event) {
    event.preventDefault();
    
    const categoryId = document.getElementById('regulation-category').value;
    const title = document.getElementById('regulation-title').value.trim();
    const description = document.getElementById('regulation-description').value.trim();
    const severity = document.getElementById('regulation-severity').value;
    const penalty = document.getElementById('regulation-penalty').value.trim();
    const sortOrder = parseInt(document.getElementById('regulation-order').value) || 0;
    const effectiveDate = document.getElementById('regulation-effective-date').value;
    
    if (!categoryId || !title || !description || !severity) {
        alert('Veuillez remplir tous les champs obligatoires (*)');
        return;
    }

    const regulation = { 
        category_id: categoryId,
        title, 
        description,
        severity,
        penalty_description: penalty || null,
        sort_order: sortOrder,
        effective_date: effectiveDate,
        type: categories.find(cat => cat.id === categoryId)?.name || 'Règles Générales'
    };

    try {
        if (currentEditingId) {
            // Mode modification
            await updateRegulation(currentEditingId, regulation);
            showMessage('Règlement modifié avec succès !', 'success');
            cancelEdit();
        } else {
            // Mode ajout
            await addRegulation(regulation);
            showMessage('Règlement ajouté avec succès !', 'success');
            clearForm();
        }
        
        // Recharger les listes
        await loadAdminRegulations();
        await refreshRegulations();
    } catch (error) {
        console.error('Erreur lors de la soumission:', error);
        showMessage('Erreur lors de la sauvegarde du règlement.', 'error');
    }
}

// Afficher un message de statut
function showMessage(text, type = 'info') {
    // Supprimer les anciens messages
    const existingMessage = document.querySelector('.status-message');
    if (existingMessage) {
        existingMessage.remove();
    }

    // Créer le nouveau message
    const message = document.createElement('div');
    message.className = `status-message ${type}`;
    message.style.cssText = `
        position: fixed;
        top: 20px;
        right: 20px;
        padding: 12px 20px;
        border-radius: 8px;
        font-weight: 500;
        z-index: 1000;
        animation: slideInRight 0.3s ease-out;
        max-width: 300px;
        box-shadow: 0 4px 12px rgba(0, 0, 0, 0.2);
    `;

    // Couleurs selon le type
    switch(type) {
        case 'success':
            message.style.background = 'linear-gradient(135deg, #10B981, #059669)';
            message.style.color = 'white';
            break;
        case 'error':
            message.style.background = 'linear-gradient(135deg, #EF4444, #DC2626)';
            message.style.color = 'white';
            break;
        default:
            message.style.background = 'linear-gradient(135deg, #3B82F6, #2563EB)';
            message.style.color = 'white';
    }

    message.textContent = text;
    document.body.appendChild(message);

    // Supprimer automatiquement après 4 secondes
    setTimeout(() => {
        if (message.parentNode) {
            message.style.animation = 'slideOutRight 0.3s ease-in';
            setTimeout(() => message.remove(), 300);
        }
    }, 4000);
}

// Charger les règlements dans l'interface admin
async function loadAdminRegulations() {
    try {
        const regulations = await fetchRegulations();
        displayAdminRegulations(regulations);
    } catch (error) {
        console.error('Erreur lors du chargement des règlements admin:', error);
    }
}

// Éditer un règlement
function editRegulation(id) {
    // Récupérer le règlement à éditer
    fetchRegulations().then(regulations => {
        const regulation = regulations.find(r => r.id === id);
        if (!regulation) {
            showMessage('Règlement non trouvé', 'error');
            return;
        }

        // Remplir le formulaire avec les données existantes
        document.getElementById('regulation-category').value = regulation.category_id || '';
        document.getElementById('regulation-title').value = regulation.title || '';
        document.getElementById('regulation-description').value = regulation.description || '';
        document.getElementById('regulation-severity').value = regulation.severity || 'info';
        document.getElementById('regulation-penalty').value = regulation.penalty_description || '';
        document.getElementById('regulation-order').value = regulation.sort_order || 0;
        
        // Date effective
        if (regulation.effective_date) {
            const date = new Date(regulation.effective_date);
            document.getElementById('regulation-effective-date').value = date.toISOString().split('T')[0];
        }
        
        // Déclencher le changement de couleur pour la catégorie
        const categorySelect = document.getElementById('regulation-category');
        if (categorySelect) {
            categorySelect.dispatchEvent(new Event('change'));
        }
        
        // Changer le mode du formulaire
        currentEditingId = id;
        document.getElementById('form-title').textContent = 'Modifier le règlement';
        document.getElementById('submit-btn').textContent = 'Modifier le règlement';
        document.getElementById('cancel-edit-btn').classList.remove('hidden');
        
        // Scroller vers le formulaire
        document.getElementById('regulation-form').scrollIntoView({ 
            behavior: 'smooth',
            block: 'start' 
        });

        showMessage('Mode édition activé', 'info');
    }).catch(error => {
        console.error('Erreur lors de la récupération du règlement:', error);
        showMessage('Erreur lors du chargement du règlement', 'error');
    });
}

// Annuler l'édition
function cancelEdit() {
    currentEditingId = null;
    clearForm();
    document.getElementById('form-title').textContent = 'Ajouter un nouveau règlement';
    document.getElementById('submit-btn').textContent = 'Ajouter le règlement';
    document.getElementById('cancel-edit-btn').classList.add('hidden');
    
    // Réinitialiser la bordure du select de catégorie
    const categorySelect = document.getElementById('regulation-category');
    if (categorySelect) {
        categorySelect.style.borderColor = '';
        categorySelect.style.boxShadow = '';
    }
}

function showPreview() {
    const form = document.getElementById('regulation-admin-form');
    const formData = new FormData(form);
    
    const previewData = {
        title: formData.get('title'),
        description: formData.get('description'),
        categoryId: formData.get('category_id'),
        severity: formData.get('severity'),
        penalty: formData.get('penalty'),
        fineAmount: formData.get('fine_amount')
    };

    // Obtenir le nom de la catégorie
    const categorySelect = document.getElementById('regulation-category');
    const categoryName = categorySelect.options[categorySelect.selectedIndex]?.text || 'Non spécifiée';

    // Créer la prévisualisation
    const previewModal = document.createElement('div');
    previewModal.className = 'preview-modal';
    previewModal.innerHTML = `
        <div class="preview-content">
            <div class="preview-header">
                <h3>Prévisualisation du Règlement</h3>
                <button type="button" class="close-preview" onclick="closePreview()">×</button>
            </div>
            <div class="preview-body">
                <div class="regulation-preview">
                    <div class="regulation-category category-${previewData.categoryId}">
                        ${categoryName}
                    </div>
                    <h4 class="regulation-title">${previewData.title || 'Titre non spécifié'}</h4>
                    <div class="regulation-description">
                        ${previewData.description || 'Description non spécifiée'}
                    </div>
                    <div class="regulation-details">
                        <div class="severity-indicator severity-${previewData.severity}">
                            Sévérité: ${getSeverityLabel(previewData.severity)}
                        </div>
                        ${previewData.penalty ? `<div class="penalty-info">Sanction: ${previewData.penalty}</div>` : ''}
                        ${previewData.fineAmount ? `<div class="fine-info">Amende: ${previewData.fineAmount}€</div>` : ''}
                    </div>
                </div>
            </div>
            <div class="preview-actions">
                <button type="button" class="btn btn-secondary" onclick="closePreview()">Fermer</button>
                <button type="button" class="btn btn-primary" onclick="submitFromPreview()">Confirmer et Enregistrer</button>
            </div>
        </div>
    `;

    document.body.appendChild(previewModal);
}

function getSeverityLabel(severity) {
    const labels = {
        'info': 'Information',
        'warning': 'Avertissement',
        'major': 'Majeure',
        'critical': 'Critique'
    };
    return labels[severity] || severity;
}

function closePreview() {
    const modal = document.querySelector('.preview-modal');
    if (modal) {
        modal.remove();
    }
}

function submitFromPreview() {
    closePreview();
    const form = document.getElementById('regulation-admin-form');
    if (form) {
        form.dispatchEvent(new Event('submit'));
    }
}

// Vider le formulaire
function clearForm() {
    const fields = [
        'regulation-category',
        'regulation-title', 
        'regulation-description',
        'regulation-severity',
        'regulation-penalty',
        'regulation-order',
        'regulation-effective-date'
    ];
    
    fields.forEach(fieldId => {
        const field = document.getElementById(fieldId);
        if (field) {
            if (field.type === 'date') {
                field.value = new Date().toISOString().split('T')[0];
            } else if (field.type === 'number') {
                field.value = '0';
            } else {
                field.value = '';
            }
        }
    });

    // Réinitialiser la sélection de gravité par défaut
    const severitySelect = document.getElementById('regulation-severity');
    if (severitySelect) {
        severitySelect.value = 'info';
    }
}

// Confirmer et supprimer un règlement
function deleteRegulationAdmin(id) {
    if (confirm('Êtes-vous sûr de vouloir supprimer ce règlement ? Cette action est irréversible.')) {
        // Utiliser la fonction du fichier regulations.js
        if (typeof deleteRegulation === 'function') {
            deleteRegulation(id).then(() => {
                showMessage('Règlement supprimé avec succès', 'success');
                loadAdminRegulations(); // Recharger la liste
            }).catch(error => {
                console.error('Erreur lors de la suppression:', error);
                showMessage('Erreur lors de la suppression du règlement', 'error');
            });
        } else {
            // Suppression locale pour les données de test
            deleteRegulationFromLocal(id);
        }
    }
}

// Supprimer un règlement des données locales (pour les données de test)
function deleteRegulationFromLocal(id) {
    // Obtenir les règlements actuels
    fetchRegulations().then(regulations => {
        // Filtrer le règlement à supprimer
        const updatedRegulations = regulations.filter(reg => reg.id !== id);
        
        // Mettre à jour l'affichage
        displayAdminRegulations(updatedRegulations);
        displayRegulations(updatedRegulations);
        
        showMessage('Règlement d\'exemple supprimé', 'success');
    }).catch(error => {
        console.error('Erreur lors de la suppression locale:', error);
        showMessage('Erreur lors de la suppression', 'error');
    });
}

// Fonction pour initialiser l'interface admin (appelée depuis app.js)
function initializeAdminInterface() {
    loadAdminInterface();
}

// Export des fonctions pour les rendre disponibles globalement
window.editRegulation = editRegulation;
window.deleteRegulationAdmin = deleteRegulationAdmin;
window.initializeAdminInterface = initializeAdminInterface;