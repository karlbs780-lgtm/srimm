// Données initiales (à remplacer par une base de données réelle)
let users = [];
let events = [];
let rankings = [];
let currentUser = null;

// Fonction pour charger depuis localStorage
function loadFromLocalStorage() {
    try {
        users = JSON.parse(localStorage.getItem('gamingCommunityUsers')) || [];
        events = JSON.parse(localStorage.getItem('gamingCommunityEvents')) || [];
        rankings = JSON.parse(localStorage.getItem('gamingCommunityRankings')) || [];
        currentUser = JSON.parse(localStorage.getItem('currentUser')) || null;
        
        // Si aucun utilisateur, créer un admin par défaut
        if (users.length === 0) {
            initializeDefaultData();
        }
    } catch (error) {
        console.error('Erreur lors du chargement depuis localStorage:', error);
        initializeDefaultData();
    }
}

// Fonction pour initialiser les données par défaut
function initializeDefaultData() {
    users = [
        { 
            id: 1, 
            username: "Admin", 
            password: "admin123", 
            rank: "Diamond", 
            points: 0, 
            matchesPlayed: 0, 
            starPlayer: true,
            isAdmin: true 
        },
        { 
            id: 2, 
            username: "Player1", 
            password: "123", 
            rank: "Gold", 
            points: 100, 
            matchesPlayed: 10, 
            starPlayer: false 
        },
        { 
            id: 3, 
            username: "Player2", 
            password: "123", 
            rank: "Silver", 
            points: 80, 
            matchesPlayed: 8, 
            starPlayer: false 
        }
    ];
    
    const now = new Date();
    const tomorrow = new Date(now);
    tomorrow.setDate(tomorrow.getDate() + 1);
    
    events = [
        { 
            id: 1, 
            title: "Tournoi 3v3", 
            description: "Tournoi compétitif avec matchmaking équilibré", 
            date: tomorrow.toISOString(), 
            maxPlayers: 12,
            registeredPlayers: [1, 3],
            status: "open",
            matches: []
        }
    ];
    
    // Générer le classement
    rankings = users.map(user => ({
        userId: user.id,
        username: user.username,
        points: user.points || 0,
        rank: user.rank,
        matchesPlayed: user.matchesPlayed || 0,
        tier: calculateTier(user.points || 0, users)
    })).sort((a, b) => b.points - a.points);
    
    saveAllToLocalStorage();
}

// Fonction de sauvegarde unifiée
function saveToLocalStorage(key, data) {
    try {
        localStorage.setItem(`gamingCommunity${key.charAt(0).toUpperCase() + key.slice(1)}`, JSON.stringify(data));
        console.log(`Données "${key}" sauvegardées:`, data);
    } catch (error) {
        console.error(`Erreur lors de la sauvegarde de "${key}":`, error);
    }
}

// Fonction pour sauvegarder toutes les données
function saveAllToLocalStorage() {
    saveToLocalStorage('users', users);
    saveToLocalStorage('events', events);
    saveToLocalStorage('rankings', rankings);
    if (currentUser) {
        localStorage.setItem('currentUser', JSON.stringify(currentUser));
    }
}

// DOM Elements
const loginBtn = document.getElementById('loginBtn');
const registerBtn = document.getElementById('registerBtn');
const loginModal = document.getElementById('loginModal');
const registerModal = document.getElementById('registerModal');
const closeButtons = document.querySelectorAll('.close');
const loginForm = document.getElementById('loginForm');
const registerForm = document.getElementById('registerForm');
const eventsContainer = document.getElementById('eventsContainer');
const rankingTable = document.getElementById('rankingTable');
const profileCard = document.getElementById('profileCard');
const profileActions = document.getElementById('profileActions');
const userEvents = document.getElementById('userEvents');
const notificationContainer = document.getElementById('notificationContainer');

// Événements
document.addEventListener('DOMContentLoaded', () => {
    updateUI();
    loadEvents();
    loadRankings();
    setupNavigation();
    setupEventListeners();
    
    // Vérifier les notifications d'événements
    checkEventNotifications();
});

function setupEventListeners() {
    // Boutons de connexion/inscription
    loginBtn.addEventListener('click', () => openModal(loginModal));
    registerBtn.addEventListener('click', () => openModal(registerModal));
    
    // Fermer les modals
    closeButtons.forEach(btn => {
        btn.addEventListener('click', () => {
            loginModal.style.display = 'none';
            registerModal.style.display = 'none';
        });
    });
    
    // Fermer les modals en cliquant à l'extérieur
    window.addEventListener('click', (e) => {
        if (e.target === loginModal) loginModal.style.display = 'none';
        if (e.target === registerModal) registerModal.style.display = 'none';
    });
    
    // Formulaires
    loginForm.addEventListener('submit', handleLogin);
    registerForm.addEventListener('submit', handleRegister);
    
    // Boutons de navigation
    document.getElementById('viewEventsBtn')?.addEventListener('click', () => {
        document.querySelector('a[href="#events"]').click();
    });
    
    document.getElementById('viewRankingBtn')?.addEventListener('click', () => {
        document.querySelector('a[href="#ranking"]').click();
    });
}

