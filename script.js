(() => {
  const reduceMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;

  function canvasFit(canvas) {
    const rect = canvas.getBoundingClientRect();
    const ratio = Math.min(window.devicePixelRatio || 1, 2);
    canvas.width = Math.round(rect.width * ratio);
    canvas.height = Math.round(rect.height * ratio);
    const ctx = canvas.getContext('2d');
    ctx.setTransform(ratio, 0, 0, ratio, 0, 0);
    return { ctx, width: rect.width, height: rect.height };
  }

  const motionCanvas = document.getElementById('motion-canvas');
  let motionFrame;
  function drawMotion(time = 0) {
    if (!motionCanvas) return;
    const { ctx, width, height } = canvasFit(motionCanvas);
    ctx.clearRect(0, 0, width, height);
    const pulse = reduceMotion ? .72 : .58 + Math.sin(time * .003) * .2;
    const point = ([x, y]) => [x * width, y * height];
    const segment = (a, b, color = 'rgba(158, 242, 210, .8)', lineWidth = 1.5) => {
      const [ax, ay] = point(a), [bx, by] = point(b);
      ctx.beginPath(); ctx.moveTo(ax, ay); ctx.lineTo(bx, by);
      ctx.strokeStyle = color; ctx.lineWidth = lineWidth; ctx.stroke();
    };
    const joint = (p, accent = false) => {
      const [x, y] = point(p);
      ctx.beginPath(); ctx.arc(x, y, accent ? 4.2 : 3, 0, Math.PI * 2);
      ctx.fillStyle = accent ? '#cdf26d' : '#b6f1dd'; ctx.fill();
      ctx.beginPath(); ctx.arc(x, y, 8 + pulse * 5, 0, Math.PI * 2);
      ctx.strokeStyle = accent ? `rgba(205,242,109,${.09 + pulse * .1})` : `rgba(182,241,221,${.07 + pulse * .09})`;
      ctx.lineWidth = 1; ctx.stroke();
    };
    // Calibrated to the actual athlete in the source image: a side-on squat, not a generic front-facing skeleton.
    const head = [.449, .205], neck = [.463, .285], shoulder = [.483, .345], hip = [.528, .538];
    const frontElbow = [.443, .382], frontGrip = [.411, .318], rearElbow = [.552, .382], rearGrip = [.584, .295];
    const frontKnee = [.480, .710], frontAnkle = [.447, .874], rearKnee = [.544, .719], rearAnkle = [.537, .872];
    [[head, neck], [neck, shoulder], [shoulder, hip], [shoulder, frontElbow], [frontElbow, frontGrip], [shoulder, rearElbow], [rearElbow, rearGrip], [hip, frontKnee], [frontKnee, frontAnkle], [hip, rearKnee], [rearKnee, rearAnkle]].forEach(([a, b]) => segment(a, b));
    [head, neck, shoulder, hip, frontElbow, frontGrip, rearElbow, rearGrip, frontKnee, frontAnkle, rearKnee, rearAnkle].forEach((p, index) => joint(p, index === 8 || index === 10));
    const [hx, hy] = point(hip), [kx, ky] = point(frontKnee), [ax, ay] = point(frontAnkle);
    ctx.beginPath(); ctx.arc(hx, hy, Math.abs(ky - hy) * .62, Math.PI * .52, Math.PI * .93);
    ctx.strokeStyle = 'rgba(205,242,109,.65)'; ctx.lineWidth = 1; ctx.stroke();
    ctx.setLineDash([4, 5]); segment(frontAnkle, [frontAnkle[0] + .20, frontAnkle[1]], 'rgba(205,242,109,.52)', 1); ctx.setLineDash([]);
    if (!reduceMotion) motionFrame = requestAnimationFrame(drawMotion);
  }

  const chartCanvas = document.getElementById('performance-canvas');
  let chartFrame;
  function drawChart(time = 0) {
    if (!chartCanvas) return;
    const { ctx, width, height } = canvasFit(chartCanvas);
    ctx.clearRect(0, 0, width, height);
    const t = reduceMotion ? 0 : time * .001;
    const chart = (top, h, color, fn, fill) => {
      const padX = 18;
      ctx.strokeStyle = 'rgba(186, 210, 199, .14)'; ctx.lineWidth = 1;
      for (let row = 0; row < 3; row++) { const y = top + (h / 2) * row; ctx.beginPath(); ctx.moveTo(padX, y); ctx.lineTo(width - padX, y); ctx.stroke(); }
      ctx.beginPath();
      for (let x = padX; x <= width - padX; x += 2) { const progress = (x - padX) / (width - padX * 2); const y = top + h * fn(progress, t); x === padX ? ctx.moveTo(x, y) : ctx.lineTo(x, y); }
      if (fill) { ctx.lineTo(width - padX, top + h); ctx.lineTo(padX, top + h); ctx.closePath(); ctx.fillStyle = fill; ctx.fill(); }
      ctx.beginPath();
      for (let x = padX; x <= width - padX; x += 2) { const progress = (x - padX) / (width - padX * 2); const y = top + h * fn(progress, t); x === padX ? ctx.moveTo(x, y) : ctx.lineTo(x, y); }
      ctx.strokeStyle = color; ctx.lineWidth = 1.7; ctx.stroke();
    };
    const gutter = 29, rowHeight = (height - gutter * 2) / 3 - 7;
    chart(gutter, rowHeight, '#b6f1dd', (p, phase) => .52 - Math.sin(p * Math.PI * 4 + phase * .55) * .22 - Math.sin(p * Math.PI * 8) * .06, 'rgba(182,241,221,.08)');
    chart(gutter + rowHeight + 10, rowHeight, '#cdf26d', (p, phase) => .52 - Math.sin(p * Math.PI * 4 + .28 + phase * .55) * .19 + Math.sin(p * Math.PI * 10) * .05, 'rgba(205,242,109,.07)');
    chart(gutter + (rowHeight + 10) * 2, rowHeight, '#7ce0ba', (p, phase) => .7 - p * .27 + Math.sin(p * Math.PI * 4 + phase) * .08, 'rgba(124,224,186,.07)');
    const markerX = 18 + ((Math.sin(t * .62) + 1) / 2) * (width - 36);
    ctx.beginPath(); ctx.moveTo(markerX, 15); ctx.lineTo(markerX, height - 14); ctx.strokeStyle = 'rgba(242,250,246,.4)'; ctx.lineWidth = 1; ctx.stroke();
    ctx.fillStyle = '#edf4ef'; ctx.font = '9px "DM Mono", monospace'; ctx.fillText('LIVE', Math.max(18, markerX - 12), 12);
    if (!reduceMotion) chartFrame = requestAnimationFrame(drawChart);
  }

  drawMotion(); drawChart();
  window.addEventListener('resize', () => { cancelAnimationFrame(motionFrame); cancelAnimationFrame(chartFrame); drawMotion(); drawChart(); });
})();
