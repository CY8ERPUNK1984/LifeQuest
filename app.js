// Game configuration
const CONFIG = {
    xpPerLevel: 100,
    taskXP: {
        's': 10,
        'm': 25,
        'l': 50
    },
    goalXP: {
        's': 20,
        'm': 50,
        'l': 100
    }
};

// App state
let state = {
    user: {
        id: null,
        name: 'Пользователь',
        level: 1,
        xp: 0,
        totalXP: 0,
        avatar: '1'
    },
    tasks: [],
    goals: [],
    rewards: [],
    stats: {
        completedTasks: 0
    }
};

// Load data from localStorage if available
function loadState() {
    // Устанавливаем аутентификационные токены
    localStorage.setItem('lifeQuestAuthToken', 'fixed-token-123');
    localStorage.setItem('lifeQuestUserId', 'user1');
    
    // Загружаем задачи, цели и награды
    const tasks = JSON.parse(localStorage.getItem('lifeQuestTasks') || '[]');
    const goals = JSON.parse(localStorage.getItem('lifeQuestGoals') || '[]');
    const rewards = JSON.parse(localStorage.getItem('lifeQuestRewards') || '[]');
    
    // Если задач нет, создаем демо-задачи
    if (!tasks.length) {
        tasks.push(
            {
                id: 'task1',
                name: 'Изучить JavaScript',
                size: 'm',
                completed: false,
                createdAt: new Date().toISOString()
            },
            {
                id: 'task2',
                name: 'Создать пет-проект',
                size: 'l',
                completed: false,
                createdAt: new Date().toISOString()
            }
        );
        localStorage.setItem('lifeQuestTasks', JSON.stringify(tasks));
    }
    
    // Проверяем saved state
    const savedState = localStorage.getItem('gamifyLifeState');
    if (savedState) {
        // Загружаем сохраненное состояние, но не перезаписываем пользователя
        const savedStateObj = JSON.parse(savedState);
        if (savedStateObj.tasks) state.tasks = savedStateObj.tasks;
        if (savedStateObj.goals) state.goals = savedStateObj.goals;
        if (savedStateObj.rewards) state.rewards = savedStateObj.rewards;
        if (savedStateObj.stats) state.stats = savedStateObj.stats;
        
        // Сохраняем наши данные пользователя
        state.user = {
            id: 'user1',
            name: 'Степан',
            level: savedStateObj.user && savedStateObj.user.level || 1,
            xp: savedStateObj.user && savedStateObj.user.xp || 0,
            totalXP: savedStateObj.user && savedStateObj.user.totalXP || 0,
            avatar: '1'
        };
    } else {
        // Создаем новое состояние
        state.user = {
            id: 'user1',
            name: 'Степан',
            level: 1,
            xp: 0,
            totalXP: 0,
            avatar: '1'
        };
        state.tasks = tasks;
        state.goals = goals;
        state.rewards = rewards;
    }
    
    // Обновляем интерфейс
    updateUI();
}

// Save state to localStorage
function saveState() {
    localStorage.setItem('gamifyLifeState', JSON.stringify(state));
}

// DOM Elements
const elements = {
    userName: document.getElementById('user-name'),
    userAvatar: document.getElementById('user-avatar'),
    logoutBtn: document.getElementById('logout-btn'),
    currentLevel: document.getElementById('current-level'),
    xpNumber: document.getElementById('xp-number'),
    currentXP: document.getElementById('current-xp'),
    nextLevelXP: document.getElementById('next-level-xp'),
    xpProgressBar: document.getElementById('xp-progress-bar'),
    tasksContainer: document.getElementById('tasks-container'),
    goalsContainer: document.getElementById('goals-container'),
    rewardsContainer: document.getElementById('rewards-container'),
    completedTasks: document.getElementById('completed-tasks'),
    totalXP: document.getElementById('total-xp'),
    tabs: document.querySelectorAll('.tab'),
    tabContents: document.querySelectorAll('.tab-content'),
    addTaskBtn: document.getElementById('add-task-btn'),
    addGoalBtn: document.getElementById('add-goal-btn'),
    addRewardBtn: document.getElementById('add-reward-btn'),
    taskModal: document.getElementById('task-modal'),
    closeModal: document.querySelector('.close-modal'),
    taskForm: document.getElementById('task-form'),
    taskNameInput: document.getElementById('task-name'),
    confettiCanvas: document.getElementById('confetti-canvas')
};

