# 📑 Documentación de Casos de Uso – CRM Educativo (Grupo 5 SC)
**Proyecto:** Sistema de Control de Prospectos y Trazabilidad Académica (CRM Educativo)  
**Institución:** Facultad de Ingeniería en Ciencias de la Computación y Telecomunicaciones (FICCT - UAGRM)  
**Docente:** Ing. Miriam Quispe / Ing. Fernando Ibañez  
**Autora:** Nataly (Dev A - Identidad, Seguridad y Trazabilidad)  
**Versión:** 1.0 (Cierre de Fase 1 e Implementación de Módulo 1)  
**Fecha:** 29 de Septiembre, 2026  

---

## 1. Resumen Ejecutivo y Alcance

El presente documento formaliza la ingeniería de requisitos y el catálogo completo de **Casos de Uso (CU)** del proyecto CRM Educativo. El sistema tiene como objetivo centralizar la captación de prospectos (leads), automatizar la asignación a la fuerza comercial, gestionar el embudo de ventas en etapas estandarizadas y garantizar la trazabilidad de interacciones y pagos hasta la conversión y matrícula final.

### Total de Casos de Uso del Sistema: **20 Casos de Uso**
Los casos de uso cubren la totalidad de los requerimientos funcionales (**RF1.1 a RF4.3**, requerimientos no funcionales y notas técnicas de integración).

---

## 2. Matriz de Requerimientos Funcionales vs Casos de Uso

| Módulo | RF Asociado | Código CU | Nombre del Caso de Uso | Estado / Fase | Responsable |
|---|---|---|---|---|---|
| **M1: Seguridad y Usuarios** | RF1.1 | **CU-01** | Iniciar Sesión en el Sistema | **Implementado (Fase 1)** | Nataly |
| **M1: Seguridad y Usuarios** | RF1.1 | **CU-02** | Cerrar Sesión Segura | **Implementado (Fase 1)** | Nataly |
| **M1: Seguridad y Usuarios** | RF1.1 | **CU-03** | Crear Nuevo Usuario en el Sistema | **Implementado (Fase 1)** | Nataly |
| **M1: Seguridad y Usuarios** | RF1.1 | **CU-04** | Modificar Datos y Rol de Usuario | **Implementado (Fase 1)** | Nataly |
| **M1: Seguridad y Usuarios** | RF1.1 | **CU-05** | Activar / Desactivar Cuenta (Anti-Bloqueo) | **Implementado (Fase 1)** | Nataly |
| **M1: Seguridad y Usuarios** | RF2.3 | **CU-06** | Configurar Vendedor en Round-Robin | **Implementado (Fase 1)** | Nataly |
| **M2: Catálogos / Lookups** | RF3.2, RF3.3 | **CU-07** | Consultar Catálogos Maestros (Lookups) | **Implementado (Fase 1)** | Nataly / Jael |
| **M3: Gestión de Leads** | RF2.1 | **CU-08** | Registrar Prospecto (Lead) Manual | Fase 1 | Nicol |
| **M3: Gestión de Leads** | RF2.1 | **CU-09** | Importar Prospectos Masivamente (CSV) | Fase 1 | Jael |
| **M3: Gestión de Leads** | RF2.3 | **CU-10** | Asignar Prospecto a Vendedor | Fase 1 | Nicol |
| **M3: Gestión de Leads** | RF1.2 | **CU-11** | Gestionar Bolsa Común de Prospectos | Fase 1 | Nicol |
| **M4: Pipeline Comercial** | RF3.1, RF3.2 | **CU-12** | Visualizar y Mover en Tablero Kanban | Fase 2 | Nicol |
| **M4: Pipeline Comercial** | RF3.3 | **CU-13** | Descartar Prospecto con Motivo de Pérdida | Fase 2 | Nicol |
| **M4: Pipeline Comercial** | RF3.4 | **CU-14** | Validar Datos y Convertir Prospecto | Fase 2 | Nicol |
| **M5: Bitácora y Seguimiento**| RF4.1, RF4.2 | **CU-15** | Registrar Nota y Consultar Bitácora | Fase 2 | Nataly |
| **M5: Bitácora y Seguimiento**| RF4.3 | **CU-16** | Programar y Cumplir Recordatorio | Fase 2 | Nataly |
| **M2: Catálogo Externo** | RF2.2 | **CU-17** | Vincular Interés de Programa o Módulo | Fase 2 | Jael |
| **M1: Coordinación** | RF1.3 | **CU-18** | Asignar Versiones a Coordinador | Fase 2 | Jael |
| **M6: Pagos y Matrícula** | Nota Docente | **CU-19** | Subir y Aprobar Comprobante de Pago | Fase 3 | Nataly |
| **M6: Pagos y Matrícula** | Nota Docente | **CU-20** | Disparar Matrícula a API Proyecto 2 | Fase 3 | Nicol / Jael |

