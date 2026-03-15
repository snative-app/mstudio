<script>
  import { onMount } from 'svelte';

  let canvas;
  let width = 900;
  let height = 560;

  // Cámara simple
  let yaw = -0.68;
  let pitch = -0.42;
  let zoom = 2.4;
  let drag = null;

  // Flujo de muebles
  let snapCm = 1;
  let cubes = [];
  let selectedId = null;

  const edges = [
    [0, 1], [1, 2], [2, 3], [3, 0],
    [4, 5], [5, 6], [6, 7], [7, 4],
    [0, 4], [1, 5], [2, 6], [3, 7]
  ];

  const uid = () => Math.random().toString(36).slice(2, 9);
  const snap = (n) => Math.round((Number(n) || 0) / snapCm) * snapCm;

  const presets = {
    cubo: { w: 60, h: 60, d: 60 },
    base: { w: 80, h: 3.6, d: 55 },
    lateral: { w: 1.8, h: 72, d: 55 },
    tapa: { w: 80, h: 1.8, d: 55 }
  };

  function addPiece(type = 'cubo') {
    const id = uid();
    const p = presets[type] || presets.cubo;

    cubes = [
      ...cubes,
      {
        id,
        name: `${type[0].toUpperCase()}${type.slice(1)} ${cubes.length + 1}`,
        ...p,
        x: cubes.length * 85,
        y: p.h / 2,
        z: 0,
        color: '#36cfc9'
      }
    ];
    selectedId = id;
  }

  function removeSelected() {
    if (!selectedId) return;
    cubes = cubes.filter((c) => c.id !== selectedId);
    selectedId = cubes[0]?.id ?? null;
  }

  function duplicateSelected() {
    if (!selected) return;
    const copy = {
      ...selected,
      id: uid(),
      name: `${selected.name} copia`,
      x: selected.x + selected.w + 3
    };
    cubes = [...cubes, copy];
    selectedId = copy.id;
  }

  function updateSelected(field, value) {
    cubes = cubes.map((cube) =>
      cube.id === selectedId ? { ...cube, [field]: snap(value) || 0.1 } : cube
    );
  }

  $: selected = cubes.find((c) => c.id === selectedId) ?? null;
  $: boardArea = selected ? (selected.w * selected.d).toFixed(1) : '0';
  $: boardVol = selected ? (selected.w * selected.h * selected.d).toFixed(1) : '0';

  function project([x, y, z]) {
    const cy = Math.cos(yaw), sy = Math.sin(yaw);
    const cp = Math.cos(pitch), sp = Math.sin(pitch);

    const x1 = x * cy - z * sy;
    const z1 = x * sy + z * cy;
    const y2 = y * cp - z1 * sp;

    return { x: width / 2 + x1 * zoom, y: height / 2 - y2 * zoom };
  }

  function cubeVertices(cube) {
    const hw = cube.w / 2, hh = cube.h / 2, hd = cube.d / 2;
    return [
      [cube.x - hw, cube.y - hh, cube.z - hd], [cube.x + hw, cube.y - hh, cube.z - hd],
      [cube.x + hw, cube.y - hh, cube.z + hd], [cube.x - hw, cube.y - hh, cube.z + hd],
      [cube.x - hw, cube.y + hh, cube.z - hd], [cube.x + hw, cube.y + hh, cube.z - hd],
      [cube.x + hw, cube.y + hh, cube.z + hd], [cube.x - hw, cube.y + hh, cube.z + hd]
    ];
  }

  function drawLine(ctx, a, b) {
    const p1 = project(a), p2 = project(b);
    ctx.beginPath();
    ctx.moveTo(p1.x, p1.y);
    ctx.lineTo(p2.x, p2.y);
    ctx.stroke();
  }

  function drawGrid(ctx) {
    ctx.strokeStyle = '#20293a';
    ctx.lineWidth = 1;
    for (let i = -300; i <= 300; i += 30) {
      drawLine(ctx, [-300, 0, i], [300, 0, i]);
      drawLine(ctx, [i, 0, -300], [i, 0, 300]);
    }
  }

  function drawCube(ctx, cube) {
    const verts = cubeVertices(cube);
    ctx.strokeStyle = cube.id === selectedId ? '#ffe066' : cube.color;
    ctx.lineWidth = cube.id === selectedId ? 2.4 : 1.4;
    edges.forEach(([a, b]) => drawLine(ctx, verts[a], verts[b]));
  }

  function render() {
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    ctx.fillStyle = '#0a101d';
    ctx.fillRect(0, 0, width, height);
    drawGrid(ctx);
    [...cubes].sort((a, b) => a.z - b.z).forEach((c) => drawCube(ctx, c));
  }

  const onPointerDown = (e) => (drag = { x: e.clientX, y: e.clientY, yaw, pitch });
  function onPointerMove(e) {
    if (!drag) return;
    yaw = drag.yaw + (e.clientX - drag.x) * 0.01;
    pitch = Math.max(-1.2, Math.min(0.2, drag.pitch + (e.clientY - drag.y) * 0.01));
    render();
  }
  const onPointerUp = () => (drag = null);
  function onWheel(e) {
    e.preventDefault();
    zoom = Math.max(0.8, Math.min(8, zoom - e.deltaY * 0.002));
    render();
  }

  $: cubes, selectedId, yaw, pitch, zoom, snapCm, render();

  onMount(() => {
    const ro = new ResizeObserver(([entry]) => {
      width = entry.contentRect.width;
      height = entry.contentRect.height;
      canvas.width = width;
      canvas.height = height;
      render();
    });
    ro.observe(canvas.parentElement);
    addPiece('base');
    return () => ro.disconnect();
  });