// Initialize tabs
elements.tabs.forEach(tab => {
    tab.addEventListener('click', () => {
        const tabName = tab.getAttribute('data-tab');
        
        // Update active tab
        elements.tabs.forEach(t => t.classList.remove('active'));
        tab.classList.add('active');
        
        // Update active content
        elements.tabContents.forEach(content => {
            content.classList.remove('active');
        });
        document.getElementById(`${tabName}-content`).classList.add('active');
        
        // Инициализируем модуль привычек при переключении на соответствующую вкладку
        if (tabName === 'habits' && typeof habitsModule !== 'undefined') {
            habitsModule.init();
        }
        
        // Добавляем прямой обработчик события клика для кнопки после загрузки DOM
        setTimeout(() => {
            if (tabName === 'habits') {
                const createFirstHabitBtn = document.getElementById('create-first-habit');
                if (createFirstHabitBtn) {
                    // Для отладки
                    console.log('Найдена кнопка create-first-habit');
                    
                    // Удаляем все существующие обработчики событий
                    const newBtn = createFirstHabitBtn.cloneNode(true);
                    createFirstHabitBtn.parentNode.replaceChild(newBtn, createFirstHabitBtn);
                    
                    // Добавляем новый обработчик напрямую
                    newBtn.onclick = function() {
                        console.log('Кнопка create-first-habit нажата');
                        if (typeof habitsModule !== 'undefined') {
                            habitsModule.openHabitModal();
                        } else {
                            console.error('habitsModule не определен');
                        }
                        return false; // Предотвращаем всплытие события
                    };
                }
            }
        }, 500);
    });
});

// Modal functionality
elements.addTaskBtn.addEventListener('click', () => {
    document.getElementById('modal-title').textContent = 'Добавить задачу';
    elements.taskForm.setAttribute('data-type', 'task');
    elements.taskModal.style.display = 'flex';
    elements.taskNameInput.focus();
});

elements.addGoalBtn.addEventListener('click', () => {
    document.getElementById('modal-title').textContent = 'Добавить цель';
    elements.taskForm.setAttribute('data-type', 'goal');
    elements.taskModal.style.display = 'flex';
    elements.taskNameInput.focus();
});

elements.addRewardBtn.addEventListener('click', () => {
    document.getElementById('modal-title').textContent = 'Добавить награду';
    elements.taskForm.setAttribute('data-type', 'reward');
    elements.taskModal.style.display = 'flex';
    elements.taskNameInput.focus();
});

elements.closeModal.addEventListener('click', () => {
    elements.taskModal.style.display = 'none';
});

window.addEventListener('click', (e) => {
    if (e.target === elements.taskModal) {
        elements.taskModal.style.display = 'none';
    }
});

// Form submission
elements.taskForm.addEventListener('submit', (e) => {
    e.preventDefault();
    
    const name = elements.taskNameInput.value.trim();
    const size = document.querySelector('input[name="task-size"]:checked').value;
    const formType = elements.taskForm.getAttribute('data-type');
    
    if (name) {
        if (formType === 'goal') {
            addGoal(name, size);
        } else if (formType === 'reward') {
            addReward(name, size);
        } else {
            addTask(name, size);
        }
        elements.taskNameInput.value = '';
        elements.taskModal.style.display = 'none';
    }
});

// Add a new task
function addTask(name, size) {
    const xp = CONFIG.taskXP[size];
    const task = {
        id: Date.now(),
        name,
        size,
        xp,
        completed: false,
        createdAt: new Date().toISOString()
    };
    
    state.tasks.push(task);
    saveState();
    renderTasks();
}

