// Charger les données
let users = JSON.parse(localStorage.getItem('gamingCommunityUsers')) || [];
let events = JSON.parse(localStorage.getItem('gamingCommunityEvents')) || [];
let rankings = JSON.parse(localStorage.getItem('gamingCommunityRankings')) || [];

// Initialiser l'interface admin
document.addEventListener('DOMContentLoaded', () => {
    loadAdminDashboard();
    loadUsersTable();
    loadEventsAdmin();
    loadRankingAdmin();
    setupAdminEventListeners();
});

function setupAdminEventListeners() {
    // Navigation admin
    const navLinks = document.querySelectorAll('.admin-nav-link');
    const sections = document.querySelectorAll('.admin-section');
    
    navLinks.forEach(link => {
        link.addEventListener('click', (e) => {
            e.preventDefault();
            
            // Mettre à jour la navigation active
            navLinks.forEach(l => l.classList.remove('active'));
            link.classList.add('active');
            
            // Afficher la section correspondante
            const targetId = link.getAttribute('href').substring(1);
            sections.forEach(section => {
                section.classList.remove('active');
                if (section.id === targetId) {
                    section.classList.add('active');
                }
            });
        });
    });
    
    // Boutons de création
    document.getElementById('createEventBtn').addEventListener('click', () => {
        openModal('createEventModal');
    });
    
    document.getElementById('addPointsBtn').addEventListener('click', () => {
        openModal('addPointsModal');
        loadPlayersSelect();
    });
    
    document.getElementById('newEventBtn').addEventListener('click', () => {
        openModal('createEventModal');
    });
    
    // Fermer les modals
    document.querySelectorAll('.close').forEach(btn => {
        btn.addEventListener('click', () => {
            document.querySelectorAll('.modal').forEach(modal => {
                modal.style.display = 'none';
            });
        });
    });
    
    // Formulaires
    document.getElementById('createEventForm').addEventListener('submit', handleCreateEvent);
    document.getElementById('addPointsForm').addEventListener('submit', handleAddPoints);
    document.getElementById('saveSettingsBtn').addEventListener('click', saveSettings);
    
    // Boutons de classement
    document.getElementById('updateAllTiersBtn').addEventListener('click', updateAllTiers);
    document.getElementById('resetRankingBtn').addEventListener('click', resetRanking);
}

function openModal(modalId) {
    document.getElementById(modalId).style.display = 'flex';
}

function loadAdminDashboard() {
    // Statistiques
    document.getElementById('totalUsers').textContent = users.length;
    document.getElementById('totalEvents').textContent = events.length;
    
    // Calculer le total des matchs joués
    const totalMatches = users.reduce((sum, user) => sum + (user.matchesPlayed || 0), 0);
    document.getElementById('totalMatches').textContent = totalMatches;
    
    // Trouver le joueur star
    const starPlayer = users.find(user => user.starPlayer);
    document.getElementById('starPlayer').textContent = starPlayer ? starPlayer.username : 'Aucun';
    
    // Charger l'activité récente
    loadRecentActivity();
}

function loadRecentActivity() {
    const activityList = document.getElementById('activityList');
    activityList.innerHTML = '';
    
    // Cette fonction serait normalement connectée à un système de log
    // Pour l'exemple, nous créons des activités fictives
    const activities = [
        { action: 'Nouvel utilisateur inscrit', user: 'Player7', time: 'Il y a 2 heures' },
        { action: 'Événement créé', user: 'Admin', time: 'Il y a 5 heures' },
        { action: 'Match terminé', user: 'Player3 vs Player5', time: 'Il y a 1 jour' },
        { action: 'Points ajoutés', user: 'Player1 (+10 pts)', time: 'Il y a 2 jours' }
    ];
    
    activities.forEach(activity => {
        const activityElement = document.createElement('div');
        activityElement.className = 'activity-item';
        activityElement.style.padding = '0.8rem';
        activityElement.style.borderBottom = '1px solid #eee';
        activityElement.innerHTML = `
            <div style="display: flex; justify-content: space-between;">
                <div>
                    <strong>${activity.action}</strong>
                    <div style="color: #666; font-size: 0.9rem;">${activity.user}</div>
                </div>
                <div style="color: #999; font-size: 0.9rem;">${activity.time}</div>
            </div>
        `;
        activityList.appendChild(activityElement);
    });
}

