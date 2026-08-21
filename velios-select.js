(() => {
  let openState = null;
  let closeTimer = 0;

  const html = value => String(value ?? '')
    .replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;').replace(/'/g, '&#39;');

  function normalizeOptions(options) {
    return (options || []).map(option => typeof option === 'object'
      ? { value: String(option.value), label: String(option.label ?? option.value) }
      : { value: String(option), label: String(option) });
  }

  function markup({ id = '', value = '', placeholder = 'Maak een keuze', options = [], onChange = '', className = '', ariaLabel = '' } = {}) {
    const items = normalizeOptions(options);
    const current = items.find(option => option.value === String(value));
    const encodedOptions = encodeURIComponent(JSON.stringify(items));
    return `<div class="velios-select ${html(className)}" data-options="${encodedOptions}" data-value="${html(value)}" data-onchange="${html(onChange)}">
      ${id ? `<input type="hidden" id="${html(id)}" value="${html(value)}">` : ''}
      <button class="velios-select-trigger${current ? '' : ' is-placeholder'}" type="button" aria-haspopup="listbox" aria-expanded="false" aria-label="${html(ariaLabel || placeholder)}" onclick="VeliosSelect.toggle(this,event)" onkeydown="VeliosSelect.keydown(event,this)">
        <span class="velios-select-value">${html(current?.label || placeholder)}</span>
        <svg viewBox="0 0 24 24" aria-hidden="true"><path d="m7 10 5 5 5-5"/></svg>
      </button>
    </div>`;
  }

  function readOptions(wrapper) {
    try { return normalizeOptions(JSON.parse(decodeURIComponent(wrapper.dataset.options || '[]'))); }
    catch (_) { return []; }
  }

  function setValue(target, value, label = '') {
    const input = typeof target === 'string' ? document.getElementById(target) : target;
    const wrapper = input?.classList?.contains('velios-select')
      ? input
      : input?.closest?.('.velios-select');
    if (!wrapper) return false;
    const nextValue = String(value ?? '');
    const option = readOptions(wrapper).find(item => item.value === nextValue);
    const nextLabel = String(label || option?.label || nextValue);
    const hiddenInput = wrapper.querySelector('input[type="hidden"]');
    const trigger = wrapper.querySelector('.velios-select-trigger');
    wrapper.dataset.value = nextValue;
    if (hiddenInput) hiddenInput.value = nextValue;
    const valueNode = trigger?.querySelector('.velios-select-value');
    if (valueNode) valueNode.textContent = nextLabel || trigger.getAttribute('aria-label') || 'Maak een keuze';
    trigger?.classList.toggle('is-placeholder', !nextValue);
    return true;
  }

  function position() {
    if (!openState || !document.body.contains(openState.trigger)) return close(true);
    const { trigger, menu } = openState;
    const rect = trigger.getBoundingClientRect();
    const gutter = 10;
    const viewportGutter = 12;
    const width = Math.min(Math.max(rect.width, 190), window.innerWidth - viewportGutter * 2);
    menu.style.width = `${width}px`;
    menu.style.left = `${Math.max(viewportGutter, Math.min(rect.left, window.innerWidth - width - viewportGutter))}px`;
    const menuHeight = Math.min(menu.scrollHeight, Math.max(180, window.innerHeight * .42));
    const roomBelow = window.innerHeight - rect.bottom - viewportGutter;
    const openAbove = roomBelow < Math.min(menuHeight, 230) && rect.top > roomBelow;
    menu.classList.toggle('opens-up', openAbove);
    menu.style.top = `${openAbove
      ? Math.max(viewportGutter, rect.top - menuHeight - gutter)
      : Math.min(window.innerHeight - menuHeight - viewportGutter, rect.bottom + gutter)}px`;
  }

  function close(immediate = false) {
    clearTimeout(closeTimer);
    if (!openState) {
      if (immediate) document.querySelectorAll('.velios-select-menu').forEach(menu => menu.remove());
      return;
    }
    const { menu, trigger, wrapper } = openState;
    openState = null;
    trigger?.setAttribute('aria-expanded', 'false');
    wrapper?.classList.remove('is-open');
    if (immediate) return menu.remove();
    menu.classList.remove('is-visible');
    menu.classList.add('is-closing');
    closeTimer = window.setTimeout(() => menu.remove(), 150);
  }

  function toggle(trigger, event) {
    event?.stopPropagation();
    const wrapper = trigger.closest('.velios-select');
    if (!wrapper) return;
    if (openState?.trigger === trigger) return close();
    close(true);
    const options = readOptions(wrapper);
    const selected = wrapper.dataset.value || '';
    const menu = document.createElement('div');
    menu.className = 'velios-select-menu';
    menu.setAttribute('role', 'listbox');
    menu.setAttribute('aria-label', trigger.getAttribute('aria-label') || 'Keuzelijst');
    menu.innerHTML = options.map(option => `<button type="button" class="velios-select-option${option.value === selected ? ' is-selected' : ''}" role="option" aria-selected="${option.value === selected}" data-value="${html(option.value)}">
      <span>${html(option.label)}</span>
      <svg viewBox="0 0 24 24" aria-hidden="true"><path d="m5 12 4 4L19 6"/></svg>
    </button>`).join('');
    menu.addEventListener('click', selectOption);
    menu.addEventListener('keydown', menuKeydown);
    document.body.appendChild(menu);
    openState = { wrapper, trigger, menu };
    wrapper.classList.add('is-open');
    trigger.setAttribute('aria-expanded', 'true');
    position();
    requestAnimationFrame(() => menu.classList.add('is-visible'));
  }

  function selectOption(event) {
    const option = event.target.closest('.velios-select-option');
    if (!option || !openState) return;
    const { wrapper, trigger } = openState;
    const value = option.dataset.value || '';
    const label = option.querySelector('span')?.textContent || value;
    const input = wrapper.querySelector('input[type="hidden"]');
    wrapper.dataset.value = value;
    if (input) {
      input.value = value;
      input.dispatchEvent(new Event('change', { bubbles: true }));
    }
    trigger.querySelector('.velios-select-value').textContent = label;
    trigger.classList.remove('is-placeholder');
    const handler = wrapper.dataset.onchange;
    close();
    if (handler && typeof window[handler] === 'function') window[handler](value);
    trigger.focus({ preventScroll: true });
  }

  function focusRelative(menu, delta) {
    const options = [...menu.querySelectorAll('.velios-select-option')];
    if (!options.length) return;
    let index = options.indexOf(document.activeElement);
    if (index < 0) index = options.findIndex(option => option.classList.contains('is-selected'));
    options[(Math.max(0, index) + delta + options.length) % options.length].focus();
  }

  function keydown(event, trigger) {
    if (!['ArrowDown', 'ArrowUp', 'Enter', ' '].includes(event.key)) return;
    event.preventDefault();
    if (!openState || openState.trigger !== trigger) toggle(trigger, event);
    requestAnimationFrame(() => {
      const selected = openState?.menu.querySelector('.is-selected');
      (selected || openState?.menu.querySelector('.velios-select-option'))?.focus();
    });
  }

  function menuKeydown(event) {
    if (event.key === 'ArrowDown' || event.key === 'ArrowUp') {
      event.preventDefault(); focusRelative(event.currentTarget, event.key === 'ArrowDown' ? 1 : -1);
    } else if (event.key === 'Home' || event.key === 'End') {
      event.preventDefault();
      const options = event.currentTarget.querySelectorAll('.velios-select-option');
      options[event.key === 'Home' ? 0 : options.length - 1]?.focus();
    } else if (event.key === 'Escape') {
      event.preventDefault(); const trigger = openState?.trigger; close(); trigger?.focus();
    } else if (event.key === 'Tab') close();
  }

  document.addEventListener('pointerdown', event => {
    if (openState && !event.target.closest('.velios-select-menu') && !event.target.closest('.velios-select')) close();
  });
  document.addEventListener('keydown', event => {
    if (event.key === 'Escape' && openState) { const trigger = openState.trigger; close(); trigger?.focus(); }
  });
  window.addEventListener('resize', () => close(true));
  window.addEventListener('scroll', event => {
    if (openState && !event.target?.closest?.('.velios-select-menu')) close(true);
  }, true);
  new MutationObserver(() => {
    if (openState && !document.body.contains(openState.trigger)) close(true);
  }).observe(document.documentElement, { childList: true, subtree: true });

  window.VeliosSelect = { markup, setValue, toggle, keydown, close, position };
})();
