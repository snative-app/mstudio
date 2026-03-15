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

## Verificación rápida de conflictos

Antes de mergear, puedes correr:

```bash
pnpm run check:conflicts
```

Si no hay marcadores `<<<<<<<`, `=======`, `>>>>>>>` en `src/`, la salida indicará `No conflict markers found in src/`.

## Cómo resolver el conflicto del PR (App.svelte y app.css)

Si GitHub marca conflicto en esos 2 archivos, puedes resolverlo localmente así:

```bash
# 1) Trae cambios del remoto
git fetch origin

# 2) Párate en tu rama del PR
git checkout <tu-rama-pr>

# 3) Mezcla main dentro de tu rama
git merge origin/main

# 4) Si hay conflicto, conserva la versión del editor MVP
#    (o abre el editor de merge y combina manualmente)
git checkout --ours src/App.svelte src/app.css

# 5) Marca como resuelto y commitea
git add src/App.svelte src/app.css
git commit -m "fix: resolve merge conflicts with main"

# 6) Verifica que compila y que no hay marcadores
pnpm run check:conflicts
pnpm build

# 7) Empuja la rama y el PR quedará sin conflictos
git push origin <tu-rama-pr>
```

> Nota: yo desde este entorno no puedo hacer click en "Approve" dentro de GitHub, pero sí dejar la rama lista para merge.