function loadUsersTable() {
    const usersTable = document.getElementById('usersTable');
    usersTable.innerHTML = '';
    
    users.forEach(user => {
        const row = document.createElement('tr');
        row.innerHTML = `
            <td>${user.id}</td>
            <td>${user.username}</td>
            <td>${user.rank}</td>
            <td>${user.points || 0}</td>
            <td>${user.matchesPlayed || 0}</td>
            <td>
                <input type="checkbox" ${user.starPlayer ? 'checked' : ''} 
                       onchange="toggleStarPlayer(${user.id}, this.checked)">
            </td>
            <td>
                <button class="btn btn-sm btn-primary" onclick="editUser(${user.id})">
                    <i class="fas fa-edit"></i>
                </button>
                <button class="btn btn-sm btn-danger" onclick="deleteUser(${user.id})">
                    <i class="fas fa-trash"></i>
                </button>
            </td>
        `;
        usersTable.appendChild(row);
    });
}

function loadEventsAdmin() {
    const eventsList = document.getElementById('eventsAdminList');
    eventsList.innerHTML = '';
    
    // Trier les événements par date (les plus récents en premier)
    const sortedEvents = [...events].sort((a, b) => new Date(b.date) - new Date(a.date));
    
    sortedEvents.forEach(event => {
        const eventDate = new Date(event.date);
        const now = new Date();
        const isPast = eventDate < now;
        
        const eventElement = document.createElement('div');
        eventElement.className = 'event-admin-card';
        eventElement.innerHTML = `
            <div class="event-header" style="background-color: ${isPast ? '#636e72' : '#6c5ce7'}; padding: 1rem; color: white;">
                <div style="display: flex; justify-content: space-between; align-items: center;">
                    <div class="event-title">${event.title}</div>
                    <div class="event-status">${event.status}</div>
                </div>
                <div class="event-date">${eventDate.toLocaleDateString('fr-FR')} ${eventDate.toLocaleTimeString('fr-FR', {hour: '2-digit', minute:'2-digit'})}</div>
            </div>
            <div class="event-body" style="padding: 1rem;">
                <p>${event.description}</p>
                <p><i class="fas fa-users"></i> ${event.registeredPlayers.length}/${event.maxPlayers} joueurs</p>
                <p><i class="fas fa-trophy"></i> ${event.matches.length} match(s) créé(s)</p>
                <div style="display: flex; gap: 10px; margin-top: 1rem;">
                    <button class="btn btn-sm btn-primary" onclick="viewEventDetails(${event.id})">
                        <i class="fas fa-eye"></i> Détails
                    </button>
                    <button class="btn btn-sm btn-warning" onclick="editEvent(${event.id})">
                        <i class="fas fa-edit"></i> Modifier
                    </button>
                    <button class="btn btn-sm btn-danger" onclick="deleteEvent(${event.id})">
                        <i class="fas fa-trash"></i> Supprimer
                    </button>
                </div>
            </div>
        `;
        eventsList.appendChild(eventElement);
    });
}

function loadRankingAdmin() {
    const rankingTable = document.getElementById('rankingAdminTable');
    rankingTable.innerHTML = '';
    
    // Trier par points
    const sortedRankings = [...rankings].sort((a, b) => b.points - a.points);
    
    sortedRankings.forEach((ranking, index) => {
        const row = document.createElement('tr');
        row.innerHTML = `
            <td>${index + 1}</td>
            <td>${ranking.username}</td>
            <td>${ranking.points}</td>
            <td>${ranking.tier}</td>
            <td>
                <div style="display: flex; gap: 5px;">
                    <input type="number" id="points-${ranking.userId}" value="${ranking.points}" min="0" style="width: 80px; padding: 5px;">
                    <button class="btn btn-sm btn-success" onclick="updatePlayerPoints(${ranking.userId})">
                        <i class="fas fa-save"></i>
                    </button>
                </div>
            </td>
        `;
        rankingTable.appendChild(row);
    });
}

function loadPlayersSelect() {
    const selectPlayer = document.getElementById('selectPlayer');
    selectPlayer.innerHTML = '<option value="">Sélectionner un joueur</option>';
    
    users.forEach(user => {
        const option = document.createElement('option');
        option.value = user.id;
        option.textContent = `${user.username} (${user.points || 0} pts)`;
        selectPlayer.appendChild(option);
    });
}

function handleCreateEvent(e) {
    e.preventDefault();
    
    const title = document.getElementById('eventTitle').value;
    const description = document.getElementById('eventDescription').value;
    const date = document.getElementById('eventDate').value;
    const maxPlayers = parseInt(document.getElementById('eventMaxPlayers').value);
    
    const newEvent = {
        id: events.length > 0 ? Math.max(...events.map(e => e.id)) + 1 : 1,
        title: title,
        description: description,
        date: date,
        maxPlayers: maxPlayers,
        registeredPlayers: [],
        status: "open",
        matches: []
    };
    
    events.push(newEvent);
    saveToLocalStorage('events', events);
    
    showNotificationAdmin(`Événement "${title}" créé avec succès`, 'success');
    
    // Fermer le modal et réinitialiser le formulaire
    document.getElementById('createEventModal').style.display = 'none';
    document.getElementById('createEventForm').reset();
    
    // Recharger les événements
    loadEventsAdmin();
    loadAdminDashboard();
}

