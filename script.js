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
    const t = reduceMotion ? 1.8 : time * .001;
    const unit = Math.min(width, height);
    const p = ([x, y]) => [x * width, y * height];
    const strokePath = (points, color, lineWidth = 1.2) => {
      ctx.beginPath();
      points.forEach((point, index) => { const [x, y] = p(point); index ? ctx.lineTo(x, y) : ctx.moveTo(x, y); });
      ctx.strokeStyle = color; ctx.lineWidth = lineWidth; ctx.stroke();
    };
    const glowNode = (point, active = false) => {
      const [x, y] = p(point), pulse = active ? 5 + Math.sin(t * 3) * 2 : 3;
      ctx.beginPath(); ctx.arc(x, y, pulse, 0, Math.PI * 2); ctx.fillStyle = active ? '#cdf26d' : '#b6f1dd'; ctx.fill();
      ctx.beginPath(); ctx.arc(x, y, pulse * 2.4, 0, Math.PI * 2); ctx.strokeStyle = active ? 'rgba(205,242,109,.24)' : 'rgba(182,241,221,.18)'; ctx.lineWidth = 1; ctx.stroke();
    };

    // Garment pathways sit directly on the visible Demson suit.
    const garmentPaths = [
      [[.227,.345],[.257,.405],[.283,.475],[.316,.535],[.345,.585]],
      [[.310,.365],[.326,.445],[.334,.535],[.323,.645],[.299,.755]],
      [[.345,.575],[.375,.635],[.365,.705],[.348,.785]],
      [[.205,.375],[.184,.445],[.177,.535]]
    ];
    ctx.save(); ctx.shadowColor = 'rgba(142,239,202,.72)'; ctx.shadowBlur = 9;
    garmentPaths.forEach((path, index) => strokePath(path, index === 1 ? 'rgba(205,242,109,.75)' : 'rgba(182,241,221,.6)', 1.25));
    ctx.restore();
    const garmentNodes = [[.283,.475],[.345,.585],[.299,.755]];
    garmentNodes.forEach((node, index) => glowNode(node, index === Math.floor(t * .8) % 3));

    // A soft transition field makes the transfer from physical garment to model explicit.
    const field = ctx.createLinearGradient(width * .48, 0, width * .68, 0);
    field.addColorStop(0, 'rgba(9,14,14,0)'); field.addColorStop(.55, 'rgba(9,16,15,.44)'); field.addColorStop(1, 'rgba(9,16,15,.05)');
    ctx.fillStyle = field; ctx.fillRect(width * .46, 0, width * .27, height);

    const limb = (a, b, thickness) => {
      const [ax, ay] = p(a), [bx, by] = p(b);
      const dx = bx-ax, dy = by-ay, length = Math.hypot(dx,dy), nx = -dy/length, ny = dx/length;
      ctx.save(); ctx.lineCap = 'round'; ctx.strokeStyle='rgba(124,224,186,.045)'; ctx.lineWidth=thickness; ctx.shadowColor='rgba(124,224,186,.22)'; ctx.shadowBlur=14;
      ctx.beginPath(); ctx.moveTo(ax,ay); ctx.lineTo(bx,by); ctx.stroke(); ctx.shadowBlur=0;
      const particles = Math.max(34, Math.round(length/3.5));
      for (let i=0;i<particles;i++) {
        const u=(i*.61803398875)%1, noise=Math.sin((i+1)*91.731)*43758.5453, spread=(noise-Math.floor(noise)-.5)*thickness*.82*Math.pow(Math.sin(Math.PI*u),.32);
        const x=ax+dx*u+nx*spread, y=ay+dy*u+ny*spread, size=.55+(i%4)*.27;
        ctx.beginPath(); ctx.arc(x,y,size,0,Math.PI*2); ctx.fillStyle=i%7===0?'rgba(205,242,109,.55)':'rgba(190,249,227,.46)'; ctx.fill();
      }
      ctx.restore();
    };

    // Volumetric motion twin: a body surface, deliberately not a generic skeleton.
    const head = [.755,.265], neck = [.765,.33], shoulderL = [.725,.355], shoulderR = [.805,.37];
    const hipL = [.785,.53], hipR = [.83,.56], kneeL = [.705,.665], kneeR = [.795,.695], ankleL = [.70,.835], ankleR = [.855,.835];
    limb(shoulderL, [.69,.43], unit * .037); limb([.69,.43], [.705,.355], unit * .031);
    limb(shoulderR, [.835,.445], unit * .037); limb([.835,.445], [.82,.37], unit * .031);
    limb(hipL, kneeL, unit * .072); limb(kneeL, ankleL, unit * .055);
    limb(hipR, kneeR, unit * .072); limb(kneeR, ankleR, unit * .055);
    ctx.save();
    const bodyGlow = ctx.createRadialGradient(width*.775,height*.44,2,width*.775,height*.44,unit*.2);
    bodyGlow.addColorStop(0,'rgba(182,241,221,.22)'); bodyGlow.addColorStop(1,'rgba(124,224,186,.03)');
    ctx.beginPath();
    ctx.moveTo(...p(neck)); ctx.bezierCurveTo(width*.74,height*.33,width*.72,height*.375,width*.738,height*.425);
    ctx.bezierCurveTo(width*.755,height*.475,width*.77,height*.515,...p(hipL));
    ctx.bezierCurveTo(width*.80,height*.575,width*.82,height*.585,...p(hipR));
    ctx.bezierCurveTo(width*.835,height*.515,width*.82,height*.45,width*.815,height*.405);
    ctx.bezierCurveTo(width*.81,height*.37,width*.79,height*.34,...p(neck));
    ctx.closePath(); ctx.fillStyle = bodyGlow; ctx.fill(); ctx.strokeStyle = 'rgba(212,255,238,.62)'; ctx.lineWidth = 1.2; ctx.stroke();
    const [hx, hy] = p(head); ctx.beginPath(); ctx.ellipse(hx, hy, unit*.035, unit*.045, -.12, 0, Math.PI*2); ctx.fillStyle='rgba(182,241,221,.12)'; ctx.fill(); ctx.strokeStyle='rgba(212,255,238,.62)'; ctx.stroke();
    ctx.restore();

    // Surface contours sell volume and continuously change as the rep is interpreted.
    ctx.save(); ctx.strokeStyle = 'rgba(182,241,221,.2)'; ctx.lineWidth = .75;
    for (let row = 0; row < 8; row++) {
      const y = .365 + row * .027, sway = Math.sin(t * 1.2 + row * .65) * .003;
      ctx.beginPath(); ctx.ellipse(width*(.775+sway+row*.003), height*y, unit*(.042 - row*.0012), unit*.01, .22, 0, Math.PI*2); ctx.stroke();
    }
    for (let i = 0; i < 26; i++) {
      const angle = i * 2.399, radius = (.016 + (i % 7) * .0045) * unit;
      const x = width*.775 + Math.cos(angle) * radius*.8, y = height*.44 + Math.sin(angle) * radius;
      ctx.beginPath(); ctx.arc(x, y, 1, 0, Math.PI*2); ctx.fillStyle='rgba(207,255,237,.36)'; ctx.fill();
    }
    ctx.restore();

    ctx.beginPath(); ctx.moveTo(width*.68,height*.35); ctx.lineTo(width*.86,height*.38); ctx.strokeStyle='rgba(212,255,238,.42)'; ctx.lineWidth=2; ctx.stroke();
    const twinNodes = [[.77,.445],[.805,.55],[.705,.665]];
    twinNodes.forEach((node, index) => glowNode(node, index === Math.floor(t * .8) % 3));

    // Signals visibly leave the suit and resolve at the equivalent area of the twin.
    const bezierPoint = (a, b, c, d, u) => {
      const m = 1-u;
      return [m*m*m*a[0]+3*m*m*u*b[0]+3*m*u*u*c[0]+u*u*u*d[0],m*m*m*a[1]+3*m*m*u*b[1]+3*m*u*u*c[1]+u*u*u*d[1]];
    };
    garmentNodes.forEach((start, index) => {
      const end = twinNodes[index], c1 = [start[0]+.14,start[1]-.045], c2 = [end[0]-.15,end[1]+.035];
      const [sx, sy] = p(start), [c1x, c1y] = p(c1), [c2x, c2y] = p(c2), [ex, ey] = p(end);
      ctx.beginPath(); ctx.moveTo(sx,sy); ctx.bezierCurveTo(c1x,c1y,c2x,c2y,ex,ey); ctx.strokeStyle='rgba(182,241,221,.13)'; ctx.lineWidth=1; ctx.stroke();
      for (let dot = 0; dot < 3; dot++) {
        const u = reduceMotion ? .58 : (t*.14 + index*.21 + dot*.31) % 1, [dx,dy] = p(bezierPoint(start,c1,c2,end,u));
        ctx.beginPath(); ctx.arc(dx,dy,dot===0?2.7:1.4,0,Math.PI*2); ctx.fillStyle=dot===0?'#cdf26d':'rgba(182,241,221,.72)'; ctx.fill();
      }
    });

    const scanY = height * (.25 + ((Math.sin(t*.75)+1)/2)*.59);
    ctx.save(); ctx.strokeStyle='rgba(205,242,109,.42)'; ctx.lineWidth=1; ctx.shadowColor='rgba(205,242,109,.38)'; ctx.shadowBlur=10;
    ctx.beginPath(); ctx.ellipse(width*.78,scanY,unit*.12,unit*.018,0,0,Math.PI*2); ctx.stroke(); ctx.restore();
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
