/* Installer fallback for customer catalogues published before the PWA update. */
(() => {
  const parts = window.location.pathname.split('/').filter(Boolean);
  if (parts.length < 3 || parts[0] !== 'go') return;

  const customerCode = decodeURIComponent(parts[1]);
  const encodedCode = encodeURIComponent(customerCode);
  const scopePath = `/go/${encodedCode}/`;
  const currentPath = window.location.pathname.replace(/\/+$/, '');
  const manifestPath = `${currentPath}/manifest.webmanifest`;

  const addMeta = (name, content) => {
    let meta = document.querySelector(`meta[name="${name}"]`);
    if (!meta) {
      meta = document.createElement('meta');
      meta.name = name;
      document.head.appendChild(meta);
    }
    meta.content = content;
  };

  if (!document.querySelector('link[rel="manifest"]')) {
    const manifest = document.createElement('link');
    manifest.rel = 'manifest';
    manifest.href = manifestPath;
    document.head.appendChild(manifest);
  }
  if (!document.querySelector('link[rel="apple-touch-icon"]')) {
    const appleIcon = document.createElement('link');
    appleIcon.rel = 'apple-touch-icon';
    appleIcon.sizes = '180x180';
    appleIcon.href = '/pwa/icons/apple-touch-icon.png';
    document.head.appendChild(appleIcon);
  }
  addMeta('mobile-web-app-capable', 'yes');
  addMeta('apple-mobile-web-app-capable', 'yes');
  addMeta('apple-mobile-web-app-title', 'TM DISTRIBUTOR');
  addMeta('apple-mobile-web-app-status-bar-style', 'black-translucent');

  if (document.getElementById('pwaInstallPanel')) return;

  const style = document.createElement('style');
  style.textContent = '.tm-pwa-panel{margin:10px 12px;padding:13px;border:1px solid #e5e7eb;border-radius:14px;background:#fff;box-shadow:0 2px 8px #0000000a;color:#222}.tm-pwa-panel h2{margin:0 0 5px;font-size:15px;color:#b91c1c}.tm-pwa-panel p,.tm-pwa-panel details{font-size:13px;line-height:1.5;color:#555}.tm-pwa-panel button{display:block;width:100%;margin:10px 0;padding:12px;border:0;border-radius:10px;background:#b91c1c;color:#fff;font-weight:800}.tm-pwa-panel button[hidden],.tm-pwa-panel details[hidden]{display:none!important}.tm-pwa-panel summary{padding:7px 0;color:#222;font-weight:700}.tm-pwa-panel ol{padding-left:22px}';
  document.head.appendChild(style);

  const panel = document.createElement('section');
  panel.id = 'pwaInstallPanel';
  panel.className = 'tm-pwa-panel';
  panel.innerHTML = '<h2>TM DISTRIBUTOR Phone App</h2><p>Add this secure customer catalogue to your Home Screen. Your customer link and pricing remain protected.</p><button type="button" hidden>INSTALL TM DISTRIBUTOR</button><p class="tm-pwa-status" aria-live="polite"></p><details class="tm-pwa-ios" hidden><summary>Install on iPhone using Safari</summary><ol><li>Open this customer link in Safari.</li><li>Tap the Share button.</li><li>Choose Add to Home Screen.</li><li>Enable Open as Web App.</li><li>Tap Add.</li></ol></details><details class="tm-pwa-android" hidden><summary>Install on Android if the button is unavailable</summary><ol><li>Open this customer link in Chrome.</li><li>Open the browser menu.</li><li>Choose Install app or Add to Home Screen.</li><li>Confirm Add or Install.</li></ol></details><details><summary>Opened inside WhatsApp?</summary><p>Use the browser menu and choose Open in browser. If that option is unavailable, copy this customer link and open it in Chrome on Android or Safari on iPhone.</p></details>';
  const insertionPoint = document.querySelector('.catalogue-toolbar') || document.querySelector('main') || document.body.firstChild;
  insertionPoint.parentNode.insertBefore(panel, insertionPoint);

  const button = panel.querySelector('button');
  const status = panel.querySelector('.tm-pwa-status');
  const iosInstructions = panel.querySelector('.tm-pwa-ios');
  const androidInstructions = panel.querySelector('.tm-pwa-android');
  const standalone = () => (window.matchMedia && window.matchMedia('(display-mode: standalone)').matches) || window.navigator.standalone === true;
  const userAgent = navigator.userAgent || '';
  const isIos = /iPhone|iPad|iPod/i.test(userAgent) || (navigator.platform === 'MacIntel' && navigator.maxTouchPoints > 1);
  const isAndroid = /Android/i.test(userAgent);
  iosInstructions.hidden = !isIos || standalone();
  androidInstructions.hidden = !isAndroid || standalone();
  if (standalone()) status.textContent = 'TM DISTRIBUTOR is open in app mode.';

  if ('serviceWorker' in navigator) {
    navigator.serviceWorker.register(new URL(`${scopePath}service-worker.js`, window.location.origin), { scope: scopePath })
      .catch(() => { status.textContent = 'The catalogue is online and ready. App installation may be unavailable in this browser.'; });
  }

  let installPrompt = null;
  window.addEventListener('beforeinstallprompt', event => {
    event.preventDefault();
    installPrompt = event;
    if (!standalone()) button.hidden = false;
    status.textContent = 'Install TM DISTRIBUTOR on this phone for a Home Screen app icon.';
  });
  button.addEventListener('click', async () => {
    if (!installPrompt) return;
    const prompt = installPrompt;
    installPrompt = null;
    button.disabled = true;
    try {
      await prompt.prompt();
      const choice = await prompt.userChoice;
      button.hidden = true;
      status.textContent = choice && choice.outcome === 'accepted'
        ? 'Installation accepted. Finish the browser confirmation to add the app.'
        : 'Installation dismissed. You can install TM DISTRIBUTOR later from this page.';
    } catch (_error) {
      status.textContent = 'The installation prompt could not be opened. Use the browser menu to add this app.';
    } finally {
      button.disabled = false;
    }
  });
  window.addEventListener('appinstalled', () => {
    button.hidden = true;
    installPrompt = null;
    status.textContent = 'TM DISTRIBUTOR has been installed. Open it from your Home Screen.';
  });
  if (standalone()) button.hidden = true;
})();
