# Guía para agentes de codificación AI en StsSalaApp

## Mejores prácticas de TypeScript

- Usa la verificación estricta de tipos (`strict` en `tsconfig.json`).
- Prefiere la inferencia de tipos cuando el tipo sea obvio.
- Evita el uso del tipo `any`; utiliza `unknown` si el tipo es incierto.

## Mejores prácticas de Angular

- Usa componentes independientes (standalone) en lugar de NgModules.
- No configures `standalone: true` en los decoradores de Angular; es el valor predeterminado en Angular v20+.
- Utiliza señales (`signals`) para la gestión del estado.
- Implementa la carga diferida (lazy loading) para las rutas de características.
- No uses los decoradores `@HostBinding` y `@HostListener`. En su lugar, utiliza el objeto `host` en los decoradores `@Component` o `@Directive`.
- Usa `NgOptimizedImage` para todas las imágenes estáticas (no funciona con imágenes base64 inline).

## Requisitos de accesibilidad

- Debe pasar todas las verificaciones de AXE.
- Debe cumplir con los estándares mínimos de WCAG AA, incluyendo la gestión del enfoque, el contraste de color y los atributos ARIA.

### Componentes

- Mantén los componentes pequeños y enfocados en una única responsabilidad.
- Usa funciones `input()` y `output()` en lugar de decoradores.
- Usa `computed()` para estados derivados.
- Configura `changeDetection: ChangeDetectionStrategy.OnPush` en el decorador `@Component`.
- Prefiere plantillas en línea para componentes pequeños.
- Prefiere formularios reactivos en lugar de formularios basados en plantillas.
- No uses `ngClass`, utiliza enlaces de `class` en su lugar.
- No uses `ngStyle`, utiliza enlaces de `style` en su lugar.
- Cuando uses plantillas o estilos externos, utiliza rutas relativas al archivo TS del componente.

## Gestión del estado

- Usa señales (`signals`) para el estado local de los componentes.
- Usa `computed()` para estados derivados.
- Mantén las transformaciones de estado puras y predecibles.
- No uses `mutate` en señales; utiliza `update` o `set` en su lugar.

## Plantillas

- Mantén las plantillas simples y evita la lógica compleja.
- Usa control de flujo nativo (`@if`, `@for`, `@switch`) en lugar de `*ngIf`, `*ngFor`, `*ngSwitch`.
- Usa el pipe `async` para manejar observables.
- No asumas que los valores globales (como `new Date()`) están disponibles.
- No escribas funciones flecha en las plantillas (no son compatibles).

## Servicios

- Diseña los servicios con una única responsabilidad.
- Usa la opción `providedIn: 'root'` para servicios singleton.
- Usa la función `inject()` en lugar de inyección en el constructor.
