export function buildHierarchy(data) {
  const acc = new Map();
  data.forEach(col => {
    const modesMap = new Map();
    col.modes.forEach(m => modesMap.set(m.name, new Map()));
    col.variables.forEach(v => {
      Object.keys(v.values).forEach(modeId => {
        const modeName = col.modes.find(x => x.id === modeId)?.name || modeId;
        let node = modesMap.get(modeName);
        v.name.split('/').slice(0, -1).forEach(g => {
          if (!node.has(g)) node.set(g, new Map());
          node = node.get(g);
        });
      });
    });
    acc.set(col.name, modesMap);
  });
  return acc;
}
