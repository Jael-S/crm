# 📚 Documentación de Casos de Uso Oficiales – 1er Parcial y Trazabilidad al 100%

**Proyecto:** CRM Educativo (Grupo 5 SC)  
**Materia:** Tecnología Web / Sistemas  
**Equipo:**

- **Nataly (Dev A):** Identidad, Trazabilidad, Pagos y Conversión
- **Nicol (Dev B):** Núcleo Comercial, Embudo de Ventas y Asignaciones
- **Jael (Dev C):** Plataforma, Catálogo Externo y Reportes

---

## 🎯 1. Análisis de Cobertura: ¿Se implementan al 100% en nuestras Fases?

**SÍ, rotundo.** Los 8 Casos de Uso aprobados por el docente mapean con precisión matemática sobre las 5 fases planificadas del proyecto. Ningún requerimiento queda flotando ni desatendido:

| Caso de Uso Aprobado                                        | Módulo / Fase en Nuestro Plan     | Responsable | ¿Se cubre al 100%? | Estado / En qué Fase se completa                                                                                                                                                                                    |
| ----------------------------------------------------------- | --------------------------------- | :---------: | :----------------: | ------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| **CU1. Gestión de Usuarios**                                | Módulo 1 (Fase 1)                 | **Nataly**  |      **100%**      | **Completado en Fase 1** (CRUD usuarios, roles, passwords bcrypt, estado activo/inactivo, regla de no autobloqueo de admin).                                                                                        |
| **CU2. Gestión de Captar, Consumir Oferta**                 | Módulo 2 y Catálogo (Fases 1 y 2) |  **Jael**   |      **100%**      | **Fase 1:** Captación manual y CSV. <br>**Fase 2:** Consumo API Grupo 6SC vía `CatalogService` y registro en `lead_interes`.                                                                                        |
| **CU3. Gestión de Asignar Prospectos (Leads)**              | Módulo 2 (Fases 1 y 2)            |  **Nicol**  |      **100%**      | **Fase 1:** Bolsa Común y Round-Robin base. <br>**Fase 2:** Asignación manual, transferencias y alcance de coordinador por versión.                                                                                 |
| **CU4. Gestión de Embudo de Ventas en Tablero Kanban**      | Módulo 3 (Fases 2 y 4)            |  **Nicol**  |      **100%**      | **Fase 2:** Tablero Kanban con las 6 etapas obligatorias y actualización de etapa en BD. <br>**Fase 4:** Drag & Drop fluido interactivo.                                                                            |
| **CU5. Gestión de Pérdida de Prospectos y Motivos**         | Módulo 3 (Fase 2)                 |  **Nicol**  |      **100%**      | **Fase 2:** Transición obligatoria con modal bloqueante para exigir `id_motivo_perdida` y comentario explicativo.                                                                                                   |
| **CU6. Gestión de Validar Datos y Conversión a Matrícula**  | Módulo 4 (Fases 2 y 3)            | **Nataly**  |      **100%**      | **Fase 2:** Validación de datos de alumno (`ci`, etc.) para conversión. <br>**Fase 3:** Verificación de comprobante de pago (`comprobantes_pago`) y despacho de matrícula externa a Grupo 6SC (`envios_matricula`). |
| **CU7. Gestión de Bitácora, Interacciones y Recordatorios** | Módulo 5 (Fase 2)                 | **Nataly**  |      **100%**      | **Fase 2:** Auditoría cronológica automática (cambios de etapa, asignaciones, notas) y alertas de recordatorios por fecha/hora.                                                                                     |
| **CU8. Reportes y Estadísticas**                            | Módulo 6 (Fase 3)                 |  **Jael**   |      **100%**      | **Fase 3:** Dashboards consolidados por rol, métricas de conversión por vendedor y estadísticas de motivos de pérdida.                                                                                              |

---

## 📑 2. Fichas de Casos de Uso Detalladas (Plantillas Oficiales)

---

### 🔹 CU1. Gestión de Usuarios (Propietario, Clientes / Personal)