---

## 3. Especificación Detallada de los Casos de Uso Implementados (Fase 1)

---

### CU-01: Iniciar Sesión en el Sistema (Autenticación y RBAC)
* **Código:** `CU-01`
* **Requerimiento Funcional:** `RF1.1`, `RF1.2`, `RF1.3`
* **Actores:** Administrador, Coordinador, Vendedor.
* **Descripción:** Permite a un usuario autenticarse mediante sus credenciales institucionales (correo y contraseña). El sistema verifica el estado de la cuenta, actualiza el sello de último acceso y redirige al Dashboard con la vista y permisos específicos según su rol asignado.
* **Precondiciones:**
  1. El usuario debe estar registrado en la tabla `usuarios`.
  2. La cuenta del usuario debe estar en estado `activo = true`.
* **Disparador:** El usuario accede a la ruta `/login` y presiona el botón "Ingresar al Sistema".
* **Flujo Principal:**
  1. El usuario visualiza la pantalla de login con el título institucional **CRM EDUCATIVO** y el escudo oficial de FICCT.
  2. El usuario introduce su correo electrónico y contraseña (con opción de alternar visualización de caracteres).
  3. El usuario envía el formulario.
  4. El sistema valida el formato de los datos mediante `LoginRequest`.
  5. El sistema busca el usuario por correo electrónico en PostgreSQL.
  6. El sistema comprueba que el hash de la contraseña coincida con Bcrypt (`Hash::check`).
  7. El sistema verifica que el campo `activo` sea `true`.
  8. El sistema actualiza el campo `ultimo_acceso` con la fecha y hora actual (GMT-4 Bolivia).
  9. El sistema regenera la sesión de Laravel y comparte los datos de usuario y rol a través de Inertia.
  10. El sistema redirige al usuario a `/dashboard`, desplegando el Drawer y opciones correspondientes a su rol.
* **Flujos Alternativos / Excepciones:**
  * **4a. Datos incompletos o formato inválido:**  
    El sistema resalta los campos con error de validación en español y no envía la petición.
  * **6a. Credenciales incorrectas:**  
    Si el correo no existe o la contraseña no coincide, el sistema emite el mensaje: *"Las credenciales no coinciden con nuestros registros"* y mantiene al usuario como invitado (`assertGuest`).
  * **7a. Cuenta Inactiva / Bloqueada:**  
    Si las credenciales son correctas pero `activo = false`, el sistema bloquea el acceso inmediatamente y emite el mensaje: *"Tu cuenta se encuentra inactiva. Contacta al Administrador."*
* **Postcondiciones:** Sesión web iniciada en cookie segura; usuario redirigido a su entorno de trabajo según rol.

---

