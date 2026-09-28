# 🎓 CRM Educativo – FICCT (UAGRM) · Grupo 5 SC

Sistema de Gestión de Relaciones con Clientes (CRM) enfocado en la captación, seguimiento, conversión y matriculación de prospectos para programas académicos de postgrado y educación continua.

---

## 🛠️ Stack Tecnológico y Arquitectura

- **Backend:** Laravel 12 (PHP 8.3+)
- **Puente:** Inertia.js (SPA sin API REST desacoplada)
- **Frontend:** React 19 + Vite + Tailwind CSS
- **Base de Datos:** PostgreSQL
- **Iconografía y UI:** Lucide React + Sistema de Diseño Corporativo ([Design.md](docs/Design.md))
- **Arquitectura:** **Monolito Modular** — Frontend alojado en `resources/js`, controlado por rutas web en `routes/web.php`.

---

## 👥 Equipo de Desarrollo y Responsabilidades

| Desarrolladora | Rol | Módulos Principales |
|---|---|---|
| **Nataly (Dev A)** | Identidad y Trazabilidad | Auth (RBAC), Usuarios, Bitácora, Recordatorios, Pagos |
| **Nicol (Dev B)** | Núcleo Comercial | Leads, Asignación (Manual y Round-Robin), Pipeline Kanban, Matrícula |
| **Jael (Dev C)** | Plataforma e Integración | Base Inertia, Catálogos Lookups, Importación CSV, Proxy Catálogo Externo |

---

## 🚀 Requisitos Previos

Asegúrate de contar con las siguientes herramientas instaladas en tu sistema:
- **PHP** >= 8.3 (con extensiones `pdo_pgsql`, `pgsql`, `mbstring`, `openssl`, `curl`)
- **Composer** >= 2.6
- **Node.js** >= 18.x y **npm** >= 9.x
- **PostgreSQL** activo y escuchando en el puerto `5432`

---

## ⚙️ Instalación y Puesta en Marcha

### 1. Clonar el repositorio
```bash
git clone https://github.com/Jael-S/crm.git
cd crm
```

### 2. Instalar dependencias de PHP y JavaScript
```bash
composer install
npm install
```

### 3. Configuración de Variables de Entorno (`.env`)
Copia el archivo de ejemplo:
```bash
cp .env.example .env
php artisan key:generate
```

Asegúrate de configurar los parámetros de PostgreSQL, Zona Horaria e Idioma en tu `.env`:
```env
APP_NAME="CRM Educativo"
APP_ENV=local
APP_DEBUG=true
APP_URL=http://localhost:8000

# Configuración Regional (Bolivia GMT-4 y Español)
APP_TIMEZONE=America/La_Paz
APP_LOCALE=es
APP_FALLBACK_LOCALE=es
APP_FAKER_LOCALE=es_ES

# Conexión PostgreSQL
DB_CONNECTION=pgsql
DB_HOST=127.0.0.1
DB_PORT=5432
DB_DATABASE=crm_educativo_db
DB_USERNAME=postgres
DB_PASSWORD=tu_contraseña_aqui
```

### 4. Migraciones y Seeders (Poblar Base de Datos)
Ejecuta la creación limpia de tablas y datos de prueba:
```bash
php artisan migrate:fresh --seed
```

---

## 🔑 Credenciales de Acceso (Cuentas Demo)

Todas las cuentas demo utilizan la misma contraseña para facilitar las pruebas y defensa:
> **Contraseña global:** `password123`

| Rol | Correo Electrónico | Alcance de Permisos |
|---|---|---|
| **Administrador** | `admin@crm.bo` | Acceso total: CRUD de usuarios, activación/desactivación de cuentas, configuración de Round-Robin, Catálogos base. |
| **Coordinador** | `coordinador@crm.bo` | Supervisión comercial: asignación de prospectos por cartera, importación CSV, monitoreo de embudo. |
| **Vendedor 1** | `vendedor1@crm.bo` | Operativo: cartera propia asignada y bolsa común de prospectos sin asignar. |
| **Vendedor 2** | `vendedor2@crm.bo` | Operativo: cartera propia asignada y bolsa común. |

*(Nota: En la pantalla de Login `/login` dispones de botones de acceso rápido que rellenan automáticamente las credenciales de cada rol).*

---

## 🖥️ Ejecución en Entorno de Desarrollo

Para levantar la aplicación, abre dos terminales:

**Terminal 1 (Backend Laravel):**
```bash
php artisan serve
```
*(Disponible en: `http://127.0.0.1:8000`)*

**Terminal 2 (Frontend Vite con Hot-Reload):**
```bash
npm run dev
```

O si prefieres ejecutar ambos en una sola terminal:
```bash
npm run start
```

---

## 🧪 Pruebas Automatizadas

El proyecto cuenta con suite de pruebas de integración para el módulo de identidad, RBAC y autorización:
```bash
php artisan test
```

---

## 📂 Estructura Principal del Proyecto

```text
crm/
├── app/
│   ├── Http/
│   │   ├── Controllers/
│   │   │   ├── Auth/AuthController.php       # Login, Logout
│   │   │   ├── UsuarioController.php         # CRUD Usuarios, toggle estado, Round-Robin
│   │   │   ├── DashboardController.php       # Panel adaptado por rol
│   │   │   └── LookupController.php          # Orígenes, etapas, motivos
│   │   ├── Middleware/
│   │   │   ├── CheckRole.php                 # RBAC estricto por rol
│   │   │   └── HandleInertiaRequests.php     # Estado compartido de sesión y usuario
│   │   └── Requests/                         # FormRequests de validación en español
│   ├── Models/
│   │   ├── Usuario.php                       # Modelo principal de autenticación
│   │   ├── Rol.php                           # Administrador, Coordinador, Vendedor
│   │   ├── EtapaPipeline.php                 # 6 etapas fijas del embudo comercial
│   │   ├── OrigenLead.php                    # Canales de captación
│   │   └── MotivoPerdida.php                 # Razones de descarte comercial
│   └── Services/                             # Lógica de negocio desacoplada
├── database/
│   ├── migrations/                           # Migraciones PostgreSQL
│   └── seeders/                              # Poblado de roles, usuarios y catálogos
├── resources/
│   ├── css/app.css                           # Variables y tokens de diseño (Design.md)
│   └── js/
│       ├── Layouts/AppLayout.jsx             # Navbar 80px, Sidebar 315px, Menú por rol
│       ├── Pages/
│       │   ├── Auth/Login.jsx                # Login corporativo
│       │   ├── Dashboard/Index.jsx           # Métricas por rol
│       │   ├── Users/Index.jsx               # Gestión y alta de usuarios
│       │   └── Lookups/Index.jsx             # Consulta de catálogos
│       └── Shared/                           # Componentes UI reutilizables
└── routes/
    ├── web.php                               # Rutas Inertia SPA
    └── api.php                               # Endpoints de catálogos
```