function setupNavigation() {
    const hamburger = document.querySelector('.hamburger');
    const navMenu = document.querySelector('.nav-menu');
    const navLinks = document.querySelectorAll('.nav-link');
    
    hamburger.addEventListener('click', () => {
        hamburger.classList.toggle('active');
        navMenu.classList.toggle('active');
    });
    
    navLinks.forEach(link => {
        link.addEventListener('click', () => {
            hamburger.classList.remove('active');
            navMenu.classList.remove('active');
            
            // Mettre à jour le lien actif
            navLinks.forEach(l => l.classList.remove('active'));
            link.classList.add('active');
            
            // Faire défiler jusqu'à la section
            const targetId = link.getAttribute('href');
            if (targetId.startsWith('#')) {
                const targetSection = document.querySelector(targetId);
                if (targetSection) {
                    window.scrollTo({
                        top: targetSection.offsetTop - 80,
                        behavior: 'smooth'
                    });
                }
            }
        });
    });
}

function openModal(modal) {
    modal.style.display = 'flex';
}

function handleLogin(e) {
    e.preventDefault();
    console.log('Tentative de connexion...');
    
    const pseudo = document.getElementById('loginPseudo').value.trim();
    const password = document.getElementById('loginPassword').value;
    
    console.log('Pseudo recherché:', pseudo);
    console.log('Utilisateurs disponibles:', users);
    
    // Rechercher l'utilisateur
    const user = users.find(u => u.username === pseudo && u.password === password);
    
    if (user) {
        console.log('Utilisateur trouvé:', user);
        currentUser = user;
        localStorage.setItem('currentUser', JSON.stringify(currentUser));
        
        showNotification('Connexion réussie! Bienvenue ' + user.username, 'success');
        loginModal.style.display = 'none';
        loginForm.reset();
        
        // Recharger toutes les données et l'interface
        updateUI();
        loadEvents();
        loadRankings();
        loadUserEvents();
    } else {
        console.log('Échec de connexion - utilisateur non trouvé');
        showNotification('Pseudo ou mot de passe incorrect', 'danger');
    }
}

function handleRegister(e) {
    e.preventDefault();
    console.log('Tentative d\'inscription...');
    
    const pseudo = document.getElementById('regPseudo').value.trim();
    const password = document.getElementById('regPassword').value;
    const rank = document.getElementById('regRank').value;
    
    // Validation
    if (!pseudo || !password || !rank) {
        showNotification('Veuillez remplir tous les champs', 'warning');
        return;
    }
    
    if (pseudo.length < 3) {
        showNotification('Le pseudo doit faire au moins 3 caractères', 'warning');
        return;
    }
    
    if (password.length < 3) {
        showNotification('Le mot de passe doit faire au moins 3 caractères', 'warning');
        return;
    }
    
    // Vérifier si l'utilisateur existe déjà
    if (users.some(u => u.username.toLowerCase() === pseudo.toLowerCase())) {
        showNotification('Ce pseudo est déjà utilisé', 'warning');
        return;
    }
    
    // Créer le nouvel utilisateur
    const newUserId = users.length > 0 ? Math.max(...users.map(u => u.id)) + 1 : 1;
    
    const newUser = {
        id: newUserId,
        username: pseudo,
        password: password,
        rank: rank,
        points: 0,
        matchesPlayed: 0,
        starPlayer: false,
        isAdmin: false
    };
    
    console.log('Nouvel utilisateur créé:', newUser);
    
    // Ajouter à la liste des utilisateurs
    users.push(newUser);
    saveToLocalStorage('users', users);
    
    // Créer l'entrée de classement
    const newRanking = {
        userId: newUserId,
        username: pseudo,
        points: 0,
        rank: rank,
        matchesPlayed: 0,
        tier: "random"
    };
    
    rankings.push(newRanking);
    saveToLocalStorage('rankings', rankings);
    
    showNotification('Inscription réussie! Vous pouvez maintenant vous connecter.', 'success');
    
    // Fermer le modal et réinitialiser le formulaire
    registerModal.style.display = 'none';
    registerForm.reset();
    
    console.log('Utilisateurs après inscription:', users);
    console.log('Classement après inscription:', rankings);
    
    // Ouvrir automatiquement le modal de connexion
    setTimeout(() => {
        loginModal.style.display = 'flex';
        // Pré-remplir le pseudo
        document.getElementById('loginPseudo').value = pseudo;
        document.getElementById('loginPassword').focus();
    }, 500);
}