- **Responsable de redacción:** Nataly (Dev A)
- **Actores:** Administrador (Propietario del sistema).
- **Descripción:** Permite al Administrador dar de alta, consultar, editar y regular el estado operativo (activar/desactivar y participación en Round-Robin) de las cuentas de usuario de la institución (Administradores, Coordinadores, Vendedores).

#### Especificación:

- **Precondiciones:** El Administrador debe estar autenticado con rol activo en el sistema.
- **Flujo Principal:**
    1. El Administrador accede a la sección de administración de usuarios.
    2. El sistema lista todos los usuarios registrados mostrando su nombre completo, correo electrónico, rol asignado, estado (Activo/Inactivo) y estado en Round-Robin.
    3. El Administrador selecciona la opción de registrar un nuevo usuario e ingresa: nombre completo, correo, contraseña y selecciona un rol (`Administrador`, `Coordinador`, `Vendedor`).
    4. El sistema valida que el correo sea único y cumpla con el formato estándar.
    5. El sistema encripta la contraseña (`bcrypt`) y persiste el nuevo usuario en la base de datos con estado activo por defecto.
    6. El sistema notifica el éxito del registro y actualiza el listado.
- **Flujos Alternativos / Excepciones:**
    - **4a. Correo ya registrado:** El sistema muestra un mensaje de error impidiendo el duplicado.
    - **Editar usuario / Rol:** El Administrador puede actualizar el nombre o rol de cualquier usuario.
    - **Desactivar cuenta:** El Administrador puede alternar el switch de estado. Si la cuenta se desactiva, el usuario no podrá autenticarse.
    - **Excepción de seguridad (Autobloqueo):** Si el Administrador autenticado intenta desactivar o bloquear su propia cuenta, el sistema bloquea la acción inmediatamente y muestra el mensaje: _"El administrador no puede desactivar ni bloquear su propia cuenta"_.
- **Postcondiciones:** La cuenta de usuario queda persistida o actualizada en la tabla `usuarios`.

---

### 🔹 CU2. Gestión de Captar, Consumir Oferta

- **Responsable de redacción:** Jael (Dev C)
- **Actores:** Administrador, Coordinador, Vendedor, Sistema Externo (Grupo 6SC).
- **Descripción:** Permite captar nuevos prospectos de forma manual o masiva mediante archivos CSV, y consultar/vincular ofertas académicas actualizadas (programas, versiones, módulos) consumidas desde la API del catálogo externo.

#### Especificación:

- **Precondiciones:** El usuario debe tener acceso al sistema. La API del catálogo externo del Grupo 6SC debe estar en línea (o el sistema usará snapshot de respaldo).
- **Flujo Principal:**
    1. El usuario accede a la sección de captación o detalle del prospecto.
    2. **Vía CSV:** El usuario sube un archivo CSV con columnas (`nombre`, `telefono`, `correo`, `origen`). El sistema valida fila por fila, descarta registros erróneos y crea los prospectos en estado "Nuevo".
    3. **Vía Oferta Académica:** El sistema invoca al servicio `CatalogService` consumiendo los programas y módulos disponibles de la API externa.
    4. El usuario selecciona el programa o módulo en el que el prospecto tiene interés.
    5. El sistema registra el interés en `lead_interes`, guardando el ID externo y una instantánea (`nombre_snapshot`, `precio_snapshot`) del curso en el momento de la captación.
- **Flujos Alternativos / Excepciones:**
    - **2a. Archivo CSV con formato corrupto o delimitador erróneo:** El sistema informa las filas con error y procesa únicamente las filas válidas, registrando el conteo en `importaciones_csv`.
    - **3a. API Externa fuera de servicio:** El sistema informa que el catálogo en vivo no responde y ofrece seleccionar sobre el último snapshot conocido.
- **Postcondiciones:** Se generan los registros en `leads` y se asocian sus intereses académicos en `lead_interes`.

---

