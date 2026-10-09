# Plan de Trabajo – CRM Educativo Grupo 5 SC
## Guía Definitiva de Desarrollo

**Stack:** Laravel 12 + Inertia.js + React (Vite) + PostgreSQL  
**Arquitectura:** Monolito modular — todo en un solo repositorio, frontend en `resources/js`  
**Equipo:** 3 desarrolladoras

| Desarrolladora | Rol técnico | Módulos a cargo |
|---|---|---|
| **Nataly (Dev A)** | Identidad y trazabilidad | Auth, Usuarios, Bitácora, Recordatorios, Pagos |
| **Nicol (Dev B)** | Núcleo comercial | Leads, Asignación, Pipeline/Kanban, Matrícula |
| **Jael (Dev C)** | Plataforma e integración | Base del proyecto (layout, API client), Lookups, Importación CSV, Catálogo externo, Reportes |

---

## 0. Calendario

| Fase | Entrega | Ventana de trabajo | Módulos |
|---|---|---|---|
| **1** | Lun 28 sep | Hasta mañana | Auth + Leads base: RF1.1–1.3, RF2.1, RF2.3 |
| **2** | Lun 12 oct | 29 sep → 12 oct | Kanban + Bitácora + Catálogo externo: RF3.1–3.4, RF4.1–4.3, RF2.2 |
| **3** | Lun 26 oct | 13 oct → 26 oct | Flujo completo: Pagos + Matrícula + Integración API Proyecto 2 + Reportes |
| **4** | Lun 9 nov | 27 oct → 9 nov | Pulido UI: Kanban Drag & Drop, navegación, responsive |
| **5** | Lun 16 nov | 10 nov → 16 nov | Entrega final: documentación, manual, integración SIS–CRM |

---

## 1. Arquitectura General

### ¿Por qué Laravel + Inertia.js + React?

Se adopta el patrón **MVC-MVVM** que usaron exitosamente los grupos del semestre anterior (tucafe-web, servicargo):

- **Laravel (MVC):** Backend completo — controladores, servicios, modelos Eloquent, migraciones, seeders, validaciones (FormRequests), middlewares y autorización (Policies).
- **Inertia.js:** Es el "puente" entre Laravel y React. Elimina la necesidad de una API REST separada, CORS y manejo manual de tokens. El controlador Laravel devuelve directamente una página React: `return Inertia::render('Leads/Index', ['leads' => $leads])`.
- **React (MVVM):** Frontend reactivo en `resources/js`. Las páginas reciben datos via `props` de Inertia. No hay React Router separado; las rutas las define Laravel en `routes/web.php`.

### ¿Cómo se comunican los módulos internamente?

**No se usan Eventos ni Listeners.** Los módulos se comunican mediante **Clases de Servicio directas** en `app/Services/`. Cuando el módulo de Pagos necesita notificar al módulo de Matrícula, llama directamente al método del servicio correspondiente:

```php
// En PaymentService.php (Nataly)
public function aprobar(int $idComprobante, int $adminId): void
{
    // 1. Cambia estado del comprobante
    $comprobante->update(['estado' => 'APROBADO', 'revisado_por' => $adminId]);

    // 2. Llama directamente al servicio de Nicol
    app(EnrollmentService::class)->iniciarMatricula($comprobante);

    // 3. Registra en bitácora
    $this->bitacoraService->registrar($comprobante->id_lead, 'PAGO', 'Comprobante aprobado');
}
```

**Ventaja:** Cualquiera puede ver exactamente qué pasa leyendo el código, sin buscar qué Listener está escuchando en segundo plano. Si algo falla, el error sale inmediatamente en pantalla.

### ¿Cómo se maneja el Catálogo del Proyecto 2?

> **Decisión clave:** El CRM **NO** crea ni duplica tablas de programas, versiones ni módulos.

El Proyecto 2 (Grupo 2) expone su catálogo por API REST. El flujo es:

1. Desde el **frontend React**, cuando el usuario necesita seleccionar un programa/versión (ej.: al editar intereses de un lead), se hace una petición al backend propio del CRM.
2. El backend del CRM actúa como **proxy**: llama a la API del Proyecto 2, obtiene el JSON y lo devuelve al frontend.
3. El CRM **nunca guarda** ni replica los programas/versiones en su base de datos.
4. **Lo único que se guarda localmente** es el ID externo (`id_version_externo` o `id_modulo_externo`) y un **`nombre_snapshot`** en la tabla `lead_interes`. Este snapshot es una "foto" del nombre en el momento de vinculación, para que la bitácora no se rompa aunque el Proyecto 2 cambie nombres.

```
Frontend React
   ↓ "¿Qué programas hay?"
CatalogService.php (Dev C)
   ↓ HTTP GET a la API del Proyecto 2
   ← JSON { programas: [...], versiones: [...] }
   ↓
Frontend muestra el catálogo
   ↓ Usuario selecciona "Programa Marketing V2"
LeadInterestController.php
   ↓ Guarda en lead_interes: id_version_externo=42, nombre_snapshot="Marketing V2"
```

---

## 2. Convenciones del Proyecto

- **Rutas:** `routes/web.php` devuelve **solo** `Inertia::render(...)`. `routes/api.php` solo para el endpoint de sincronización del catálogo externo.
- **Autenticación:** Laravel Sanctum con sesión web (cookie) + middleware `auth`. Para usuarios autenticados con Inertia, el usuario y su rol viajan en los `sharedProps` de `HandleInertiaRequests`.
- **Autorización:** Middleware `CheckRole` parametrizado por rol (ej. `->middleware('checkRole:Administrador,Coordinador')`). Se puede complementar con `Policies` de Laravel en casos complejos.
- **Validación:** `FormRequest` en **todos** los formularios, con mensajes en español.
- **Servicios:** Toda lógica de negocio va en `app/Services/`. Los controladores solo orquestan: validan, llaman al servicio, devuelven la respuesta Inertia.
- **Modelos Eloquent:** tablas en español (como el diagrama), clases en inglés o español pero consistentes dentro del módulo.
- **Nombres de campos:** en español (como el diseño de BD: `id_lead`, `nombre_completo`, `id_etapa`, etc.).
- **Bitácora:** `BitacoraService::registrar($idLead, $tipo, $descripcion)` se llama desde cualquier servicio que produzca un evento relevante. Nunca desde el frontend.
- **Git:** `main` protegida. Ramas `feat/<modulo>-<tarea>`. PR revisado por otra miembro. Cada dev toca solo su carpeta; cambios en `shared/` o en archivos compartidos se avisan al equipo.
- **Paginación:** `?page=1&per_page=20` → `{ data: [...], links: {...} }` (paginación nativa de Laravel/Inertia).
- **Errores:** Flash messages de Inertia para errores globales; errores de validación via `$errors` en la página React.

---

## 3. Estructura de Carpetas

