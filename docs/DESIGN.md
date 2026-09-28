# 🎨 Sistema de Diseño Global - Frontend (Integración IDT - Moodle)

## 1. Instrucciones para el Agente de IA

Este documento contiene las directrices de diseño y variables globales para la construcción del frontend.

**Stack Tecnológico:** El proyecto está construido sobre **Laravel + Inertia.js** (utilizando componentes Vue/React/Svelte según la configuración del proyecto).

**Reglas estrictas de desarrollo:**

1. Todos los valores (colores, sombras, radios, tipografía) deben configurarse utilizando **variables CSS (Custom Properties)** en el archivo de estilos global (ej. `app.css` o `app.scss` en la carpeta `resources/css`) o mapearse directamente en el archivo de configuración del framework de estilos (ej. `tailwind.config.js`).
2. **Cero valores "hardcoded":** Si el cliente solicita un cambio de color o borde, el desarrollador o la IA solo debe modificar el archivo de variables globales, y este cambio debe reflejarse en todos los componentes de Inertia.
3. Los componentes reutilizables (Botones, Tarjetas, Inputs) deben crearse como componentes propios de Inertia para mantener la consistencia en todas las vistas.

---

## 2. Variables Globales (Design Tokens)

Agrega esto a la raíz de tu hoja de estilos global o mapea estos valores en tu framework CSS:

