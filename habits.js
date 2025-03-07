// Habits Module
const habitsModule = {
    state: {
        habits: [],
        currentWeekStart: null,
        selectedHabitId: null,
        stats: {
            currentStreak: 0,
            bestStreak: 0,
            completionRate: 0,
            totalCompleted: 0
        }
    },
    
    init() {
        this.loadHabits();
        this.initCurrentWeek();
        this.setupEventListeners();
        this.renderCalendar();
        this.renderHabits();
        this.updateStats();
    },
    
    renderCalendar() {
        const weekDaysContainer = document.getElementById('week-days');
        if (!weekDaysContainer) return;
        
        // Очищаем контейнер
        weekDaysContainer.innerHTML = '';
        
        // Получаем даты недели
        const weekDays = this.getWeekDays();
        
        // Получаем текущую дату
        const today = new Date();
        today.setHours(0, 0, 0, 0);
        
        // Текущий месяц для отображения в заголовке
        const monthNames = [
            'Январь', 'Февраль', 'Март', 'Апрель', 'Май', 'Июнь',
            'Июль', 'Август', 'Сентябрь', 'Октябрь', 'Ноябрь', 'Декабрь'
        ];
        
        // Названия дней недели
        const dayNames = ['Вс', 'Пн', 'Вт', 'Ср', 'Чт', 'Пт', 'Сб'];
        
        // Обновляем текущий месяц в заголовке
        const currentMonthElement = document.getElementById('current-month');
        if (currentMonthElement) {
            // Если в неделе есть дни из разных месяцев, показываем оба
            if (weekDays[0].getMonth() !== weekDays[6].getMonth()) {
                currentMonthElement.textContent = `${monthNames[weekDays[0].getMonth()]} - ${monthNames[weekDays[6].getMonth()]} ${weekDays[6].getFullYear()}`;
            } else {
                currentMonthElement.textContent = `${monthNames[weekDays[0].getMonth()]} ${weekDays[0].getFullYear()}`;
            }
        }
        
        // Создаем элементы для дней недели
        weekDays.forEach(date => {
            const dayElement = document.createElement('div');
            dayElement.className = 'week-day';
            
            // Проверяем, является ли день сегодняшним
            if (date.toDateString() === today.toDateString()) {
                dayElement.classList.add('today');
            }
            
            // Создаем элементы для названия дня и числа
            const dayNameElement = document.createElement('div');
            dayNameElement.className = 'day-name';
            dayNameElement.textContent = dayNames[date.getDay()];
            
            const dayNumberElement = document.createElement('div');
            dayNumberElement.className = 'day-number';
            dayNumberElement.textContent = date.getDate();
            
            // Добавляем элементы в день
            dayElement.appendChild(dayNameElement);
            dayElement.appendChild(dayNumberElement);
            
            // Добавляем день в контейнер
            weekDaysContainer.appendChild(dayElement);
        });
    },
    
    getWeekDays() {
        const days = [];
        const startDate = new Date(this.state.currentWeekStart);
        
        for (let i = 0; i < 7; i++) {
            const date = new Date(startDate);
            date.setDate(startDate.getDate() + i);
            days.push(date);
        }
        
        return days;
    },
    
    loadHabits() {
        // Загрузка привычек из localStorage
        const habits = JSON.parse(localStorage.getItem('lifeQuestHabits') || '[]');
        
        // Если у текущего пользователя нет привычек, создаем пустой массив
        if (habits.length > 0) {
            const userId = localStorage.getItem('lifeQuestUserId');
            this.state.habits = habits.filter(habit => habit.userId === userId);
        } else {
            this.state.habits = [];
        }
    },
    
    saveHabits() {
        // Получение всех привычек из localStorage
        const allHabits = JSON.parse(localStorage.getItem('lifeQuestHabits') || '[]');
        const userId = localStorage.getItem('lifeQuestUserId');
        
        // Удаление привычек текущего пользователя
        const otherUsersHabits = allHabits.filter(habit => habit.userId !== userId);
        
        // Добавление обновленных привычек текущего пользователя
        const updatedHabits = [...otherUsersHabits, ...this.state.habits];
        
        // Сохранение в localStorage
        localStorage.setItem('lifeQuestHabits', JSON.stringify(updatedHabits));
    },
    
    initCurrentWeek() {
        // Установка начала текущей недели (воскресенье)
        const today = new Date();
        const dayOfWeek = today.getDay(); // 0 = воскресенье, 1 = понедельник, и т.д.
        const diff = today.getDate() - dayOfWeek;
        
        this.state.currentWeekStart = new Date(today.setDate(diff));
        this.state.currentWeekStart.setHours(0, 0, 0, 0);
    },
    
    setupEventListeners() {
        // Кнопка добавления привычки
        const addHabitBtn = document.getElementById('add-habit-btn');
        if (addHabitBtn) {
            addHabitBtn.addEventListener('click', () => this.openHabitModal());
        }
        
        // Кнопка на пустом состоянии
        const createFirstHabitBtn = document.getElementById('create-first-habit');
        if (createFirstHabitBtn) {
            createFirstHabitBtn.addEventListener('click', () => this.openHabitModal());
        }
        
        // Навигация по календарю
        const prevWeekBtn = document.getElementById('prev-week-btn');
        const nextWeekBtn = document.getElementById('next-week-btn');
        
        if (prevWeekBtn) {
            prevWeekBtn.addEventListener('click', () => {
                const newDate = new Date(this.state.currentWeekStart);
                newDate.setDate(newDate.getDate() - 7);
                this.state.currentWeekStart = newDate;
                this.renderCalendar();
                this.renderHabits();
            });
        }
        
        if (nextWeekBtn) {
            nextWeekBtn.addEventListener('click', () => {
                const newDate = new Date(this.state.currentWeekStart);
                newDate.setDate(newDate.getDate() + 7);
                this.state.currentWeekStart = newDate;
                this.renderCalendar();
                this.renderHabits();
            });
        }
        
        // Модальное окно
        const modal = document.getElementById('habit-modal');
        const modalClose = document.querySelector('.modal-close');
        const cancelHabitBtn = document.getElementById('cancel-habit-btn');
        
        if (modalClose) {
            modalClose.addEventListener('click', () => this.closeHabitModal());
        }
        
        if (cancelHabitBtn) {
            cancelHabitBtn.addEventListener('click', (e) => {
                e.preventDefault();
                this.closeHabitModal();
            });
        }
        
        // Форма привычки
        const habitForm = document.getElementById('habit-form');
        if (habitForm) {
            habitForm.addEventListener('submit', (e) => {
                e.preventDefault();
                this.saveHabitFromForm();
            });
        }
        
        // Выбор иконки
        const iconOptions = document.querySelectorAll('.icon-option');
        iconOptions.forEach(option => {
            option.addEventListener('click', () => {
                iconOptions.forEach(o => o.classList.remove('selected'));
                option.classList.add('selected');
            });
        });
        
        // Выбор цвета
        const colorOptions = document.querySelectorAll('.color-option');
        colorOptions.forEach(option => {
            option.addEventListener('click', () => {
                colorOptions.forEach(o => o.classList.remove('selected'));
                option.classList.add('selected');
            });
        });
        
        // Выбор частоты
        const frequencySelect = document.getElementById('habit-frequency');
        const weekdaysGroup = document.getElementById('weekdays-group');
        const customFrequencyGroup = document.getElementById('custom-frequency-group');
        
        if (frequencySelect) {
            frequencySelect.addEventListener('change', () => {
                const value = frequencySelect.value;
                
                if (value === 'weekly') {
                    weekdaysGroup.style.display = 'block';
                    customFrequencyGroup.style.display = 'none';
                } else if (value === 'custom') {
                    weekdaysGroup.style.display = 'none';
                    customFrequencyGroup.style.display = 'block';
                } else {
                    weekdaysGroup.style.display = 'none';
                    customFrequencyGroup.style.display = 'none';
                }
            });
        }
        
        // Выбор дней недели
        const weekdayOptions = document.querySelectorAll('.weekday-option');
        weekdayOptions.forEach(option => {
            option.addEventListener('click', () => {
                option.classList.toggle('selected');
            });
        });
        
        // Переключатель напоминаний
        const reminderToggle = document.getElementById('reminder-toggle');
        const reminderTimeGroup = document.getElementById('reminder-time-group');
        
        if (reminderToggle) {
            reminderToggle.addEventListener('change', () => {
                if (reminderToggle.checked) {
                    reminderTimeGroup.style.display = 'block';
                } else {
                    reminderTimeGroup.style.display = 'none';
                }
            });
        }
    },
    
    toggleHabitCompletion(habitId, dateStr) {
        // Находим привычку
        const habitIndex = this.state.habits.findIndex(h => h.id === habitId);
        if (habitIndex === -1) return;
        
        const habit = this.state.habits[habitIndex];
        
        // Инициализируем массив completedDates, если его нет
        if (!habit.completedDates) {
            habit.completedDates = [];
        }
        
        // Проверяем, отмечен ли уже этот день
        const dateIndex = habit.completedDates.indexOf(dateStr);
        
        // Переключаем состояние
        if (dateIndex === -1) {
            // Добавляем дату
            habit.completedDates.push(dateStr);
            habit.completedDates.sort(); // Сортируем даты
        } else {
            // Удаляем дату
            habit.completedDates.splice(dateIndex, 1);
        }
        
        // Обновляем серию выполнений
        this.updateHabitStreak(habitIndex);
        
        // Сохраняем изменения
        this.saveHabits();
        
        // Обновляем отображение
        this.renderHabits();
        this.updateStats();
    },
    
    updateHabitStreak(habitIndex) {
        const habit = this.state.habits[habitIndex];
        
        if (!habit.completedDates || habit.completedDates.length === 0) {
            habit.currentStreak = 0;
            habit.bestStreak = habit.bestStreak || 0;
            return;
        }
        
        // Сортируем даты выполнения
        const sortedDates = [...habit.completedDates].sort();
        
        // Получаем текущую дату
        const today = new Date();
        today.setHours(0, 0, 0, 0);
        const yesterdayStr = this.formatDate(new Date(today.getTime() - 86400000)); // -1 день
        const todayStr = this.formatDate(today);
        
        // Получаем последнюю дату выполнения
        const lastCompletedDate = sortedDates[sortedDates.length - 1];
        
        // Если последняя дата выполнения это не сегодня и не вчера, то серия прервана
        if (lastCompletedDate !== todayStr && lastCompletedDate !== yesterdayStr) {
            habit.currentStreak = 1; // Начинаем новую серию с 1
        } else {
            // Считаем текущую серию
            let currentStreak = 1;
            let previousDate = null;
            
            // Идем с конца списка дат
            for (let i = sortedDates.length - 1; i >= 0; i--) {
                const currentDate = new Date(sortedDates[i] + 'T00:00:00');
                
                // Если это первая дата или предыдущая дата это следующий день
                if (previousDate === null || 
                    Math.abs(previousDate - currentDate) === 86400000) {
                    currentStreak++;
                    previousDate = currentDate;
                } else {
                    break; // Серия прервана
                }
            }
            
            habit.currentStreak = currentStreak;
        }
        
        // Обновляем лучшую серию, если текущая лучше
        if (!habit.bestStreak || habit.currentStreak > habit.bestStreak) {
            habit.bestStreak = habit.currentStreak;
        }
    },
    
    updateStats() {
        // Получаем элементы статистики
        const totalElement = document.getElementById('total-habits');
        const activeElement = document.getElementById('active-habits');
        const streakElement = document.getElementById('longest-streak');
        const completionElement = document.getElementById('completion-rate');
        
        // Если нет элементов статистики, выходим
        if (!totalElement && !activeElement && !streakElement && !completionElement) {
            return;
        }
        
        // Получаем общее количество привычек
        const totalHabits = this.state.habits.length;
        
        // Получаем количество активных привычек (выполненных сегодня)
        const today = this.formatDate(new Date());
        const activeHabits = this.state.habits.filter(habit => {
            return habit.completedDates && habit.completedDates.includes(today);
        }).length;
        
        // Получаем самую длинную серию
        let longestStreak = 0;
        this.state.habits.forEach(habit => {
            if (habit.bestStreak && habit.bestStreak > longestStreak) {
                longestStreak = habit.bestStreak;
            }
        });
        
        // Рассчитываем процент выполнения за последнюю неделю
        const weekDays = this.getWeekDays();
        let totalPossible = 0;
        let totalCompleted = 0;
        
        this.state.habits.forEach(habit => {
            weekDays.forEach(date => {
                const dateStr = this.formatDate(date);
                const shouldBeActive = this.shouldHabitBeActiveOnDate(habit, date);
                
                if (shouldBeActive) {
                    totalPossible++;
                    
                    if (habit.completedDates && habit.completedDates.includes(dateStr)) {
                        totalCompleted++;
                    }
                }
            });
        });
        
        // Рассчитываем процент выполнения
        const completionRate = totalPossible > 0 ? Math.round((totalCompleted / totalPossible) * 100) : 0;
        
        // Обновляем элементы статистики
        if (totalElement) totalElement.textContent = totalHabits;
        if (activeElement) activeElement.textContent = activeHabits;
        if (streakElement) streakElement.textContent = longestStreak;
        if (completionElement) completionElement.textContent = completionRate + '%';
        
        // Обновляем статистику в состоянии
        this.state.stats = {
            totalHabits,
            activeHabits,
            longestStreak,
            completionRate,
            totalCompleted
        };
    },
    
    renderHabits() {
        const habitsList = document.getElementById('habits-list');
        const emptyState = document.getElementById('empty-habits-state');
        
        if (!habitsList) return;
        
        // Очищаем список привычек, но сохраняем пустое состояние
        const childrenToKeep = [];
        if (emptyState) {
            childrenToKeep.push(emptyState);
        }
        
        while (habitsList.firstChild) {
            if (childrenToKeep.includes(habitsList.firstChild)) {
                break;
            }
            habitsList.removeChild(habitsList.firstChild);
        }
        
        // Показываем пустое состояние, если нет привычек
        if (this.state.habits.length === 0) {
            if (emptyState) {
                emptyState.style.display = 'flex';
            }
            return;
        }
        
        // Скрываем пустое состояние
        if (emptyState) {
            emptyState.style.display = 'none';
        }
        
        // Получаем даты недели для отображения
        const weekDays = this.getWeekDays();
        
        // Рендерим каждую привычку
        this.state.habits.forEach(habit => {
            const habitElement = this.createHabitElement(habit, weekDays);
            habitsList.insertBefore(habitElement, emptyState);
        });
    },
    
    createHabitElement(habit, weekDays) {
        const habitElement = document.createElement('div');
        habitElement.className = 'habit-item';
        habitElement.setAttribute('data-habit-id', habit.id);
        
        // Создаем заголовок привычки
        const headerElement = document.createElement('div');
        headerElement.className = 'habit-header';
        
        const infoElement = document.createElement('div');
        infoElement.className = 'habit-info';
        
        const iconElement = document.createElement('div');
        iconElement.className = 'habit-icon';
        iconElement.style.backgroundColor = habit.color || '#4CAF50';
        iconElement.innerHTML = `<i class="${habit.icon || 'fas fa-check'}"></i>`;
        
        const textElement = document.createElement('div');
        textElement.className = 'habit-text';
        
        const nameElement = document.createElement('div');
        nameElement.className = 'habit-name';
        nameElement.textContent = habit.name;
        
        const descriptionElement = document.createElement('div');
        descriptionElement.className = 'habit-description';
        descriptionElement.textContent = habit.description || '';
        
        textElement.appendChild(nameElement);
        if (habit.description) {
            textElement.appendChild(descriptionElement);
        }
        
        infoElement.appendChild(iconElement);
        infoElement.appendChild(textElement);
        
        const actionsElement = document.createElement('div');
        actionsElement.className = 'habit-actions';
        
        const editButton = document.createElement('button');
        editButton.className = 'habit-edit';
        editButton.innerHTML = '<i class="fas fa-edit"></i>';
        editButton.addEventListener('click', () => this.editHabit(habit.id));
        
        const deleteButton = document.createElement('button');
        deleteButton.className = 'habit-delete';
        deleteButton.innerHTML = '<i class="fas fa-trash-alt"></i>';
        deleteButton.addEventListener('click', () => this.deleteHabit(habit.id));
        
        actionsElement.appendChild(editButton);
        actionsElement.appendChild(deleteButton);
        
        headerElement.appendChild(infoElement);
        headerElement.appendChild(actionsElement);
        
        // Добавляем информацию о серии
        const streakElement = document.createElement('div');
        streakElement.className = 'habit-streak';
        streakElement.innerHTML = `<i class="fas fa-fire"></i> Серия: ${habit.currentStreak || 0} дн.`;
        
        // Создаем флажки для отметки выполнения
        const checkboxesElement = document.createElement('div');
        checkboxesElement.className = 'habit-checkboxes';
        
        // Создаем флажки для каждого дня недели
        weekDays.forEach(date => {
            const dateStr = this.formatDate(date);
            const checkboxContainer = document.createElement('div');
            checkboxContainer.className = 'habit-day';
            
            // Проверяем, должна ли быть выполнена привычка в этот день
            const shouldBeActive = this.shouldHabitBeActiveOnDate(habit, date);
            
            // Проверяем, выполнена ли уже привычка в этот день
            const isCompleted = habit.completedDates && habit.completedDates.includes(dateStr);
            
            const checkbox = document.createElement('div');
            checkbox.className = 'habit-checkbox';
            
            if (!shouldBeActive) {
                checkbox.classList.add('disabled');
                checkbox.innerHTML = '-';
            } else if (isCompleted) {
                checkbox.classList.add('checked');
                checkbox.innerHTML = '<i class="fas fa-check"></i>';
            }
            
            // Добавляем обработчик клика для активных флажков
            if (shouldBeActive) {
                checkbox.addEventListener('click', () => {
                    this.toggleHabitCompletion(habit.id, dateStr);
                });
            }
            
            // Добавляем метку дня
            const dayLabel = document.createElement('div');
            dayLabel.className = 'habit-day-label';
            dayLabel.textContent = date.getDate();
            
            checkboxContainer.appendChild(checkbox);
            checkboxContainer.appendChild(dayLabel);
            checkboxesElement.appendChild(checkboxContainer);
        });
        
        // Собираем все элементы вместе
        habitElement.appendChild(headerElement);
        habitElement.appendChild(streakElement);
        habitElement.appendChild(checkboxesElement);
        
        return habitElement;
    },
    
    formatDate(date) {
        return `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, '0')}-${String(date.getDate()).padStart(2, '0')}`;
    },
    
    shouldHabitBeActiveOnDate(habit, date) {
        const dayOfWeek = date.getDay(); // 0 = воскресенье, 1 = понедельник, и т.д.
        
        // Для ежедневных привычек
        if (habit.frequency === 'daily') {
            return true;
        }
        
        // Для привычек по дням недели
        if (habit.frequency === 'weekly' && habit.weekdays && habit.weekdays.includes(dayOfWeek.toString())) {
            return true;
        }
        
        // Для привычек с кастомной частотой
        if (habit.frequency === 'custom' && habit.customDays > 0) {
            const startDate = new Date(habit.createdAt);
            const diffTime = Math.abs(date - startDate);
            const diffDays = Math.floor(diffTime / (1000 * 60 * 60 * 24));
            
            return diffDays % habit.customDays === 0;
        }
        
        return false;
    },
    
    openHabitModal(habitId = null) {
        const modal = document.getElementById('habit-modal');
        const modalTitle = document.getElementById('habit-modal-title');
        const form = document.getElementById('habit-form');
        
        // Сбрасываем форму
        form.reset();
        
        // Очищаем выбранные элементы
        document.querySelectorAll('.icon-option.selected, .color-option.selected, .weekday-option.selected').forEach(item => {
            item.classList.remove('selected');
        });
        
        // Скрываем группы дополнительных опций
        document.getElementById('weekdays-group').style.display = 'none';
        document.getElementById('custom-frequency-group').style.display = 'none';
        document.getElementById('reminder-time-group').style.display = 'none';
        
        if (habitId) {
            // Режим редактирования
            this.state.selectedHabitId = habitId;
            const habit = this.state.habits.find(h => h.id === habitId);
            
            if (habit) {
                modalTitle.textContent = 'Редактировать привычку';
                
                // Заполняем форму данными привычки
                document.getElementById('habit-name').value = habit.name;
                document.getElementById('habit-description').value = habit.description || '';
                
                // Выбираем иконку
                if (habit.icon) {
                    const iconOption = Array.from(document.querySelectorAll('.icon-option')).find(option => {
                        return option.querySelector('i').className === habit.icon;
                    });
                    
                    if (iconOption) {
                        iconOption.classList.add('selected');
                    }
                }
                
                // Выбираем цвет
                if (habit.color) {
                    const colorOption = Array.from(document.querySelectorAll('.color-option')).find(option => {
                        return option.dataset.color === habit.color;
                    });
                    
                    if (colorOption) {
                        colorOption.classList.add('selected');
                    }
                }
                
                // Выбираем частоту
                const frequencySelect = document.getElementById('habit-frequency');
                frequencySelect.value = habit.frequency || 'daily';
                
                // Выбираем дни недели для еженедельных привычек
                if (habit.frequency === 'weekly' && habit.weekdays) {
                    document.getElementById('weekdays-group').style.display = 'block';
                    
                    habit.weekdays.forEach(day => {
                        const weekdayOption = document.querySelector(`.weekday-option[data-day="${day}"]`);
                        if (weekdayOption) {
                            weekdayOption.classList.add('selected');
                        }
                    });
                }
                
                // Устанавливаем значение для кастомной частоты
                if (habit.frequency === 'custom' && habit.customDays) {
                    document.getElementById('custom-frequency-group').style.display = 'block';
                    document.getElementById('custom-days').value = habit.customDays;
                }
                
                // Настраиваем напоминания
                const reminderToggle = document.getElementById('reminder-toggle');
                if (habit.reminder) {
                    reminderToggle.checked = true;
                    document.getElementById('reminder-time-group').style.display = 'block';
                    document.getElementById('reminder-time').value = habit.reminderTime || '09:00';
                }
            }
        } else {
            // Режим создания
            this.state.selectedHabitId = null;
            modalTitle.textContent = 'Создать новую привычку';
            
            // Выбираем первую иконку и цвет по умолчанию
            const firstIcon = document.querySelector('.icon-option');
            if (firstIcon) firstIcon.classList.add('selected');
            
            const defaultColor = document.querySelector('.color-option');
            if (defaultColor) defaultColor.classList.add('selected');
        }
        
        if (modal) {
            modal.classList.add('open');
        }
    },
    
    closeHabitModal() {
        const modal = document.getElementById('habit-modal');
        if (modal) {
            modal.classList.remove('open');
        }
        this.state.selectedHabitId = null;
    },
    
    saveHabitFromForm() {
        const nameInput = document.getElementById('habit-name');
        const descriptionInput = document.getElementById('habit-description');
        const frequencySelect = document.getElementById('habit-frequency');
        
        // Получаем значения из формы
        const name = nameInput.value.trim();
        const description = descriptionInput.value.trim();
        const frequency = frequencySelect.value;
        
        // Проверяем обязательные поля
        if (!name) {
            alert('Пожалуйста, введите название привычки');
            return;
        }
        
        // Получаем выбранную иконку
        const selectedIcon = document.querySelector('.icon-option.selected');
        let icon = 'fas fa-check'; // иконка по умолчанию
        
        if (selectedIcon) {
            const iconElement = selectedIcon.querySelector('i');
            if (iconElement) {
                icon = iconElement.className;
            }
        }
        
        // Получаем выбранный цвет
        const selectedColor = document.querySelector('.color-option.selected');
        let color = '#4CAF50'; // цвет по умолчанию
        
        if (selectedColor) {
            color = selectedColor.dataset.color || color;
        }
        
        // Получаем дни недели для еженедельных привычек
        let weekdays = [];
        if (frequency === 'weekly') {
            document.querySelectorAll('.weekday-option.selected').forEach(option => {
                weekdays.push(option.dataset.day);
            });
            
            if (weekdays.length === 0) {
                alert('Пожалуйста, выберите хотя бы один день недели');
                return;
            }
        }
        
        // Получаем значение для кастомной частоты
        let customDays = 1;
        if (frequency === 'custom') {
            customDays = parseInt(document.getElementById('custom-days').value) || 1;
            if (customDays < 1) {
                alert('Пожалуйста, введите положительное число дней');
                return;
            }
        }
        
        // Получаем настройки напоминания
        const reminderToggle = document.getElementById('reminder-toggle');
        let reminder = false;
        let reminderTime = '09:00';
        
        if (reminderToggle.checked) {
            reminder = true;
            reminderTime = document.getElementById('reminder-time').value || '09:00';
        }
        
        // Создаем или обновляем привычку
        const userId = localStorage.getItem('lifeQuestUserId');
        
        if (this.state.selectedHabitId) {
            // Обновляем существующую привычку
            const habitIndex = this.state.habits.findIndex(h => h.id === this.state.selectedHabitId);
            
            if (habitIndex !== -1) {
                const habit = this.state.habits[habitIndex];
                
                habit.name = name;
                habit.description = description;
                habit.icon = icon;
                habit.color = color;
                habit.frequency = frequency;
                habit.weekdays = weekdays;
                habit.customDays = customDays;
                habit.reminder = reminder;
                habit.reminderTime = reminderTime;
                habit.updatedAt = new Date().toISOString();
            }
        } else {
            // Создаем новую привычку
            const newHabit = {
                id: 'habit_' + new Date().getTime(),
                userId,
                name,
                description,
                icon,
                color,
                frequency,
                weekdays,
                customDays,
                reminder,
                reminderTime,
                completedDates: [],
                currentStreak: 0,
                bestStreak: 0,
                createdAt: new Date().toISOString(),
                updatedAt: new Date().toISOString()
            };
            
            this.state.habits.push(newHabit);
        }
        
        // Сохраняем изменения
        this.saveHabits();
        
        // Закрываем модальное окно
        this.closeHabitModal();
        
        // Обновляем отображение
        this.renderHabits();
        this.updateStats();
    },
    
    editHabit(habitId) {
        this.openHabitModal(habitId);
    },
    
    deleteHabit(habitId) {
        if (confirm('Вы уверены, что хотите удалить эту привычку?')) {
            // Удаляем привычку из массива
            this.state.habits = this.state.habits.filter(habit => habit.id !== habitId);
            
            // Сохраняем изменения
            this.saveHabits();
            
            // Обновляем отображение
            this.renderHabits();
            this.updateStats();
        }
    }
};

// Инициализируем модуль привычек при загрузке страницы
document.addEventListener('DOMContentLoaded', () => {
    habitsModule.init();
});