### CU-02: Cerrar Sesión Segura
* **Código:** `CU-02`
* **Requerimiento Funcional:** `RF1.1`
* **Actores:** Administrador, Coordinador, Vendedor.
* **Descripción:** Permite terminar de forma segura la sesión activa del usuario autenticado, invalidando tokens y cookies de sesión.
* **Precondiciones:** El usuario debe tener una sesión activa.
* **Disparador:** El usuario hace clic en el botón "Salir" del Navbar superior.
* **Flujo Principal:**
  1. El usuario pulsa "Salir".
  2. Inertia emite una petición POST a `/logout`.
  3. El backend invoca `AuthService::logout()`.
  4. Laravel destruye los datos de la sesión, invalida la cookie y regenera el token CSRF.
  5. El sistema redirige automáticamente a la pantalla `/login`.
* **Postcondiciones:** La sesión se elimina; el acceso a rutas protegidas queda revocado.

---

### CU-03: Crear Nuevo Usuario en el Sistema
* **Código:** `CU-03`
* **Requerimiento Funcional:** `RF1.1`, `RF2.3`
* **Actores:** Administrador.
* **Descripción:** Permite al Administrador dar de alta nuevas cuentas de usuarios asignando rol institucional, contraseña inicial y configurando su participación en el reparto Round-Robin.
* **Precondiciones:** El usuario autenticado debe tener el rol `Administrador`.
* **Disparador:** El Administrador hace clic en "Nuevo Usuario" dentro del panel `/usuarios`.
* **Flujo Principal:**
  1. El Administrador abre el modal de creación.
  2. El Administrador ingresa:
     - Nombre completo.
     - Correo electrónico (debe ser único).
     - Rol de acceso (`Administrador`, `Coordinador` o `Vendedor`).
     - Contraseña inicial (mínimo 6 caracteres).
     - Estado inicial de la cuenta (Activa por defecto).
     - Participación en Round-Robin (habilitado por defecto para rol Vendedor).
  3. El Administrador pulsa "Crear Usuario".
  4. `StoreUserRequest` valida las reglas en español.
  5. `UserService` encripta la contraseña con Bcrypt (costo 12).
  6. Se persiste el registro en la tabla `usuarios`.
  7. Se cierra el modal y se muestra un mensaje flash: *"Usuario creado exitosamente"*.
  8. La tabla se actualiza reactivamente sin recargar la página completa.
* **Flujos Alternativos:**
  * **4a. Correo ya registrado:** Se notifica: *"El correo electrónico ya se encuentra registrado."*
  * **4b. Contraseña corta:** Se notifica: *"La contraseña debe tener al menos 6 caracteres."*
* **Postcondiciones:** El nuevo usuario puede autenticarse inmediatamente en el sistema.

---

### CU-04: Modificar Datos y Rol de Usuario
* **Código:** `CU-04`
* **Requerimiento Funcional:** `RF1.1`
* **Actores:** Administrador.
* **Descripción:** Permite actualizar el nombre, correo, rol de acceso y opcionalmente restablecer la contraseña de un usuario existente.
* **Precondiciones:** El Administrador debe estar autenticado; el usuario a editar debe existir.
* **Disparador:** El Administrador pulsa el botón "Editar" en la fila correspondiente de la tabla de usuarios.
* **Flujo Principal:**
  1. El sistema carga los datos del usuario en el formulario del modal.
  2. El Administrador modifica los datos requeridos.
  3. Si el campo contraseña se deja en blanco, el sistema conserva el hash anterior sin cambios.
  4. El Administrador pulsa "Actualizar Usuario".
  5. `UpdateUserRequest` valida la unicidad del correo ignorando el ID del usuario actual.
  6. `UserService::actualizar()` persiste los cambios en PostgreSQL.
  7. Se emite el mensaje flash de éxito *"Usuario actualizado correctamente."*
* **Postcondiciones:** La información del usuario queda actualizada en base de datos.

---

