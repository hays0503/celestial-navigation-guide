/* One story; no autoplay, solver, network, persistence or game integration. */
(() => {
  'use strict';
  const root = document.querySelector('.journey-layout');
  if (!root) return;
  const frames = [...root.querySelectorAll('.j-step')];
  const controls = root.querySelector('.j-controls');
  const header = document.querySelector('.topbar');
  if (!frames.length || !controls) return;
  let current = 0;
  const align = () => root.style.setProperty('--journey-top', `${Math.ceil(header?.getBoundingClientRect().height || 0) + 2}px`);
  align();
  if (header && typeof ResizeObserver !== 'undefined') new ResizeObserver(align).observe(header);
  function show(index, used = false) {
    current = Math.max(0, Math.min(frames.length - 1, index));
    frames.forEach((frame, n) => {
      frame.classList.toggle('is-current', n === current);
      frame.classList.toggle('was-used', used && n === current);
      frame.setAttribute('aria-hidden', String(n !== current));
    });
    root.dataset.current = String(current);
    controls.querySelector('.j-status').textContent = `Шаг ${current + 1} из ${frames.length} · ${frames[current].querySelector('h2').textContent.replace(/^\d+\. /, '')}`;
    controls.querySelector('[data-action="back"]').setAttribute('aria-disabled', String(current === 0));
    controls.querySelector('[data-action="next"]').setAttribute('aria-disabled', String(current === frames.length - 1));
    root.querySelectorAll('[data-jump]').forEach(link => {
      if (Number(link.dataset.jump) === current) link.setAttribute('aria-current', 'step');
      else link.removeAttribute('aria-current');
    });
  }
  controls.addEventListener('click', event => {
    const button = event.target.closest('button[data-action]');
    if (!button || !controls.contains(button) || button.getAttribute('aria-disabled') === 'true') return;
    show(button.dataset.action === 'reset' ? 0 : current + (button.dataset.action === 'back' ? -1 : 1), true);
    controls.scrollIntoView({block: 'start', behavior: 'instant'});
  });
  root.querySelectorAll('[data-jump]').forEach(link => link.addEventListener('click', event => {
    event.preventDefault();
    show(Number(link.dataset.jump), true);
    link.closest('details').open = false;
    controls.querySelector('[data-action="next"]').focus();
    controls.scrollIntoView({block: 'start', behavior: 'instant'});
  }));
  show(0);
  root.classList.add('is-ready');
  controls.hidden = false;
  const glossary = root.querySelector('.j-glossary');
  if (glossary) glossary.open = false;
  let glossaryWasOpen = false;
  window.addEventListener('beforeprint', () => {
    if (glossary) {
      glossaryWasOpen = glossary.open;
      glossary.open = true;
    }
    frames.forEach(frame => frame.removeAttribute('aria-hidden'));
  });
  window.addEventListener('afterprint', () => {
    if (glossary) glossary.open = glossaryWasOpen;
    frames.forEach((frame, n) => frame.setAttribute('aria-hidden', String(n !== current)));
  });
  const print = document.querySelector('[data-print]');
  if (print) {
    print.hidden = false;
    print.addEventListener('click', () => window.print());
  }
})();