function handleAddPoints(e) {
    e.preventDefault();
    
    const playerId = parseInt(document.getElementById('selectPlayer').value);
    const points = parseInt(document.getElementById('pointsAmount').value);
    const reason = document.getElementById('pointsReason').value;
    
    if (!playerId || !points) {
        showNotificationAdmin('Veuillez sélectionner un joueur et entrer un nombre de points', 'warning');
        return;
    }
    
    // Trouver l'utilisateur
    const userIndex = users.findIndex(u => u.id === playerId);
    if (userIndex === -1) return;
    
    // Ajouter les points
    users[userIndex].points = (users[userIndex].points || 0) + points;
    
    // Mettre à jour le classement
    const rankIndex = rankings.findIndex(r => r.userId === playerId);
    if (rankIndex !== -1) {
        rankings[rankIndex].points = users[userIndex].points;
    }
    
    saveToLocalStorage('users', users);
    saveToLocalStorage('rankings', rankings);
    
    showNotificationAdmin(`${points} points ajoutés à ${users[userIndex].username} (${reason})`, 'success');
    
    // Fermer le modal et réinitialiser le formulaire
    document.getElementById('addPointsModal').style.display = 'none';
    document.getElementById('addPointsForm').reset();
    
    // Recharger les données
    loadUsersTable();
    loadRankingAdmin();
    loadAdminDashboard();
}

function saveSettings() {
    const pointsPerWin = document.getElementById('pointsPerWin').value;
    const starPlayerBonus = document.getElementById('starPlayerBonus').value;
    const closeRegMinutes = document.getElementById('closeRegMinutes').value;
    
    // Enregistrer les paramètres dans localStorage
    const settings = {
        pointsPerWin: parseInt(pointsPerWin),
        starPlayerBonus: parseInt(starPlayerBonus),
        closeRegMinutes: parseInt(closeRegMinutes)
    };
    
    localStorage.setItem('gamingCommunitySettings', JSON.stringify(settings));
    
    showNotificationAdmin('Paramètres enregistrés avec succès', 'success');
}

function updateAllTiers() {
    // Trier les classements par points
    const sortedRankings = [...rankings].sort((a, b) => b.points - a.points);
    
    // Mettre à jour les tiers
    sortedRankings.forEach((ranking, index) => {
        ranking.tier = calculateTierAdmin(index + 1, sortedRankings.length);
    });
    
    // Sauvegarder
    saveToLocalStorage('rankings', rankings);
    
    // Recharger le tableau
    loadRankingAdmin();
    
    showNotificationAdmin('Tous les tiers ont été mis à jour', 'success');
}

function calculateTierAdmin(position, totalPlayers) {
    if (position <= 3) return 'S';
    if (position <= 6) return 'A';
    if (position <= 10) return 'B';
    return 'Random';
}

function resetRanking() {
    if (!confirm('Êtes-vous sûr de vouloir réinitialiser tous les points du classement? Cette action est irréversible.')) {
        return;
    }
    
    // Réinitialiser les points de tous les utilisateurs
    users.forEach(user => {
        user.points = 0;
        user.matchesPlayed = 0;
    });
    
    // Réinitialiser le classement
    rankings.forEach(ranking => {
        ranking.points = 0;
        ranking.matchesPlayed = 0;
        ranking.tier = 'Random';
    });
    
    saveToLocalStorage('users', users);
    saveToLocalStorage('rankings', rankings);
    
    showNotificationAdmin('Classement réinitialisé avec succès', 'success');
    
    // Recharger les données
    loadUsersTable();
    loadRankingAdmin();
    loadAdminDashboard();
}

function toggleStarPlayer(userId, isStar) {
    const userIndex = users.findIndex(u => u.id === userId);
    if (userIndex !== -1) {
        users[userIndex].starPlayer = isStar;
        saveToLocalStorage('users', users);
        
        showNotificationAdmin(`${users[userIndex].username} ${isStar ? 'est maintenant' : 'n\'est plus'} un joueur star`, 'info');
    }
}

