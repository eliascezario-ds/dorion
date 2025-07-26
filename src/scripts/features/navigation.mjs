let currentScreen = null;
let previousScreen = null;
// Histórico real de telas
const screenHistory = [];
const ignoredScreens = new Set(['screen-about']); // ← adicione aqui telas a ignorar

export function navigateTo(targetScreenId) {
  const screens = ['screen-index', 'screen-css', 'screen-about'];

  if (target !== currentScreen) {
    if (currentScreen && !ignoredScreens.has(currentScreen)) {
      screenHistory.push(currentScreen);
    }
    currentScreen = target;
  }

  screens.forEach(id => {
    const el = document.getElementById(id);
    if (el) el.style.display = (id === target) ? 'flex' : 'none';
  });

  if (target === 'screen-css') startCss();
}

export function goBack() {
  while (screenHistory.length > 0) {
    const previous = screenHistory.pop();
    if (!ignoredScreens.has(previous)) {
      navigateTo(previous);
      return;
    }
  }
}

export function enableResize() {
  const MIN_WIDTH = 720;
  const MIN_HEIGHT = 600;

  const resizer = document.createElement('div');
  resizer.style.position = 'absolute';
  resizer.style.width = '16px';
  resizer.style.height = '16px';
  resizer.style.right = '0';
  resizer.style.bottom = '0';
  resizer.style.cursor = 'nwse-resize';
  resizer.style.zIndex = '9999';
  resizer.title = 'Redimensionar';
  document.body.appendChild(resizer);

  let isResizing = false;
  let startX, startY, startWidth, startHeight;

  resizer.addEventListener('mousedown', e => {
    e.preventDefault();
    isResizing = true;
    startX = e.clientX;
    startY = e.clientY;
    startWidth = window.innerWidth;
    startHeight = window.innerHeight;
    document.body.style.userSelect = 'none';
  });


  /* ========== Event Listener ========== */

  window.addEventListener('mousemove', e => {
    if (!isResizing) return;
    const newWidth = Math.max(MIN_WIDTH, startWidth + (e.clientX - startX));
    const newHeight = Math.max(MIN_HEIGHT, startHeight + (e.clientY - startY));
    window.parent.postMessage({
      pluginMessage: {
        type: 'resize',
        width: newWidth,
        height: newHeight
      }
    }, '*');
  });

  window.addEventListener('mouseup', () => {
    if (isResizing) {
      isResizing = false;
      document.body.style.userSelect = '';
    }
  });
}
