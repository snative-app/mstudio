<script>
  import { onMount } from 'svelte';
  import {
    addPiece,
    createEditorState,
    duplicateSelected,
    removeSelected,
    selectedPiece,
    snapValue,
    updatePiece
  } from './lib/mstudio/editorStore';
  import { createViewport } from './lib/mstudio/viewportCanvas';

  let canvas;
  let state = createEditorState();
  let viewport;
  let detach = () => {};

  const create = (type) => {
    state = addPiece(state, type);
    viewport?.render(state);
  };

  const selected = () => selectedPiece(state);
  const updateSelected = (field, rawValue) => {
    if (!state.selectedId) return;
    const value = snapValue(rawValue, state.snapCm) || 0.1;
    state = updatePiece(state, state.selectedId, { [field]: value });
    viewport?.render(state);
  };

  const onDuplicate = () => {
    state = duplicateSelected(state);
    viewport?.render(state);
  };

  const onRemove = () => {
    state = removeSelected(state);
    viewport?.render(state);
  };

  $: if (viewport) viewport.render(state);

  onMount(() => {
    viewport = createViewport(canvas);
    detach = viewport.attach(() => state);
    state = addPiece(state, 'base');
    viewport.render(state);

    return () => detach();
  });
</script>

<main>
  <aside>
    <h1>MStudio · Editor (base tipo Three Editor)</h1>
    <p>Unidades: centímetros · Ejes: X = Ancho, Y = Alto, Z = Profundidad.</p>

    <div class="toolbar">
      <button on:click={() => create('base')}>+ Base</button>
      <button on:click={() => create('lateral')}>+ Lateral</button>
      <button on:click={() => create('tapa')}>+ Tapa</button>
      <button on:click={() => create('cubo')}>+ Cubo</button>
    </div>

    <label>
      Snap (cm)
      <input type="number" min="0.1" step="0.1" bind:value={state.snapCm} />
    </label>

    <div class="objects">
      {#each state.pieces as piece}
        <button class:selected={piece.id === state.selectedId} on:click={() => (state.selectedId = piece.id)}>
          {piece.name}
        </button>
      {/each}
    </div>

    <div class="toolbar compact">
      <button on:click={onDuplicate} disabled={!selected()}>Duplicar</button>
      <button on:click={onRemove} disabled={!selected()}>Eliminar</button>
    </div>

    {#if selected()}
      <h2>Inspector de pieza</h2>
      <label>Ancho (X, cm)<input type="number" value={selected().w} min="0.1" step="0.1" on:input={(e) => updateSelected('w', e.target.value)} /></label>
      <label>Alto (Y, cm)<input type="number" value={selected().h} min="0.1" step="0.1" on:input={(e) => updateSelected('h', e.target.value)} /></label>
      <label>Profundidad (Z, cm)<input type="number" value={selected().d} min="0.1" step="0.1" on:input={(e) => updateSelected('d', e.target.value)} /></label>
      <label>Posición X (cm)<input type="number" value={selected().x} step="0.1" on:input={(e) => updateSelected('x', e.target.value)} /></label>
      <label>Posición Y (cm)<input type="number" value={selected().y} step="0.1" on:input={(e) => updateSelected('y', e.target.value)} /></label>
      <label>Posición Z (cm)<input type="number" value={selected().z} step="0.1" on:input={(e) => updateSelected('z', e.target.value)} /></label>

      <p class="meta">
        Cara frontal: {(selected().w * selected().h).toFixed(1)} cm² · Volumen: {(selected().w * selected().h * selected().d).toFixed(1)} cm³
      </p>
    {/if}
  </aside>

  <section class="viewport">
    <canvas bind:this={canvas}></canvas>
    <p>Drag = orbitar · Wheel = zoom · Inspirado en flujo del editor de Three.js.</p>
  </section>
</main>
