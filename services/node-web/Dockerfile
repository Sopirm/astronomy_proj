# Node.js Space Dashboard Dockerfile
# Multi-stage build для оптимизации размера

# ===== BUILD STAGE =====
FROM node:18-alpine AS builder

# Установка системных зависимостей
RUN apk add --no-cache \
    python3 \
    make \
    g++ \
    && rm -rf /var/cache/apk/*

WORKDIR /build

# Копирование package files для кэширования слоёв
COPY package*.json ./

# Установка зависимостей
RUN npm install --silent

# ===== PRODUCTION STAGE =====
FROM node:18-alpine AS production

# Создание пользователя для безопасности
RUN addgroup -g 1001 -S nodejs && \
    adduser -S nodeuser -u 1001 -G nodejs

# Установка dumb-init и wget для health check
RUN apk add --no-cache dumb-init wget

# Рабочая директория
WORKDIR /app

# Копирование зависимостей из build stage
COPY --from=builder --chown=nodeuser:nodejs /build/node_modules ./node_modules

# Копирование исходного кода
COPY --chown=nodeuser:nodejs . .

# Создание директории для логов
RUN mkdir -p /app/logs && \
    chown -R nodeuser:nodejs /app/logs

# Переключение на обычного пользователя
USER nodeuser

# Порт приложения
EXPOSE 3001

# Health check
HEALTHCHECK --interval=30s --timeout=10s --start-period=10s --retries=3 \
  CMD wget --quiet --tries=1 --spider http://localhost:3001/health || exit 1

# Запуск с dumb-init для правильной обработки сигналов
ENTRYPOINT ["dumb-init", "--"]
CMD ["node", "src/app.js"]

# Метаданные
LABEL maintainer="Кассиопея Team"
LABEL description="Космический дашборд на Node.js"
LABEL version="1.0.0"
