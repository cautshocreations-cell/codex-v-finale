function renderRegulationList(regulations) {
    const regulationListContainer = document.getElementById('regulation-list');
    regulationListContainer.innerHTML = '';

    regulations.forEach(regulation => {
        const regulationItem = document.createElement('div');
        regulationItem.className = 'regulation-item';
        regulationItem.innerHTML = `
            <h3>${regulation.title}</h3>
            <p>${regulation.description}</p>
        `;
        regulationListContainer.appendChild(regulationItem);
    });
}

async function fetchRegulations() {
    try {
        const response = await fetch('/api/regulations');
        const regulations = await response.json();
        renderRegulationList(regulations);
    } catch (error) {
        console.error('Error fetching regulations:', error);
    }
}

document.addEventListener('DOMContentLoaded', () => {
    fetchRegulations();
});