// Render tasks
function renderTasks() {
    elements.tasksContainer.innerHTML = '';
    
    const activeTasks = state.tasks.filter(task => !task.completed);
    
    if (activeTasks.length === 0) {
        elements.tasksContainer.innerHTML = '<p class="empty-message">Нет активных задач. Добавьте новую задачу!</p>';
        return;
    }
    
    activeTasks.forEach(task => {
        const taskElement = document.createElement('div');
        taskElement.className = 'task-item';
        taskElement.innerHTML = `
            <div class="task-checkbox ${task.completed ? 'checked' : ''}"></div>
            <div class="task-content">
                <div class="task-name">${task.name}</div>
                <div>
                    <span class="task-size size-${task.size}">${task.size.toUpperCase()}</span>
                    <span class="task-xp">${task.xp} XP</span>
                </div>
            </div>
        `;
        
        const checkbox = taskElement.querySelector('.task-checkbox');
        checkbox.addEventListener('click', () => {
            completeTask(task.id);
        });
        
        elements.tasksContainer.appendChild(taskElement);
    });
}

// Complete a task
function completeTask(taskId) {
    const taskIndex = state.tasks.findIndex(task => task.id === taskId);
    if (taskIndex !== -1) {
        const task = state.tasks[taskIndex];
        task.completed = true;
        task.completedAt = new Date().toISOString();
        
        // Update stats
        state.stats.completedTasks++;
        
        // Add XP
        addXP(task.xp);
        
        // Show confetti
        triggerConfetti();
        
        saveState();
        renderTasks();
        updateUI();
    }
}

// Add XP and handle level ups
function addXP(amount) {
    state.user.xp += amount;
    state.user.totalXP += amount;
    
    // Check for level up
    const xpForNextLevel = CONFIG.xpPerLevel * state.user.level;
    if (state.user.xp >= xpForNextLevel) {
        state.user.level++;
        state.user.xp -= xpForNextLevel;
        
        // Show level up message
        showLevelUpMessage();
    }
    
    updateUI();
}

// Show level up message
function showLevelUpMessage() {
    const levelUpMessage = document.createElement('div');
    levelUpMessage.className = 'level-up-message';
    levelUpMessage.innerHTML = `
        <h3>Уровень повышен!</h3>
        <p>Поздравляем! Вы достигли уровня ${state.user.level}</p>
    `;
    
    document.body.appendChild(levelUpMessage);
    
    // Extra confetti for level up
    triggerConfetti();
    
    setTimeout(() => {
        levelUpMessage.classList.add('show');
    }, 100);
    
    setTimeout(() => {
        levelUpMessage.classList.remove('show');
        setTimeout(() => {
            document.body.removeChild(levelUpMessage);
        }, 500);
    }, 3000);
}

// Trigger confetti animation
function triggerConfetti() {
    confetti({
        particleCount: 100,
        spread: 70,
        origin: { y: 0.6 }
    });
}

// Update UI with current state
function updateUI() {
    // Update user info
    elements.userName.textContent = state.user.name;
    elements.currentLevel.textContent = state.user.level;
    elements.xpNumber.textContent = state.user.totalXP;
    
    // Update avatar if element exists
    if (elements.userAvatar) {
        elements.userAvatar.src = `images/avatars/avatar${state.user.avatar}.svg`;
    }
    
    // Update progress bar
    const xpForNextLevel = CONFIG.xpPerLevel * state.user.level;
    const progressPercentage = (state.user.xp / xpForNextLevel) * 100;
    elements.xpProgressBar.style.width = `${progressPercentage}%`;
    elements.currentXP.textContent = state.user.xp;
    elements.nextLevelXP.textContent = xpForNextLevel;
    
    // Update stats
    elements.completedTasks.textContent = state.stats.completedTasks;
    elements.totalXP.textContent = state.user.totalXP;
}

// Initialize the app
function init() {
    loadState();
    renderTasks();
    renderGoals();
    renderRewards();
    updateUI();
    setupLogout();
    initAudioPlayer();
    
    // Add CSS for level up message
    const style = document.createElement('style');
    style.textContent = `
        .level-up-message {
            position: fixed;
            top: 50%;
            left: 50%;
            transform: translate(-50%, -50%) scale(0.8);
            background-color: white;
            border-radius: 16px;
            padding: 20px;
            text-align: center;
            box-shadow: 0 5px 20px rgba(0, 0, 0, 0.2);
            z-index: 2001;
            opacity: 0;
            transition: all 0.3s ease;
        }
        
        .level-up-message.show {
            opacity: 1;
            transform: translate(-50%, -50%) scale(1);
        }
        
        .level-up-message h3 {
            color: var(--primary-color);
            margin-bottom: 10px;
        }
        
        .empty-message {
            text-align: center;
            color: var(--light-text);
            padding: 20px;
        }
        
        .reward-claimed-message {
            position: fixed;
            top: 50%;
            left: 50%;
            transform: translate(-50%, -50%) scale(0.8);
            background-color: white;
            border-radius: 16px;
            padding: 20px;
            text-align: center;
            box-shadow: 0 5px 20px rgba(0, 0, 0, 0.2);
            z-index: 2001;
            opacity: 0;
            transition: all 0.3s ease;
        }
        
        .reward-claimed-message.show {
            opacity: 1;
            transform: translate(-50%, -50%) scale(1);
        }
        
        .reward-claimed-message h3 {
            color: var(--secondary-color);
            margin-bottom: 10px;
        }
    `;
    document.head.appendChild(style);
}

