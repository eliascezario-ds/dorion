import { buildCSSVariableName, normalize } from "./utils.mjs";
import { resolveValue } from "./resolve-value.mjs";

export function renderCSS() {
  const now = new Date();
  const z = n => n.toString().padStart(2, '0');
  const date = `${now.getFullYear()}-${z(now.getMonth() + 1)}-${z(now.getDate())}`;
  const time = `${z(now.getHours())}:${z(now.getMinutes())}`;
  const out = [
    `/* Dorion Design Tokens (Beta) */`,
    `/* CSS - Figma: ${currentFilename} */`,
    `/* ${date} - ${time} */`,
    '',
  ];

  // Bloco root (se quiser variáveis globais)
  out.push(':root {');
  out.push('}');
  out.push('');

  // Para cada coleção (na ordem custom)
  orderState.get('').forEach(colName => {
    const col = currentData.find(c => c.name === colName);
    if (!col) return;
    if (selectionState.get(colName) === false) return;

    // **Loop pelos modos (light, dark, etc.)**
    col.modes.forEach(modeObj => {
      const modeKey = [col.name, modeObj.name].join(' / ');
      if (selectionState.get(modeKey) === false) return;

      const mode = modeObj.name;
      let hasVars = false;
      const groupMap = new Map();

      // Loop pelas variáveis da coleção
      col.variables.forEach(v => {
        idMap.set(v.id, v);

        const raw = v.values[modeObj.id];
        if (raw === undefined) return;

        // 1) Separe o nome do token do caminho
        const rawParts = v.name.split('/').map(s => s.trim());
        const tokenName = rawParts.pop();

        // 2) Monte o caminho completo para seleção e prefixos
        const pathParts = [mode, ...rawParts];
        const fullPathArray = [col.name, ...pathParts];

        // 3) Filtro de seleção (checkboxes)
        if (fullPathArray.some((_, i, arr) =>
          selectionState.get(arr.slice(0, i + 1).join(' / ')) === false
        )) return;

        // 4) Gera o nome da variável (respeita TODOS os prefixState)
        const varName = buildCSSVariableName(col.name, pathParts, tokenName);

        // 5) Resolve o valor (alias ON/OFF e cores em hex)
        const value = resolveValue(raw, modeObj.id);

        // 6) Agrupa por “.collection / mode / group”
        const groupKey = fullPathArray.join(' / ');
        if (!groupMap.has(groupKey)) groupMap.set(groupKey, []);
        groupMap.get(groupKey).push({ varName, value });

        hasVars = true;
      });

      // Se achou alguma variável, escreve o bloco .<mode>-mode { … }
      if (hasVars) {
        out.push(`.${mode} {`);
        for (const [grp, items] of groupMap) {
          out.push(`  /* ${grp} */`);
          items.forEach(({ varName, value }) => {
            out.push(`  ${varName}: ${value};`);
          });
          out.push('');
        }
        out.push('}');
      }
    });
  });

  // monta o CSS final e renderiza no <pre>
  lastCSSOutput = out.join('\n');
  const coderenderEl = document.getElementById('coderender');
  coderenderEl.innerHTML = '';
  const pre = document.createElement('pre');
  const code = document.createElement('code');
  code.id = 'css-preview';
  code.className = 'language-css';
  code.textContent = lastCSSOutput;
  pre.appendChild(code);
  coderenderEl.appendChild(pre);

  if (window.Prism) Prism.highlightElement(code);
}
export function startCss() {
      window.parent.postMessage(
        { pluginMessage: { type: 'select', lib: 'css' } },
        '*'
      );
    }
