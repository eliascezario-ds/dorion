import { setResolveAlias } from "../../scripts/figma-variables/state.mjs";
import { renderCSS } from "../../scripts/figma-variables/render-css.mjs";
// Importa funções do sistema de navegação da UI
import { navigateTo, goBack, enableResize } from "../../scripts/features/navigation.mjs";

// Importa renderizações principais
import { renderTree, rebuildTree } from "../../scripts/figma-variables/render-tree.mjs";

// Importa utilitários de Figma Variables
import { buildHierarchy } from "../../scripts/figma-variables/build-hierarchy.mjs";
import { resolveValue } from "../../scripts/figma-variables/resolve-value.mjs";
import { buildCSSVariableName, normalize } from "../../scripts/figma-variables/utils.mjs";

// Importa presets
import {
    presetConfig,
    applyPresetByAttribute,
    applyPresetFromUI
} from "../../scripts/figma-variables/preset.mjs";

// Estilos
import "../features/style.css";


// Exemplo de envio de mensagem para Figma (remova ou adapte)
parent.postMessage({ pluginMessage: { type: "ready" } }, "*");

// Aqui você pode montar os listeners e chamadas como:
// document.getElementById("copyButton").addEventListener("click", () => renderCSS());

window.addEventListener('message', e => {
    const msg = e.data.pluginMessage;
    if (msg.type !== 'variables') return;
    currentData = msg.data;
    if (msg.filename) currentFilename = msg.filename;
    idMap.clear();
    currentData.forEach(c => c.variables.forEach(v => {
        v.collectionName = c.name;
        idMap.set(v.id, v);
    }));
    const names = currentData.map(c => c.name);
    let order = orderState.get('') || [];
    order = order.filter(name => names.includes(name));
    names.forEach(name => {
        if (!order.includes(name)) order.push(name);
    });
    if (order.length === 0 && names.length > 0) order = names.slice();
    orderState.set('', order);

    rebuildTree();
    renderCSS();
});


document.querySelector('.fr-canvas-footer #refresh').onclick = () =>
    window.parent.postMessage({ pluginMessage: { type: 'refresh' } }, '*');

document.querySelector('.fr-canvas-footer #export').onclick = () => {
    const blob = new Blob([lastCSSOutput], { type: 'text/css' });
    const a = document.createElement('a');
    a.href = URL.createObjectURL(blob);
    a.download = `${currentFilename}.css`;
    a.click();
};

document.querySelector('.fr-canvas-footer #copy').onclick = () => {
    function copyToClipboardFallback(text) {
        const textarea = document.createElement('textarea');
        textarea.value = text;
        textarea.style.position = 'fixed'; // Evita rolagem
        textarea.style.opacity = '0';
        document.body.appendChild(textarea);
        textarea.focus();
        textarea.select();

        try {
            const successful = document.execCommand('copy');
            window.parent.postMessage({
                pluginMessage: {
                    type: 'notify',
                    message: successful ? '⮻ Copiado!' : 'Falha ao copiar'
                }
            }, '*');
        } catch (err) {
            window.parent.postMessage({
                pluginMessage: {
                    type: 'notify',
                    message: 'Erro ao copiar'
                }
            }, '*');
        }

        document.body.removeChild(textarea);
    }

    document.querySelector('.fr-canvas-footer #copy').onclick = () => {
        if (navigator.clipboard && navigator.clipboard.writeText) {
            navigator.clipboard.writeText(lastCSSOutput)
                .then(() => window.parent.postMessage({
                    pluginMessage: { type: 'notify', message: '⮻ Copiado!' }
                }, '*'))
                .catch(() => copyToClipboardFallback(lastCSSOutput));
        } else {
            copyToClipboardFallback(lastCSSOutput);
        }
    };

};
window.addEventListener('DOMContentLoaded', () => {
    navigateTo('screen-index');
});

// Botões da tela inicial

document.querySelectorAll('.goToCss').forEach(btn => {
    btn.addEventListener('click', () => navigateTo('screen-css'));
});

document.querySelectorAll('.goToAbout').forEach(btn => {
    btn.addEventListener('click', () => navigateTo('screen-about'));
});

document.querySelectorAll('.goToBack').forEach(btn => {
    btn.addEventListener('click', () => goBack());
});

document.getElementById('btn-refColorDim')?.addEventListener('click', () => {
    applyDeclarativePreset('refColorDim');
});

export function applyTheme() {
    const isDark = window.matchMedia('(prefers-color-scheme: dark)').matches;
    document.body.classList.toggle('dark', isDark);
    document.body.classList.toggle('light', !isDark);
}
applyTheme();
window.matchMedia('(prefers-color-scheme: dark)').addEventListener('change', applyTheme);

const contextMenu = document.getElementById('context-menu-var-css');
const frtreeheader = document.querySelector('.fr-tree-header');

// Abrir menu com botão direito
frtreeheader?.addEventListener('contextmenu', e => {
    e.preventDefault();
    contextMenu.style.display = 'block';
    contextMenu.style.left = `${e.pageX}px`;
    contextMenu.style.top = `${e.pageY}px`;
});

// Ocultar menu ao clicar fora
document.addEventListener('click', () => {
    contextMenu.style.display = 'none';
});

// Tratar clique em item do menu
document.querySelectorAll('[data-preset]').forEach(el => {
    el.addEventListener('click', () => {
        const preset = el.getAttribute('data-preset');
        applyPresetFromUI(preset);
    });
});



const toggle = document.getElementById('toggle-alias');
if (toggle) {
  toggle.checked = true;
  toggle.addEventListener('change', e => {
    setResolveAlias(e.target.checked);
    renderCSS();
  });
}