```css
:root {
  /* --- Colores de Marca --- */
  --brand-primary: #3d5598;    /* Azul corporativo oscuro */
  --brand-secondary: #da3038;  /* Rojo corporativo (usado en el Navbar principal) */

  /* --- Colores Principales de Interfaz --- */
  --color-primary: #0051f9;    /* Azul brillante (Botones principales, enlaces, hover states) */
  --color-primary-hover: #0041c7; /* Azul más oscuro para el hover */
  --color-secondary: #6a737b;  /* Gris secundario (iconos inactivos, texto secundario) */

  /* --- Fondos (Backgrounds) --- */
  --bg-body: #f5f9fd;          /* Color de fondo principal de la página (Gris/Azul muy claro) */
  --bg-surface: #ffffff;       /* Fondo de tarjetas, modales y contenedores principales */
  --bg-sidebar: #f8f9fa;       /* Fondo del menú lateral (Drawer) */
  --bg-highlight: #ebf0f9;     /* Fondo para elementos destacados suaves o cabeceras de tablas */

  /* --- Texto --- */
  --text-main: #4c5a73;        /* Color principal de párrafos y textos generales */
  --text-heading: #313848;     /* Color oscuro para títulos (h1, h2, h3) y etiquetas */
  --text-muted: #6a737b;       /* Textos secundarios, fechas, subtítulos */
  --text-light: #ffffff;       /* Texto sobre fondos oscuros o botones primarios */

  /* --- Estados (Feedback) --- */
  --color-success: #28a745;
  --color-warning: #ffc107;
  --color-danger: #dc3545;
  --color-info: #17a2b8;

  /* --- Bordes y Sombras --- */
  --border-color-light: #ebf0f9;  /* Bordes de tarjetas y divisiones sutiles */
  --border-color-dark: #d5ddea;   /* Bordes de inputs y tablas */

  --shadow-sm: 0 0.125rem 0.25rem rgba(0, 0, 0, 0.075);
  --shadow-card-hover: 0 13px 37px rgba(92, 107, 121, 0.1); /* Sombra al hacer hover en tarjetas */

  /* --- Radios (Border-radius) --- */
  --radius-sm: 4px;      /* Inputs, botones pequeños */
  --radius-md: 5px;      /* Botones estándar */
  --radius-lg: 8px;      /* Tarjetas de cursos, contenedores principales */
  --radius-xl: 10px;     /* Modales */
  --radius-circle: 50%;  /* Avatares, botones de iconos */
}

3. Tipografía

El sistema utiliza fuentes sin serifa, limpias y modernas.

    Font Family Principal: Inter, -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, "Helvetica Neue", Arial, sans-serif.

    Pesos (Font Weight):

        Regular: 400 (Textos de cuerpo y descripciones).

        Semi-bold/Bold: 600 / 700 (Títulos, botones, nombres de cursos, métricas).

4. Especificaciones de Componentes para Inertia
4.1. Botones (Buttons)

Todos los componentes <Button> deben aplicar las siguientes reglas base: border-radius: var(--radius-md), font-weight: 600, padding: 11.5px 16px y transition: all 0.15s ease-in-out.

    Botón Primario (Solid):

        Background: var(--color-primary) | Color: var(--text-light)

        Hover: Background var(--color-primary-hover)

    Botón Secundario (Outline / "Ver curso"):

        Background: Transparente | Border: 1px solid var(--color-primary) | Color: var(--color-primary)

        Hover: Background var(--color-primary), Color var(--text-light).

    Botón de Icono Circular:

        Width/Height: 36px | Border-radius: var(--radius-circle) | Background: Transparente.

        Hover: Background #e9ecef o #f5f8ff.

4.2. Tarjetas (Cards)

Componente <Card> utilizado para listar cursos o mostrar métricas en el dashboard.

    Contenedor Base:

        Background: var(--bg-surface)

        Border: 1px solid var(--border-color-light)

        Border-radius: var(--radius-lg)

        Padding interno: 24px (general) o 16px (compacto).

    Comportamiento Hover (Crucial):

        No cambiar el color de fondo.

        Aplicar elevación: box-shadow: var(--shadow-card-hover); y transform: translateY(-2px) (opcional) con transición all 0.5s ease.

    Tarjetas de Curso (Vista de cuadrícula):

        Imagen cover superior con object-fit: cover y altura fija (aprox 175px).

        Categoría del curso arriba del título (Color secundario, fondo #ebf0f9, font-size: 12px, padding pequeño).

        Título del curso: color: var(--text-heading), font-size: 16px, font-weight: 600, truncado a 2 líneas (line-clamp: 2).

4.3. Estructura de Navegación (Layout en Inertia)

El layout principal (Layout.vue o Layout.jsx) debe tener:

    Navbar Superior:

        Altura fija: 80px (h-20 en Tailwind).

        Background: var(--brand-secondary) (Rojo corporativo).

        Elementos: Texto e iconos en blanco (var(--text-light)).

        Comportamiento: position: fixed; top: 0; w-full; z-index: 1030;.

    Menú Lateral (Drawer / Sidebar):

        Background: var(--bg-sidebar).

        Ancho: 315px en escritorio.

        Posición: Debajo del Navbar (top: 80px).

    Contenedor Principal (Main):

        Background: var(--bg-body).

        Padding superior: padding-top: 80px para evitar solapamiento con el Navbar fijo.

4.4. Formularios e Inputs

    Estilo Base:

        Background: var(--bg-surface)

        Border: 1px solid var(--border-color-dark)

        Border-radius: var(--radius-sm)

        Padding: 9px 16px | Min-height: 40px.

    Estado Focus:

        border-color: #7aa5ff

        box-shadow: 0 0 0 0.2rem rgba(0, 81, 249, 0.25)

        outline: none.

4.5. Barras de Progreso (Progress Bars)

    Contenedor: Background var(--border-color-light), height: 7px, border-radius: 20px.

    Relleno (Fill): Background var(--color-success) (para completados) o var(--color-primary) (en progreso), border-radius: 20px.

5. Accesibilidad y Maquetación

    Grid y Flexbox: Evitar márgenes fijos para alineación. Utilizar display: grid con gap: 24px para la cuadrícula de cursos y display: flex para componentes internos.

    Navegación en Inertia: Utilizar el componente <Link> de Inertia.js para todas las transiciones internas para mantener el estado SPA (Single Page Application) sin recargar la página.

    Imágenes: Usar siempre object-fit: cover o object-fit: contain según sea necesario para evitar deformaciones en las miniaturas de los cursos.
```
