# 📋 TAREAS PENDIENTES Y ACCIONES INMEDIATAS POR INTEGRANTE
## CRM Educativo UNEXO | INF513 - 2do Parcial
**Equipo:** Nataly Vanessa Martínez (Líder / Arquitectura & BD), Nicol Herbas, Jael Sandoval

> ⚠️ **INSTRUCCIÓN GENERAL OBLIGATORIA PARA EL EQUIPO:**  
> Todas deben consultar el archivo oficial **[DISEÑO_BASE_DATOS_OFICIAL_2P.md](DISEÑO_BASE_DATOS_OFICIAL_2P.md)** antes de programar o documentar.  
> - **La base de datos tiene 19 tablas oficiales** (17 de negocio + 2 técnicas exigidas por el docente).
> - **NADIE salvo Nataly debe modificar migraciones ni nombres de columnas** para evitar conflictos de Git y errores de claves foráneas.
> - La base de datos se reconstruye en local y en producción con el comando oficial:
>   ```bash
>   php artisan migrate:fresh --seed
>   ```

---

## 👩‍💻 1. NICOL HERBAS (Módulo Pipeline, Asignaciones y Motivos de Pérdida)

Nicol se encarga de pulir la lógica del embudo comercial en el Kanban, la asignación equitativa y la gestión de causales de descarte.

### Checklist de Implementación:
- [ ] **1. Candado Estricto de Etapa 2 ("En Contacto"):**
  - **Regla:** Un prospecto **NO PUEDE** pasar a "En Contacto" si no tiene un vendedor asignado (`id_vendedor IS NULL`).
  - **Acción:** Si en el Kanban se arrastra una tarjeta a "En Contacto" sin asesor, bloquear el movimiento y mostrar mensaje en español: *"Debe asignar un asesor comercial antes de iniciar el contacto"*.
- [ ] **2. Regla de Etapa 1 ("Nuevo" - Bolsa Común):**
  - **Regla:** Los prospectos en "Nuevo" pertenecen a la Bolsa Común: su `id_vendedor` debe ser estrictamente `NULL`.
  - **Acción:** Si un lead se mueve de regreso a "Nuevo", desasignar al vendedor automáticamente (`id_vendedor = null`) y registrarlo en la bitácora.
- [ ] **3. Round-Robin Ponderado por Carga Comercial (Least-Loaded):**
  - **Regla:** No hacer una simple rotación cíclica (1, 2, 3...).
  - **Acción:** Consultar cuántos leads activos (en etapas 2, 3 y 4) tiene cada vendedor con `participa_round_robin = true` y `activo = true`. Asignar el lead entrante al vendedor que tenga la **menor cantidad de prospectos activos asignados**.
- [ ] **4. Diferenciación entre Asignación Inicial y Transferencia:**
  - **Asignación Inicial:** Desde la Bolsa Común (`id_vendedor == null`). No exige motivo de reasignación.
  - **Transferencia:** El prospecto ya tenía un vendedor asignado. Debe abrir un modal que exija obligatoriamente el campo `motivo` (mínimo 5 caracteres) y guardar la auditoría en `asignaciones_lead`.
  - **Bloqueo de Reasignación Duplicada:** Impedir reasignar al mismo vendedor que ya lo tiene asignado (`vendedor_nuevo_id === vendedor_actual_id`). Mensaje: *"El prospecto ya se encuentra asignado a este asesor"*.
- [ ] **5. Filtro por Vendedor en Vista de Prospectos (`/leads`):**
  - En la tabla general de prospectos, agregar un dropdown selector de asesores comerciales (visible para Administrador y Coordinador) para filtrar la lista rápidamente.
- [ ] **6. CRUD de Motivos de Pérdida:**
  - Crear la vista administrativa para gestionar los registros de la tabla `motivos_perdida` (crear nuevos motivos, editar y cambiar estado activo/inactivo).
- [ ] **7. Modal Obligatorio al Marcar como "Perdido" en Kanban:**
  - Al arrastrar a la columna "Perdido", abrir modal exigiendo:
    1. Selector de motivo (catálogo `motivos_perdida`).
    2. Comentario explicativo (mínimo 5 caracteres).
