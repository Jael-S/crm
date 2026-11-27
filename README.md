# CRM Educativo - UNEXO FICCT (UAGRM)

Sistema de Gestion de Relaciones con Clientes (CRM) especializado en la captacion, seguimiento comercial, conversion y matriculacion academica de prospectos para programas de postgrado y formacion continua de la Facultad de Ingenieria en Ciencias de la Computacion y Telecomunicaciones (FICCT) de la Universidad Autonoma Gabriel Rene Moreno (UAGRM).

---

## Descripcion General del Proyecto

El CRM Educativo UNEXO centraliza el ciclo de vida completo del postulante universitario, desde el primer contacto en canales digitales (Facebook, WhatsApp, portal web, referidos o LinkedIn) hasta su formalizacion como estudiante matriculado en las cohortes activas del sistema academico externo (INF513 Proyecto 2).

El diseno esta fundamentado en una arquitectura de monolito modular basada en Laravel e Inertia.js, combinando la solidez transaccional del backend en PHP con la fluidez y reactividad de React en el cliente, bajo estrictas normas de control de acceso basado en roles (RBAC).

---

## Stack Tecnologico y Arquitectura

- Backend: Laravel 12 (PHP 8.3+)
- Puente de Integracion: Inertia.js (Arquitectura SPA sin API REST desacoplada)
- Frontend: React 19 + Vite + Tailwind CSS
- Base de Datos: PostgreSQL
- Servicio de Correo: SMTP transaccional via Brevo con plantillas Blade corporativas
- Generacion Digital: Generacion de codigos QR interoperables (Simple QR) y emision de comprobantes oficiales vectoriales en SVG
- Iconografia y UI: Lucide React y biblioteca de componentes modulares
- Integracion Externa: Comunicacion HTTP cliente con la API de matriculacion de INF513 Proyecto 2 (Gestion de Cohortes y Estudiantes)

---

## Equipo de Desarrollo y Responsabilidades

| Desarrolladora | Rol | Modulos Principales |
|---|---|---|
| Nataly Valenzuela (Dev A) | Identidad, Trazabilidad y Finanzas | Autenticacion (RBAC), Gestion de Usuarios, Bitacora de Auditoria, Recordatorios Comerciales, Recuperacion de Contrasenas por Correo (Brevo), Pasarela de Pagos, Emision de Vouchers Oficiales y Branding Institucional UNEXO FICCT. |
| Nicol Flores (Dev B) | Nucleo Comercial y Flujo de Pipeline | Gestion de Prospectos (Leads), Asignacion de Cartera (Manual y Algoritmo Round-Robin), Tablero Kanban de 6 Etapas, Descuentos Comerciales y Servicio de Envio de Matriculas a Proyecto 2. |
| Jael Sandoval (Dev C) | Plataforma Base e Integracion de Datos | Arquitectura Base Inertia.js, Catalogos y Lookups, Importacion Masiva via CSV, Consumo del Proxy de Catalogos Externos y Segmentacion de Programas para Coordinacion. |

---

## Requisitos Previos del Entorno

Para desplegar y ejecutar el sistema de manera local se requiere:
- PHP >= 8.3 (extensiones habilitadas: pdo_pgsql, pgsql, mbstring, openssl, curl, fileinfo)
- Composer >= 2.6
- Node.js >= 18.x y npm >= 9.x
- Servidor PostgreSQL activo escuchando en el puerto 5432
- Credenciales SMTP activas para envio de notificaciones por correo (Brevo u otro proveedor)

---

## Instalacion y Puesta en Marcha

### 1. Clonar el repositorio
```bash
git clone https://github.com/Jael-S/crm.git
cd crm
```

### 2. Instalar dependencias de backend y frontend
```bash
composer install
npm install
```

### 3. Configuracion de Variables de Entorno (.env)
Copiar la plantilla base y generar la clave de cifrado:
```bash
cp .env.example .env
php artisan key:generate
```

Verificar la configuracion de base de datos PostgreSQL y zona horaria:
```env
APP_NAME="CRM Educativo UNEXO"
APP_ENV=local
APP_DEBUG=true
APP_URL=http://localhost:8000

APP_TIMEZONE=America/La_Paz
APP_LOCALE=es
APP_FALLBACK_LOCALE=es

DB_CONNECTION=pgsql
DB_HOST=127.0.0.1
DB_PORT=5432
DB_DATABASE=crm_educativo
DB_USERNAME=postgres
DB_PASSWORD=tu_password

# Configuracion SMTP para recuperacion de credenciales (Brevo)
MAIL_MAILER=smtp
MAIL_HOST=smtp-relay.brevo.com
MAIL_PORT=587
MAIL_USERNAME=tu_usuario_brevo
MAIL_PASSWORD=tu_password_brevo
MAIL_ENCRYPTION=tls
MAIL_FROM_ADDRESS=tu_correo_remitente@dominio.com
MAIL_FROM_NAME="UNEXO FICCT"
```

