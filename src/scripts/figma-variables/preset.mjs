export const presetConfig = {
  refColorDim: {
    // reference
    'reference': { include: true, declare: false },
    'reference/value': { include: true, declare: false },
    'reference/value/ref': { include: true, declare: false },
    'reference/value/ref/font/family': { include: true, declare: false },
    // color
    'color': { include: true, declare: false },
    'color/light': { include: true, declare: false },
    'color/light/color/state': { include: true, declare: false },
    'color/dark': { include: true, declare: false },
    'color/dark/color/state': { include: true, declare: false },
    // dimension
    'dimension': { include: true, declare: false },
    'dimension/full': { include: true, declare: false },
    'dimension/full/letterSpacing': { include: false, declare: false },
    'dimension/full/fontSize': { include: false, declare: false },
    'dimension/full/grid': { include: false, declare: false },
    'dimension/full/radius/tailwind': { include: false, declare: false },
    'dimension/full/size/tailwind': { include: false, declare: false },
    'dimension/full/size/shape': { include: true, declare: false },
    'dimension/full/spacing/tailwind': { include: false, declare: false },
    'dimension/full/border': { include: false, declare: false },
    'dimension/full/opacity': { include: false, declare: false },
    'dimension/full/lineHeight': { include: false, declare: false },

    'dimension/large': { include: true, declare: false },
    'dimension/large/letterSpacing': { include: false, declare: false },
    'dimension/large/fontSize': { include: false, declare: false },
    'dimension/large/grid': { include: false, declare: false },
    'dimension/large/radius/tailwind': { include: false, declare: false },
    'dimension/large/size/tailwind': { include: false, declare: false },
    'dimension/large/size/shape': { include: true, declare: false },
    'dimension/large/spacing/tailwind': { include: false, declare: false },
    'dimension/large/border': { include: false, declare: false },
    'dimension/large/opacity': { include: false, declare: false },
    'dimension/large/lineHeight': { include: false, declare: false },

    'dimension/medium': { include: true, declare: false },
    'dimension/medium/letterSpacing': { include: false, declare: false },
    'dimension/medium/fontSize': { include: false, declare: false },
    'dimension/medium/grid': { include: false, declare: false },
    'dimension/medium/radius/tailwind': { include: false, declare: false },
    'dimension/medium/size/tailwind': { include: false, declare: false },
    'dimension/medium/size/shape': { include: true, declare: false },
    'dimension/medium/spacing/tailwind': { include: false, declare: false },
    'dimension/medium/border': { include: false, declare: false },
    'dimension/medium/opacity': { include: false, declare: false },
    'dimension/medium/lineHeight': { include: false, declare: false },

    'dimension/small': { include: true, declare: false },
    'dimension/small/letterSpacing': { include: false, declare: false },
    'dimension/small/fontSize': { include: false, declare: false },
    'dimension/small/grid': { include: false, declare: false },
    'dimension/small/radius/tailwind': { include: false, declare: false },
    'dimension/small/size/tailwind': { include: false, declare: false },
    'dimension/small/size/shape': { include: true, declare: false },
    'dimension/small/spacing/tailwind': { include: false, declare: false },
    'dimension/small/border': { include: false, declare: false },
    'dimension/small/opacity': { include: false, declare: false },
    'dimension/small/lineHeight': { include: false, declare: false },
    // outros
    others: { include: true, declare: true }
  }
};

export function applyPresetByAttribute(node, preset) {
  const config = presetConfig[presetName];
  if (!config) {
    console.warn(`[preset] Não encontrado: ${presetName}`);
    return;
  }

  document.querySelectorAll('.tree-node').forEach(node => {
    const itmName = node.getAttribute('itmName');
    const conf = config[itmName] ?? config.others ?? { include: true, declare: true };
    node.setAttribute('currentPreset', presetName);

    const checkbox = node.querySelector('.div-checkbox input[type="checkbox"]');
    const sw = node.querySelector('.fr-switch input[type="checkbox"]');

    if (checkbox) checkbox.checked = conf.include;
    if (sw) sw.checked = conf.declare;

    // Atualiza estado interno também, se necessário
    const pathKey = node.getAttribute('data-path');
    if (pathKey) {
      selectionState.set(pathKey, conf.include);
      prefixState.set(pathKey, conf.declare);
    }

    console.log(`[preset attr] ${itmName} → include: ${conf.include}, declare: ${conf.declare}`);
  });

  renderCSS();
}

export function applyPresetFromUI(data) {
  const loader = document.getElementById('preset-loader');

  // Passo 1: Exibe o loader imediatamente
  if (loader) loader.style.display = 'flex';

  // Passo 2: Deixa o navegador renderizar o loader ANTES de aplicar o preset
  setTimeout(() => {
    const rawConfig = presetConfig[presetName];
    if (!rawConfig) {
      console.warn(`[preset] Não encontrado: ${presetName}`);
      if (loader) loader.style.display = 'none';
      return;
    }

    const normalizePath = str => str.replace(/\s/g, '').toLowerCase();

    // Cria um novo objeto com as chaves do preset normalizadas
    const config = {};
    for (const key in rawConfig) {
      config[normalizePath(key)] = rawConfig[key];
    }

    // Expande todos os nós
    document.querySelectorAll('.tree-node').forEach(node => {
      const path = node.getAttribute('data-path');
      collapseState.set(path, false);
    });

    rebuildTree();

    requestAnimationFrame(() => {
      // Agora a árvore está expandida e podemos aplicar o preset
      document.querySelectorAll('.tree-node').forEach(row => {
        const itm = row.getAttribute('itmname');
        if (!itm) return;

        const normalizedItm = normalizePath(itm);
        const rule = config[normalizedItm] || config['others'];
        if (!rule) return;

        const cb = row.querySelector('.div-checkbox input[type="checkbox"]');
        if (cb) {
          cb.checked = rule.include;
          cb.dispatchEvent(new Event('change'));
        }

        const sw = row.querySelector('.fr-switch input[type="checkbox"]');
        if (sw) {
          sw.checked = rule.declare;
          sw.dispatchEvent(new Event('change'));
        }

        console.log(`[preset applied] ${itm} → include: ${rule.include}, declare: ${rule.declare}`);
      });

      renderCSS();

      // Passo 3: Esconde o loader com leve atraso para suavizar
      setTimeout(() => {
        if (loader) loader.style.display = 'none';

        // ✅ Aciona o toggle-alias ao final
        const toggle = document.getElementById('toggle-alias');
        if (toggle) {
          toggle.checked = false;
          toggle.dispatchEvent(new Event('change'));
          console.log('[preset] toggle-alias ativado');
        }

      }, 300);

    });
  }, 50); // Pequeno atraso para o loader renderizar
}
