export function createViewport(canvas) {
  let width = 900;
  let height = 560;
  let yaw = -0.68;
  let pitch = -0.42;
  let zoom = 2.4;
  let drag = null;

  const edges = [
    [0, 1], [1, 2], [2, 3], [3, 0],
    [4, 5], [5, 6], [6, 7], [7, 4],
    [0, 4], [1, 5], [2, 6], [3, 7]
  ];

  const project = ([x, y, z]) => {
    const cy = Math.cos(yaw), sy = Math.sin(yaw);
    const cp = Math.cos(pitch), sp = Math.sin(pitch);
    const x1 = x * cy - z * sy;
    const z1 = x * sy + z * cy;
    const y1 = y * cp - z1 * sp;
    return { x: width / 2 + x1 * zoom, y: height / 2 - y1 * zoom };
  };

  const line = (ctx, a, b) => {
    const p1 = project(a), p2 = project(b);
    ctx.beginPath();
    ctx.moveTo(p1.x, p1.y);
    ctx.lineTo(p2.x, p2.y);
    ctx.stroke();
  };

  const cubeVertices = (piece) => {
    const hw = piece.w / 2, hh = piece.h / 2, hd = piece.d / 2;
    return [
      [piece.x - hw, piece.y - hh, piece.z - hd], [piece.x + hw, piece.y - hh, piece.z - hd],
      [piece.x + hw, piece.y - hh, piece.z + hd], [piece.x - hw, piece.y - hh, piece.z + hd],
      [piece.x - hw, piece.y + hh, piece.z - hd], [piece.x + hw, piece.y + hh, piece.z - hd],
      [piece.x + hw, piece.y + hh, piece.z + hd], [piece.x - hw, piece.y + hh, piece.z + hd]
    ];
  };

  const drawGrid = (ctx) => {
    ctx.strokeStyle = '#1f2940';
    ctx.lineWidth = 1;
    for (let i = -300; i <= 300; i += 30) {
      line(ctx, [-300, 0, i], [300, 0, i]);
      line(ctx, [i, 0, -300], [i, 0, 300]);
    }
  };

  const drawAxes = (ctx) => {
    ctx.lineWidth = 2;
    ctx.strokeStyle = '#ff5f56'; line(ctx, [0, 0, 0], [70, 0, 0]);
    ctx.strokeStyle = '#2ecc71'; line(ctx, [0, 0, 0], [0, 70, 0]);
    ctx.strokeStyle = '#4ea1ff'; line(ctx, [0, 0, 0], [0, 0, 70]);
  };

  const render = (state) => {
    const ctx = canvas.getContext('2d');
    ctx.fillStyle = '#090f1b';
    ctx.fillRect(0, 0, width, height);
    drawGrid(ctx);
    drawAxes(ctx);

    [...state.pieces]
      .sort((a, b) => a.z - b.z)
      .forEach((piece) => {
        const verts = cubeVertices(piece);
        ctx.strokeStyle = piece.id === state.selectedId ? '#ffe066' : piece.color;
        ctx.lineWidth = piece.id === state.selectedId ? 2.3 : 1.4;
        edges.forEach(([a, b]) => line(ctx, verts[a], verts[b]));
      });
  };

  const attach = (renderState) => {
    const resize = () => {
      const box = canvas.parentElement.getBoundingClientRect();
      width = box.width;
      height = box.height;
      canvas.width = width;
      canvas.height = height;
      render(renderState());
    };

    const ro = new ResizeObserver(resize);
    ro.observe(canvas.parentElement);
    resize();

    const onDown = (e) => (drag = { x: e.clientX, y: e.clientY, yaw, pitch });
    const onMove = (e) => {
      if (!drag) return;
      yaw = drag.yaw + (e.clientX - drag.x) * 0.01;
      pitch = Math.max(-1.2, Math.min(0.2, drag.pitch + (e.clientY - drag.y) * 0.01));
      render(renderState());
    };
    const onUp = () => (drag = null);
    const onWheel = (e) => {
      e.preventDefault();
      zoom = Math.max(0.8, Math.min(8, zoom - e.deltaY * 0.002));
      render(renderState());
    };

    canvas.addEventListener('pointerdown', onDown);
    canvas.addEventListener('pointermove', onMove);
    canvas.addEventListener('pointerup', onUp);
    canvas.addEventListener('pointerleave', onUp);
    canvas.addEventListener('wheel', onWheel, { passive: false });

    return () => {
      ro.disconnect();
      canvas.removeEventListener('pointerdown', onDown);
      canvas.removeEventListener('pointermove', onMove);
      canvas.removeEventListener('pointerup', onUp);
      canvas.removeEventListener('pointerleave', onUp);
      canvas.removeEventListener('wheel', onWheel);
    };
  };

  return { render, attach };
}