### 4. Creacion de Tablas y Poblado de Datos Reales
Ejecutar las migraciones y los seeders del sistema:
```bash
php artisan migrate:fresh --seed
```

El seeder carga la estructura oficial con 54 prospectos bolivianos reales con nombres completos, profesiones normalizadas, canales de captacion, motivos de descarte y distribucion armonica en las 6 etapas del embudo comercial.

### 5. Compilacion de Recursos Frontend
Para compilar los paquetes de produccion:
```bash
npm run build
```

O para entorno de desarrollo con recarga en vivo:
```bash
npm run dev
```

### 6. Inicio del Servidor de Aplicacion
```bash
php artisan serve
```
El sistema quedara disponible en `http://127.0.0.1:8000`.

---

## Credenciales de Acceso y Cuentas de Demostracion

Todas las cuentas demo utilizan la misma contrasena predeterminada para facilitar la evaluacion academica:
Contrasena global: `password123`

| Rol | Correo Electronico | Nombre de Usuario | Alcance y Permisos |
|---|---|---|---|
| Administrador | admin@crm.bo | Nataly Valenzuela | Control absoluto: Auditoria, gestion de usuarios, activacion de asesores, configuracion Round-Robin, aprobacion de pagos y reportes globales consolidados. |
| Coordinador | coordinador@crm.bo | Jael Sandoval | Gestion y supervision academica: Monitoreo de su programa asignado (Diplomado en Inteligencia Artificial Aplicada), filtrado analitico exclusivo e importacion de bases de datos. |
| Vendedor 1 | vendedor1@crm.bo | Nicol Flores | Gestion comercial operativa: Cartera individual, toma de prospectos de Bolsa Comun, registro de notas de contacto y programacion de recordatorios. |
| Vendedor 2 | vendedor2@crm.bo | Carlos Mendoza | Gestion comercial operativa: Cartera individual, seguimiento de prospectos y emision de comprobantes de pago. |

Nota: La pantalla de autenticacion (`/login`) dispone de accesos directos con un clic para iniciar sesion automaticamente con cada rol.

---

## Modulos Funcionales del Sistema

### 1. Portal Web Publico (Landing Page) y Formulario de Admision 3D
- Ruta `/`: Portal institucional de UNEXO FICCT con carrusel dinamico de imagenes del campus, resumen de la historia academica, vision institucional y presentacion del equipo fundador.
- Ruta `/registro`: Formulario de pre-inscripcion publica para campanas digitales. Permite la seleccion dinamica condicional entre Programas y Modulos sueltos habilitados, selector de profesion del postulante y captura automatica en Etapa 1 (Nuevo) dentro de la Bolsa Comun (sin asignacion preliminar a vendedores).

### 2. Recuperacion Segura de Contrasenas
- Flujo transaccional de autoservicio para restablecer credenciales olvidadas.
- Generacion de tokens unicos con vigencia temporal limitada.
- Plantilla de correo Blade institucional disenada exclusivamente bajo normas tipograficas sobrias (cero emojis).

### 3. Gestion de Prospectos (Leads) y Bolsa Comun
- Repositorio unificado de prospectos con datos demograficos, canal de origen, profesion, intereses academicos y estado de avance.
- Bolsa Comun de postulantes para permitir la toma equitativa de leads por parte del equipo de asesores comerciales o asignacion automatica mediante Round-Robin.

### 4. Tablero Kanban del Pipeline Comercial (6 Etapas Oficiales)
- Etapa 1: Nuevo (Prospectos recien captados o en Bolsa Comun).
- Etapa 2: Contacto Inicial (Primer acercamiento telefonico o via WhatsApp).
- Etapa 3: En Seguimiento (Negociacion de fechas, temarios, modalidades y requisitos).
- Etapa 4: Promesa de Pago (Postulante con compromiso formal de deposito o descuento aplicado).
- Etapa 5: Matriculado / Convertido (Pago verificado y alumno registrado formalmente).
- Etapa 6: Descartado / Perdido (Prospecto que no concreta con tipificacion de motivo obligatorio y retroalimentacion cualitativa).

### 5. Revision de Pagos y Matriculacion Externa (Proyecto 2)
- Carga de comprobantes de deposito o transferencia bancaria en formatos JPG, PNG o PDF.
- Pasarela digital preparada con soporte para generacion de QR dinámico interoperable y emision de voucher oficial vectorial SVG con sello institucional de UNEXO FICCT.
- Validacion estricta previa a la aprobacion: El sistema bloquea la aprobacion de comprobantes si el prospecto no cuenta con Cedula de Identidad (CI), telefono de contacto y correo electronico registrados.
- Al aprobarse el pago, se dispara el servicio de matriculacion hacia la API de INF513 Proyecto 2, asociando al estudiante con su cohorte correspondiente y almacenando el payload y respuesta tecnica para auditoria.

