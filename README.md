# MStudio MVP (Editor-style en Svelte)

Este MVP usa una arquitectura inspirada en el **flujo del editor de Three.js**:
- panel lateral (objetos + inspector)
- viewport central
- unidades en **cm** y ejes claros para mueblería

## Qué trae

- Alta rápida de piezas: **Base**, **Lateral**, **Tapa**, **Cubo**.
- Inspector con medidas correctas:
  - **Ancho (X)**
  - **Alto (Y)**
  - **Profundidad (Z)**
- Posicionamiento por ejes en cm.
- Snap en cm.
- Duplicar / eliminar pieza.
- Viewport con orbita + zoom.

## Scripts

```bash
pnpm dev
pnpm build
pnpm run check:conflicts
```

## Estructura

- `src/lib/mstudio/editorStore.js` → estado y operaciones del editor.
- `src/lib/mstudio/viewportCanvas.js` → viewport/render interactivo.
- `src/App.svelte` → shell tipo editor.

## Nota importante sobre Three.js y Svelte 4

Se intentó traer `three.js/editor` directamente y migrarlo, pero este entorno devuelve `403 Forbidden` al acceder a GitHub/npm/CDN externos, por lo que no es posible copiar dependencias remotas aquí.

Aun así, este código quedó preparado para migrar rápido a Three.js real:
1. Reemplazar `viewportCanvas.js` por un `ViewportThree.js`.
2. Mantener el contrato de piezas (`id,name,w,h,d,x,y,z`) y el inspector actual.
3. Conectar Orbit/TransformControls del stack oficial cuando esté habilitada la red.