// Add a new goal
function addGoal(name, size) {
    const xp = CONFIG.goalXP[size];
    const goal = {
        id: Date.now(),
        name,
        size,
        xp,
        completed: false,
        progress: 0,
        createdAt: new Date().toISOString()
    };
    
    state.goals.push(goal);
    saveState();
    renderGoals();
}

// Render goals
function renderGoals() {
    elements.goalsContainer.innerHTML = '';
    
    if (state.goals.length === 0) {
        elements.goalsContainer.innerHTML = '<p class="empty-message">Нет активных целей. Добавьте новую цель!</p>';
        return;
    }
    
    state.goals.forEach(goal => {
        const goalElement = document.createElement('div');
        goalElement.className = 'goal-item';
        goalElement.innerHTML = `
            <div class="goal-header">
                <div class="goal-name">${goal.name}</div>
                <div>
                    <span class="goal-size size-${goal.size}">${goal.size.toUpperCase()}</span>
                    <span class="goal-xp">${goal.xp} XP</span>
                </div>
            </div>
            <div class="goal-progress-container">
                <div class="goal-progress" style="width: ${goal.progress}%"></div>
            </div>
            <div class="goal-actions">
                <button class="progress-btn">Прогресс +10%</button>
                <button class="complete-btn" ${goal.progress < 100 ? 'disabled' : ''}>Завершить</button>
            </div>
        `;
        
        const progressBtn = goalElement.querySelector('.progress-btn');
        progressBtn.addEventListener('click', () => {
            updateGoalProgress(goal.id, 10);
        });
        
        const completeBtn = goalElement.querySelector('.complete-btn');
        completeBtn.addEventListener('click', () => {
            if (goal.progress >= 100) {
                completeGoal(goal.id);
            }
        });
        
        elements.goalsContainer.appendChild(goalElement);
    });
}

// Update goal progress
function updateGoalProgress(goalId, amount) {
    const goalIndex = state.goals.findIndex(goal => goal.id === goalId);
    if (goalIndex !== -1) {
        const goal = state.goals[goalIndex];
        goal.progress = Math.min(100, goal.progress + amount);
        
        saveState();
        renderGoals();
    }
}

// Complete a goal
function completeGoal(goalId) {
    const goalIndex = state.goals.findIndex(goal => goal.id === goalId);
    if (goalIndex !== -1) {
        const goal = state.goals[goalIndex];
        goal.completed = true;
        goal.completedAt = new Date().toISOString();
        
        // Add XP
        addXP(goal.xp);
        
        // Show confetti
        triggerConfetti();
        
        // Remove goal from active list
        state.goals.splice(goalIndex, 1);
        
        saveState();
        renderGoals();
        updateUI();
    }
}

// Add a new reward
function addReward(name, size) {
    let cost;
    switch(size) {
        case 's': cost = 50; break;
        case 'm': cost = 100; break;
        case 'l': cost = 200; break;
        default: cost = 50;
    }
    
    const reward = {
        id: Date.now(),
        name,
        size,
        cost,
        createdAt: new Date().toISOString()
    };
    
    state.rewards.push(reward);
    saveState();
    renderRewards();
}

