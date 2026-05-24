# 🎵 JeffMusic — Landing Page

Landing page profesional para **Jeff Buitrago**, cantante y artista musical. Sitio web bilingüe (español/inglés) con panel de administración completo, desarrollado con React + Vite + Express + MySQL.

---

## 🧩 Componentes y Funcionalidades

### Navegación (`Navigation.jsx`)
- Menú responsive con hamburguesa en mobile
- Enlaces suaves a cada sección (Hero, Biografía, Fotos, Videos, Shows, Contacto)
- Redes sociales: Instagram, Facebook, YouTube
- Enlace a WhatsApp directo
- Botón de cambio de idioma (ES/EN)
- **Seguridad:** Sin acceso público al panel Admin

### Hero (`Hero.jsx`)
- Imagen de fondo principal con overlay oscuro
- Título, subtítulo y texto editables desde Admin (ES/EN)
- Efecto de parallax o fade en scroll
- Responsive en todos los dispositivos

### Biografía (`Biography.jsx`)
- Texto bilingüe editable desde Admin
- Diseño limpio con tipografía elegante
- Imagen de fondo opcional

### Galería de Fotos (`PhotoGallery.jsx`)
- Grid responsivo de imágenes
- Animación de aparición con framer-motion
- Carga dinámica desde el servidor
- Imágenes subidas por el Admin

### Galería de Videos (`VideoGallery.jsx`)
- **Reproductor de video con auto-avance** (intervalo configurable desde Admin, por defecto 8s)
- **Botón flotante de mute/unmute** (icono VolumeX/Volume2)
- **Silenciado automático al hacer scroll** — usa `IntersectionObserver`: al salir de la vista se silencia, al volver se reactiva
- Transiciones animadas entre videos (swipe táctil + dots indicadores)
- Proporción 9:16 en mobile, 16:9 en desktop
- Título del video mostrado con gradiente
- Videos de respaldo (fallback) en caso de que no haya datos del servidor

### Calendario de Shows (`Shows.jsx`)
- Calendario mensual dinámico con navegación entre meses
- **Iconos de micrófono:** verde (disponible), rojo (reservado)
- **Días vacíos cliqueables:** abren modal de consulta → redirección a WhatsApp
- **Imagen de fondo del calendario:** seleccionable desde Admin (general + por mes)
- **Fondo por mes:** 12 campos de imagen en Admin guardados como JSON en `data_json`
- Período visual: desde el mes actual hasta +12 meses
- Modal de reserva para shows disponibles
- Totalmente responsivo (celda, navegación, tipografía)

### Formulario de Contacto (`ContactForm.jsx`)
- Campos: nombre, email, mensaje
- Envío backend con Node.js (Nodemailer)
- Diseño oscuro consistente

### Footer (`Footer.jsx`)
- Enlaces a redes sociales: Instagram, Facebook, YouTube
- WhatsApp directo
- Copyright y créditos
- Diseño responsivo

---

## ⚙️ Panel de Administración (`/admin`)

Accesible solo por URL (sin enlace público en la navegación).

### Pestañas:
| Pestaña | Función |
|---------|---------|
| **Shows** | CRUD de shows (lugar, día, hora, disponible) |
| **Secciones** | Editar Hero, Biografía, Calendario (imagen + textos ES/EN) |
| **Fotos** | Subir/editar/eliminar fotos |
| **Videos** | Subir/editar/eliminar videos + **configuración de auto-avance** |

### Gestión del Calendario:
- Subir imagen de fondo general para el calendario
- 12 campos de imagen (uno por mes) guardados en `data_json`
- Vista previa de cada imagen antes de guardar

### Gestión de Videos:
- Campo **"Auto-advance (seconds)"** para controlar cada cuánto avanza el video
- Guardado automático en sección `videos_gallery` con persistencia en `data_json`

---

## 🧠 Stack Técnico