function updatePlayerPoints(userId) {
    const input = document.getElementById(`points-${userId}`);
    const newPoints = parseInt(input.value);
    
    if (isNaN(newPoints) || newPoints < 0) {
        showNotificationAdmin('Veuillez entrer un nombre valide de points', 'warning');
        return;
    }
    
    // Mettre à jour l'utilisateur
    const userIndex = users.findIndex(u => u.id === userId);
    if (userIndex !== -1) {
        users[userIndex].points = newPoints;
    }
    
    // Mettre à jour le classement
    const rankIndex = rankings.findIndex(r => r.userId === userId);
    if (rankIndex !== -1) {
        rankings[rankIndex].points = newPoints;
    }
    
    saveToLocalStorage('users', users);
    saveToLocalStorage('rankings', rankings);
    
    showNotificationAdmin(`Points de ${users[userIndex].username} mis à jour: ${newPoints}`, 'success');
    
    // Recharger les données
    loadRankingAdmin();
    loadUsersTable();
}

function viewEventDetails(eventId) {
    const event = events.find(e => e.id === eventId);
    if (!event) return;
    
    alert(`Détails de l'événement:\n\nTitre: ${event.title}\nDescription: ${event.description}\nDate: ${new Date(event.date).toLocaleString('fr-FR')}\nStatut: ${event.status}\nJoueurs inscrits: ${event.registeredPlayers.length}/${event.maxPlayers}\nMatchs créés: ${event.matches.length}`);
}

function editEvent(eventId) {
    // Implémenter l'édition d'événement
    showNotificationAdmin('Fonctionnalité d\'édition à implémenter', 'info');
}

function deleteEvent(eventId) {
    if (!confirm('Êtes-vous sûr de vouloir supprimer cet événement?')) {
        return;
    }
    
    const eventIndex = events.findIndex(e => e.id === eventId);
    if (eventIndex !== -1) {
        const eventTitle = events[eventIndex].title;
        events.splice(eventIndex, 1);
        saveToLocalStorage('events', events);
        
        showNotificationAdmin(`Événement "${eventTitle}" supprimé`, 'success');
        loadEventsAdmin();
        loadAdminDashboard();
    }
}

function editUser(userId) {
    // Implémenter l'édition d'utilisateur
    showNotificationAdmin('Fonctionnalité d\'édition à implémenter', 'info');
}

function deleteUser(userId) {
    if (!confirm('Êtes-vous sûr de vouloir supprimer cet utilisateur?')) {
        return;
    }
    
    const userIndex = users.findIndex(u => u.id === userId);
    if (userIndex !== -1) {
        const userName = users[userIndex].username;
        
        // Retirer l'utilisateur de tous les événements
        events.forEach(event => {
            const playerIndex = event.registeredPlayers.indexOf(userId);
            if (playerIndex !== -1) {
                event.registeredPlayers.splice(playerIndex, 1);
            }
        });
        
        // Retirer du classement
        const rankIndex = rankings.findIndex(r => r.userId === userId);
        if (rankIndex !== -1) {
            rankings.splice(rankIndex, 1);
        }
        
        // Supprimer l'utilisateur
        users.splice(userIndex, 1);
        
        saveToLocalStorage('users', users);
        saveToLocalStorage('events', events);
        saveToLocalStorage('rankings', rankings);
        
        showNotificationAdmin(`Utilisateur "${userName}" supprimé`, 'success');
        loadUsersTable();
        loadRankingAdmin();
        loadAdminDashboard();
    }
}

function showNotificationAdmin(message, type) {
    // Créer une notification temporaire
    const notification = document.createElement('div');
    notification.className = `notification ${type}`;
    notification.style.position = 'fixed';
    notification.style.top = '20px';
    notification.style.right = '20px';
    notification.style.zIndex = '1000';
    notification.innerHTML = `
        <span>${message}</span>
        <span style="cursor: pointer; margin-left: 15px;" onclick="this.parentElement.remove()">&times;</span>
    `;
    
    document.body.appendChild(notification);
    
    // Supprimer automatiquement après 5 secondes
    setTimeout(() => {
        if (notification.parentElement) {
            notification.remove();
        }
    }, 5000);
}

function saveToLocalStorage(key, data) {
    localStorage.setItem(`gamingCommunity${key.charAt(0).toUpperCase() + key.slice(1)}`, JSON.stringify(data));
}

// Exposer les fonctions globales
window.toggleStarPlayer = toggleStarPlayer;
window.editUser = editUser;
window.deleteUser = deleteUser;
window.viewEventDetails = viewEventDetails;
window.editEvent = editEvent;
window.deleteEvent = deleteEvent;
window.updatePlayerPoints = updatePlayerPoints;