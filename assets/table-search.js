/* Static first. No autoplay, fetching, answer computation or stored settings. */
(() => {
  'use strict';
  const header = document.querySelector('.topbar');
  if (header) {
    const align = () => document.documentElement.style.setProperty('--lookup-top', `${Math.ceil(header.getBoundingClientRect().height) + 2}px`);
    align();
    if (typeof ResizeObserver !== 'undefined') new ResizeObserver(align).observe(header);
  }
  document.querySelectorAll('[data-lookup]').forEach(route => {
    const frames = [...route.querySelectorAll('.ts-frame')];
    const controls = route.querySelector('.ts-controls');
    if (!frames.length || !controls) return;
    let current = 0;
    function show(index, used = false) {
      current = Math.max(0, Math.min(frames.length - 1, index));
      route.dataset.step = String(current);
      route.classList.toggle('was-used', used);
      frames.forEach((frame, n) => {
        frame.classList.toggle('is-current', n === current);
        frame.setAttribute('aria-hidden', String(n !== current));
      });
      controls.querySelector('.ts-status').textContent = `Шаг ${current + 1}/${frames.length} · ${frames[current].querySelector('h3').textContent.replace(/^\d+\. /, '')}`;
      controls.querySelector('[data-action="back"]').setAttribute('aria-disabled', String(current === 0));
      controls.querySelector('[data-action="next"]').setAttribute('aria-disabled', String(current === frames.length - 1));
    }
    controls.addEventListener('click', event => {
      const button = event.target.closest('button[data-action]');
      if (!button || !controls.contains(button) || button.getAttribute('aria-disabled') === 'true') return;
      show(button.dataset.action === 'reset' ? 0 : current + (button.dataset.action === 'next' ? 1 : -1), true);
    });
    show(0);
    route.classList.add('is-ready');
    controls.hidden = false;
  });
  const print = document.querySelector('[data-print]');
  if (print) {
    print.hidden = false;
    print.addEventListener('click', () => window.print());
  }
})();
