# 🚀 Informe de Estado, Cambios de Nataly y Guía de Integración con Grupo 6SC

**Fecha:** 11 de Octubre, 2026  
**Responsable:** Nataly (Dev A - Identidad, Trazabilidad, Descuentos, Pagos y Matrícula)  
**Estado del Repositorio:** 100% Funcional (Fase 1, Fase 2 y Fase 3 de integración completadas localmente).  
**Tests Automatizados:** 26 tests pasados con éxito (`26 passed, 61 assertions`).  
**Compilación Frontend:** Vite lista (`npm run build` exitoso).

---

## 📌 1. ¿Hasta dónde queda el proyecto exactamente hoy?

El proyecto queda **completamente listo y funcional** con todo el flujo de negocio cerrado:

```
[Captación de Lead] (Manual o CSV)
        ↓
[Asignación de Cartera] (Bolsa Común / Round-Robin / Manual)
        ↓
[Pipeline Kanban] (Nuevo ➔ En Contacto ➔ Seguimiento ➔ Promesa de Pago)
        ↓
[Gestión Comercial] (Descuento Aplicado + Notas en Bitácora + Recordatorio Agendado)
        ↓
[Subida de Comprobante] (Asesor sube imagen/PDF de transferencia)
        ↓
[Revisión y Aprobación Financiera] (Admin aprueba en /pagos/revision)
        ↓
[Conversión y Despacho Automático] (Lead pasa a Convertido y se envía a la API del Grupo 6SC)
```

---

## 🛠️ 2. ¿Qué cambios e implementaciones realizaste (Nataly)?

