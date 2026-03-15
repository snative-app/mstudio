# MStudio MVP (Svelte + Vite)

Editor 3D **súper básico** para muebles de melamina en **centímetros**.

## Qué trae hoy

- Canvas wireframe 3D liviano (sin dependencias 3D externas).
- Alta de piezas rápidas: **Base**, **Lateral**, **Tapa**, **Cubo**.
- Edición clara de medidas con términos de carpintería:
  - **Ancho (X)**
  - **Alto (Y)**
  - **Profundidad (Z)**
- Snap configurable en cm.
- Duplicar / eliminar pieza.

## Uso

```bash
pnpm install
pnpm dev
```

## Siguiente paso recomendado

Migrar el motor de dibujo a `three.js/editor` manteniendo este mismo modelo de datos de piezas.

1. Mantener `id, name, w, h, d, x, y, z` como contrato central.
2. Cambiar solo la capa de render/interacción al stack de Three.js Editor.
3. Agregar selección por click 3D + gizmos de mover/escalar.
4. Agregar export de despiece (CSV) para producción.

## Nota de entorno

En este entorno la instalación de paquetes npm externos devolvió `403 Forbidden`, por eso el MVP actual usa canvas nativo como base funcional inmediata.
