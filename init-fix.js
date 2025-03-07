// Исправление интерактивности приложения
document.addEventListener('DOMContentLoaded', function() {
    console.log('Исправление интерактивности активировано');
    
    // Задержка для обеспечения полной загрузки DOM
    setTimeout(function() {
        // Восстановление работы основных кнопок
        setupButtonListeners();
        
        // Восстановление переключения вкладок
        setupTabSwitching();
        
        // Восстановление модальных окон
        setupModalListeners();
        
        console.log('Все слушатели событий восстановлены!');
    }, 500);
});

// Функция для восстановления основных кнопок
function setupButtonListeners() {
    // Добавление задач
    const addTaskBtn = document.getElementById('add-task-btn');
    if (addTaskBtn) {
        addTaskBtn.addEventListener('click', function() {
            console.log('Нажата кнопка добавления задачи');
            document.getElementById('task-modal').style.display = 'flex';
        });
    }
    
    // Добавление целей
    const addGoalBtn = document.getElementById('add-goal-btn');
    if (addGoalBtn) {
        addGoalBtn.addEventListener('click', function() {
            console.log('Нажата кнопка добавления цели');
            document.getElementById('goal-modal').style.display = 'flex';
        });
    }
    
    // Добавление наград
    const addRewardBtn = document.getElementById('add-reward-btn');
    if (addRewardBtn) {
        addRewardBtn.addEventListener('click', function() {
            console.log('Нажата кнопка добавления награды');
            document.getElementById('reward-modal').style.display = 'flex';
        });
    }
    
    // Добавление привычек
    const addHabitBtn = document.getElementById('add-habit-btn');
    if (addHabitBtn) {
        addHabitBtn.addEventListener('click', function() {
            console.log('Нажата кнопка добавления привычки');
            document.getElementById('habit-modal').style.display = 'flex';
        });
    }
    
    // Кнопка воспроизведения аудио
    const playPauseBtn = document.getElementById('play-pause-btn');
    if (playPauseBtn) {
        playPauseBtn.addEventListener('click', function() {
            console.log('Нажата кнопка воспроизведения');
            const icon = this.querySelector('i');
            if (icon.classList.contains('fa-play')) {
                icon.classList.remove('fa-play');
                icon.classList.add('fa-pause');
            } else {
                icon.classList.remove('fa-pause');
                icon.classList.add('fa-play');
            }
        });
    }
}

// Функция для восстановления переключения вкладок
function setupTabSwitching() {
    const tabs = document.querySelectorAll('.tab');
    
    tabs.forEach(tab => {
        tab.addEventListener('click', function() {
            const tabName = this.getAttribute('data-tab');
            console.log('Переключение на вкладку:', tabName);
            
            // Удаляем активный класс у всех вкладок
            tabs.forEach(t => t.classList.remove('active'));
            
            // Добавляем активный класс к выбранной вкладке
            this.classList.add('active');
            
            // Скрываем все содержимое вкладок
            document.querySelectorAll('.tab-content').forEach(content => {
                content.style.display = 'none';
            });
            
            // Показываем содержимое выбранной вкладки
            document.getElementById(tabName + '-content').style.display = 'block';
        });
    });
    
    // Активируем первую вкладку при загрузке
    if (tabs.length > 0) {
        tabs[0].click();
    }
}

// Функция для восстановления модальных окон
function setupModalListeners() {
    // Исправляем стили модальных окон для корректного отображения
    document.querySelectorAll('.modal').forEach(modal => {
        modal.style.display = 'none';
        modal.style.alignItems = 'flex-start';
        modal.style.justifyContent = 'center';
        modal.style.overflow = 'auto';
        modal.style.paddingTop = '50px';
        modal.style.paddingBottom = '50px';
        
        // При открытии модального окна используем flex
        modal.addEventListener('open', function() {
            this.style.display = 'flex';
        });
    });
    
    // Дополнительные стили для контента модального окна
    document.querySelectorAll('.modal-content').forEach(content => {
        content.style.maxHeight = '85vh';
        content.style.overflowY = 'auto';
        content.style.display = 'block';
        content.style.width = '100%';
        content.style.maxWidth = '450px';
        content.style.padding = '30px';
        content.style.boxSizing = 'border-box';
        content.style.margin = '0 auto';
    });
    
    // Исправление для модального окна привычек
    const habitModal = document.getElementById('habit-modal');
    if (habitModal) {
        const habitForm = habitModal.querySelector('#habit-form');
        if (habitForm) {
            habitForm.style.display = 'flex';
            habitForm.style.flexDirection = 'column';
            habitForm.style.width = '100%';
            
            // Растягиваем все группы полей на всю ширину
            habitForm.querySelectorAll('.form-group').forEach(group => {
                group.style.width = '100%';
                group.style.marginBottom = '20px';
            });
            
            // Исправляем стили полей ввода
            habitForm.querySelectorAll('input[type="text"], input[type="number"], textarea, select').forEach(input => {
                input.style.width = '100%';
                input.style.boxSizing = 'border-box';
                input.style.padding = '12px';
                input.style.borderRadius = '8px';
                input.style.border = '1px solid #ddd';
            });
        }
    }
    
    // Закрытие модальных окон
    document.querySelectorAll('.close-modal').forEach(closeBtn => {
        closeBtn.addEventListener('click', function() {
            this.closest('.modal').style.display = 'none';
        });
    });
    
    // Отправка форм
    const taskForm = document.getElementById('task-form');
    if (taskForm) {
        taskForm.addEventListener('submit', function(e) {
            e.preventDefault();
            console.log('Форма задачи отправлена');
            
            // Получаем значения полей
            const taskName = document.getElementById('task-name').value;
            
            // Добавляем задачу в список
            const taskList = document.getElementById('tasks-list');
            const taskItem = document.createElement('div');
            taskItem.className = 'task-item';
            taskItem.innerHTML = `
                <div class="task-content">
                    <div class="task-check">&#9744;</div>
                    <div class="task-name">${taskName}</div>
                </div>
                <div class="task-footer">
                    <div class="task-xp">+25 XP</div>
                </div>
            `;
            
            if (taskList) {
                taskList.appendChild(taskItem);
            }
            
            // Закрываем модальное окно
            document.getElementById('task-modal').style.display = 'none';
        });
    }
    
    // Добавляем обработчик для формы привычек
    const habitForm = document.getElementById('habit-form');
    if (habitForm) {
        habitForm.addEventListener('submit', function(e) {
            e.preventDefault();
            console.log('Форма привычки отправлена');
            
            // Получаем значения полей
            const habitName = document.getElementById('habit-name').value;
            
            // Закрываем модальное окно
            document.getElementById('habit-modal').style.display = 'none';
        });
    }
}
