document.addEventListener('DOMContentLoaded', function() {
    // Game state variables
    let cards = [];
    let flippedCards = [];
    let matchedCards = [];
    let moves = 0;
    let gameTime = 0;
    let timer;
    let isGameStarted = false;
    let isGamePaused = false;
    let isMultiplayer = false;
    let currentPlayer = 1;
    let playerStats = {
        1: { score: 0, matches: 0 },
        2: { score: 0, matches: 0 }
    };
    let gameMode = 'easy'; // easy: 4x4, medium: 4x6, hard: 6x6
    let soundsEnabled = true;
    let musicEnabled = true;
    let animationsEnabled = true;
    let sessionStats = {
        gamesPlayed: 0,
        totalMatches: 0,
        bestTime: 0,
        bestScore: 0
    };
    
    // Audio elements
    const flipSound = document.getElementById('flip-sound');
    const matchSound = document.getElementById('match-sound');
    const winSound = document.getElementById('win-sound');
    const backgroundMusic = document.getElementById('background-music');
    
    // DOM elements
    const gameBoard = document.getElementById('game-board');
    const movesElement = document.getElementById('moves');
    const matchesElement = document.getElementById('matches');
    const timerElement = document.getElementById('timer');
    const resetButton = document.getElementById('reset-btn');
    const themeButton = document.getElementById('theme-btn');
    const soundToggle = document.getElementById('sound-toggle');
    const winModal = document.getElementById('win-modal');
    const winTime = document.getElementById('win-time');
    const winMoves = document.getElementById('win-moves');
    const winnerElement = document.getElementById('winner');
    const playAgainButton = document.getElementById('play-again');
    const modeButtons = document.querySelectorAll('.mode-btn');
    const playerElements = document.querySelectorAll('.player');
    const dailyChallenge = document.getElementById('daily-challenge');
    const startChallengeButton = document.getElementById('start-challenge');
    const closeChallengeButton = document.getElementById('close-challenge');
    const navToggle = document.getElementById('nav-toggle');
    const navMenu = document.getElementById('nav-menu');
    
    // Initialize particles.js
    particlesJS('particles-js', {
        particles: {
            number: { value: 80, density: { enable: true, value_area: 800 } },
            color: { value: "#ffffff" },
            shape: { type: "circle" },
            opacity: { value: 0.5, random: true },
            size: { value: 3, random: true },
            line_linked: {
                enable: true,
                distance: 150,
                color: "#ffffff",
                opacity: 0.4,
                width: 1
            },
            move: {
                enable: true,
                speed: 2,
                direction: "none",
                random: true,
                straight: false,
                out_mode: "out",
                bounce: false
            }
        },
        interactivity: {
            detect_on: "canvas",
            events: {
                onhover: { enable: true, mode: "repulse" },
                onclick: { enable: true, mode: "push" },
                resize: true
            }
        },
        retina_detect: true
    });
    
    // Initialize the game
    initGame();
    
    // Initialize game with loading screen
    function initGame() {
        simulateLoading();
        loadSettings();
        setupEventListeners();
        setupAchievements();
        setupCollection();
    }
    
    // Simulate loading screen
    function simulateLoading() {
        const progress = document.querySelector('.progress');
        const loadingText = document.querySelector('.loading-text');
        const loadingScreen = document.getElementById('loading-screen');
        
        let width = 0;
        const interval = setInterval(() => {
            if (width >= 100) {
                clearInterval(interval);
                loadingScreen.style.display = 'none';
                // Start background music
                if (musicEnabled) {
                    backgroundMusic.volume = 0.3;
                    backgroundMusic.play();
                }
            } else {
                width += Math.random() * 10;
                progress.style.width = width + '%';
                
                if (width < 30) {
                    loadingText.textContent = "Loading game assets...";
                } else if (width < 60) {
                    loadingText.textContent = "Setting up game board...";
                } else if (width < 90) {
                    loadingText.textContent = "Almost ready...";
                } else {
                    loadingText.textContent = "Complete! Starting game...";
                }
            }
        }, 200);
    }
    
    // Load settings from localStorage
    function loadSettings() {
        const savedSettings = localStorage.getItem('memoryGameSettings');
        if (savedSettings) {
            const settings = JSON.parse(savedSettings);
            soundsEnabled = settings.soundsEnabled;
            musicEnabled = settings.musicEnabled;
            animationsEnabled = settings.animationsEnabled;
            gameMode = settings.difficulty || 'easy';
            document.getElementById('sound-toggle-setting').checked = soundsEnabled;
            document.getElementById('music-toggle').checked = musicEnabled;
            document.getElementById('animations-toggle').checked = animationsEnabled;
            document.getElementById('difficulty').value = gameMode;
            document.getElementById('card-back').value = settings.cardBack || 'default';
            
            // Update sound toggle button text
            soundToggle.innerHTML = soundsEnabled ? 
                '<i class="fas fa-volume-up"></i> Sound' : 
                '<i class="fas fa-volume-mute"></i> Sound';
        }
        
        const savedStats = localStorage.getItem('memoryGameStats');
        if (savedStats) {
            sessionStats = JSON.parse(savedStats);
        }
    }
    
    // Save settings to localStorage
    function saveSettings() {
        const settings = {
            soundsEnabled,
            musicEnabled,
            animationsEnabled,
            difficulty: gameMode,
            cardBack: document.getElementById('card-back').value
        };
        localStorage.setItem('memoryGameSettings', JSON.stringify(settings));
    }
    
    // Save stats to localStorage
    function saveStats() {
        localStorage.setItem('memoryGameStats', JSON.stringify(sessionStats));
    }
    
    // Set up event listeners
    function setupEventListeners() {
        // Card click event
        gameBoard.addEventListener('click', function(e) {
            const cardElement = e.target.closest('.card');
            if (cardElement && !cardElement.classList.contains('flipped') && 
                !cardElement.classList.contains('matched') && 
                flippedCards.length < 2 && 
                !isGamePaused) {
                flipCard(cardElement);
            }
        });
        
        // Reset button
        resetButton.addEventListener('click', resetGame);
        
        // Theme toggle
        themeButton.addEventListener('click', toggleTheme);
        
        // Sound toggle
        soundToggle.addEventListener('click', toggleSound);
        
        // Play again button
        playAgainButton.addEventListener('click', function() {
            winModal.style.display = 'none';
            resetGame();
        });
        
        // Game mode buttons
        modeButtons.forEach(button => {
            button.addEventListener('click', function() {
                modeButtons.forEach(btn => btn.classList.remove('active'));
                this.classList.add('active');
                isMultiplayer = this.dataset.mode === 'multi';
                updatePlayerDisplay();
                resetGame();
            });
        });
        
        // Navigation toggle for mobile
        navToggle.addEventListener('click', function() {
            navMenu.classList.toggle('active');
        });
        
        // Modal close buttons
        document.querySelectorAll('.close').forEach(button => {
            button.addEventListener('click', function() {
                this.closest('.modal').style.display = 'none';
            });
        });
        
        // Navigation links
        document.getElementById('achievements-link').addEventListener('click', function(e) {
            e.preventDefault();
            showAchievements();
        });
        
        document.getElementById('collection-link').addEventListener('click', function(e) {
            e.preventDefault();
            showCollection();
        });
        
        document.getElementById('daily-challenge-link').addEventListener('click', function(e) {
            e.preventDefault();
            dailyChallenge.style.display = 'block';
        });
        
        document.getElementById('settings-link').addEventListener('click', function(e) {
            e.preventDefault();
            document.getElementById('settings-modal').style.display = 'block';
        });
        
        document.getElementById('how-to-play-link').addEventListener('click', function(e) {
            e.preventDefault();
            document.getElementById('how-to-play-modal').style.display = 'block';
        });
        
        document.getElementById('stats-modal').addEventListener('click', function(e) {
            e.preventDefault();
            showStats();
        });
        
        // Close challenge button
        closeChallengeButton.addEventListener('click', function() {
            dailyChallenge.style.display = 'none';
        });
        
        // Start challenge button
        startChallengeButton.addEventListener('click', function() {
            dailyChallenge.style.display = 'none';
            gameMode = 'medium';
            resetGame();
            // Start timer with 2 minute limit for challenge
        });
        
        // Settings changes
        document.getElementById('sound-toggle-setting').addEventListener('change', function() {
            soundsEnabled = this.checked;
            saveSettings();
        });
        
        document.getElementById('music-toggle').addEventListener('change', function() {
            musicEnabled = this.checked;
            if (musicEnabled) {
                backgroundMusic.play();
            } else {
                backgroundMusic.pause();
            }
            saveSettings();
        });
        
        document.getElementById('animations-toggle').addEventListener('change', function() {
            animationsEnabled = this.checked;
            saveSettings();
        });
        
        document.getElementById('difficulty').addEventListener('change', function() {
            gameMode = this.value;
            saveSettings();
            resetGame();
        });
        
        document.getElementById('card-back').addEventListener('change', function() {
            saveSettings();
            updateCardBacks();
        });
        
        // Share buttons
        document.getElementById('share-twitter').addEventListener('click', shareOnTwitter);
        document.getElementById('share-facebook').addEventListener('click', shareOnFacebook);
        
        // Difficulty dropdown
        document.querySelectorAll('.dropdown-content a').forEach(link => {
            link.addEventListener('click', function(e) {
                e.preventDefault();
                gameMode = this.dataset.level;
                resetGame();
            });
        });
    }
    
    // Set up achievements
    function setupAchievements() {
        const achievements = [
            { id: 1, name: "First Match", description: "Find your first matching pair", icon: "fas fa-star", unlocked: false },
            { id: 2, name: "Speed Demon", description: "Complete a game in under 2 minutes", icon: "fas fa-bolt", unlocked: false },
            { id: 3, name: "Perfect Game", description: "Complete a game with no mismatches", icon: "fas fa-trophy", unlocked: false },
            { id: 4, name: "Multiplayer Master", description: "Win a multiplayer game", icon: "fas fa-users", unlocked: false },
            { id: 5, name: "Collectionist", description: "Unlock 5 card designs", icon: "fas fa-gem", unlocked: false }
        ];
        
        localStorage.setItem('memoryGameAchievements', JSON.stringify(achievements));
    }
    
    // Set up collection
    function setupCollection() {
        const collection = [
            { id: 1, name: "Default Cards", description: "Standard card set", icon: "fas fa-heart", unlocked: true },
            { id: 2, name: "Space Theme", description: "Unlock by winning 5 games", icon: "fas fa-rocket", unlocked: false },
            { id: 3, name: "Animal Theme", description: "Unlock by finding 20 matches", icon: "fas fa-paw", unlocked: false },
            { id: 4, name: "Food Theme", description: "Unlock by completing a daily challenge", icon: "fas fa-utensils", unlocked: false },
            { id: 5, name: "Travel Theme", description: "Unlock by playing 10 games", icon: "fas fa-globe", unlocked: false }
        ];
        
        localStorage.setItem('memoryGameCollection', JSON.stringify(collection));
    }
    
    // Create cards based on game mode
    function createCards() {
        gameBoard.innerHTML = '';
        cards = [];
        flippedCards = [];
        matchedCards = [];
        
        let rows, cols;
        
        switch(gameMode) {
            case 'easy':
                rows = 4;
                cols = 4;
                gameBoard.className = 'game-board';
                break;
            case 'medium':
                rows = 4;
                cols = 6;
                gameBoard.className = 'game-board medium';
                break;
            case 'hard':
                rows = 6;
                cols = 6;
                gameBoard.className = 'game-board hard';
                break;
            default:
                rows = 4;
                cols = 4;
        }
        
        const totalCards = rows * cols;
        const cardValues = [];
        
        // Generate card values (pairs)
        for (let i = 0; i < totalCards / 2; i++) {
            // Use Font Awesome icons
            const icons = [
                'fas fa-heart', 'fas fa-star', 'fas fa-moon', 'fas fa-sun', 
                'fas fa-cloud', 'fas fa-bolt', 'fas fa-flask', 'fas fa-gem',
                'fas fa-leaf', 'fas fa-key', 'fas fa-flag', 'fas fa-tree',
                'fas fa-plane', 'fas fa-car', 'fas fa-ship', 'fas fa-bicycle',
                'fas fa-music', 'fas fa-camera', 'fas fa-gift', 'fas fa-bell'
            ];
            
            const icon = icons[i % icons.length];
            cardValues.push(icon);
            cardValues.push(icon);
        }
        
        // Shuffle the cards
        shuffleArray(cardValues);
        
        // Create card elements
        for (let i = 0; i < totalCards; i++) {
            const card = document.createElement('div');
            card.className = 'card';
            card.dataset.value = cardValues[i];
            
            const cardInner = document.createElement('div');
            cardInner.className = 'card-inner';
            
            const cardFront = document.createElement('div');
            cardFront.className = 'card-front';
            
            const cardBack = document.createElement('div');
            cardBack.className = 'card-back';
            
            const icon = document.createElement('i');
            icon.className = cardValues[i];
            
            cardBack.appendChild(icon);
            cardInner.appendChild(cardFront);
            cardInner.appendChild(cardBack);
            card.appendChild(cardInner);
            
            gameBoard.appendChild(card);
            cards.push(card);
        }
        
        updateCardBacks();
    }
    
    // Update card back designs
    function updateCardBacks() {
        const cardBackDesign = document.getElementById('card-back').value;
        const cardBacks = document.querySelectorAll('.card-back');
        
        cardBacks.forEach(cardBack => {
            // Reset any previous styles
            cardBack.style.background = '';
            cardBack.style.backgroundImage = '';
            
            switch(cardBackDesign) {
                case 'default':
                    cardBack.style.background = 'linear-gradient(135deg, #4e54c8, #8f94fb)';
                    break;
                case 'space':
                    cardBack.style.background = 'linear-gradient(135deg, #0f2027, #203a43, #2c5364)';
                    break;
                case 'wood':
                    cardBack.style.backgroundImage = 'url("https://images.unsplash.com/photo-1599946347371-68eb71f16bb6?ixlib=rb-1.2.1&auto=format&fit=crop&w=500&q=60")';
                    cardBack.style.backgroundSize = 'cover';
                    break;
                case 'marble':
                    cardBack.style.backgroundImage = 'url("https://images.unsplash.com/photo-1543857778-c4a1a569e7bd?ixlib=rb-1.2.1&auto=format&fit=crop&w=500&q=60")';
                    cardBack.style.backgroundSize = 'cover';
                    break;
            }
        });
    }
    
    // Shuffle array (Fisher-Yates algorithm)
    function shuffleArray(array) {
        for (let i = array.length - 1; i > 0; i--) {
            const j = Math.floor(Math.random() * (i + 1));
            [array[i], array[j]] = [array[j], array[i]];
        }
        return array;
    }
    
    // Flip a card
    function flipCard(card) {
        if (!isGameStarted) {
            startGame();
        }
        
        card.classList.add('flipped');
        flippedCards.push(card);
        
        // Play flip sound
        if (soundsEnabled) {
            flipSound.currentTime = 0;
            flipSound.play();
        }
        
        if (flippedCards.length === 2) {
            moves++;
            movesElement.textContent = moves;
            
            // Check for match
            setTimeout(checkMatch, 500);
        }
    }
    
    // Check if flipped cards match
    function checkMatch() {
        const [card1, card2] = flippedCards;
        const isMatch = card1.dataset.value === card2.dataset.value;
        
        if (isMatch) {
            // Cards match
            card1.classList.add('matched');
            card2.classList.add('matched');
            matchedCards.push(card1, card2);
            
            // Update matches count
            const matches = matchedCards.length / 2;
            matchesElement.textContent = matches;
            
            // Update player stats in multiplayer mode
            if (isMultiplayer) {
                playerStats[currentPlayer].matches++;
                playerStats[currentPlayer].score += 10;
                updatePlayerStats();
            }
            
            // Play match sound
            if (soundsEnabled) {
                matchSound.currentTime = 0;
                matchSound.play();
            }
            
            // Check for win
            if (matchedCards.length === cards.length) {
                endGame();
            }
        } else {
            // Cards don't match
            card1.classList.remove('flipped');
            card2.classList.remove('flipped');
            
            // Switch player in multiplayer mode
            if (isMultiplayer) {
                switchPlayer();
            }
        }
        
        flippedCards = [];
    }
    
    // Switch player in multiplayer mode
    function switchPlayer() {
        currentPlayer = currentPlayer === 1 ? 2 : 1;
        updatePlayerDisplay();
    }
    
    // Update player display
    function updatePlayerDisplay() {
        playerElements.forEach(player => {
            player.classList.remove('active');
            if (parseInt(player.dataset.player) === currentPlayer) {
                player.classList.add('active');
            }
        });
        
        // Show/hide player stats based on game mode
        const playerStatsElement = document.getElementById('player-stats');
        playerStatsElement.style.display = isMultiplayer ? 'flex' : 'none';
    }
    
    // Update player stats display
    function updatePlayerStats() {
        playerElements.forEach(player => {
            const playerNum = parseInt(player.dataset.player);
            const scoreElement = player.querySelector('.score span');
            const matchesElement = player.querySelector('.matches span');
            
            scoreElement.textContent = playerStats[playerNum].score;
            matchesElement.textContent = playerStats[playerNum].matches;
        });
    }
    
    // Start the game
    function startGame() {
        isGameStarted = true;
        startTimer();
    }
    
    // Start the timer
    function startTimer() {
        clearInterval(timer);
        gameTime = 0;
        updateTimerDisplay();
        
        timer = setInterval(() => {
            if (!isGamePaused) {
                gameTime++;
                updateTimerDisplay();
            }
        }, 1000);
    }
    
    // Update timer display
    function updateTimerDisplay() {
        const minutes = Math.floor(gameTime / 60);
        const seconds = gameTime % 60;
        timerElement.textContent = `${minutes.toString().padStart(2, '0')}:${seconds.toString().padStart(2, '0')}`;
    }
    
    // End the game
    function endGame() {
        clearInterval(timer);
        isGameStarted = false;
        
        // Update session stats
        sessionStats.gamesPlayed++;
        sessionStats.totalMatches += cards.length / 2;
        
        if (sessionStats.bestTime === 0 || gameTime < sessionStats.bestTime) {
            sessionStats.bestTime = gameTime;
        }
        
        const playerScore = isMultiplayer ? 
            Math.max(playerStats[1].score, playerStats[2].score) : 
            Math.floor(1000 - (moves * 5) - (gameTime * 2));
            
        if (playerScore > sessionStats.bestScore) {
            sessionStats.bestScore = playerScore;
        }
        
        saveStats();
        
        // Determine winner in multiplayer mode
        let winner = 'Player 1';
        if (isMultiplayer) {
            if (playerStats[1].score > playerStats[2].score) {
                winner = 'Player 1';
            } else if (playerStats[2].score > playerStats[1].score) {
                winner = 'Player 2';
            } else {
                winner = 'It\'s a tie!';
            }
        }
        
        // Update win modal
        winTime.textContent = timerElement.textContent;
        winMoves.textContent = moves;
        winnerElement.textContent = winner;
        
        // Play win sound
        if (soundsEnabled) {
            winSound.currentTime = 0;
            winSound.play();
        }
        
        // Show win modal after a short delay
        setTimeout(() => {
            winModal.style.display = 'flex';
            
            // Check for achievements
            checkAchievements();
        }, 1000);
    }
    
    // Check for unlocked achievements
    function checkAchievements() {
        // This would check various game conditions and unlock achievements
        // For demonstration, we'll just show the achievement unlocked message
        document.getElementById('achievement-unlocked').style.display = 'flex';
    }
    
    // Reset the game
    function resetGame() {
        clearInterval(timer);
        isGameStarted = false;
        isGamePaused = false;
        moves = 0;
        gameTime = 0;
        flippedCards = [];
        matchedCards = [];
        
        movesElement.textContent = '0';
        matchesElement.textContent = '0';
        timerElement.textContent = '00:00';
        
        currentPlayer = 1;
        playerStats = {
            1: { score: 0, matches: 0 },
            2: { score: 0, matches: 0 }
        };
        
        updatePlayerStats();
        updatePlayerDisplay();
        
        createCards();
    }
    
    // Toggle theme
    function toggleTheme() {
        document.body.classList.toggle('dark-theme');
    }
    
    // Toggle sound
    function toggleSound() {
        soundsEnabled = !soundsEnabled;
        
        soundToggle.innerHTML = soundsEnabled ? 
            '<i class="fas fa-volume-up"></i> Sound' : 
            '<i class="fas fa-volume-mute"></i> Sound';
            
        saveSettings();
    }
    
    // Show achievements
    function showAchievements() {
        const achievementsModal = document.getElementById('achievements-modal');
        const achievementsList = document.getElementById('achievements-list');
        
        achievementsList.innerHTML = '';
        
        // Get achievements from localStorage
        const achievements = JSON.parse(localStorage.getItem('memoryGameAchievements')) || [];
        
        achievements.forEach(achievement => {
            const achievementElement = document.createElement('div');
            achievementElement.className = 'achievement';
            
            achievementElement.innerHTML = `
                <div class="achievement-icon">
                    <i class="${achievement.icon}"></i>
                </div>
                <div class="achievement-info">
                    <h3>${achievement.name}</h3>
                    <p>${achievement.description}</p>
                </div>
                <div class="achievement-status ${achievement.unlocked ? 'unlocked' : 'locked'}">
                    <i class="fas ${achievement.unlocked ? 'fa-unlock' : 'fa-lock'}"></i>
                </div>
            `;
            
            achievementsList.appendChild(achievementElement);
        });
        
        achievementsModal.style.display = 'block';
    }
    
    // Show collection
    function showCollection() {
        const collectionModal = document.getElementById('collection-modal');
        const collectionGrid = document.getElementById('collection-grid');
        
        collectionGrid.innerHTML = '';
        
        // Get collection from localStorage
        const collection = JSON.parse(localStorage.getItem('memoryGameCollection')) || [];
        
        collection.forEach(item => {
            const collectionItem = document.createElement('div');
            collectionItem.className = `collection-item ${item.unlocked ? 'unlocked' : 'locked'}`;
            
            collectionItem.innerHTML = `
                <div class="collection-icon">
                    <i class="${item.icon}"></i>
                </div>
                <h3>${item.name}</h3>
                <p>${item.description}</p>
                ${!item.unlocked ? '<div class="unlock-condition">Locked</div>' : ''}
            `;
            
            collectionGrid.appendChild(collectionItem);
        });
        
        collectionModal.style.display = 'block';
    }
    
    // Show stats
    function showStats() {
        const statsModal = document.getElementById('stats-modal');
        
        document.getElementById('games-played').textContent = sessionStats.gamesPlayed;
        document.getElementById('total-matches').textContent = sessionStats.totalMatches;
        
        const bestTimeMinutes = Math.floor(sessionStats.bestTime / 60);
        const bestTimeSeconds = sessionStats.bestTime % 60;
        document.getElementById('best-time').textContent = 
            `${bestTimeMinutes.toString().padStart(2, '0')}:${bestTimeSeconds.toString().padStart(2, '0')}`;
            
        document.getElementById('best-score').textContent = sessionStats.bestScore;
        
        statsModal.style.display = 'block';
    }
    
    // Share on Twitter
    function shareOnTwitter() {
        const text = `I just won a game of Memory Master in ${winTime.textContent} with ${moves} moves!`;
        const url = 'https://example.com/memory-master';
        window.open(`https://twitter.com/intent/tweet?text=${encodeURIComponent(text)}&url=${encodeURIComponent(url)}`, '_blank');
    }
    
    // Share on Facebook
    function shareOnFacebook() {
        const url = 'https://example.com/memory-master';
        window.open(`https://www.facebook.com/sharer/sharer.php?u=${encodeURIComponent(url)}`, '_blank');
    }
    
    // Initialize the game board
    createCards();
});