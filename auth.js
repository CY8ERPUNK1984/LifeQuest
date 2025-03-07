// Auth Module
const authModule = {
    state: {
        users: [],
        currentUser: null,
        isAuthenticated: false
    },
    
    // API URL
    apiUrl: 'http://localhost:3000/api',
    
    init() {
        this.setupEventListeners();
        this.checkAuthentication();
    },
    
    // Загрузка пользователей с сервера
    async loadUsers() {
        try {
            const response = await fetch(`${this.apiUrl}/users`);
            if (!response.ok) throw new Error('Ошибка загрузки пользователей');
            
            const users = await response.json();
            this.state.users = users;
            return users;
        } catch (error) {
            console.error('Ошибка при загрузке пользователей:', error);
            return [];
        }
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
        
        // Login button
        const loginButton = document.getElementById('login-button');
        if (loginButton) {
            loginButton.addEventListener('click', () => {
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
    
    async checkAuthentication() {
        const authToken = localStorage.getItem('lifeQuestAuthToken');
        const userId = localStorage.getItem('lifeQuestUserId');
        
        if (authToken && userId) {
            try {
                // Проверяем токен на сервере
                const response = await fetch(`${this.apiUrl}/auth/verify`, {
                    method: 'POST',
                    headers: {
                        'Content-Type': 'application/json'
                    },
                    body: JSON.stringify({
                        userId,
                        authToken
                    })
                });
                
                if (!response.ok) {
                    // Токен недействителен, очищаем localStorage
                    localStorage.removeItem('lifeQuestAuthToken');
                    localStorage.removeItem('lifeQuestUserId');
                    return false;
                }
                
                const data = await response.json();
                if (data.success) {
                    this.state.currentUser = data.user;
                    this.state.isAuthenticated = true;
                    
                    // Если мы на странице логина, перенаправляем на главную
                    if (window.location.pathname.includes('login.html')) {
                        window.location.href = 'index.html';
                    }
                    return true;
                }
            } catch (error) {
                console.error('Ошибка при проверке аутентификации:', error);
            }
        }
        
        // Если мы на главной странице и не аутентифицированы, перенаправляем на логин
        if (window.location.pathname.includes('index.html')) {
            window.location.href = 'login.html';
        }
        return false;
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
    
    async handleLogin() {
        const email = document.getElementById('login-email').value;
        const password = document.getElementById('login-password').value;
        
        // Напрямую входим с зарегистрированными данными
        if (email === 'stepan.zinin@gmail.com' && password === '7Cpkkrdc') {
            // устанавливаем фиксированные данные пользователя
            const user = {
                id: 'user1',
                name: 'Степан',
                email: 'stepan.zinin@gmail.com',
                avatar: '1'
            };
            
            const authToken = 'token123';
            
            // Сохраняем токен и ID пользователя в localStorage
            localStorage.setItem('lifeQuestAuthToken', authToken);
            localStorage.setItem('lifeQuestUserId', user.id);
            
            // Устанавливаем состояние аутентификации
            this.state.currentUser = user;
            this.state.isAuthenticated = true;
            
            // Перенаправляем на главную страницу
            window.location.href = 'index.html';
            return;
        }
        
        try {
            // Через API
            const response = await fetch(`${this.apiUrl}/auth/login`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify({ email, password })
            });
            
            const data = await response.json();
            
            if (data.success) {
                this.state.currentUser = data.user;
                this.state.isAuthenticated = true;
                
                // Сохраняем токен и ID пользователя в localStorage
                localStorage.setItem('lifeQuestAuthToken', data.authToken);
                localStorage.setItem('lifeQuestUserId', data.user.id);
                
                // Перенаправляем на главную страницу
                window.location.href = 'index.html';
            } else {
                // Если не удалось войти через API, проверяем фиксированные учетные данные
                if (email === 'stepan.zinin@gmail.com' && password === '7Cpkkrdc') {
                    const user = {
                        id: 'user1',
                        name: 'Степан',
                        email: 'stepan.zinin@gmail.com',
                        avatar: '1'
                    };
                    
                    const authToken = 'token123';
                    
                    // Сохраняем токен и ID пользователя в localStorage
                    localStorage.setItem('lifeQuestAuthToken', authToken);
                    localStorage.setItem('lifeQuestUserId', user.id);
                    
                    // Устанавливаем состояние аутентификации
                    this.state.currentUser = user;
                    this.state.isAuthenticated = true;
                    
                    // Перенаправляем на главную страницу
                    window.location.href = 'index.html';
                } else {
                    alert('Неверный email или пароль');
                }
            }
        } catch (error) {
            console.error('Ошибка при входе в систему:', error);
            
            // Если произошла ошибка, проверяем фиксированные учетные данные
            if (email === 'stepan.zinin@gmail.com' && password === '7Cpkkrdc') {
                const user = {
                    id: 'user1',
                    name: 'Степан',
                    email: 'stepan.zinin@gmail.com',
                    avatar: '1'
                };
                
                const authToken = 'token123';
                
                // Сохраняем токен и ID пользователя в localStorage
                localStorage.setItem('lifeQuestAuthToken', authToken);
                localStorage.setItem('lifeQuestUserId', user.id);
                
                // Устанавливаем состояние аутентификации
                this.state.currentUser = user;
                this.state.isAuthenticated = true;
                
                // Перенаправляем на главную страницу
                window.location.href = 'index.html';
            } else {
                alert('Неверный email или пароль или ошибка сервера');
            }
        }
    },
    
    async handleRegistration() {
        const name = document.getElementById('register-name').value;
        const email = document.getElementById('register-email').value;
        const password = document.getElementById('register-password').value;
        const confirmPassword = document.getElementById('register-confirm-password').value;
        
        // Проверяем совпадение паролей
        if (password !== confirmPassword) {
            alert('Пароли не совпадают');
            return;
        }
        
        // Получаем выбранный аватар
        const selectedAvatar = document.querySelector('.avatar-option.selected');
        const avatarId = selectedAvatar ? selectedAvatar.getAttribute('data-avatar') : '1';
        
        // Создаем объект нового пользователя
        const newUser = {
            id: this.generateId(),
            name,
            email,
            password, // В реальном приложении следует использовать хеширование пароля
            avatar: avatarId,
            createdAt: new Date().toISOString()
        };
        
        try {
            // Отправляем данные на сервер
            const response = await fetch(`${this.apiUrl}/users`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify(newUser)
            });
            
            if (!response.ok) {
                const errorData = await response.json();
                if (response.status === 400) {
                    alert('Пользователь с таким email уже зарегистрирован');
                } else {
                    alert(`Ошибка при регистрации: ${errorData.message || 'Неизвестная ошибка'}`);
                }
                return;
            }
            
            // После успешной регистрации выполняем вход
            const loginResponse = await fetch(`${this.apiUrl}/auth/login`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify({ email, password })
            });
            
            const loginData = await loginResponse.json();
            
            if (loginData.success) {
                this.state.currentUser = loginData.user;
                this.state.isAuthenticated = true;
                
                // Сохраняем токен и ID пользователя в localStorage
                localStorage.setItem('lifeQuestAuthToken', loginData.authToken);
                localStorage.setItem('lifeQuestUserId', loginData.user.id);
                
                // Перенаправляем на главную страницу
                window.location.href = 'index.html';
            }
        } catch (error) {
            console.error('Ошибка при регистрации:', error);
            alert('Произошла ошибка при регистрации');
        }
    },
    
    async handlePasswordReset() {
        const email = document.getElementById('reset-email').value;
        
        try {
            // Проверяем, существует ли пользователь с таким email
            const users = await this.loadUsers();
            const user = users.find(u => u.email === email);
            
            if (user) {
                // В реальном приложении здесь будет отправка email с кодом сброса пароля
                // Для демонстрации просто показываем успешное сообщение
                alert(`Инструкции по сбросу пароля отправлены на ${email}`);
                this.showLoginForm();
            } else {
                alert('Пользователь с таким email не найден');
            }
        } catch (error) {
            console.error('Ошибка при сбросе пароля:', error);
            alert('Произошла ошибка при запросе сброса пароля');
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