1. **Modelos y Tablas en PostgreSQL:**
   - **`bitacora` ([`Bitacora.php`](file:///home/nataly/Projects/crm-educativo/crm/app/Models/Bitacora.php)):** Auditoría cronológica de notas manuales, cambios de etapa y pagos.
   - **`recordatorios` ([`Recordatorio.php`](file:///home/nataly/Projects/crm-educativo/crm/app/Models/Recordatorio.php)):** Tareas agendadas con fecha/hora de Bolivia.
   - **`descuentos` ([`Descuento.php`](file:///home/nataly/Projects/crm-educativo/crm/app/Models/Descuento.php)):** Catálogo de promociones comerciales con porcentaje y estado activo.
   - **`comprobantes_pago` ([`ComprobantePago.php`](file:///home/nataly/Projects/crm-educativo/crm/app/Models/ComprobantePago.php)):** Archivos digitales subidos por vendedores para aprobación de finanzas.
   - **`envios_matricula` ([`EnvioMatricula.php`](file:///home/nataly/Projects/crm-educativo/crm/app/Models/EnvioMatricula.php)):** Registro de peticiones HTTP enviadas a la API externa con payload JSON y logs de respuesta.

2. **Servicios de Negocio:**
   - [**`BitacoraService.php`**](file:///home/nataly/Projects/crm-educativo/crm/app/Services/BitacoraService.php): Guarda los eventos automáticamente cada vez que se mueve un lead, se asigna o se agrega una nota.
   - [**`RecordatorioService.php`**](file:///home/nataly/Projects/crm-educativo/crm/app/Services/RecordatorioService.php): Control de alertas pendientes y botón de completado.
   - [**`DescuentoService.php`**](file:///home/nataly/Projects/crm-educativo/crm/app/Services/DescuentoService.php): Creación, edición y activación de descuentos.
   - [**`PaymentService.php`**](file:///home/nataly/Projects/crm-educativo/crm/app/Services/PaymentService.php): Subida de archivo a storage público, aprobación y rechazo justificado.
   - [**`EnrollmentService.php`**](file:///home/nataly/Projects/crm-educativo/crm/app/Services/EnrollmentService.php): **Conector oficial hacia el Grupo 6SC**. Construye el body exacto especificado en [`API_CRM.md`](file:///home/nataly/Projects/crm-educativo/API_CRM.md) y envía el `POST` a `https://proyecto-l1e0.onrender.com/api/v1/matriculas`.

3. **Páginas y Vistas React:**
   - [**`Descuentos/Index.jsx`**](file:///home/nataly/Projects/crm-educativo/crm/resources/js/Pages/Descuentos/Index.jsx): CRUD administrativo en `/descuentos`.
   - [**`Payments/ReviewQueue.jsx`**](file:///home/nataly/Projects/crm-educativo/crm/resources/js/Pages/Payments/ReviewQueue.jsx): Cola de revisión en `/pagos/revision` con botones para Aprobar y Rechazar con Modal.
   - [**`Recordatorios/Index.jsx`**](file:///home/nataly/Projects/crm-educativo/crm/resources/js/Pages/Recordatorios/Index.jsx): Bandeja de alertas comerciales en `/recordatorios`.
   - [**`Leads/Show.jsx` Integrado**](file:///home/nataly/Projects/crm-educativo/crm/resources/js/Pages/Leads/Show.jsx): Ficha de lead enriquecida con:
     - Botones en barra superior: *Agregar Nota*, *Recordatorio*, *Subir Pago*.
     - Tarjeta de Comprobantes de Pago con estatus de matrícula externa.
     - Tarjeta de Recordatorios.
     - Línea de Tiempo de Bitácora vertical.

---

## 🧪 3. Guía de Pruebas Paso a Paso: Cómo Probar Todo lo Nuevo

Abre tu navegador en `http://localhost:8000` y sigue estos pasos:

### 🔹 Paso 1: Probar Descuentos Comerciales
1. Inicia sesión como Admin: `admin@crm.bo` / `password123`.
2. En el menú superior haz clic en **"Descuentos Comerciales"** (`/descuentos`).
3. Verás los descuentos sembrados (*Pronto Pago 10%*, *Pago al Contado 20%*, etc.).
4. Haz clic en **"Nuevo Descuento"**, crea uno de prueba (ej. *"Beca Convenio"*, porcentaje `15.00`) y guárdalo.
5. Puedes hacer clic sobre el botón de estado para cambiarlo a *Inactivo* o *Activo*.

---

### 🔹 Paso 2: Probar Notas en Bitácora y Recordatorios
1. Ve a **"Prospectos (Leads)"** y entra a la ficha de cualquier prospecto (ej. `/leads/1`).
2. En la barra superior, haz clic en **"Agregar Nota"**:
   - Escribe: *"El cliente consultó el horario del diplomado por WhatsApp"*.
   - Guarda la nota y observa cómo aparece al instante en la tarjeta de **Bitácora de Trazabilidad e Historial**.
3. Haz clic en **"Recordatorio"**:
   - Elige una fecha y hora futura y escribe: *"Llamar para confirmar forma de pago"*.
   - Guarda el recordatorio. Aparecerá en la tarjeta de recordatorios del lead y también en la bandeja general en el menú **"Recordatorios"** (`/recordatorios`), donde podrás marcarlo como "Listo".

---

### 🔹 Paso 3: Probar el Nuevo Flujo de Promesa de Pago, Comprobante Enriquecido y Aprobación
El flujo de pagos ahora es mucho más claro y ordenado, centralizado para **Administrador** y **Vendedor** (el **Coordinador** no tiene acceso a pagos):

1. **La Ficha del Prospecto queda limpia (`/leads/{id}`):**
   - Se removió el botón "Subir Pago" de la cabecera y del cuerpo para evitar sobrecargar la vista.
   - En su lugar, la tarjeta muestra el historial de pagos y despacho de matrícula.
   - En la sección **"Programas y Módulos de Interés"**, asegúrate de que el prospecto tenga al menos un interés vinculado (ej. *Maestría en IA - Cohorte 2026-1* o un módulo), ya que el backend valida obligatoriamente que tenga interés antes de permitir subir un pago.
   - Si deseas probar el descuento, asígnale uno desde la edición del lead (ej. *Descuento Lanzamiento 15%*).

2. **Probar desde el Tablero Kanban (`/pipeline`):**
   - Las tarjetas del Kanban conservan su diseño limpio y compacto habitual.
   - Toma una tarjeta de un prospecto y arrástrala hacia la columna **"Promesa de Pago"** (Etapa 4).
   - ¡Al soltarla ("pum"), se abre automáticamente la modal enriquecida para subir el comprobante! Si la cierras, el lead queda registrado en esa etapa y podrás gestionarlo o subir su pago desde **"Revisión de Pagos"** (o con el enlace directo en la cabecera de la columna).

3. **Verificar la Nueva Modal Enriquecida de Comprobante:**
   - **Interés Académico:** Muestra el nombre de la versión/cohorte o módulo registrado.
   - **Precio Base Oficial (API 2):** Lee automáticamente el arancel desde la API del Proyecto 2 (ej. `Bs. 2600.00`).
   - **Descuento Aplicado:** Muestra el nombre y porcentaje de descuento aplicado (ej. `15%`) y calcula el importe descontado (ej. `- Bs. 390.00`). Si no tiene descuento, indica `Sin descuento (0%)`.
   - **Monto Total Calculado:** Muestra el saldo neto a cancelar (ej. `Bs. 2210.00`).
   - **Monto Editable:** El campo **"Monto del Comprobante (Bs.)"** viene prellenado con el total calculado, pero **es el único campo editable**, permitiendo registrar si el depósito fue parcial o diferente.
   - Adjunta un archivo (JPG, PNG o PDF) y haz clic en **"Subir Comprobante"**.

4. **Probar desde "Revisión de Pagos" (`/pagos/revision` en el sidebar):**
   - En el menú lateral izquierdo verás la opción **"Revisión de Pagos"** (disponible para **Administrador** y **Vendedor**; no visible para Coordinador).
   - Esta pantalla cuenta con dos pestañas clave:
     - **Pestaña 1: "Prospectos en Promesa de Pago"**: Lista a todos los leads que están en etapa 4 esperando pago. Cada fila muestra el prospecto, WhatsApp, asesor, aranceles, descuento y su botón directo **"Subir Comprobante"**.
     - **Pestaña 2: "Cola de Comprobantes Subidos"**: Muestra los recibos subidos en espera de validación financiera.
   - **Visualización de la Foto del Comprobante:**
     - En la columna "Comprobante", verás la miniatura de la foto y el botón **"Ver Foto / Archivo"**.
     - Al hacer clic, se abre un visor en alta resolución con la foto del depósito bancario, el monto declarado y los datos del alumno.
     - Desde ese mismo visor, el **Administrador** puede revisar la imagen y presionar directamente **"Aprobar Pago"** o **"Rechazar"**.
   - Inicia sesión como **Administrador**:
     - Al aprobar el pago, el prospecto se convierte automáticamente a Alumno y se dispara la matrícula a la API externa (`https://proyecto-l1e0.onrender.com/api/v1/matriculas`).
   - Inicia sesión como **Vendedor**:
     - Puede ver sus prospectos en promesa de pago, subir comprobantes y ver la foto del comprobante subido, pero solo verá el estado sin poder auto-aprobarse pagos.

---

## 🔒 4. Estado de Git y Ramas
- Tu rama activa es `nataly`.
- Los cambios están probados y limpios en tu máquina local.
- **No se ha ejecutado ningún `git commit` ni `git push`** para que tú tengas el control total antes de subirlo.