### 6. Panel Analitico y Reportes de Rendimiento (Dashboard)
- Reporte 1 (Embudo de Ventas): Visualizacion del volumen y porcentaje de conversion en las 6 etapas comerciales con enlaces interactivos a la lista filtrada de prospectos.
- Reporte 2 (Tasa Global de Conversion y Matriz de Asesores): Indicadores globales de efectividad comercial y tabla comparativa del desempeno individual de cada vendedor (asignados, convertidos, perdidos, activos y porcentaje de cierre).
- Reporte 3 (Canales de Captacion): Distribucion porcentual de volumen de prospectos por medio de atraccion (Facebook, WhatsApp, Web, Referidos, LinkedIn).
- Reporte 4 (Motivos de Descarte): Diagnostico de razones de perdida comercial (factor economico, horario, sin respuesta, etc.) con listado de observaciones cualitativas recientes.
- Segmentacion por Rol: Si un usuario con rol Coordinador inicia sesion, las consultas SQL del panel analitico se filtran automaticamente por la version de programa asignada en la tabla `coordinador_version`.

### 7. Trazabilidad, Bitacora y Agenda de Recordatorios
- Registro automatico en bitacora de auditoria de cada cambio de etapa en el embudo comercial, indicando fecha, usuario responsable, etapa origen y etapa destino.
- Soporte para notas comerciales internas dentro de la ficha de cada prospecto.
- Sistema de recordatorios y tareas comerciales con alertas visuales de seguimiento en el panel del vendedor.

---

## Pruebas Automatizadas

La aplicacion incluye una suite de pruebas de integracion que verifican autenticacion, roles RBAC, transiciones de pipeline, validaciones de matriculacion y rutas de reportes analiticos:

```bash
php artisan test
```

Resultado verificado:
- 36 pruebas ejecutadas exitosamente.
- 121 aserciones en verde.
- Transacciones de base de datos activas para garantizar que las pruebas no alteren el estado de los datos demostrativos.

---

## Estructura Principal del Repositorio

```text
crm/
├── app/
│   ├── Http/
│   │   ├── Controllers/
│   │   │   ├── Auth/                     # Controladores de sesion y recuperacion
│   │   │   ├── DashboardController.php   # Consultas analiticas segmentadas por rol
│   │   │   ├── LeadController.php        # Operaciones comerciales y asignaciones
│   │   │   ├── PaymentController.php     # Registro y revision de comprobantes
│   │   │   ├── PipelineController.php    # Tablero Kanban y cambios de etapa
│   │   │   ├── PublicRegistrationController.php # Landing y admision libre
│   │   │   └── UsuarioController.php     # Administracion de cuentas y roles
│   │   ├── Middleware/
│   │   │   └── CheckRole.php             # Filtro de autorizacion RBAC
│   │   └── Requests/                     # Reglas de validacion en espanol
│   ├── Mail/                             # Clases Mailable transaccionales
│   ├── Models/                           # Modelos Eloquent de base de datos
│   └── Services/
│       ├── EnrollmentService.php         # Conexion y envio de matricula a Proyecto 2
│       ├── PaymentService.php            # Emision de comprobantes SVG y logica de pago
│       └── PipelineService.php           # Logica de negocio y validaciones de etapas
├── database/
│   ├── migrations/                       # Esquema de base de datos relacional
│   └── seeders/                          # Datos de prueba reales bolivianos
├── public/
│   ├── favicon.ico                       # Favicons institucionales UNEXO
│   └── images/                           # Logotipos, fotografias del campus y banners
├── resources/
│   ├── js/
│   │   ├── Layouts/                      # Estructura general de interfaz y navegacion
│   │   ├── Pages/
│   │   │   ├── Auth/                     # Vistas de autenticacion y password reset
│   │   │   ├── Dashboard/                # Vistas de metricas y graficos analiticos
│   │   │   ├── Leads/                    # Fichas comerciales y listas de prospectos
│   │   │   ├── Payments/                 # Cola de revision de pagos
│   │   │   ├── Pipeline/                 # Tablero Kanban interactivo
│   │   │   ├── Landing.jsx               # Portal institucional publico
│   │   │   └── PublicRegistration.jsx    # Formulario de admision publica
│   │   └── Shared/                       # Modales, botones y componentes reutilizables
│   └── views/
│       ├── app.blade.php                 # Contenedor raiz Inertia
│       └── emails/                       # Plantillas de correo transaccional corporativo
├── routes/
│   └── web.php                           # Definicion de rutas y middlewares de acceso
└── tests/
    └── Feature/                          # Suite de pruebas automatizadas
```
