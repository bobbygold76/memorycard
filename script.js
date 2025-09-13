document.addEventListener('DOMContentLoaded', () => {
    // Game variables
    let cards = [];
    let flippedCards = [];
    let matchedPairs = 0;
    let moveCount = 0;
    let gameStarted = false;
    let timerInterval;
    let seconds = 0;
    let isMultiplayer = false;
    let currentPlayer = 1;
    let playerScores = {1: 0, 2: 0};
    let playerMatches = {1: 0, 2: 0};
    let difficulty = 'easy'; // easy: 4x4, medium: 4x6, hard: 6x6
    let soundsEnabled = true;
    let musicEnabled = true;
    let animationsEnabled = true;
    
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
    const playerStats = document.getElementById('player-stats');
    const multiplayerLink = document.getElementById('multiplayer-link');
    const howToPlayLink = document.getElementById('how-to-play-link');
    const howToPlayModal = document.getElementById('how-to-play-modal');
    const achievementsLink = document.getElementById('achievements-link');
    const achievementsModal = document.getElementById('achievements-modal');
    const settingsLink = document.getElementById('settings-link');
    const settingsModal = document.getElementById('settings-modal');
    const collectionLink = document.getElementById('collection-link');
    const collectionModal = document.getElementById('collection-modal');
    const statsModal = document.getElementById('stats-modal');
    const dailyChallenge = document.getElementById('daily-challenge');
    const startChallenge = document.getElementById('start-challenge');
    const closeChallenge = document.getElementById('close-challenge');
    const closeModalButtons = document.querySelectorAll('.close');
    const audioPermission = document.getElementById('audio-permission');
    const enableAudioButton = document.getElementById('enable-audio');
    const soundToggleSetting = document.getElementById('sound-toggle-setting');
    const musicToggle = document.getElementById('music-toggle');
    const animationsToggle = document.getElementById('animations-toggle');
    const cardBackSelect = document.getElementById('card-back');
    const difficultySelect = document.getElementById('difficulty');
    const loadingScreen = document.getElementById('loading-screen');
    const progressBar = document.querySelector('.progress');
    const loadingText = document.querySelector('.loading-text');
    const flipSound = document.getElementById('flip-sound');
    const matchSound = document.getElementById('match-sound');
    const winSound = document.getElementById('win-sound');
    const backgroundMusic = document.getElementById('background-music');
    const shareTwitter = document.getElementById('share-twitter');
    const shareFacebook = document.getElementById('share-facebook');
    const achievementUnlocked = document.getElementById('achievement-unlocked');
    const navToggle = document.getElementById('nav-toggle');
    const dropdowns = document.querySelectorAll('.dropdown');
    const difficultyLinks = document.querySelectorAll('.dropdown-content a');
    
    // Card symbols (Font Awesome icons)
    const cardSymbols = {
        easy: [
            'fa-heart', 'fa-star', 'fa-bolt', 'fa-cloud', 
            'fa-globe', 'fa-moon', 'fa-sun', 'fa-key'
        ],
        medium: [
            'fa-heart', 'fa-star', 'fa-bolt', 'fa-cloud', 
            'fa-globe', 'fa-moon', 'fa-sun', 'fa-key',
            'fa-flag', 'fa-tree', 'fa-bell', 'fa-gem'
        ],
        hard: [
            'fa-heart', 'fa-star', 'fa-bolt', 'fa-cloud', 
            'fa-globe', 'fa-moon', 'fa-sun', 'fa-key',
            'fa-flag', 'fa-tree', 'fa-bell', 'fa-gem',
            'fa-plane', 'fa-car', 'fa-ship', 'fa-bicycle',
            'fa-camera', 'fa-music'
        ]
    };
    
    // Themes
    const themes = [
        { name: 'Default', front: '#1a2a6c', back: '#fdbb2d' },
        { name: 'Sunset', front: '#833ab4', back: '#fd1d1d' },
        { name: 'Ocean', front: '#00416a', back: '#e4e5e6' },
        { name: 'Forest', front: '#2c3e50', back: '#4da0b0' }
    ];
    let currentTheme = 0;
    



     // Enable audio function
    function enableAudio() {
        soundsEnabled = true;
        audioPermission.style.display = 'none';
        soundToggle.innerHTML = '<i class="fas fa-volume-up"></i> Sound: On';
        
        // Try to play background music
        backgroundMusic.play().then(() => {
            console.log("Background music started");
        }).catch(error => {
            console.log("Background music play failed:", error);
        });
    }
    
    // Play sound function with error handling
    function playSound(soundElement) {
        if (!soundsEnabled) return;
        
        // Reset the sound and play it
        soundElement.currentTime = 0;
        soundElement.play().catch(error => {
            console.log("Sound play failed:", error);
        });
    }
    
    // Initialize particles
    function initParticles() {
        if (typeof particlesJS !== 'undefined') {
            particlesJS('particles-js', {
                particles: {
                    number: { value: 30, density: { enable: true, value_area: 800 } },
                    color: { value: "#ffffff" },
                    shape: { type: "circle" },
                    opacity: { value: 0.5, random: true },
                    size: { value: 3, random: true },
                    line_linked: { enable: false },
                    move: { enable: true, speed: 1, direction: "none", random: true, out_mode: "out" }
                },
                interactivity: {
                    detect_on: "canvas",
                    events: { onhover: { enable: true, mode: "repulse" }, onclick: { enable: true, mode: "push" } }
                }
            });
        }
    }
    
    // Simulate loading process
    function simulateLoading() {
        let progress = 0;
        const loadingInterval = setInterval(() => {
            progress += Math.random() * 10;
            if (progress >= 100) {
                progress = 100;
                clearInterval(loadingInterval);
                setTimeout(() => {
                    loadingScreen.style.opacity = '0';
                    setTimeout(() => {
                        loadingScreen.style.display = 'none';
                        if (musicEnabled) {
                            backgroundMusic.play().catch(e => console.log("Audio play failed:", e));
                        }
                    }, 500);
                }, 500);
            }
            progressBar.style.width = `${progress}%`;
            
            // Update loading text based on progress
            if (progress < 30) {
                loadingText.textContent = "Loading assets...";
            } else if (progress < 70) {
                loadingText.textContent = "Initializing game...";
            } else {
                loadingText.textContent = "Almost ready...";
            }
        }, 200);
    }
    
    // Initialize game
    function initGame() {
        // Clear previous game
        clearInterval(timerInterval);
        gameBoard.innerHTML = '';
        flippedCards = [];
        matchedPairs = 0;
        moveCount = 0;
        seconds = 0;
        gameStarted = false;
        currentPlayer = 1;
        playerScores = {1: 0, 2: 0};
        playerMatches = {1: 0, 2: 0};
        
        // Update stats
        movesElement.textContent = '0';
        matchesElement.textContent = '0';
        timerElement.textContent = '00:00';
        
        // Update player stats
        updatePlayerStats();
        
        // Set difficulty class
        gameBoard.className = 'game-board ' + difficulty;
        
        // Create cards based on difficulty
        let cardCount;
        switch(difficulty) {
            case 'easy':
                cardCount = 16; // 4x4 grid
                break;
            case 'medium':
                cardCount = 24; // 4x6 grid
                break;
            case 'hard':
                cardCount = 36; // 6x6 grid
                break;
        }
        
        // Get symbols for current difficulty
        const symbols = cardSymbols[difficulty];
        
        // Create pairs
        cards = [];
        for (let i = 0; i < cardCount / 2; i++) {
            const symbol = symbols[i % symbols.length];
            cards.push(symbol);
            cards.push(symbol);
        }
        
        // Shuffle cards
        shuffleCards(cards);
        
        // Create card elements
        cards.forEach((symbol, index) => {
            const card = document.createElement('div');
            card.className = 'card';
            card.dataset.symbol = symbol;
            card.dataset.index = index;
            
            const cardInner = document.createElement('div');
            cardInner.className = 'card-inner';
            
            const cardFront = document.createElement('div');
            cardFront.className = 'card-front';
            
            const cardBack = document.createElement('div');
            cardBack.className = 'card-back';
            const icon = document.createElement('i');
            icon.className = `fas ${symbol}`;
            cardBack.appendChild(icon);
            
            cardInner.appendChild(cardFront);
            cardInner.appendChild(cardBack);
            card.appendChild(cardInner);
            
            card.addEventListener('click', () => flipCard(card));
            gameBoard.appendChild(card);
        });
        
        // Apply current theme
        applyTheme();
        
        // Update multiplayer UI
        updateMultiplayerUI();
    }
    
    // Shuffle cards using Fisher-Yates algorithm
    function shuffleCards(array) {
        for (let i = array.length - 1; i > 0; i--) {
            const j = Math.floor(Math.random() * (i + 1));
            [array[i], array[j]] = [array[j], array[i]];
        }
    }
    
    // Flip card
    function flipCard(card) {
        // Don't allow flipping if already flipped or matched
        if (card.classList.contains('flipped') || card.classList.contains('matched')) {
            return;
        }
        
        // Play flip sound
        if (soundsEnabled) {
            flipSound.currentTime = 0;
            flipSound.play().catch(e => console.log("Audio play failed:", e));
        }
        
        // Start timer on first flip
        if (!gameStarted) {
            startTimer();
            gameStarted = true;
        }
        
        // Flip the card
        card.classList.add('flipped');
        flippedCards.push(card);
        
        // Check for match if two cards are flipped
        if (flippedCards.length === 2) {
            moveCount++;
            movesElement.textContent = moveCount;
            
            const [card1, card2] = flippedCards;
            
            if (card1.dataset.symbol === card2.dataset.symbol) {
                // Match found
                card1.classList.add('matched');
                card2.classList.add('matched');
                flippedCards = [];
                matchedPairs++;
                matchesElement.textContent = matchedPairs;
                
                // Play match sound
                if (soundsEnabled) {
                    matchSound.currentTime = 0;
                    matchSound.play().catch(e => console.log("Audio play failed:", e));
                }
                
                // Create particle effect for match
                createParticleEffect(card1);
                
                // Update player scores in multiplayer mode
                if (isMultiplayer) {
                    playerScores[currentPlayer] += 10;
                    playerMatches[currentPlayer]++;
                    updatePlayerStats();
                }
                
                // Check for win
                if (matchedPairs === cards.length / 2) {
                    endGame();
                } else if (isMultiplayer) {
                    // Player gets another turn after a match
                    setTimeout(() => {
                        showNotification(`Player ${currentPlayer} found a match and gets another turn!`);
                    }, 500);
                }
            } else {
                // No match, flip back after delay and switch players in multiplayer
                setTimeout(() => {
                    card1.classList.remove('flipped');
                    card2.classList.remove('flipped');
                    flippedCards = [];
                    
                    // Switch players in multiplayer mode
                    if (isMultiplayer) {
                        switchPlayer();
                    }
                }, 1000);
            }
        }
    }
    
    // Create particle effect for matches
    function createParticleEffect(card) {
        if (!animationsEnabled) return;
        
        const rect = card.getBoundingClientRect();
        const x = rect.left + rect.width / 2;
        const y = rect.top + rect.height / 2;
        
        for (let i = 0; i < 15; i++) {
            const particle = document.createElement('div');
            particle.className = 'particle';
            particle.style.cssText = `
                position: fixed;
                width: 6px;
                height: 6px;
                background: var(--accent);
                border-radius: 50%;
                top: ${y}px;
                left: ${x}px;
                pointer-events: none;
                z-index: 100;
            `;
            
            document.body.appendChild(particle);
            
            // Animate particle
            const angle = Math.random() * Math.PI * 2;
            const speed = 2 + Math.random() * 3;
            const size = 3 + Math.random() * 4;
            const duration = 1000 + Math.random() * 500;
            
            particle.style.width = `${size}px`;
            particle.style.height = `${size}px`;
            
            const animation = particle.animate([
                { 
                    transform: `translate(0, 0)`,
                    opacity: 1
                },
                { 
                    transform: `translate(${Math.cos(angle) * 100}px, ${Math.sin(angle) * 100}px)`,
                    opacity: 0
                }
            ], {
                duration: duration,
                easing: 'cubic-bezier(0, .9, .57, 1)'
            });
            
            animation.onfinish = () => {
                particle.remove();
            };
        }
    }
    
    // Show notification
    function showNotification(message) {
        // Create notification element
        const notification = document.createElement('div');
        notification.className = 'notification';
        notification.textContent = message;
        notification.style.cssText = `
            position: fixed;
            top: 100px;
            left: 50%;
            transform: translateX(-50%);
            background: rgba(0, 0, 0, 0.8);
            color: white;
            padding: 10px 20px;
            border-radius: 5px;
            z-index: 1000;
            opacity: 0;
            transition: opacity 0.3s;
        `;
        
        document.body.appendChild(notification);
        
        // Animate in
        setTimeout(() => {
            notification.style.opacity = '1';
        }, 10);
        
        // Animate out after delay
        setTimeout(() => {
            notification.style.opacity = '0';
            setTimeout(() => {
                notification.remove();
            }, 300);
        }, 3000);
    }
    
    // Switch players in multiplayer mode
    function switchPlayer() {
        // Remove active class from current player
        document.querySelector(`.player[data-player="${currentPlayer}"]`).classList.remove('active');
        
        // Switch to other player
        currentPlayer = currentPlayer === 1 ? 2 : 1;
        
        // Add active class to new current player
        document.querySelector(`.player[data-player="${currentPlayer}"]`).classList.add('active');
        
        // Alert player change
        showNotification(`Player ${currentPlayer}'s turn!`);
    }
    
    // Update player stats display
    function updatePlayerStats() {
        const player1Score = document.querySelector('.player[data-player="1"] .score span');
        const player1Matches = document.querySelector('.player[data-player="1"] .matches span');
        const player2Score = document.querySelector('.player[data-player="2"] .score span');
        const player2Matches = document.querySelector('.player[data-player="2"] .matches span');
        
        player1Score.textContent = playerScores[1];
        player1Matches.textContent = playerMatches[1];
        player2Score.textContent = playerScores[2];
        player2Matches.textContent = playerMatches[2];
    }
    
    // Update multiplayer UI
    function updateMultiplayerUI() {
        if (isMultiplayer) {
            playerStats.style.display = 'flex';
            document.querySelector('.player[data-player="1"]').classList.add('active');
            document.querySelector('.player[data-player="2"]').classList.remove('active');
            multiplayerLink.style.background = 'rgba(253, 187, 45, 0.3)';
        } else {
            playerStats.style.display = 'none';
            multiplayerLink.style.background = 'transparent';
        }
    }
    
    // Start timer
    function startTimer() {
        clearInterval(timerInterval);
        timerInterval = setInterval(() => {
            seconds++;
            const minutes = Math.floor(seconds / 60);
            const remainingSeconds = seconds % 60;
            timerElement.textContent = `${minutes.toString().padStart(2, '0')}:${remainingSeconds.toString().padStart(2, '0')}`;
        }, 1000);
    }
    
    // End game
    function endGame() {
        clearInterval(timerInterval);
        
        // Play win sound
        if (soundsEnabled) {
            winSound.currentTime = 0;
            winSound.play().catch(e => console.log("Audio play failed:", e));
        }
        
        // Determine winner in multiplayer mode
        let winner = 'Player 1';
        if (isMultiplayer) {
            if (playerMatches[1] > playerMatches[2]) {
                winner = 'Player 1';
            } else if (playerMatches[2] > playerMatches[1]) {
                winner = 'Player 2';
            } else {
                winner = 'It\'s a tie!';
            }
        }
        
        // Update win modal
        winTime.textContent = timerElement.textContent;
        winMoves.textContent = moveCount;
        winnerElement.textContent = winner;
        
        // Show achievement if conditions are met
        if (moveCount <= cards.length / 2) {
            achievementUnlocked.style.display = 'flex';
        } else {
            achievementUnlocked.style.display = 'none';
        }
        
        // Show win modal after a short delay
        setTimeout(() => {
            winModal.classList.add('show');
        }, 1000);
    }
    
    // Change theme
    function changeTheme() {
        currentTheme = (currentTheme + 1) % themes.length;
        applyTheme();
    }
    
    // Apply current theme
    function applyTheme() {
        const theme = themes[currentTheme];
        document.documentElement.style.setProperty('--card-front', theme.front);
        document.documentElement.style.setProperty('--card-back', theme.back);
        
        // Update card colors
        const cardFronts = document.querySelectorAll('.card-front');
        const cardBacks = document.querySelectorAll('.card-back');
        
        cardFronts.forEach(card => {
            card.style.background = `linear-gradient(45deg, ${theme.front}, color-mix(in srgb, ${theme.front} 80%, black 20%))`;
        });
        
        cardBacks.forEach(card => {
            card.style.background = `linear-gradient(45deg, ${theme.back}, color-mix(in srgb, ${theme.back} 80%, white 20%))`;
        });
    }
    
    // Toggle multiplayer mode
    function toggleMultiplayer() {
        isMultiplayer = !isMultiplayer;
        initGame();
    }
    
    // Set difficulty level
    function setDifficulty(level) {
        difficulty = level;
        initGame();
    }
    
    // Show how to play modal
    function showHowToPlay() {
        howToPlayModal.classList.add('show');
    }
    
    // Show achievements modal
    function showAchievements() {
        achievementsModal.classList.add('show');
    }
    
    // Show settings modal
    function showSettings() {
        settingsModal.classList.add('show');
    }
    
    // Show collection modal
    function showCollection() {
        collectionModal.classList.add('show');
    }
    
    // Show stats modal
    function showStats() {
        statsModal.classList.add('show');
    }
    
    // Close modal
    function closeModals() {
        document.querySelectorAll('.modal').forEach(modal => {
            modal.classList.remove('show');
        });
        winModal.classList.remove('show');
    }
    
    // Toggle sounds
    function toggleSounds() {
        soundsEnabled = !soundsEnabled;
        soundToggle.innerHTML = soundsEnabled ? '<i class="fas fa-volume-up"></i> Sound' : '<i class="fas fa-volume-mute"></i> Sound';
        soundToggleSetting.checked = soundsEnabled;
    }
    
    // Toggle music
    function toggleMusic() {
        musicEnabled = !musicEnabled;
        if (musicEnabled) {
            backgroundMusic.play().catch(e => console.log("Audio play failed:", e));
        } else {
            backgroundMusic.pause();
        }
    }
    
    // Toggle animations
    function toggleAnimations() {
        animationsEnabled = !animationsEnabled;
    }
    
    // Change card back design
    function changeCardBack() {
        // This would require additional card back images
        console.log("Card back changed to:", cardBackSelect.value);
    }
    
    // Share on Twitter
    function shareOnTwitter() {
        const text = `I just completed the Memory Card Game in ${timerElement.textContent} with ${moveCount} moves!`;
        const url = window.location.href;
        window.open(`https://twitter.com/intent/tweet?text=${encodeURIComponent(text)}&url=${encodeURIComponent(url)}`, '_blank');
    }
    
    // Share on Facebook
    function shareOnFacebook() {
        const url = window.location.href;
        window.open(`https://www.facebook.com/sharer/sharer.php?u=${encodeURIComponent(url)}`, '_blank');
    }
    
    // Toggle dropdown on mobile
    function toggleDropdown() {
        this.classList.toggle('active');
    }
    
    // Event listeners
    resetButton.addEventListener('click', initGame);
    themeButton.addEventListener('click', changeTheme);
    soundToggle.addEventListener('click', toggleSounds);
    playAgainButton.addEventListener('click', () => {
        winModal.classList.remove('show');
        initGame();
    });
    multiplayerLink.addEventListener('click', (e) => {
        e.preventDefault();
        toggleMultiplayer();
    });
    howToPlayLink.addEventListener('click', (e) => {
        e.preventDefault();
        showHowToPlay();
    });
    achievementsLink.addEventListener('click', (e) => {
        e.preventDefault();
        showAchievements();
    });
    settingsLink.addEventListener('click', (e) => {
        e.preventDefault();
        showSettings();
    });
    collectionLink.addEventListener('click', (e) => {
        e.preventDefault();
        showCollection();
    });
    closeChallenge.addEventListener('click', () => {
        dailyChallenge.style.display = 'none';
    });
    startChallenge.addEventListener('click', () => {
        setDifficulty('medium');
        dailyChallenge.style.display = 'none';
    });
    
    // Close modal buttons
    closeModalButtons.forEach(button => {
        button.addEventListener('click', closeModals);
    });
    
    // Sound settings
    soundToggleSetting.addEventListener('change', toggleSounds);
    musicToggle.addEventListener('change', toggleMusic);
    animationsToggle.addEventListener('change', toggleAnimations);
    cardBackSelect.addEventListener('change', changeCardBack);
    difficultySelect.addEventListener('change', () => {
        setDifficulty(difficultySelect.value);
    });
    
    // Share buttons
    shareTwitter.addEventListener('click', shareOnTwitter);
    shareFacebook.addEventListener('click', shareOnFacebook);
    
    // Difficulty level event listeners
    difficultyLinks.forEach(link => {
        link.addEventListener('click', (e) => {
            e.preventDefault();
            const level = e.target.getAttribute('data-level');
            setDifficulty(level);
            
            // Close dropdown on mobile
            document.querySelectorAll('.dropdown').forEach(dropdown => {
                dropdown.classList.remove('active');
            });
        });
    });
    
    // Mobile menu toggle
    navToggle.addEventListener('change', () => {
        document.querySelector('.nav-menu').classList.toggle('active', navToggle.checked);
    });
    
    // Dropdown toggle for mobile
    dropdowns.forEach(dropdown => {
        const link = dropdown.querySelector('.nav-link');
        link.addEventListener('click', (e) => {
            if (window.innerWidth <= 768) {
                e.preventDefault();
                dropdown.classList.toggle('active');
            }
        });
    });
    
    // Close modals when clicking outside
    window.addEventListener('click', (e) => {
        if (e.target.classList.contains('modal')) {
            closeModals();
        }
        if (e.target === winModal) {
            winModal.classList.remove('show');
        }
    });
    
    // Initialize the game
    initParticles();
    simulateLoading();
    initGame();
});