```
crm-educativo/                          ← raíz del proyecto (1 solo repo Git)
├── app/
│   ├── Http/
│   │   ├── Controllers/
│   │   │   ├── Auth/
│   │   │   │   └── AuthController.php          # Dev A: login, logout, me
│   │   │   ├── UsuarioController.php            # Dev A: CRUD usuarios
│   │   │   ├── LeadController.php               # Dev B: CRUD leads, bolsa común
│   │   │   ├── LeadAssignmentController.php     # Dev B: asignar, round-robin, transferir
│   │   │   ├── PipelineController.php           # Dev B: kanban board, cambio etapa
│   │   │   ├── EnrollmentController.php         # Dev B: matrícula, reintentar, marcar manual
│   │   │   ├── BitacoraController.php           # Dev A: timeline, notas manuales
│   │   │   ├── RecordatorioController.php       # Dev A: CRUD recordatorios, alertas
│   │   │   ├── PaymentController.php            # Dev A: subir comprobante, aprobar/rechazar
│   │   │   ├── DescuentoController.php          # Dev A: CRUD descuentos
│   │   │   ├── LookupController.php             # Dev C: orígenes, etapas, motivos, profesiones
│   │   │   ├── CsvImportController.php          # Dev C: subir CSV, historial
│   │   │   ├── CatalogController.php            # Dev C: proxy al Proyecto 2
│   │   │   ├── LeadInterestController.php       # Dev C: intereses del lead (versión/módulo)
│   │   │   ├── CoordinatorVersionController.php # Dev C: versiones del coordinador
│   │   │   ├── ReportController.php             # Dev C: reportes
│   │   │   └── DashboardController.php          # Dev C: widgets por rol
│   │   ├── Middleware/
│   │   │   ├── CheckRole.php                    # Dev A: control de acceso por rol
│   │   │   ├── HandleInertiaRequests.php        # Dev C: compartir auth.user, rol, etc.
│   │   │   └── RegistrarBitacora.php            # Dev A: middleware opcional de auditoría
│   │   └── Requests/
│   │       ├── LoginRequest.php                 # Dev A
│   │       ├── StoreUserRequest.php             # Dev A
│   │       ├── StoreLeadRequest.php             # Dev B
│   │       ├── UpdateLeadStageRequest.php       # Dev B
│   │       ├── StorePaymentProofRequest.php     # Dev A
│   │       └── ...
│   ├── Models/
│   │   ├── Usuario.php                          # Dev A
│   │   ├── Rol.php                              # Dev A
│   │   ├── PasswordReset.php                    # Dev A
│   │   ├── Lead.php                             # Dev B
│   │   ├── LeadInteres.php                      # Dev B / C
│   │   ├── AsignacionLead.php                   # Dev B
│   │   ├── ComprobantePago.php                  # Dev A
│   │   ├── EnvioMatricula.php                   # Dev B
│   │   ├── Bitacora.php                         # Dev A
│   │   ├── Recordatorio.php                     # Dev A
│   │   ├── Descuento.php                        # Dev A
│   │   ├── Profesion.php                        # Dev B / C
│   │   ├── OrigenLead.php                       # Dev C
│   │   ├── EtapaPipeline.php                    # Dev C
│   │   ├── MotivoPerdida.php                    # Dev C
│   │   ├── ImportacionCsv.php                   # Dev C
│   │   └── CoordinadorVersion.php               # Dev C
│   ├── Services/
│   │   ├── AuthService.php                      # Dev A
│   │   ├── UserService.php                      # Dev A
│   │   ├── BitacoraService.php                  # Dev A ← todas las devs la usan
│   │   ├── RecordatorioService.php              # Dev A
│   │   ├── PaymentService.php                   # Dev A
│   │   ├── LeadService.php                      # Dev B
│   │   ├── AssignmentService.php                # Dev B (manual, transferencia)
│   │   ├── RoundRobinService.php                # Dev B
│   │   ├── PipelineService.php                  # Dev B
│   │   ├── EnrollmentService.php                # Dev B
│   │   ├── CsvImportService.php                 # Dev C
│   │   ├── CatalogService.php                   # Dev C (proxy HTTP al Proyecto 2)
│   │   └── ReportService.php                    # Dev C
│   └── Providers/
│       └── AppServiceProvider.php
├── database/
│   ├── migrations/                              # orden por fecha
│   │   ├── 001_create_roles_table.php           # Dev A
│   │   ├── 002_create_usuarios_table.php        # Dev A
│   │   ├── 003_create_password_resets_table.php # Dev A
│   │   ├── 004_create_origenes_lead_table.php   # Dev C
│   │   ├── 005_create_etapas_pipeline_table.php # Dev C
│   │   ├── 006_create_motivos_perdida_table.php # Dev C
│   │   ├── 007_create_importaciones_csv_table.php # Dev C
│   │   ├── 008_create_leads_table.php           # Dev B
│   │   ├── 009_create_lead_interes_table.php    # Dev C
│   │   ├── 010_create_asignaciones_lead_table.php # Dev B
│   │   ├── 011_create_coordinador_version_table.php # Dev C
│   │   ├── 012_create_comprobantes_pago_table.php   # Dev A
│   │   ├── 013_create_envios_matricula_table.php    # Dev B
│   │   ├── 014_create_bitacora_table.php            # Dev A
│   │   └── 015_create_recordatorios_table.php       # Dev A
│   └── seeders/
│       ├── DatabaseSeeder.php
│       ├── RolSeeder.php                        # Dev A: 3 roles fijos
│       ├── EtapaPipelineSeeder.php              # Dev C: 6 etapas fijas
│       ├── OrigenLeadSeeder.php                 # Dev C: origenes iniciales
│       ├── MotivoPerdidaSeeder.php              # Dev C: motivos iniciales
│       └── UsuarioSeeder.php                    # Dev A: admin, coordinador, 2 vendedores demo
├── resources/
│   ├── js/
│   │   ├── app.jsx                              # Dev C: entry point React + Inertia
│   │   ├── bootstrap.js
│   │   ├── Layouts/
│   │   │   └── AppLayout.jsx                   # Dev C: sidebar por rol, topbar, mobile
│   │   ├── Shared/                             # Dev C: componentes reutilizables
│   │   │   ├── Button.jsx
│   │   │   ├── Modal.jsx
│   │   │   ├── DataTable.jsx
│   │   │   ├── Badge.jsx
│   │   │   ├── Toast.jsx
│   │   │   ├── FormField.jsx
│   │   │   └── useAuth.js                      # Dev A: hook para usuario/rol actual
│   │   └── Pages/
│   │       ├── Auth/
│   │       │   ├── Login.jsx                   # Dev A
│   │       │   ├── ForgotPassword.jsx          # Dev A (prioridad baja)
│   │       │   └── ResetPassword.jsx           # Dev A (prioridad baja)
│   │       ├── Users/
│   │       │   └── Index.jsx                   # Dev A: tabla de usuarios
│   │       ├── Leads/
│   │       │   ├── Index.jsx                   # Dev B: tabla con filtros
│   │       │   ├── Create.jsx                  # Dev B: formulario registro
│   │       │   ├── Show.jsx                    # Dev B: detalle del lead
│   │       │   └── Pool.jsx                    # Dev B: bolsa común
│   │       ├── Pipeline/
│   │       │   └── Kanban.jsx                  # Dev B: tablero Kanban
│   │       ├── Bitacora/
│   │       │   └── Timeline.jsx                # Dev A: línea de tiempo del lead
│   │       ├── Recordatorios/
│   │       │   └── Index.jsx                   # Dev A: lista de recordatorios + campana
│   │       ├── Payments/
│   │       │   ├── Upload.jsx                  # Dev A: subir comprobante
│   │       │   └── ReviewQueue.jsx             # Dev A: cola de revisión admin
│   │       ├── Import/
│   │       │   └── Csv.jsx                     # Dev C: subir CSV + historial
│   │       ├── Catalog/
│   │       │   └── Index.jsx                   # Dev C: visor del catálogo externo
│   │       ├── Reports/
│   │       │   └── Index.jsx                   # Dev C: reportes
│   │       └── Dashboard/
│   │           └── Index.jsx                   # Dev C: dashboard por rol
│   ├── css/
│   │   └── app.css                             # Dev C: estilos + Tailwind
│   └── views/
│       └── app.blade.php                       # Dev C: plantilla HTML base de Inertia
├── routes/
│   ├── web.php                                 # SOLO Inertia::render(). Todas.
│   └── api.php                                 # Solo endpoint proxy catálogo externo
├── config/
│   └── services.php                            # URL del Proyecto 2 (catalog)
├── .env.example
├── vite.config.js                              # Dev C
├── package.json                                # Dev C
└── composer.json
```