### CU-05: Activar / Desactivar Cuenta de Usuario (con Protección Anti-Bloqueo)
* **Código:** `CU-05`
* **Requerimiento Funcional:** `RF1.1`, Regla de Seguridad Institucional.
* **Actores:** Administrador.
* **Descripción:** Permite habilitar o deshabilitar el acceso de cualquier cuenta de usuario de forma inmediata. Cuenta con una regla estricta de protección de resiliencia: **el Administrador no puede auto-desactivarse ni bloquearse a sí mismo**, asegurando que el CRM nunca quede huérfano de gestión.
* **Precondiciones:** El Administrador debe estar autenticado.
* **Disparador:** Clic en el botón de estado de la tabla (`Activo` / `Inactivo`) o modificación del checkbox en el modal de edición.
* **Flujo Principal (Usuario distinto al conectado):**
  1. El Administrador hace clic sobre el botón de estado del usuario a modificar.
  2. Inertia envía una petición PATCH a `/usuarios/{id}/status`.
  3. El backend verifica que `auth()->id() !== $id`.
  4. `UserService::toggleActivo()` invierte el booleano `activo`.
  5. El sistema responde con el mensaje flash: *"Usuario [activado/desactivado] correctamente."*
  6. Si la cuenta fue desactivada, el usuario no podrá volver a iniciar sesión.
* **Flujo de Excepción / Regla de Protección Anti-Bloqueo:**
  * **1a. Intento desde Frontend:**  
    En la fila correspondiente al propio Administrador conectado, el botón se sustituye por un badge protegido inerte: **`Activo (Tú)`** con cursor de prohibición y tooltip explicativo. Si se fuerza la llamada, una alerta en pantalla notifica: *"El administrador no puede bloquearse a sí mismo o desactivar su cuenta."*
  * **3a. Intento directo por HTTP/API:**  
    Si se intenta enviar un PATCH directo al ID del Administrador logueado, `UsuarioController::toggleStatus` intercepta la petición y redirige con mensaje de error: *"El administrador no puede bloquearse a sí mismo o desactivar su propia cuenta."* La base de datos mantiene inalterado el campo `activo = true`.
* **Postcondiciones:** El estado de acceso cambia en la BD; la seguridad operativa queda garantizada.

---

### CU-06: Configurar Participación en Reparto Round-Robin
* **Código:** `CU-06`
* **Requerimiento Funcional:** `RF2.3`
* **Actores:** Administrador.
* **Descripción:** Permite incluir o excluir a un Vendedor del algoritmo de asignación automática de prospectos (Round-Robin).
* **Precondiciones:** El usuario seleccionado debe tener el rol `Vendedor` (ID 3).
* **Disparador:** Clic en el botón "Participa / Excluido" de la columna Round-Robin en `/usuarios`.
* **Flujo Principal:**
  1. El Administrador hace clic en el botón de Round-Robin del vendedor.
  2. Se envía la petición PATCH a `/usuarios/{id}/round-robin`.
  3. `UserService::toggleRoundRobin()` actualiza el campo booleano `participa_round_robin`.
  4. El sistema notifica: *"Vendedor [incorporado al / excluido del] reparto Round-Robin."*
  5. El icono gira y el botón actualiza su estado visualmente.
* **Postcondiciones:** El vendedor pasa a ser elegible o no elegible por el asignador automático de leads.

---

### CU-07: Consultar Catálogos Maestros (Lookups)
* **Código:** `CU-07`
* **Requerimiento Funcional:** `RF3.2`, `RF3.3`, `RF2.1`
* **Actores:** Administrador (y Coordinador como lectura).
* **Descripción:** Permite inspeccionar las tablas maestras que parametrizan la operación del CRM: las 6 etapas del embudo comercial, los canales de captación de leads y los motivos estandarizados de pérdida.
* **Precondiciones:** Usuario autenticado con permisos de visualización.
* **Disparador:** Clic en el enlace "Catálogos Lookups" del Drawer lateral (`/lookups`).
* **Flujo Principal:**
  1. El usuario navega a `/lookups`.
  2. `LookupController::index()` recopila los registros de `etapas_pipeline`, `origenes_lead` y `motivos_perdida`.
  3. Inertia renderiza el componente `Catalog/Index.jsx`.
  4. El usuario puede alternar entre 3 pestañas:
     - **Etapas del Pipeline:** Muestra el flujo visual secuencial (*Nuevo ➔ En Contacto ➔ Seguimiento ➔ Promesa de Pago ➔ Convertido ➔ Perdido*), el orden numérico y el tipo de cierre.
     - **Orígenes de Lead:** Muestra los canales activos (*Facebook, WhatsApp, Web, Referido*).
     - **Motivos de Pérdida:** Muestra las justificaciones comerciales de descarte (*Factor económico, Horario no disponible, Ya no interesado, Sin respuesta*).
