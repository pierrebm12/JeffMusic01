# JeffMusic Backend

Express + MySQL backend para jeffmusic-01.

## Requisitos

- Node.js 18+
- MySQL 8+ corriendo localmente

## Instalación

```bash
cd server
npm install
```

## Configuración

Edita `.env` con tus credenciales de MySQL:

```
DB_HOST=localhost
DB_USER=root
DB_PASSWORD=tu_password
DB_NAME=jeffmusic
DB_PORT=3306
ADMIN_PASSWORD=jeff2024
CORS_ORIGIN=http://localhost:5173
```

## Base de datos

### Inicializar (crear tablas)

```bash
npm run db:init
```

### Seed (datos iniciales)

```bash
npm run db:seed
```

## Desarrollo

```bash
npm run dev
```

Server corre en `http://localhost:3001`

## API Endpoints

| Method | Endpoint | Description |
|--------|----------|-------------|
| GET | `/api/shows` | Listar shows |
| POST | `/api/shows` | Crear show |
| PUT | `/api/shows/:id` | Actualizar show |
| DELETE | `/api/shows/:id` | Eliminar show |
| GET | `/api/photos` | Listar fotos |
| POST | `/api/photos` | Crear foto |
| PUT | `/api/photos/:id` | Actualizar foto |
| DELETE | `/api/photos/:id` | Eliminar foto |
| GET | `/api/videos` | Listar videos |
| POST | `/api/videos` | Crear video |
| PUT | `/api/videos/:id` | Actualizar video |
| DELETE | `/api/videos/:id` | Eliminar video |
| POST | `/api/admin/login` | Login admin |
| POST | `/api/admin/logout` | Logout admin |
