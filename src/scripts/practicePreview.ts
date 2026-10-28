import type { PracticeResource } from '../lib/resources';

export function setupPracticeIndex(root: HTMLElement) {
  const dialog = root.querySelector<HTMLDialogElement>('dialog')!;
  const content = root.querySelector<HTMLElement>('[data-preview-content]')!;
  const image = root.querySelector<HTMLImageElement>('[data-preview-image]')!;
  const typography = root.querySelector<HTMLElement>('[data-preview-typography]')!;
  const title = root.querySelector<HTMLElement>('#practice-preview-title')!;
  const coverTitle = root.querySelector<HTMLElement>('[data-preview-cover-title]')!;
  const description = root.querySelector<HTMLElement>('#practice-preview-description')!;
  const kind = root.querySelector<HTMLElement>('[data-preview-kind]')!;
  const action = root.querySelector<HTMLAnchorElement>('[data-preview-action]')!;
  const article = root.querySelector<HTMLAnchorElement>('[data-preview-article]')!;
  const closeButton = root.querySelector<HTMLButtonElement>('.practice-close')!;
  const resources: PracticeResource[] = JSON.parse(root.querySelector('[data-practice-data]')!.textContent!);
  if (!resources.length) return;
  const rows = [...root.querySelectorAll<HTMLElement>('[data-resource-row]')];
  const hover = matchMedia('(min-width: 62rem) and (hover: hover) and (pointer: fine)');
  const reduced = matchMedia('(prefers-reduced-motion: reduce)');
  // The selected resource is an in-page panel on desktop; mobile keeps the existing dialog.
  const detail = root.querySelector<HTMLElement>('[data-detail-title]');
  const detailTitle = detail!;
  const detailNumber = root.querySelector<HTMLElement>('[data-detail-number]')!;
  const detailKind = root.querySelector<HTMLElement>('[data-detail-kind]')!;
  const detailKindMeta = root.querySelector<HTMLElement>('[data-detail-kind-meta]')!;
  const detailDescription = root.querySelector<HTMLElement>('[data-detail-description]')!;
  const detailImage = root.querySelector<HTMLImageElement>('[data-detail-image]')!;
  const detailFallback = root.querySelector<HTMLElement>('[data-detail-fallback]')!;
  const detailFallbackTitle = root.querySelector<HTMLElement>('[data-detail-fallback-title]')!;
  const detailAction = root.querySelector<HTMLAnchorElement>('[data-detail-action]')!;
  const detailArticle = root.querySelector<HTMLAnchorElement>('[data-detail-article]')!;
  const selectDesktop = (row: HTMLElement) => {
    const index = rows.indexOf(row);
    const resource = resources.find((item) => item.id === row.dataset.resourceRow);
    if (!resource || !detail) return;
    rows.forEach((item) => {
      const selected = item === row;
      item.toggleAttribute('data-active', selected);
      item.querySelectorAll('[data-resource-open]').forEach((button) => button.setAttribute('aria-expanded', String(selected)));
    });
    detailNumber.textContent = `ITEM ${String(index + 1).padStart(3, '0')}`;
    detailTitle.textContent = detailFallbackTitle.textContent = resource.title;
    detailKind.textContent = detailKindMeta.textContent = kinds[resource.type];
    detailDescription.textContent = resource.description;
    detailAction.textContent = resource.download ? `DESCARGAR ${kinds[resource.type]} ↗` : `${actions[resource.type]} ↗`;
    detailAction.href = resource.href;
    detailAction.toggleAttribute('download', resource.download);
    detailArticle.hidden = !resource.article;
    if (resource.article) detailArticle.href = resource.article;
    else detailArticle.removeAttribute('href');
    detailImage.hidden = !resource.image;
    detailFallback.classList.toggle('detail-hidden', !!resource.image);
    if (resource.image) {
      detailImage.src = resource.image;
      detailImage.alt = resource.imageAlt ?? '';
    } else { detailImage.removeAttribute('src'); detailImage.alt = ''; }
  };
  detailImage.addEventListener('error', () => { detailImage.hidden = true; detailFallback.classList.remove('detail-hidden'); });
  const configureDisplay = () => {
    rows.forEach((row) => row.querySelectorAll('[data-resource-open]').forEach((button) => {
      button.setAttribute('aria-controls', hover.matches ? 'practice-detail' : 'practice-preview');
      if (hover.matches) button.removeAttribute('aria-haspopup');
      else button.setAttribute('aria-haspopup', 'dialog');
    }));
    if (hover.matches && rows.length) selectDesktop(rows.find((row) => row.hasAttribute('data-active')) ?? rows[0]);
  };
  rows.forEach((row) => {
    row.addEventListener('pointerenter', () => { if (hover.matches) selectDesktop(row); });
    row.querySelectorAll<HTMLButtonElement>('[data-resource-open]').forEach((button) => button.addEventListener('click', () => {
      if (hover.matches) selectDesktop(row);
    }));
  });
  hover.addEventListener('change', configureDisplay);

  const actions = { pdf: 'DESCARGAR PDF', video: 'VER VÍDEO', audio: 'ESCUCHAR AUDIO', questionnaire: 'ABRIR CUESTIONARIO', test: 'ABRIR TEST' };
  const kinds = { pdf: 'PDF', video: 'VÍDEO', audio: 'AUDIO', questionnaire: 'CUESTIONARIO', test: 'TEST' };
  configureDisplay();
  let active: HTMLElement | undefined;
  let opener: HTMLButtonElement | undefined;
  let closeTimer = 0;
  let swapTimer = 0;
  let finishTimer = 0;
  let generation = 0;
  let pinned = false;
  let renderedId = '';
  let corridor: { x: number; y: number; until: number } | undefined;
  let lastRowPoint: { x: number; y: number } | undefined;

  const cancelClose = () => { clearTimeout(closeTimer); clearTimeout(finishTimer); };
  const setExpanded = (row: HTMLElement, expanded: boolean) => {
    row.toggleAttribute('data-active', expanded);
    row.querySelectorAll('[data-resource-open]').forEach((button) => button.setAttribute('aria-expanded', String(expanded)));
  };
  const position = () => {
    if (!hover.matches || !active || !dialog.open) return;
    const row = active.getBoundingClientRect();
    const headerBottom = document.querySelector('.site-header')?.getBoundingClientRect().bottom ?? 0;
    let left = Math.max(16, innerWidth - dialog.offsetWidth - 24);
    const top = Math.max(headerBottom + 12, Math.min(row.top, innerHeight - dialog.offsetHeight - 16));
    const arrow = active.querySelector('.practice-arrow')?.getBoundingClientRect();
    // Keep the explicit preview button reachable when the floating panel overlaps its row.
    if (arrow && top < arrow.bottom && top + dialog.offsetHeight > arrow.top && left < arrow.right && left + dialog.offsetWidth > arrow.left) {
      left = Math.max(16, arrow.left - dialog.offsetWidth - 12);
    }
    dialog.style.left = `${left}px`;
    dialog.style.top = `${top}px`;
  };
  const fill = (resource: PracticeResource) => {
    renderedId = resource.id;
    // Content and action always change together; never leave an outgoing link active.
    title.textContent = coverTitle.textContent = resource.title;
    description.textContent = resource.description;
    kind.textContent = kinds[resource.type];
    const label = resource.download ? `DESCARGAR ${kinds[resource.type]}` : actions[resource.type];
    action.textContent = `${label} ${resource.download ? '↓' : '↗'}`;
    action.href = resource.href;
    action.toggleAttribute('download', resource.download);
    article.hidden = !resource.article;
    if (resource.article) article.href = resource.article; else article.removeAttribute('href');
    image.hidden = true;
    typography.hidden = false;
    if (resource.image) {
      image.src = resource.image;
      image.alt = resource.imageAlt ?? '';
      image.hidden = false;
      typography.hidden = true;
    } else { image.removeAttribute('src'); image.alt = ''; }
    position();
  };
  image.addEventListener('error', () => { image.hidden = true; typography.hidden = false; position(); });
  const finish = (restoreFocus: boolean) => {
    dialog.close();
    document.documentElement.classList.remove('practice-sheet-open');
    if (restoreFocus) (opener ?? active?.querySelector<HTMLButtonElement>('[data-resource-open]'))?.focus({ preventScroll: true });
    active = undefined;
    opener = undefined;
    pinned = false;
  };
  const close = (restoreFocus = false, instant = false) => {
    cancelClose(); clearTimeout(swapTimer); generation++;
    rows.forEach((row) => setExpanded(row, false));
    dialog.toggleAttribute('data-instant', instant);
    dialog.removeAttribute('data-visible');
    content.removeAttribute('data-changing');
    corridor = undefined;
    if (instant || reduced.matches) finish(restoreFocus);
    else finishTimer = window.setTimeout(() => finish(restoreFocus), 130);
  };
  const scheduleClose = () => {
    if (pinned || dialog.contains(document.activeElement) || active?.matches(':hover') || dialog.matches(':hover')) return;
    clearTimeout(closeTimer);
    closeTimer = window.setTimeout(() => close(), 150);
  };
  const open = (row: HTMLElement, interactive = false, instant = false, trigger?: HTMLButtonElement) => {
    if (hover.matches) return;
    if (!interactive && (pinned || dialog.contains(document.activeElement))) return;
    cancelClose();
    corridor = undefined;
    const resource = resources.find((item) => item.id === row.dataset.resourceRow);
    if (!resource) return;
    const changed = active !== row;
    active = row;
    opener = interactive ? trigger : undefined;
    pinned = interactive;
    rows.forEach((item) => setExpanded(item, item === row));
    dialog.toggleAttribute('data-instant', instant);
    const token = ++generation;
    clearTimeout(swapTimer);
    const wasOpen = dialog.open;
    if (!wasOpen) {
      const previousFocus = document.activeElement as HTMLElement | null;
      fill(resource);
      if (hover.matches) dialog.show();
      else { dialog.showModal(); document.documentElement.classList.add('practice-sheet-open'); }
      position();
      // dialog.show() may assign focus; hover must not steal it from the page.
      if (!interactive) {
        previousFocus?.focus({ preventScroll: true });
        if (dialog.contains(document.activeElement)) (document.activeElement as HTMLElement).blur();
      }
      requestAnimationFrame(() => { if (token === generation) dialog.setAttribute('data-visible', ''); });
    } else if (changed) {
      if (instant || reduced.matches) { fill(resource); content.removeAttribute('data-changing'); }
      else {
        content.setAttribute('data-changing', '');
        action.removeAttribute('href'); article.removeAttribute('href');
        swapTimer = window.setTimeout(() => {
          if (token !== generation) return;
          fill(resource); content.removeAttribute('data-changing');
        }, 120);
      }
    } else if (content.hasAttribute('data-changing') || renderedId !== resource.id || !action.hasAttribute('href')) {
      fill(resource); content.removeAttribute('data-changing');
    }
    if (wasOpen) dialog.setAttribute('data-visible', '');
    if (interactive) closeButton.focus({ preventScroll: true });
  };

  // Protect a diagonal path from the row to the panel, including across other rows.
  const inCorridor = (x: number, y: number) => {
    if (!corridor || performance.now() > corridor.until) return false;
    const box = dialog.getBoundingClientRect();
    const edge = corridor.x <= box.left ? box.left : box.right;
    const cross = (ax: number, ay: number, bx: number, by: number, cx: number, cy: number) => (bx - ax) * (cy - ay) - (by - ay) * (cx - ax);
    const a = cross(corridor.x, corridor.y, edge, box.top - 12, x, y);
    const b = cross(edge, box.top - 12, edge, box.bottom + 12, x, y);
    const c = cross(edge, box.bottom + 12, corridor.x, corridor.y, x, y);
    return !((a < 0 || b < 0 || c < 0) && (a > 0 || b > 0 || c > 0));
  };
  rows.forEach((row) => {
    row.addEventListener('pointerenter', (event) => {
      if (hover.matches && event.pointerType !== 'touch' && !inCorridor(event.clientX, event.clientY)) {
        lastRowPoint = { x: event.clientX, y: event.clientY };
        open(row);
      }
    });
    row.addEventListener('pointerleave', (event) => {
      if (!hover.matches || !dialog.open) return;
      corridor = { ...(lastRowPoint ?? { x: event.clientX, y: event.clientY }), until: performance.now() + 450 };
      scheduleClose();
    });
    row.querySelectorAll<HTMLButtonElement>('[data-resource-open]').forEach((button) => {
      button.addEventListener('click', (event) => open(row, true, event.detail === 0, button));
    });
  });
  document.addEventListener('pointermove', (event) => {
    if (!hover.matches || !dialog.open || pinned) return;
    if (active?.contains(event.target as Node)) lastRowPoint = { x: event.clientX, y: event.clientY };
    if (dialog.contains(event.target as Node)) { corridor = undefined; cancelClose(); return; }
    if (inCorridor(event.clientX, event.clientY)) {
      clearTimeout(closeTimer);
      closeTimer = window.setTimeout(() => close(), Math.max(150, corridor!.until - performance.now()));
      return;
    }
    const row = (event.target as Element).closest<HTMLElement>('[data-resource-row]');
    if (row && rows.includes(row) && row !== active) open(row);
  });
  dialog.addEventListener('pointerenter', cancelClose);
  dialog.addEventListener('pointerleave', scheduleClose);
  dialog.addEventListener('focusin', cancelClose);
  dialog.addEventListener('focusout', () => { requestAnimationFrame(scheduleClose); });
  closeButton.addEventListener('click', (event) => close(true, event.detail === 0));
  dialog.addEventListener('cancel', (event) => { event.preventDefault(); close(true, true); });
  document.addEventListener('keydown', (event) => {
    if (event.key === 'Escape' && dialog.open) { event.preventDefault(); close(true, true); }
  });
  document.addEventListener('pointerdown', (event) => {
    if (dialog.open && hover.matches && !dialog.contains(event.target as Node) && !rows.some((row) => row.contains(event.target as Node))) close();
  });
  dialog.addEventListener('click', (event) => {
    const box = dialog.getBoundingClientRect();
    if (!hover.matches && event.target === dialog && (event.clientX < box.left || event.clientX > box.right || event.clientY < box.top || event.clientY > box.bottom)) close(true);
  });
  hover.addEventListener('change', () => { if (dialog.open) close(false, true); dialog.style.removeProperty('left'); dialog.style.removeProperty('top'); });
  window.addEventListener('resize', position);
  window.addEventListener('scroll', () => {
    if (!dialog.open || !hover.matches || !active) return;
    const box = active.getBoundingClientRect();
    const headerBottom = document.querySelector('.site-header')?.getBoundingClientRect().bottom ?? 0;
    if (!pinned && (box.bottom < headerBottom || box.top > innerHeight)) close(false, true);
    else position();
  }, { passive: true });
}