### 🔹 CU3. Gestión de Asignar Prospectos (Leads)

- **Responsable de redacción:** Nicol (Dev B)
- **Actores:** Administrador, Coordinador, Sistema (Algoritmo Round-Robin).
- **Descripción:** Distribuye prospectos que ingresan a la "Bolsa Común" (`id_vendedor = NULL`) hacia la cartera de vendedores específicos, ya sea mediante asignación manual directa, reasignación/transferencia o distribución automática equitativa (Round-Robin).

#### Especificación:

- **Precondiciones:** Existen prospectos registrados en bolsa común y vendedores activos con bandera `participa_round_robin = true`.
- **Flujo Principal:**
    1. El Administrador o Coordinador visualiza los prospectos no asignados en la Bolsa Común.
    2. **Opción A (Manual):** El usuario selecciona uno o varios leads, elige un vendedor activo del listado y confirma la asignación.
    3. **Opción B (Automática Round-Robin):** El usuario pulsa "Asignar por Round-Robin". El sistema busca el último vendedor que recibió un prospecto y asigna el siguiente lead en cola al siguiente vendedor activo en la rotación.
    4. El sistema actualiza el campo `id_vendedor` y `fecha_asignacion` en la tabla `leads`.
    5. El sistema audita la asignación creando un registro en `asignaciones_lead` indicando vendedor anterior, nuevo vendedor y tipo de asignación.
    6. El sistema notifica al vendedor correspondiente y saca el prospecto de la bolsa común.
- **Flujos Alternativos / Excepciones:**
    - **3a. No hay vendedores activos en Round-Robin:** El sistema detiene el proceso y alerta que no hay agentes disponibles para asignación equitativa.
    - **Transferencia de Lead:** Un administrador puede reasignar un lead de un vendedor a otro especificando el motivo del traspaso.
- **Postcondiciones:** El prospecto cuenta con un `id_vendedor` asignado y ya no aparece en la bolsa común.

---

### 🔹 CU4. Gestión de Embudo de Ventas en Tablero Kanban

- **Responsable de redacción:** Nicol (Dev B)
- **Actores:** Vendedor, Coordinador, Administrador.
- **Descripción:** Permite a los agentes comerciales gestionar visualmente el avance de sus prospectos asignados a lo largo de las etapas del ciclo de venta mediante un tablero Kanban interactivo compuesto por las 6 etapas institucionales.

#### Especificación:

- **Precondiciones:** El vendedor debe tener prospectos asignados en su cartera.
- **Flujo Principal:**
    1. El vendedor accede a la vista de "Pipeline / Kanban".
    2. El sistema presenta 6 columnas ordenadas: _1. Nuevo, 2. En Contacto, 3. Seguimiento, 4. Promesa de Pago, 5. Convertido, 6. Perdido_, cargando las tarjetas de los leads correspondientes a cada etapa.
    3. El vendedor selecciona una tarjeta de lead y la mueve hacia una etapa posterior (ej. de _En Contacto_ a _Seguimiento_).
    4. El sistema valida que la transición sea permitida y actualiza inmediatamente la columna `id_etapa` en la tabla `leads`.
    5. El sistema invoca automáticamente a la Bitácora para registrar la transición cronológica del estado.
    6. La tarjeta queda fijada en la nueva columna.
- **Flujos Alternativos / Excepciones:**
    - **3a. Arrastre hacia la etapa "Perdido":** Se interrumpe el flujo normal y se ejecuta el **CU5**.
    - **3b. Arrastre hacia la etapa "Convertido":** Se interrumpe el flujo normal y se ejecuta el **CU6**.
    - **Filtros de visualización:** El Administrador o Coordinador puede filtrar el tablero por vendedor específico o por versión de curso asignada.
- **Postcondiciones:** La etapa del lead cambia en la base de datos y se actualiza el estado en el embudo comercial.

---

### 🔹 CU5. Gestión de Pérdida de Prospectos y Clasificación de Motivos

