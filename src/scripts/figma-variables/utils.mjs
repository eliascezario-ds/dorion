export function buildCSSVariableName(pathArray) {
  const fullParts = [collectionName, ...pathParts, tokenName];
  const segs = fullParts
    .map((seg, i) => {
      // Monta o caminho acumulado até esse ponto (ex: "Colors / Light / Primary")
      const cp = fullParts.slice(0, i + 1).join(' / ');
      // Se o switch desse nível está ativado (ou não existe), inclui o segmento
      return prefixState.get(cp) !== false ? seg : null;
    })
    .filter(Boolean); // Remove os nulls
  return `--${segs.join('-').toLowerCase().replace(/[,\.]/g, '-')}`;
}

export function normalize(value) {
  return (str || '').trim().toLowerCase();
}
export function rgbToHex(v) {
  return Math.round(v * 255).toString(16).padStart(2, '0');
}