---

## 4. Base de Datos Completa

> El orden de las tablas respeta las dependencias de FK. Las migraciones deben crearse en este orden.

### Módulo 1 – Seguridad y Usuarios

#### `roles`
| Campo | Tipo | Restricciones | Descripción |
|---|---|---|---|
| `id_rol` | SERIAL | PK | |
| `nombre` | VARCHAR(30) | NOT NULL, UNIQUE | `Administrador`, `Coordinador`, `Vendedor` |
| `descripcion` | VARCHAR(150) | NULLABLE | |

**Seed fijo:** 3 filas inmutables.

#### `usuarios`
| Campo | Tipo | Restricciones | Descripción |
|---|---|---|---|
| `id_usuario` | SERIAL | PK | |
| `id_rol` | INT | FK → `roles`, NOT NULL | |
| `nombre_completo` | VARCHAR(120) | NOT NULL | |
| `correo` | VARCHAR(120) | NOT NULL, UNIQUE | |
| `password_hash` | VARCHAR(255) | NOT NULL | bcrypt vía `Hash::make()` |
| `activo` | BOOLEAN | NOT NULL, DEFAULT true | Habilitar/deshabilitar sin borrar |
| `participa_round_robin` | BOOLEAN | NOT NULL, DEFAULT true | Solo relevante si `id_rol` = Vendedor |
| `ultimo_acceso` | TIMESTAMP | NULLABLE | Se actualiza al hacer login |
| `created_at` | TIMESTAMP | NOT NULL, DEFAULT now() | |

#### `password_resets`
| Campo | Tipo | Restricciones | Descripción |
|---|---|---|---|
| `id_reset` | SERIAL | PK | |
| `id_usuario` | INT | FK → `usuarios`, NOT NULL | |
| `token_hash` | VARCHAR(255) | NOT NULL | Hash del token enviado |
| `expira_en` | TIMESTAMP | NOT NULL | Normalmente `now() + 1 hora` |
| `usado` | BOOLEAN | NOT NULL, DEFAULT false | Invalidar tras el primer uso |
| `created_at` | TIMESTAMP | NOT NULL, DEFAULT now() | |

---

### Módulo 2 – Lookups (tablas de referencia)

> **Jael (Dev C)** crea estas tablas en la Fase 1 porque `leads` las necesita como FK.

#### `origenes_lead`
| Campo | Tipo | Restricciones | Descripción |
|---|---|---|---|
| `id_origen` | SERIAL | PK | |
| `nombre` | VARCHAR(50) | NOT NULL | Facebook, WhatsApp, Web, Referido, etc. |

#### `etapas_pipeline`
| Campo | Tipo | Restricciones | Descripción |
|---|---|---|---|
| `id_etapa` | SERIAL | PK | |
| `nombre` | VARCHAR(30) | NOT NULL | |
| `orden` | INT | NOT NULL | Define el orden visual del Kanban |

**Seed fijo (6 filas en este orden):**
1. Nuevo
2. En Contacto
3. Seguimiento
4. Promesa de Pago
5. Convertido
6. Perdido

#### `motivos_perdida`
| Campo | Tipo | Restricciones | Descripción |
|---|---|---|---|
| `id_motivo` | SERIAL | PK | |
| `nombre` | VARCHAR(80) | NOT NULL | Factor económico, Horario, etc. |

#### `profesiones`
| Campo | Tipo | Restricciones | Descripción |
|---|---|---|---|
| `id_profesion` | SERIAL | PK | |
| `nombre` | VARCHAR(100) | NOT NULL | Abogado, Ingeniero de Sistemas, Médico, etc. |

**Seed inicial sugerido:** Profesiones comunes del mercado objetivo.

---

### Módulo 2 – Descuentos y Promociones

#### `descuentos`
| Campo | Tipo | Restricciones | Descripción |
|---|---|---|---|
| `id_descuento` | SERIAL | PK | |
| `nombre` | VARCHAR(100) | NOT NULL | Pronto Pago, Pago al Contado, Exalumno, etc. |
| `porcentaje` | NUMERIC(5,2) | NOT NULL | Porcentaje de descuento (ej. 10.00, 20.00) |
| `descripcion` | VARCHAR(255) | NULLABLE | Términos o condiciones del descuento |
| `activo` | BOOLEAN | NOT NULL, DEFAULT true | Habilitar/deshabilitar por el Admin |

---

### Módulo 2 – Leads y Asignación

#### `importaciones_csv`
| Campo | Tipo | Restricciones | Descripción |
|---|---|---|---|
| `id_importacion` | SERIAL | PK | |
| `id_usuario` | INT | FK → `usuarios`, NOT NULL | Quién subió el archivo |
| `nombre_archivo` | VARCHAR(150) | NOT NULL | |
| `total_filas` | INT | NULLABLE | Calculado al procesar |
| `filas_exitosas` | INT | NULLABLE | |
| `filas_fallidas` | INT | NULLABLE | |
| `created_at` | TIMESTAMP | NOT NULL, DEFAULT now() | |