function updateUI() {
    console.log('Mise à jour de l\'interface, utilisateur actuel:', currentUser);
    
    const authButtons = document.querySelector('.auth-buttons');
    const authButtonsMobile = document.querySelector('.auth-buttons-mobile');
    const profileUsername = document.getElementById('profileUsername');
    const profileRank = document.getElementById('profileRank');
    const profilePoints = document.getElementById('profilePoints');
    
    if (currentUser) {
        console.log('Utilisateur connecté:', currentUser.username);
        
        // Mettre à jour les boutons d'authentification desktop
        if (authButtons) {
            authButtons.innerHTML = `
                <span style="color: white; margin-right: 10px; display: flex; align-items: center;">
                    <i class="fas fa-user" style="margin-right: 5px;"></i>
                    ${currentUser.username}
                </span>
                <button id="logoutBtn" class="btn btn-outline">
                    <i class="fas fa-sign-out-alt"></i> Déconnexion
                </button>
            `;
            
            document.getElementById('logoutBtn').addEventListener('click', handleLogout);
        }
        
        // Mettre à jour les boutons mobiles
        if (authButtonsMobile) {
            authButtonsMobile.innerHTML = `
                <span style="color: white; margin-right: 10px; font-size: 0.9rem;">
                    ${currentUser.username}
                </span>
                <button id="logoutBtnMobile" class="btn btn-outline btn-sm">
                    <i class="fas fa-sign-out-alt"></i>
                </button>
            `;
            
            document.getElementById('logoutBtnMobile').addEventListener('click', handleLogout);
        }
        
        // Mettre à jour le profil
        if (profileUsername) profileUsername.textContent = currentUser.username;
        if (profileRank) profileRank.textContent = `Rang: ${currentUser.rank}`;
        if (profilePoints) profilePoints.textContent = `Points: ${currentUser.points || 0}`;
        
        // Afficher les actions du profil
        if (profileActions) {
            profileActions.innerHTML = `
                <h4>Modifier le profil</h4>
                <form id="editProfileForm" class="profile-form">
                    <div class="form-group">
                        <label for="editRank">Changer de rang</label>
                        <select id="editRank">
                            <option value="Iron" ${currentUser.rank === 'Iron' ? 'selected' : ''}>Fer</option>
                            <option value="Bronze" ${currentUser.rank === 'Bronze' ? 'selected' : ''}>Bronze</option>
                            <option value="Silver" ${currentUser.rank === 'Silver' ? 'selected' : ''}>Argent</option>
                            <option value="Gold" ${currentUser.rank === 'Gold' ? 'selected' : ''}>Or</option>
                            <option value="Platinum" ${currentUser.rank === 'Platinum' ? 'selected' : ''}>Platine</option>
                            <option value="Diamond" ${currentUser.rank === 'Diamond' ? 'selected' : ''}>Diamant</option>
                            <option value="Master" ${currentUser.rank === 'Master' ? 'selected' : ''}>Maître</option>
                            <option value="Grandmaster" ${currentUser.rank === 'Grandmaster' ? 'selected' : ''}>Grand Maître</option>
                            <option value="Challenger" ${currentUser.rank === 'Challenger' ? 'selected' : ''}>Challenger</option>
                        </select>
                    </div>
                    <div class="form-group">
                        <label for="editPassword">Nouveau mot de passe (laisser vide pour ne pas changer)</label>
                        <input type="password" id="editPassword" placeholder="Nouveau mot de passe">
                    </div>
                    <div class="form-group">
                        <label for="confirmPassword">Confirmer le nouveau mot de passe</label>
                        <input type="password" id="confirmPassword" placeholder="Confirmer le mot de passe">
                    </div>
                    <button type="submit" class="btn btn-primary">Mettre à jour</button>
                </form>
            `;
            
            // Événement pour le formulaire de modification
            document.getElementById('editProfileForm')?.addEventListener('submit', handleProfileUpdate);
        }
        
        // Charger les événements de l'utilisateur
        loadUserEvents();
        
    } else {
        console.log('Aucun utilisateur connecté');
        
        // Réinitialiser l'interface pour un utilisateur non connecté
        if (authButtons) {
            authButtons.innerHTML = `
                <button id="loginBtn" class="btn btn-outline">Connexion</button>
                <button id="registerBtn" class="btn btn-primary">Inscription</button>
            `;
        }
        
        if (authButtonsMobile) {
            authButtonsMobile.innerHTML = `
                <button id="loginBtnMobile" class="btn btn-outline btn-sm">Connexion</button>
                <button id="registerBtnMobile" class="btn btn-primary btn-sm">Inscription</button>
            `;
        }
        
        // Réinitialiser le profil
        if (profileUsername) profileUsername.textContent = "Non connecté";
        if (profileRank) profileRank.textContent = "Rang: -";
        if (profilePoints) profilePoints.textContent = "Points: 0";
        
        if (profileActions) {
            profileActions.innerHTML = `
                <div style="text-align: center; padding: 2rem;">
                    <i class="fas fa-user-circle" style="font-size: 3rem; color: #ccc; margin-bottom: 1rem;"></i>
                    <p>Connectez-vous pour accéder à votre profil</p>
                    <button id="profileLoginBtn" class="btn btn-primary" style="margin-top: 1rem;">
                        <i class="fas fa-sign-in-alt"></i> Se connecter
                    </button>
                </div>
            `;
            
            document.getElementById('profileLoginBtn')?.addEventListener('click', () => {
                openModal(loginModal);
            });
        }
        
        if (userEvents) {
            userEvents.innerHTML = `
                <div style="text-align: center; padding: 2rem; color: #666;">
                    <i class="fas fa-calendar-times" style="font-size: 2rem; margin-bottom: 1rem;"></i>
                    <p>Connectez-vous pour voir vos événements</p>
                </div>
            `;
        }
    }
    
    // Réinitialiser les écouteurs d'événements
    setupEventListeners();
}