- [ ] **8. Documentación:**
  - Apoyar a Jael en la revisión del documento formal asegurando que los diagramas coincidan con las 19 tablas oficiales.

---

## 👩‍💻 2. JAEL SANDOVAL (Módulo Importaciones CSV, BI de Coordinador y Diagramas)

Jael es responsable de la resiliencia en la captura masiva de datos, el cuadro de mando analítico para el Coordinador (CU8) y la elaboración de los diagramas formales en Enterprise Architect.

### Checklist de Implementación:
- [ ] **1. Fallback Resiliente en Importaciones CSV:**
  - **Problema:** Si una fila del CSV tiene la columna `origen` vacía o con un texto no registrado en la BD, la importación fallaba por completo.
  - **Solución:** Asignar automáticamente un origen por defecto (`Web` o `Feria/Otro`) en lugar de rechazar el archivo.
  - Registrar las advertencias y filas erróneas en la tabla `importaciones_csv_errores` para que el usuario pueda ver qué filas presentaron anomalías.
- [ ] **2. Dashboard Analítico y Métricas para Coordinador (CU8):**
  - El Coordinador **no vende ni contacta leads**. Su función es supervisar la demanda académica de sus programas asignados.
  - **Métricas obligatorias en su pantalla:**
    - **Embudo de Conversión Académico:** Volumen de prospectos en cada etapa para los diplomados/módulos que coordina.
    - **Tasa de Cierre y Efectividad:** Porcentaje de interesados que culminaron en matrícula exitosa.
    - **Monitoreo de Asesores:** Lista de qué vendedores están atendiendo prospectos que tienen interés en sus programas.
    - **Gráficos interactivos:** Top motivos de pérdida y canales de captación más efectivos para sus programas.
- [ ] **3. Restricción Estricta de Alcance del Coordinador:**
  - Asegurar que todas las consultas y reportes que visualiza el Coordinador filtren exclusivamente por los `id_version_externo` que dicho usuario tiene asignados en la tabla `coordinador_version`.
- [ ] **4. Diagramas UML en Enterprise Architect (EA):**
  - **Regla Fundamental:** Guiarse estrictamente por el archivo `DISEÑO_BASE_DATOS_OFICIAL_2P.md`.
  - **Atención al Rombo de Composición:** El rombo negro `◆` debe ir **pegado al Padre (`Lead` o `ImportacionCsv`)**, NUNCA a las tablas hijas.
  - Incluir las 19 tablas y cardinalidades exactas (`1..*`, `0..*`, `1..1`, `0..1`).
- [ ] **5. Regla Crítica del Catálogo Externo y Vistas de Coordinador (Cohortes y Grupos Vigentes):**
  - Al consultar el catálogo (`/api/v1/catalogo`) del Proyecto 2:
    - **Cohortes de Programas:** Filtrar estrictamente solo las que estén en estado `en_convocatoria` o `en_curso` y con `admite_inscripciones: true`.
    - **Grupos de Módulos:** Filtrar estrictamente solo los que estén en estado `en_convocatoria`, `habilitado` o `en_curso` y con `admite_inscripciones: true`.
    - **Motivo Académico:** Según la Ing. Miriam, si un curso ya inició hace 3-4 días aún existe flexibilidad institucional para inscribir estudiantes (`en_curso` / `habilitado`). Los que están en estado `planificado`, `finalizado` o `cancelado` **NO DEBEN MOSTRARSE** en las opciones de selección para evitar rechazos en el microservicio de matrículas.
    - **Trazabilidad de Errores:** En caso de que la API externa devuelva un rechazo, el sistema debe capturar y exponer el motivo específico devuelto en el JSON (ej. cupos agotados, fuera de convocatoria, o documento/correo duplicado).

---

## 👩‍💻 3. NATALY MARTÍNEZ (Líder, Core Backend, Despliegue y Requisitos de Evans)

Nataly centraliza la arquitectura de base de datos, el flujo transaccional de pagos, la formalización de matrículas y el despliegue del sistema a producción.

