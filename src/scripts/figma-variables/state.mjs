export let currentData = [];
export let currentFilename = 'tokens';
export let lastCSSOutput = '';

export const selectionState = new Map();
export const prefixState = new Map();
export const collapseState = new Map();
export const idMap = new Map();
export const renderNameOverrides = new Map();
export const tokenNameSuffix = new Map();
export const orderState = new Map([['', []]]);
export let resolveAliasEnabled = true;

export function setResolveAlias(value) {
  resolveAliasEnabled = value;
}