- **Responsable de redacción:** Nicol (Dev B)
- **Actores:** Vendedor, Coordinador, Administrador.
- **Descripción:** Controla y formaliza el abandono o desistimiento de un prospecto en el embudo comercial, forzando la tipificación estandarizada del motivo de pérdida y la retroalimentación cualitativa para analítica de ventas.

#### Especificación:

- **Precondiciones:** El prospecto se encuentra en cualquiera de las etapas activas del embudo.
- **Flujo Principal:**
    1. El agente comercial arrastra o cambia el estado del prospecto a la etapa "Perdido".
    2. El sistema **bloquea** el guardado inmediato y despliega un modal obligatorio (`LostReasonModal`).
    3. El sistema carga el catálogo de motivos de pérdida (`Factor económico`, `Horario no disponible`, `Ya no interesado`, `Sin respuesta`).
    4. El agente selecciona un motivo obligatorio e ingresa un comentario justificativo detallado.
    5. El usuario confirma el formulario.
    6. El sistema guarda en `leads`: `id_etapa = 6 (Perdido)`, `id_motivo_perdida` y `comentario_perdida`.
    7. Se registra el evento en la Bitácora de auditoría.
- **Flujos Alternativos / Excepciones:**
    - **4a. Intento de confirmar sin seleccionar motivo:** El sistema resalta el campo en rojo y prohíbe el envío.
    - **Cancelación del modal:** Si el usuario cierra el modal, la tarjeta retorna a su etapa anterior sin modificar la base de datos.
- **Postcondiciones:** El lead queda marcado con etapa 6, vinculado a su motivo de pérdida y archivado como venta no concretada.

---

### 🔹 CU6. Gestión de Validar Datos y Procesar Conversión a Matrícula

- **Responsable de redacción:** Nataly (Dev A)
- **Actores:** Vendedor, Administrador, Sistema Externo (API Matrícula Grupo 6SC).
- **Descripción:** Formaliza el cierre de una venta verificando el cumplimiento de los datos personales obligatorios de alumno (`ci`, `fecha_nacimiento`, `ciudad`), la carga/aprobación de comprobantes de pago y la transmisión del payload de matrícula al sistema académico externo.

#### Especificación:

- **Precondiciones:** El prospecto debe estar en etapa "Promesa de Pago" con interés de curso definido y comprobante de pago subido.
- **Flujo Principal:**
    1. El vendedor sube el comprobante de pago digital (imagen o PDF) en `comprobantes_pago`.
    2. El Administrador revisa el comprobante en la cola de pagos y lo marca como `APROBADO`.
    3. El sistema solicita/valida que el prospecto cuente con los datos formales de alumno: Cédula de Identidad (`ci`), Nombre Oficial (`nombre_completo`), Fecha de Nacimiento (`fecha_nacimiento`) y Ciudad de residencia (`ciudad`).
    4. El sistema actualiza al lead a la etapa "Convertido".
    5. El sistema construye el payload JSON con los datos del alumno y el ID del curso externo y ejecuta una petición HTTP `POST` hacia el endpoint de alumnos del Grupo 6SC.
    6. El sistema registra el despacho en `envios_matricula` con estado `ENVIADO` y la respuesta del servidor externo.
- **Flujos Alternativos / Excepciones:**
    - **1a. Comprobante rechazado por el Admin:** El Admin ingresa un motivo de rechazo; el comprobante pasa a `RECHAZADO` y el lead permanece en seguimiento sin convertirse.
    - **3a. Faltan datos personales del alumno:** El sistema bloquea el paso a "Convertido" y despliega un formulario exigiendo los campos obligatorios antes de continuar.
    - **5a. Falla de conexión con la API externa (Timeout/500):** El sistema almacena el registro en `envios_matricula` con estado `ERROR` y habilita un botón para reintento manual o marcación asistida.
- **Postcondiciones:** El prospecto se convierte formalmente en Alumno, su pago queda validado y su expediente es transmitido al sistema académico externo.

---

### 🔹 CU7. Gestión de Bitácora, Interacciones y Recordatorios

