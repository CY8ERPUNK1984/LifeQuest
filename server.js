const express = require('express');
const fs = require('fs');
const path = require('path');
const bodyParser = require('body-parser');
const cors = require('cors');

const app = express();
const PORT = 3000;

// Middleware
app.use(cors({
    origin: '*', // Разрешаем все источники
    credentials: true
}));
app.use(bodyParser.json());
app.use(express.static(__dirname));

// Автоматический вход по корневому маршруту
app.get('/', (req, res) => {
    res.redirect('/auto-login.html');
});

// Маршрут для страницы индекса
app.get('/index', (req, res) => {
    res.sendFile(path.join(__dirname, 'index.html'));
});

// Маршрут для автоматического входа
app.get('/bypass-auth', (req, res) => {
    // Возвращаем готовые данные пользователя без проверки пароля
    res.json({
        success: true,
        user: {
            id: 'user1',
            name: 'Степан',
            email: 'stepan.zinin@gmail.com',
            avatar: '1'
        },
        authToken: 'fixed-token-123'
    });
});

// Пути к файлам данных
const DB_FOLDER = path.join(__dirname, 'db');
const USERS_DB_FILE = path.join(DB_FOLDER, 'users.json');

// Создаем папку DB, если она не существует
if (!fs.existsSync(DB_FOLDER)) {
    fs.mkdirSync(DB_FOLDER);
}

// Создаем файл базы данных пользователей, если он не существует
if (!fs.existsSync(USERS_DB_FILE)) {
    fs.writeFileSync(USERS_DB_FILE, JSON.stringify([]));
}

// Helper Functions
const readUsers = () => {
    try {
        const data = fs.readFileSync(USERS_DB_FILE);
        return JSON.parse(data);
    } catch (error) {
        console.error('Error reading users file:', error);
        return [];
    }
};

const saveUsers = (users) => {
    try {
        fs.writeFileSync(USERS_DB_FILE, JSON.stringify(users, null, 2));
        return true;
    } catch (error) {
        console.error('Error saving users file:', error);
        return false;
    }
};

// API Routes

// Получить всех пользователей
app.get('/api/users', (req, res) => {
    const users = readUsers();
    res.json(users);
});

// Получить конкретного пользователя
app.get('/api/users/:id', (req, res) => {
    const users = readUsers();
    const user = users.find(u => u.id === req.params.id);
    
    if (user) {
        res.json(user);
    } else {
        res.status(404).json({ message: 'User not found' });
    }
});

// Создать нового пользователя
app.post('/api/users', (req, res) => {
    const users = readUsers();
    const newUser = req.body;
    
    // Проверяем, существует ли уже пользователь с таким email
    if (users.some(u => u.email === newUser.email)) {
        return res.status(400).json({ message: 'User with this email already exists' });
    }
    
    users.push(newUser);
    
    if (saveUsers(users)) {
        res.status(201).json(newUser);
    } else {
        res.status(500).json({ message: 'Error saving user data' });
    }
});

// Обновить существующего пользователя
app.put('/api/users/:id', (req, res) => {
    const users = readUsers();
    const userId = req.params.id;
    const updatedUserData = req.body;
    
    const userIndex = users.findIndex(u => u.id === userId);
    
    if (userIndex === -1) {
        return res.status(404).json({ message: 'User not found' });
    }
    
    users[userIndex] = { ...users[userIndex], ...updatedUserData };
    
    if (saveUsers(users)) {
        res.json(users[userIndex]);
    } else {
        res.status(500).json({ message: 'Error updating user data' });
    }
});

// Удалить пользователя
app.delete('/api/users/:id', (req, res) => {
    const users = readUsers();
    const userId = req.params.id;
    
    const userIndex = users.findIndex(u => u.id === userId);
    
    if (userIndex === -1) {
        return res.status(404).json({ message: 'User not found' });
    }
    
    users.splice(userIndex, 1);
    
    if (saveUsers(users)) {
        res.json({ message: 'User deleted successfully' });
    } else {
        res.status(500).json({ message: 'Error deleting user' });
    }
});

// Login route
app.post('/api/auth/login', (req, res) => {
    console.log('\n=== Запрос на вход в систему ===');
    const { email, password } = req.body;
    console.log('Получены данные:', { email, passwordProvided: !!password });
    
    const users = readUsers();
    console.log('Количество пользователей в базе:', users.length);
    
    if (users.length > 0) {
        console.log('Пользователи в базе:', users.map(u => ({ email: u.email, id: u.id })));
    }
    
    // Проверяем только по email для дебага
    const userByEmail = users.find(u => u.email === email);
    if (userByEmail) {
        console.log('Найден пользователь с таким email!');
        // Проверяем пароль отдельно для более детальной отладки
        if (userByEmail.password === password) {
            console.log('Пароль совпадает! Аутентификация успешна!');
        } else {
            console.log('Пароль не совпадает!');
            console.log('- Ожидаемый пароль длиной:', userByEmail.password.length);
            console.log('- Полученный пароль длиной:', password.length);
        }
    } else {
        console.log('Пользователь с таким email не найден!');
    }
    
    const user = users.find(u => u.email === email && u.password === password);
    
    if (user) {
        // Генерируем токен (простой пример, в реальном приложении используйте JWT)
        const authToken = Math.random().toString(36).substring(2, 15) + 
                         Math.random().toString(36).substring(2, 15);
        
        // Обновляем пользователя с новым токеном
        user.authToken = authToken;
        saveUsers(users);
        
        console.log('Аутентификация успешна, отправляем токен');
        
        res.json({ 
            success: true, 
            user: { ...user, password: undefined }, // Не отправляем пароль обратно клиенту
            authToken 
        });
    } else {
        console.log('Аутентификация не удалась, отправляем ошибку');
        res.status(401).json({ 
            success: false, 
            message: 'Invalid email or password' 
        });
    }
});

// Verify token route
app.post('/api/auth/verify', (req, res) => {
    const { userId, authToken } = req.body;
    const users = readUsers();
    
    const user = users.find(u => u.id === userId && u.authToken === authToken);
    
    if (user) {
        res.json({ 
            success: true, 
            user: { ...user, password: undefined } // Не отправляем пароль обратно клиенту
        });
    } else {
        res.status(401).json({ 
            success: false, 
            message: 'Invalid token' 
        });
    }
});

// Запуск сервера
app.listen(PORT, () => {
    console.log(`Server running on http://localhost:${PORT}`);
});