| Capa | Tecnología |
|------|-----------|
| Frontend | React 19, Vite, Tailwind CSS v4, Framer Motion, Lucide React |
| Backend | Express.js, MySQL (mysql2), Nodemailer |
| API Client | Hooks personalizados (`@workspace/api-client-react`) |
| DB | MySQL con tabla `site_sections` (incluye columna `data_json` para campos flexibles) |
| Despliegue | Compatible con Replit, Vercel (frontend), Railway/Render (backend) |

---

## 🗄️ Base de Datos

### Tabla `site_sections`
Almacena todo el contenido editable (Hero, Biografía, Calendario, etc.).

| Columna | Tipo | Descripción |
|---------|------|-------------|
| `section_key` | VARCHAR PK | Identificador único (ej: `hero`, `biography`, `calendar`, `videos_gallery`) |
| `media_url` | TEXT | URL de imagen/video de fondo |
| `title_es` / `title_en` | TEXT | Título bilingüe |
| `subtitle_es` / `subtitle_en` | TEXT | Subtítulo bilingüe |
| `text1_es` / `text1_en` | TEXT | Texto principal bilingüe |
| `data_json` | TEXT | JSON con datos flexibles (fondos por mes, config de videos, etc.) |
| `updated_at` | TIMESTAMP | Última actualización |

### Otras tablas: `shows`, `photos`, `videos`, `admin_users`

---

## 🌐 API Endpoints

| Método | Ruta | Descripción |
|--------|------|-------------|
| GET | `/api/home` | Datos completos para la landing (secciones, shows, fotos, videos) |
| GET | `/api/sections` | Lista todas las secciones |
| GET | `/api/sections/:key` | Obtiene una sección por clave |
| PUT | `/api/sections/:key` | Crea o actualiza (upsert) una sección |
| GET/POST | `/api/shows` | Listar / crear shows |
| PUT/DELETE | `/api/shows/:id` | Actualizar / eliminar show |
| GET/POST | `/api/photos` | Listar / crear fotos |
| PUT/DELETE | `/api/photos/:id` | Actualizar / eliminar foto |
| GET/POST | `/api/videos` | Listar / crear videos |
| PUT/DELETE | `/api/videos/:id` | Actualizar / eliminar video |
| POST | `/api/upload/photo` | Subir foto (multipart) |
| POST | `/api/upload/video` | Subir video (multipart) |
| POST | `/api/contact` | Enviar mensaje de contacto |
| POST | `/api/admin/login` | Inicio de sesión admin |
| POST | `/api/admin/logout` | Cierre de sesión admin |

---

## 🎨 Diseño

- **Tema oscuro** con acentos en **dorado (`#d4af37`)**
- Animaciones suaves con Framer Motion
- Transiciones entre videos con efecto slide
- Efectos de hover en cards y botones
- Scrollbar personalizada (oculta en navegación)
- Gradientes en títulos y overlays
- Totalmente responsivo: mobile, tablet, desktop
- Usa `min-h-[100dvh]` para ocupar toda la pantalla en móviles

---

## 🔧 Instalación y Desarrollo

```bash
# Clonar
git clone <repo>
cd jeffmusic-01

# Instalar dependencias
npm install

# Configurar variables de entorno (ver .env.example)
# DB_HOST, DB_USER, DB_PASS, DB_NAME, SMTP_*, etc.

# Migraciones
node server/db/migrate-add-data-json.js

# Iniciar en desarrollo
npm run dev        # Frontend + Backend
```

---

## 🚀 Build de Producción

```bash
npm run build      # Genera dist/
```

El frontend compilado se sirve desde el servidor Express en producción.

---

## 👤 Contacto

- **WhatsApp:** [+1 571 603 8060](https://wa.me/15716038060)
- **Instagram:** [@jeffmusic01](https://instagram.com/jeffmusic01)
- **Facebook:** [Jeff Buitrago Oficial](https://facebook.com/JeffBuitragoOficial)
- **YouTube:** [@jeffersonbuitrago95](https://youtube.com/@jeffersonbuitrago95)