function handleLogout() {
    console.log('Déconnexion en cours...');
    
    // Confirmer la déconnexion
    if (confirm('Êtes-vous sûr de vouloir vous déconnecter ?')) {
        currentUser = null;
        localStorage.removeItem('currentUser');
        
        showNotification('Déconnexion réussie', 'info');
        
        // Recharger l'interface
        updateUI();
        loadEvents();
        loadRankings();
    }
}
function handleProfileUpdate(e) {
    e.preventDefault();
    
    if (!currentUser) {
        showNotification('Vous devez être connecté pour modifier votre profil', 'warning');
        return;
    }
    
    const newRank = document.getElementById('editRank').value;
    const newPassword = document.getElementById('editPassword').value;
    const confirmPassword = document.getElementById('confirmPassword').value;
    
    // Vérifier la confirmation du mot de passe
    if (newPassword && newPassword !== confirmPassword) {
        showNotification('Les mots de passe ne correspondent pas', 'danger');
        return;
    }
    
    // Trouver l'utilisateur dans la liste
    const userIndex = users.findIndex(u => u.id === currentUser.id);
    if (userIndex === -1) {
        showNotification('Utilisateur non trouvé', 'danger');
        return;
    }
    
    // Mettre à jour les informations
    users[userIndex].rank = newRank;
    
    if (newPassword && newPassword.length >= 3) {
        users[userIndex].password = newPassword;
    }
    
    // Mettre à jour le classement
    const rankIndex = rankings.findIndex(r => r.userId === currentUser.id);
    if (rankIndex !== -1) {
        rankings[rankIndex].rank = newRank;
    }
    
    // Mettre à jour l'utilisateur courant
    currentUser.rank = newRank;
    if (newPassword && newPassword.length >= 3) {
        currentUser.password = newPassword;
    }
    
    // Sauvegarder
    saveToLocalStorage('users', users);
    saveToLocalStorage('rankings', rankings);
    localStorage.setItem('currentUser', JSON.stringify(currentUser));
    
    showNotification('Profil mis à jour avec succès', 'success');
    
    // Réinitialiser le formulaire
    document.getElementById('editPassword').value = '';
    document.getElementById('confirmPassword').value = '';
    
    // Mettre à jour l'interface
    updateUI();
}