// Render rewards
function renderRewards() {
    elements.rewardsContainer.innerHTML = '';
    
    if (state.rewards.length === 0) {
        elements.rewardsContainer.innerHTML = '<p class="empty-message">Нет доступных наград. Добавьте новую награду!</p>';
        return;
    }
    
    state.rewards.forEach(reward => {
        const rewardElement = document.createElement('div');
        rewardElement.className = `reward-item size-${reward.size}`;
        
        // Проверяем актуальное состояние XP при каждом рендеринге
        const canAfford = state.user.totalXP >= reward.cost;
        
        rewardElement.innerHTML = `
            <div class="reward-content">
                <div class="reward-name">${reward.name}</div>
                <div class="reward-cost ${canAfford ? 'can-afford' : ''}">
                    <span class="cost-value">${reward.cost} XP</span>
                </div>
            </div>
            <button class="claim-btn" ${canAfford ? '' : 'disabled'}>Получить</button>
        `;
        
        const claimBtn = rewardElement.querySelector('.claim-btn');
        claimBtn.addEventListener('click', (e) => {
            e.preventDefault(); // Предотвращаем стандартное поведение кнопки
            if (state.user.totalXP >= reward.cost) { // Проверяем актуальное состояние XP в момент клика
                claimReward(reward.id);
            } else {
                alert('Недостаточно XP для получения этой награды!');
            }
        });
        
        elements.rewardsContainer.appendChild(rewardElement);
    });
}

// Claim a reward
function claimReward(rewardId) {
    const rewardIndex = state.rewards.findIndex(reward => reward.id === rewardId);
    if (rewardIndex !== -1) {
        const reward = state.rewards[rewardIndex];
        
        if (state.user.totalXP >= reward.cost) {
            // Deduct XP
            state.user.totalXP -= reward.cost;
            
            // Show reward claimed message
            showRewardClaimedMessage(reward.name);
            
            // Trigger confetti
            triggerConfetti();
            
            // Обновляем состояние и интерфейс
            saveState();
            updateUI();
            renderRewards();
            
            console.log(`Награда '${reward.name}' получена! Потрачено ${reward.cost} XP. Осталось ${state.user.totalXP} XP.`);
        } else {
            alert('Недостаточно XP для получения этой награды!');
        }
    }
}

// Show reward claimed message
function showRewardClaimedMessage(rewardName) {
    const rewardClaimedMessage = document.createElement('div');
    rewardClaimedMessage.className = 'reward-claimed-message';
    rewardClaimedMessage.innerHTML = `
        <h3>Награда получена!</h3>
        <p>Вы получили: ${rewardName}</p>
        <p>Наслаждайтесь своей наградой!</p>
    `;
    
    document.body.appendChild(rewardClaimedMessage);
    
    setTimeout(() => {
        rewardClaimedMessage.classList.add('show');
    }, 100);
    
    setTimeout(() => {
        rewardClaimedMessage.classList.remove('show');
        setTimeout(() => {
            document.body.removeChild(rewardClaimedMessage);
        }, 500);
    }, 3000);
}

// Start the app when DOM is loaded
document.addEventListener('DOMContentLoaded', init);