### Checklist de Implementación:
- [ ] **1. Centralización y Reconstrucción de la Base de Datos:**
  - Crear y ajustar las migraciones de las 19 tablas según `DISEÑO_BASE_DATOS_OFICIAL_2P.md`.
  - Garantizar que el comando `php artisan migrate:fresh --seed` corra 100% limpio sin errores de foreign keys.
- [ ] **2. Implementación de Múltiples Intereses y Reingresos (Punto 1.3):**
  - **Cobro por Interés Específico:** Enlazar `comprobantes_pago` con `lead_interes` para que al pagar o subir voucher se especifique qué diplomado o módulo se cancela.
  - **Estados de Interés:** Actualizar `lead_interes.estado` (`EN_SEGUIMIENTO`, `MATRICULADO`, `CANCELADO`) al aprobarse el pago, permitiendo que un prospecto curse un diplomado y siga en seguimiento en otro simultáneamente.
  - **Reingreso de Ex-Alumnos:** Al registrar un prospecto con un CI/correo existente, detectar su historial previo y sugerir el descuento de fidelidad de la tabla `descuentos`.
- [ ] **3. Ajuste de Permisos RBAC para el Vendedor en Bolsa Común:**
  - El vendedor **NO PUEDE autotomarse leads** de la Bolsa Común.
  - Puede ver la Bolsa Común en modo solo lectura para conocer el volumen, pero la asignación es exclusividad del Administrador.
- [ ] **4. Restablecer Credenciales por Correo:**
  - Configurar las rutas de recuperación de contraseña apuntando al modelo `Usuario` y la tabla `usuarios` (usando `password_hash`).
- [ ] **5. Formulario de Formalización de Matrícula sin Campos Duplicados:**
  - Al avanzar a la conversión, solo solicitar los campos académicos faltantes:
    - Cédula de Identidad (`ci`)
    - Fecha de Nacimiento (`fecha_nacimiento`)
    - Ciudad de Expedición (`ciudad_expedido`)
  - Mostrar los datos ya conocidos (`nombre`, `correo`, etc.) precargados como solo lectura.
- [ ] **6. Formulario Público de Pre-registro (`/registro`):**
  - Formulario público para prospectos que llegan de redes sociales con selector de catálogo en vivo del Grupo 6.
  - **Blindaje de Seguridad:** Rate limiting estricto (`throttle:5,1`) y campo trampa Honeypot contra bots automáticos.
- [ ] **7. Pasarela de Pagos (Stripe y Modo Simulado):**
  - Pasarela con doble modo:
    1. **Modo Simulado (por defecto):** Permite demostrar cobros instantáneos en la defensa sin requerir internet ni claves bancarias externas.
    2. **Modo Stripe (prueba):** Configurable con `STRIPE_KEY` y `STRIPE_SECRET` usando tarjetas de prueba (`4242 4242 4242 4242`).
- [ ] **8. Requisitos de Evans en Layout y Frontend:**
  - **Logos Oficiales UNEXO:** Integrar `unexo1.jpeg` y `unexo2.jpeg` en el Navbar y Login.
  - **Variables CSS UNEXO:** Refactorizar `app.css` con la paleta oficial (Azul Noche `#0a2540`, Teal `#00b4d8`, Acento Coral `#e63946`).
  - **Selector de 3 Temas:** Adultos (sans-serif formal, azul oscuro, rectangular), Jóvenes (moderno tech, micro-bordes), Niños (amarillo suave crema, bordes redondeados).
  - **Accesibilidad:** Botones de escalado tipográfico (`A-` / `A+`) y Alto Contraste.
  - **Contador de Visitas en Footer:** Tabla `visitas` y middleware `ContadorVisitas`.
  - **Búsqueda Global en Header:** Input predictivo que redirige a módulos o fichas de leads.
  - **Sidebar por los 8 Casos de Uso:** Organizado en acordeón con títulos concisos de 2 a 4 palabras.
- [ ] **9. Despliegue en Tecnoweb con SOLO FTP Habilitado:**
  - Compilar build de producción en local (`npm run build` con base subcarpeta).
  - Subir vía FileZilla a `/home/grupo05sc/apps/proyecto2`.
  - Ejecutar script web `deploy_runner.php` para crear symlinks públicos y correr migraciones en PostgreSQL sin necesidad de terminal SSH.
