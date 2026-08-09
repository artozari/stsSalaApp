# Cambios a realizar para el funcionamiento en dev

En el archivo [.env](./.env) se debe configurar la URL y la clave de Supabase (`SUPABASE_URL` y `SUPABASE_KEY`) apuntando a la IP local de tu máquina, para que el cliente pueda conectarse al servidor de Supabase que estás ejecutando localmente. Lo mismo aplica para el broker MQTT (`MQTT_URL`).

Después de modificar `.env`, regenerar el archivo `src/environments/environment.ts` ejecutando `node scripts/set-env.mjs` o cualquier script de `npm run buildProd` / `npm run dev` (lo regeneran automáticamente).

<!--  -->

## Pequeño manual de sintaxis de Markdown

- Encabezados: usa #. Ej: `# Título`, `## Subtítulo`, `### Sección`.
- Negrita y cursiva: `**negrita**`, `*cursiva*`, `***negrita y cursiva***`.
- Listas: `- elemento` o `1. elemento` para ordenadas.
- Enlaces: `[texto](https://ejemplo.com)`.
- Imágenes: `![alt](ruta/o-url.jpg)`.
- Código inline: usa `` `código` ``. Bloques de código con tres backticks:

```
// bloque de código
console.log("hola")
```

- Citas: `> texto citado`.
- Tablas:

```
| Col1 | Col2 |
|---|---|
| a | b |
```

- Línea horizontal: `---` o `***`.

## Marcos en Markdown

Markdown no tiene un elemento específico para "marcos".

- Puedes usar `>` para citas y simular un borde:
  > Esto se ve como un bloque con margen.
- También puedes usar HTML directo si tu visor lo permite:
  <div style="border:1px solid #ccc; padding:10px;">Contenido dentro de un marco</div>

Estos son los elementos básicos para escribir en Markdown.
