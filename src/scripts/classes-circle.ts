// One continuous spring, with adjacent-column gates rather than queued mouse events.
type Phase = 'follow' | 'press' | 'cross' | 'recover';
interface Axis { value: number; velocity: number }
const clamp = (value: number, low: number, high: number) => Math.max(low, Math.min(high, value));
function spring(axis: Axis, target: number, dt: number, stiffness = 140, damping = 18) {
  axis.velocity += ((target - axis.value) * stiffness - axis.velocity * damping) * dt;
  axis.value += axis.velocity * dt;
}

function mount(root: HTMLElement) {
  const orb = root.querySelector<HTMLElement>('.catalog-orb')!;
  const columns = [...root.querySelectorAll<HTMLElement>('.catalog-row')];
  const media = matchMedia('(min-width: 62rem) and (hover: hover) and (pointer: fine) and (prefers-reduced-motion: no-preference)');
  const events = new AbortController();
  const x: Axis = { value: 0, velocity: 0 }, y: Axis = { value: 0, velocity: 0 };
  const sx: Axis = { value: 1, velocity: 0 }, sy: Axis = { value: 1, velocity: 0 };
  let rect = root.getBoundingClientRect(), edges: number[] = [];
  let radius = 0, inside = false, active = 0, desired = 0, destination = 0;
  let pointerX = 0, pointerY = 0, alpha = 0, frame = 0, lastTime = 0;
  let phase: Phase = 'follow', contactTime = 0, recoveryTime = 0;
  const columnAt = (px: number) => clamp(edges.findIndex((edge, i) => i > 0 && px < edge) - 1, 0, columns.length - 1);
  // The final edge is inclusive, including pointer positions on the outer border.
  const locate = (px: number) => px >= edges[edges.length - 1] ? columns.length - 1 : columnAt(px);

  function reset() {
    cancelAnimationFrame(frame); frame = 0; lastTime = 0;
    inside = false; alpha = 0; phase = 'follow'; contactTime = recoveryTime = 0;
    x.velocity = y.velocity = sx.velocity = sy.velocity = 0;
    sx.value = sy.value = 1;
    orb.style.opacity = '0';
  }
  function measure() {
    reset();
    rect = root.getBoundingClientRect();
    edges = columns.map(column => column.getBoundingClientRect().left - rect.left);
    edges.push(rect.width);
    const smallest = Math.min(...columns.map(column => column.getBoundingClientRect().width));
    radius = Math.max(0, Math.min(108, smallest * .27, rect.height * .25));
    orb.style.width = orb.style.height = `${radius * 2}px`;
  }
  function wake() { if (!frame) { lastTime = 0; frame = requestAnimationFrame(tick); } }

  function tick(time: number) {
    frame = 0;
    if (!media.matches || !radius) { reset(); return; }
    let remaining = lastTime ? Math.min((time - lastTime) / 1000, .032) : 1 / 60;
    lastTime = time;
    while (remaining > 0) {
      const dt = Math.min(remaining, 1 / 120); remaining -= dt;
      alpha += ((inside ? .46 : 0) - alpha) * (1 - Math.exp(-14 * dt));
      if (!inside) {
        desired = phase === 'cross' ? destination : active;
        if (phase === 'press') phase = 'follow';
      }
      if (phase === 'follow' && desired !== active) {
        destination = active + Math.sign(desired - active);
        phase = 'press'; contactTime = 0;
      }
      // Retarget a pending gate without rewinding a gate already being crossed.
      if (phase === 'press') {
        if (desired === active) { phase = 'follow'; contactTime = 0; }
        else if (Math.sign(desired - active) !== Math.sign(destination - active)) {
          destination = active + Math.sign(desired - active); contactTime = 0;
        }
      }
      const direction = Math.sign(destination - active);
      const boundary = edges[Math.max(active, destination)];
      const rx = radius * clamp(sx.value, .78, 1.35);
      const ry = radius * clamp(sy.value, .78, 1.35);
      let targetX = clamp(pointerX, edges[active] + rx, edges[active + 1] - rx);
      const targetY = clamp(pointerY, ry, rect.height - ry);
      let shapeX = 1, shapeY = 1;
      if (phase === 'press') {
        targetX = boundary - direction * (rx + 1);
        const touching = Math.abs(x.value - targetX) < 5;
        if (touching || contactTime) {
          contactTime += dt; shapeX = .82; shapeY = 1.12;
          if (contactTime >= .09) phase = 'cross';
        }
      }
      if (phase === 'cross') {
        targetX = boundary + direction * (radius * 1.35 + 10);
        shapeX = 1.2; shapeY = .86;
      }
      if (phase === 'recover') {
        recoveryTime += dt;
        if (recoveryTime >= .15) phase = 'follow';
      }
      spring(x, targetX, dt); spring(y, targetY, dt);
      spring(sx, shapeX, dt, 180, 14); spring(sy, shapeY, dt, 180, 14);
      sx.value = clamp(sx.value, .78, 1.35); sy.value = clamp(sy.value, .78, 1.35);
      const extentX = radius * sx.value, extentY = radius * sy.value;
      const left = phase === 'cross' ? edges[Math.min(active, destination)] : edges[active];
      const right = phase === 'cross' ? edges[Math.max(active, destination) + 1] : edges[active + 1];
      const boundedX = clamp(x.value, left + extentX, right - extentX);
      const boundedY = clamp(y.value, extentY, rect.height - extentY);
      if (boundedX !== x.value) x.velocity = 0;
      if (boundedY !== y.value) y.velocity = 0;
      x.value = boundedX; y.value = boundedY;
      if (phase === 'cross' && direction * (x.value - boundary) >= extentX + 2) {
        active = destination; phase = 'recover'; recoveryTime = 0;
      }
    }
    const entrance = .94 + .06 * alpha / .46;
    orb.style.transform = `translate3d(${x.value - radius}px, ${y.value - radius}px, 0) scale(${sx.value * entrance}, ${sy.value * entrance})`;
    orb.style.opacity = String(alpha);
    if (inside || alpha > .002) frame = requestAnimationFrame(tick);
    else { alpha = 0; orb.style.opacity = '0'; lastTime = 0; }
  }
  function point(event: PointerEvent) {
    if (!media.matches || event.pointerType !== 'mouse') return;
    rect = root.getBoundingClientRect();
    pointerX = clamp(event.clientX - rect.left, 0, rect.width);
    pointerY = clamp(event.clientY - rect.top, 0, rect.height);
    desired = locate(pointerX);
    if (!inside && alpha < .002) {
      active = destination = desired; phase = 'follow';
      x.value = clamp(pointerX, edges[active] + radius, edges[active + 1] - radius);
      y.value = clamp(pointerY, radius, rect.height - radius);
      x.velocity = y.velocity = 0;
    }
    inside = true; wake();
  }
  root.addEventListener('pointerenter', point, { signal: events.signal });
  root.addEventListener('pointermove', point, { signal: events.signal, passive: true });
  root.addEventListener('pointerleave', () => { inside = false; wake(); }, { signal: events.signal });
  window.addEventListener('blur', reset, { signal: events.signal });
  document.addEventListener('visibilitychange', () => { if (document.hidden) reset(); }, { signal: events.signal });
  media.addEventListener('change', measure);
  const observer = new ResizeObserver(measure); observer.observe(root);
  measure();
  return () => { reset(); events.abort(); observer.disconnect(); media.removeEventListener('change', measure); };
}

let disposers: (() => void)[] = [];
export function disposeClassesCircles() { disposers.forEach(dispose => dispose()); disposers = []; }
export function initClassesCircles() {
  disposeClassesCircles();
  disposers = [...document.querySelectorAll<HTMLElement>('[data-classes-circle]')].map(mount);
}