function loadEvents() {
    eventsContainer.innerHTML = '';
    
    // Trier les événements par date (les plus proches en premier)
    const sortedEvents = [...events].sort((a, b) => new Date(a.date) - new Date(b.date));
    
    sortedEvents.forEach(event => {
        const eventDate = new Date(event.date);
        const now = new Date();
        const timeDiff = eventDate - now;
        const hoursDiff = Math.floor(timeDiff / (1000 * 60 * 60));
        const minutesDiff = Math.floor((timeDiff % (1000 * 60 * 60)) / (1000 * 60));
        
        // Vérifier si les inscriptions doivent être fermées (15 minutes avant)
        const registrationClosed = timeDiff < 15 * 60 * 1000;
        
        // Mettre à jour le statut si nécessaire
        if (registrationClosed && event.status === 'open') {
            event.status = 'closed';
            showNotification(`Les inscriptions pour "${event.title}" sont maintenant fermées!`, 'warning');
            
            // Créer les matchs automatiquement
            createMatchesForEvent(event);
        }
        
        const eventElement = document.createElement('div');
        eventElement.className = 'event-card';
        
        // Déterminer le statut de l'événement
        let statusBadge = '';
        if (event.status === 'closed') {
            statusBadge = '<span class="status-badge" style="background-color: #e17055; padding: 3px 8px; border-radius: 4px; font-size: 0.8rem;">Inscriptions fermées</span>';
        } else if (event.status === 'in-progress') {
            statusBadge = '<span class="status-badge" style="background-color: #00b894; padding: 3px 8px; border-radius: 4px; font-size: 0.8rem;">En cours</span>';
        } else if (event.status === 'finished') {
            statusBadge = '<span class="status-badge" style="background-color: #636e72; padding: 3px 8px; border-radius: 4px; font-size: 0.8rem;">Terminé</span>';
        }
        
        // Vérifier si l'utilisateur est inscrit
        const isRegistered = currentUser && event.registeredPlayers.includes(currentUser.id);
        
        eventElement.innerHTML = `
            <div class="event-header">
                <div class="event-title">${event.title} ${statusBadge}</div>
                <div class="event-date"><i class="far fa-calendar"></i> ${eventDate.toLocaleDateString('fr-FR')}</div>
            </div>
            <div class="event-body">
                <div class="event-info">
                    <p><i class="far fa-clock"></i> ${eventDate.toLocaleTimeString('fr-FR', {hour: '2-digit', minute:'2-digit'})}</p>
                    <p><i class="fas fa-users"></i> ${event.registeredPlayers.length}/${event.maxPlayers} joueurs inscrits</p>
                    <p><i class="fas fa-info-circle"></i> ${event.description}</p>
                    <p><i class="fas fa-hourglass-end"></i> Inscriptions ferment dans: ${hoursDiff > 0 ? `${hoursDiff}h ` : ''}${minutesDiff}min</p>
                </div>
                <div class="event-actions">
                    ${event.status === 'open' ? 
                        (isRegistered ? 
                            `<button class="btn btn-danger" onclick="unregisterFromEvent(${event.id})">Se désinscrire</button>` : 
                            `<button class="btn btn-primary" onclick="registerToEvent(${event.id})" ${event.registeredPlayers.length >= event.maxPlayers ? 'disabled' : ''}>S'inscrire</button>`) : 
                        ''}
                    ${event.status === 'closed' && event.matches.length > 0 ? 
                        `<button class="btn btn-info" onclick="viewEventMatches(${event.id})">Voir les matchs</button>` : 
                        ''}
                </div>
            </div>
        `;
        
        eventsContainer.appendChild(eventElement);
    });
}

function loadRankings() {
    // Trier les classements par points
    const sortedRankings = [...rankings].sort((a, b) => b.points - a.points);
    
    // Mettre à jour les tiers
    sortedRankings.forEach((ranking, index) => {
        ranking.tier = calculateTier(index + 1, sortedRankings.length);
    });
    
    // Mettre à jour le tableau de classement
    rankingTable.innerHTML = '';
    sortedRankings.forEach((ranking, index) => {
        const row = document.createElement('tr');
        row.innerHTML = `
            <td>${index + 1}</td>
            <td>${ranking.username} ${ranking.userId === currentUser?.id ? '<span style="color: #6c5ce7;">(vous)</span>' : ''}</td>
            <td>${ranking.points}</td>
            <td>${ranking.rank}</td>
            <td><span class="tier-badge ${ranking.tier}">${ranking.tier}</span></td>
            <td>${ranking.matchesPlayed || 0}</td>
        `;
        rankingTable.appendChild(row);
    });
    
    // Mettre à jour les sections de tier
    updateTierSections(sortedRankings);
}

function updateTierSections(rankings) {
    // Tier S (Top 3)
    const tierS = document.getElementById('tierS');
    tierS.innerHTML = '';
    rankings.slice(0, 3).forEach((ranking, index) => {
        const playerElement = document.createElement('div');
        playerElement.className = 'player-rank';
        playerElement.innerHTML = `
            <span>${index + 1}. ${ranking.username}</span>
            <span>${ranking.points} pts</span>
        `;
        tierS.appendChild(playerElement);
    });
    
    // Tier A (4-6)
    const tierA = document.getElementById('tierA');
    tierA.innerHTML = '';
    rankings.slice(3, 6).forEach((ranking, index) => {
        const playerElement = document.createElement('div');
        playerElement.className = 'player-rank';
        playerElement.innerHTML = `
            <span>${index + 4}. ${ranking.username}</span>
            <span>${ranking.points} pts</span>
        `;
        tierA.appendChild(playerElement);
    });
    
    // Tier B (7-10)
    const tierB = document.getElementById('tierB');
    tierB.innerHTML = '';
    rankings.slice(6, 10).forEach((ranking, index) => {
        const playerElement = document.createElement('div');
        playerElement.className = 'player-rank';
        playerElement.innerHTML = `
            <span>${index + 7}. ${ranking.username}</span>
            <span>${ranking.points} pts</span>
        `;
        tierB.appendChild(playerElement);
    });
    
    // Tier Random (11+)
    const tierRandom = document.getElementById('tierRandom');
    tierRandom.innerHTML = '';
    rankings.slice(10, 15).forEach((ranking, index) => {
        const playerElement = document.createElement('div');
        playerElement.className = 'player-rank';
        playerElement.innerHTML = `
            <span>${index + 11}. ${ranking.username}</span>
            <span>${ranking.points} pts</span>
        `;
        tierRandom.appendChild(playerElement);
    });
}

function calculateTier(position, totalPlayers) {
    if (position <= 3) return 'S';
    if (position <= 6) return 'A';
    if (position <= 10) return 'B';
    return 'Random';
}

function registerToEvent(eventId) {
    if (!currentUser) {
        showNotification('Vous devez être connecté pour vous inscrire', 'warning');
        openModal(loginModal);
        return;
    }
    
    const event = events.find(e => e.id === eventId);
    if (!event) return;
    
    // Vérifier si l'utilisateur est déjà inscrit
    if (event.registeredPlayers.includes(currentUser.id)) {
        showNotification('Vous êtes déjà inscrit à cet événement', 'info');
        return;
    }
    
    // Vérifier si l'événement est complet
    if (event.registeredPlayers.length >= event.maxPlayers) {
        showNotification('Cet événement est complet', 'warning');
        return;
    }
    
    // Inscrire l'utilisateur
    event.registeredPlayers.push(currentUser.id);
    saveToLocalStorage('events', events);
    
    showNotification(`Vous êtes inscrit à "${event.title}"`, 'success');
    
    // Envoyer une notification (simulée)
    sendNotification(currentUser.id, `Vous êtes inscrit à l'événement "${event.title}"`);
    
    // Recharger les événements
    loadEvents();
    loadUserEvents();
}

function unregisterFromEvent(eventId) {
    if (!currentUser) return;
    
    const event = events.find(e => e.id === eventId);
    if (!event) return;
    
    // Retirer l'utilisateur
    const userIndex = event.registeredPlayers.indexOf(currentUser.id);
    if (userIndex !== -1) {
        event.registeredPlayers.splice(userIndex, 1);
        saveToLocalStorage('events', events);
        
        showNotification(`Vous êtes désinscrit de "${event.title}"`, 'info');
        
        // Recharger les événements
        loadEvents();
        loadUserEvents();
    }
}

function loadUserEvents() {
    if (!currentUser) {
        userEvents.innerHTML = `<p>Connectez-vous pour voir vos événements</p>`;
        return;
    }
    
    const userEventList = events.filter(event => 
        event.registeredPlayers.includes(currentUser.id)
    );
    
    if (userEventList.length === 0) {
        userEvents.innerHTML = `<p>Vous n'êtes inscrit à aucun événement</p>`;
        return;
    }
    
    userEvents.innerHTML = '';
    userEventList.forEach(event => {
        const eventDate = new Date(event.date);
        const eventElement = document.createElement('div');
        eventElement.className = 'event-card';
        eventElement.style.marginBottom = '15px';
        
        eventElement.innerHTML = `
            <div class="event-header" style="padding: 0.8rem;">
                <div class="event-title">${event.title}</div>
                <div class="event-date">${eventDate.toLocaleDateString('fr-FR')}</div>
            </div>
            <div class="event-body" style="padding: 1rem;">
                <p><i class="far fa-clock"></i> ${eventDate.toLocaleTimeString('fr-FR', {hour: '2-digit', minute:'2-digit'})}</p>
                <p>Statut: ${event.status === 'open' ? 'Inscriptions ouvertes' : 
                             event.status === 'closed' ? 'Inscriptions fermées' : 
                             event.status === 'in-progress' ? 'En cours' : 'Terminé'}</p>
                ${event.matches.length > 0 ? 
                    `<p><i class="fas fa-trophy"></i> ${event.matches.filter(m => m.players.includes(currentUser.id)).length} match(s) programmé(s)</p>` : 
                    ''}
            </div>
        `;
        
        userEvents.appendChild(eventElement);
    });
}

function createMatchesForEvent(event) {
    if (event.status !== 'closed' || event.matches.length > 0) return;
    
    // Récupérer les joueurs inscrits
    const registeredPlayers = users.filter(user => 
        event.registeredPlayers.includes(user.id)
    );
    
    // Trier les joueurs par rang (pour un matchmaking équilibré)
    const rankOrder = {
        "Iron": 1, "Bronze": 2, "Silver": 3, "Gold": 4, 
        "Platinum": 5, "Diamond": 6, "Master": 7, 
        "Grandmaster": 8, "Challenger": 9
    };
    
    registeredPlayers.sort((a, b) => rankOrder[b.rank] - rankOrder[a.rank]);
    
    // Créer des matchs 3v3
    const matches = [];
    for (let i = 0; i < registeredPlayers.length; i += 6) {
        const group = registeredPlayers.slice(i, i + 6);
        if (group.length === 6) {
            // Créer deux équipes de 3 joueurs
            const team1 = [group[0].id, group[2].id, group[4].id];
            const team2 = [group[1].id, group[3].id, group[5].id];
            
            matches.push({
                id: matches.length + 1,
                team1: team1,
                team2: team2,
                players: [...team1, ...team2],
                winner: null, // À déterminer après le match
                scores: { team1: 0, team2: 0 }
            });
        }
    }
    
    event.matches = matches;
    saveToLocalStorage('events', events);
    
    // Envoyer des notifications aux joueurs
    event.registeredPlayers.forEach(playerId => {
        sendNotification(playerId, `Les matchs pour "${event.title}" ont été créés! Préparez-vous à jouer.`);
    });
    
    showNotification(`Matchs créés pour "${event.title}"`, 'info');
}

function viewEventMatches(eventId) {
    const event = events.find(e => e.id === eventId);
    if (!event || event.matches.length === 0) return;
    
    // Créer un modal pour afficher les matchs
    const modal = document.createElement('div');
    modal.className = 'modal';
    modal.style.display = 'flex';
    
    let matchesHTML = '';
    event.matches.forEach(match => {
        const team1Players = match.team1.map(id => {
            const user = users.find(u => u.id === id);
            return user ? user.username : 'Joueur inconnu';
        }).join(', ');
        
        const team2Players = match.team2.map(id => {
            const user = users.find(u => u.id === id);
            return user ? user.username : 'Joueur inconnu';
        }).join(', ');
        
        matchesHTML += `
            <div class="match-card" style="background: #f9f9f9; padding: 1rem; margin-bottom: 1rem; border-radius: 8px;">
                <h4>Match ${match.id}</h4>
                <div style="display: flex; justify-content: space-between; align-items: center;">
                    <div>
                        <p><strong>Équipe 1:</strong> ${team1Players}</p>
                        <p><strong>Équipe 2:</strong> ${team2Players}</p>
                    </div>
                    ${currentUser && match.players.includes(currentUser.id) ? 
                        `<button class="btn btn-primary" onclick="recordMatchResult(${eventId}, ${match.id}, ${match.team1.includes(currentUser.id) ? 1 : 2})">Marquer la victoire</button>` : 
                        ''}
                </div>
                ${match.winner ? 
                    `<p style="color: #00b894; margin-top: 10px;"><i class="fas fa-trophy"></i> Vainqueur: Équipe ${match.winner}</p>` : 
                    `<p style="color: #636e72;">En attente de résultat</p>`}
            </div>
        `;
    });
    
    modal.innerHTML = `
        <div class="modal-content">
            <span class="close" onclick="this.parentElement.parentElement.remove()">&times;</span>
            <h2>Matchs pour ${event.title}</h2>
            <div>${matchesHTML}</div>
        </div>
    `;
    
    document.body.appendChild(modal);
    
    // Fermer le modal en cliquant à l'extérieur
    modal.addEventListener('click', (e) => {
        if (e.target === modal) {
            modal.remove();
        }
    });
}

function recordMatchResult(eventId, matchId, winningTeam) {
    const event = events.find(e => e.id === eventId);
    if (!event) return;
    
    const match = event.matches.find(m => m.id === matchId);
    if (!match) return;
    
    // Vérifier si le résultat a déjà été enregistré
    if (match.winner) {
        showNotification('Le résultat de ce match a déjà été enregistré', 'warning');
        return;
    }
    
    // Vérifier que l'utilisateur fait partie du match
    if (!currentUser || !match.players.includes(currentUser.id)) {
        showNotification('Vous ne faites pas partie de ce match', 'danger');
        return;
    }
    
    // Enregistrer le gagnant
    match.winner = winningTeam;
    
    // Distribuer les points
    const winningTeamPlayers = winningTeam === 1 ? match.team1 : match.team2;
    const losingTeamPlayers = winningTeam === 1 ? match.team2 : match.team1;
    
    // Points pour les gagnants
    winningTeamPlayers.forEach(playerId => {
        const userIndex = users.findIndex(u => u.id === playerId);
        if (userIndex !== -1) {
            users[userIndex].points = (users[userIndex].points || 0) + 10;
            users[userIndex].matchesPlayed = (users[userIndex].matchesPlayed || 0) + 1;
            
            // Vérifier si c'est un joueur star
            if (users[userIndex].starPlayer) {
                users[userIndex].points += 3;
            }
        }
        
        // Mettre à jour le classement
        const rankIndex = rankings.findIndex(r => r.userId === playerId);
        if (rankIndex !== -1) {
            rankings[rankIndex].points = users[userIndex].points;
            rankings[rankIndex].matchesPlayed = users[userIndex].matchesPlayed;
        }
    });
    
    // Points pour les perdants (juste comptabiliser le match)
    losingTeamPlayers.forEach(playerId => {
        const userIndex = users.findIndex(u => u.id === playerId);
        if (userIndex !== -1) {
            users[userIndex].matchesPlayed = (users[userIndex].matchesPlayed || 0) + 1;
        }
        
        // Mettre à jour le classement
        const rankIndex = rankings.findIndex(r => r.userId === playerId);
        if (rankIndex !== -1) {
            rankings[rankIndex].matchesPlayed = users[userIndex].matchesPlayed;
        }
    });
    
    saveToLocalStorage('users', users);
    saveToLocalStorage('rankings', rankings);
    
    // Mettre à jour l'utilisateur courant s'il fait partie du match
    if (match.players.includes(currentUser.id)) {
        const updatedUser = users.find(u => u.id === currentUser.id);
        if (updatedUser) {
            currentUser.points = updatedUser.points;
            currentUser.matchesPlayed = updatedUser.matchesPlayed;
            saveToLocalStorage('currentUser', currentUser);
        }
    }
    
    showNotification('Résultat du match enregistré avec succès!', 'success');
    
    // Recharger l'interface
    updateUI();
    
    // Fermer le modal des matchs
    const modal = document.querySelector('.modal');
    if (modal) modal.remove();
}

function checkEventNotifications() {
    const now = new Date();
    
    events.forEach(event => {
        const eventDate = new Date(event.date);
        const timeDiff = eventDate - now;
        
        // Vérifier si l'événement commence dans moins de 15 minutes
        if (timeDiff > 0 && timeDiff < 15 * 60 * 1000 && event.status === 'closed') {
            // Envoyer une notification aux joueurs inscrits
            event.registeredPlayers.forEach(playerId => {
                sendNotification(playerId, `L'événement "${event.title}" commence dans ${Math.floor(timeDiff / (1000 * 60))} minutes!`);
            });
            
            // Changer le statut de l'événement
            event.status = 'in-progress';
        }
        
        // Vérifier si l'événement est terminé
        if (timeDiff < 0 && event.status === 'in-progress') {
            event.status = 'finished';
            
            // Envoyer une notification de fin
            event.registeredPlayers.forEach(playerId => {
                sendNotification(playerId, `L'événement "${event.title}" est terminé!`);
            });
        }
    });
    
    saveToLocalStorage('events', events);
}

function sendNotification(userId, message) {
    // Dans une vraie application, cela enverrait une notification push
    // Pour cette démo, nous affichons simplement une notification à l'écran
    // si l'utilisateur concerné est connecté
    
    if (currentUser && currentUser.id === userId) {
        showNotification(message, 'info');
    }
}

function showNotification(message, type) {
    const notification = document.createElement('div');
    notification.className = `notification ${type}`;
    notification.innerHTML = `
        <span>${message}</span>
        <span class="notification-close" onclick="this.parentElement.remove()">&times;</span>
    `;
    
    notificationContainer.appendChild(notification);
    
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
// ===========================================
// FONCTIONS RESPONSIVE - À AJOUTER À LA FIN
// ===========================================

// Gestion du menu hamburger
function setupHamburgerMenu() {
    const hamburger = document.querySelector('.hamburger');
    const navMenu = document.querySelector('.nav-menu');
    
    if (!hamburger || !navMenu) return;
    
    hamburger.addEventListener('click', () => {
        hamburger.classList.toggle('active');
        navMenu.classList.toggle('active');
    });
    
    // Fermer le menu en cliquant sur un lien
    const navLinks = document.querySelectorAll('.nav-link');
    navLinks.forEach(link => {
        link.addEventListener('click', () => {
            hamburger.classList.remove('active');
            navMenu.classList.remove('active');
        });
    });
    
    // Boutons mobiles
    const loginBtnMobile = document.getElementById('loginBtnMobile');
    const registerBtnMobile = document.getElementById('registerBtnMobile');
    
    if (loginBtnMobile) {
        loginBtnMobile.addEventListener('click', () => openModal(loginModal));
    }
    
    if (registerBtnMobile) {
        registerBtnMobile.addEventListener('click', () => openModal(registerModal));
    }
}

// Gestion du redimensionnement
function handleResize() {
    const navMenu = document.querySelector('.nav-menu');
    const hamburger = document.querySelector('.hamburger');
    
    // Fermer le menu hamburger sur desktop
    if (window.innerWidth > 768 && navMenu && hamburger) {
        navMenu.classList.remove('active');
        hamburger.classList.remove('active');
    }
}

// Fonction debounce pour optimiser les performances
function debounce(func, wait) {
    let timeout;
    return function executedFunction(...args) {
        const later = () => {
            clearTimeout(timeout);
            func(...args);
        };
        clearTimeout(timeout);
        timeout = setTimeout(later, wait);
    };
}

// ===========================================
// MODIFICATION DE LA FONCTION EXISTANTE
// ===========================================

// DANS la fonction setupEventListeners(), AJOUTER cet appel :
function setupEventListeners() {
    // ... votre code existant ...
    
    // AJOUTER CETTE LIGNE à la fin de la fonction :
    setupHamburgerMenu();
}

// AJOUTER cette ligne à la fin du fichier (après toutes les fonctions) :
// Écouter le redimensionnement
window.addEventListener('resize', debounce(handleResize, 250));

// Exposer les fonctions globales
window.openModal = openModal;
window.registerToEvent = registerToEvent;
window.unregisterFromEvent = unregisterFromEvent;
window.viewEventMatches = viewEventMatches;

window.recordMatchResult = recordMatchResult;