#### `leads`
| Campo | Tipo | Restricciones | Descripción |
|---|---|---|---|
| `id_lead` | SERIAL | PK | |
| `nombre` | VARCHAR(120) | NOT NULL | Nombre del prospecto |
| `telefono` | VARCHAR(20) | NOT NULL | |
| `correo` | VARCHAR(120) | NULLABLE | |
| `id_origen` | INT | FK → `origenes_lead`, NOT NULL | |
| `id_profesion` | INT | FK → `profesiones`, NULLABLE | Profesión principal acordada |
| `id_descuento` | INT | FK → `descuentos`, NULLABLE | Descuento asignado (máximo 1) |
| `id_etapa` | INT | FK → `etapas_pipeline`, NOT NULL, DEFAULT 1 | Empieza en "Nuevo" |
| `id_vendedor` | INT | FK → `usuarios`, NULLABLE | NULL = bolsa común |
| `id_motivo_perdida` | INT | FK → `motivos_perdida`, NULLABLE | Solo si etapa = Perdido |
| `comentario_perdida` | TEXT | NULLABLE | Comentario libre al marcar como perdido |
| `id_importacion` | INT | FK → `importaciones_csv`, NULLABLE | NULL si fue registro manual |
| `fecha_asignacion` | TIMESTAMP | NULLABLE | Cuándo fue asignado al vendedor |
| `ci` | VARCHAR(20) | NULLABLE | Se llena al convertir |
| `nombre_completo` | VARCHAR(150) | NULLABLE | Se llena al convertir (puede diferir del nombre inicial) |
| `fecha_nacimiento` | DATE | NULLABLE | Se llena al convertir |
| `ciudad` | VARCHAR(60) | NULLABLE | Se llena al convertir |
| `created_by` | INT | FK → `usuarios`, NOT NULL | Quién lo registró |
| `created_at` | TIMESTAMP | NOT NULL, DEFAULT now() | |
| `updated_at` | TIMESTAMP | NOT NULL | |

**Reglas de negocio clave:**
- `id_vendedor = NULL` → lead en la **bolsa común** (sin tabla adicional).
- `id_profesion` representa la profesión única/principal del prospecto.
- `id_descuento` representa el descuento aplicado por el vendedor (máximo 1 por prospecto).
- `id_motivo_perdida` es obligatorio si la etapa cambia a "Perdido" (validado en el servicio).
- `ci`, `nombre_completo`, `fecha_nacimiento`, `ciudad` son obligatorios para pasar a "Convertido" (validado en `PipelineService`).

#### `lead_interes`
| Campo | Tipo | Restricciones | Descripción |
|---|---|---|---|
| `id_interes` | SERIAL | PK | |
| `id_lead` | INT | FK → `leads`, NOT NULL | |
| `tipo` | VARCHAR(10) | NOT NULL, CHECK IN ('PROGRAMA','MODULO') | |
| `id_version_externo` | INT | NULLABLE | ID del Proyecto 2, SIN FK en BD propia |
| `id_modulo_externo` | INT | NULLABLE | ID del Proyecto 2, SIN FK en BD propia |
| `nombre_snapshot` | VARCHAR(150) | NOT NULL | Copia del nombre al momento de vincular |

> **CHECK:** `(id_version_externo IS NOT NULL AND id_modulo_externo IS NULL) OR (id_version_externo IS NULL AND id_modulo_externo IS NOT NULL)` — exactamente uno de los dos debe venir lleno.

#### `asignaciones_lead`
| Campo | Tipo | Restricciones | Descripción |
|---|---|---|---|
| `id_asignacion` | SERIAL | PK | |
| `id_lead` | INT | FK → `leads`, NOT NULL | |
| `id_vendedor_anterior` | INT | FK → `usuarios`, NULLABLE | NULL si nunca tuvo vendedor |
| `id_vendedor_nuevo` | INT | FK → `usuarios`, NOT NULL | |
| `asignado_por` | INT | FK → `usuarios`, NOT NULL | Quién hizo la asignación |
| `tipo` | VARCHAR(20) | NOT NULL, CHECK IN ('MANUAL','ROUND_ROBIN','TRANSFERENCIA') | |
| `motivo` | VARCHAR(200) | NULLABLE | Requerido en TRANSFERENCIA |
| `created_at` | TIMESTAMP | NOT NULL, DEFAULT now() | |

#### `coordinador_version`
| Campo | Tipo | Restricciones | Descripción |
|---|---|---|---|
| `id_usuario` | INT | PK, FK → `usuarios` | Coordinador |
| `id_version_externo` | INT | PK | ID de la versión en el Proyecto 2, SIN FK |

> Esta tabla solo guarda el vínculo entre un coordinador local y el ID de una versión que vive en el Proyecto 2. No hay tabla `versiones_programa` en esta BD.

---

### Módulo 4 – Pagos y Matrícula

#### `comprobantes_pago`
| Campo | Tipo | Restricciones | Descripción |
|---|---|---|---|
| `id_comprobante` | SERIAL | PK | |
| `id_lead` | INT | FK → `leads`, NOT NULL | |
| `subido_por` | INT | FK → `usuarios`, NOT NULL | Quién subió el archivo |
| `archivo_url` | VARCHAR(255) | NOT NULL | Ruta en storage de Laravel |
| `tipo_archivo` | VARCHAR(10) | NOT NULL | `imagen` o `pdf` |
| `monto` | NUMERIC(10,2) | NULLABLE | Opcional, declarado por quien sube |
| `estado` | VARCHAR(15) | NOT NULL, DEFAULT 'PENDIENTE', CHECK IN ('PENDIENTE','APROBADO','RECHAZADO') | |
| `revisado_por` | INT | FK → `usuarios`, NULLABLE | Admin que revisó |
| `fecha_revision` | TIMESTAMP | NULLABLE | |
| `comentario_rechazo` | TEXT | NULLABLE | Obligatorio si estado = RECHAZADO |
| `created_at` | TIMESTAMP | NOT NULL, DEFAULT now() | |

**Regla:** el sub-estado "Pago Pendiente de Aprobación" **no se guarda en `leads`**. Se deduce en el servicio: si existe un comprobante con `estado = 'PENDIENTE'` para ese lead, está en sub-estado pendiente.

#### `envios_matricula`
| Campo | Tipo | Restricciones | Descripción |
|---|---|---|---|
| `id_envio` | SERIAL | PK | |
| `id_lead` | INT | FK → `leads`, NOT NULL | |
| `id_comprobante` | INT | FK → `comprobantes_pago`, NOT NULL | Qué comprobante disparó la matrícula |
| `payload` | JSONB | NULLABLE | Datos enviados a la API del Proyecto 2 |
| `estado` | VARCHAR(15) | NOT NULL, DEFAULT 'PENDIENTE', CHECK IN ('PENDIENTE','ENVIADO','ERROR') | |
| `respuesta_api` | TEXT | NULLABLE | Respuesta cruda de la API (para debug) |
| `intentos` | INT | NOT NULL, DEFAULT 0 | Contador de reintentos |
| `created_at` | TIMESTAMP | NOT NULL, DEFAULT now() | |

---

### Módulo 5 – Bitácora y Recordatorios

#### `bitacora`
| Campo | Tipo | Restricciones | Descripción |
|---|---|---|---|
| `id_evento` | SERIAL | PK | |
| `id_lead` | INT | FK → `leads`, NOT NULL | |
| `id_usuario` | INT | FK → `usuarios`, NULLABLE | NULL si es evento del sistema |
| `tipo` | VARCHAR(20) | NOT NULL, CHECK IN ('NOTA','CAMBIO_ESTADO','ASIGNACION','PAGO') | |
| `descripcion` | TEXT | NOT NULL | Texto descriptivo del evento |
| `id_etapa_anterior` | INT | FK → `etapas_pipeline`, NULLABLE | Solo en tipo CAMBIO_ESTADO |
| `id_etapa_nueva` | INT | FK → `etapas_pipeline`, NULLABLE | Solo en tipo CAMBIO_ESTADO |
| `created_at` | TIMESTAMP | NOT NULL, DEFAULT now() | |

