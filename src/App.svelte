<script>
  import { onMount } from 'svelte';

  let canvas;
  let width = 900;
  let height = 560;
  let yaw = -0.7;
  let pitch = -0.45;
  let zoom = 2.4;
  let drag = null;

  let cubes = [];
  let selectedId = null;

  const edges = [
    [0, 1], [1, 2], [2, 3], [3, 0],
    [4, 5], [5, 6], [6, 7], [7, 4],
    [0, 4], [1, 5], [2, 6], [3, 7]
  ];

  const uid = () => Math.random().toString(36).slice(2, 9);

  function addCube() {
    const id = uid();
    cubes = [
      ...cubes,
      {
        id,
        name: `Cubo ${cubes.length + 1}`,
        w: 60,
        h: 60,
        d: 60,
        x: cubes.length * 80,
        y: 30,
        z: 0,
        color: '#36cfc9'
      }
    ];
    selectedId = id;
  }

  $: selected = cubes.find((c) => c.id === selectedId) ?? null;

  function updateSelected(field, value) {
    cubes = cubes.map((cube) =>
      cube.id === selectedId ? { ...cube, [field]: Number(value) || 1 } : cube
    );
  }

  function project([x, y, z]) {
    const cy = Math.cos(yaw);
    const sy = Math.sin(yaw);
    const cp = Math.cos(pitch);
    const sp = Math.sin(pitch);

    const x1 = x * cy - z * sy;
    const z1 = x * sy + z * cy;
    const y2 = y * cp - z1 * sp;

    return {
      x: width / 2 + x1 * zoom,
      y: height / 2 - y2 * zoom
    };
  }

  function drawGrid(ctx) {
    ctx.strokeStyle = '#232b39';
    ctx.lineWidth = 1;
    for (let i = -300; i <= 300; i += 30) {
      drawLine(ctx, [-300, 0, i], [300, 0, i]);
      drawLine(ctx, [i, 0, -300], [i, 0, 300]);
    }
  }

  function cubeVertices(cube) {
    const hw = cube.w / 2;
    const hh = cube.h / 2;
    const hd = cube.d / 2;

    return [
      [cube.x - hw, cube.y - hh, cube.z - hd],
      [cube.x + hw, cube.y - hh, cube.z - hd],
      [cube.x + hw, cube.y - hh, cube.z + hd],
      [cube.x - hw, cube.y - hh, cube.z + hd],
      [cube.x - hw, cube.y + hh, cube.z - hd],
      [cube.x + hw, cube.y + hh, cube.z - hd],
      [cube.x + hw, cube.y + hh, cube.z + hd],
      [cube.x - hw, cube.y + hh, cube.z + hd]
    ];
  }

  function drawLine(ctx, a, b) {
    const p1 = project(a);
    const p2 = project(b);
    ctx.beginPath();
    ctx.moveTo(p1.x, p1.y);
    ctx.lineTo(p2.x, p2.y);
    ctx.stroke();
  }

  function drawCube(ctx, cube) {
    const verts = cubeVertices(cube);
    ctx.strokeStyle = cube.id === selectedId ? '#ffe066' : cube.color;
    ctx.lineWidth = cube.id === selectedId ? 2.3 : 1.4;

    edges.forEach(([a, b]) => drawLine(ctx, verts[a], verts[b]));
  }

  function render() {
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    ctx.fillStyle = '#0b1020';
    ctx.fillRect(0, 0, width, height);

    drawGrid(ctx);
    [...cubes]
      .sort((a, b) => a.z - b.z)
      .forEach((cube) => drawCube(ctx, cube));
  }

  function onPointerDown(e) {
    drag = { x: e.clientX, y: e.clientY, yaw, pitch };
  }

  function onPointerMove(e) {
    if (!drag) return;
    yaw = drag.yaw + (e.clientX - drag.x) * 0.01;
    pitch = Math.max(-1.2, Math.min(0.2, drag.pitch + (e.clientY - drag.y) * 0.01));
    render();
  }

  function onPointerUp() {
    drag = null;
  }

  function onWheel(e) {
    e.preventDefault();
    zoom = Math.max(0.8, Math.min(8, zoom - e.deltaY * 0.002));
    render();
  }

  $: cubes, selectedId, yaw, pitch, zoom, render();

  onMount(() => {
    const ro = new ResizeObserver(([entry]) => {
      width = entry.contentRect.width;
      height = entry.contentRect.height;
      canvas.width = width;
      canvas.height = height;
      render();
    });
    ro.observe(canvas.parentElement);
    addCube();
    return () => ro.disconnect();
  });
</script>

<main>
  <aside>
    <h1>MStudio MVP</h1>
    <p>Canvas 3D ultra básico para muebles de melamina (cm).</p>

    <button on:click={addCube}>+ Crear cubo</button>

    <div class="list">
      {#each cubes as cube}
        <button
          class:selected={cube.id === selectedId}
          on:click={() => (selectedId = cube.id)}>{cube.name}</button
        >
      {/each}
    </div>

    {#if selected}
      <h2>Editar medidas</h2>
      <label>Ancho (cm)<input type="number" min="1" value={selected.w} on:input={(e) => updateSelected('w', e.target.value)} /></label>
      <label>Alto (cm)<input type="number" min="1" value={selected.h} on:input={(e) => updateSelected('h', e.target.value)} /></label>
      <label>Profundidad (cm)<input type="number" min="1" value={selected.d} on:input={(e) => updateSelected('d', e.target.value)} /></label>
      <label>Posición X (cm)<input type="number" value={selected.x} on:input={(e) => updateSelected('x', e.target.value)} /></label>
      <label>Posición Z (cm)<input type="number" value={selected.z} on:input={(e) => updateSelected('z', e.target.value)} /></label>
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
    <p>Drag para rotar · Rueda para zoom</p>
  </section>
</main>
