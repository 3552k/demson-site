(() => {
  const canvas = document.getElementById('motion-canvas');
  if (!canvas) return;
  const ctx = canvas.getContext('2d');
  const reduceMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
  let width = 0, height = 0, dpr = 1;
  const fit = () => {
    const rect = canvas.getBoundingClientRect();
    dpr = Math.min(window.devicePixelRatio || 1, 2);
    width = rect.width; height = rect.height;
    canvas.width = Math.round(width * dpr); canvas.height = Math.round(height * dpr);
    ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
  };
  const project = ([x, y, z]) => {
    const p = 1 + z * .13;
    return [width * .53 + x * width * .17 * p, height * .57 - y * height * .17 * p];
  };
  const line = (a, b, color, w = 1) => {
    const p = project(a), q = project(b);
    ctx.beginPath(); ctx.moveTo(p[0], p[1]); ctx.lineTo(q[0], q[1]);
    ctx.strokeStyle = color; ctx.lineWidth = w; ctx.stroke();
  };
  const dot = (p, r, color) => {
    const [x, y] = project(p); ctx.beginPath(); ctx.arc(x, y, r, 0, Math.PI * 2); ctx.fillStyle = color; ctx.fill();
  };
  function draw(t) {
    ctx.clearRect(0, 0, width, height);
    const time = t * .00072;
    const squat = reduceMotion ? .42 : (Math.sin(time) + 1) * .46;
    const wobble = reduceMotion ? 0 : Math.sin(time * 2.4) * .035;
    for (let n = -7; n <= 7; n++) { line([n, -2.45, -3], [n, -2.45, 3], 'rgba(167, 199, 185, .10)'); line([-7, -2.45, n], [7, -2.45, n], 'rgba(167, 199, 185, .10)'); }
    const hipY = .08 - squat * .75, kneeY = -1.03 - squat * .52, ankleY = -2.3, kneeX = .34 + squat * .24, ankleX = .43;
    const hip = [0, hipY, 0], chest = [wobble, 1.08 - squat * .48, .04], neck = [wobble, 1.68 - squat * .44, .04], head = [wobble, 2.05 - squat * .39, .04];
    const leftHip = [-.28, hipY, .04], rightHip = [.28, hipY, -.04], leftKnee = [-kneeX, kneeY, .08], rightKnee = [kneeX, kneeY, -.08], leftAnkle = [-ankleX, ankleY, .12], rightAnkle = [ankleX, ankleY, -.12];
    const leftShoulder = [-.52, chest[1], .03], rightShoulder = [.52, chest[1], -.03], leftElbow = [-.78, .55 - squat * .38, .22], rightElbow = [.78, .55 - squat * .38, -.22], leftWrist = [-.64, .04 - squat * .5, .15], rightWrist = [.64, .04 - squat * .5, -.15];
    [[hip,chest],[chest,neck],[neck,head],[leftHip,rightHip],[leftHip,leftKnee],[leftKnee,leftAnkle],[rightHip,rightKnee],[rightKnee,rightAnkle],[chest,leftShoulder],[leftShoulder,leftElbow],[leftElbow,leftWrist],[chest,rightShoulder],[rightShoulder,rightElbow],[rightElbow,rightWrist]].forEach(([a,b]) => line(a,b,'rgba(182, 241, 221, .75)',2));
    [hip,chest,neck,head,leftHip,rightHip,leftKnee,rightKnee,leftAnkle,rightAnkle,leftShoulder,rightShoulder,leftElbow,rightElbow,leftWrist,rightWrist].forEach((p, i) => dot(p, i === 0 || i === 6 || i === 7 ? 4.5 : 3, i === 6 || i === 7 ? '#cdf26d' : '#b6f1dd'));
    const traceY = height * .84;
    ctx.beginPath();
    for (let x = 0; x < width; x += 2) { const phase = x / width * Math.PI * 5 + time * 3.5, y = traceY + Math.sin(phase) * (8 + squat * 9) + Math.sin(phase * .31) * 4; x ? ctx.lineTo(x,y) : ctx.moveTo(x,y); }
    ctx.strokeStyle = 'rgba(205, 242, 109, .55)'; ctx.lineWidth = 1; ctx.stroke();
    if (!reduceMotion) requestAnimationFrame(draw);
  }
  fit(); draw(0); window.addEventListener('resize', () => { fit(); if (reduceMotion) draw(0); });
  if (!reduceMotion) requestAnimationFrame(draw);
})();