> Una sola tabla sirve para la **línea de tiempo automática** (CAMBIO_ESTADO, ASIGNACION, PAGO) y las **notas manuales** (NOTA). Se distinguen por el campo `tipo`.

#### `recordatorios`
| Campo | Tipo | Restricciones | Descripción |
|---|---|---|---|
| `id_recordatorio` | SERIAL | PK | |
| `id_lead` | INT | FK → `leads`, NOT NULL | |
| `id_usuario` | INT | FK → `usuarios`, NOT NULL | Quién creó el recordatorio |
| `fecha_hora` | TIMESTAMP | NOT NULL | Cuándo debe dispararse |
| `descripcion` | VARCHAR(255) | NOT NULL | |
| `estado` | VARCHAR(15) | NOT NULL, DEFAULT 'PENDIENTE', CHECK IN ('PENDIENTE','COMPLETADO','CANCELADO') | |

---

### Relaciones Completas (resumen)

| Relación | Tipo | FK en |
|---|---|---|
| `roles` → `usuarios` | 1:N | `usuarios.id_rol` |
| `usuarios` → `password_resets` | 1:N | `password_resets.id_usuario` |
| `origenes_lead` → `leads` | 1:N | `leads.id_origen` |
| `profesiones` → `leads` | 1:N opcional | `leads.id_profesion` |
| `descuentos` → `leads` | 1:N opcional | `leads.id_descuento` |
| `etapas_pipeline` → `leads` | 1:N | `leads.id_etapa` |
| `motivos_perdida` → `leads` | 1:N opcional | `leads.id_motivo_perdida` |
| `usuarios (vendedor)` → `leads` | 1:N opcional | `leads.id_vendedor` |
| `importaciones_csv` → `leads` | 1:N opcional | `leads.id_importacion` |
| `usuarios` → `importaciones_csv` | 1:N | `importaciones_csv.id_usuario` |
| `leads` → `lead_interes` | 1:N | `lead_interes.id_lead` |
| `leads` → `asignaciones_lead` | 1:N | `asignaciones_lead.id_lead` |
| `usuarios` → `asignaciones_lead` | 1:N | `asignaciones_lead.id_vendedor_nuevo` |
| `usuarios` ↔ `coordinador_version` | N:M | tabla puente `coordinador_version` |
| `leads` → `comprobantes_pago` | 1:N | `comprobantes_pago.id_lead` |
| `comprobantes_pago` → `envios_matricula` | 1:N | `envios_matricula.id_comprobante` |
| `leads` → `bitacora` | 1:N | `bitacora.id_lead` |
| `usuarios` → `bitacora` | 1:N opcional | `bitacora.id_usuario` |
| `etapas_pipeline` → `bitacora` | 1:N opcional | `bitacora.id_etapa_anterior / id_etapa_nueva` |
| `leads` → `recordatorios` | 1:N | `recordatorios.id_lead` |
| `usuarios` → `recordatorios` | 1:N | `recordatorios.id_usuario` |

---

## 5. Rutas Completas (`routes/web.php`)

Todas las rutas devuelven `Inertia::render(...)`. Los datos se pasan como segundo argumento.

| Método | Ruta | Controlador@método | Rol | Fase |
|---|---|---|---|---|
| GET | `/login` | `AuthController@showLogin` | Público | 1 |
| POST | `/login` | `AuthController@login` | Público | 1 |
| POST | `/logout` | `AuthController@logout` | Auth | 1 |
| GET | `/forgot-password` | `AuthController@showForgot` | Público | 1 (baja prioridad) |
| POST | `/forgot-password` | `AuthController@sendReset` | Público | 1 (baja prioridad) |
| GET | `/reset-password/{token}` | `AuthController@showReset` | Público | 1 (baja prioridad) |
| POST | `/reset-password` | `AuthController@reset` | Público | 1 (baja prioridad) |
| GET | `/usuarios` | `UsuarioController@index` | Admin | 1 |
| POST | `/usuarios` | `UsuarioController@store` | Admin | 1 |
| PUT | `/usuarios/{id}` | `UsuarioController@update` | Admin | 1 |
| PATCH | `/usuarios/{id}/status` | `UsuarioController@toggleStatus` | Admin | 1 |
| PATCH | `/usuarios/{id}/round-robin` | `UsuarioController@toggleRoundRobin` | Admin | 1 |
| GET | `/leads` | `LeadController@index` | Admin, Coord, Vend | 1 |
| GET | `/leads/create` | `LeadController@create` | Admin, Coord, Vend | 1 |
| POST | `/leads` | `LeadController@store` | Admin, Coord, Vend | 1 |
| GET | `/leads/{id}` | `LeadController@show` | Admin, Coord, Vend | 1 |
| GET | `/leads/{id}/edit` | `LeadController@edit` | Admin, Coord, Vend | 1 |
| PUT | `/leads/{id}` | `LeadController@update` | Admin, Coord, Vend | 1 |
| DELETE | `/leads/{id}` | `LeadController@destroy` | Admin | 1 |
| GET | `/leads/bolsa-comun` | `LeadController@pool` | Admin, Vend | 1 |
| POST | `/leads/{id}/asignar` | `LeadAssignmentController@assign` | Admin | 1 |
| POST | `/leads/asignar-automatico` | `LeadAssignmentController@roundRobin` | Admin | 1 |
| POST | `/leads/{id}/transferir` | `LeadAssignmentController@transfer` | Admin | 1 |
| GET | `/leads/import` | `CsvImportController@index` | Admin, Coord | 1 |
| POST | `/leads/import` | `CsvImportController@store` | Admin, Coord | 1 |
| GET | `/pipeline` | `PipelineController@board` | Admin, Coord, Vend | 2 |
| PATCH | `/leads/{id}/etapa` | `PipelineController@changeStage` | Admin, Coord, Vend | 2 |
| GET | `/leads/{id}/bitacora` | `BitacoraController@timeline` | Admin, Coord, Vend | 2 |
| POST | `/leads/{id}/notas` | `BitacoraController@addNote` | Admin, Coord, Vend | 2 |
| GET | `/recordatorios` | `RecordatorioController@index` | Auth | 2 |
| POST | `/leads/{id}/recordatorios` | `RecordatorioController@store` | Auth | 2 |
| PATCH | `/recordatorios/{id}` | `RecordatorioController@update` | Auth (dueño) | 2 |
| PATCH | `/recordatorios/{id}/completar` | `RecordatorioController@complete` | Auth (dueño) | 2 |
| GET | `/catalogo` | `CatalogController@index` | Auth | 2 |
| GET | `/leads/{id}/intereses` | `LeadInterestController@index` | Admin, Coord, Vend | 2 |
| POST | `/leads/{id}/intereses` | `LeadInterestController@store` | Admin, Coord, Vend | 2 |
| DELETE | `/leads/{id}/intereses/{interesId}` | `LeadInterestController@destroy` | Admin, Coord, Vend | 2 |
| GET | `/coordinadores/{id}/versiones` | `CoordinatorVersionController@index` | Admin | 2 |
| PUT | `/coordinadores/{id}/versiones` | `CoordinatorVersionController@update` | Admin | 2 |
| GET | `/leads/{id}/comprobantes` | `PaymentController@index` | Admin, Coord, Vend | 3 |
| POST | `/leads/{id}/comprobantes` | `PaymentController@store` | Admin, Coord, Vend | 3 |
| GET | `/comprobantes` | `PaymentController@reviewQueue` | Admin | 3 |
| POST | `/comprobantes/{id}/aprobar` | `PaymentController@approve` | Admin | 3 |
| POST | `/comprobantes/{id}/rechazar` | `PaymentController@reject` | Admin | 3 |
| GET | `/leads/{id}/matricula` | `EnrollmentController@show` | Admin, Coord, Vend | 3 |
| POST | `/leads/{id}/matricula/reintentar` | `EnrollmentController@retry` | Admin | 3 |
| POST | `/leads/{id}/matricula/marcar-manual` | `EnrollmentController@markManual` | Admin | 3 |
| GET | `/reportes` | `ReportController@index` | Admin, Coord, Vend | 3 |
| GET | `/dashboard` | `DashboardController@index` | Auth | 1 (esqueleto) / 3 |
| GET | `/lookups/origenes` | `LookupController@origenes` | Auth | 1 |
| GET | `/lookups/etapas` | `LookupController@etapas` | Auth | 1 |
| GET | `/lookups/motivos-perdida` | `LookupController@motivos` | Auth | 1 |