</script>

<main>
  <aside>
    <h1>MStudio · Editor mueble (cm)</h1>
    <p>Ancho (X) · Alto (Y) · Profundidad (Z).</p>

    <div class="row">
      <button on:click={() => addPiece('base')}>+ Base</button>
      <button on:click={() => addPiece('lateral')}>+ Lateral</button>
      <button on:click={() => addPiece('tapa')}>+ Tapa</button>
      <button on:click={() => addPiece('cubo')}>+ Cubo</button>
    </div>

    <label>
      Snap (cm)
      <input type="number" min="0.1" step="0.1" bind:value={snapCm} />
    </label>

    <div class="list">
      {#each cubes as cube}
        <button class:selected={cube.id === selectedId} on:click={() => (selectedId = cube.id)}>{cube.name}</button>
      {/each}
    </div>

    <div class="row slim">
      <button on:click={duplicateSelected} disabled={!selected}>Duplicar</button>
      <button on:click={removeSelected} disabled={!selected}>Eliminar</button>
    </div>

    {#if selected}
      <h2>Medidas de pieza seleccionada</h2>
      <label>Ancho (X, cm)<input type="number" min="0.1" step="0.1" value={selected.w} on:input={(e) => updateSelected('w', e.target.value)} /></label>
      <label>Alto (Y, cm)<input type="number" min="0.1" step="0.1" value={selected.h} on:input={(e) => updateSelected('h', e.target.value)} /></label>
      <label>Profundidad (Z, cm)<input type="number" min="0.1" step="0.1" value={selected.d} on:input={(e) => updateSelected('d', e.target.value)} /></label>
      <label>Posición X (cm)<input type="number" step="0.1" value={selected.x} on:input={(e) => updateSelected('x', e.target.value)} /></label>
      <label>Posición Y (cm)<input type="number" step="0.1" value={selected.y} on:input={(e) => updateSelected('y', e.target.value)} /></label>
      <label>Posición Z (cm)<input type="number" step="0.1" value={selected.z} on:input={(e) => updateSelected('z', e.target.value)} /></label>

      <p class="meta">Cara útil: {boardArea} cm² · Volumen: {boardVol} cm³</p>
    {/if}
  </aside>

  <section class="viewport">
    <canvas
      bind:this={canvas}
      on:pointerdown={onPointerDown}
      on:pointermove={onPointerMove}
      on:pointerup={onPointerUp}
      on:pointerleave={onPointerUp}
      on:wheel={onWheel}
    ></canvas>
    <p>Drag: rotar · Rueda: zoom · Base lista para migrar a Three.js Editor.</p>
  </section>
</main>
