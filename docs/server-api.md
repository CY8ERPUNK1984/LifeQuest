# Серверная часть и API

## Архитектура сервера

```mermaid
flowchart TD
    Client[Клиентский браузер] <-->|HTTP/API вызовы| Server[Node.js Express сервер]
    
    subgraph server [Серверные компоненты]
        Server --> AuthRoutes[Маршруты аутентификации]
        Server --> UserRoutes[Маршруты пользователей]
        Server --> Middleware[Middleware]
        
        AuthRoutes --> AuthController[Контроллер аутентификации]
        UserRoutes --> UserController[Контроллер пользователей]
        
        AuthController --> UserService[Сервис пользователей]
        UserController --> UserService
        
        UserService --> DataStorage[Файловое хранилище]
    end
    
    style server fill:#e1d5e7,stroke:#9673a6,stroke-width:1px
    style Client fill:#f9f9f9,stroke:#333,stroke-width:2px
    style Server fill:#d5e8d4,stroke:#82b366,stroke-width:2px
    style DataStorage fill:#dae8fc,stroke:#6c8ebf,stroke-width:2px
```

## Структура REST API

```mermaid
classDiagram
    class AuthAPI {
        POST /auth/login
        POST /auth/verify
    }
    
    class UsersAPI {
        GET /users
        GET /users/:id
        POST /users
        PUT /users/:id
        DELETE /users/:id
    }
    
    class Server {
        +app: Express
        +port: Number
        +middleware()
        +routes()
        +start()
    }
    
    class AuthMiddleware {
        +verifyToken(req, res, next)
    }
    
    Server --> AuthAPI : регистрирует
    Server --> UsersAPI : регистрирует
    AuthAPI --> AuthMiddleware : использует
    UsersAPI --> AuthMiddleware : использует
    
    note for AuthAPI "API аутентификации\nВход и проверка токенов"
    note for UsersAPI "API пользователей\nУправление учетными записями"
    note for AuthMiddleware "Промежуточное ПО\nПроверка JWT токенов"
```

## Поток аутентификации и API запросов

```mermaid
sequenceDiagram
    participant Client as Клиент (браузер)
    participant Server as Express сервер
    participant Auth as Сервис аутентификации
    participant Storage as Файловое хранилище
    
    %% Регистрация пользователя
    Client ->> Server: POST /users (регистрация)
    Server ->> Storage: Проверка существующего email
    Storage -->> Server: Результат проверки
    
    alt Email уже используется
        Server -->> Client: 400 Bad Request (email занят)
    else Email свободен
        Server ->> Storage: Сохранение пользователя
        Storage -->> Server: Пользователь сохранен
        Server ->> Auth: Создание токена
        Auth -->> Server: JWT токен
        Server -->> Client: 201 Created (пользователь + токен)
    end
    
    %% Вход в систему
    Client ->> Server: POST /auth/login (вход)
    Server ->> Storage: Поиск пользователя по email
    Storage -->> Server: Данные пользователя (если найден)
    
    alt Пользователь не найден или пароль не совпадает
        Server -->> Client: 401 Unauthorized
    else Данные верны
        Server ->> Auth: Создание токена
        Auth -->> Server: JWT токен
        Server -->> Client: 200 OK (пользователь + токен)
    end
    
    %% Запрос с токеном
    Client ->> Server: GET /users/:id с Authorization header
    Server ->> Auth: Верификация токена
    
    alt Токен недействителен
        Auth -->> Server: Ошибка верификации
        Server -->> Client: 401 Unauthorized
    else Токен действителен
        Auth -->> Server: Расшифрованный токен (идентификатор пользователя)
        Server ->> Storage: Запрос данных пользователя
        Storage -->> Server: Данные пользователя
        Server -->> Client: 200 OK (данные пользователя)
    end
```

## Структура конечных точек API

| Метод | URL | Описание | Параметры запроса | Ответ |
|-------|-----|----------|-----------------|------|
| POST | `/users` | Регистрация нового пользователя | `{name, email, password, avatar}` | `{user, token}` |
| POST | `/auth/login` | Вход пользователя | `{email, password}` | `{user, token}` |
| POST | `/auth/verify` | Проверка валидности токена | `{token, userId}` | `{valid: true/false}` |
| GET | `/users` | Получение списка пользователей | - | `[{user}, ...]` |
| GET | `/users/:id` | Получение данных пользователя | `id` (в URL) | `{user}` |
| PUT | `/users/:id` | Обновление данных пользователя | `id` (в URL), `{user data}` | `{user}` |
| DELETE | `/users/:id` | Удаление пользователя | `id` (в URL) | `{success: true}` |