**Endpoint API (proxy catálogo):**

| Método | Ruta | Controlador@método | Descripción |
|---|---|---|---|
| GET | `/api/catalogo/programas` | `CatalogController@programas` | Proxy al Proyecto 2 – lista programas con versiones |
| GET | `/api/catalogo/modulos` | `CatalogController@modulos` | Proxy al Proyecto 2 – módulos independientes |

---

## 6. Matriz de Permisos

| Acción | Administrador | Coordinador | Vendedor |
|---|:-:|:-:|:-:|
| Gestionar usuarios y roles | ✅ | ❌ | ❌ |
| Ver todos los leads | ✅ | ❌ (solo sus versiones, Fase 2) | ❌ (solo cartera + bolsa) |
| Registrar leads (manual) | ✅ | ✅ | ✅ |
| Importar leads (CSV) | ✅ | ✅ | ❌ |
| Asignar / Transferir leads | ✅ | ✅ (sus versiones, RF2.3) | ❌ |
| Mover en el Kanban | ✅ | ✅ (su alcance) | ✅ (su alcance) |
| Agregar notas / recordatorios | ✅ | ✅ | ✅ |
| Ver bitácora del lead | ✅ | ✅ (su alcance) | ✅ (su alcance) |
| Subir comprobante de pago | ✅ | ✅ | ✅ |
| Aprobar / Rechazar comprobante | ✅ | ❌ | ❌ |
| Ver cola de pagos | ✅ | ❌ | ❌ |
| Reintentar / marcar manual matrícula | ✅ | ❌ | ❌ |
| Gestionar versiones del coordinador | ✅ | ❌ | ❌ |
| Reportes | Todos | Sus versiones | Solo los suyos |

---

## 7. Fases de Desarrollo

---

### FASE 1 — Lun 28 sep | Auth + Leads Base

**Entregable:** login funcional con 3 roles, vistas restringidas por rol, registro manual de leads, importación CSV y asignación a vendedores.

#### Orden de trabajo (las tres coordinadas)

1. **Hora 0 (juntas, 45 min):** Jael crea el proyecto Laravel + Inertia + React y hace el primer commit. Acuerdan el JSON de login y el JSON de lead. Acuerdan los nombres exactos de tablas y columnas.
2. **Primeras horas:** Jael entrega las migraciones de `origenes_lead`, `etapas_pipeline`, `motivos_perdida` y el `AppLayout.jsx` base, porque Nicol los necesita.
3. **Primeras horas:** Nataly entrega login + la variable `auth.user` en `HandleInertiaRequests`, para que todas puedan probar con sesión real.
4. **Después:** Nicol publica `LeadService::crear()` para que Jael pueda cerrar la importación CSV.
5. **Integración final:** menús por rol, alcance de leads por rol, pruebas.

#### Tareas por Desarrolladora

| Tarea | **Nataly (Dev A)** | **Nicol (Dev B)** | **Jael (Dev C)** |
|---|---|---|---|
| **Migraciones** | `roles`, `usuarios`, `password_resets` | `leads`, `asignaciones_lead` | `origenes_lead`, `etapas_pipeline`, `motivos_perdida`, `importaciones_csv` |
| **Seeders** | `RolSeeder` (3 roles), `UsuarioSeeder` (1 admin, 1 coord, 2 vendedores) | — | `EtapaPipelineSeeder` (6 fijas), `OrigenLeadSeeder`, `MotivoPerdidaSeeder` |
| **Modelos** | `Usuario`, `Rol`, `PasswordReset` | `Lead`, `AsignacionLead`, `ImportacionCsv` | `OrigenLead`, `EtapaPipeline`, `MotivoPerdida` |
| **Servicios** | `AuthService` (login, logout, hash), `UserService` (CRUD), `BitacoraService` (esqueleto inicial) | `LeadService` (crear, editar, eliminar lógico), `AssignmentService` (manual, transferencia), `RoundRobinService` | `CsvImportService` (parseo, validación fila por fila, reporte de errores), `LookupService` |
| **Controladores** | `AuthController` (login/logout), `UsuarioController` (CRUD, toggle activo, toggle round-robin) | `LeadController` (CRUD, pool), `LeadAssignmentController` (asignar, round-robin, transferir) | `LookupController` (origenes, etapas, motivos), `CsvImportController` (subir, historial), `DashboardController` (esqueleto) |
| **Middleware** | `CheckRole.php`, `HandleInertiaRequests.php` (compartir `auth.user`, `auth.role`) | — | — |
| **FormRequests** | `LoginRequest`, `StoreUserRequest`, `UpdateUserRequest` | `StoreLeadRequest`, `UpdateLeadRequest`, `AssignLeadRequest` | `CsvImportRequest` |
| **Páginas React** | `Pages/Auth/Login.jsx`, `Pages/Users/Index.jsx` (tabla, crear/editar modal, toggle activo/rol) | `Pages/Leads/Index.jsx` (tabla + filtros), `Pages/Leads/Create.jsx`, `Pages/Leads/Show.jsx`, `Pages/Leads/Pool.jsx` | `Pages/Import/Csv.jsx`, `Pages/Dashboard/Index.jsx` (simple), `Layouts/AppLayout.jsx` (menú por rol), `Shared/Button.jsx`, `Shared/Modal.jsx`, `Shared/DataTable.jsx` |

