import { buildHierarchy } from "./build-hierarchy.mjs";
import { resolveValue } from "./resolve-value.mjs";
import { presetConfig } from "./preset.mjs";

export function renderTree() {

  const frag = document.createDocumentFragment();

  let entries;
  if (path.length === 0 && orderState.get('')) {
    entries = orderState.get('')
      .map(name => [name, hier.get(name)])
      .filter(([name, val]) => val !== undefined);
  } else {
    entries = hier instanceof Map ? hier.entries() : Object.entries(hier);
  }

  for (const [key, subtree] of entries) {
    if (!key) continue;

    const cp = [...path, key].join(' / ');
    const depth = path.length;
    const hasChildren = (subtree instanceof Map ? subtree.size : Object.keys(subtree).length) > 0;

    const row = document.createElement('div');
    //row.className = 'list-tem';
    row.className = 'list-tem tree-node';
    row.setAttribute('data-path', cp);
    row.setAttribute('itmname', cp);
    row.setAttribute('currentpreset', 'none');


    // Expande/colapsa ao clicar (exceto checkbox/switch)
    row.addEventListener('click', function (e) {
      if (
        e.target.closest('.div-checkbox') ||
        e.target.closest('.fr-switch')
      ) return;
      if (hasChildren) {
        collapseState.set(cp, !collapseState.get(cp));
        rebuildTree();
      }
    });

    // Drag & drop nível 0
    if (depth === 0) {
      row.draggable = true;
      row.addEventListener('dragstart', (e) => {
        draggingKey = key;
        row.classList.add('dragging');
        e.dataTransfer.effectAllowed = 'move';
        const img = new Image();
        img.src = "data:image/svg+xml,%3Csvg%20width%3D'1'%20height%3D'1'%20xmlns%3D'http%3A//www.w3.org/2000/svg'%3E%3C/svg%3E";
        e.dataTransfer.setDragImage(img, 0, 0);
      });
      row.addEventListener('dragend', () => {
        draggingKey = null;
        dragOverKey = null;
        rebuildTree();
      });
      row.addEventListener('dragover', (e) => {
        e.preventDefault();
        dragOverKey = key;
      });
      row.addEventListener('dragleave', (e) => {
        dragOverKey = null;
      });
      row.addEventListener('drop', (e) => {
        e.preventDefault();
        if (draggingKey && draggingKey !== key) {
          const names = currentData.map(c => c.name);
          let oldOrder = orderState.get('') || [];
          oldOrder = oldOrder.filter(name => names.includes(name));
          if (oldOrder.length === 0) oldOrder = names.slice();
          const from = oldOrder.findIndex(n => normalize(n) === normalize(draggingKey));
          const to = oldOrder.findIndex(n => normalize(n) === normalize(key));
          if (from > -1 && to > -1) {
            const newOrder = oldOrder.slice();
            newOrder.splice(from, 1);
            newOrder.splice(to, 0, draggingKey);
            orderState.set('', newOrder);
          }
        }
        dragOverKey = null;
        draggingKey = null;
        rebuildTree();
        renderCSS();
      });

      if (draggingKey === key) {
        row.style.opacity = "0.3";
      }
      if (dragOverKey === key && draggingKey !== key) {
        row.style.boxShadow = "0 0 0 2px var(--figma-color-brand)";
      }
    }

    // Drag icon só no nível 0
    const dragDiv = document.createElement('div');
    dragDiv.className = 'div-icon-drag';
    if (depth === 0) {
      dragDiv.innerHTML = '⋮⋮';
      dragDiv.style.visibility = 'visible';
    } else {
      dragDiv.innerHTML = '';
      dragDiv.style.visibility = 'hidden';
    }
    row.appendChild(dragDiv);

    // Checkbox
    const checkDiv = document.createElement('div');
    checkDiv.className = 'div-checkbox';
    const cb = document.createElement('input');
    cb.type = 'checkbox';
    cb.checked = selectionState.get(cp) !== false;
    cb.onchange = () => {
      selectionState.set(cp, cb.checked);
      rebuildTree();
      renderCSS();
    };
    checkDiv.appendChild(cb);
    row.appendChild(checkDiv);

    // Caminho: label principal e sublevel
    const pathsDiv = document.createElement('div');
    pathsDiv.className = 'div-paths';

    if (path.length > 0) {
      const sublevelDiv = document.createElement('div');
      sublevelDiv.className = 'div-sublevel';
      sublevelDiv.textContent = '../'.repeat(path.length); //.slice(0, -1) remove o último /
      pathsDiv.appendChild(sublevelDiv);
    }

    const labelDiv = document.createElement('div');
    labelDiv.className = 'div-label';
    labelDiv.textContent = key;
    const badge = document.createElement('span');
    badge.className = 'badge';
    badge.textContent =
      depth === 0 ? 'Collection'
        : depth === 1 ? 'Mode'
          : 'Group';
    labelDiv.appendChild(badge);
    pathsDiv.appendChild(labelDiv);

    row.appendChild(pathsDiv);

    // Switch customizado
    const switchDiv = document.createElement('div');
    switchDiv.className = 'fr-switch';
    switchDiv.style.position = 'relative';

    const sw = document.createElement('input');
    sw.type = 'checkbox';
    sw.checked = prefixState.get(cp) !== false;
    sw.id = 'sw-' + Math.random().toString(36).substr(2, 8);

    sw.style.opacity = '0';
    sw.style.width = '40px';
    sw.style.height = '20px';
    sw.style.margin = '0';
    sw.style.position = 'absolute';
    sw.style.left = '0';
    sw.style.top = '50%';
    sw.style.transform = 'translateY(-50%)';
    sw.style.zIndex = '2';
    sw.style.cursor = 'pointer';

    sw.onchange = () => {
      prefixState.set(cp, sw.checked);
      renderCSS();
    };

    const swVisual = document.createElement('span');
    swVisual.className = 'switch';

    switchDiv.appendChild(sw);
    switchDiv.appendChild(swVisual);
    row.appendChild(switchDiv);

    // Chevron (SVG) sempre no final
    const chevronDiv = document.createElement('div');
    chevronDiv.className = 'div-chevron';
    if (hasChildren) {
      const svg = document.createElementNS("http://www.w3.org/2000/svg", "svg");
      svg.setAttribute("width", "16");
      svg.setAttribute("height", "17");
      svg.setAttribute("viewBox", "0 0 16 17");
      svg.setAttribute("fill", "none");
      svg.style.display = "inline-block";
      svg.style.verticalAlign = "middle";
      svg.style.transition = "transform 0.15s";
      if (!collapseState.get(cp)) svg.style.transform = "rotate(180deg)";
      const pathEl = document.createElementNS("http://www.w3.org/2000/svg", "path");
      pathEl.setAttribute("fill-rule", "evenodd");
      pathEl.setAttribute("clip-rule", "evenodd");
      pathEl.setAttribute("d", "M3.76462 6.26462C3.8948 6.13445 4.10585 6.13445 4.23603 6.26462L8.00033 10.0289L11.7646 6.26462C11.8948 6.13445 12.1059 6.13445 12.236 6.26462C12.3662 6.3948 12.3662 6.60585 12.236 6.73603L8.23603 10.736C8.10585 10.8662 7.8948 10.8662 7.76462 10.736L3.76462 6.73603C3.63445 6.60585 3.63445 6.3948 3.76462 6.26462Z");
      pathEl.setAttribute("fill", "currentColor");
      svg.appendChild(pathEl);
      chevronDiv.appendChild(svg);
    } else {
      chevronDiv.style.width = '16px';
    }
    row.appendChild(chevronDiv);

    frag.appendChild(row);

    if (hasChildren && !collapseState.get(cp)) {
      frag.appendChild(renderTree(subtree, [...path, key]));
    }
  }
  return frag;
}

export function rebuildTree() {
  const container = document.getElementById('fr-tree-render');
  container.innerHTML = '';
  const hierarchy = buildHierarchy(currentData);
  container.appendChild(renderTree(hierarchy));
}

let draggingKey = null;
let dragOverKey = null;

export function getAllTreePaths() {
  const paths = [];

  document.querySelectorAll('.tree-node').forEach(node => {
    const path = node.getAttribute('data-path');
    if (path) paths.push(path);
  });

  return paths;
}