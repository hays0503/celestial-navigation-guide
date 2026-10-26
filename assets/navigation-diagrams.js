/* Reader-controlled enhancement. No autoplay, timers, network or stored settings. */
(() => {
  'use strict';
  const topbar = document.querySelector('.topbar');
  if (topbar) {
    const alignControls = () => document.documentElement.style.setProperty(
      '--nav-sticky-top', `${Math.ceil(topbar.getBoundingClientRect().height) + 2}px`);
    alignControls();
    if (typeof ResizeObserver !== 'undefined') new ResizeObserver(alignControls).observe(topbar);
  }
  document.querySelectorAll('[data-nav-diagram]').forEach(figure => {
    const steps = [...figure.querySelectorAll('.nav-steps li')];
    const layers = [...figure.querySelectorAll('[data-reveal], [data-stages]')];
    const controls = figure.querySelector('.nav-diagram-controls');
    const status = figure.querySelector('[role="status"]');
    const back = figure.querySelector('[data-action="back"]');
    const next = figure.querySelector('[data-action="next"]');
    if (!steps.length || !layers.length || !controls || !status || !back || !next) return;
    let current = 0;
    function show(index) {
      current = Math.max(0, Math.min(steps.length - 1, index));
      figure.dataset.stage = String(current);
      layers.forEach(layer => {
        const visible = layer.hasAttribute('data-stages')
          ? layer.dataset.stages.split(' ').map(Number).includes(current)
          : Number(layer.dataset.reveal) <= current;
        layer.classList.toggle('is-visible', visible);
      });
      // aria-disabled keeps the focused button stable at the first/last step.
      back.setAttribute('aria-disabled', String(current === 0));
      next.setAttribute('aria-disabled', String(current === steps.length - 1));
      status.textContent = `Шаг ${current + 1} из ${steps.length}. ${steps[current].textContent}`;
      const caption = figure.querySelector('.nav-current-step');
      if (caption) caption.textContent = `Шаг ${current + 1}/${steps.length} · ${steps[current].dataset.stepTitle}`;
    }
    figure.addEventListener('click', event => {
      const button = event.target.closest('button[data-action]');
      if (!button || !controls.contains(button) || button.getAttribute('aria-disabled') === 'true') return;
      const action = button.dataset.action;
      show(action === 'reset' ? 0 : current + (action === 'next' ? 1 : -1));
    });
    // Start on step one without animating from the static/print final state.
    // Later changes are animated only after an explicit button activation.
    figure.classList.add('nav-initializing');
    show(0);
    figure.classList.add('is-ready');
    controls.hidden = false;
    const feedback = figure.querySelector('.nav-diagram-feedback');
    if (feedback) feedback.hidden = false;
    figure.getBoundingClientRect(); // Commit the initial styles before enabling transitions.
    figure.classList.remove('nav-initializing');
  });
})();