**Criterio de aceptación Fase 1:**
- Un admin crea un vendedor, inicia sesión con cada rol y ve menús distintos.
- Registra un lead a mano y otro por CSV, los ve en la bolsa común y los asigna (manual y round-robin).
- `php artisan migrate:fresh --seed` corre limpio.

**Qué recortar si falta tiempo:** recuperación de contraseña (dejar pantalla lista pero el correo no se envía), transferencia de leads, `DELETE /leads`.

---

### FASE 2 — Lun 12 oct | Kanban + Bitácora + Catálogo Externo

**Entregable:** Kanban funcional, historial de interacciones, notas, recordatorios, catálogo de descuentos, asignación de profesión única y vista del catálogo del Proyecto 2.

#### Orden de trabajo (Crítico y Secuencial)

1. **Jael (Dev C) – Inicia de inmediato (Ajuste de BD e Integración Externa):**
   - **Actualización de Base de Datos Base:** Crea la migración de `profesiones` (lookup) y `descuentos` (o se coordinan antes de tocar `leads`). Actualiza la migración de `leads` agregando las claves foráneas `id_profesion` (nullable) e `id_descuento` (nullable). Corre `php artisan migrate:fresh --seed` para asegurar consistencia limpia en todo el equipo sin migraciones rotas.
   - **Catálogo Externo:** Configura `CatalogService` (proxy HTTP a la API del Proyecto 2 / Grupo 6SC) y publica `lead_interes` y `coordinador_version`.
2. **Nicol (Dev B) – Continúa (Flujo Comercial y Formulario de Leads):**
   - Actualiza el formulario y controlador de `Lead` para permitir asignar la **profesión única**.
   - Construye el tablero Kanban (RF3.1, RF3.2) con las 6 etapas y los modales bloqueantes: `LostReasonModal` para "Perdido" (RF3.3) y validación de datos de alumno para "Convertido" (RF3.4).
   - Permite vincular intereses de programas/módulos desde el servicio de Jael.
3. **Nataly (Dev A) – Trazabilidad, Descuentos y Despacho:**
   - Implementa el CRUD de `descuentos` para el Administrador y permite al vendedor asignar máximo 1 descuento en el lead.
   - Publica `BitacoraService` y `RecordatorioService`.
   - Prepara el registro de comprobantes y el payload de envío a matrícula del Grupo 6SC.
4. **Integración:** La tarjeta del Kanban refleja interés, recordatorio y descuento; el detalle del lead muestra el Timeline completo.

#### Tareas por Desarrolladora

| Tarea | **Nataly (Dev A)** | **Nicol (Dev B)** | **Jael (Dev C)** |
|---|---|---|---|
| **Migraciones** | `bitacora`, `recordatorios`, `descuentos` | Actualizar `leads` (`id_profesion`, `id_descuento`) | `profesiones`, `lead_interes`, `coordinador_version` *(o Jael ajusta el bloque base antes de `leads` y corre `migrate:fresh --seed`)* |
| **Modelos** | `Bitacora`, `Recordatorio`, `Descuento` | `Lead` (con relaciones `profesion`, `descuento`), `AsignacionLead` | `Profesion`, `LeadInteres`, `CoordinadorVersion` |
| **Servicios** | `BitacoraService` (completo: registrar, listar por lead), `RecordatorioService` (crear, completar, alertas), `DescuentoService` | `PipelineService` (cambio de etapa, validación perdido/convertido, llamada a `BitacoraService`), `LeadService` (con profesión y descuento) | `CatalogService` (HTTP al Proyecto 2, con fallback "API no disponible"), `LeadInterestService` |
| **Controladores** | `BitacoraController`, `RecordatorioController`, `DescuentoController` | `PipelineController`, `LeadController` | `LookupController` (añade `profesiones`), `CatalogController`, `LeadInterestController`, `CoordinatorVersionController` |
| **FormRequests** | `StoreNoteRequest`, `StoreRecordatorioRequest`, `StoreDescuentoRequest` | `StoreLeadRequest` / `UpdateLeadRequest` (valida `id_profesion`), `UpdateStageRequest` (etapa + motivo) | `StoreInterestRequest` |
| **Páginas React** | `Pages/Bitacora/Timeline.jsx` (línea de tiempo por lead), `Pages/Recordatorios/Index.jsx` (lista + campana badge), `Pages/Descuentos/Index.jsx` | `Pages/Pipeline/Kanban.jsx` (6 columnas, `LostReasonModal`, `ConversionCheckModal`), `Pages/Leads/Create.jsx` y `Show.jsx` (selector de profesión y descuento) | `Pages/Catalog/Index.jsx` (programas → versiones → módulos), `InterestSelector` (dentro de `Show.jsx` de Nicol), `CoordinatorVersionsForm` |
| **Coordinación especial** | Nataly entrega `BitacoraService::registrar()` en las primeras horas porque `PipelineService` de Nicol lo llama | Nicol coordina con Jael para usar las profesiones y el catálogo en la creación/interés del lead | Jael actualiza la estructura base de BD primero para que el equipo corra `migrate:fresh --seed` sin conflictos |

**Criterio de aceptación Fase 2:**
- `php artisan migrate:fresh --seed` corre sin errores con las nuevas tablas (`profesiones`, `descuentos`) y las claves foráneas en `leads`.
- Un lead se crea con origen y profesión única.
- El vendedor puede aplicarle un descuento del catálogo activo.
- Mover una tarjeta a "Perdido" abre modal y no deja avanzar sin motivo.
- Cada cambio de etapa aparece en el Timeline del lead.
- Se puede vincular un interés desde el catálogo del Proyecto 2.

---

### FASE 3 — Lun 26 oct | Flujo Completo + Integración

**Entregable:** flujo completo lead → contacto → comprobante → aprobación → matrícula al Proyecto 2 → convertido.

#### Orden de trabajo

1. **13–18 oct:** Nataly construye pagos, Nicol construye matrícula (con mock de la API del Proyecto 2), Jael termina reportes.
2. **19 oct (llegan endpoints del Proyecto 2):** Jael activa la integración real; Nicol conecta `EnrollmentService` con la URL real.
3. **20–25 oct:** pruebas conjuntas (API caída, duplicados, sin cupo).
4. **26 oct:** ensayo del flujo completo.

#### Tareas por Desarrolladora

| Tarea | **Nataly (Dev A)** | **Nicol (Dev B)** | **Jael (Dev C)** |
|---|---|---|---|
| **Migraciones** | `comprobantes_pago` | `envios_matricula` | — |
| **Modelos** | `ComprobantePago` | `EnvioMatricula` | — |
| **Servicios** | `PaymentService` (subida de archivo a storage privado, aprobar, rechazar; al aprobar llama a `EnrollmentService::iniciarMatricula()` y a `BitacoraService`) | `EnrollmentService` (envío a Proyecto 2 vía HTTP, manejo de fallos, reintentos, marcar manual; al convertir llama a `PipelineService::moverEtapa()` y a `BitacoraService`) | `ReportService` (resumen vendedor, conversión coordinador, dashboard); manejo de timeout y errores hacia el Proyecto 2 en `CatalogService` |
| **Controladores** | `PaymentController` (subir, cola, aprobar, rechazar, descarga protegida del archivo) | `EnrollmentController` (estado, reintentar, marcar manual) | `ReportController`, actualizar `DashboardController` |
| **Páginas React** | `Pages/Payments/Upload.jsx` (en detalle del lead), `Pages/Payments/ReviewQueue.jsx` (cola del admin), `ReviewModal` | `Pages/Pipeline/Kanban.jsx` (estado visual tras envío), `EnrollmentPanel` en `Show.jsx` | `Pages/Reports/Index.jsx`, actualizar `Dashboard/Index.jsx` |