- **Responsable de redacción:** Nataly (Dev A)
- **Actores:** Vendedor, Coordinador, Administrador, Sistema.
- **Descripción:** Centraliza la trazabilidad histórica completa de cada prospecto (auditoría automática de cambios de estado, asignaciones y pagos), permite a los vendedores añadir notas cualitativas de llamadas/reuniones y programar recordatorios con fecha y hora.

#### Especificación:

- **Precondiciones:** El prospecto debe existir en la base de datos.
- **Flujo Principal:**
    1. El usuario ingresa a la ficha de detalle de un prospecto.
    2. El sistema presenta una línea de tiempo (Timeline) cronológica ordenada descendentemente con todos los hitos ocurridos (creación, asignación a vendedor, cambios de etapa, aprobación de pagos).
    3. **Notas de interacción:** El vendedor escribe una nota manual sobre una llamada telefónica o conversación de WhatsApp y la guarda. El sistema persiste en `bitacora` con tipo `NOTA`.
    4. **Recordatorios:** El vendedor programa una alerta futura especificando: fecha, hora y descripción (ej. _"Llamar para confirmar transferencia a las 15:00"_).
    5. El sistema persiste el registro en `recordatorios` con estado `PENDIENTE`.
    6. Cuando llega la fecha y hora, el sistema notifica al vendedor responsable y permite marcar el recordatorio como `COMPLETADO`.
- **Flujos Alternativos / Excepciones:**
    - **Auditoría del Sistema:** Cada vez que otro caso de uso (CU3, CU4, CU5, CU6) modifica el estado del lead, se dispara internamente `BitacoraService::registrar()` sin intervención manual del usuario.
- **Postcondiciones:** Todo evento queda registrado con timestamp oficial de Bolivia (`America/La_Paz`) e identificación del usuario responsable.

---

### 🔹 CU8. Reportes y Estadísticas

- **Responsable de redacción:** Jael (Dev C)
- **Actores:** Administrador, Coordinador, Vendedor.
- **Descripción:** Proporciona cuadros de mando y reportes estadísticos agregados sobre el rendimiento del embudo de ventas, tasa de conversión por vendedor, distribución de orígenes y principales motivos de pérdida.

#### Especificación:

- **Precondiciones:** Existen prospectos con interacciones y estados registrados en la base de datos.
- **Flujo Principal:**
    1. El usuario accede al módulo de "Reportes y Estadísticas".
    2. El sistema filtra las métricas de acuerdo con el rol del usuario:
        - **Administrador:** Visualiza métricas globales de toda la institución.
        - **Coordinador:** Visualiza métricas filtradas únicamente por las versiones de programa que tiene asignadas.
        - **Vendedor:** Visualiza métricas exclusivas de su cartera personal.
    3. El sistema calcula y grafica:
        - Total de prospectos captados por canal de origen (Facebook, WhatsApp, Web, etc.).
        - Tasa de conversión de prospectos a alumnos matriculados.
        - Gráfico de embudo con volumen de leads por cada una de las 6 etapas.
        - Desglose de motivos de pérdida más frecuentes (ej. 45% Factor económico).
    4. El usuario puede seleccionar un rango de fechas para acotar el análisis.
- **Flujos Alternativos / Excepciones:**
    - **3a. Sin datos para el rango de fechas:** El sistema muestra gráficos vacíos con mensaje descriptivo _"No se encontraron registros en el período seleccionado"_.
- **Postcondiciones:** El sistema genera las consultas de solo lectura en tiempo real sin alterar el estado de la base de datos.

---

## 💾 3. Persistencia de este Documento

Este documento completo ha sido guardado en la raíz de tu proyecto como:

- [**`DOCUMENTACION_CASOS_DE_USO_OFICIALES.md`**](file:///home/nataly/Projects/crm-educativo/DOCUMENTACION_CASOS_DE_USO_OFICIALES.md)

_Nota: No se ha realizado ningún commit ni push en git._
