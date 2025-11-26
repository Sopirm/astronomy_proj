## Схема взаимодействий


```mermaid
flowchart LR
  subgraph Client["Браузер пользователя"]
    UI["Dashboard<br/>(HTML/JS/Bootstrap)"]
  end

  subgraph Edge["Nginx"]
    N["Nginx reverse proxy"]
  end

  subgraph Web["PHP/Laravel"]
    LAPI["Маршруты Laravel:<br/>/api/iss/* /api/jwst/* /api/astro/* /dashboard"]
    Views["Шаблоны Blade"]
    Services["Сервисы/DTO"]
  end

  subgraph Rust["Rust сервис rust_iss"]
    RAPI["GET /health /last /fetch /osdr/*"]
    Scheduler["Фоновый сбор данных"]
  end

  subgraph DB["PostgreSQL"]
    T1["iss_fetch_log"]
    T2["osdr_items"]
    T3["cache_*"]
  end

  subgraph Legacy["Legacy (Pascal)"]
    Pascal["Генерация CSV/данных"]
  end

  Ext1["WhereTheISS и др. API"]
  Ext2["NASA OSDR / JWST API"]
  Ext3["AstronomyAPI events"]

  UI -->|HTTP| N
  N -->|php-fpm| LAPI
  LAPI --> Views
  LAPI <--> Services
  Services -->|HTTP| RAPI
  Services -->|HTTP| Ext2
  Services -->|HTTP| Ext3
  RAPI --> T1
  RAPI --> T2
  Scheduler --> Ext1
  Scheduler --> Ext2
  Pascal --> DB
  DB <--> LAPI
```
### 🛎️ Легенда карты
- **rust_iss** — rust-сервис: опрос внешних космических API (ISS, NASA OSDR и др.), периодическая запись сырых данных/логов в PostgreSQL, собственные REST-ручки для выборок/триггеров.
- **php_web** — веб-сайт на Laravel + Bootstrap с Dashboard’ами и API-прокси-ручкам
- **iss_db** — PostgreSQL (хранение логов, кэшей и производных данных).
- **pascal_legacy** — легаси-утилита (Pascal), периодически генерирует CSV и/или записи для БД.
- **nginx** — фронтовой reverse-proxy (HTTP 80 → php-fpm).

