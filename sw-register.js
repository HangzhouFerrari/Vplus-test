(() => {
  if (!('serviceWorker' in navigator)) return;

  const BUILD = '20260821-9';
  const RELOAD_KEY = `velios-sw-reloaded-${BUILD}`;
  let refreshing = false;

  navigator.serviceWorker.addEventListener('controllerchange', () => {
    if (refreshing || sessionStorage.getItem(RELOAD_KEY)) return;
    refreshing = true;
    sessionStorage.setItem(RELOAD_KEY, '1');
    window.location.reload();
  });

  window.addEventListener('load', async () => {
    try {
      const registration = await navigator.serviceWorker.register(`./sw.js?v=${BUILD}`, {
        updateViaCache: 'none',
      });
      await registration.update();
    } catch (error) {
      console.warn('Serviceworker kon niet worden bijgewerkt:', error);
    }
  });
})();
