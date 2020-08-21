import { MarginType, PadType } from 'grommet/utils';

export type TSpacingType = 'margin' | 'padding';
export type TEdgeSize = MarginType | PadType;

const getEdgeSizeCSS = (spaceType: TSpacingType) => (edge: TEdgeSize, theme: any) => {
  const getSizeCSS = (size: string) => theme.global.edgeSize[size] || size;

  if (typeof edge === 'string') {
    return `${spaceType}: ${getSizeCSS(edge)};`;
  }

  const sizeProps = {};

  if (edge.vertical) {
    sizeProps[`${spaceType}-top`] = getSizeCSS(edge.vertical);
    sizeProps[`${spaceType}-bottom`] = getSizeCSS(edge.vertical);
  }

  if (edge.top) {
    sizeProps[`${spaceType}-top`] = getSizeCSS(edge.top);
  }

  if (edge.bottom) {
    sizeProps[`${spaceType}-bottom`] = getSizeCSS(edge.bottom);
  }

  if (edge.horizontal) {
    sizeProps[`${spaceType}-left`] = getSizeCSS(edge.horizontal);
    sizeProps[`${spaceType}-right`] = getSizeCSS(edge.horizontal);
  }

  if (edge.right) {
    sizeProps[`${spaceType}-right`] = getSizeCSS(edge.right);
  }

  if (edge.left) {
    sizeProps[`${spaceType}-left`] = getSizeCSS(edge.left);
  }

  return toCssString(sizeProps);
};

const toCssString = (obj: Record<string, string>) =>
  Object.keys(obj).reduce((result, key) => `${result}${key}:${obj[key]};`, '');

export const getMarginCSS = getEdgeSizeCSS('margin');
export const getPaddingCSS = getEdgeSizeCSS('padding');