* **Postcondiciones:** Los datos del catálogo quedan disponibles tanto en la vista React como en endpoints JSON para formularios dinámicos.

---

## 4. Catálogo de Casos de Uso Restantes (Fases 2 y 3)

| ID | Nombre | Descripción Resumida |
|---|---|---|
| **CU-08** | **Registrar Prospecto Manualmente** | Creación individual de un lead con datos básicos (Nombre, Teléfono, Correo, Origen) y asignación automática o a bolsa común. |
| **CU-09** | **Importar Leads vía CSV** | Carga masiva de prospectos desde archivo CSV con validación de cabeceras y reporte de filas fallidas/exitosas. |
| **CU-10** | **Asignar Prospecto a Vendedor** | Asignación manual directa (por Admin o Coordinador para sus versiones) o delegación al algoritmo Round-Robin. |
| **CU-11** | **Tomar Prospecto de la Bolsa Común** | Vendedor toma un prospecto sin dueño (`id_vendedor = NULL`) para incorporarlo a su cartera personal. |
| **CU-12** | **Mover Prospecto en Tablero Kanban** | Interfaz visual interactiva donde las tarjetas de leads avanzan entre las columnas de etapas del pipeline. |
| **CU-13** | **Descartar Prospecto (Marcar Perdido)** | Cambio de etapa a "Perdido", exigiendo de forma obligatoria la selección de un motivo de pérdida y comentario. |
| **CU-14** | **Convertir Prospecto y Completar Datos** | Validación estricta de requisitos académicos (CI, fecha de nacimiento, ciudad) para habilitar el cierre de venta. |
| **CU-15** | **Registrar Nota en Bitácora** | Redacción de notas manuales de seguimiento vinculadas cronológicamente al historial del prospecto. |
| **CU-16** | **Programar Recordatorio de Contacto** | Creación de alarmas de llamada o seguimiento con fecha y hora para la agenda comercial del vendedor. |
| **CU-17** | **Vincular Interés Académico Externo** | Consulta vía API al catálogo del Proyecto 2 para asociar versiones de programas o módulos al prospecto. |
| **CU-18** | **Asignar Versiones a Coordinador** | El Administrador vincula qué versiones de programas académicos están bajo la tutela de cada Coordinador. |
| **CU-19** | **Subir y Auditar Comprobante de Pago** | El vendedor adjunta la foto/PDF del comprobante de depósito; el Administrador lo aprueba o rechaza con motivo. |
| **CU-20** | **Disparar Matrícula hacia Proyecto 2** | Aprobado el pago, el sistema despacha la conversión automática del Lead a Alumno consumiendo la API externa. |

---

## 5. Actores del Sistema y Modelo de Autorización (RBAC)

1. **Administrador:** Acceso irrestricto a la gestión de usuarios, catálogos, asignación global, auditoría de pagos y reportes consolidados.
2. **Coordinador:** Acceso acotado a los prospectos, métricas y asignaciones correspondientes a las versiones de programas a su cargo.
3. **Vendedor:** Operación directa sobre su cartera asignada de prospectos y acceso a la bolsa común para captar oportunidades.
4. **Sistema Externo (Proyecto 2 - SIS/Moodle):** Proveedor del catálogo académico y receptor de las matrículas consolidadas vía API REST.