**Criterio de aceptación Fase 3:**
- Comprobante aprobado → matrícula se envía sola → lead pasa a "Convertido".
- Si la API del Proyecto 2 falla, el lead queda en "Pago aprobado – matrícula con error" y se puede reintentar.

---

### FASE 4 — Lun 9 nov | Pulido de UI y Usabilidad

| **Nataly (Dev A)** | **Nicol (Dev B)** | **Jael (Dev C)** |
|---|---|---|
| Sesión expirada (redirect al login), mensajes de error claros, estados de carga/vacío en todas sus páginas, campana de notificaciones funcional, breadcrumbs en sus secciones. | **Kanban pulido**: Drag & Drop fluido (`@dnd-kit`), actualización optimista con rollback si el backend rechaza, filtros por vendedor/versión, scroll horizontal en móvil. | **Responsive completo**: revisión en celular de todas las pantallas del vendedor, `MobileNav`, tablas → tarjetas en móvil, colores y logo institucional. |

**Criterio de aceptación Fase 4:** un vendedor opera completo desde el celular (ver cartera, mover tarjeta, subir comprobante, agendar recordatorio).

---

### FASE 5 — Lun 16 nov | Entrega Final

| **Nataly (Dev A)** | **Nicol (Dev B)** | **Jael (Dev C)** |
|---|---|---|
| Manual de usuario (por rol, con capturas). Pruebas de permisos (matriz de roles). | Documentación técnica: endpoints con Postman/OpenAPI, diagrama de BD final, instrucciones de despliegue en el servidor del cliente (PHP + PostgreSQL). | Integración SIS–CRM de punta a punta, datos demo, pruebas de casos límite, revisión final de errores UI. |

**Todos:** congelar funcionalidades el 12 nov. Últimos días solo corrección de bugs.

---

## 8. Cómo Correr el Proyecto (Desarrollo)

```bash
# Instalar dependencias
composer install
npm install

# Configurar entorno
cp .env.example .env
php artisan key:generate

# Configurar la BD en .env: DB_DATABASE, DB_USERNAME, DB_PASSWORD
# Configurar la URL del Proyecto 2: CATALOG_API_URL=http://...

# Crear y poblar la BD
php artisan migrate:fresh --seed

# Levantar en desarrollo (UN solo comando):
npm run start
# Este comando corre: vite build --watch + php artisan serve
# → Acceder en http://127.0.0.1:8000
# → Guardar un archivo y refrescar el navegador (no hay HMR)

# O en dos terminales separadas:
npm run watch        # terminal 1
php artisan serve    # terminal 2
```

> **Importante:** No usar `npm run dev` si la ruta del proyecto tiene caracteres especiales (`#`, espacios, etc.). Usar `npm run start` en su lugar.

---

## 9. Reglas de Coordinación del Equipo

### Archivos "compartidos" – avisar antes de tocar

Estos archivos los puede necesitar editar más de una dev. Antes de modificarlos, avisar al grupo:

| Archivo | Dueña principal | Quiénes también lo tocan |
|---|---|---|
| `HandleInertiaRequests.php` | Jael | Nataly (para agregar `auth.user`) |
| `routes/web.php` | Todas | Cada una agrega sus rutas |
| `database/seeders/DatabaseSeeder.php` | Jael | Todas (para registrar sus seeders) |
| `resources/js/Layouts/AppLayout.jsx` | Jael | Nataly (campana de notificaciones), Nicol (elementos de Kanban) |
| `app/Services/BitacoraService.php` | Nataly | Nicol y Jael la **llaman** (no la editan) |
| `app/Providers/AppServiceProvider.php` | Jael | Todas (para registrar bindings si hay) |

### Contratos de servicio (interface entre devs)

Antes de la Fase 2, las tres acuerdan las firmas de los métodos que se cruzan entre módulos:

```php
// app/Services/BitacoraService.php (Nataly) — contrato público
public static function registrar(int $idLead, string $tipo, string $descripcion, ?int $idUsuario = null, ?int $idEtapaAnterior = null, ?int $idEtapaNueva = null): void

// app/Services/EnrollmentService.php (Nicol) — contrato público para Nataly
public function iniciarMatricula(ComprobantePago $comprobante): EnvioMatricula

// app/Services/PipelineService.php (Nicol) — contrato público para Nicol misma al convertir
public function moverEtapa(int $idLead, int $idEtapa, array $opciones = []): Lead
```

### Flujo de PR y ramas

```
main (protegida)
├── feat/identidad-auth          # Nataly – Fase 1
├── feat/leads-base              # Nicol – Fase 1
├── feat/plataforma-base         # Jael – Fase 1
├── feat/bitacora-recordatorios  # Nataly – Fase 2
├── feat/pipeline-kanban         # Nicol – Fase 2
├── feat/catalogo-externo        # Jael – Fase 2
├── feat/pagos                   # Nataly – Fase 3
├── feat/matricula               # Nicol – Fase 3
└── feat/reportes                # Jael – Fase 3
```

**Regla:** PR aprobado por al menos otra miembro antes de hacer merge a `main`.

---

## 10. Lista de Verificación por Fase

Antes de cada entrega, verificar:

- [ ] `php artisan migrate:fresh --seed` corre limpio sin errores.
- [ ] Las tres cuentas demo (admin, coordinador, vendedor) inician sesión y ven menús distintos.
- [ ] Cada ruta nueva tiene su `CheckRole` con los roles correctos.
- [ ] Los `FormRequest` de los formularios nuevos tienen mensajes de error en español.
- [ ] `BitacoraService::registrar()` se llama en cada acción relevante (asignación, cambio de etapa, pago).
- [ ] El guion de la demo está ensayado (quién presenta cada parte).
- [ ] No hay credenciales, tokens ni URLs de APIs en el código (solo en `.env`).

---

## 11. Sobre el Despliegue en Producción

> Esta sección es relevante si la universidad decide llevar el proyecto a producción.

- El servidor debe tener **PHP 8.2+** con extensiones: `pgsql`, `pdo_pgsql`, `fileinfo`, `exif`, `mbstring`, `openssl`.
- Configurar `APP_URL` con la URL real del servidor.
- Correr `npm run build` para compilar los assets de React (genera `public/build/`).
- `storage/app/comprobantes/` debe ser escribible (para las subidas de comprobantes de pago).
- Configurar `CATALOG_API_URL` con la URL real del Proyecto 2.
- La tabla `coordinador_version` no tiene FK hacia el Proyecto 2, por diseño: si el Proyecto 2 cambia IDs, el admin actualiza los registros manualmente desde el panel.
