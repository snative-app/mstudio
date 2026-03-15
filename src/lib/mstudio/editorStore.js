export const PIECE_PRESETS = {
  base: { w: 80, h: 3.6, d: 55 },
  lateral: { w: 1.8, h: 72, d: 55 },
  tapa: { w: 80, h: 1.8, d: 55 },
  cubo: { w: 60, h: 60, d: 60 }
};

const uid = () => Math.random().toString(36).slice(2, 9);

export function createEditorState() {
  return {
    snapCm: 1,
    pieces: [],
    selectedId: null
  };
}

export function addPiece(state, type = 'cubo') {
  const preset = PIECE_PRESETS[type] || PIECE_PRESETS.cubo;
  const piece = {
    id: uid(),
    kind: type,
    name: `${type[0].toUpperCase()}${type.slice(1)} ${state.pieces.length + 1}`,
    ...preset,
    x: state.pieces.length * 85,
    y: preset.h / 2,
    z: 0,
    color: '#38d4cf'
  };

  return {
    ...state,
    pieces: [...state.pieces, piece],
    selectedId: piece.id
  };
}

export function updatePiece(state, id, patch) {
  return {
    ...state,
    pieces: state.pieces.map((piece) => (piece.id === id ? { ...piece, ...patch } : piece))
  };
}

export function removeSelected(state) {
  if (!state.selectedId) return state;
  const pieces = state.pieces.filter((piece) => piece.id !== state.selectedId);
  return { ...state, pieces, selectedId: pieces[0]?.id ?? null };
}

export function duplicateSelected(state) {
  const selected = state.pieces.find((piece) => piece.id === state.selectedId);
  if (!selected) return state;

  const clone = {
    ...selected,
    id: uid(),
    name: `${selected.name} copia`,
    x: selected.x + selected.w + 3
  };

  return {
    ...state,
    pieces: [...state.pieces, clone],
    selectedId: clone.id
  };
}

export function snapValue(value, snapCm) {
  return Math.round((Number(value) || 0) / snapCm) * snapCm;
}

export function selectedPiece(state) {
  return state.pieces.find((piece) => piece.id === state.selectedId) ?? null;
}
