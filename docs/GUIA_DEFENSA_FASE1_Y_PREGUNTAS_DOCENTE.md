# 🎓 Guía Estratégica de Defensa – Fase 1 y Preguntas para la Ing. Miriam Quispe
**Materia / Proyecto:** Proyecto 1: Sistema de Control de Prospectos (CRM Educativo)  
**Grupo:** Grupo 5 SC – Facultad de Ingeniería (FICCT - UAGRM)  
**Desarrolladora:** Nataly (Dev A - Identidad, Autenticación y Trazabilidad)  
**Fecha de Presentación:** 29 de Septiembre, 2026  

---

## 🧭 1. Diagnóstico: ¿Por qué te sentías "chipada" con el Coordinador?

No te estás chipando sola: **detectaste una contradicción real** entre la hoja impresa oficial de la Ing. Miriam (`requisitos.jpeg`) y la tabla interna que redactó tu grupo en el plan (`PLAN_TRABAJO_CRM_GRUPO5.md`).

### La Contradicción Detectada:
* **En la hoja oficial de la Ing. Miriam (`requisitos.jpeg` - RF2.3):**
  > *"RF2.3: Asignación de prospectos (manual por el **Administrador/Coordinador** o automática tipo Round-Robin a los vendedores)."*  
  👉 **La docente dice explícitamente que el Coordinador SÍ puede asignar prospectos.**
* **En la tabla de permisos del plan interno (Fila 562):**
  > Alguien del equipo le puso `❌` al Coordinador en "Asignar / Transferir leads".

### La Solución y el Modelo Mental Correcto:
1. **¿Cómo sabe el Grupo 2 el ID del Coordinador?**
   * **El Grupo 2 (Proyecto 2) NO sabe ni necesita saber quién es el coordinador.**
   * El Grupo 2 solo gestiona el catálogo académico: expone una API con programas y versiones (ej. *Diplomado en Ciberseguridad - Versión 1, ID: 101*).
   * **En TU CRM** existe una tabla local llamada `coordinador_version` (`id_usuario`, `id_version_externo`).
   * El **Administrador del CRM** es quien vincula en el sistema: *"El Coordinador Juan supervisa la Versión 1 de Ciberseguridad"*.
2. **¿Qué hace exactamente el Coordinador?**
   * **Es el líder académico y comercial de sus programas:** Según **RF1.3**, solo ve métricas y leads interesados en los programas a su cargo.
   * **Asigna leads de su programa:** Según **RF2.3**, si llega un prospecto para su diplomado, él puede asignarlo a dedo al mejor vendedor o pasarlo a la bolsa/Round-Robin.
   * **Carga prospectos:** Según **RF2.1**, puede importar listas en CSV de interesados en su programa.
   * **Monitorea el Kanban y Bitácora:** Supervisa que los vendedores estén llamando a los prospectos de sus cursos sin invadir los cursos de otros coordinadores.

---

## 📋 2. Batería de Preguntas Clave para la Entrevista con la Ing. Miriam

Aprovecha la presentación de mañana para hacer estas preguntas estratégicas. Mostrarán dominio técnico, visión de negocio y análisis crítico:

### 🔹 Pregunta 1: Atribuciones exactas del Coordinador vs Administrador (RF1.3 y RF2.3)
> *"Ingeniera, en el RF2.3 de la guía se indica que la asignación manual la realizan tanto el Administrador como el Coordinador. En nuestra arquitectura, el Coordinador solo ve las versiones a su cargo (RF1.3). Queremos reconfirmar: ¿el Coordinador puede asignar prospectos únicamente a los vendedores activos en Round-Robin de sus propios programas, o tiene la facultad de reasignar cualquier prospecto que ingrese a sus versiones?"*

### 🔹 Pregunta 2: Creación de Cuentas y Recuperación de Contraseña (RF1.1)
> *"Respecto al Módulo 1 (RBAC y Usuarios), al ser este un CRM interno institucional de uso cerrado por el personal de la facultad:  
> ¿Las cuentas son dadas de alta exclusivamente por el Administrador con contraseña inicial temporal (como lo tenemos hoy), o requiere que el sistema envíe un correo de activación / reseteo por SMTP/Gmail? (Esto considerando las restricciones y cuotas de servidores de correo en entornos locales)."*  
> *(Nota: El 99% de las veces, para Fase 1 los docentes prefieren que el Admin cree usuarios directamente sin depender de servidores de correo externos).*

### 🔹 Pregunta 3: Vinculación con el Proyecto 2 (Catálogo de Programas y Módulos)
> *"En los apuntes de la hoja dice: 'No hay dependencia Módulo-Programa... 4 programas (V1, V2, V3, V4), módulo (puede ser o no en un curso)'.  
> ¿El Proyecto 2 expondrá dos endpoints separados (uno para programas/versiones completos y otro para módulos sueltos), o será un único endpoint de catálogo con un discriminador de tipo? Nosotros ya tenemos preparado el modelo `lead_interes` para almacenar el ID externo y el snapshot del nombre."*

