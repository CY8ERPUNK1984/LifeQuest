// Auth Module
const authModule = {
    state: {
        users: [],
        currentUser: null,
        isAuthenticated: false
    },
    
    init() {
        this.loadUsers();
        this.setupEventListeners();
        this.checkAuthentication();
    },
    
    loadUsers() {
        const savedUsers = localStorage.getItem('lifeQuestUsers');
        if (savedUsers) {
            this.state.users = JSON.parse(savedUsers);
        }
    },
    
    saveUsers() {
        localStorage.setItem('lifeQuestUsers', JSON.stringify(this.state.users));
    },
    
    setupEventListeners() {
        // Tab switching
        const tabs = document.querySelectorAll('.auth-tab');
        tabs.forEach(tab => {
            tab.addEventListener('click', () => {
                const tabName = tab.getAttribute('data-tab');
                this.switchTab(tabName);
            });
        });
        
        // Login form
        const loginForm = document.getElementById('login-form');
        if (loginForm) {
            loginForm.addEventListener('submit', (e) => {
                e.preventDefault();
                this.handleLogin();
            });
        }
        
        // Register form
        const registerForm = document.getElementById('register-form');
        if (registerForm) {
            registerForm.addEventListener('submit', (e) => {
                e.preventDefault();
                this.handleRegistration();
            });
        }
        
        // Password reset form
        const resetForm = document.getElementById('reset-password-form');
        if (resetForm) {
            resetForm.addEventListener('submit', (e) => {
                e.preventDefault();
                this.handlePasswordReset();
            });
        }
        
        // Forgot password link
        const forgotPasswordLink = document.getElementById('forgot-password-link');
        if (forgotPasswordLink) {
            forgotPasswordLink.addEventListener('click', (e) => {
                e.preventDefault();
                this.showResetPasswordForm();
            });
        }
        
        // Back to login link
        const backToLoginBtn = document.getElementById('back-to-login');
        if (backToLoginBtn) {
            backToLoginBtn.addEventListener('click', () => {
                this.showLoginForm();
            });
        }
        
        // Avatar selection
        const avatarOptions = document.querySelectorAll('.avatar-option');
        avatarOptions.forEach(option => {
            option.addEventListener('click', () => {
                avatarOptions.forEach(o => o.classList.remove('selected'));
                option.classList.add('selected');
            });
        });
    },
    
    checkAuthentication() {
        const authToken = localStorage.getItem('lifeQuestAuthToken');
        if (authToken) {
            const userId = localStorage.getItem('lifeQuestUserId');
            if (userId) {
                const user = this.state.users.find(u => u.id === userId);
                if (user) {
                    this.state.currentUser = user;
                    this.state.isAuthenticated = true;
                    
                    // Redirect to main app
                    window.location.href = 'index.html';
                }
            }
        }
    },
    
    switchTab(tabName) {
        // Hide all contents
        const contents = document.querySelectorAll('.auth-content');
        contents.forEach(content => {
            content.classList.remove('active');
        });
        
        // Deactivate all tabs
        const tabs = document.querySelectorAll('.auth-tab');
        tabs.forEach(tab => {
            tab.classList.remove('active');
        });
        
        // Activate selected tab and content
        const selectedTab = document.querySelector(`.auth-tab[data-tab="${tabName}"]`);
        const selectedContent = document.getElementById(`${tabName}-content`);
        
        if (selectedTab && selectedContent) {
            selectedTab.classList.add('active');
            selectedContent.classList.add('active');
        }
    },
    
    handleLogin() {
        const email = document.getElementById('login-email').value;
        const password = document.getElementById('login-password').value;
        
        const user = this.state.users.find(u => u.email === email && u.password === password);
        
        if (user) {
            this.state.currentUser = user;
            this.state.isAuthenticated = true;
            
            // Set auth token and user id in localStorage
            const authToken = this.generateAuthToken();
            localStorage.setItem('lifeQuestAuthToken', authToken);
            localStorage.setItem('lifeQuestUserId', user.id);
            
            // Redirect to main app
            window.location.href = 'index.html';
        } else {
            alert('Неверный email или пароль');
        }
    },
    
    handleRegistration() {
        const name = document.getElementById('register-name').value;
        const email = document.getElementById('register-email').value;
        const password = document.getElementById('register-password').value;
        const confirmPassword = document.getElementById('register-confirm-password').value;
        
        // Check if passwords match
        if (password !== confirmPassword) {
            alert('Пароли не совпадают');
            return;
        }
        
        // Check if email is already registered
        if (this.state.users.some(u => u.email === email)) {
            alert('Пользователь с таким email уже зарегистрирован');
            return;
        }
        
        // Get selected avatar
        const selectedAvatar = document.querySelector('.avatar-option.selected');
        const avatarId = selectedAvatar ? selectedAvatar.getAttribute('data-avatar') : '1';
        
        // Create user
        const newUser = {
            id: this.generateId(),
            name,
            email,
            password, // В реальном приложении следует использовать хеширование пароля
            avatar: avatarId,
            createdAt: new Date().toISOString()
        };
        
        // Add user to state
        this.state.users.push(newUser);
        this.saveUsers();
        
        // Auto-login new user
        this.state.currentUser = newUser;
        this.state.isAuthenticated = true;
        
        // Set auth token and user id in localStorage
        const authToken = this.generateAuthToken();
        localStorage.setItem('lifeQuestAuthToken', authToken);
        localStorage.setItem('lifeQuestUserId', newUser.id);
        
        // Redirect to main app
        window.location.href = 'index.html';
    },
    
    handlePasswordReset() {
        const email = document.getElementById('reset-email').value;
        
        const user = this.state.users.find(u => u.email === email);
        
        if (user) {
            // В реальном приложении тут можно отправить email для сброса пароля
            // В нашем примере просто сбросим пароль на "12345"
            user.password = '12345';
            this.saveUsers();
            
            alert('Пароль сброшен на "12345". В реальном приложении вы бы получили email с инструкциями для сброса пароля.');
            this.showLoginForm();
        } else {
            alert('Пользователь с таким email не найден');
        }
    },
    
    showResetPasswordForm() {
        // Hide all contents
        const contents = document.querySelectorAll('.auth-content');
        contents.forEach(content => {
            content.classList.remove('active');
        });
        
        // Show reset password form
        const resetContent = document.getElementById('reset-password-content');
        if (resetContent) {
            resetContent.classList.add('active');
        }
    },
    
    showLoginForm() {
        this.switchTab('login');
    },
    
    generateId() {
        return Date.now().toString(36) + Math.random().toString(36).substr(2);
    },
    
    generateAuthToken() {
        return Math.random().toString(36).substr(2) + Date.now().toString(36);
    }
};

// Initialize auth module
document.addEventListener('DOMContentLoaded', () => {
    authModule.init();
});
