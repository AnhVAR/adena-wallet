import mixins from '@styles/mixins';
import { FontsType, fonts } from '@styles/theme';
import styled, { FlattenSimpleInterpolation } from 'styled-components';

interface HighlightNumberWrapperProps {
  fontColor: string;
  fontStyleKey: FontsType;
  minimumFontSize: string;
}

export const HighlightNumberWrapper = styled.div<HighlightNumberWrapperProps>`
  ${mixins.flex({ direction: 'row', align: 'normal', justify: 'normal' })};
  width: fit-content;
  height: auto;
  vertical-align: top;

  .value {
    display: contents;
    ${({ fontStyleKey }): FlattenSimpleInterpolation => fonts[fontStyleKey]};
    color: ${({ fontColor }): string => fontColor};
    text-align: bottom;

    &.decimal {
      font-size: ${({ minimumFontSize }): string => minimumFontSize};
    }
  }
`;