### 🔹 Pregunta 4: Cierre de Venta y Matrícula Manual vs Automática (Notas a mano al pie)
> *"Vimos la anotación: 'MANUALMENTE que paga (Foto de comprobante) / Lead a Alumno (API) Inscribir manualmente'.  
> Para la Fase 3, ¿el flujo esperado es que el vendedor sube la foto del comprobante de depósito, el Administrador lo aprueba y ahí recién se consume la API para convertir el Lead a Alumno, o el Coordinador también debe visar el comprobante académico?"*

### 🔹 Pregunta 5: Bolsa Común y Round-Robin (RF1.2 y RF2.3)
> *"Cuando un lead no es asignado inmediatamente a un vendedor, ¿entra directamente a la 'Bolsa Común' para que cualquier vendedor lo tome, o el algoritmo Round-Robin debe distribuirlo de inmediato entre los vendedores marcados como activos en el reparto?"*

---

## 🛡️ 3. Qué Defender Mañana en la Fase 1 (Tu Módulo: Nataly)

Tu trabajo en el **Módulo 1** está sólido, blindado y 100% operativo. Aquí tienes tu guión de demostración:

### Paso 1: Identidad Visual y Estándares UAGRM
- Muestra la pestaña del navegador: **CRM EDUCATIVO** con el **escudo oficial de FICCT** en alta resolución (sin el rayo de Vite).
- Explica que el logo institucional se integró limpiamente en el Login y en el Navbar de 80px siguiendo los tokens oficiales de `DESIGN.md` con el rojo institucional (`#da3038`).
- Zona horaria configurada en `America/La_Paz` (GMT-4 Bolivia).

### Paso 2: Autenticación y Matriz de Roles (RBAC - RF1.1)
- Demuestra el ingreso con las 3 credenciales preconfiguradas:
  - **Admin:** `admin@crm.bo` / `password123`
  - **Coordinador:** `coordinador@crm.bo` / `password123`
  - **Vendedor:** `vendedor1@crm.bo` / `password123`
- Muestra cómo el menú lateral (Drawer) y el Dashboard se adaptan automáticamente según el rol del usuario que inicia sesión (autorización mediante middleware estricto `CheckRole`).

### Paso 3: Gestión Integral de Usuarios (Exclusivo Administrador)
- Entra a `/usuarios`:
  - **Listado y Filtros:** Búsqueda en tiempo real por nombre/correo, filtro por rol y estado.
  - **Creación / Edición:** Validación con FormRequests en español y encriptación Bcrypt.
  - **Participación en Round-Robin:** Interruptor interactivo para incluir o excluir vendedores del reparto automático (RF2.3).
  - **Protección contra Auto-Bloqueo (Punto clave de seguridad):** Muestra con orgullo que si el propio Administrador intenta desactivarse, el sistema lo bloquea tanto en el frontend (`Activo (Tú)`) como en el backend con una alerta de seguridad, garantizando que el sistema nunca quede inaccesible.

### Paso 4: Tablas Maestras / Catálogos Lookups
- Entra a `/lookups`:
  - Muestra la pantalla interactiva con las 6 **Etapas del Pipeline** (*Nuevo ➔ En Contacto ➔ Seguimiento ➔ Promesa de Pago ➔ Convertido ➔ Perdido*), los **Orígenes de Lead** y los **Motivos de Pérdida**, integrados con Inertia y listos para alimentar los formularios de Nicol (Leads) y Jael (CSV).

### Paso 5: Respaldo de Calidad Automatizada
- Menciona que el módulo cuenta con **14 pruebas automatizadas (Feature Tests)** pasando al 100% (`php artisan test`) y compilación frontend limpia con Vite en menos de 500 ms.

---

## 💡 4. Resumen Rápido para tu Tranquilidad

| Duda que tenías | Realidad del Proyecto |
|---|---|
| *¿El Grupo 2 sabe el ID del coordinador?* | **No.** La relación vive adentro de tu CRM en la tabla `coordinador_version`. |
| *¿El administrador le asigna el curso al coordinador?* | **Sí.** El Admin vincula qué coordinador maneja qué versión de curso. |
| *¿El coordinador puede asignar leads a vendedores?* | **Sí, según la hoja de la Ing. Miriam (RF2.3).** Puede asignar leads de sus propios cursos. |
| *¿Falta verificación por Gmail o recuperar clave?* | **No es un requisito de la hoja.** En la entrevista se consulta como mejora opcional, pero para Fase 1 no es exigido. |