// Audio Player Functionality
const audioPlayer = {
    elements: {
        container: document.querySelector('.audio-player-header-fixed'),
        playPauseBtn: document.getElementById('play-pause-btn'),
        playPauseIcon: document.querySelector('#play-pause-btn i'),
        volumeSlider: document.getElementById('volume-slider'),
        trackSelect: document.getElementById('audio-track-select'),
        repeatBtn: document.getElementById('repeat-button')
    },
    state: {
        currentAudio: null,
        currentTrack: null,
        isPlaying: false,
        volume: 0.7,
        audioSources: {
            aura: 'audio/sounds/aura.mp3'
        }
    },
    init() {
        // Check if elements exist
        if (!this.elements.container) return;
        
        // Setup event listeners
        this.elements.playPauseBtn.addEventListener('click', () => this.togglePlayPause());
        this.elements.volumeSlider.addEventListener('input', (e) => this.adjustVolume(e.target.value));
        
        // Track selection
        this.elements.trackSelect.addEventListener('change', (e) => {
            this.selectTrack(e.target.value);
        });
        
        // Initialize volume
        this.adjustVolume(this.elements.volumeSlider.value);
        
        // Create audio objects for preloading
        this.preloadAudios();
    },
    preloadAudios() {
        // For each track, create an audio element for later use
        Object.keys(this.state.audioSources).forEach(key => {
            const src = this.state.audioSources[key];
            const audio = new Audio();
            audio.src = src;
            audio.loop = this.state.isRepeatEnabled;
            audio.preload = 'auto';
            audio.volume = this.state.volume;
            
            // Add event listener for when metadata is loaded
            audio.addEventListener('loadedmetadata', () => {
                if (this.state.currentTrack === key) {
                    this.updateTrackDuration();
                }
            });
            
            // Add event listener for when track ends
            audio.addEventListener('ended', () => {
                if (!this.state.isRepeatEnabled) {
                    this.pauseAudio();
                    this.state.isPlaying = false;
                    this.updatePlayPauseButton();
                }
            });
            
            this.state.audioSources[key] = { 
                src: src,
                audio: audio 
            };
        });
    },
    togglePlayer() {
        // Больше не используется
    },
    closePlayer() {
        // Больше не используется
    },
    selectTrack(trackName) {
        // Stop current track if playing
        if (this.state.currentAudio) {
            this.state.currentAudio.pause();
            this.state.isPlaying = false;
            this.updatePlayPauseButton();
        }
        
        // Set current track
        this.state.currentTrack = trackName;
        this.state.currentAudio = this.state.audioSources[trackName].audio;
        
        // Apply repeat setting
        this.state.currentAudio.loop = this.state.isRepeatEnabled;
        
        // Start playing if needed
        if (this.state.isPlaying) {
            this.playAudio();
        }
    },
    togglePlayPause() {
        if (!this.state.currentTrack) {
            // Select the current value in the dropdown
            const trackName = this.elements.trackSelect.value;
            this.selectTrack(trackName);
        }
        
        if (this.state.isPlaying) {
            this.pauseAudio();
        } else {
            this.playAudio();
        }
        
        this.state.isPlaying = !this.state.isPlaying;
        this.updatePlayPauseButton();
    },
    playAudio() {
        if (this.state.currentAudio) {
            this.state.currentAudio.play()
                .catch(error => {
                    console.error('Error playing audio:', error);
                    // Handle autoplay policy issues
                    if (error.name === 'NotAllowedError') {
                        alert('Автоматическое воспроизведение звука заблокировано браузером. Пожалуйста, разрешите воспроизведение звука для этого сайта.');
                    }
                });
        }
    },
    pauseAudio() {
        if (this.state.currentAudio) {
            this.state.currentAudio.pause();
        }
    },
    updatePlayPauseButton() {
        if (this.state.isPlaying) {
            this.elements.playPauseIcon.className = 'fas fa-pause';
        } else {
            this.elements.playPauseIcon.className = 'fas fa-play';
        }
    },
    adjustVolume(value) {
        const volume = parseFloat(value) / 100;
        this.state.volume = volume;
        
        // Update all audio elements
        Object.keys(this.state.audioSources).forEach(key => {
            if (this.state.audioSources[key].audio) {
                this.state.audioSources[key].audio.volume = volume;
            }
        });
        
        // Update the visual volume slider gradient
        const volumeSlider = this.elements.volumeSlider;
        const percentage = value;
        volumeSlider.style.setProperty('--volume-percentage', `${percentage}%`);
    },
    
    toggleRepeat() {
        this.state.isRepeatEnabled = !this.state.isRepeatEnabled;
        
        // Update repeat button visual state
        if (this.state.isRepeatEnabled) {
            this.elements.repeatBtn.classList.add('active');
        } else {
            this.elements.repeatBtn.classList.remove('active');
        }
        
        // Update current audio loop setting
        if (this.state.currentAudio) {
            this.state.currentAudio.loop = this.state.isRepeatEnabled;
        }
    }
};

// Function to initialize audio player
function initAudioPlayer() {
    audioPlayer.init();
}

// Setup logout functionality
function setupLogout() {
    if (elements.logoutBtn) {
        elements.logoutBtn.addEventListener('click', () => {
            // Clear auth tokens
            localStorage.removeItem('lifeQuestAuthToken');
            localStorage.removeItem('lifeQuestUserId');
            
            // Redirect to login page
            window.location.href = 'login.html';
        });
    }
}

// Start the app when DOM is loaded
document.addEventListener('DOMContentLoaded', init);

