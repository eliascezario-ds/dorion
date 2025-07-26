export function resolveValue(value, modeId, override) {
  if (!val) return val;

  // === CASO 1: Alias para outra variável ===
  if (val.type === 'VARIABLE_ALIAS') {
    const aliasVar = idMap.get(val.id);
    if (!aliasVar) return '/* alias not found */';

    const aliasCollection = currentData.find(c =>
      c.variables.some(v => v.id === aliasVar.id)
    );

    const aliasModeId = aliasCollection?.modes.find(m => m.id === modeId)
      ? modeId
      : aliasCollection?.modes[0]?.id;

    const aliasModeName = aliasCollection?.modes.find(m => m.id === aliasModeId)?.name || aliasModeId;

    const target = aliasVar.values[aliasModeId];

    // Resolve recursivamente com o nome correto do modo
    if (resolveAliasEnabled) {
      return resolveValue(target, aliasModeId, aliasModeName);
    }

    const parts = aliasVar.name.split('/').map(s => s.trim());
    const tokenName = parts.pop();

    const collectionName = aliasVar.collectionName;
    const colCorrect = currentData.find(c => c.name === collectionName);

    let modeName = modeNameOverride;
    if (!modeName) {
      if (colCorrect) {
        const modeObj = colCorrect.modes.find(m => m.id === modeId);
        if (modeObj) {
          modeName = modeObj.name;
        } else if (colCorrect.modes.length > 0) {
          modeName = colCorrect.modes[0].name;
        } else {
          modeName = 'default';
        }
      } else {
        modeName = 'default';
      }
    }

    const prefixGroupParts = parts.filter((seg, i) => {
      const cp = [collectionName, modeName, ...parts.slice(0, i + 1)].join(' / ');
      return prefixState.get(cp) !== false;
    });

    const includeCollection = prefixState.get(collectionName) !== false;
    const includeMode = prefixState.get(`${collectionName} / ${modeName}`) !== false;

    const pathParts = [
      ...(includeMode ? [modeName] : []),
      ...prefixGroupParts
    ];

    return `var(${buildCSSVariableName(
      includeCollection ? collectionName : '',
      pathParts,
      tokenName
    )})`;
  }

  // === CASO 2: Cor RGB => HEX ===
  // === CASO 2: Cor RGB ou RGBA ===
  if (typeof val === 'object' && 'r' in val) {
    const r = Math.round(val.r * 255);
    const g = Math.round(val.g * 255);
    const b = Math.round(val.b * 255);
    const a = typeof val.a === 'number' ? val.a : 1;

    // Se opacidade (alpha) for menor que 1, usa rgba, senão usa hex
    if (a < 1) {
      return `rgba(${r}, ${g}, ${b}, ${+a.toFixed(3)})`;
    } else {
      const toHex = v => v.toString(16).padStart(2, '0');
      return `#${toHex(r)}${toHex(g)}${toHex(b)}`.toUpperCase();
    }
  }


  // === CASO 3: Valor direto ===
  if (typeof val === 'number') {
    return `${(val / 16).toFixed(4).replace(/\.?0+$/, '')}rem`;
  }

  return val;
}
